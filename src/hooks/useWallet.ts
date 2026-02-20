'use client';

import { useAccount, useBalance, useChainId } from 'wagmi';
import { CHAIN_NAMES } from '@/lib/wagmi';

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const chainId = useChainId();

  const { data: nativeBalance } = useBalance({
    address,
    query: { enabled: !!address },
  });

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chainId,
    chainName: chainId ? (CHAIN_NAMES[chainId] ?? 'Unknown') : null,
    nativeBalance: nativeBalance
      ? {
          value: nativeBalance.value,
          formatted: parseFloat(nativeBalance.formatted),
          symbol: nativeBalance.symbol,
          decimals: nativeBalance.decimals,
        }
      : null,
  };
}
