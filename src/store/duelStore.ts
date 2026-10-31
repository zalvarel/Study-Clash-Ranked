import { create } from 'zustand';
import type {
  DuelQuestionPayload,
  DuelEndPayload,
  OpponentInfo,
} from '../shared/events';

export type DuelPhase =
  | 'idle'
  | 'queuing'
  | 'countdown'
  | 'question'
  | 'question_result'
  | 'finished';

interface DuelState {
  phase: DuelPhase;
  duelId: string | null;
  opponent: OpponentInfo | null;
  isBot: boolean;
  startsAt: string | null;
  currentQuestion: DuelQuestionPayload | null;
  opponentAnswered: boolean;
  myTotalPoints: number;
  lastResult: { correct: boolean; points: number } | null;
  endPayload: DuelEndPayload | null;
  ratingBefore: number;
  ratingAfter: number;

  setQueuing: () => void;
  setMatchFound: (duelId: string, opponent: OpponentInfo, isBot: boolean) => void;
  setCountdown: (startsAt: string) => void;
  setQuestion: (q: DuelQuestionPayload) => void;
  setOpponentAnswered: () => void;
  setQuestionResult: (correct: boolean, points: number, myTotalPoints: number) => void;
  setDuelEnd: (payload: DuelEndPayload) => void;
  reset: () => void;
}

const initialState = {
  phase: 'idle' as DuelPhase,
  duelId: null,
  opponent: null,
  isBot: false,
  startsAt: null,
  currentQuestion: null,
  opponentAnswered: false,
  myTotalPoints: 0,
  lastResult: null,
  endPayload: null,
  ratingBefore: 1000,
  ratingAfter: 1000,
};

export const useDuelStore = create<DuelState>((set) => ({
  ...initialState,

  setQueuing: () => set({ phase: 'queuing' }),

  setMatchFound: (duelId, opponent, isBot) =>
    set({ duelId, opponent, isBot, phase: 'countdown' }),

  setCountdown: (startsAt) => set({ startsAt, phase: 'countdown' }),

  setQuestion: (q) =>
    set({
      currentQuestion: q,
      opponentAnswered: false,
      lastResult: null,
      phase: 'question',
    }),

  setOpponentAnswered: () => set({ opponentAnswered: true }),

  setQuestionResult: (correct, points, myTotalPoints) =>
    set({
      lastResult: { correct, points },
      myTotalPoints,
      phase: 'question_result',
    }),

  setDuelEnd: (payload) =>
    set({
      endPayload: payload,
      ratingBefore: payload.ratingBefore,
      ratingAfter: payload.ratingAfter,
      phase: 'finished',
    }),

  reset: () => set(initialState),
}));
