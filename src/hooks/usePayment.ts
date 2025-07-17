import { useState, useCallback } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { DEVNET_USDCF_ADDRESS, ESCROW_ADDRESS } from "@/lib/constants/solana";
import { useProgram } from "./useProgram";
import { useGasSponsorship, TransactionType } from "./useGasSponsorship";

interface UsePaymentProps {
  walletAddress?: string;
  wallet?: any;
}

export function usePayment({ walletAddress, wallet }: UsePaymentProps) {
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { connection } = useProgram();
  const { sponsorTransaction, isSponsoring, sponsorshipError } =
    useGasSponsorship({
      walletAddress,
    });

  const processPayment = useCallback(
    async (amount: number = 50): Promise<string> => {
      if (!wallet || !walletAddress) {
        throw new Error("Solana wallet not connected");
      }

      setPaymentProcessing(true);
      setPaymentError(null);

      try {
        console.log(
          `💳 Processing $${amount} USDC payment with gas sponsorship`
        );
        return await executePaymentWithSponsorship(amount);
      } catch (error) {
        console.error("❌ Payment failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Payment failed";
        setPaymentError(errorMessage);
        throw error;
      } finally {
        setPaymentProcessing(false);
      }
    },
    [wallet, walletAddress]
  );

  const executePaymentWithSponsorship = async (
    amount: number
  ): Promise<string> => {
    const userPublicKey = new PublicKey(walletAddress!);
    const usdcfMint = new PublicKey(DEVNET_USDCF_ADDRESS);
    const escrowPublicKey = new PublicKey(ESCROW_ADDRESS);

    console.log("🔧 Preparing USDC transfer transaction");

    const userTokenAccount = await getAssociatedTokenAddress(
      usdcfMint,
      userPublicKey
    );
    const escrowTokenAccount = await getAssociatedTokenAddress(
      usdcfMint,
      escrowPublicKey
    );

    const transaction = new Transaction();

    // Check if user token account exists
    const userAccountInfo = await connection.getAccountInfo(userTokenAccount);
    if (!userAccountInfo) {
      console.log("📦 Adding create user token account instruction");
      transaction.add(
        createAssociatedTokenAccountInstruction(
          userPublicKey,
          userTokenAccount,
          userPublicKey,
          usdcfMint
        )
      );
    }

    // Check if escrow token account exists
    const escrowAccountInfo = await connection.getAccountInfo(
      escrowTokenAccount
    );
    if (!escrowAccountInfo) {
      console.log("📦 Adding create escrow token account instruction");
      transaction.add(
        createAssociatedTokenAccountInstruction(
          userPublicKey,
          escrowTokenAccount,
          escrowPublicKey,
          usdcfMint
        )
      );
    }

    // Add USDC transfer instruction
    const transferAmount = amount * Math.pow(10, 6); // Convert to microUSDC
    console.log(
      `💰 Adding transfer instruction: ${amount} USDC (${transferAmount} microUSDC)`
    );
    transaction.add(
      createTransferInstruction(
        userTokenAccount,
        escrowTokenAccount,
        userPublicKey,
        transferAmount
      )
    );

    // Set user as fee payer (will be changed to platform fee payer in backend)
    transaction.feePayer = userPublicKey;

    // Get fresh blockhash
    console.log("🔄 Getting fresh blockhash...");
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    console.log("✍️ User signing transaction...");
    // User signs the transaction
    const signedTransaction = await wallet.signTransaction(transaction);

    console.log("🎯 Sponsoring transaction through backend...");
    // Sponsor the transaction through backend
    const sponsorshipResult = await sponsorTransaction(
      signedTransaction,
      TransactionType.MANUSCRIPT_SUBMISSION,
      {
        amount,
        type: "usdc_transfer",
        userWallet: walletAddress,
      }
    );

    if (!sponsorshipResult.success) {
      throw new Error(
        sponsorshipResult.error || "Transaction sponsorship failed"
      );
    }

    console.log(
      "✅ Payment successful with gas sponsorship:",
      sponsorshipResult.signature
    );
    console.log("💰 Gas used:", sponsorshipResult.gasUsed);

    return sponsorshipResult.signature!;
  };

  const processUSDCPayment = useCallback(async (): Promise<string> => {
    return processPayment(50); // $50 USDCF payment
  }, [processPayment]);

  return {
    paymentProcessing: paymentProcessing || isSponsoring,
    paymentError: paymentError || sponsorshipError,
    processPayment,
    processUSDCPayment,
  };
}
