import { useState, useCallback } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { DEVNET_USDCF_ADDRESS, ESCROW_ADDRESS } from "@/lib/constants/solana";
import { useProgram } from "./useProgram";

interface UsePaymentProps {
  walletAddress?: string;
  wallet?: any; // Privy wallet instance
}

export function usePayment({ walletAddress, wallet }: UsePaymentProps) {
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { connection } = useProgram();

  const processPayment = useCallback(
    async (amount: number = 50): Promise<string> => {
      if (!wallet || !walletAddress) {
        throw new Error("Solana wallet not connected");
      }

      setPaymentProcessing(true);
      setPaymentError(null);

      const maxAttempts = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`💳 Payment attempt ${attempt}/${maxAttempts}`);
          return await executePayment(amount);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(
            `⚠️ Payment attempt ${attempt} failed:`,
            lastError.message
          );

          // Check if it's a blockhash-related error that might benefit from retry
          const isRetryableError =
            lastError.message.includes("blockhash") ||
            lastError.message.includes("Blockhash not found") ||
            lastError.message.includes("Transaction simulation failed");

          if (!isRetryableError || attempt === maxAttempts) {
            break;
          }

          // Wait a bit before retrying to let blockhash refresh
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // If we get here, all attempts failed
      console.error("❌ All payment attempts failed:", lastError);
      const errorMessage =
        lastError?.message || "Payment failed after multiple attempts";
      setPaymentError(errorMessage);
      throw lastError || new Error(errorMessage);
    },
    [wallet, walletAddress, connection]
  );

  const executePayment = async (amount: number): Promise<string> => {
    const userPublicKey = new PublicKey(walletAddress!);
    const usdcfMint = new PublicKey(DEVNET_USDCF_ADDRESS);
    const escrowPublicKey = new PublicKey(ESCROW_ADDRESS);

    const userTokenAccount = await getAssociatedTokenAddress(
      usdcfMint,
      userPublicKey
    );
    const escrowTokenAccount = await getAssociatedTokenAddress(
      usdcfMint,
      escrowPublicKey
    );

    const transaction = new Transaction();

    const userAccountInfo = await connection.getAccountInfo(userTokenAccount);
    if (!userAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          userPublicKey,
          userTokenAccount,
          userPublicKey,
          usdcfMint
        )
      );
    }

    const escrowAccountInfo = await connection.getAccountInfo(
      escrowTokenAccount
    );
    if (!escrowAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          userPublicKey,
          escrowTokenAccount,
          escrowPublicKey,
          usdcfMint
        )
      );
    }

    const transferAmount = amount * Math.pow(10, 6);
    transaction.add(
      createTransferInstruction(
        userTokenAccount,
        escrowTokenAccount,
        userPublicKey,
        transferAmount
      )
    );

    transaction.feePayer = userPublicKey;

    console.log("🔄 Getting fresh blockhash...");
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    console.log("📡 Transaction prepared with fresh blockhash");
    console.log("🔧 Instructions:", transaction.instructions.length);
    console.log("🏗️ Blockhash:", blockhash.substring(0, 8) + "...");
    console.log("📊 Last valid block height:", lastValidBlockHeight);

    console.log("💳 Sending transaction via Privy wallet...");
    const signature = await wallet.sendTransaction(transaction, connection);

    console.log("⏳ Waiting for transaction confirmation...");
    const confirmation = await connection.confirmTransaction(
      signature,
      "confirmed"
    );

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
      );
    }

    console.log("✅ Payment successful:", signature);
    return signature;
  };

  const processUSDCPayment = useCallback(async (): Promise<string> => {
    return processPayment(50); // $50 USDCF payment
  }, [processPayment]);

  return {
    paymentProcessing,
    paymentError,
    processPayment,
    processUSDCPayment,
  };
}
