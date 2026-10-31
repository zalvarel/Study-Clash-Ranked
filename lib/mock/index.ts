/**
 * Backend tiruan. Berperan seperti server: menyimpan kunci jawaban, rencana
 * jawaban lawan, dan hasil duel (di sessionStorage per duelId).
 * Layar tidak boleh mengimpor file ini langsung; pakai lib/api.ts.
 */
import { displayName, getSessionUser, readProfilSekolah } from "@/lib/auth";
import type {
  DuelMode,
  DuelOutcome,
  DuelQuestion,
  DuelResult,
  DuelStatus,
  Explanation,
  Jenjang,
  Leaderboard,
  Match,
  PlayerSummary,
  Profile,
} from "@/lib/types";
import { BANK_SOAL, type MockQuestion } from "./questions";

const QUESTIONS_PER_DUEL = 5;
/** Waktu per soal (detik) per jenjang. */
export const SECONDS_PER_QUESTION: Record<Jenjang, number> = { SD: 30, SMP: 25, SMA: 20 };

const DEFAULT_RATING = 1000;
/** Peringkat tiruan pemain sendiri: keseluruhan dan per jenjang. */
const MY_RANK = { semua: 128, SD: 41, SMP: 37, SMA: 52 } as const;
const RATING_KEY = "scr:mock:rating";
const DUEL_KEY_PREFIX = "scr:mock:duel:";

/** Lama pencarian lawan tiruan. */
const SEARCH_MS: Record<DuelMode, number> = { ranked: 8000, bot: 2000 };

/** Pemain tiruan, urut dari rating tertinggi. */
const PLAYERS: PlayerSummary[] = [
  { name: "Alya", rating: 1480, jenjang: "SMA", sekolah: "SMAN 3 Pasuruan" },
  { name: "Dimas", rating: 1455, jenjang: "SMP", sekolah: "SMPN 2 Prigen" },
  { name: "Nadia", rating: 1432, jenjang: "SD", sekolah: "SDN Bukir Pasuruan" },
  { name: "Fikri", rating: 1401, jenjang: "SMA", sekolah: "SMKN Prigen" },
  { name: "Salsa", rating: 1389, jenjang: "SMP", sekolah: "SMP Al Azhar Prigen" },
  { name: "Gilang", rating: 1377, jenjang: "SMA", sekolah: "SMA Taman Madya Prigen" },
  { name: "Hana", rating: 1371, jenjang: "SMP", sekolah: "SMPN 10 Pasuruan" },
  { name: "Laras", rating: 1364, jenjang: "SMA", sekolah: "SMAS Al Azhar Prigen" },
  { name: "Rizky", rating: 1360, jenjang: "SD", sekolah: "SDN Bulukandang" },
  { name: "Yoga", rating: 1350, jenjang: "SMP", sekolah: "SMP Maarif Prigen" },
  { name: "Putri", rating: 1342, jenjang: "SD", sekolah: "SDN Randusari Pasuruan" },
  { name: "Dafa", rating: 1340, jenjang: "SMA", sekolah: "SMAS Sejahtera Prigen" },
  { name: "Intan", rating: 1333, jenjang: "SMP", sekolah: "SMP Sejahtera Prigen" },
  { name: "Bagas", rating: 1318, jenjang: "SD", sekolah: "SDN Sukoreno III Prigen" },
  { name: "Citra", rating: 1296, jenjang: "SD", sekolah: "SDN Sebani Pasuruan" },
  { name: "Farel", rating: 1020, jenjang: "SD", sekolah: "SDN Lumbangrejo I Prigen" },
  { name: "Raka", rating: 1012, jenjang: "SMP", sekolah: "SMP PGRI 1 Prigen" },
  { name: "Wulan", rating: 1005, jenjang: "SMA", sekolah: "SMKN Prigen" },
];

const LEADERBOARD_SIZE = 5;

/** Rencana jawaban lawan per soal: kapan menjawab (ms sejak soal mulai) dan opsi yang dipilih. */
type OpponentMove = { atMs: number; choice: number };

