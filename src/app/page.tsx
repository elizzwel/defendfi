'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import { useProtocols } from '@/hooks/useProtocols';
import { useWallet } from '@/hooks/useWallet';
import { GlassCard } from '@/components/ui/GlassCard';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { RiskScoreCell } from '@/components/ui/RiskScoreCell';
import { AllocationPie } from '@/components/charts/AllocationPie';
import { ChainBar } from '@/components/charts/ChainBar';
import { formatUsd, formatPercent } from '@/lib/utils';
import { formatTvl } from '@/lib/risk/defiLlama';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const { isConnected, address } = useWallet();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { data: protocols, isLoading: protocolsLoading } = useProtocols(10);

  const overallRisk =
    protocols && protocols.length > 0
      ? Math.round(
          protocols.slice(0, 5).reduce((sum, p) => sum + p.riskScore.score, 0) / 5
        )
      : 42;

  const riskLevel =
    overallRisk < 35 ? 'low' : overallRisk < 65 ? 'medium' : 'high';

  const portfolioValue =
    isConnected && portfolio ? portfolio.totalUsdValue : null;
  const change24h =
    isConnected && portfolio ? portfolio.change24hPercent : null;

  const showPortfolioSkeleton = portfolioLoading || (!!address && !portfolio);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-10 space-y-6">

      {/* ── Page title ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-section">Dashboard</h1>
        <p className="text-data-secondary mt-1">Real-time DeFi risk intelligence</p>
      </div>

      {/* ── Portfolio hero ─────────────────────────────────────── */}
      <GlassCard className="px-8 py-7 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-violet-600/[0.06] blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-8">

          {/* Left: value + badge */}
          <div className="min-w-0">
            <p className="text-table-header mb-3">Total Portfolio Value</p>

            {showPortfolioSkeleton ? (
              <div className="h-14 w-64 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] animate-pulse" />
            ) : portfolioValue !== null ? (
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-display num">
                  {formatUsd(portfolioValue)}
                </span>
                <RiskBadge level={riskLevel} score={overallRisk} size="lg" />
              </div>
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="text-[52px] font-bold num leading-none tracking-tight" style={{ color: 'var(--text-muted)' }}>
                  $—
                </span>
                <RiskBadge level={riskLevel} score={overallRisk} size="lg" />
              </div>
            )}

            {/* 24h change */}
            <div className="mt-3 flex items-center gap-1.5">
              {change24h !== null ? (
                <>
                  {change24h >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-[13.5px] font-medium num ${
                      change24h >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {formatPercent(change24h)} today
                  </span>
                </>
              ) : (
                <span className="text-data-secondary">
                  Connect wallet to see your portfolio
                </span>
              )}
            </div>
          </div>

          {/* Right: market risk gauge */}
          <div className="flex-shrink-0 text-right">
            <p className="text-table-header mb-3">Market Risk</p>
            <div className="flex items-center gap-3 justify-end">
              {/* Mini gauge */}
              <div className="w-24 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    riskLevel === 'low'
                      ? 'bg-emerald-400'
                      : riskLevel === 'medium'
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${overallRisk}%` }}
                />
              </div>
              <span className="text-stat num" style={{ color: 'var(--text-primary)' }}>
                {overallRisk}
              </span>
              <span className="text-data-secondary">/100</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── Stat strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Protocols Tracked',
            value: protocols ? protocols.length.toString() : '—',
            sub: 'via DeFiLlama',
          },
          {
            label: 'High Risk Protocols',
            value: protocols
              ? protocols.filter((p) => p.riskScore.level === 'high').length.toString()
              : '—',
            sub: 'need attention',
            accent: true,
          },
          {
            label: 'Avg Risk Score',
            value: protocols && protocols.length > 0
              ? Math.round(
                  protocols.reduce((s, p) => s + p.riskScore.score, 0) /
                    protocols.length
                ).toString()
              : '—',
            sub: 'across top 10',
          },
        ].map(({ label, value, sub, accent }) => (
          <GlassCard key={label} className="px-5 py-4">
            <p className="text-table-header mb-1.5">{label}</p>
            <p
              className="text-stat num leading-none"
              style={{ color: accent ? 'var(--destructive)' : 'var(--text-primary)' }}
            >
              {value}
            </p>
            <p className="text-micro mt-1">{sub}</p>
          </GlassCard>
        ))}
      </div>

      {/* ── Charts row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Allocation */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-card-heading">Token Allocation</p>
              <p className="text-micro mt-0.5">By USD value</p>
            </div>
          </div>
          {isConnected && portfolio?.allocationByToken?.length ? (
            <AllocationPie data={portfolio.allocationByToken} />
          ) : isConnected && !portfolio ? (
            <div className="flex items-center justify-center h-[220px]">
              <div className="w-32 h-4 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] animate-pulse" />
            </div>
          ) : (
            <EmptyChart label="Connect wallet to view allocation" />
          )}
        </GlassCard>

        {/* Chain distribution */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-card-heading">Chain Distribution</p>
              <p className="text-micro mt-0.5">Cross-chain exposure</p>
            </div>
          </div>
          {isConnected && portfolio?.chainDistribution?.length ? (
            <ChainBar data={portfolio.chainDistribution} />
          ) : isConnected && !portfolio ? (
            <div className="flex items-center justify-center h-[220px]">
              <div className="w-32 h-4 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] animate-pulse" />
            </div>
          ) : (
            <EmptyChart label="Connect wallet to view chains" />
          )}
        </GlassCard>
      </div>

      {/* ── Risk table ─────────────────────────────────────────── */}
      <GlassCard padding={false}>
        {/* Table header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
          <div>
            <p className="text-card-heading">Protocol Risk Monitor</p>
            <p className="text-micro mt-0.5">Live · DeFiLlama</p>
          </div>
          <span className="text-micro tabular-nums">
            {protocols ? `${protocols.length} protocols` : ''}
          </span>
        </div>

        {protocolsLoading ? (
          <SkeletonRows />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {[
                    { label: 'Protocol', w: 'w-[220px]' },
                    { label: 'Chain', w: '' },
                    { label: 'TVL', w: '' },
                    { label: '7d Change', w: '' },
                    { label: 'Risk Score', w: '' },
                  ].map(({ label, w }) => (
                    <th
                      key={label}
                      className={`px-6 py-3 text-left text-table-header ${w}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(protocols ?? []).map((protocol) => (
                  <tr
                    key={protocol.id}
                    className="group border-t border-[var(--border)] hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors"
                  >
                    {/* Protocol name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProtocolIcon name={protocol.name} logo={protocol.logo} />
                        <div>
                          <p className="text-data-primary leading-tight">{protocol.name}</p>
                          <p className="text-micro mt-0.5">{protocol.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Chain */}
                    <td className="px-6 py-4">
                      <span
                        className="text-[12px] px-2 py-0.5 rounded-md"
                        style={{
                          color: 'var(--text-secondary)',
                          background: 'var(--surface-raised)',
                        }}
                      >
                        {protocol.chain}
                      </span>
                    </td>

                    {/* TVL */}
                    <td className="px-6 py-4">
                      <span className="text-data-primary num">
                        {formatTvl(protocol.tvl)}
                      </span>
                    </td>

                    {/* 7d change */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {protocol.tvlChange7d >= 0 ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-red-500" />
                        )}
                        <span
                          className={`text-[13px] font-medium num ${
                            protocol.tvlChange7d >= 0
                              ? 'text-emerald-500'
                              : 'text-red-500'
                          }`}
                        >
                          {formatPercent(protocol.tvlChange7d)}
                        </span>
                      </div>
                    </td>

                    {/* Risk score */}
                    <td className="px-6 py-4">
                      <RiskScoreCell
                        score={protocol.riskScore.score}
                        level={protocol.riskScore.level}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function ProtocolIcon({ name, logo }: { name: string; logo?: string }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.05] flex-shrink-0 object-cover"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = 'none';
          el.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-violet-600/[0.15] flex items-center justify-center text-[12px] font-bold text-violet-400 flex-shrink-0">
      {name[0]}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] gap-3">
      <div
        className="w-12 h-12 rounded-full border border-dashed flex items-center justify-center"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--border)' }} />
      </div>
      <p className="text-micro">{label}</p>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="px-6 py-4 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-11 rounded-xl bg-black/[0.04] dark:bg-white/[0.03] animate-pulse"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}
