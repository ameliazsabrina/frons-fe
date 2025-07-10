import { useState, useEffect, useCallback, useMemo } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import {
  SOLANA_CONFIG,
  DEVNET_FRONS_ADDRESS,
  DEVNET_USDCF_ADDRESS,
} from "@/lib/constants/solana";

export interface TokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
  uiAmount: number;
  mintAddress: string;
}

export interface WalletBalances {
  sol: number;
  tokens: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const TOKEN_CONFIG = [
  {
    symbol: "FRONS",
    mintAddress: DEVNET_FRONS_ADDRESS,
    decimals: 9,
  },
  {
    symbol: "USDCF",
    mintAddress: DEVNET_USDCF_ADDRESS,
    decimals: 6,
  },
];

export function useWalletBalances(walletAddress?: string): WalletBalances {
  const [balances, setBalances] = useState<WalletBalances>({
    sol: 0,
    tokens: [],
    isLoading: false,
    error: null,
    refresh: async () => {},
  });

  const connection = useMemo(
    () => new Connection(SOLANA_CONFIG.RPC_URL, SOLANA_CONFIG.COMMITMENT),
    []
  );

  const fetchBalances = useCallback(async () => {
    if (!walletAddress) {
      setBalances((prev) => ({
        ...prev,
        sol: 0,
        tokens: [],
        isLoading: false,
        error: null,
      }));
      return;
    }

    setBalances((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const publicKey = new PublicKey(walletAddress);

      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;

      // Fetch token balances
      const tokenBalances: TokenBalance[] = [];

      for (const tokenConfig of TOKEN_CONFIG) {
        try {
          const mintPublicKey = new PublicKey(tokenConfig.mintAddress);
          const associatedTokenAddress = await getAssociatedTokenAddress(
            mintPublicKey,
            publicKey
          );

          try {
            const tokenAccount = await getAccount(
              connection,
              associatedTokenAddress
            );
            const balance = Number(tokenAccount.amount);
            const uiAmount = balance / Math.pow(10, tokenConfig.decimals);

            tokenBalances.push({
              symbol: tokenConfig.symbol,
              balance,
              decimals: tokenConfig.decimals,
              uiAmount,
              mintAddress: tokenConfig.mintAddress,
            });
          } catch (accountError) {
            // Token account doesn't exist, balance is 0
            tokenBalances.push({
              symbol: tokenConfig.symbol,
              balance: 0,
              decimals: tokenConfig.decimals,
              uiAmount: 0,
              mintAddress: tokenConfig.mintAddress,
            });
          }
        } catch (tokenError) {
          console.error(
            `Error fetching ${tokenConfig.symbol} balance:`,
            tokenError
          );
          // Add token with 0 balance on error
          tokenBalances.push({
            symbol: tokenConfig.symbol,
            balance: 0,
            decimals: tokenConfig.decimals,
            uiAmount: 0,
            mintAddress: tokenConfig.mintAddress,
          });
        }
      }

      setBalances((prev) => ({
        ...prev,
        sol: solAmount,
        tokens: tokenBalances,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
      setBalances((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch wallet balances",
      }));
    }
  }, [walletAddress, connection]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    ...balances,
    refresh: fetchBalances,
  };
}
