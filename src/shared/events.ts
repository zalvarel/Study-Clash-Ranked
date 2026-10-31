/**
 * Event WebSocket dan skema Zod
 * Aman diimpor klien dan server
 */

import { z } from 'zod';

{/** Primitif bersama */}

export const McqOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});
export type McqOption = z.infer<typeof McqOptionSchema>;

export const QuestionTypeSchema = z.enum(['mcq', 'numeric']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const OpponentInfoSchema = z.object({
  nickname: z.string(),
  rating: z.number().int(),
});
export type OpponentInfo = z.infer<typeof OpponentInfoSchema>;

export const PlayerScoreSchema = z.object({
  userId: z.string(),
  nickname: z.string(),
  totalPoints: z.number().int(),
});
export type PlayerScore = z.infer<typeof PlayerScoreSchema>;

export const ReviewItemSchema = z.object({
  position: z.number().int(),
  questionBody: z.string(),
  yourAnswer: z.string().nullable(),
  correctAnswer: z.string(),
  explanation: z.string(),
  wasCorrect: z.boolean(),
});
export type ReviewItem = z.infer<typeof ReviewItemSchema>;

{/** Payload Klien ke Server */}

export const QueueJoinPayloadSchema = z.object({
  subject: z.string().default('math'),
  isBot: z.boolean().optional().default(false),
});
export type QueueJoinPayload = z.infer<typeof QueueJoinPayloadSchema>;

export const RoomJoinPayloadSchema = z.object({
  code: z.string().min(4).max(4),
});
export type RoomJoinPayload = z.infer<typeof RoomJoinPayloadSchema>;

export const DuelAnswerPayloadSchema = z.object({
  duelId: z.string().uuid(),
  position: z.number().int().min(0),
  answer: z.string().max(500),
});
export type DuelAnswerPayload = z.infer<typeof DuelAnswerPayloadSchema>;

export const DuelRejoinPayloadSchema = z.object({
  duelId: z.string().uuid(),
});
export type DuelRejoinPayload = z.infer<typeof DuelRejoinPayloadSchema>;

{/** Payload Server ke Klien */}

export const MatchFoundPayloadSchema = z.object({
  duelId: z.string().uuid(),
  opponent: OpponentInfoSchema,
  isBot: z.boolean(),
});
export type MatchFoundPayload = z.infer<typeof MatchFoundPayloadSchema>;

export const DuelStartPayloadSchema = z.object({
  /** Timestamp server untuk hitung mundur bersama */
  startsAt: z.string().datetime(),
});
export type DuelStartPayload = z.infer<typeof DuelStartPayloadSchema>;

export const DuelQuestionPayloadSchema = z.object({
  position: z.number().int().min(0),
  body: z.string(),
  options: z.array(McqOptionSchema).optional(),
  type: QuestionTypeSchema,
  /** Timestamp batas waktu server */
  deadlineAt: z.string().datetime(),
  timeLimitSec: z.number().int().positive(),
  totalQuestions: z.number().int().positive(),
});
export type DuelQuestionPayload = z.infer<typeof DuelQuestionPayloadSchema>;

export const DuelOpponentAnsweredPayloadSchema = z.object({
  position: z.number().int().min(0),
});
export type DuelOpponentAnsweredPayload = z.infer<typeof DuelOpponentAnsweredPayloadSchema>;

export const DuelQuestionResultPayloadSchema = z.object({
  position: z.number().int().min(0),
  correct: z.boolean(),
  points: z.number().int(),
  myTotalPoints: z.number().int(),
});
export type DuelQuestionResultPayload = z.infer<typeof DuelQuestionResultPayloadSchema>;

export const DuelEndPayloadSchema = z.object({
  winner: z.enum(['me', 'opponent', 'draw']),
  scores: z.array(PlayerScoreSchema),
  ratingBefore: z.number().int(),
  ratingAfter: z.number().int(),
  ratingChange: z.number().int(),
  review: z.array(ReviewItemSchema),
});
export type DuelEndPayload = z.infer<typeof DuelEndPayloadSchema>;

export const ServerErrorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
});
export type ServerErrorPayload = z.infer<typeof ServerErrorPayloadSchema>;

export const RoomCreatedPayloadSchema = z.object({
  code: z.string().length(4),
});
export type RoomCreatedPayload = z.infer<typeof RoomCreatedPayloadSchema>;

{/** Tipe Socket.IO */}

export interface ClientToServerEvents {
  'queue:join': (payload: QueueJoinPayload) => void;
  'queue:leave': () => void;
  'room:create': () => void;
  'room:join': (payload: RoomJoinPayload) => void;
  'duel:answer': (payload: DuelAnswerPayload) => void;
  'duel:rejoin': (payload: DuelRejoinPayload) => void;
}

export interface ServerToClientEvents {
  'queue:waiting': () => void;
  'match:found': (payload: MatchFoundPayload) => void;
  'duel:start': (payload: DuelStartPayload) => void;
  'duel:question': (payload: DuelQuestionPayload) => void;
  'duel:opponent_answered': (payload: DuelOpponentAnsweredPayload) => void;
  'duel:question_result': (payload: DuelQuestionResultPayload) => void;
  'duel:end': (payload: DuelEndPayload) => void;
  'room:created': (payload: RoomCreatedPayload) => void;
  'error': (payload: ServerErrorPayload) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  nickname: string;
  rating: number;
}
