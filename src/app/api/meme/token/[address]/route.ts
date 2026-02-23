import { NextRequest, NextResponse } from 'next/server';
import type { DexScreenerPair, TokenDetail } from '@/lib/meme/types';
import { cacheGet, cacheSet } from '@/lib/meme/cache';
import { computeVolatilityScore, getRiskLevel } from '@/lib/meme/scoring';
import { generateInsight } from '@/lib/meme/insight';

function formatAge(ms: number): string {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)}d`;
  return `${Math.round(days / 30)}mo`;
}

function buildTokenDetail(pair: DexScreenerPair): TokenDetail {
  const price = parseFloat(pair.priceUsd || '0');
  const priceChange24h = pair.priceChange?.h24 ?? 0;
  const priceChange1h = pair.priceChange?.h1 ?? 0;
  const priceChange7d = 0; // DexScreener free API doesn't expose 7d; default 0
  const volume24h = pair.volume?.h24 ?? 0;
  const volumeH1 = pair.volume?.h1 ?? 0;
  const volumeH6 = pair.volume?.h6 ?? 0;
  const liquidity = pair.liquidity?.usd ?? 0;
  const fdv = pair.fdv ?? 0;
  const marketCap = pair.marketCap ?? 0;
  const ageMs = pair.pairCreatedAt
    ? Date.now() - pair.pairCreatedAt
    : 30 * 24 * 60 * 60 * 1000;

  // Volume spike ratio: h1 volume vs average hourly from h6
  const avgH6PerHour = volumeH6 > 0 ? volumeH6 / 6 : 1;
  const volumeSpikeRatio = parseFloat((volumeH1 / avgH6PerHour).toFixed(2));

  // Approximate avgVolume7d from h6 bucket (extrapolate to daily)
  const avgVolume7d = volumeH6 > 0 ? (volumeH6 / 6) * 24 : volume24h;

  // Approximate liquidity change % from price momentum
  const liquidityChange24hPct = Math.abs(priceChange24h) * 0.6;

  const volatilityScore = computeVolatilityScore({
    priceChange24h,
    volume24h,
    avgVolume7d,
    liquidityChange24hPct,
    ageMs,
  });

  const riskLevel = getRiskLevel(volatilityScore);

  const symbol = pair.baseToken.symbol;

  const aiInsight = generateInsight({
    symbol,
    priceChange24h,
    priceChange1h,
    liquidity,
    volume24h,
    volatilityScore,
    riskLevel,
    ageMs,
  });

  return {
    address: pair.baseToken.address,
    name: pair.baseToken.name,
    symbol,
    chain: pair.chainId,
    pairAddress: pair.pairAddress,
    dexUrl: pair.url,
    price,
    priceChange24h,
    priceChange1h,
    priceChange7d,
    volume24h,
    liquidity,
    fdv,
    marketCap,
    age: formatAge(ageMs),
    ageMs,
    volatilityScore,
    riskLevel,
    liquidityDepth: liquidity,
    volumeSpikeRatio,
    aiInsight,
    imageUrl: pair.info?.imageUrl,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const cacheKey = `meme:token:${address}`;

    // 1. Check cache
    const cached = cacheGet<TokenDetail>(cacheKey);
    if (cached) {
      return NextResponse.json({ token: cached });
    }

    // 2. Fetch from DexScreener
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { headers: { Accept: 'application/json' }, next: { revalidate: 0 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'DexScreener API error', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    const pairs: DexScreenerPair[] = data.pairs ?? [];

    if (pairs.length === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Use highest-liquidity pair
    const bestPair = pairs.reduce((a, b) =>
      (a.liquidity?.usd ?? 0) > (b.liquidity?.usd ?? 0) ? a : b
    );

    const token = buildTokenDetail(bestPair);

    // 3. Cache
    cacheSet(cacheKey, token);

    return NextResponse.json({ token });
  } catch (err) {
    console.error('[Degen Radar] Token detail route error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
