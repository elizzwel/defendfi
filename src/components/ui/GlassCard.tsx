import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
  noBorder?: boolean;
  onClick?: () => void;
}

/**
 * Surface card — adapts to both light and dark themes via CSS variables.
 * Uses --surface for bg, --border for border.
 * Optional hover subtly lightens (dark) or darkens (light) the surface.
 */
export function GlassCard({
  children,
  className,
  hover = false,
  padding = true,
  noBorder = false,
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl bg-[var(--surface)]',
        !noBorder && 'border border-[var(--border)]',
        // Hover: subtle surface lift in both themes
        hover && [
          'transition-colors duration-150',
          'dark:hover:bg-white/[0.05] hover:bg-black/[0.025]',
          onClick && 'cursor-pointer',
        ],
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}
