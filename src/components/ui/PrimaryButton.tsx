import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

/**
 * Premium button with:
 * - scale(0.98) on active (via CSS active:scale-[0.98])
 * - 150ms transition
 * - soft glow on hover for primary variant
 * - loading spinner state
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = [
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl',
      'transition-all duration-150',
      'active:scale-[0.98]',
      'disabled:opacity-40 disabled:pointer-events-none',
      'select-none',
    ];

    const variants = {
      primary: [
        'bg-violet-600 text-white',
        'hover:bg-violet-500',
        // Soft glow on hover
        'hover:shadow-[0_0_16px_rgba(124,58,237,0.35)]',
      ],
      ghost: [
        'text-zinc-400',
        'hover:text-zinc-200 hover:bg-white/[0.05]',
      ],
      outline: [
        'border border-white/[0.08] text-zinc-300 bg-white/[0.03]',
        'hover:bg-white/[0.06] hover:border-white/[0.12]',
      ],
    };

    const sizes = {
      sm: 'text-[12px] px-3 py-1.5',
      md: 'text-[13px] px-4 py-2',
      lg: 'text-[14px] px-5 py-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <Spinner />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

function Spinner() {
  return (
    <svg
      className="w-3.5 h-3.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
