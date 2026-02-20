'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { CHAIN_COLORS, CHAIN_NAMES } from '@/lib/wagmi';
import { CHART_COLORS } from '@/lib/utils';
import type { PortfolioSummary, TokenBalance, ChainDistribution, TokenAllocation } from '@/lib/risk/types';

// Well-known ERC20 tokens to check on each chain
const KNOWN_TOKENS: Record<number, Array<{ address: `0x${string}`; symbol: string; name: string; decimals: number; logoURI?: string }>> = {
  1: [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/9956/small/4943.png' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png' },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
  ],
  137: [
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  ],
};

// CoinGecko IDs for price fetching
const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  MATIC: 'matic-network',
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
  WBTC: 'wrapped-bitcoin',
  UNI: 'uniswap',
  ARB: 'arbitrum',
  OP: 'optimism',
};

async function fetchTokenPrices(symbols: string[]): Promise<Record<string, number>> {
  const ids = symbols
    .map((s) => COINGECKO_IDS[s])
    .filter(Boolean)
    .join(',');

  if (!ids) return {};

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return {};
    const data = await res.json();

    const prices: Record<string, number> = {};
    for (const [symbol, id] of Object.entries(COINGECKO_IDS)) {
      if (data[id]?.usd !== undefined) {
        prices[symbol] = data[id].usd;
      }
    }
    return prices;
  } catch {
    return {};
  }
}

async function fetchERC20Balance(
  address: string,
  tokenAddress: string,
  decimals: number,
  chainId: number
): Promise<bigint> {
  // Use a public RPC to call balanceOf
  const rpcUrls: Record<number, string> = {
    1: 'https://eth.llamarpc.com',
    137: 'https://polygon.llamarpc.com',
    42161: 'https://arbitrum.llamarpc.com',
    10: 'https://optimism.llamarpc.com',
    8453: 'https://base.llamarpc.com',
  };

  const rpc = rpcUrls[chainId];
  if (!rpc) return BigInt(0);

  try {
    // balanceOf(address) selector = 0x70a08231
    const data = `0x70a08231000000000000000000000000${address.slice(2).toLowerCase()}`;
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: tokenAddress, data }, 'latest'],
      }),
    });
    if (!res.ok) return BigInt(0);
    const json = await res.json();
    if (json.result && json.result !== '0x') {
      return BigInt(json.result);
    }
    return BigInt(0);
  } catch {
    return BigInt(0);
  }
}

async function fetchNativeBalance(address: string, chainId: number): Promise<bigint> {
  const rpcUrls: Record<number, string> = {
    1: 'https://eth.llamarpc.com',
    137: 'https://polygon.llamarpc.com',
    42161: 'https://arbitrum.llamarpc.com',
    10: 'https://optimism.llamarpc.com',
    8453: 'https://base.llamarpc.com',
  };

  const rpc = rpcUrls[chainId];
  if (!rpc) return BigInt(0);

  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    });
    if (!res.ok) return BigInt(0);
    const json = await res.json();
    if (json.result && json.result !== '0x') {
      return BigInt(json.result);
    }
    return BigInt(0);
  } catch {
    return BigInt(0);
  }
}

async function buildPortfolio(address: string): Promise<PortfolioSummary> {
  const chainIds = [1, 137, 42161, 10, 8453];
  const nativeSymbols: Record<number, string> = {
    1: 'ETH', 137: 'MATIC', 42161: 'ETH', 10: 'ETH', 8453: 'ETH',
  };

  // Fetch all native balances in parallel
  const nativeBalances = await Promise.all(
    chainIds.map(async (chainId) => {
      const balance = await fetchNativeBalance(address, chainId);
      return { chainId, balance, symbol: nativeSymbols[chainId] };
    })
  );

  // Collect all symbols for price fetching
  const allSymbols = ['ETH', 'MATIC', ...Object.values(KNOWN_TOKENS).flat().map((t) => t.symbol)];
  const uniqueSymbols = [...new Set(allSymbols)];
  const prices = await fetchTokenPrices(uniqueSymbols);

  const tokens: TokenBalance[] = [];

  // Add native tokens
  for (const { chainId, balance, symbol } of nativeBalances) {
    const formatted = Number(balance) / 1e18;
    if (formatted < 0.0001) continue;
    const usdValue = formatted * (prices[symbol] ?? 0);
    tokens.push({
      address: 'native',
      symbol,
      name: symbol === 'MATIC' ? 'Polygon' : 'Ethereum',
      decimals: 18,
      balance,
      balanceFormatted: formatted,
      usdValue,
      chainId,
    });
  }

  // Fetch ERC20 balances for chain 1 (Ethereum mainnet)
  const ethTokens = KNOWN_TOKENS[1] ?? [];
  const erc20Balances = await Promise.all(
    ethTokens.map(async (token) => {
      const balance = await fetchERC20Balance(address, token.address, token.decimals, 1);
      const formatted = Number(balance) / Math.pow(10, token.decimals);
      const usdValue = formatted * (prices[token.symbol] ?? 1); // stablecoins default to $1
      return { ...token, balance, balanceFormatted: formatted, usdValue, chainId: 1 };
    })
  );

  for (const token of erc20Balances) {
    if (token.balanceFormatted < 0.01) continue;
    tokens.push(token);
  }

  const totalUsdValue = tokens.reduce((sum, t) => sum + t.usdValue, 0);

  // Chain distribution
  const chainMap = new Map<number, number>();
  for (const token of tokens) {
    chainMap.set(token.chainId, (chainMap.get(token.chainId) ?? 0) + token.usdValue);
  }

  const chainDistribution: ChainDistribution[] = Array.from(chainMap.entries()).map(([chainId, usdValue]) => ({
    chainId,
    chainName: CHAIN_NAMES[chainId] ?? 'Unknown',
    usdValue,
    percentage: totalUsdValue > 0 ? (usdValue / totalUsdValue) * 100 : 0,
    color: CHAIN_COLORS[chainId] ?? '#7C3AED',
  }));

  // Token allocation
  const tokenMap = new Map<string, number>();
  for (const token of tokens) {
    tokenMap.set(token.symbol, (tokenMap.get(token.symbol) ?? 0) + token.usdValue);
  }

  const allocationByToken: TokenAllocation[] = Array.from(tokenMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([symbol, usdValue], i) => ({
      symbol,
      usdValue,
      percentage: totalUsdValue > 0 ? (usdValue / totalUsdValue) * 100 : 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  return {
    totalUsdValue,
    change24h: 0, // Would need historical data
    change24hPercent: 0,
    tokens: tokens.sort((a, b) => b.usdValue - a.usdValue),
    chainDistribution,
    allocationByToken,
  };
}

export function usePortfolio() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['portfolio', address],
    queryFn: () => buildPortfolio(address!),
    enabled: !!address,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}
