import type { RiskLevel } from './types';

// ─── AI Insight Generator ───────────────────────────────────────────

/**
 * Generate a short, professional AI-style insight string based on
 * token metrics. No external LLM required — template-based.
 */
export function generateInsight(params: {
  symbol: string;
  priceChange24h: number;
  priceChange1h: number;
  liquidity: number;
  volume24h: number;
  volatilityScore: number;
  riskLevel: RiskLevel;
  ageMs: number;
}): string {
  const {
    symbol,
    priceChange24h,
    priceChange1h,
    liquidity,
    volume24h,
    volatilityScore,
    riskLevel,
    ageMs,
  } = params;

  const parts: string[] = [];

  // Volatility assessment
  if (volatilityScore >= 80) {
    parts.push(`${symbol} shows extreme volatility with a score of ${volatilityScore}/100.`);
  } else if (volatilityScore >= 60) {
    parts.push(`${symbol} displays elevated volatility (score: ${volatilityScore}/100).`);
  } else if (volatilityScore >= 30) {
    parts.push(`${symbol} exhibits moderate volatility patterns (score: ${volatilityScore}/100).`);
  } else {
    parts.push(`${symbol} is currently showing stable conditions (score: ${volatilityScore}/100).`);
  }

  // Liquidity assessment
  if (liquidity < 50_000) {
    parts.push(`Liquidity is critically thin at $${formatCompact(liquidity)} — exit risk is very high.`);
  } else if (liquidity < 500_000) {
    parts.push(`Liquidity sits below $500k at $${formatCompact(liquidity)}, indicating limited depth.`);
  } else if (liquidity > 5_000_000) {
    parts.push(`Strong liquidity depth at $${formatCompact(liquidity)} provides reasonable stability.`);
  }

  // Price momentum
  if (Math.abs(priceChange1h) > 10) {
    const dir = priceChange1h > 0 ? 'surged' : 'dropped';
    parts.push(`Price ${dir} ${Math.abs(priceChange1h).toFixed(1)}% in the last hour.`);
  }

  if (Math.abs(priceChange24h) > 50) {
    const dir = priceChange24h > 0 ? 'up' : 'down';
    parts.push(`24h movement of ${dir} ${Math.abs(priceChange24h).toFixed(1)}% signals speculative momentum.`);
  }

  // Volume assessment
  const volLiqRatio = liquidity > 0 ? volume24h / liquidity : 0;
  if (volLiqRatio > 5) {
    parts.push(`Volume-to-liquidity ratio at ${volLiqRatio.toFixed(1)}x suggests heavy speculative activity.`);
  }

  // Age warning
  const ageHours = ageMs / (1000 * 60 * 60);
  if (ageHours < 24) {
    parts.push(`Token pair is less than 24 hours old — extreme caution advised.`);
  } else if (ageHours < 72) {
    parts.push(`Token pair launched within the last 3 days.`);
  }

  // Risk conclusion
  parts.push(`Short-term risk profile: ${riskLevel}.`);

  return parts.join(' ');
}

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}
