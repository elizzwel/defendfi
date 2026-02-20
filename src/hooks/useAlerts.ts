'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Alert, AlertCreate } from '@/lib/risk/types';

export function useAlerts(userAddress?: string) {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ['alerts', userAddress],
    queryFn: async (): Promise<Alert[]> => {
      if (!userAddress) return [];
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_address', userAddress.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userAddress,
  });

  const createAlert = useMutation({
    mutationFn: async (alert: AlertCreate) => {
      const { data, error } = await supabase
        .from('alerts')
        .insert([{ ...alert, user_address: alert.user_address.toLowerCase() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', userAddress] });
    },
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('alerts')
        .update({ enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', userAddress] });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alerts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', userAddress] });
    },
  });

  return {
    alerts: alertsQuery.data ?? [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    createAlert,
    toggleAlert,
    deleteAlert,
  };
}
