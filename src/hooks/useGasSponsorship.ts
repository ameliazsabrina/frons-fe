import { useState, useCallback } from "react";
import { Transaction, PublicKey } from "@solana/web3.js";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";

export enum TransactionType {
  MANUSCRIPT_SUBMISSION = "manuscript_submission",
  REVIEW_REWARD = "review_reward",
  AUTHOR_REWARD = "author_reward",
  DOCI_MINTING = "doci_minting",
  ESCROW_OPERATION = "escrow_operation",
}

interface SponsorshipResult {
  success: boolean;
  signature?: string;
  gasUsed?: number;
  error?: string;
  explorerUrl?: string;
}

interface UseGasSponsorshipProps {
  walletAddress?: string;
}

export function useGasSponsorship({ walletAddress }: UseGasSponsorshipProps) {
  const [isSponsoring, setIsSponsoring] = useState(false);
  const [sponsorshipError, setSponsorshipError] = useState<string | null>(null);
  const { authenticated, getAccessToken } = usePrivy();

  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

  const sponsorTransaction = useCallback(
    async (
      transaction: Transaction,
      transactionType: TransactionType,
      metadata?: Record<string, any>
    ): Promise<SponsorshipResult> => {
      if (!authenticated || !walletAddress) {
        throw new Error("User must be authenticated with a wallet");
      }

      setIsSponsoring(true);
      setSponsorshipError(null);

      try {
        console.log(`🎯 Sponsoring ${transactionType} transaction`);
        console.log(`💳 User wallet: ${walletAddress}`);

        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("Failed to get authentication token");
        }

        const serializedTransaction = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        });
        const base64Transaction = Buffer.from(serializedTransaction).toString(
          "base64"
        );

        console.log(
          "📦 Transaction serialized, size:",
          base64Transaction.length
        );

        const { data: responseData } = await axios.post(
          `${apiUrl}/transactions/sponsor-gas`,
          {
            serializedTransaction: base64Transaction,
            transactionType,
            userWallet: walletAddress,
            metadata,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!responseData.success) {
          console.error("❌ Sponsorship failed:", responseData.error);
          throw new Error(responseData.error || "Gas sponsorship failed");
        }

        console.log("✅ Transaction sponsored successfully");
        console.log("🔗 Transaction signature:", responseData.signature);
        console.log("💰 Gas used:", responseData.gasUsed);

        return {
          success: true,
          signature: responseData.signature,
          gasUsed: responseData.gasUsed,
          explorerUrl: responseData.explorerUrl,
        };
      } catch (error) {
        console.error("❌ Gas sponsorship error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Gas sponsorship failed";
        setSponsorshipError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsSponsoring(false);
      }
    },
    [authenticated, walletAddress, apiUrl, getAccessToken]
  );

  const prepareAndSponsorTransaction = useCallback(
    async (
      instructions: any[],
      transactionType: TransactionType,
      userPublicKey: PublicKey,
      metadata?: Record<string, any>
    ): Promise<SponsorshipResult> => {
      try {
        console.log(
          "🔧 Preparing transaction with instructions:",
          instructions.length
        );

        const transaction = new Transaction();
        transaction.add(...instructions);

        transaction.feePayer = userPublicKey;

        console.log("📝 Transaction prepared, sending for sponsorship");

        return await sponsorTransaction(transaction, transactionType, metadata);
      } catch (error) {
        console.error("❌ Transaction preparation error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Transaction preparation failed";
        setSponsorshipError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [sponsorTransaction]
  );

  const checkSponsorshipHealth = useCallback(async (): Promise<{
    isHealthy: boolean;
    feePayerBalance?: number;
    status?: string;
    error?: string;
  }> => {
    try {
      const { data } = await axios.get(`${apiUrl}/transactions/health`);

      return {
        isHealthy: data.status === "healthy",
        feePayerBalance: data.feePayerBalance,
        status: data.status,
      };
    } catch (error) {
      console.error("❌ Health check error:", error);
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : "Health check failed",
      };
    }
  }, [apiUrl]);

  const getSponsorshipStats = useCallback(async (): Promise<{
    success: boolean;
    stats?: {
      feePayerBalance: number;
      totalTransactionsSponsored: number;
      totalGasUsed: number;
      status: string;
    };
    error?: string;
  }> => {
    if (!authenticated) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Failed to get authentication token");
      }

      const { data } = await axios.get(`${apiUrl}/transactions/stats`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        success: true,
        stats: data.stats,
      };
    } catch (error) {
      console.error("❌ Stats fetch error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get statistics",
      };
    }
  }, [authenticated, getAccessToken, apiUrl]);

  return {
    isSponsoring,
    sponsorshipError,
    sponsorTransaction,
    prepareAndSponsorTransaction,
    checkSponsorshipHealth,
    getSponsorshipStats,
  };
}
