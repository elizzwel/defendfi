'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bell } from 'lucide-react';

export function TopNavbar() {
  return (
    <header className="fixed top-0 right-0 left-[216px] h-[60px] flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#13131A]/90 backdrop-blur-sm z-30">
      {/* Intentionally empty left — page title lives in page content */}
      <div />

      <div className="flex items-center gap-2.5">
        {/* Notification */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
          <Bell className="w-3.5 h-3.5 text-zinc-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
        </button>

        {/* Wallet — RainbowKit pill */}
        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="avatar"
          label="Connect"
        />
      </div>
    </header>
  );
}
