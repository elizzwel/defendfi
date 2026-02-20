'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/risk/types';
import { getRiskBadgeClass } from '@/lib/risk/scorer';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

const TOOLTIP_TEXT: Record<RiskLevel, string> = {
  low: 'Low risk — protocol appears stable',
  medium: 'Medium risk — monitor closely',
  high: 'High risk — significant exposure detected',
};

export function RiskBadge({ level, score, className, size = 'md', tooltip }: RiskBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const label = level.charAt(0).toUpperCase() + level.slice(1);
  const badgeClass = getRiskBadgeClass(level);
  const tooltipText = tooltip ?? TOOLTIP_TEXT[level];

  const sizeClass = {
    sm: 'text-[10.5px] px-2 py-0.5 gap-1',
    md: 'text-[11.5px] px-2.5 py-1 gap-1.5',
    lg: 'text-[12.5px] px-3 py-1.5 gap-1.5',
  }[size];

  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-1.5 h-1.5',
  }[size];

  const dotColor = {
    low: 'bg-emerald-400',
    medium: 'bg-amber-400',
    high: 'bg-red-400',
  }[level];

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => setShowTooltip(true), 100);
  }

  function handleMouseLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowTooltip(false);
  }

  return (
    <span className="relative inline-flex">
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'inline-flex items-center rounded-full border font-semibold tracking-wide cursor-default',
          'transition-all duration-150',
          badgeClass,
          sizeClass,
          className
        )}
      >
        <span className={cn('rounded-full flex-shrink-0 transition-colors duration-300', dotSize, dotColor)} />
        {score !== undefined ? `${label} · ${score}` : label}
      </span>

      {/* Tooltip — uses CSS vars for theme awareness */}
      <span
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
          'whitespace-nowrap rounded-lg px-2.5 py-1.5',
          'text-[11px] shadow-xl pointer-events-none',
          'transition-opacity duration-100',
          showTooltip ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background: 'var(--chart-tooltip-bg)',
          border: '1px solid var(--chart-tooltip-border)',
          color: 'var(--text-secondary)',
        }}
      >
        {tooltipText}
        {/* Arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--border)]" />
      </span>
    </span>
  );
}
