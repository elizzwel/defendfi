'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProtocolsWithRisk } from '@/lib/risk/defiLlama';
import type { ProtocolWithRisk, RiskLevel } from '@/lib/risk/types';

export function useProtocols(limit = 30) {
  return useQuery({
    queryKey: ['protocols', limit],
    queryFn: () => fetchProtocolsWithRisk(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

export function useFilteredProtocols(filter: RiskLevel | 'all' = 'all', limit = 30) {
  const { data, ...rest } = useProtocols(limit);

  const filtered: ProtocolWithRisk[] = (data ?? []).filter((p) => {
    if (filter === 'all') return true;
    return p.riskScore.level === filter;
  });

  return { data: filtered, ...rest };
}
