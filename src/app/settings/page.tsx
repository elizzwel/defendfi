'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Switch } from '@/components/ui/switch';
import { useWallet } from '@/hooks/useWallet';
import { shortenAddress } from '@/lib/utils';
import { SUPPORTED_CHAINS, CHAIN_NAMES } from '@/lib/wagmi';
import { Settings, Wallet, Bell, Globe, Shield, Copy, Check } from 'lucide-react';

export default function SettingsPage() {
  const { address, chainId, isConnected } = useWallet();
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState({
    highRisk: true,
    tvlDrop: true,
    newProtocol: false,
    weeklyReport: true,
  });
  const [displayPrefs, setDisplayPrefs] = useState({
    showUsdValues: true,
    compactNumbers: false,
    showTestnets: false,
  });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pt-10 pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your preferences and account</p>
      </div>

      {/* Wallet Info */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-zinc-300">Wallet</h2>
        </div>

        {isConnected && address ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Connected Address</p>
                <p className="text-sm font-mono text-zinc-200">{shortenAddress(address, 6)}</p>
              </div>
              <button
                onClick={copyAddress}
                className="p-2 rounded-lg hover:bg-white/[0.08] transition-colors text-zinc-500 hover:text-zinc-300"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Active Network</p>
                <p className="text-sm text-zinc-200">{chainId ? (CHAIN_NAMES[chainId] ?? 'Unknown') : '—'}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No wallet connected. Use the Connect Wallet button in the top right.</p>
        )}
      </GlassCard>

      {/* Supported Chains */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-zinc-300">Supported Networks</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUPPORTED_CHAINS.map((chain) => (
            <div
              key={chain.id}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                chainId === chain.id
                  ? 'border-purple-500/30 bg-purple-600/10'
                  : 'border-white/[0.06] bg-white/[0.03]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${chainId === chain.id ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
              <span className="text-xs text-zinc-300">{chain.name}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Notification Preferences */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-zinc-300">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: 'highRisk' as const, label: 'High Risk Alerts', desc: 'Notify when a protocol reaches high risk score' },
            { key: 'tvlDrop' as const, label: 'TVL Drop Alerts', desc: 'Notify on significant TVL drops (>20%)' },
            { key: 'newProtocol' as const, label: 'New Protocol Listings', desc: 'Notify when new protocols are tracked' },
            { key: 'weeklyReport' as const, label: 'Weekly Risk Report', desc: 'Weekly summary of your portfolio risk' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-500">{desc}</p>
              </div>
              <Switch
                checked={notifications[key]}
                onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [key]: v }))}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Display Preferences */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-zinc-300">Display</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: 'showUsdValues' as const, label: 'Show USD Values', desc: 'Display token balances in USD' },
            { key: 'compactNumbers' as const, label: 'Compact Numbers', desc: 'Show $1.2M instead of $1,200,000' },
            { key: 'showTestnets' as const, label: 'Show Testnets', desc: 'Include testnet chains in portfolio' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-500">{desc}</p>
              </div>
              <Switch
                checked={displayPrefs[key]}
                onCheckedChange={(v) => setDisplayPrefs((prev) => ({ ...prev, [key]: v }))}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Risk Engine Info */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-zinc-300">Risk Engine</h2>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          DefendFi uses a composite risk scoring model that weighs TVL size, 7-day momentum,
          estimated volatility, and whale concentration. Scores range from 0 (safest) to 100 (most risky).
          Protocol data is sourced from DeFiLlama and refreshed every 5 minutes.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: 'TVL Weight', value: '25%' },
            { label: 'Momentum', value: '30%' },
            { label: 'Volatility', value: '25%' },
          ].map(({ label, value }) => (
            <div key={label} className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="text-sm font-semibold text-purple-300 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
