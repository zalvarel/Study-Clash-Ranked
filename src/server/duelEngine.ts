import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../shared/events';
import { DUEL_CONFIG } from '../shared/config';
import type { ActiveDuel, MatchStore, QuestionRow } from './store/MatchStore';
import { db } from './db';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function normalizeAnswer(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDifficultyBand(rating: number): number[] {
  if (rating < 1050) return [1, 2];
  if (rating < 1150) return [1, 2, 3];
  if (rating < 1300) return [2, 3, 4];
  if (rating < 1500) return [3, 4, 5];
  return [4, 5];
}

/**
 * Fetch questions from Supabase matching subject and difficulty band.
 * If offline or empty, gracefully provides fallback questions.
 */
export async function pickQuestions(
  subject: string,
  difficultyBand: number[],
  count: number
): Promise<QuestionRow[]> {
  try {
    const { data } = await db
      .from('questions')
      .select('id, body, options, type, answer, explanation, time_limit_sec, difficulty')
      .eq('subject', subject)
      .eq('is_active', true)
      .in('difficulty', difficultyBand)
      .limit(count * 4);

    if (data && data.length >= count) {
      return shuffleArray(data as QuestionRow[]).slice(0, count);
    }

    {/** Fallback: ambil soal aktif topik apapun jika filter band kurang */}
    const { data: fallback } = await db
      .from('questions')
      .select('id, body, options, type, answer, explanation, time_limit_sec, difficulty')
      .eq('subject', subject)
      .eq('is_active', true)
      .limit(count * 4);

    if (fallback && fallback.length > 0) {
      return shuffleArray(fallback as QuestionRow[]).slice(0, count);
    }
  } catch (err) {
    console.warn('[DuelEngine] Warning loading questions from DB:', err);
  }

  {/** Fallback soal matematika statis jika database belum terhubung/diseed */}
  return [
    {
      id: 'fb-1',
      body: 'Berapakah nilai $x$ jika $x + 5 = 12$?',
      options: [
        { id: 'a', text: '5' },
        { id: 'b', text: '7' },
        { id: 'c', text: '8' },
        { id: 'd', text: '17' },
      ],
      type: 'mcq',
      answer: 'b',
      explanation: '$x = 12 - 5 = 7$',
      time_limit_sec: 30,
    },
    {
      id: 'fb-2',
      body: 'Sederhanakan: $3x + 4x$',
      options: [
        { id: 'a', text: '7x' },
        { id: 'b', text: '12x' },
        { id: 'c', text: '7x^2' },
        { id: 'd', text: '7' },
      ],
      type: 'mcq',
      answer: 'a',
      explanation: '$3x + 4x = (3+4)x = 7x$',
      time_limit_sec: 30,
    },
    {
      id: 'fb-3',
      body: 'Jika $2y = 18$, berapakah nilai $y$?',
      options: null,
      type: 'numeric',
      answer: '9',
      explanation: '$y = 18 \\div 2 = 9$',
      time_limit_sec: 30,
    },
    {
      id: 'fb-4',
      body: 'Faktorkan: $x^2 - 16$',
      options: [
        { id: 'a', text: '(x - 4)(x + 4)' },
        { id: 'b', text: '(x - 4)^2' },
        { id: 'c', text: '(x + 4)^2' },
        { id: 'd', text: '(x - 8)(x + 2)' },
      ],
      type: 'mcq',
      answer: 'a',
      explanation: 'Pola selisih dua kuadrat: $a^2 - b^2 = (a-b)(a+b)$.',
      time_limit_sec: 30,
    },
    {
      id: 'fb-5',
      body: 'Berapakah nilai $n$ jika $3(n - 2) = 15$?',
      options: null,
      type: 'numeric',
      answer: '7',
      explanation: '$3n - 6 = 15 \\Rightarrow 3n = 21 \\Rightarrow n = 7$',
      time_limit_sec: 30,
    },
  ];
}

/**
 * Elo rating calculation.
 */
export function computeElo(
  p1Rating: number,
  p2Rating: number,
  result: 'p1_wins' | 'p2_wins' | 'draw',
  p1GamesPlayed: number,
  p2GamesPlayed: number,
  isBot: boolean
): { p1Delta: number; p2Delta: number } {
  const k1 =
    p1GamesPlayed < DUEL_CONFIG.earlyGamesThreshold
      ? DUEL_CONFIG.kFactorEarlyGames
      : DUEL_CONFIG.kFactorNormal;
  const k2 =
    p2GamesPlayed < DUEL_CONFIG.earlyGamesThreshold
      ? DUEL_CONFIG.kFactorEarlyGames
      : DUEL_CONFIG.kFactorNormal;

  const expected1 = 1 / (1 + Math.pow(10, (p2Rating - p1Rating) / 400));
  const expected2 = 1 - expected1;

  const score1 = result === 'p1_wins' ? 1 : result === 'draw' ? 0.5 : 0;
  const score2 = 1 - score1;

  let p1Delta = Math.round(k1 * (score1 - expected1));
  let p2Delta = Math.round(k2 * (score2 - expected2));

  if (isBot) {
    p1Delta = Math.round(p1Delta * DUEL_CONFIG.botRatingMultiplier);
    p2Delta = 0;
  }

  return { p1Delta, p2Delta };
}

/**
 * Score points: 100 base + linear speed bonus up to 50.
 */
export function computePoints(isCorrect: boolean, responseMs: number, timeLimitMs: number): number {
  if (!isCorrect) return 0;
  const ratio = Math.max(0, 1 - responseMs / timeLimitMs);
  const speedBonus = Math.round(DUEL_CONFIG.maxSpeedBonus * ratio);
  return DUEL_CONFIG.basePoints + speedBonus;
}

/**
 * Broadcast next question to participants with server deadline.
 */
export async function sendQuestion(
  io: TypedServer,
  duel: ActiveDuel,
  matchStore: MatchStore
) {
  const pos = duel.currentPosition;
  if (pos >= duel.questions.length) {
    await finishDuel(io, duel, matchStore);
    return;
  }

  const q = duel.questions[pos];
  const timeLimitMs = (q.time_limit_sec || DUEL_CONFIG.timeLimitSec) * 1000;
  const deadlineAt = new Date(Date.now() + timeLimitMs);

  matchStore.updateDuel(duel.duelId, {
    currentDeadlineAt: deadlineAt,
    answeredThisRound: new Set<string>(),
  });

  {/** Payload soal ke klien tanpa kunci jawaban atau pembahasan */}
  const questionPayload = {
    position: pos,
    body: q.body,
    options: q.options ?? undefined,
    type: q.type,
    deadlineAt: deadlineAt.toISOString(),
    timeLimitSec: q.time_limit_sec,
    totalQuestions: duel.questions.length,
  };

  const p1Socket = matchStore.getUserSocket(duel.player1.userId);
  if (p1Socket) {
    io.to(p1Socket).emit('duel:question', questionPayload);
  }

  if (duel.player2 && !duel.player2.isBot) {
    const p2Socket = matchStore.getUserSocket(duel.player2.userId);
    if (p2Socket) {
      io.to(p2Socket).emit('duel:question', questionPayload);
    }
  }

  {/** Jadwalkan jawaban bot jika lawan bertipe bot */}
  if (duel.player2?.isBot && duel.botLevel !== null) {
    scheduleBotAnswer(io, duel, q, matchStore, timeLimitMs);
  }

  {/** Timer otomatis untuk memajukan soal saat waktu habis */}
  const timer = setTimeout(async () => {
    const freshDuel = matchStore.getDuel(duel.duelId);
    if (!freshDuel || freshDuel.status !== 'running' || freshDuel.currentPosition !== pos) return;
    await advanceQuestion(io, freshDuel, matchStore);
  }, timeLimitMs + 350);

  duel.questionTimers.set(`q${pos}`, timer);
}

/**
 * Record an answer from user or bot.
 */
export async function recordAnswer(
  io: TypedServer,
  duel: ActiveDuel,
  matchStore: MatchStore,
  userId: string,
  socketId: string,
  answer: string,
  isBot: boolean
) {
  const pos = duel.currentPosition;
  const q = duel.questions[pos];
  if (!q) return;

  const now = Date.now();
  const deadline = duel.currentDeadlineAt?.getTime() ?? 0;
  if (now > deadline + 800) {
    {/** Ditolak: jawaban melebihi deadline server */}
    return;
  }

  if (duel.answeredThisRound.has(userId)) return;
  duel.answeredThisRound.add(userId);

  const startTime = deadline - q.time_limit_sec * 1000;
  const responseMs = Math.max(0, now - startTime);

  if (responseMs < DUEL_CONFIG.suspiciouslyFastMs && !isBot) {
    console.warn(`[AntiCheat] Suspicious response time: user=${userId}, time=${responseMs}ms`);
  }

  const isCorrect = normalizeAnswer(answer) === normalizeAnswer(q.answer);
  const points = computePoints(isCorrect, responseMs, q.time_limit_sec * 1000);

  if (userId === duel.player1.userId) {
    matchStore.updateDuel(duel.duelId, { p1Score: duel.p1Score + points });
  } else {
    matchStore.updateDuel(duel.duelId, { p2Score: duel.p2Score + points });
  }

  const updatedDuel = matchStore.getDuel(duel.duelId)!;
  updatedDuel.answerLog.push({ userId, position: pos, answer: answer || null, isCorrect });

  {/** Simpan jawaban ke database Supabase */}
  try {
    await db.from('duel_answers').upsert({
      duel_id: duel.duelId,
      user_id: isBot ? null : userId,
      is_bot: isBot,
      position: pos,
      answer: answer || null,
      is_correct: isCorrect,
      response_ms: responseMs,
      points,
    });
  } catch (err) {
    console.warn('[DuelEngine] Warning saving answer to DB:', err);
  }

  const myTotalPoints = userId === duel.player1.userId ? updatedDuel.p1Score : updatedDuel.p2Score;

  if (!isBot) {
    io.to(socketId).emit('duel:question_result', {
      position: pos,
      correct: isCorrect,
      points,
      myTotalPoints,
    });

    const opponentId = userId === duel.player1.userId ? duel.player2?.userId : duel.player1.userId;
    if (opponentId && !duel.player2?.isBot) {
      const oppSocket = matchStore.getUserSocket(opponentId);
      if (oppSocket) {
        io.to(oppSocket).emit('duel:opponent_answered', { position: pos });
      }
    }
  }

  const bothAnswered = checkBothAnswered(updatedDuel);
  if (bothAnswered) {
    const timer = updatedDuel.questionTimers.get(`q${pos}`);
    if (timer) clearTimeout(timer);
    await advanceQuestion(io, updatedDuel, matchStore);
  }
}

function checkBothAnswered(duel: ActiveDuel): boolean {
  if (duel.player2?.isBot) {
    return duel.answeredThisRound.has(duel.player1.userId) && duel.answeredThisRound.has('bot');
  }
  if (!duel.player2) return false;
  return (
    duel.answeredThisRound.has(duel.player1.userId) &&
    duel.answeredThisRound.has(duel.player2.userId)
  );
}

async function advanceQuestion(
  io: TypedServer,
  duel: ActiveDuel,
  matchStore: MatchStore
) {
  const nextPos = duel.currentPosition + 1;
  matchStore.updateDuel(duel.duelId, { currentPosition: nextPos });
  const freshDuel = matchStore.getDuel(duel.duelId)!;

  if (nextPos >= freshDuel.questions.length) {
    await finishDuel(io, freshDuel, matchStore);
  } else {
    await sleep(1000);
    await sendQuestion(io, freshDuel, matchStore);
  }
}

function scheduleBotAnswer(
  io: TypedServer,
  duel: ActiveDuel,
  q: QuestionRow,
  matchStore: MatchStore,
  timeLimitMs: number
) {
  const botRating = duel.botLevel ?? 1000;
  const pCorrect = Math.min(0.92, Math.max(0.4, (botRating - 800) / 1000 + 0.45));
  const isCorrect = Math.random() < pCorrect;

  const minMs = 3000;
  const maxMs = Math.min(timeLimitMs - 1500, 22000);
  const botAnswerMs = minMs + Math.random() * (maxMs - minMs);

  setTimeout(async () => {
    const freshDuel = matchStore.getDuel(duel.duelId);
    if (
      !freshDuel ||
      freshDuel.status !== 'running' ||
      freshDuel.currentPosition !== duel.currentPosition
    )
      return;

    let botAnswer: string;
    if (isCorrect) {
      botAnswer = q.answer;
    } else if (q.type === 'mcq' && q.options) {
      const wrong = q.options.filter((o) => o.id !== q.answer);
      botAnswer = wrong[Math.floor(Math.random() * wrong.length)]?.id ?? 'x';
    } else {
      botAnswer = String(Math.floor(Math.random() * 40));
    }

    freshDuel.answeredThisRound.add('bot');
    await recordAnswer(io, freshDuel, matchStore, 'bot', '', botAnswer, true);
  }, botAnswerMs);
}

export async function finishDuel(
  io: TypedServer,
  duel: ActiveDuel,
  matchStore: MatchStore
) {
  {/** Cegah finishDuel jalan dua kali (mis. dua jawaban terakhir masuk hampir bersamaan) */}
  if (duel.status === 'finished') return;
  matchStore.updateDuel(duel.duelId, { status: 'finished' });

  const isBot = duel.player2?.isBot ?? false;
  const p1Score = duel.p1Score;
  const p2Score = duel.p2Score;

  let winnerId: string | null = null;
  let result: 'p1_wins' | 'p2_wins' | 'draw';

  if (p1Score > p2Score) {
    result = 'p1_wins';
    winnerId = duel.player1.userId;
  } else if (p2Score > p1Score) {
    result = 'p2_wins';
    winnerId = isBot ? null : (duel.player2?.userId ?? null);
  } else {
    result = 'draw';
  }

  let p1GP = 0;
  let p2GP = 0;

  {/** Satu-satunya query sebelum duel:end: games_played untuk K-factor Elo, sekali jalan untuk kedua pemain */}
  try {
    const p2UserId = !isBot && duel.player2 ? duel.player2.userId : null;
    const ids = p2UserId ? [duel.player1.userId, p2UserId] : [duel.player1.userId];
    const { data: profiles } = await db.from('profiles').select('id, games_played').in('id', ids);
    p1GP = profiles?.find((p) => p.id === duel.player1.userId)?.games_played ?? 0;
    if (p2UserId) p2GP = profiles?.find((p) => p.id === p2UserId)?.games_played ?? 0;
  } catch (err) {
    console.warn('[DuelEngine] Warning fetching profile counts:', err);
  }

  const { p1Delta } = computeElo(
    duel.p1RatingBefore,
    duel.p2RatingBefore,
    result,
    p1GP,
    isBot ? 999 : p2GP,
    isBot
  );

  let p2Delta = 0;
  if (!isBot && duel.player2) {
    const { p2Delta: d2 } = computeElo(
      duel.p1RatingBefore,
      duel.p2RatingBefore,
      result,
      p1GP,
      p2GP,
      false
    );
    p2Delta = d2;
  }

  const p1RatingAfter = Math.max(100, duel.p1RatingBefore + p1Delta);
  const p2RatingAfter = isBot ? duel.p2RatingBefore : Math.max(100, duel.p2RatingBefore + p2Delta);

  {/** Review dibangun dari riwayat jawaban di memori, tidak perlu query duel_answers */}
  const buildReview = (userId: string) => {
    return duel.questions.map((q, idx) => {
      const myAns = duel.answerLog.find((a) => a.position === idx && a.userId === userId);
      return {
        position: idx,
        questionBody: q.body,
        yourAnswer: myAns?.answer ?? null,
        correctAnswer: q.answer,
        explanation: q.explanation,
        wasCorrect: myAns?.isCorrect ?? false,
      };
    });
  };

  const p1SocketId = matchStore.getUserSocket(duel.player1.userId);
  if (p1SocketId) {
    const p1Winner = result === 'p1_wins' ? 'me' : result === 'draw' ? 'draw' : 'opponent';
    io.to(p1SocketId).emit('duel:end', {
      winner: p1Winner,
      scores: [
        { userId: duel.player1.userId, nickname: duel.player1.nickname, totalPoints: p1Score },
        {
          userId: duel.player2?.userId ?? 'bot',
          nickname: duel.player2?.nickname ?? 'Bot',
          totalPoints: p2Score,
        },
      ],
      ratingBefore: duel.p1RatingBefore,
      ratingAfter: p1RatingAfter,
      ratingChange: p1Delta,
      review: buildReview(duel.player1.userId),
    });
  }

  if (!isBot && duel.player2) {
    const p2SocketId = matchStore.getUserSocket(duel.player2.userId);
    if (p2SocketId) {
      const p2Winner = result === 'p2_wins' ? 'me' : result === 'draw' ? 'draw' : 'opponent';
      io.to(p2SocketId).emit('duel:end', {
        winner: p2Winner,
        scores: [
          { userId: duel.player1.userId, nickname: duel.player1.nickname, totalPoints: p1Score },
          { userId: duel.player2.userId, nickname: duel.player2.nickname, totalPoints: p2Score },
        ],
        ratingBefore: duel.p2RatingBefore,
        ratingAfter: p2RatingAfter,
        ratingChange: p2Delta,
        review: buildReview(duel.player2.userId),
      });
    }
  }

  matchStore.deleteDuel(duel.duelId);

  {/** Simpan hasil ke Supabase setelah duel:end terkirim, supaya pemain tidak menunggu DB */}
  try {
    await db
      .from('duels')
      .update({
        status: 'finished',
        winner_id: winnerId,
        p1_rating_before: duel.p1RatingBefore,
        p1_rating_after: p1RatingAfter,
        p2_rating_before: isBot ? null : duel.p2RatingBefore,
        p2_rating_after: isBot ? null : p2RatingAfter,
        ended_at: new Date().toISOString(),
      })
      .eq('id', duel.duelId);

    await db
      .from('profiles')
      .update({
        rating: p1RatingAfter,
        games_played: p1GP + 1,
      })
      .eq('id', duel.player1.userId);

    if (!isBot && duel.player2) {
      await db
        .from('profiles')
        .update({
          rating: p2RatingAfter,
          games_played: p2GP + 1,
        })
        .eq('id', duel.player2.userId);
    }
  } catch (err) {
    console.warn('[DuelEngine] Warning updating finished duel in Supabase:', err);
  }
}
