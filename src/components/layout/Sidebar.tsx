'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  ShieldAlert,
  Bell,
  Settings,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/PrimaryButton';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/risk-monitor', label: 'Risk Monitor', icon: ShieldAlert },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[216px] flex flex-col z-40 bg-[#13131A] border-r border-white/[0.06]">
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 px-5 h-[60px] border-b border-white/[0.06] flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Defend<span className="text-violet-400">Fi</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors duration-100',
                isActive
                  ? 'bg-white/[0.07] text-white'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]'
              )}
            >
              <Icon
                className={cn(
                  'w-[17px] h-[17px] flex-shrink-0 transition-colors',
                  isActive ? 'text-zinc-300' : 'text-zinc-600 group-hover:text-zinc-400'
                )}
                strokeWidth={isActive ? 2 : 1.75}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade */}
      <div className="px-3 pb-4 flex-shrink-0">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-violet-400" />
            <span className="text-[11.5px] font-semibold text-zinc-300">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed mb-2.5">
            Real-time alerts, API access, and advanced analytics.
          </p>
          <Button variant="primary" size="sm" className="w-full rounded-lg text-[11.5px]">
            Get Pro
          </Button>
        </div>
      </div>
    </aside>
  );
}
