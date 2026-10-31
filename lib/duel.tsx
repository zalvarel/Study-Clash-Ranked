"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { DUEL_RULES, submitAnswer, type DuelMode, type DuelQuestion, type Jenjang, type Match, type PlayerSummary } from "@/lib/api";

/** State duel di sisi klien: progres dan pilihan pemain. Skor & hasil diambil dari lib/api. */
export type DuelState = {
  status: "playing" | "finished";
  duelId: string;
  mode: DuelMode;
  jenjang: Jenjang;
  me: PlayerSummary;
  opponent: PlayerSummary;
  questions: DuelQuestion[];
  /** Soal yang sedang dikerjakan (0-based). */
  index: number;
  questionStartedAt: number;
  /** Diisi saat duel dijeda (mis. koneksi terputus). */
  pausedAt: number | null;
  /** Opsi yang dipilih pemain per soal; null kalau tidak menjawab. */
  myAnswers: (number | null)[];
};

const STORAGE_KEY = "scr:duel";
/** Waktu per soal (ms) untuk jenjang duel. */
export function questionMs(jenjang: Jenjang) {
  return DUEL_RULES.secondsPerQuestion[jenjang] * 1000;
}

// ---- Store kecil yang disimpan di sessionStorage ----

let state: DuelState | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function getSnapshot(): DuelState | null {
  if (!loaded) {
    loaded = true;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<DuelState>) : null;
      // Abaikan state format lama (sebelum ada duelId / jenjang).
      state = parsed?.duelId && parsed.jenjang ? (parsed as DuelState) : null;
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

// ---- Aksi ----

const actions = {
  start(me: Omit<PlayerSummary, "rating">, match: Match, questions: DuelQuestion[]) {
    setState({
      status: "playing",
      duelId: match.duelId,
      mode: match.mode,
      jenjang: match.jenjang,
      me: { ...me, rating: match.myRating },
      opponent: match.opponent,
      questions,
      index: 0,
      questionStartedAt: Date.now(),
      pausedAt: null,
      myAnswers: questions.map(() => null),
    });
  },

  answer(choice: number) {
    const d = getSnapshot();
    if (!d || d.status !== "playing" || d.myAnswers[d.index] !== null) return;
    const myAnswers = [...d.myAnswers];
    myAnswers[d.index] = choice;
    setState({ ...d, myAnswers });
    void submitAnswer(d.duelId, d.index, choice);
  },

  /** Pindah ke soal berikutnya, atau selesaikan duel setelah soal terakhir. */
  advance(fromIndex: number) {
    const d = getSnapshot();
    if (!d || d.status !== "playing" || d.index !== fromIndex) return;
    if (d.index + 1 < d.questions.length) {
      setState({ ...d, index: d.index + 1, questionStartedAt: Date.now() });
      return;
    }
    setState({ ...d, status: "finished", pausedAt: null });
  },

  pause() {
    const d = getSnapshot();
    if (!d || d.status !== "playing" || d.pausedAt !== null) return;
    setState({ ...d, pausedAt: Date.now() });
  },

  /** Lanjutkan duel; waktu yang terpakai selama jeda tidak dihitung. */
  resume() {
    const d = getSnapshot();
    if (!d || d.pausedAt === null) return;
    setState({ ...d, questionStartedAt: d.questionStartedAt + (Date.now() - d.pausedAt), pausedAt: null });
  },

  reset() {
    setState(null);
  },
};

// ---- Context ----

type DuelContextValue = {
  /** undefined = belum dibaca dari sessionStorage (render server / hidrasi). */
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
