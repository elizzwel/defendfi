import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'DefendFi',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo',
  chains: [mainnet, polygon, arbitrum, optimism, base],
  ssr: true,
});

export const SUPPORTED_CHAINS = [mainnet, polygon, arbitrum, optimism, base];

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  42161: 'Arbitrum',
  10: 'Optimism',
  8453: 'Base',
};

export const CHAIN_COLORS: Record<number, string> = {
  1: '#627EEA',
  137: '#8247E5',
  42161: '#28A0F0',
  10: '#FF0420',
  8453: '#0052FF',
};
