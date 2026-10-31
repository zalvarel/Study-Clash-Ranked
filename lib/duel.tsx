"use client";

import {
  createContext, useContext, useMemo, useSyncExternalStore, type ReactNode,
} from "react";
import type { DuelEndPayload, DuelQuestionPayload, DuelQuestionResultPayload, ReviewItem } from "@/src/shared/events";

export type DuelMode = "ranked" | "bot" | "room";
export type Jenjang = "SD" | "SMP" | "SMA";

export type ActiveQuestion = {
  position: number;
  body: string;
  options: Array<{ id: string; text: string }> | null;
  type: "mcq" | "numeric";
  deadlineAt: string;
  timeLimitSec: number;
  totalQuestions: number;
};

export type DuelState = {
  status: "queuing" | "countdown" | "playing" | "finished";
  duelId: string;
  mode: DuelMode;
  isBot: boolean;
  opponent: { nickname: string; rating: number };
  startsAt: string | null;
  currentQuestion: ActiveQuestion | null;
  myAnswer: string | null;
  opponentAnswered: boolean;
  myTotalPoints: number;
  opponentTotalPoints: number;
  result: DuelEndPayload | null;
};

const STORAGE_KEY = "scr:duel:v2";

let state: DuelState | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function getSnapshot(): DuelState | null {
  if (!loaded) {
    loaded = true;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      state = raw ? (JSON.parse(raw) as DuelState) : null;
      if (state?.status === "playing" || state?.status === "countdown") {
        state = { ...state, status: "finished" };
      }
    } catch {
      state = null;
    }
  }
  return state;
}

function setState(next: DuelState | null) {
  state = next;
  if (next) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  else window.sessionStorage.removeItem(STORAGE_KEY);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const actions = {
  setMatchFound(duelId: string, mode: DuelMode, isBot: boolean, opponent: { nickname: string; rating: number }) {
    setState({
      status: "countdown",
      duelId,
      mode,
      isBot,
      opponent,
      startsAt: new Date(Date.now() + 3000).toISOString(),
      currentQuestion: null,
      myAnswer: null,
      opponentAnswered: false,
      myTotalPoints: 0,
      opponentTotalPoints: 0,
      result: null,
    });
  },

  setCountdown(startsAt: string) {
    const d = getSnapshot();
    if (!d) return;
    setState({ ...d, status: "countdown", startsAt });
  },

  setQuestion(payload: DuelQuestionPayload) {
    const d = getSnapshot();
    if (!d) return;
    setState({
      ...d,
      status: "playing",
      currentQuestion: {
        position: payload.position,
        body: payload.body,
        options: payload.options ?? null,
        type: payload.type,
        deadlineAt: payload.deadlineAt,
        timeLimitSec: payload.timeLimitSec,
        totalQuestions: payload.totalQuestions,
      },
      myAnswer: null,
      opponentAnswered: false,
    });
  },

  setMyAnswer(answer: string) {
    const d = getSnapshot();
    if (!d) return;
    setState({ ...d, myAnswer: answer });
  },

  setQuestionResult(payload: DuelQuestionResultPayload) {
    const d = getSnapshot();
    if (!d) return;
    setState({ ...d, myTotalPoints: payload.myTotalPoints });
  },

  setOpponentAnswered() {
    const d = getSnapshot();
    if (!d) return;
    setState({ ...d, opponentAnswered: true });
  },

  setFinished(payload: DuelEndPayload) {
    const d = getSnapshot();
    if (!d) return;
    setState({ ...d, status: "finished", result: payload });
  },

  reset() {
    setState(null);
    loaded = false;
  },
};

type DuelContextValue = {
  duel: DuelState | null | undefined;
  actions: typeof actions;
};

const DuelContext = createContext<DuelContextValue | null>(null);

export function DuelProvider({ children }: { children: ReactNode }) {
  const duel = useSyncExternalStore<DuelState | null | undefined>(subscribe, getSnapshot, () => undefined);
  const value = useMemo(() => ({ duel, actions }), [duel]);
  return <DuelContext.Provider value={value}>{children}</DuelContext.Provider>;
}

export function useDuel(): DuelContextValue {
  const ctx = useContext(DuelContext);
  if (!ctx) throw new Error("useDuel harus dipakai di dalam <DuelProvider>.");
  return ctx;
}

export type { ReviewItem };
