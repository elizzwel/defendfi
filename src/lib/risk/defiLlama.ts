import type { Protocol, ProtocolWithRisk } from './types';
import { computeRiskScore } from './scorer';

const DEFILLAMA_BASE = 'https://api.llama.fi';

interface DeFiLlamaProtocol {
  id: string;
  name: string;
  slug: string;
  chain: string;
  chains: string[];
  tvl: number;
  change_7d: number;
  change_1d: number;
  category: string;
  logo?: string;
  url?: string;
}

/**
 * Fetch top protocols from DeFiLlama public API.
 * Returns normalized Protocol objects sorted by TVL descending.
 */
export async function fetchTopProtocols(limit = 50): Promise<Protocol[]> {
  const res = await fetch(`${DEFILLAMA_BASE}/protocols`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!res.ok) {
    throw new Error(`DeFiLlama API error: ${res.status}`);
  }

  const data: DeFiLlamaProtocol[] = await res.json();

  return data
    .filter((p) => p.tvl > 0 && p.name)
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, limit)
    .map(normalizeProtocol);
}

/**
 * Fetch protocols enriched with risk scores.
 * Volatility and whale concentration are estimated from available data.
 */
export async function fetchProtocolsWithRisk(limit = 30): Promise<ProtocolWithRisk[]> {
  const protocols = await fetchTopProtocols(limit);

  return protocols.map((protocol) => {
    // Estimate volatility from TVL change magnitude
    const volatility = estimateVolatility(protocol.tvlChange7d);
    // Estimate whale concentration (DeFiLlama doesn't expose this directly)
    const whaleConcentration = estimateWhaleConcentration(protocol.tvl);

    const riskScore = computeRiskScore({
      tvl: protocol.tvl,
      tvlChange7d: protocol.tvlChange7d,
      volatility,
      whaleConcentration,
    });

    return {
      ...protocol,
      riskScore,
      volatility,
      whaleConcentration,
    };
  });
}

function normalizeProtocol(p: DeFiLlamaProtocol): Protocol {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    chain: p.chain ?? 'Multi',
    chains: p.chains ?? [p.chain ?? 'Ethereum'],
    tvl: p.tvl ?? 0,
    tvlChange7d: p.change_7d ?? 0,
    category: p.category ?? 'DeFi',
    logo: p.logo,
    url: p.url,
  };
}

/**
 * Estimate volatility from TVL change.
 * Large swings in either direction = higher volatility.
 */
function estimateVolatility(change7d: number): number {
  const absChange = Math.abs(change7d);
  if (absChange > 50) return 85;
  if (absChange > 30) return 70;
  if (absChange > 15) return 55;
  if (absChange > 5) return 35;
  return 20;
}

/**
 * Estimate whale concentration from TVL.
 * Smaller protocols tend to have higher concentration.
 */
function estimateWhaleConcentration(tvl: number): number {
  if (tvl < 1_000_000) return 75;
  if (tvl < 10_000_000) return 60;
  if (tvl < 100_000_000) return 45;
  if (tvl < 1_000_000_000) return 30;
  return 20;
}

/**
 * Format TVL for display.
 */
export function formatTvl(tvl: number): string {
  if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(2)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(1)}K`;
  return `$${tvl.toFixed(0)}`;
}
