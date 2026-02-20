import type { RiskParams, RiskScore, RiskLevel } from './types';

/**
 * Compute a composite risk score from protocol parameters.
 * Score: 0 = safest, 100 = most risky.
 * Pure function — no side effects, no UI dependencies.
 */
export function computeRiskScore(params: RiskParams): RiskScore {
  // TVL Risk: lower TVL = higher risk (log scale)
  // < $1M = 80, $1M-$10M = 60, $10M-$100M = 40, $100M-$1B = 20, >$1B = 5
  const tvlRisk = computeTvlRisk(params.tvl);

  // Momentum Risk: large negative TVL change = high risk
  const momentumRisk = computeMomentumRisk(params.tvlChange7d);

  // Volatility Risk: direct mapping 0-100
  const volatilityRisk = Math.min(100, Math.max(0, params.volatility));

  // Whale Risk: high concentration = high risk
  const whaleRisk = computeWhaleRisk(params.whaleConcentration);

  // Audit bonus: if provided, reduce score
  const auditBonus = params.auditScore !== undefined
    ? (params.auditScore / 100) * 15
    : 0;

  // Weighted composite
  const rawScore =
    tvlRisk * 0.25 +
    momentumRisk * 0.30 +
    volatilityRisk * 0.25 +
    whaleRisk * 0.20 -
    auditBonus;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));
  const level = getRiskLevel(score);

  return {
    score,
    level,
    breakdown: {
      tvlRisk: Math.round(tvlRisk),
      volatilityRisk: Math.round(volatilityRisk),
      whaleRisk: Math.round(whaleRisk),
      momentumRisk: Math.round(momentumRisk),
    },
  };
}

function computeTvlRisk(tvl: number): number {
  if (tvl <= 0) return 95;
  if (tvl < 1_000_000) return 80;
  if (tvl < 10_000_000) return 60;
  if (tvl < 100_000_000) return 40;
  if (tvl < 1_000_000_000) return 20;
  return 5;
}

function computeMomentumRisk(change7d: number): number {
  // change7d is a percentage, e.g. -50 means TVL dropped 50%
  if (change7d <= -50) return 90;
  if (change7d <= -30) return 75;
  if (change7d <= -15) return 60;
  if (change7d <= -5) return 45;
  if (change7d <= 0) return 35;
  if (change7d <= 10) return 25;
  if (change7d <= 30) return 15;
  return 10; // Very high growth — could be suspicious but generally positive
}

function computeWhaleRisk(whaleConcentration: number): number {
  // % of TVL held by top 10 wallets
  if (whaleConcentration >= 80) return 90;
  if (whaleConcentration >= 60) return 70;
  if (whaleConcentration >= 40) return 50;
  if (whaleConcentration >= 20) return 30;
  return 15;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score < 35) return 'low';
  if (score < 65) return 'medium';
  return 'high';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
  }
}

export function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'rgba(16, 185, 129, 0.1)';
    case 'medium': return 'rgba(245, 158, 11, 0.1)';
    case 'high': return 'rgba(239, 68, 68, 0.1)';
  }
}

export function getRiskTextColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'text-emerald-400';
    case 'medium': return 'text-amber-400';
    case 'high': return 'text-red-400';
  }
}

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
  }
}
