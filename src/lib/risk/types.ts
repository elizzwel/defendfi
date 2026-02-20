// Risk types for the DefendFi risk engine

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskParams {
  tvl: number;           // Total Value Locked in USD
  tvlChange7d: number;   // 7-day TVL change as percentage (-100 to +inf)
  volatility: number;    // Volatility index 0-100
  whaleConcentration: number; // % of TVL held by top 10 wallets (0-100)
  auditScore?: number;   // Audit quality 0-100 (higher = better)
}

export interface RiskScore {
  score: number;         // 0-100 (higher = riskier)
  level: RiskLevel;
  breakdown: {
    tvlRisk: number;
    volatilityRisk: number;
    whaleRisk: number;
    momentumRisk: number;
  };
}

export interface Protocol {
  id: string;
  name: string;
  slug: string;
  chain: string;
  chains: string[];
  tvl: number;
  tvlChange7d: number;
  category: string;
  logo?: string;
  url?: string;
}

export interface ProtocolWithRisk extends Protocol {
  riskScore: RiskScore;
  volatility: number;
  whaleConcentration: number;
}

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
  balanceFormatted: number;
  usdValue: number;
  logoURI?: string;
  chainId: number;
}

export interface PortfolioSummary {
  totalUsdValue: number;
  change24h: number;
  change24hPercent: number;
  tokens: TokenBalance[];
  chainDistribution: ChainDistribution[];
  allocationByToken: TokenAllocation[];
}

export interface ChainDistribution {
  chainId: number;
  chainName: string;
  usdValue: number;
  percentage: number;
  color: string;
}

export interface TokenAllocation {
  symbol: string;
  usdValue: number;
  percentage: number;
  color: string;
}

export interface Alert {
  id: string;
  user_address: string;
  protocol: string;
  condition: string;
  threshold: number | null;
  enabled: boolean;
  created_at: string;
}

export interface AlertCreate {
  user_address: string;
  protocol: string;
  condition: string;
  threshold?: number | null;
  enabled?: boolean;
}
