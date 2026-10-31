import type { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../shared/events';
import { QueueJoinPayloadSchema, RoomJoinPayloadSchema, DuelAnswerPayloadSchema, DuelRejoinPayloadSchema } from '../shared/events';
import { DUEL_CONFIG } from '../shared/config';
import type { MatchStore, ActiveDuel } from './store/MatchStore';
import { db } from './db';
import { pickQuestions, getDifficultyBand, sendQuestion, recordAnswer } from './duelEngine';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function registerSocketHandlers(io: TypedServer, socket: TypedSocket, matchStore: MatchStore) {
  const { userId, nickname, rating, jenjang } = socket.data;
  matchStore.setUserSocket(userId, socket.id);

  socket.on('queue:join', async (raw) => {
    const parsed = QueueJoinPayloadSchema.safeParse(raw || {});
    const subject = parsed.success ? parsed.data.subject : 'math';
    const isBot = parsed.success ? Boolean(parsed.data.isBot) : false;
    const payloadJenjang = parsed.success ? parsed.data.jenjang : undefined;
    const effectiveJenjang = payloadJenjang ?? jenjang ?? undefined;

    // Bersihkan entri lama jika pemain sudah pernah ada di antrean
    if (matchStore.isInQueue(userId)) {
      matchStore.dequeue(userId);
    }

    const existingDuel = matchStore.getActiveDuelByUser(userId);
    if (existingDuel) {
      if (existingDuel.status === 'finished') {
        matchStore.deleteDuel(existingDuel.duelId);
      } else {
        socket.emit('error', { code: 'ALREADY_IN_DUEL', message: 'You already have an active duel.' });
        return;
      }
    }

    if (isBot) {
      await startBotDuel(io, matchStore, { userId, nickname, rating, socketId: socket.id, jenjang: effectiveJenjang });
      return;
    }

    matchStore.enqueue({ userId, nickname, rating, socketId: socket.id, joinedAt: new Date(), subject, jenjang: effectiveJenjang });
    socket.emit('queue:waiting');
    console.log(`[Queue] ${nickname} (${userId}) joined queue for subject: ${subject}, jenjang: ${effectiveJenjang ?? 'all'}, rating: ${rating}`);
    startMatchmaking(io, socket, matchStore, subject, effectiveJenjang);
  });

  socket.on('queue:leave', () => { matchStore.dequeue(userId); });

  socket.on('room:create', () => {
    if (matchStore.getActiveDuelByUser(userId)) {
      socket.emit('error', { code: 'ALREADY_IN_DUEL', message: 'You already have an active duel.' });
      return;
    }
    matchStore.dequeue(userId);
    const code = generateRoomCode();
    matchStore.enqueue({ userId, nickname, rating, socketId: socket.id, joinedAt: new Date(), subject: `room:${code}`, jenjang: jenjang ?? undefined });
    socket.emit('room:created', { code });
    socket.emit('queue:waiting');
  });

  socket.on('room:join', async (raw) => {
    const parsed = RoomJoinPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Room code must be exactly 4 characters.' });
      return;
    }
    const code = parsed.data.code.toUpperCase();
    const queueEntries = matchStore.getQueue(`room:${code}`);
    if (queueEntries.length === 0) {
      socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found or match has already started.' });
      return;
    }
    const host = queueEntries[0];
    if (host.userId === userId) {
      socket.emit('error', { code: 'CANNOT_JOIN_OWN_ROOM', message: 'You cannot join your own room.' });
      return;
    }
    matchStore.dequeue(host.userId);
    matchStore.dequeue(userId);

    const hostSocketId = matchStore.getUserSocket(host.userId) || host.socketId;
    host.socketId = hostSocketId;
    const myLatestSocketId = matchStore.getUserSocket(userId) || socket.id;

    await startDuel(io, matchStore, host, { userId, nickname, rating, socketId: myLatestSocketId }, 'room');
  });

  socket.on('duel:answer', async (raw) => {
    const parsed = DuelAnswerPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      socket.emit('error', { code: 'INVALID_PAYLOAD', message: 'Invalid answer payload submitted.' });
      return;
    }
    const { duelId, position, answer } = parsed.data;
    const duel = matchStore.getDuel(duelId);
    if (!duel) { socket.emit('error', { code: 'DUEL_NOT_FOUND', message: 'Duel not found.' }); return; }
    if (duel.status !== 'running') return;
    if (duel.currentPosition !== position) return;
    const isP1 = duel.player1.userId === userId;
    const isP2 = duel.player2?.userId === userId;
    if (!isP1 && !isP2) { socket.emit('error', { code: 'NOT_IN_DUEL', message: 'You are not a participant in this duel.' }); return; }
    await recordAnswer(io, duel, matchStore, userId, socket.id, answer, false);
  });

  socket.on('duel:rejoin', (raw) => {
    const parsed = DuelRejoinPayloadSchema.safeParse(raw);
    if (!parsed.success) return;
    const duel = matchStore.getDuel(parsed.data.duelId);
    if (!duel) return;
    const isP1 = duel.player1.userId === userId;
    const isP2 = duel.player2?.userId === userId;
    if (!isP1 && !isP2) return;

    matchStore.setUserSocket(userId, socket.id);
    duel.disconnectedAt.delete(userId);
    if (isP1) duel.player1.socketId = socket.id;
    else if (duel.player2) duel.player2.socketId = socket.id;

    if (duel.status === 'countdown') {
      const opp = isP1 ? duel.player2 : duel.player1;
      socket.emit('match:found', {
        duelId: duel.duelId,
        opponent: { nickname: opp?.nickname ?? 'Player', rating: opp?.rating ?? 1000 },
        isBot: opp?.isBot ?? false,
      });
      const startsAt = new Date(Date.now() + 1500).toISOString();
      socket.emit('duel:start', { startsAt });
    } else if (duel.status === 'running' && duel.currentDeadlineAt) {
      const q = duel.questions[duel.currentPosition];
      if (q) {
        socket.emit('duel:question', {
          position: duel.currentPosition, body: q.body, options: q.options ?? undefined, type: q.type,
          deadlineAt: duel.currentDeadlineAt.toISOString(), timeLimitSec: q.time_limit_sec, totalQuestions: duel.questions.length,
        });
      }
    }
  });

  socket.on('disconnect', () => {
    const duel = matchStore.getActiveDuelByUser(userId);
    if (!duel || duel.status !== 'running') return;
    duel.disconnectedAt.set(userId, new Date());
    setTimeout(async () => {
      const freshDuel = matchStore.getDuel(duel.duelId);
      if (!freshDuel || !freshDuel.disconnectedAt.has(userId)) return;
      try {
        await db.from('duels').update({ status: 'abandoned', ended_at: new Date().toISOString() }).eq('id', duel.duelId);
      } catch (err) { console.warn('[SocketHandlers] Warning marking forfeit:', err); }
      matchStore.deleteDuel(duel.duelId);
    }, DUEL_CONFIG.disconnectGraceMs);
  });
}

