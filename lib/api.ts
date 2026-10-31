/**
 * Satu-satunya pintu akses data untuk layar.
 *
 * Saat ini semua fungsi meneruskan ke lib/mock. Untuk pindah ke Supabase,
 * ganti isi fungsi di file ini saja; tanda tangan dan tipenya dipertahankan.
 */
import * as mock from "@/lib/mock";
import type {
  DuelMode,
  DuelQuestion,
  DuelResult,
  DuelStatus,
  Explanation,
  Jenjang,
  Leaderboard,
  Match,
  Profile,
} from "@/lib/types";

export type * from "@/lib/types";

export { cariSekolah, DAFTAR_JENJANG, JENJANG_LABEL, SEKOLAH } from "@/lib/data/sekolah";

/** Aturan duel. */
export const DUEL_RULES = {
  /** Waktu per soal dalam detik, per jenjang (SD 30, SMP 25, SMA 20). */
  secondsPerQuestion: mock.SECONDS_PER_QUESTION,
} as const;

/** Nama, rating, jenjang, sekolah, dan peringkat pemain yang sedang masuk. */
export function getProfile(): Promise<Profile> {
  return mock.getProfile();
}

/**
 * Papan peringkat: pemain teratas (urut dari rating tertinggi) dan posisi
 * pemain sendiri. Tanpa `jenjang` = semua jenjang.
 */
export function getLeaderboard(jenjang?: Jenjang): Promise<Leaderboard> {
  return mock.getLeaderboard(jenjang);
}

/**
 * Cari lawan sejenjang. Promise selesai saat lawan ditemukan.
 * Batalkan pencarian lewat `signal` (ditolak dengan AbortError).
 */
export function findMatch(mode: DuelMode, jenjang: Jenjang, options: { signal?: AbortSignal } = {}): Promise<Match> {
  return mock.findMatch(mode, jenjang, options.signal);
}

/** Soal-soal duel (5 soal acak dari bank jenjang duel), urut, tanpa kunci jawaban. */
export function getDuelQuestions(duelId: string): Promise<DuelQuestion[]> {
  return mock.getDuelQuestions(duelId);
}

/** Kirim jawaban pemain (indeks opsi 0-3). Hanya jawaban pertama per soal yang dihitung. */
export function submitAnswer(duelId: string, questionIndex: number, choice: number): Promise<void> {
  return mock.submitAnswer(duelId, questionIndex, choice);
}

/**
 * Keadaan soal yang sedang berjalan: apakah lawan sudah menjawab, dan skor
 * dari soal-soal sebelumnya. `elapsedMs` = waktu soal yang sudah terpakai
 * menurut klien (di luar jeda); dipakai mock untuk mensimulasikan lawan.
 */
export function getDuelStatus(duelId: string, questionIndex: number, elapsedMs: number): Promise<DuelStatus> {
  return mock.getDuelStatus(duelId, questionIndex, elapsedMs);
}

/** Hasil akhir duel, termasuk perubahan rating. Panggil setelah soal terakhir selesai. */
export function getDuelResult(duelId: string): Promise<DuelResult> {
  return mock.getDuelResult(duelId);
}

/** Pembahasan untuk soal yang dijawab salah atau tidak dijawab. */
export function getExplanations(duelId: string): Promise<Explanation[]> {
  return mock.getExplanations(duelId);
}
