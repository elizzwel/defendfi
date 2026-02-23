'use client';

import { useState, useCallback } from 'react';
import type { MemeToken, ChartDataPoint } from '@/lib/meme/types';
import { VolatilityBadge } from './VolatilityBadge';
import { cn } from '@/lib/utils';

// ─── Color mapping by volatility ────────────────────────────────────

function getTileColor(score: number): { bg: string; border: string; glow: string } {
    if (score >= 81) return {
        bg: 'from-red-500/20 to-red-500/5',
        border: 'border-red-500/25',
        glow: 'shadow-red-500/10',
    };
    if (score >= 61) return {
        bg: 'from-orange-500/20 to-orange-500/5',
        border: 'border-orange-500/20',
        glow: 'shadow-orange-500/10',
    };
    if (score >= 31) return {
        bg: 'from-amber-500/15 to-amber-500/5',
        border: 'border-amber-500/15',
        glow: 'shadow-amber-500/10',
    };
    return {
        bg: 'from-emerald-500/15 to-emerald-500/5',
        border: 'border-emerald-500/15',
        glow: 'shadow-emerald-500/10',
    };
}

function fmt(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
}

function fmtPrice(n: number): string {
    if (n >= 1) return `$${n.toFixed(2)}`;
    if (n >= 0.01) return `$${n.toFixed(4)}`;
    return `$${n.toFixed(8)}`;
}

// ─── Mini sparkline (inline SVG) ────────────────────────────────────

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const h = 28;
    const w = 80;

    const points = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * w;
            const y = h - ((v - min) / range) * h;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg width={w} height={h} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ─── Hover popup ────────────────────────────────────────────────────

function HoverPopup({ token, chartData, position = 'above' }: { token: MemeToken; chartData?: number[]; position?: 'above' | 'below' }) {
    const isBelow = position === 'below';
    return (
        <div
            className={cn(
                'absolute z-50 left-1/2 -translate-x-1/2 px-3 py-2.5 rounded-xl shadow-xl border backdrop-blur-md min-w-[160px]',
                isBelow ? 'top-full mt-2' : 'bottom-full mb-2'
            )}
            style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
            }}
        >
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {token.symbol}
                </span>
                <span className="text-[10px] capitalize px-1.5 py-0.5 rounded-md" style={{ background: 'var(--secondary)', color: 'var(--text-muted)' }}>
                    {token.chain}
                </span>
            </div>
            {chartData && chartData.length > 2 && (
                <div className="mb-2">
                    <MiniSparkline
                        data={chartData}
                        color={token.priceChange24h >= 0 ? '#10B981' : '#EF4444'}
                    />
                </div>
            )}
            <div className="space-y-1 text-[10.5px]">
                <div className="flex justify-between gap-3">
                    <span style={{ color: 'var(--text-muted)' }}>Price</span>
                    <span className="font-mono num" style={{ color: 'var(--text-primary)' }}>{fmtPrice(token.price)}</span>
                </div>
                <div className="flex justify-between gap-3">
                    <span style={{ color: 'var(--text-muted)' }}>Volume</span>
                    <span className="font-mono num" style={{ color: 'var(--text-secondary)' }}>{fmt(token.volume24h)}</span>
                </div>
                <div className="flex justify-between gap-3">
                    <span style={{ color: 'var(--text-muted)' }}>Liquidity</span>
                    <span className="font-mono num" style={{ color: 'var(--text-secondary)' }}>{fmt(token.liquidity)}</span>
                </div>
            </div>
            {/* Arrow */}
            <div
                className={cn(
                    'absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45',
                    isBelow ? 'bottom-full -mb-1 border-l border-t' : 'top-full -mt-0 border-r border-b'
                )}
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            />
        </div>
    );
}

// ─── Single tile ────────────────────────────────────────────────────

function HeatmapTile({
    token,
    onClick,
    isSelected,
    popupPosition = 'above',
}: {
    token: MemeToken;
    onClick: () => void;
    isSelected: boolean;
    popupPosition?: 'above' | 'below';
}) {
    const [hovered, setHovered] = useState(false);
    const colors = getTileColor(token.volatilityScore);

    // Generate simple sparkline data from price change
    const sparkData = generateSparkData(token.priceChange24h);

    return (
        <div className="relative">
            <button
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={cn(
                    'w-full p-3 rounded-xl border bg-gradient-to-br transition-all duration-200',
                    'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
                    colors.bg,
                    colors.border,
                    colors.glow,
                    isSelected && 'ring-2 ring-violet-500/40 scale-[1.02]'
                )}
            >
                {/* Token avatar + symbol */}
                <div className="flex items-center gap-2 mb-2">
                    {token.imageUrl ? (
                        <img src={token.imageUrl} alt={token.symbol} className="w-5 h-5 rounded-full" />
                    ) : (
                        <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                            style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                        >
                            {token.symbol.slice(0, 2)}
                        </div>
                    )}
                    <span className="text-[12px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {token.symbol}
                    </span>
                </div>

                {/* 24h change — large */}
                <p
                    className="text-[16px] font-bold font-mono num"
                    style={{ color: token.priceChange24h >= 0 ? '#10B981' : '#EF4444' }}
                >
                    {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
                </p>

                {/* Mini metrics */}
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono num" style={{ color: 'var(--text-muted)' }}>
                        {fmt(token.liquidity)}
                    </span>
                    <VolatilityBadge level={token.riskLevel} score={token.volatilityScore} showScore className="!text-[9px] !px-1.5 !py-0.5" />
                </div>
            </button>

            {/* Hover popup */}
            {hovered && <HoverPopup token={token} chartData={sparkData} position={popupPosition} />}
        </div>
    );
}

// Generate simple approximated sparkline from 24h change
function generateSparkData(change24h: number): number[] {
    const points = 12;
    const data: number[] = [];
    let seed = 7;
    const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed / 2147483647) - 0.5;
    };

    const start = 1;
    const end = 1 + change24h / 100;

    for (let i = 0; i < points; i++) {
        const t = i / (points - 1);
        const base = start + (end - start) * t;
        const noise = base * 0.02 * rand();
        data.push(base + noise);
    }
    return data;
}

// ─── Main Heatmap Grid ──────────────────────────────────────────────

export function HeatmapGrid({
    tokens,
    isLoading,
    onSelectToken,
    selectedAddress,
}: {
    tokens: MemeToken[];
    isLoading: boolean;
    onSelectToken: (address: string) => void;
    selectedAddress: string | null;
}) {
    if (isLoading) {
        return (
            <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 rounded-xl animate-pulse"
                            style={{ background: 'var(--border)' }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className="rounded-2xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Volatility Heatmap
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {tokens.length} tokens • Color intensity = volatility score
                </p>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {tokens.map((token, index) => {
                    // First row tiles show popup below to avoid clipping
                    const isFirstRow = index < 5;
                    return (
                        <HeatmapTile
                            key={`${token.chain}-${token.pairAddress}`}
                            token={token}
                            onClick={() => onSelectToken(token.address)}
                            isSelected={selectedAddress === token.address}
                            popupPosition={isFirstRow ? 'below' : 'above'}
                        />
                    );
                })}
            </div>
        </div>
    );
}
