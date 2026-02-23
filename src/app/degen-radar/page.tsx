'use client';

import { useState } from 'react';
import { useTrendingTokens } from '@/hooks/useDegenRadar';
import { TrendingTable } from '@/components/degen-radar/TrendingTable';
import { HeatmapGrid } from '@/components/degen-radar/HeatmapGrid';
import { TokenPanel } from '@/components/degen-radar/TokenPanel';
import { cn } from '@/lib/utils';
import { Activity, Radio, ShieldAlert, LayoutGrid, Table2 } from 'lucide-react';

type ViewMode = 'table' | 'heatmap';

export default function DegenRadarPage() {
    const { data: tokens = [], isLoading } = useTrendingTokens();
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('table');

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            {/* ── Page Header — Institutional positioning ──────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-section">Degen Radar</h1>
                        <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            High-Volatility Asset Monitor — Structured on-chain risk metrics
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <div
                        className="flex items-center rounded-xl border p-0.5"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <button
                            onClick={() => setViewMode('table')}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all',
                                viewMode === 'table'
                                    ? 'bg-violet-500/15 text-violet-400'
                                    : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                            )}
                            style={{ color: viewMode === 'table' ? undefined : 'var(--text-muted)' }}
                        >
                            <Table2 className="w-3.5 h-3.5" />
                            Table
                        </button>
                        <button
                            onClick={() => setViewMode('heatmap')}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all',
                                viewMode === 'heatmap'
                                    ? 'bg-violet-500/15 text-violet-400'
                                    : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                            )}
                            style={{ color: viewMode === 'heatmap' ? undefined : 'var(--text-muted)' }}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            Heatmap
                        </button>
                    </div>

                    <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                        Live Feed
                    </span>
                </div>
            </div>

            {/* ── Token Intelligence Panel ─────────────────────────── */}
            {selectedAddress && (
                <TokenPanel
                    address={selectedAddress}
                    onClose={() => setSelectedAddress(null)}
                />
            )}

            {/* ── Data View (Table or Heatmap) ─────────────────────── */}
            {viewMode === 'table' ? (
                <TrendingTable
                    tokens={tokens}
                    isLoading={isLoading}
                    onSelectToken={(addr) =>
                        setSelectedAddress((prev) => (prev === addr ? null : addr))
                    }
                    selectedAddress={selectedAddress}
                />
            ) : (
                <HeatmapGrid
                    tokens={tokens}
                    isLoading={isLoading}
                    onSelectToken={(addr) =>
                        setSelectedAddress((prev) => (prev === addr ? null : addr))
                    }
                    selectedAddress={selectedAddress}
                />
            )}

            {/* ── Risk Disclaimer ──────────────────────────────────── */}
            <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl border"
                style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                }}
            >
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    These assets carry extreme liquidity and volatility risk. Data provided for analytical purposes only.
                    DefendFi does not provide financial advice. Always conduct your own research before interacting with
                    high-volatility tokens.
                </p>
            </div>
        </div>
    );
}
