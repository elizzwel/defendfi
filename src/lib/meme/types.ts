// ─── Degen Radar Types ──────────────────────────────────────────────

/** Risk severity derived from volatility score */
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extreme';

/** Raw pair shape from DexScreener API */
export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    websites?: { url: string }[];
    socials?: { type: string; url: string }[];
  };
}

/** Normalised token for the trending table */
export interface MemeToken {
  address: string;
  name: string;
  symbol: string;
  chain: string;
  pairAddress: string;
  dexUrl: string;
  price: number;
  priceChange24h: number;
  priceChange1h: number;
  volume24h: number;
  liquidity: number;
  fdv: number;
  marketCap: number;
  age: string;          // human-readable e.g. "3d", "12h"
  ageMs: number;        // milliseconds since creation
  volatilityScore: number;
  riskLevel: RiskLevel;
  imageUrl?: string;
}

/** Extended token detail for intelligence panel */
export interface TokenDetail extends MemeToken {
  priceChange7d: number;
  liquidityDepth: number;
  volumeSpikeRatio: number;   // h1 volume / h6 avg
  aiInsight: string;
  whaleActivity: WhaleActivity;
  pumpProbability: PumpProbability;
}

/** Whale activity metrics derived from txn data */
export interface WhaleActivity {
  netInflow24h: number;       // -1 to +1 (sell-heavy to buy-heavy)
  avgTxSize: number;          // avg $ per transaction
  buyPressure: number;        // 0–100 (% of txns that are buys)
  largestEstTx: number;       // estimated largest single tx ($)
  whaleConcentration: number; // 0–100 score
  riskLabel: WhaleRiskLabel;
}

export type WhaleRiskLabel = 'Neutral' | 'Accumulating' | 'Distributing';

/** Pump probability from logistic model */
export interface PumpProbability {
  probability: number;        // 0–100
  label: PumpLabel;
  features: {
    volumeAcceleration: number;
    liquidityInflow: number;
    momentumTrend: number;
    holderGrowth: number;
  };
}

export type PumpLabel = 'Low' | 'Moderate' | 'Elevated' | 'Extreme';

/** Single chart data point */
export interface ChartDataPoint {
  time: number;         // unix timestamp ms
  price: number;
  volume: number;
  liquidity: number;
  upperBand?: number;
  lowerBand?: number;
}

/** Chart interval options */
export type ChartInterval = '15m' | '1h' | '4h' | '1D';

