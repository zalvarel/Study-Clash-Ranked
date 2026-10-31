/**
 * src/server/store/MatchStore.ts
 * Interface abstrak untuk menyimpan state duel di memori.
 * Ganti implementasinya dengan Redis tanpa mengubah logika duel.
 */

export interface QueueEntry {
  userId: string;
  nickname: string;
  rating: number;
  socketId: string;
  joinedAt: Date;
  subject: string;
}

export interface DuelPlayer {
  userId: string;
  nickname: string;
  rating: number;
  socketId: string | null;
  isBot: boolean;
}

export interface ActiveDuel {
  duelId: string;
  mode: 'ranked' | 'bot' | 'room';
  subject: string;
  player1: DuelPlayer;
  /** null jika lawan adalah bot */
  player2: DuelPlayer | null;
  botLevel: number | null;
  questions: QuestionRow[];
  currentPosition: number;
  status: 'countdown' | 'running' | 'finished';
  p1Score: number;
  p2Score: number;
  currentDeadlineAt: Date | null;
  questionTimers: Map<string, ReturnType<typeof setTimeout>>;
  answeredThisRound: Set<string>;
  /** Riwayat jawaban di memori, dipakai untuk review di akhir duel tanpa query DB */
  answerLog: Array<{ userId: string; position: number; answer: string | null; isCorrect: boolean }>;
  disconnectedAt: Map<string, Date>;
  p1RatingBefore: number;
  p2RatingBefore: number;
}

export interface QuestionRow {
  id: string;
  body: string;
  options: Array<{ id: string; text: string }> | null;
  type: 'mcq' | 'numeric';
  answer: string;
  explanation: string;
  time_limit_sec: number;
}

export interface MatchStore {
  /** Operasi antrean matchmaking */
  enqueue(entry: QueueEntry): void;
  dequeue(userId: string): void;
  getQueue(subject: string): QueueEntry[];
  isInQueue(userId: string): boolean;

  /** Operasi data duel aktif */
  createDuel(duel: ActiveDuel): void;
  getDuel(duelId: string): ActiveDuel | null;
  updateDuel(duelId: string, updates: Partial<ActiveDuel>): void;
  deleteDuel(duelId: string): void;
  getActiveDuelByUser(userId: string): ActiveDuel | null;

  /** Pemetaan ID pengguna ke ID socket untuk reconnect */
  setUserSocket(userId: string, socketId: string): void;
  getUserSocket(userId: string): string | null;
  removeUserSocket(userId: string): void;
}
