import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/risk/types';

interface RiskScoreCellProps {
  score: number;
  level: RiskLevel;
  className?: string;
}

export function RiskScoreCell({ score, level, className }: RiskScoreCellProps) {
  const dotColor = {
    low: 'bg-emerald-400',
    medium: 'bg-amber-400',
    high: 'bg-red-400',
  }[level];

  const textColor = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-red-400',
  }[level];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)} />
      <span className={cn('text-[18px] font-bold tabular-nums leading-none', textColor)}>
        {score}
      </span>
    </div>
  );
}
