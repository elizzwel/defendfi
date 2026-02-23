import type { RiskLevel } from './types';

// ─── Volatility Scoring Engine (Full Degen Mode) ────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute a 0–100 volatility score.
 *
 *  Metric 1 — Price Momentum        (35%)
 *  Metric 2 — Volume Acceleration   (25%)
 *  Metric 3 — Liquidity Instability (25%)
 *  Metric 4 — Token Age Risk        (15%)
 */
export function computeVolatilityScore(params: {
  priceChange24h: number;           // percentage, e.g. -42.5
  volume24h: number;
  avgVolume7d: number;              // average daily vol over 7d (approx)
  liquidityChange24hPct: number;    // absolute liquidity change %, e.g. 18.5
  ageMs: number;                    // milliseconds since pair creation
}): number {
  const { priceChange24h, volume24h, avgVolume7d, liquidityChange24hPct, ageMs } = params;

  // ── Metric 1: Price Momentum (35%) ────────────────────────────────
  // Large % moves = high volatility
  const priceScore = clamp(Math.abs(priceChange24h) * 1.5, 0, 100);

  // ── Metric 2: Volume Acceleration (25%) ───────────────────────────
  // 5×  spike = extreme momentum
  const volumeSpike = avgVolume7d > 0 ? volume24h / avgVolume7d : 5;
  const volumeScore = clamp(volumeSpike * 20, 0, 100);

  // ── Metric 3: Liquidity Instability (25%) ─────────────────────────
  // Liquidity drop = higher instability
  const liquidityScore = clamp(Math.abs(liquidityChange24hPct) * 2, 0, 100);

  // ── Metric 4: Token Age Risk (15%) ────────────────────────────────
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const ageScore =
    ageDays < 7 ? 100 :
    ageDays < 30 ? 70 :
    ageDays < 90 ? 40 : 15;

  // ── Final Score ───────────────────────────────────────────────────
  const raw =
    priceScore   * 0.35 +
    volumeScore  * 0.25 +
    liquidityScore * 0.25 +
    ageScore     * 0.15;

  return Math.round(clamp(raw, 0, 100));
}

/**
 * Map a volatility score to a risk level label.
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Medium';
  if (score <= 80) return 'High';
  return 'Extreme';
}
