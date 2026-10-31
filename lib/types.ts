/**
 * Kontrak data antara layar dan backend (lewat lib/api.ts).
 * Implementasi mock maupun Supabase harus mengikuti tipe-tipe ini.
 */

export type DuelMode = "ranked" | "bot";

/** Jenjang sekolah. Label di UI: SD, SMP, "SMA / SMK" (lihat JENJANG_LABEL di lib/data/sekolah.ts). */
export type Jenjang = "SD" | "SMP" | "SMA";

/** Pemain beserta jenjang dan asal sekolahnya. */
export type PlayerSummary = {
  name: string;
  rating: number;
  jenjang: Jenjang;
  sekolah: string;
};

/** Profil pemain yang sedang masuk. */
export type Profile = PlayerSummary & {
  /** Peringkat di antara semua pemain (1 = teratas). */
  rank: number;
};

export type LeaderboardEntry = PlayerSummary & { rank: number };

/** Papan peringkat, opsional difilter per jenjang. */
export type Leaderboard = {
  /** null = semua jenjang. */
  jenjang: Jenjang | null;
  /** Pemain teratas, urut dari rating tertinggi. */
  entries: LeaderboardEntry[];
  /** Posisi pemain sendiri di papan yang sama. */
  me: LeaderboardEntry;
};

/** Hasil pencarian lawan. */
export type Match = {
  duelId: string;
  mode: DuelMode;
  /** Jenjang duel; lawan selalu sejenjang. */
  jenjang: Jenjang;
  opponent: PlayerSummary;
  /** Rating pemain saat duel dimulai. */
  myRating: number;
};

/** Soal seperti yang dilihat pemain: tanpa kunci jawaban. */
export type DuelQuestion = {
  id: string;
  text: string;
  /** Selalu 4 opsi, urut A-D. */
  options: [string, string, string, string];
};

/** Keadaan duel saat sebuah soal sedang berjalan. */
export type DuelStatus = {
  questionIndex: number;
  /** Lawan sudah menjawab soal ini. */
  opponentAnswered: boolean;
  /** Skor dari soal-soal yang sudah selesai (sebelum questionIndex). */
  myScore: number;
  opponentScore: number;
};

export type DuelOutcome = "menang" | "kalah" | "seri";

export type DuelResult = {
  duelId: string;
  mode: DuelMode;
  jenjang: Jenjang;
  opponent: PlayerSummary;
  outcome: DuelOutcome;
  myScore: number;
  opponentScore: number;
  totalQuestions: number;
  /** Jumlah soal yang dijawab benar (= myScore). */
  correctCount: number;
  ratingBefore: number;
  ratingAfter: number;
  /** ratingAfter - ratingBefore; selalu 0 untuk mode latihan. */
  ratingDelta: number;
};

/** Pembahasan untuk satu soal yang dijawab salah atau tidak dijawab. */
export type Explanation = {
  questionId: string;
  /** Nomor soal di duel (1-based). */
  questionNumber: number;
  totalQuestions: number;
  text: string;
  /** Teks opsi yang dipilih; null kalau tidak menjawab. */
  myAnswer: string | null;
  correctAnswer: string;
  steps: string[];
};
