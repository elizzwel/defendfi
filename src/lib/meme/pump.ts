import type { DexScreenerPair, PumpProbability, PumpLabel } from './types';

// ─── Pump Probability Estimator (Logistic Model) ────────────────────
//
// Pure statistical model using a logistic sigmoid function.
// No AI/ML hype — deterministic, explainable, server-side.
//
// P(pump) = sigmoid(-2.0 + 1.8×x1 + 1.5×x2 + 1.2×x3 + 0.8×x4)

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function getPumpLabel(p: number): PumpLabel {
  if (p < 25) return 'Low';
  if (p < 50) return 'Moderate';
  if (p < 75) return 'Elevated';
  return 'Extreme';
}

export function computePumpProbability(pair: DexScreenerPair): PumpProbability {
  // ── Feature 1: Volume Acceleration (0–1) ──────────────────────────
  // How much current volume exceeds the rolling average
  const vol24h = pair.volume?.h24 ?? 0;
  const vol6h = pair.volume?.h6 ?? 0;
  const avgDailyFromH6 = vol6h > 0 ? (vol6h / 6) * 24 : vol24h;
  const volumeSpike = avgDailyFromH6 > 0 ? vol24h / avgDailyFromH6 : 1;
  const volumeAcceleration = clamp(volumeSpike / 5, 0, 1); // 5× spike → 1.0

  // ── Feature 2: Liquidity Inflow (0–1) ─────────────────────────────
  // Positive price change + growing volume = likely LP adds
  const priceChange1h = pair.priceChange?.h1 ?? 0;
  const priceChange24h = pair.priceChange?.h24 ?? 0;
  const liquiditySignal = (priceChange1h > 0 ? 0.6 : 0) + (priceChange24h > 0 ? 0.4 : 0);
  const liquidityInflow = clamp(liquiditySignal, 0, 1);

  // ── Feature 3: Momentum Trend (0–1) ───────────────────────────────
  // Sustained upward momentum across timeframes
  const m5 = pair.priceChange?.m5 ?? 0;
  const h1 = pair.priceChange?.h1 ?? 0;
  const h6 = pair.priceChange?.h6 ?? 0;

  // Positive count across timeframes (0–3 → 0–1)
  const positiveCount = (m5 > 0 ? 1 : 0) + (h1 > 0 ? 1 : 0) + (h6 > 0 ? 1 : 0);
  const magnitude = clamp(Math.abs(h1) / 30, 0, 1); // 30% move → max
  const momentumTrend = clamp((positiveCount / 3) * 0.6 + magnitude * 0.4, 0, 1);

  // ── Feature 4: Holder Growth Proxy (0–1) ──────────────────────────
  // Buy count acceleration: recent buys vs historical
  const buys1h = pair.txns?.h1?.buys ?? 0;
  const buys6h = pair.txns?.h6?.buys ?? 1;
  const avgBuysPerHour = buys6h / 6;
  const buyAcceleration = avgBuysPerHour > 0 ? buys1h / avgBuysPerHour : 1;
  const holderGrowth = clamp(buyAcceleration / 3, 0, 1); // 3× acceleration → 1.0

  // ── Logistic Model ────────────────────────────────────────────────
  const z =
    -2.0 +
    1.8 * volumeAcceleration +
    1.5 * liquidityInflow +
    1.2 * momentumTrend +
    0.8 * holderGrowth;

  const probability = Math.round(sigmoid(z) * 100);

  return {
    probability,
    label: getPumpLabel(probability),
    features: {
      volumeAcceleration: parseFloat(volumeAcceleration.toFixed(3)),
      liquidityInflow: parseFloat(liquidityInflow.toFixed(3)),
      momentumTrend: parseFloat(momentumTrend.toFixed(3)),
      holderGrowth: parseFloat(holderGrowth.toFixed(3)),
    },
  };
}
