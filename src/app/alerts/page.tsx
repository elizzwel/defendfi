'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { useWallet } from '@/hooks/useWallet';
import { GlassCard } from '@/components/ui/GlassCard';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bell, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import type { AlertCreate } from '@/lib/risk/types';

const CONDITION_OPTIONS = [
  'TVL drops below threshold',
  'Risk score exceeds threshold',
  'TVL drops > 20% in 24h',
  'TVL drops > 50% in 7d',
  'Whale concentration > 80%',
  'Protocol paused or exploited',
];

const PROTOCOL_SUGGESTIONS = [
  'Aave', 'Compound', 'Uniswap', 'Curve', 'MakerDAO', 'Lido',
  'Convex', 'Balancer', 'Yearn', 'Synthetix', 'dYdX', 'GMX',
];

function CreateAlertModal({ userAddress, onClose }: { userAddress: string; onClose: () => void }) {
  const { createAlert } = useAlerts(userAddress);
  const [protocol, setProtocol] = useState('');
  const [condition, setCondition] = useState(CONDITION_OPTIONS[0]);
  const [threshold, setThreshold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol || !condition) return;

    setIsSubmitting(true);
    try {
      const alert: AlertCreate = {
        user_address: userAddress,
        protocol,
        condition,
        threshold: threshold ? parseFloat(threshold) : null,
        enabled: true,
      };
      await createAlert.mutateAsync(alert);
      onClose();
    } catch (err) {
      console.error('Failed to create alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-xl text-[13px] focus:outline-none transition-all border border-[var(--border)] focus:border-violet-500/40';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div>
        <label className="text-micro mb-1.5 block">Protocol</label>
        <input
          type="text"
          list="protocols"
          value={protocol}
          onChange={(e) => setProtocol(e.target.value)}
          placeholder="e.g. Aave, Uniswap..."
          className={inputClass}
          style={{
            background: 'var(--surface)',
            color: 'var(--text-primary)',
          }}
          required
        />
        <datalist id="protocols">
          {PROTOCOL_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
        </datalist>
      </div>

      <div>
        <label className="text-micro mb-1.5 block">Condition</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className={inputClass}
          style={{
            background: 'var(--surface-raised)',
            color: 'var(--text-primary)',
          }}
        >
          {CONDITION_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-micro mb-1.5 block">Threshold (optional)</label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="e.g. 1000000 for $1M TVL"
          className={inputClass}
          style={{
            background: 'var(--surface)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 rounded-xl border border-[var(--border)] text-[13px] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          style={{ color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !protocol}
          className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-[13px] text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Create Alert
        </button>
      </div>
    </form>
  );
}

export default function AlertsPage() {
  const { isConnected, address } = useWallet();
  const { alerts, isLoading, toggleAlert, deleteAlert } = useAlerts(address);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-10">
        <div className="mb-6">
          <h1 className="text-section">Alerts</h1>
          <p className="text-data-secondary mt-0.5">Protocol risk notifications</p>
        </div>
        <GlassCard className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Bell className="w-7 h-7 text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-data-primary">Connect your wallet</p>
            <p className="text-data-secondary mt-1">Connect to manage your risk alerts</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-section">Alerts</h1>
          <p className="text-data-secondary mt-0.5">Protocol risk notifications</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-[13px] text-white font-semibold transition-colors">
              <Plus className="w-4 h-4" />
              New Alert
            </button>
          </DialogTrigger>
          <DialogContent
            className="max-w-md border border-[var(--border)]"
            style={{ background: 'var(--surface-raised)' }}
          >
            <DialogHeader>
              <DialogTitle className="text-card-heading">Create Alert</DialogTitle>
            </DialogHeader>
            <CreateAlertModal
              userAddress={address ?? ''}
              onClose={() => setIsModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Supabase notice */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Alerts are stored in Supabase. Configure your{' '}
          <code className="text-amber-400 bg-amber-500/[0.08] px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code>{' '}
          and{' '}
          <code className="text-amber-400 bg-amber-500/[0.08] px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
          in <code style={{ color: 'var(--text-secondary)' }}>.env.local</code> to enable persistence.
        </p>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <GlassCard key={alert.id} hover className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-data-primary truncate">{alert.protocol}</p>
                  <p className="text-data-secondary truncate">{alert.condition}</p>
                  {alert.threshold && (
                    <p className="text-micro">
                      Threshold: {alert.threshold.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Switch
                  checked={alert.enabled}
                  onCheckedChange={(enabled) =>
                    toggleAlert.mutate({ id: alert.id, enabled })
                  }
                />
                <button
                  onClick={() => deleteAlert.mutate(alert.id)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="flex flex-col items-center justify-center py-16 gap-3">
          <div
            className="w-12 h-12 rounded-2xl border flex items-center justify-center"
            style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
          >
            <Bell className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="text-center">
            <p className="text-data-primary">No alerts yet</p>
            <p className="text-data-secondary mt-1">Create an alert to get notified about protocol risks</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-1 px-4 py-2 rounded-xl bg-violet-600/15 border border-violet-500/20 text-[13px] text-violet-400 hover:bg-violet-600/25 transition-colors"
          >
            Create your first alert
          </button>
        </GlassCard>
      )}
    </div>
  );
}