function startMatchmaking(
  io: TypedServer, socket: TypedSocket, matchStore: MatchStore, subject: string, jenjang?: string
) {
  const { userId, nickname, rating } = socket.data;
  const startedAt = Date.now();
  let expansions = 0;

  const attemptMatch = async () => {
    if (!matchStore.isInQueue(userId)) return;
    const elapsed = Date.now() - startedAt;

    if (elapsed >= DUEL_CONFIG.matchmakingTimeoutMs) {
      matchStore.dequeue(userId);
      console.log(`[Matchmaking] Timeout reached for ${nickname}. Starting bot duel...`);
      await startBotDuel(io, matchStore, { userId, nickname, rating, socketId: socket.id, jenjang });
      return;
    }

    const currentExpansions = Math.floor(elapsed / DUEL_CONFIG.ratingWindowExpansionIntervalMs);
    if (currentExpansions > expansions) expansions = currentExpansions;
    const window = DUEL_CONFIG.initialRatingWindow + expansions * DUEL_CONFIG.ratingWindowExpansionStep;

    const allCandidates = matchStore.getQueue(subject).filter(e => e.userId !== userId);

    // Tahap 1: Cari lawan dengan jenjang yang sama dalam rating window
    let opponent = allCandidates.find(
      e => (jenjang == null || e.jenjang == null || e.jenjang === jenjang) &&
           Math.abs(e.rating - rating) <= window
    );

    // Tahap 2: Jika sudah menunggu >= 1.5 detik dan belum dapat lawan sejenjang,
    // pertemukan dengan pemain manusia lain di antrean daripada melawan bot!
    if (!opponent && elapsed >= 1500) {
      opponent = allCandidates.find(e => Math.abs(e.rating - rating) <= window * 2);
    }

    if (opponent) {
      console.log(`[Matchmaking] Match found: ${nickname} (${rating}, ${jenjang ?? 'any'}) vs ${opponent.nickname} (${opponent.rating}, ${opponent.jenjang ?? 'any'})`);
      matchStore.dequeue(userId);
      matchStore.dequeue(opponent.userId);
      const myLiveSocketId = matchStore.getUserSocket(userId) || socket.id;
      const oppLiveSocketId = matchStore.getUserSocket(opponent.userId) || opponent.socketId;
      await startDuel(
        io,
        matchStore,
        { userId, nickname, rating, socketId: myLiveSocketId },
        { ...opponent, socketId: oppLiveSocketId },
        'ranked'
      );
    } else {
      setTimeout(attemptMatch, 500);
    }
  };

  setTimeout(attemptMatch, 500);
}

