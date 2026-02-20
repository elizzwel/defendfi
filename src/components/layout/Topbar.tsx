'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/hooks/useWallet';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';
import {
  Bell, Menu, X, Shield, ChevronDown,
  Activity, Scan, BarChart2, TrendingUp,
  Droplets, Users, BookOpen, Calculator,
  FileText, FlaskConical, Globe, Layers,
  Moon, Sun,
} from 'lucide-react';
import { CHAIN_NAMES } from '@/lib/wagmi';

/* ─────────────────────────────────────────────────────────────────
   Mega dropdown data
───────────────────────────────────────────────────────────────── */

type MegaLink = {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
};

type MegaColumn = {
  heading: string;
  links: MegaLink[];
};

const RISK_INTELLIGENCE_COLUMNS: MegaColumn[] = [
  {
    heading: 'Protocol Analysis',
    links: [
      {
        icon: Activity,
        label: 'Risk Monitor',
        description: 'Live protocol risk scores across DeFi',
        href: '/risk-monitor',
      },
      {
        icon: Scan,
        label: 'Protocol Scanner',
        description: 'Deep-scan any protocol for vulnerabilities',
        href: '/risk-monitor',
      },
      {
        icon: Layers,
        label: 'Exposure Analyzer',
        description: 'Map your cross-protocol exposure',
        href: '/portfolio',
      },
    ],
  },
  {
    heading: 'Market Signals',
    links: [
      {
        icon: TrendingUp,
        label: 'Volatility Tracker',
        description: 'Real-time TVL momentum and volatility',
        href: '/risk-monitor',
      },
      {
        icon: Droplets,
        label: 'Liquidity Stability',
        description: 'Detect liquidity fragility before it breaks',
        href: '/risk-monitor',
      },
      {
        icon: Users,
        label: 'Whale Movement',
        description: 'Track large-holder concentration shifts',
        href: '/risk-monitor',
      },
    ],
  },
  {
    heading: 'Methodology',
    links: [
      {
        icon: Calculator,
        label: 'Scoring Model',
        description: 'How risk scores are calculated',
        href: '/settings',
      },
      {
        icon: BookOpen,
        label: 'Risk Methodology',
        description: 'Framework and data sources explained',
        href: '/settings',
      },
      {
        icon: FileText,
        label: 'Documentation',
        description: 'API reference and integration guides',
        href: '/settings',
      },
    ],
  },
];

