'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import { useWallet } from '@/hooks/useWallet';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/PrimaryButton';
import { formatUsd, formatNumber } from '@/lib/utils';
import { CHAIN_NAMES } from '@/lib/wagmi';
import { RefreshCw, Wallet } from 'lucide-react';

const CHAIN_ICONS: Record<number, string> = {
  1: '⟠',
  137: '⬡',
  42161: '🔵',
  10: '🔴',
  8453: '🔵',
};

export default function PortfolioPage() {
  const { isConnected, address } = useWallet();
  const { data: portfolio, isLoading, refetch } = usePortfolio();

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-10">
        <div className="mb-6">
          <h1 className="text-section">Portfolio</h1>
          <p className="text-data-secondary mt-0.5">Your multi-chain token holdings</p>
        </div>
        <GlassCard className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-violet-400" />
          </div>
          <div className="text-center">
            <p className="text-data-primary">Connect your wallet</p>
            <p className="text-data-secondary mt-1">Connect to view your portfolio across all chains</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-section">Portfolio</h1>
          <p className="text-data-secondary mt-0.5">Your multi-chain token holdings</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          loading={isLoading}
          className="gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Total Value */}
      {portfolio && (
        <GlassCard>
          <p className="text-data-secondary mb-1">Total Portfolio Value</p>
          <p className="text-display num">
            {formatUsd(portfolio.totalUsdValue)}
          </p>
          <p className="text-micro mt-1">
            {portfolio.tokens.length} tokens across {portfolio.chainDistribution.length} chains
          </p>
        </GlassCard>
      )}

      {/* Token List */}
      <GlassCard padding={false}>
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-card-heading">Token Holdings</h2>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] animate-pulse"
                style={{ opacity: 1 - i * 0.12 }}
              />
            ))}
          </div>
        ) : portfolio && portfolio.tokens.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {portfolio.tokens.map((token, i) => (
              <div
                key={`${token.chainId}-${token.address}-${i}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors duration-150 group"
              >
                <div className="flex items-center gap-3">
                  {/* Token icon */}
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border border-[var(--border)]"
                      style={{
                        background: 'var(--surface-raised)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {token.symbol.slice(0, 2)}
                    </div>
                    {/* Chain badge */}
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border border-[var(--border)] flex items-center justify-center text-[8px]"
                      style={{ background: 'var(--background)' }}
                    >
                      {CHAIN_ICONS[token.chainId] ?? '⛓'}
                    </div>
                  </div>

                  <div>
                    <p className="text-data-primary">{token.symbol}</p>
                    <p className="text-data-secondary">
                      {token.name} · {CHAIN_NAMES[token.chainId] ?? 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-data-primary tabular-nums">
                    {formatNumber(token.balanceFormatted, 4)} {token.symbol}
                  </p>
                  <p className="text-data-secondary tabular-nums">
                    {formatUsd(token.usdValue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-data-secondary">No tokens found in this wallet</p>
            <p className="text-micro">Try connecting a different wallet</p>
          </div>
        )}
      </GlassCard>

      {/* Chain Distribution Summary */}
      {portfolio && portfolio.chainDistribution.length > 0 && (
        <GlassCard>
          <h2 className="text-card-heading mb-4">Chain Breakdown</h2>
          <div className="space-y-3">
            {portfolio.chainDistribution.map((chain) => (
              <div key={chain.chainId} className="flex items-center gap-3">
                <div className="w-24 text-[12px] flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                  {chain.chainName}
                </div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${chain.percentage}%`, backgroundColor: chain.color }}
                  />
                </div>
                <div className="text-[12px] tabular-nums w-20 text-right" style={{ color: 'var(--text-secondary)' }}>
                  {formatUsd(chain.usdValue, true)}
                </div>
                <div className="text-[12px] w-10 text-right" style={{ color: 'var(--text-muted)' }}>
                  {chain.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
