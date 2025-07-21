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
      console.log("🚀 sponsorTransaction called with:");
      console.log("  - authenticated:", authenticated);
      console.log("  - walletAddress:", walletAddress);
      console.log("  - transactionType:", transactionType);
      console.log("  - metadata:", metadata);

      if (!authenticated || !walletAddress) {
        const error = `User must be authenticated with a wallet. authenticated=${authenticated}, walletAddress=${walletAddress}`;
        console.error("❌ Authentication check failed:", error);
        throw new Error(error);
      }

      console.log("✅ Authentication check passed");
      setIsSponsoring(true);
      setSponsorshipError(null);

      try {
        console.log(`🎯 Sponsoring ${transactionType} transaction`);
        console.log(`💳 User wallet: ${walletAddress}`);
        console.log(`🔧 API URL: ${apiUrl}`);

        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("Failed to get authentication token");
        }

        console.log("📊 Transaction before serialization:");
        console.log("  - Fee payer:", transaction.feePayer?.toString());
        console.log("  - Recent blockhash:", transaction.recentBlockhash);
        console.log("  - Instructions count:", transaction.instructions.length);
        console.log("  - Signatures count:", transaction.signatures.length);
        console.log(
          "  - Signature details:",
          transaction.signatures.map((sig, i) => ({
            index: i,
            publicKey: sig.publicKey.toString(),
            hasSignature: !!sig.signature,
            signatureLength: sig.signature ? sig.signature.length : 0,
          }))
        );

        console.log(
          "🔍 Testing signature verification before serialization..."
        );
        try {
          for (let i = 0; i < transaction.signatures.length; i++) {
            const sig = transaction.signatures[i];
            if (sig.signature) {
              console.log(
                `  - Signature ${i}: ${
                  sig.signature.length
                } bytes, first 8: [${Array.from(sig.signature.slice(0, 8)).join(
                  ","
                )}]`
              );
            } else {
              console.log(`  - Signature ${i}: null/undefined`);
            }
          }
        } catch (verifyError) {
          console.warn("⚠️ Signature verification test failed:", verifyError);
        }

        console.log("📦 Attempting transaction serialization...");
        let serializedTransaction;
        try {
          serializedTransaction = transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          });
          console.log(
            "✅ Transaction serialization successful, size:",
            serializedTransaction.length,
            "bytes"
          );
        } catch (serializeError) {
          console.error("❌ Transaction serialization failed:", serializeError);
          console.error(
            "Error details:",
            serializeError instanceof Error ? serializeError.message : "Unknown"
          );

          console.error("🔍 Transaction state during serialization failure:");
          console.error("  - Fee payer:", transaction.feePayer?.toString());
          console.error("  - Blockhash:", transaction.recentBlockhash);
          console.error("  - Instructions:", transaction.instructions.length);
          console.error("  - Signatures:", transaction.signatures.length);
          transaction.signatures.forEach((sig, i) => {
            console.error(
              `  - Signature ${i}: ${sig.publicKey.toString()} (signed: ${!!sig.signature})`
            );
          });

          throw new Error(
            `Transaction serialization failed: ${
              serializeError instanceof Error
                ? serializeError.message
                : "Unknown error"
            }`
          );
        }

        const base64Transaction = Buffer.from(serializedTransaction).toString(
          "base64"
        );

        console.log("📦 Transaction serialization details:");
        console.log(
          "  - Serialized size:",
          serializedTransaction.length,
          "bytes"
        );
        console.log("  - Base64 size:", base64Transaction.length, "chars");
        console.log(
          "  - Base64 preview:",
          base64Transaction.substring(0, 100) + "..."
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

        console.log("🔑 Fetching backend fee payer public key...");
        const feePayerResponse = await fetch(
          `${apiUrl}/transactions/fee-payer-public-key`
        );
        console.log(
          "📡 Fee payer response status:",
          feePayerResponse.status,
          feePayerResponse.statusText
        );

        if (!feePayerResponse.ok) {
          const errorText = await feePayerResponse.text();
          console.error("❌ Fee payer fetch failed:", errorText);
          throw new Error(
            `Failed to fetch fee payer public key: ${feePayerResponse.status} ${errorText}`
          );
        }

        const feePayerData = await feePayerResponse.json();
        console.log("📦 Fee payer data received:", feePayerData);

        if (!feePayerData.success) {
          console.error("❌ Fee payer data indicates failure:", feePayerData);
          throw new Error(
            feePayerData.error || "Failed to get fee payer public key"
          );
        }

        const feePayerPublicKey = new PublicKey(feePayerData.feePayerPublicKey);
        console.log("✅ Backend fee payer public key:", feePayerPublicKey.toString());

        const transaction = new Transaction();
        transaction.add(...instructions);

        console.log(
          "🏦 Setting fee payer to backend fee payer:",
          feePayerPublicKey.toString()
        );
        transaction.feePayer = feePayerPublicKey;

        console.log("📝 Transaction prepared with correct fee payer, sending for sponsorship");

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
    [sponsorTransaction, apiUrl]
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
