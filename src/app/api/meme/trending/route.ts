import { NextResponse } from 'next/server';
import type { DexScreenerPair, MemeToken } from '@/lib/meme/types';
import { cacheGet, cacheSet } from '@/lib/meme/cache';
import { computeVolatilityScore, getRiskLevel } from '@/lib/meme/scoring';
import { getSupabaseClient } from '@/lib/supabase';

const CACHE_KEY = 'meme:trending';
const DEXSCREENER_URL = 'https://api.dexscreener.com/latest/dex/search?q=trending';

function formatAge(ms: number): string {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)}d`;
  return `${Math.round(days / 30)}mo`;
}

function normalizePair(pair: DexScreenerPair): MemeToken {
  const price = parseFloat(pair.priceUsd || '0');
  const priceChange24h = pair.priceChange?.h24 ?? 0;
  const priceChange1h = pair.priceChange?.h1 ?? 0;
  const volume24h = pair.volume?.h24 ?? 0;
  const volumeH6 = pair.volume?.h6 ?? 0;
  const liquidity = pair.liquidity?.usd ?? 0;
  const fdv = pair.fdv ?? 0;
  const marketCap = pair.marketCap ?? 0;
  const ageMs = pair.pairCreatedAt
    ? Date.now() - pair.pairCreatedAt
    : 30 * 24 * 60 * 60 * 1000; // default 30d if unknown

  // Approximate avgVolume7d from h6 bucket (extrapolate to daily, assume stable)
  const avgVolume7d = volumeH6 > 0 ? (volumeH6 / 6) * 24 : volume24h;

  // Approximate liquidity change % from price momentum (correlated proxy)
  // When price drops hard, liquidity typically drains; when price pumps, LPs add
  const liquidityChange24hPct = Math.abs(priceChange24h) * 0.6;

  const volatilityScore = computeVolatilityScore({
    priceChange24h,
    volume24h,
    avgVolume7d,
    liquidityChange24hPct,
    ageMs,
  });

  return {
    address: pair.baseToken.address,
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    chain: pair.chainId,
    pairAddress: pair.pairAddress,
    dexUrl: pair.url,
    price,
    priceChange24h,
    priceChange1h,
    volume24h,
    liquidity,
    fdv,
    marketCap,
    age: formatAge(ageMs),
    ageMs,
    volatilityScore,
    riskLevel: getRiskLevel(volatilityScore),
    imageUrl: pair.info?.imageUrl,
  };
}

async function persistToSupabase(tokens: MemeToken[]) {
  try {
    const client = getSupabaseClient();
    if (!client) return;

    const rows = tokens.map((t) => ({
      token_address: t.address,
      chain: t.chain,
      symbol: t.symbol,
      name: t.name,
      price: t.price,
      price_change_24h: t.priceChange24h,
      volume_24h: t.volume24h,
      liquidity: t.liquidity,
      fdv: t.fdv,
      volatility_score: t.volatilityScore,
      risk_level: t.riskLevel,
    }));

    await client.from('meme_snapshots').insert(rows);
  } catch {
    // Non-critical — don't break the response if Supabase fails
    console.warn('[Degen Radar] Supabase snapshot persistence failed');
  }
}

export async function GET() {
  try {
    // 1. Check cache
    const cached = cacheGet<MemeToken[]>(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ tokens: cached });
    }

    // 2. Fetch from DexScreener
    const res = await fetch(DEXSCREENER_URL, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'DexScreener API error', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    const pairs: DexScreenerPair[] = data.pairs ?? [];

    // 3. Normalize & score
    const tokens = pairs.map(normalizePair);

    // 4. Cache
    cacheSet(CACHE_KEY, tokens);

    // 5. Persist snapshot (fire & forget)
    persistToSupabase(tokens);

    return NextResponse.json({ tokens });
  } catch (err) {
    console.error('[Degen Radar] Trending route error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
