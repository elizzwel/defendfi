'use client';

import { useState, useMemo } from 'react';
import type { MemeToken } from '@/lib/meme/types';
import { VolatilityBadge } from './VolatilityBadge';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';

type SortKey = keyof Pick<
    MemeToken,
    'price' | 'priceChange24h' | 'volume24h' | 'liquidity' | 'fdv' | 'ageMs' | 'volatilityScore'
>;

type SortDir = 'asc' | 'desc';

const CHAINS = ['all', 'solana', 'ethereum', 'bsc', 'base', 'arbitrum', 'polygon', 'avalanche'] as const;

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

interface Column {
    label: string;
    key: SortKey | null;
    align?: 'left' | 'right';
    width?: string;
}

const COLUMNS: Column[] = [
    { label: 'Token', key: null, align: 'left', width: 'min-w-[180px]' },
    { label: 'Chain', key: null, align: 'left' },
    { label: 'Price', key: 'price', align: 'right' },
    { label: '24h %', key: 'priceChange24h', align: 'right' },
    { label: 'Volume 24h', key: 'volume24h', align: 'right' },
    { label: 'Liquidity', key: 'liquidity', align: 'right' },
    { label: 'FDV', key: 'fdv', align: 'right' },
    { label: 'Age', key: 'ageMs', align: 'right' },
    { label: 'Risk', key: 'volatilityScore', align: 'right' },
];