/** Catatan duel di sisi "server". */
type DuelRecord = {
  match: Match;
  questions: MockQuestion[];
  opponentMoves: OpponentMove[];
  myAnswers: (number | null)[];
  result: DuelResult | null;
};

// ---- Penyimpanan ----

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("Dibatalkan", "AbortError"));
    });
  });
}

function readRating(): number {
  if (typeof window === "undefined") return DEFAULT_RATING;
  const saved = Number(window.sessionStorage.getItem(RATING_KEY));
  return Number.isFinite(saved) && saved > 0 ? saved : DEFAULT_RATING;
}

function loadDuel(duelId: string): DuelRecord {
  const raw = window.sessionStorage.getItem(DUEL_KEY_PREFIX + duelId);
  if (!raw) throw new Error("Duel tidak ditemukan.");
  return JSON.parse(raw) as DuelRecord;
}

function saveDuel(record: DuelRecord) {
  window.sessionStorage.setItem(DUEL_KEY_PREFIX + record.match.duelId, JSON.stringify(record));
}

/** Pemain yang sedang masuk. Jenjang & sekolah disimpan di user metadata. */
async function me(): Promise<PlayerSummary> {
  const user = await getSessionUser();
  const profil = user ? readProfilSekolah(user) : null;
  if (!user || !profil) throw new Error("Profil belum lengkap.");
  return { name: displayName(user), rating: readRating(), ...profil };
}

// ---- Logika duel ----

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 5 soal acak tanpa pengulangan dari bank jenjang; urutan opsi juga diacak. */
function pickQuestions(jenjang: Jenjang, count: number): MockQuestion[] {
  return shuffle(BANK_SOAL[jenjang])
    .slice(0, count)
    .map((q) => {
      const urutan = shuffle([0, 1, 2, 3]);
      return {
        ...q,
        options: urutan.map((i) => q.options[i]) as MockQuestion["options"],
        answer: urutan.indexOf(q.answer),
      };
    });
}

/** Lawan tiruan menjawab dalam 3 detik s.d. 75% waktu soal, benar sekitar 65% (bot 50%). */
function planOpponent(questions: MockQuestion[], mode: DuelMode, jenjang: Jenjang): OpponentMove[] {
  const accuracy = mode === "bot" ? 0.5 : 0.65;
  const maxMs = SECONDS_PER_QUESTION[jenjang] * 750;
  return questions.map((q) => {
    const correct = Math.random() < accuracy;
    const wrong = [0, 1, 2, 3].filter((i) => i !== q.answer);
    return {
      atMs: 3000 + Math.floor(Math.random() * (maxMs - 3000)),
      choice: correct ? q.answer : wrong[Math.floor(Math.random() * wrong.length)],
    };
  });
}

/** Lawan ranked: pemain sejenjang dengan rating paling dekat. */
function pickOpponent(mode: DuelMode, jenjang: Jenjang, myRating: number): PlayerSummary {
  if (mode === "bot") return { name: "Bot Latihan", rating: 1000, jenjang, sekolah: "Mode latihan" };
  const sejenjang = PLAYERS.filter((p) => p.jenjang === jenjang);
  return sejenjang.reduce((a, b) => (Math.abs(b.rating - myRating) < Math.abs(a.rating - myRating) ? b : a));
}

function scores(record: DuelRecord, upTo: number) {
  const done = record.questions.slice(0, upTo);
  return {
    myScore: done.filter((q, i) => record.myAnswers[i] === q.answer).length,
    opponentScore: done.filter((q, i) => record.opponentMoves[i].choice === q.answer).length,
  };
}

/** Perubahan rating gaya Elo (K = 32). Mode latihan tidak mengubah rating. */
function ratingChange(mode: DuelMode, mine: number, theirs: number, outcome: DuelOutcome) {
  if (mode === "bot") return 0;
  const expected = 1 / (1 + 10 ** ((theirs - mine) / 400));
  const actual = outcome === "menang" ? 1 : outcome === "kalah" ? 0 : 0.5;
  return Math.trunc(32 * (actual - expected));
}