const RESEARCH_COLUMNS: MegaColumn[] = [
  {
    heading: 'Intelligence',
    links: [
      {
        icon: FlaskConical,
        label: 'Protocol Research',
        description: 'In-depth protocol security reports',
        href: '/alerts',
      },
      {
        icon: BarChart2,
        label: 'Market Analysis',
        description: 'Macro DeFi trends and sector breakdowns',
        href: '/alerts',
      },
      {
        icon: Globe,
        label: 'Cross-Chain View',
        description: 'Unified risk view across all chains',
        href: '/risk-monitor',
      },
    ],
  },
  {
    heading: 'Data',
    links: [
      {
        icon: Activity,
        label: 'Live Feeds',
        description: 'Real-time protocol data streams',
        href: '/alerts',
      },
      {
        icon: Layers,
        label: 'Historical Data',
        description: 'TVL and risk score history',
        href: '/risk-monitor',
      },
      {
        icon: TrendingUp,
        label: 'Trend Reports',
        description: 'Weekly and monthly risk summaries',
        href: '/alerts',
      },
    ],
  },
  {
    heading: 'Resources',
    links: [
      {
        icon: BookOpen,
        label: 'Glossary',
        description: 'DeFi risk terminology explained',
        href: '/settings',
      },
      {
        icon: FileText,
        label: 'Whitepapers',
        description: 'Research publications and findings',
        href: '/settings',
      },
      {
        icon: Calculator,
        label: 'Risk Calculator',
        description: 'Estimate portfolio risk exposure',
        href: '/portfolio',
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   Nav item types
───────────────────────────────────────────────────────────────── */

type NavItem =
  | { type: 'link'; href: string; label: string }
  | { type: 'mega'; label: string; id: string; columns: MegaColumn[] };

const NAV_ITEMS: NavItem[] = [
  { type: 'link', href: '/', label: 'Dashboard' },
  { type: 'link', href: '/portfolio', label: 'Portfolio' },
  {
    type: 'mega',
    label: 'Risk Intelligence',
    id: 'risk',
    columns: RISK_INTELLIGENCE_COLUMNS,
  },
  { type: 'link', href: '/alerts', label: 'Alerts' },
  {
    type: 'mega',
    label: 'Research',
    id: 'research',
    columns: RESEARCH_COLUMNS,
  },
];

/* ─────────────────────────────────────────────────────────────────
   Mega Dropdown Panel — theme-aware
───────────────────────────────────────────────────────────────── */

function MegaPanel({
  columns,
  visible,
}: {
  columns: MegaColumn[];
  visible: boolean;
}) {
  return (
    <div
      role="region"
      className={cn(
        'absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2',
        'w-[720px] max-w-[calc(100vw-48px)]',
        'rounded-2xl p-5',
        'mega-panel-bg',
        'shadow-[0_8px_40px_var(--shadow-md)]',
        'transition-all duration-200 origin-top',
        visible
          ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'
      )}
    >
      <div className="grid grid-cols-3 gap-x-4 gap-y-1">
        {columns.map((col) => (
          <div key={col.heading}>
            <p className="px-2 pb-2 text-table-header">
              {col.heading}
            </p>
            <div className="space-y-0.5">
              {col.links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'flex items-start gap-2.5 px-2 py-2.5 rounded-xl',
                      'transition-colors duration-100',
                      'hover:bg-black/[0.04] dark:hover:bg-white/[0.05] group'
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                        'border transition-colors duration-100',
                        'bg-black/[0.03] dark:bg-white/[0.04]',
                        'border-[var(--border)]',
                        'group-hover:border-violet-500/20 group-hover:bg-violet-500/[0.06]'
                      )}
                    >
                      <Icon
                        className="w-3.5 h-3.5 transition-colors duration-100"
                        style={{ color: 'var(--text-muted)' }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-[12.5px] font-medium leading-tight transition-colors duration-100"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {link.label}
                      </p>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
                        {link.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Chain Dropdown — theme-aware
───────────────────────────────────────────────────────────────── */

const CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 137, name: 'Polygon' },
  { id: 42161, name: 'Arbitrum' },
  { id: 10, name: 'Optimism' },
  { id: 8453, name: 'Base' },
];

function ChainDropdown({ chainId }: { chainId?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const chainName = chainId ? (CHAIN_NAMES[chainId] ?? 'Ethereum') : 'Ethereum';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
          'border border-[var(--border)]',
          'bg-black/[0.03] dark:bg-white/[0.03]',
          'text-[12px] font-medium',
          'hover:bg-black/[0.06] dark:hover:bg-white/[0.06]',
          'transition-all duration-150 active:scale-[0.98]'
        )}
        style={{ color: 'var(--text-secondary)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
        {chainName}
        <ChevronDown
          className={cn('w-3 h-3 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <div
        role="listbox"
        className={cn(
          'absolute top-full right-0 mt-2 w-40 rounded-xl overflow-hidden',
          'shadow-xl transition-all duration-200 origin-top-right',
          open
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        )}
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
        }}
      >
        <p className="px-3 py-2 text-table-header border-b border-[var(--border)]">
          Network
        </p>
        {CHAINS.map((chain) => (
          <button
            key={chain.id}
            role="option"
            aria-selected={chainId === chain.id}
            onClick={() => setOpen(false)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 text-[12.5px]',
              'transition-colors duration-100',
              chainId === chain.id
                ? 'bg-black/[0.06] dark:bg-white/[0.06]'
                : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
            )}
            style={{ color: chainId === chain.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                chainId === chain.id ? 'bg-emerald-400' : 'bg-[var(--text-muted)]'
              )}
            />
            {chain.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Theme Toggle Button — Moon / Sun icon crossfade
───────────────────────────────────────────────────────────────── */

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative w-8 h-8 flex items-center justify-center rounded-full',
        'border border-[var(--border)]',
        'bg-black/[0.03] dark:bg-white/[0.03]',
        'hover:bg-black/[0.08] dark:hover:bg-white/[0.08]',
        'transition-colors duration-150 active:scale-[0.95]'
      )}
    >
      {/* Sun (visible in dark mode to switch to light) */}
      <Sun
        className={cn(
          'absolute w-3.5 h-3.5 transition-all duration-200',
          isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
        )}
        style={{ color: 'var(--text-muted)' }}
      />
      {/* Moon (visible in light mode to switch to dark) */}
      <Moon
        className={cn(
          'absolute w-3.5 h-3.5 transition-all duration-200',
          isDark ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
        )}
        style={{ color: 'var(--text-muted)' }}
      />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Topbar
───────────────────────────────────────────────────────────────── */

export function Topbar() {
  const pathname = usePathname();
  const { isConnected, chainId } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mega on route change
  useEffect(() => {
    setActiveMega(null);
    setMobileOpen(false);
  }, [pathname]);

  // Close mega on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMega(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ESC key closes mega
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMega(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const toggleMega = useCallback((id: string) => {
    setActiveMega((prev) => (prev === id ? null : id));
  }, []);

  const isNavActive = (item: NavItem) => {
    if (item.type === 'link') return pathname === item.href;
    if (item.id === 'risk') return pathname.startsWith('/risk-monitor');
    if (item.id === 'research') return false;
    return false;
  };

  return (
    <>
      {/* ── Main header ─────────────────────────────────────── */}
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 h-[68px]',
          'bg-background/85 backdrop-blur-md',
          'border-b border-[var(--border)]',
          'transition-shadow duration-200 theme-transition'
        )}
        style={{
          boxShadow: scrolled ? 'var(--shadow-topbar)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center gap-6">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_18px_rgba(124,58,237,0.55)] transition-shadow duration-200">
              <Shield className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Defend<span className="text-violet-400">Fi</span>
            </span>
          </Link>

          {/* ── Desktop Nav ────────────────────────────────────── */}
          <nav
            ref={navRef}
            className="hidden md:flex items-center gap-0.5 flex-1"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item);

              if (item.type === 'link') {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative px-3.5 py-2 text-[13.5px] font-medium rounded-lg',
                      'transition-colors duration-150 group'
                    )}
                    style={{
                      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    }}
                  >
                    {item.label}
                    <span
                      className={cn(
                        'absolute bottom-0.5 left-3.5 right-3.5 h-[2px] rounded-full bg-violet-500',
                        'transition-all duration-200 origin-left',
                        active
                          ? 'scale-x-100 opacity-100'
                          : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-40'
                      )}
                    />
                  </Link>
                );
              }

              // Mega trigger
              const isOpen = activeMega === item.id;
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => toggleMega(item.id)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    className={cn(
                      'relative flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-medium rounded-lg',
                      'transition-colors duration-150 group'
                    )}
                    style={{
                      color: active || isOpen ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'w-3 h-3 transition-transform duration-200',
                        isOpen && 'rotate-180'
                      )}
                    />
                    <span
                      className={cn(
                        'absolute bottom-0.5 left-3.5 right-3.5 h-[2px] rounded-full bg-violet-500',
                        'transition-all duration-200 origin-left',
                        active
                          ? 'scale-x-100 opacity-100'
                          : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-40'
                      )}
                    />
                  </button>

                  <MegaPanel columns={item.columns} visible={isOpen} />
                </div>
              );
            })}
          </nav>

          {/* ── Right Controls ──────────────────────────────────── */}
          <div className="ml-auto flex items-center gap-2.5">
            {isConnected && <ChainDropdown chainId={chainId} />}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification bell */}
            <button
              aria-label="Notifications"
              className={cn(
                'relative w-8 h-8 flex items-center justify-center rounded-full',
                'border border-[var(--border)]',
                'bg-black/[0.03] dark:bg-white/[0.03]',
                'hover:bg-black/[0.07] dark:hover:bg-white/[0.06]',
                'transition-colors duration-150 active:scale-[0.98]'
              )}
            >
              <Bell className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
            </button>

            {/* Wallet */}
            <ConnectButton
              chainStatus="none"
              showBalance={false}
              accountStatus="avatar"
              label="Connect"
            />

            {/* Tier badge */}
            <span
              className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide border border-[var(--border)]"
              style={{
                color: 'var(--text-muted)',
                background: 'var(--surface)',
              }}
            >
              FREE
            </span>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className={cn(
                'md:hidden w-8 h-8 flex items-center justify-center rounded-lg',
                'border border-[var(--border)]',
                'bg-black/[0.03] dark:bg-white/[0.03]',
                'hover:bg-black/[0.07] dark:hover:bg-white/[0.06]',
                'transition-colors'
              )}
            >
              {mobileOpen ? (
                <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Menu className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile slide-down menu ──────────────────────────────── */}
      <div
        className={cn(
          'fixed top-[68px] inset-x-0 z-40 md:hidden',
          'border-b border-[var(--border)] backdrop-blur-md',
          'overflow-hidden transition-all duration-200 ease-in-out',
          mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
        style={{ background: 'var(--background)' }}
      >
        <nav className="px-4 py-3 space-y-0.5" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => {
            const label = item.label;
            const href = item.type === 'link' ? item.href : '#';
            const active = isNavActive(item);

            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-colors duration-150',
                  active
                    ? 'bg-black/[0.05] dark:bg-white/[0.07]'
                    : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                )}
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {active && (
                  <span className="w-1 h-4 rounded-full bg-violet-500 flex-shrink-0" />
                )}
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Backdrop overlay when mega is open */}
      {activeMega && (
        <div
          className="fixed inset-0 z-40 md:block hidden"
          onClick={() => setActiveMega(null)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