async function startBotDuel(
  io: TypedServer, matchStore: MatchStore,
  player: { userId: string; nickname: string; rating: number; socketId: string; jenjang?: string }
) {
  const liveSocketId = matchStore.getUserSocket(player.userId) || player.socketId;
  player.socketId = liveSocketId;

  const botRating = player.rating + Math.floor((Math.random() - 0.5) * 80);
  const duelId = randomUUID();
  const difficultyBand = getDifficultyBand(player.rating);
  const questions = await pickQuestions('math', difficultyBand, DUEL_CONFIG.questionsPerDuel, player.jenjang);

  try {
    await db.from('duels').insert({
      id: duelId, mode: 'bot', status: 'running',
      player1_id: player.userId, player2_id: null,
      bot_level: botRating, p1_rating_before: player.rating,
      started_at: new Date().toISOString(),
    });
    await db.from('duel_questions').insert(questions.map((q, i) => ({ duel_id: duelId, position: i, question_id: q.id })));
  } catch (err) { console.warn('[SocketHandlers] Warning inserting bot duel:', err); }

  const duel: ActiveDuel = {
    duelId, mode: 'bot', subject: 'math',
    player1: { userId: player.userId, nickname: player.nickname, rating: player.rating, socketId: player.socketId, isBot: false },
    player2: { userId: 'bot', nickname: 'Bot', rating: botRating, socketId: null, isBot: true },
    botLevel: botRating, questions, currentPosition: 0, status: 'countdown',
    p1Score: 0, p2Score: 0, currentDeadlineAt: null,
    questionTimers: new Map(), answeredThisRound: new Set(), answerLog: [], disconnectedAt: new Map(),
    p1RatingBefore: player.rating, p2RatingBefore: botRating,
  };

  matchStore.createDuel(duel);
  matchStore.setUserSocket(player.userId, player.socketId);

  io.to(player.socketId).emit('match:found', { duelId, opponent: { nickname: 'Bot', rating: botRating }, isBot: true });

  const startsAt = new Date(Date.now() + 3000).toISOString();
  io.to(player.socketId).emit('duel:start', { startsAt });

  setTimeout(async () => {
    matchStore.updateDuel(duelId, { status: 'running' });
    const freshDuel = matchStore.getDuel(duelId);
    if (freshDuel) await sendQuestion(io, freshDuel, matchStore);
  }, 3000);
}

async function startDuel(
  io: TypedServer, matchStore: MatchStore,
  p1: { userId: string; nickname: string; rating: number; socketId: string },
  p2: { userId: string; nickname: string; rating: number; socketId: string; jenjang?: string },
  mode: 'ranked' | 'room'
) {
  const p1SocketId = matchStore.getUserSocket(p1.userId) || p1.socketId;
  const p2SocketId = matchStore.getUserSocket(p2.userId) || p2.socketId;
  p1.socketId = p1SocketId;
  p2.socketId = p2SocketId;

  const avgRating = Math.round((p1.rating + p2.rating) / 2);
  const difficultyBand = getDifficultyBand(avgRating);
  const questions = await pickQuestions('math', difficultyBand, DUEL_CONFIG.questionsPerDuel, p2.jenjang);
  const duelId = randomUUID();

  try {
    await db.from('duels').insert({
      id: duelId, mode, status: 'running',
      player1_id: p1.userId, player2_id: p2.userId,
      p1_rating_before: p1.rating, p2_rating_before: p2.rating,
      started_at: new Date().toISOString(),
    });
    await db.from('duel_questions').insert(questions.map((q, i) => ({ duel_id: duelId, position: i, question_id: q.id })));
  } catch (err) { console.warn('[SocketHandlers] Warning inserting duel:', err); }

  const duel: ActiveDuel = {
    duelId, mode, subject: 'math',
    player1: { userId: p1.userId, nickname: p1.nickname, rating: p1.rating, socketId: p1.socketId, isBot: false },
    player2: { userId: p2.userId, nickname: p2.nickname, rating: p2.rating, socketId: p2.socketId, isBot: false },
    botLevel: null, questions, currentPosition: 0, status: 'countdown',
    p1Score: 0, p2Score: 0, currentDeadlineAt: null,
    questionTimers: new Map(), answeredThisRound: new Set(), answerLog: [], disconnectedAt: new Map(),
    p1RatingBefore: p1.rating, p2RatingBefore: p2.rating,
  };

  matchStore.createDuel(duel);
  matchStore.setUserSocket(p1.userId, p1.socketId);
  matchStore.setUserSocket(p2.userId, p2.socketId);

  io.to(p1.socketId).emit('match:found', { duelId, opponent: { nickname: p2.nickname, rating: p2.rating }, isBot: false });
  io.to(p2.socketId).emit('match:found', { duelId, opponent: { nickname: p1.nickname, rating: p1.rating }, isBot: false });

  const startsAt = new Date(Date.now() + 3000).toISOString();
  io.to(p1.socketId).emit('duel:start', { startsAt });
  io.to(p2.socketId).emit('duel:start', { startsAt });

  setTimeout(async () => {
    matchStore.updateDuel(duelId, { status: 'running' });
    const freshDuel = matchStore.getDuel(duelId);
    if (freshDuel) await sendQuestion(io, freshDuel, matchStore);
  }, 3000);
}
