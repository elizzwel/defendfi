'use client';

import { useState } from 'react';
import { useTrendingTokens } from '@/hooks/useDegenRadar';
import { TrendingTable } from '@/components/degen-radar/TrendingTable';
import { TokenPanel } from '@/components/degen-radar/TokenPanel';
import { Activity, Radio, ShieldAlert } from 'lucide-react';

export default function DegenRadarPage() {
    const { data: tokens = [], isLoading } = useTrendingTokens();
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

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
                    <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                        Live Feed
                    </span>
                </div>
            </div>

            {/* ── Section 2 — Token Intelligence Panel ─────────────── */}
            {selectedAddress && (
                <TokenPanel
                    address={selectedAddress}
                    onClose={() => setSelectedAddress(null)}
                />
            )}

            {/* ── Section 1 — Trending Table ────────────────────────── */}
            <TrendingTable
                tokens={tokens}
                isLoading={isLoading}
                onSelectToken={(addr) =>
                    setSelectedAddress((prev) => (prev === addr ? null : addr))
                }
                selectedAddress={selectedAddress}
            />

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
