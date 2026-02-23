import { NextRequest, NextResponse } from 'next/server';
import type { DexScreenerPair, ChartDataPoint, ChartInterval } from '@/lib/meme/types';
import { cacheGet, cacheSet } from '@/lib/meme/cache';

const VALID_INTERVALS: ChartInterval[] = ['15m', '1h', '4h', '1D'];

/**
 * Generate synthetic chart data from the DexScreener pair data.
 * DexScreener's free API doesn't return OHLCV candles, so we build
 * an approximated time series using available price-change buckets.
 */
function generateChartData(
  pair: DexScreenerPair,
  interval: ChartInterval
): ChartDataPoint[] {
  const price = parseFloat(pair.priceUsd || '0');
  const now = Date.now();
  const liquidity = pair.liquidity?.usd ?? 0;

  // Number of data points & step duration per interval
  const config: Record<ChartInterval, { points: number; stepMs: number }> = {
    '15m': { points: 30, stepMs: 30_000 },        // 30 × 30s = 15 min
    '1h':  { points: 60, stepMs: 60_000 },         // 60 × 1m = 1h
    '4h':  { points: 48, stepMs: 5 * 60_000 },     // 48 × 5m = 4h
    '1D':  { points: 96, stepMs: 15 * 60_000 },    // 96 × 15m = 24h
  };

  const { points, stepMs } = config[interval];

  // Use known price change percentages to create time-based interpolation
  const change5m = pair.priceChange?.m5 ?? 0;
  const change1h = pair.priceChange?.h1 ?? 0;
  const change6h = pair.priceChange?.h6 ?? 0;
  const change24h = pair.priceChange?.h24 ?? 0;

  // Approximate start price based on the total interval change
  let totalPct: number;
  switch (interval) {
    case '15m': totalPct = change5m * 3; break;
    case '1h':  totalPct = change1h; break;
    case '4h':  totalPct = change6h * 0.67; break;
    case '1D':  totalPct = change24h; break;
  }

  const startPrice = price / (1 + totalPct / 100);

  // Volume distribution — use known buckets
  const totalVolume =
    interval === '15m' ? (pair.volume?.m5 ?? 0) * 3 :
    interval === '1h'  ? pair.volume?.h1 ?? 0 :
    interval === '4h'  ? pair.volume?.h6 ?? 0 :
                         pair.volume?.h24 ?? 0;

  const avgVolPerPoint = totalVolume / points;

  // Build the curve with slight randomness for realistic look
  const dataPoints: ChartDataPoint[] = [];
  let seed = 42; // deterministic pseudo-random for consistency during cache window
  const pseudoRandom = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed / 2147483647) - 0.5; // -0.5 to 0.5
  };

  for (let i = 0; i < points; i++) {
    const t = i / (points - 1); // 0 → 1 progress
    const time = now - (points - 1 - i) * stepMs;

    // Smooth interpolation from startPrice → price with noise
    const basePrice = startPrice + (price - startPrice) * t;
    const noise = basePrice * 0.005 * pseudoRandom(); // ±0.25 % noise
    const pointPrice = Math.max(0, basePrice + noise);

    // Volume with some variation
    const volNoise = 1 + pseudoRandom() * 0.6; // 0.7–1.3x
    const pointVolume = Math.max(0, avgVolPerPoint * volNoise);

    // Volatility bands (±2 standard deviations approximation)
    const bandWidth = pointPrice * (Math.abs(totalPct) / 100) * 0.3;
    const upperBand = pointPrice + bandWidth;
    const lowerBand = Math.max(0, pointPrice - bandWidth);

    dataPoints.push({
      time,
      price: parseFloat(pointPrice.toFixed(12)),
      volume: parseFloat(pointVolume.toFixed(2)),
      liquidity,
      upperBand: parseFloat(upperBand.toFixed(12)),
      lowerBand: parseFloat(lowerBand.toFixed(12)),
    });
  }

  return dataPoints;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const interval = (searchParams.get('interval') || '1h') as ChartInterval;

    if (!VALID_INTERVALS.includes(interval)) {
      return NextResponse.json(
        { error: `Invalid interval. Use: ${VALID_INTERVALS.join(', ')}` },
        { status: 400 }
      );
    }

    const cacheKey = `meme:chart:${address}:${interval}`;

    // 1. Check cache
    const cached = cacheGet<ChartDataPoint[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ chart: cached });
    }

    // 2. Fetch token data from DexScreener
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

    const chart = generateChartData(bestPair, interval);

    // 3. Cache
    cacheSet(cacheKey, chart);

    return NextResponse.json({ chart });
  } catch (err) {
    console.error('[Degen Radar] Chart route error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
