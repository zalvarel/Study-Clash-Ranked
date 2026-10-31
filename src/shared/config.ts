/**
 * src/shared/config.ts
 * Konstanta aturan duel — ubah di sini untuk mengubah seluruh game.
 * Aman diimpor oleh klien maupun server.
 */

export const DUEL_CONFIG = {
  /** Jumlah soal per duel */
  questionsPerDuel: 5,
  /** Batas waktu default per soal (detik) */
  timeLimitSec: 30,
  /** Poin untuk jawaban benar */
  basePoints: 100,
  /** Bonus kecepatan maksimum (berkurang linear) */
  maxSpeedBonus: 50,
  /** Rating awal pemain baru */
  initialRating: 1000,
  /** K-factor untuk N duel pertama */
  kFactorEarlyGames: 40,
  /** K-factor setelah earlyGamesThreshold */
  kFactorNormal: 20,
  /** Ambang batas beralih ke K-factor normal */
  earlyGamesThreshold: 10,
  /** Pengali rating untuk duel bot (0 = tidak mengubah rating) */
  botRatingMultiplier: 0.5,
  /** Selisih rating awal untuk matchmaking */
  initialRatingWindow: 200,
  /** Ekspansi window rating tiap interval */
  ratingWindowExpansionStep: 50,
  /** Interval ekspansi window (ms) */
  ratingWindowExpansionIntervalMs: 3000,
  /** Timeout matchmaking sebelum assign bot (ms) */
  matchmakingTimeoutMs: 10_000,
  /** Grace period sebelum disconnect dianggap forfeit (ms) */
  disconnectGraceMs: 10_000,
  /** Jawaban benar di bawah ini (ms) di-flag mencurigakan */
  suspiciouslyFastMs: 1000,
  /** Apakah duel bot mengubah rating */
  botDuelAffectsRating: true,
} as const;

export type DuelConfig = typeof DUEL_CONFIG;