// ---- API tiruan (dipanggil lewat lib/api.ts) ----

export async function getProfile(): Promise<Profile> {
  return { ...(await me()), rank: MY_RANK.semua };
}

export async function getLeaderboard(jenjang?: Jenjang): Promise<Leaderboard> {
  const pemain = await me();
  const daftar = jenjang ? PLAYERS.filter((p) => p.jenjang === jenjang) : PLAYERS;
  return {
    jenjang: jenjang ?? null,
    entries: daftar.slice(0, LEADERBOARD_SIZE).map((p, i) => ({ ...p, rank: i + 1 })),
    me: { ...pemain, rank: jenjang ? MY_RANK[jenjang] : MY_RANK.semua },
  };
}

export async function findMatch(mode: DuelMode, jenjang: Jenjang, signal?: AbortSignal): Promise<Match> {
  await wait(SEARCH_MS[mode], signal);
  const myRating = readRating();
  const questions = pickQuestions(jenjang, QUESTIONS_PER_DUEL);
  const match: Match = {
    duelId: `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    mode,
    jenjang,
    opponent: pickOpponent(mode, jenjang, myRating),
    myRating,
  };
  saveDuel({
    match,
    questions,
    opponentMoves: planOpponent(questions, mode, jenjang),
    myAnswers: questions.map(() => null),
    result: null,
  });
  return match;
}

export async function getDuelQuestions(duelId: string): Promise<DuelQuestion[]> {
  return loadDuel(duelId).questions.map(({ id, text, options }) => ({ id, text, options }));
}

export async function submitAnswer(duelId: string, questionIndex: number, choice: number): Promise<void> {
  const record = loadDuel(duelId);
  if (record.result || record.myAnswers[questionIndex] !== null) return; // jawaban pertama yang dihitung
  record.myAnswers[questionIndex] = choice;
  saveDuel(record);
}

export async function getDuelStatus(duelId: string, questionIndex: number, elapsedMs: number): Promise<DuelStatus> {
  const record = loadDuel(duelId);
  return {
    questionIndex,
    opponentAnswered: elapsedMs >= record.opponentMoves[questionIndex].atMs,
    ...scores(record, questionIndex),
  };
}

export async function getDuelResult(duelId: string): Promise<DuelResult> {
  const record = loadDuel(duelId);
  if (record.result) return record.result;

  // Duel diselesaikan saat hasilnya pertama kali diminta.
  const { match } = record;
  const total = record.questions.length;
  const { myScore, opponentScore } = scores(record, total);
  const outcome: DuelOutcome = myScore > opponentScore ? "menang" : myScore < opponentScore ? "kalah" : "seri";
  const ratingDelta = ratingChange(match.mode, match.myRating, match.opponent.rating, outcome);
  const result: DuelResult = {
    duelId,
    mode: match.mode,
    jenjang: match.jenjang,
    opponent: match.opponent,
    outcome,
    myScore,
    opponentScore,
    totalQuestions: total,
    correctCount: myScore,
    ratingBefore: match.myRating,
    ratingAfter: match.myRating + ratingDelta,
    ratingDelta,
  };
  saveDuel({ ...record, result });
  window.sessionStorage.setItem(RATING_KEY, String(result.ratingAfter));
  return result;
}

export async function getExplanations(duelId: string): Promise<Explanation[]> {
  const record = loadDuel(duelId);
  const total = record.questions.length;
  return record.questions.flatMap((q, i) => {
    const chosen = record.myAnswers[i];
    if (chosen === q.answer) return [];
    return [
      {
        questionId: q.id,
        questionNumber: i + 1,
        totalQuestions: total,
        text: q.text,
        myAnswer: chosen === null ? null : q.options[chosen],
        correctAnswer: q.options[q.answer],
        steps: q.steps,
      },
    ];
  });
}
