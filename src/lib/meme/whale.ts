import type { DexScreenerPair, WhaleActivity, WhaleRiskLabel } from './types';

// ─── Whale Activity Engine (Proxy Model) ────────────────────────────
//
// Derives whale-like signals from DexScreener transaction counts and
// volume data. This is a proxy — it estimates whale behaviour from
// aggregate buy/sell pressure rather than individual wallet addresses.

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function computeWhaleMetrics(pair: DexScreenerPair): WhaleActivity {
  // ── Transaction counts ────────────────────────────────────────────
  const buys1h = pair.txns?.h1?.buys ?? 0;
  const sells1h = pair.txns?.h1?.sells ?? 0;
  const total1h = buys1h + sells1h;

  const buys24h = pair.txns?.h24?.buys ?? 0;
  const sells24h = pair.txns?.h24?.sells ?? 0;
  const total24h = buys24h + sells24h;

  // ── Volume data ───────────────────────────────────────────────────
  const vol1h = pair.volume?.h1 ?? 0;
  const vol24h = pair.volume?.h24 ?? 0;

  // ── Net Inflow (-1 to +1) ─────────────────────────────────────────
  // Positive = more buying than selling (whale accumulation signal)
  const netInflow24h = total24h > 0
    ? (buys24h - sells24h) / total24h
    : 0;

  // ── Average Transaction Size ($) ──────────────────────────────────
  const avgTxSize = total1h > 0 ? vol1h / total1h : 0;

  // ── Buy Pressure (0–100) ──────────────────────────────────────────
  const buyPressure = total24h > 0
    ? Math.round((buys24h / total24h) * 100)
    : 50;

  // ── Estimated Largest Tx ──────────────────────────────────────────
  // Heuristic: if avg tx is $X, top whale tx is roughly 10–50× avg
  // We use a conservative 8× multiplier scaled by volume concentration
  const volumeConcentration = total1h > 0 ? vol1h / Math.max(total1h, 1) : 0;
  const largestEstTx = Math.round(avgTxSize * Math.min(8, 1 + (volumeConcentration / 1000)));

  // ── Whale Concentration Score (0–100) ─────────────────────────────
  // High avg tx + skewed buy/sell = likely whale activity
  const txSizeScore = clamp(avgTxSize / 200, 0, 1);      // $20K+ → 100
  const skewScore = Math.abs(netInflow24h);               // 0–1
  const whaleConcentration = Math.round(
    clamp((txSizeScore * 60 + skewScore * 40), 0, 100)
  );

  // ── Risk Label ────────────────────────────────────────────────────
  let riskLabel: WhaleRiskLabel = 'Neutral';
  if (netInflow24h > 0.15 && buyPressure > 55) {
    riskLabel = 'Accumulating';
  } else if (netInflow24h < -0.15 && buyPressure < 45) {
    riskLabel = 'Distributing';
  }

  return {
    netInflow24h: parseFloat(netInflow24h.toFixed(3)),
    avgTxSize: parseFloat(avgTxSize.toFixed(2)),
    buyPressure,
    largestEstTx,
    whaleConcentration,
    riskLabel,
  };
}
