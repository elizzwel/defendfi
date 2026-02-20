'use client';

import { useState } from 'react';
import { useFilteredProtocols } from '@/hooks/useProtocols';
import { GlassCard } from '@/components/ui/GlassCard';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { RiskScoreCell } from '@/components/ui/RiskScoreCell';
import { formatTvl } from '@/lib/risk/defiLlama';
import { formatPercent, cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/risk/types';
import { ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

type FilterType = 'all' | RiskLevel;

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export default function RiskMonitorPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const { data: protocols, isLoading } = useFilteredProtocols(filter, 50);

  const filtered = (protocols ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    low: (protocols ?? []).filter((p) => p.riskScore.level === 'low').length,
    medium: (protocols ?? []).filter((p) => p.riskScore.level === 'medium').length,
    high: (protocols ?? []).filter((p) => p.riskScore.level === 'high').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-10 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-section">Risk Monitor</h1>
        <p className="text-data-secondary mt-0.5">Live protocol risk analysis across DeFi</p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Low Risk', count: counts.low, color: 'text-emerald-500' },
          { label: 'Medium Risk', count: counts.medium, color: 'text-amber-500' },
          { label: 'High Risk', count: counts.high, color: 'text-red-500' },
        ].map(({ label, count, color }) => (
          <GlassCard key={label} className="px-5 py-4">
            <p className="text-table-header mb-1.5">{label}</p>
            <p className={`text-stat num leading-none ${color}`}>
              {isLoading ? '—' : count}
            </p>
            <p className="text-micro mt-1">protocols</p>
          </GlassCard>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-1.5 p-1 rounded-xl border border-[var(--border)]"
          style={{ background: 'var(--surface)' }}
        >
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors',
                filter === value
                  ? 'bg-black/[0.06] dark:bg-white/[0.08]'
                  : 'hover:bg-black/[0.04] dark:hover:text-zinc-300'
              )}
              style={{
                color: filter === value ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {label}
              {value !== 'all' && (
                <span className="ml-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {counts[value as RiskLevel]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search protocols..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'pl-8 pr-4 py-2 rounded-xl border border-[var(--border)] text-[13px]',
              'placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-violet-500/30 transition-all w-52',
              'bg-[var(--surface)]'
            )}
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>
      </div>

      {/* Table */}
      <GlassCard padding={false}>
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <p className="text-card-heading">Protocols</p>
          <span className="text-micro tabular-nums">
            {filtered.length} results
          </span>
        </div>

        {isLoading ? (
          <div className="px-6 py-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-11 rounded-xl bg-black/[0.04] dark:bg-white/[0.03] animate-pulse"
                style={{ opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Protocol', 'TVL', 'Volatility', 'Whale %', 'Risk Score'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-table-header"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((protocol) => (
                  <tr
                    key={protocol.id}
                    className="border-t border-[var(--border)] hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors"
                  >
                    {/* Protocol */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {protocol.logo ? (
                          <img
                            src={protocol.logo}
                            alt={protocol.name}
                            className="w-7 h-7 rounded-full bg-black/[0.05] dark:bg-white/[0.05] flex-shrink-0 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-violet-600/[0.15] flex items-center justify-center text-[11px] font-bold text-violet-400 flex-shrink-0">
                            {protocol.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-data-primary leading-tight">{protocol.name}</p>
                          <p className="text-micro mt-0.5">{protocol.chain}</p>
                        </div>
                      </div>
                    </td>

                    {/* TVL */}
                    <td className="px-6 py-4">
                      <p className="text-data-primary num">{formatTvl(protocol.tvl)}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {protocol.tvlChange7d >= 0 ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-red-500" />
                        )}
                        <span
                          className={`text-[11px] num ${
                            protocol.tvlChange7d >= 0 ? 'text-emerald-500' : 'text-red-500'
                          }`}
                        >
                          {formatPercent(protocol.tvlChange7d)} 7d
                        </span>
                      </div>
                    </td>

                    {/* Volatility */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-14 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div
                            className={`h-full rounded-full ${
                              protocol.volatility < 35
                                ? 'bg-emerald-400'
                                : protocol.volatility < 65
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                            }`}
                            style={{ width: `${protocol.volatility}%` }}
                          />
                        </div>
                        <span className="text-[12px] num" style={{ color: 'var(--text-secondary)' }}>
                          {protocol.volatility}
                        </span>
                      </div>
                    </td>

                    {/* Whale % */}
                    <td className="px-6 py-4">
                      <span className="text-[13px] num" style={{ color: 'var(--text-secondary)' }}>
                        {protocol.whaleConcentration.toFixed(0)}%
                      </span>
                    </td>

                    {/* Risk score */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <RiskScoreCell
                          score={protocol.riskScore.score}
                          level={protocol.riskScore.level}
                        />
                        <RiskBadge level={protocol.riskScore.level} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <p className="text-data-secondary">No protocols match your filters</p>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
