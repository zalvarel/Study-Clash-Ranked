/**
 * Konstanta aturan duel — ubah di sini untuk mengubah seluruh game.
 * Aman diimpor oleh klien maupun server.
 */

export const DUEL_CONFIG = {
  questionsPerDuel: 5,
  timeLimitSec: 30,
  basePoints: 100,
  maxSpeedBonus: 50,
  initialRating: 1000,
  kFactorEarlyGames: 40,
  kFactorNormal: 20,
  earlyGamesThreshold: 10,
  botRatingMultiplier: 0.5,
  initialRatingWindow: 200,
  ratingWindowExpansionStep: 50,
  ratingWindowExpansionIntervalMs: 3000,
  matchmakingTimeoutMs: 10_000,
  disconnectGraceMs: 10_000,
  suspiciouslyFastMs: 1000,
  /** false: duel lawan bot (latihan) tidak mengubah rating dan games_played. */
  botDuelAffectsRating: false,
} as const;

export type DuelConfig = typeof DUEL_CONFIG;