export function TrendingTable({
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
    const [sortKey, setSortKey] = useState<SortKey>('volatilityScore');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [chainFilter, setChainFilter] = useState<string>('all');
    const [minLiquidity, setMinLiquidity] = useState<string>('');
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const toggleSort = (key: SortKey | null) => {
        if (!key) return;
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const filtered = useMemo(() => {
        let result = [...tokens];

        // Search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.symbol.toLowerCase().includes(q) ||
                    t.address.toLowerCase().includes(q)
            );
        }

        // Chain filter
        if (chainFilter !== 'all') {
            result = result.filter((t) => t.chain.toLowerCase() === chainFilter);
        }

        // Min liquidity
        const minLiq = parseFloat(minLiquidity);
        if (!isNaN(minLiq) && minLiq > 0) {
            result = result.filter((t) => t.liquidity >= minLiq);
        }

        // Sort
        result.sort((a, b) => {
            const aVal = a[sortKey] as number;
            const bVal = b[sortKey] as number;
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return result;
    }, [tokens, search, chainFilter, minLiquidity, sortKey, sortDir]);

    return (
        <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
            {/* Toolbar */}
            <div className="px-5 py-4 flex flex-col gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Trending High Volatility Tokens
                        </h2>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {filtered.length} tokens • Auto-refresh 60s
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium',
                            'border transition-all duration-150',
                            showFilters
                                ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                : 'border-[var(--border)] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                        )}
                        style={{ color: showFilters ? undefined : 'var(--text-muted)' }}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        Filters
                    </button>
                </div>

                {/* Expanded filters */}
                <div
                    className={cn(
                        'overflow-hidden transition-all duration-200',
                        showFilters ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                    )}
                >
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        {/* Search */}
                        <div className="relative">
                            <Search
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                                style={{ color: 'var(--text-muted)' }}
                            />
                            <input
                                type="text"
                                placeholder="Search token…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={cn(
                                    'pl-8 pr-3 py-1.5 rounded-xl text-[12px] w-48',
                                    'border border-[var(--border)]',
                                    'bg-black/[0.02] dark:bg-white/[0.02]',
                                    'focus:outline-none focus:ring-1 focus:ring-violet-500/30',
                                    'placeholder:text-[var(--text-muted)]'
                                )}
                                style={{ color: 'var(--text-secondary)' }}
                            />
                        </div>

                        {/* Chain filter */}
                        <select
                            value={chainFilter}
                            onChange={(e) => setChainFilter(e.target.value)}
                            className={cn(
                                'px-3 py-1.5 rounded-xl text-[12px] appearance-none',
                                'border border-[var(--border)]',
                                'bg-black/[0.02] dark:bg-white/[0.02]',
                                'focus:outline-none focus:ring-1 focus:ring-violet-500/30'
                            )}
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {CHAINS.map((c) => (
                                <option key={c} value={c}>
                                    {c === 'all' ? 'All Chains' : c.charAt(0).toUpperCase() + c.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* Min liquidity */}
                        <input
                            type="number"
                            placeholder="Min Liquidity ($)"
                            value={minLiquidity}
                            onChange={(e) => setMinLiquidity(e.target.value)}
                            className={cn(
                                'px-3 py-1.5 rounded-xl text-[12px] w-40',
                                'border border-[var(--border)]',
                                'bg-black/[0.02] dark:bg-white/[0.02]',
                                'focus:outline-none focus:ring-1 focus:ring-violet-500/30',
                                'placeholder:text-[var(--text-muted)]'
                            )}
                            style={{ color: 'var(--text-secondary)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead>
                        <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                            {COLUMNS.map((col) => (
                                <th
                                    key={col.label}
                                    className={cn(
                                        'px-4 py-3 text-table-header whitespace-nowrap',
                                        col.align === 'right' ? 'text-right' : 'text-left',
                                        col.width,
                                        col.key && 'cursor-pointer select-none hover:text-[var(--text-secondary)] transition-colors'
                                    )}
                                    onClick={() => toggleSort(col.key)}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {col.label}
                                        {col.key && sortKey === col.key && (
                                            sortDir === 'asc'
                                                ? <ChevronUp className="w-3 h-3" />
                                                : <ChevronDown className="w-3 h-3" />
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                                    {COLUMNS.map((col) => (
                                        <td key={col.label} className="px-4 py-3.5">
                                            <div
                                                className="h-4 rounded-md animate-pulse"
                                                style={{
                                                    background: 'var(--border)',
                                                    width: col.label === 'Token' ? '120px' : '60px',
                                                }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={COLUMNS.length} className="px-4 py-12 text-center">
                                    <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                                        No tokens match your filters
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((token) => {
                                const isSelected = selectedAddress === token.address;
                                const extreme24h = Math.abs(token.priceChange24h) > 50;
                                const lowLiq = token.liquidity < 50_000;

                                return (
                                    <tr
                                        key={`${token.chain}-${token.pairAddress}`}
                                        onClick={() => onSelectToken(token.address)}
                                        className={cn(
                                            'border-b cursor-pointer transition-colors duration-100',
                                            isSelected
                                                ? 'bg-violet-500/[0.06]'
                                                : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                                        )}
                                        style={{ borderColor: 'var(--border)' }}
                                    >
                                        {/* Token */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                {token.imageUrl ? (
                                                    <img
                                                        src={token.imageUrl}
                                                        alt={token.symbol}
                                                        className="w-7 h-7 rounded-full flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                                        style={{
                                                            background: 'var(--accent)',
                                                            color: 'var(--accent-foreground)',
                                                        }}
                                                    >
                                                        {token.symbol.slice(0, 2)}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p
                                                        className="text-[13px] font-semibold truncate"
                                                        style={{ color: 'var(--text-primary)' }}
                                                    >
                                                        {token.symbol}
                                                    </p>
                                                    <p
                                                        className="text-[10.5px] truncate max-w-[120px]"
                                                        style={{ color: 'var(--text-muted)' }}
                                                    >
                                                        {token.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Chain */}
                                        <td className="px-4 py-3">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium capitalize"
                                                style={{
                                                    background: 'var(--secondary)',
                                                    color: 'var(--text-secondary)',
                                                }}
                                            >
                                                {token.chain}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-[13px] font-mono num" style={{ color: 'var(--text-primary)' }}>
                                                {fmtPrice(token.price)}
                                            </span>
                                        </td>

                                        {/* 24h % */}
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={cn(
                                                    'text-[13px] font-mono font-semibold num',
                                                    extreme24h && 'animate-pulse'
                                                )}
                                                style={{
                                                    color: token.priceChange24h >= 0 ? '#10B981' : '#EF4444',
                                                }}
                                            >
                                                {token.priceChange24h >= 0 ? '+' : ''}
                                                {token.priceChange24h.toFixed(2)}%
                                            </span>
                                        </td>

                                        {/* Volume */}
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-[13px] font-mono num" style={{ color: 'var(--text-secondary)' }}>
                                                {fmt(token.volume24h)}
                                            </span>
                                        </td>

                                        {/* Liquidity */}
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={cn(
                                                    'text-[13px] font-mono num',
                                                    lowLiq && 'text-amber-400'
                                                )}
                                                style={{ color: lowLiq ? undefined : 'var(--text-secondary)' }}
                                            >
                                                {fmt(token.liquidity)}
                                                {lowLiq && (
                                                    <span className="ml-1 text-[9px] text-amber-400 font-semibold align-super">
                                                        LOW
                                                    </span>
                                                )}
                                            </span>
                                        </td>

                                        {/* FDV */}
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-[13px] font-mono num" style={{ color: 'var(--text-secondary)' }}>
                                                {token.fdv > 0 ? fmt(token.fdv) : '—'}
                                            </span>
                                        </td>

                                        {/* Age */}
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
                                                {token.age}
                                            </span>
                                        </td>

                                        {/* Volatility Score / Risk */}
                                        <td className="px-4 py-3 text-right">
                                            <VolatilityBadge level={token.riskLevel} score={token.volatilityScore} showScore />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
