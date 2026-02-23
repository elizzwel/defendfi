'use client';

import { useQuery } from '@tanstack/react-query';
import type { MemeToken, TokenDetail, ChartDataPoint, ChartInterval } from '@/lib/meme/types';

// ─── Trending tokens ────────────────────────────────────────────────

async function fetchTrending(): Promise<MemeToken[]> {
  const res = await fetch('/api/meme/trending');
  if (!res.ok) throw new Error('Failed to fetch trending tokens');
  const data = await res.json();
  return data.tokens ?? [];
}

export function useTrendingTokens() {
  return useQuery<MemeToken[]>({
    queryKey: ['meme', 'trending'],
    queryFn: fetchTrending,
    refetchInterval: 60_000,     // poll every 60s
    staleTime: 30_000,
  });
}

// ─── Token detail ───────────────────────────────────────────────────

async function fetchTokenDetail(address: string): Promise<TokenDetail> {
  const res = await fetch(`/api/meme/token/${address}`);
  if (!res.ok) throw new Error('Failed to fetch token detail');
  const data = await res.json();
  return data.token;
}

export function useTokenDetail(address: string | null) {
  return useQuery<TokenDetail>({
    queryKey: ['meme', 'token', address],
    queryFn: () => fetchTokenDetail(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

// ─── Chart data ─────────────────────────────────────────────────────

async function fetchChart(address: string, interval: ChartInterval): Promise<ChartDataPoint[]> {
  const res = await fetch(`/api/meme/chart/${address}?interval=${interval}`);
  if (!res.ok) throw new Error('Failed to fetch chart data');
  const data = await res.json();
  return data.chart ?? [];
}

export function useTokenChart(address: string | null, interval: ChartInterval = '1h') {
  return useQuery<ChartDataPoint[]>({
    queryKey: ['meme', 'chart', address, interval],
    queryFn: () => fetchChart(address!, interval),
    enabled: !!address,
    staleTime: 30_000,
  });
}
