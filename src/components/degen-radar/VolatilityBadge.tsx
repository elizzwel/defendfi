'use client';

import type { RiskLevel } from '@/lib/meme/types';
import { cn } from '@/lib/utils';

const RISK_CONFIG: Record<RiskLevel, { bg: string; text: string; dot: string }> = {
    Low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
    High: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
    Extreme: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
};

export function VolatilityBadge({
    level,
    score,
    showScore = false,
    className,
}: {
    level: RiskLevel;
    score?: number;
    showScore?: boolean;
    className?: string;
}) {
    const config = RISK_CONFIG[level];

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide',
                config.bg,
                config.text,
                className
            )}
        >
            <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
            {showScore && score !== undefined ? `${score} — ${level}` : level}
        </span>
    );
}
