'use client';

import { useTokenDetail } from '@/hooks/useDegenRadar';
import { PriceChart } from './PriceChart';
import { VolatilityBadge } from './VolatilityBadge';
import { cn } from '@/lib/utils';
import type { WhaleRiskLabel, PumpLabel } from '@/lib/meme/types';
import {
    X, ExternalLink, TrendingUp, TrendingDown, Minus,
    Anchor, BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

function fmt(n: number, decimals = 2): string {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(decimals)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(decimals)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(decimals)}K`;
    return `$${n.toFixed(decimals)}`;
}

function fmtPrice(n: number): string {
    if (n >= 1) return `$${n.toFixed(2)}`;
    if (n >= 0.01) return `$${n.toFixed(4)}`;
    if (n >= 0.0001) return `$${n.toFixed(6)}`;
    return `$${n.toFixed(10)}`;
}

function ChangeIndicator({ value, label }: { value: number; label: string }) {
    const positive = value >= 0;
    const Icon = value > 0.5 ? TrendingUp : value < -0.5 ? TrendingDown : Minus;

    return (
        <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span
                className={cn('flex items-center gap-1 text-[13px] font-mono font-semibold num')}
                style={{ color: positive ? '#10B981' : '#EF4444' }}
            >
                <Icon className="w-3.5 h-3.5" />
                {positive ? '+' : ''}{value.toFixed(2)}%
            </span>
        </div>
    );
}

function MetricRow({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span className="text-[13px] font-mono num" style={{ color: 'var(--text-primary)' }}>
                {value}
            </span>
        </div>
    );
}

/* Whale risk label badge */
const WHALE_COLORS: Record<WhaleRiskLabel, { bg: string; text: string; dot: string }> = {
    Neutral: { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-400' },
    Accumulating: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    Distributing: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
};

function WhaleLabel({ label }: { label: WhaleRiskLabel }) {
    const c = WHALE_COLORS[label];
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold', c.bg, c.text)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
            {label}
        </span>
    );
}

/* Pump probability badge */
const PUMP_COLORS: Record<PumpLabel, { bg: string; text: string }> = {
    Low: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
    Moderate: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    Elevated: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    Extreme: { bg: 'bg-red-500/10', text: 'text-red-400' },
};

/* Pump probability radial gauge */
function PumpGauge({ probability, label }: { probability: number; label: PumpLabel }) {
    const c = PUMP_COLORS[label];
    const circumference = 2 * Math.PI * 36;
    const offset = circumference - (probability / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle
                        cx="40" cy="40" r="36"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="5"
                    />
                    <circle
                        cx="40" cy="40" r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={cn('transition-all duration-700', c.text)}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[18px] font-bold font-mono num" style={{ color: 'var(--text-primary)' }}>
                        {probability}%
                    </span>
                </div>
            </div>
            <span className={cn('px-2 py-0.5 rounded-full text-[10.5px] font-semibold', c.bg, c.text)}>
                {label}
            </span>
        </div>
    );
}

export function TokenPanel({
    address,
    onClose,
}: {
    address: string;
    onClose: () => void;
}) {
    const { data: token, isLoading } = useTokenDetail(address);

    if (isLoading || !token) {
        return (
            <div
                className="rounded-2xl border p-6"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="h-6 w-32 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
                    >
                        <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-[400px] rounded-2xl animate-pulse" style={{ background: 'var(--border)' }} />
                    <div className="space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: 'var(--border)' }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const whale = token.whaleActivity;
    const pump = token.pumpProbability;

    return (
        <div
            className="rounded-2xl border overflow-hidden"
            style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                animation: 'fadeIn 0.3s ease-out',
            }}
        >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                    {token.imageUrl ? (
                        <img src={token.imageUrl} alt={token.symbol} className="w-8 h-8 rounded-full" />
                    ) : (
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                            style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                        >
                            {token.symbol.slice(0, 2)}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {token.symbol}
                            </h3>
                            <span
                                className="text-[10.5px] px-2 py-0.5 rounded-full capitalize"
                                style={{ background: 'var(--secondary)', color: 'var(--text-muted)' }}
                            >
                                {token.chain}
                            </span>
                            <VolatilityBadge level={token.riskLevel} />
                        </div>
                        <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {token.name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href={token.dexUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium',
                            'border border-[var(--border)]',
                            'hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors'
                        )}
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <ExternalLink className="w-3 h-3" />
                        DexScreener
                    </a>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
                    >
                        <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Left: Chart */}
                <div className="lg:col-span-3">
                    <PriceChart
                        address={address}
                        symbol={token.symbol}
                        chain={token.chain}
                        price={token.price}
                        priceChange24h={token.priceChange24h}
                        liquidity={token.liquidity}
                        volatilityScore={token.volatilityScore}
                        riskLevel={token.riskLevel}
                    />
                </div>

                {/* Right: Intelligence Metrics */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Price & Changes */}
                    <div
                        className="rounded-2xl border p-4"
                        style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                            Price Action
                        </p>
                        <p className="text-[24px] font-bold font-mono num" style={{ color: 'var(--text-primary)' }}>
                            {fmtPrice(token.price)}
                        </p>
                        <div className="mt-3">
                            <ChangeIndicator value={token.priceChange1h} label="1h Change" />
                            <ChangeIndicator value={token.priceChange24h} label="24h Change" />
                            <ChangeIndicator value={token.priceChange7d} label="7d Change" />
                        </div>
                    </div>

                    {/* Metrics */}
                    <div
                        className="rounded-2xl border p-4"
                        style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                            Intelligence Metrics
                        </p>
                        <MetricRow label="Liquidity Depth" value={fmt(token.liquidityDepth)} />
                        <MetricRow label="Volume Spike Ratio" value={`${token.volumeSpikeRatio}x`} />
                        <MetricRow label="Market Cap" value={token.marketCap > 0 ? fmt(token.marketCap) : '—'} />
                        <MetricRow label="FDV" value={token.fdv > 0 ? fmt(token.fdv) : '—'} />
                        <MetricRow
                            label="Volatility Score"
                            value={
                                <span className="flex items-center gap-2">
                                    <span className="font-bold">{token.volatilityScore}</span>
                                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/100</span>
                                </span>
                            }
                        />
                        <MetricRow
                            label="Risk Level"
                            value={<VolatilityBadge level={token.riskLevel} />}
                        />
                    </div>

                    {/* ── Whale Activity ───────────────────────────────────── */}
                    <div
                        className="rounded-2xl border p-4"
                        style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center">
                                <Anchor className="w-3 h-3 text-blue-400" />
                            </div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                Whale Activity
                            </p>
                        </div>
                        <MetricRow
                            label="Net Inflow (24h)"
                            value={
                                <span className="flex items-center gap-1">
                                    {whale.netInflow24h > 0 ? (
                                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                    ) : whale.netInflow24h < 0 ? (
                                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                                    ) : (
                                        <Minus className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                                    )}
                                    <span style={{ color: whale.netInflow24h > 0 ? '#10B981' : whale.netInflow24h < 0 ? '#EF4444' : 'var(--text-primary)' }}>
                                        {whale.netInflow24h > 0 ? '+' : ''}{(whale.netInflow24h * 100).toFixed(1)}%
                                    </span>
                                </span>
                            }
                        />
                        <MetricRow label="Avg Tx Size" value={fmt(whale.avgTxSize)} />
                        <MetricRow label="Buy Pressure" value={`${whale.buyPressure}%`} />
                        <MetricRow label="Est. Largest Tx" value={fmt(whale.largestEstTx)} />
                        <MetricRow label="Concentration" value={`${whale.whaleConcentration}/100`} />
                        <MetricRow label="Risk" value={<WhaleLabel label={whale.riskLabel} />} />
                    </div>

                    {/* ── Pump Probability ─────────────────────────────────── */}
                    <div
                        className="rounded-2xl border p-4"
                        style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-md bg-orange-500/15 flex items-center justify-center">
                                <BarChart3 className="w-3 h-3 text-orange-400" />
                            </div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                Pump Probability
                            </p>
                        </div>
                        <div className="flex items-center gap-5">
                            <PumpGauge probability={pump.probability} label={pump.label} />
                            <div className="flex-1 space-y-1.5">
                                <FeatureBar label="Vol Accel" value={pump.features.volumeAcceleration} />
                                <FeatureBar label="Liq Inflow" value={pump.features.liquidityInflow} />
                                <FeatureBar label="Momentum" value={pump.features.momentumTrend} />
                                <FeatureBar label="Holder Growth" value={pump.features.holderGrowth} />
                            </div>
                        </div>
                    </div>

                    {/* AI Insight */}
                    <div
                        className="rounded-2xl border p-4"
                        style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-md bg-violet-500/15 flex items-center justify-center">
                                <span className="text-[10px]">🧠</span>
                            </div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                AI Insight
                            </p>
                        </div>
                        <p
                            className="text-[12.5px] leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {token.aiInsight}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Small bar for feature visualization */
function FeatureBar({ label, value }: { label: string; value: number }) {
    const pct = Math.round(value * 100);
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] w-[70px] text-right shrink-0" style={{ color: 'var(--text-muted)' }}>
                {label}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${pct}%`,
                        background: pct > 70 ? '#EF4444' : pct > 40 ? '#F59E0B' : '#10B981',
                    }}
                />
            </div>
            <span className="text-[10px] font-mono w-8 num" style={{ color: 'var(--text-muted)' }}>
                {pct}%
            </span>
        </div>
    );
}
