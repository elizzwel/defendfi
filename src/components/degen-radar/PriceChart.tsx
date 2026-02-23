'use client';

import { useState, useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint, ChartInterval } from '@/lib/meme/types';
import type { RiskLevel } from '@/lib/meme/types';
import { useTokenChart } from '@/hooks/useDegenRadar';
import { VolatilityBadge } from './VolatilityBadge';
import { cn } from '@/lib/utils';

const INTERVALS: ChartInterval[] = ['15m', '1h', '4h', '1D'];

function formatPrice(n: number): string {
    if (n >= 1) return `$${n.toFixed(2)}`;
    if (n >= 0.01) return `$${n.toFixed(4)}`;
    if (n >= 0.0001) return `$${n.toFixed(6)}`;
    return `$${n.toFixed(10)}`;
}

function formatTime(ts: number, interval: ChartInterval): string {
    const d = new Date(ts);
    if (interval === '1D') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatVolume(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
}

/* Custom tooltip — minimal, clean */
function ChartTooltip({
    active,
    payload,
    interval,
}: {
    active?: boolean;
    payload?: Array<{ payload: ChartDataPoint }>;
    interval: ChartInterval;
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;

    return (
        <div
            className="rounded-xl px-3 py-2.5 text-[11px] shadow-lg border backdrop-blur-sm"
            style={{
                background: 'var(--chart-tooltip-bg)',
                borderColor: 'var(--chart-tooltip-border)',
            }}
        >
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {formatTime(d.time, interval)}
            </p>
            <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between gap-4">
                    <span style={{ color: 'var(--text-muted)' }}>Price</span>
                    <span className="font-mono font-semibold" style={{ color: '#8B5CF6' }}>{formatPrice(d.price)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span style={{ color: 'var(--text-muted)' }}>Volume</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{formatVolume(d.volume)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span style={{ color: 'var(--text-muted)' }}>Liquidity</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{formatVolume(d.liquidity)}</span>
                </div>
            </div>
        </div>
    );
}

/* Mini metric for footer row */
function MiniMetric({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {label}
            </span>
            <span
                className="text-[13px] font-mono font-semibold num"
                style={{ color: color ?? 'var(--text-primary)' }}
            >
                {value}
            </span>
        </div>
    );
}

export function PriceChart({
    address,
    symbol,
    chain,
    price,
    priceChange24h,
    liquidity,
    volatilityScore,
    riskLevel,
}: {
    address: string;
    symbol: string;
    chain: string;
    price: number;
    priceChange24h: number;
    liquidity: number;
    volatilityScore: number;
    riskLevel: RiskLevel;
}) {
    const [interval, setInterval] = useState<ChartInterval>('1h');
    const { data: chart, isLoading } = useTokenChart(address, interval);

    const lastPrice = useMemo(() => {
        if (!chart || chart.length === 0) return price;
        return chart[chart.length - 1].price;
    }, [chart, price]);

    return (
        <div
            className="rounded-2xl border overflow-hidden"
            style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
            }}
        >
            {/* ── Header Row ────────────────────────────────────────── */}
            <div className="px-6 pt-5 pb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
                                {symbol}
                            </p>
                            <span
                                className="text-[10px] px-1.5 py-0.5 rounded-md capitalize font-medium"
                                style={{ background: 'var(--secondary)', color: 'var(--text-muted)' }}
                            >
                                {chain}
                            </span>
                            <VolatilityBadge level={riskLevel} />
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            On-chain momentum signal
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {INTERVALS.map((iv) => (
                        <button
                            key={iv}
                            onClick={() => setInterval(iv)}
                            className={cn(
                                'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150',
                                iv === interval
                                    ? 'bg-violet-500/15 text-violet-400'
                                    : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                            )}
                            style={{
                                color: iv === interval ? undefined : 'var(--text-muted)',
                            }}
                        >
                            {iv}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Chart Body ────────────────────────────────────────── */}
            <div className="px-3" style={{ height: 380 }}>
                {isLoading || !chart ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Loading chart…</p>
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chart}
                            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                        >
                            <defs>
                                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.03} />
                                </linearGradient>
                                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.06} />
                                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.01} />
                                </linearGradient>
                                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.15} />
                                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--chart-grid)"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="time"
                                tickFormatter={(ts: number) => formatTime(ts, interval)}
                                tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={50}
                            />

                            <YAxis
                                yAxisId="price"
                                orientation="right"
                                tickFormatter={(v: number) => formatPrice(v)}
                                tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                                axisLine={false}
                                tickLine={false}
                                domain={['auto', 'auto']}
                                width={80}
                            />

                            <YAxis
                                yAxisId="volume"
                                orientation="left"
                                tickFormatter={(v: number) => formatVolume(v)}
                                tick={{ fontSize: 10, fill: 'var(--chart-axis)' }}
                                axisLine={false}
                                tickLine={false}
                                width={55}
                                hide
                            />

                            {/* Volatility band fills */}
                            <Area
                                yAxisId="price"
                                dataKey="upperBand"
                                stroke="none"
                                fill="url(#bandGrad)"
                                isAnimationActive
                                animationDuration={800}
                            />
                            <Area
                                yAxisId="price"
                                dataKey="lowerBand"
                                stroke="none"
                                fill="url(#bandGrad)"
                                isAnimationActive
                                animationDuration={800}
                            />

                            {/* Low-opacity volume bars */}
                            <Bar
                                yAxisId="volume"
                                dataKey="volume"
                                fill="url(#volGrad)"
                                radius={[2, 2, 0, 0]}
                                isAnimationActive
                                animationDuration={600}
                                barSize={6}
                            />

                            {/* Price fill under line */}
                            <Area
                                yAxisId="price"
                                type="monotone"
                                dataKey="price"
                                stroke="none"
                                fill="url(#priceGrad)"
                                isAnimationActive
                                animationDuration={800}
                            />

                            {/* Smooth price line */}
                            <Line
                                yAxisId="price"
                                type="monotone"
                                dataKey="price"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive
                                animationDuration={800}
                            />

                            <Tooltip
                                content={<ChartTooltip interval={interval} />}
                                cursor={{ stroke: 'var(--chart-cursor)', strokeWidth: 1 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── Footer Row — Mini Metrics ─────────────────────────── */}
            <div
                className="px-6 py-3 flex items-center justify-between border-t"
                style={{ borderColor: 'var(--border)' }}
            >
                <MiniMetric
                    label="Price"
                    value={formatPrice(lastPrice)}
                />
                <div
                    className="w-px h-6"
                    style={{ background: 'var(--border)' }}
                />
                <MiniMetric
                    label="24h"
                    value={`${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`}
                    color={priceChange24h >= 0 ? '#10B981' : '#EF4444'}
                />
                <div
                    className="w-px h-6"
                    style={{ background: 'var(--border)' }}
                />
                <MiniMetric
                    label="Liquidity"
                    value={formatVolume(liquidity)}
                />
                <div
                    className="w-px h-6"
                    style={{ background: 'var(--border)' }}
                />
                <MiniMetric
                    label="Volatility"
                    value={`${volatilityScore}/100`}
                    color={volatilityScore >= 80 ? '#EF4444' : volatilityScore >= 60 ? '#F59E0B' : '#10B981'}
                />
            </div>
        </div>
    );
}
