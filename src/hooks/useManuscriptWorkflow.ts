import { useState, useCallback } from "react";
import { useProgram } from "./useProgram";
import { usePDAs } from "./usePDAs";
import { ManuscriptSubmission } from "@/types/fronsciers";
import { PublicKey } from "@solana/web3.js";
import { web3 } from "@project-serum/anchor";
import { useLoading } from "@/context/LoadingContext";

export const useManuscriptWorkflow = () => {
  const { program, wallet } = useProgram();
  const { pdas, getManuscriptPDA } = usePDAs(wallet?.publicKey || undefined);
  const { isLoading } = useLoading();

  const registerUser = useCallback(
    async (education: string) => {
      if (!program || !wallet || !wallet.publicKey || !pdas) {
        throw new Error("Wallet not connected or program not available");
      }

      try {
        const tx = await program.methods
          .registerUser(education)
          .accounts({
            user: pdas.user,
            wallet: wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();

        console.log("User registered successfully:", tx);
        return tx;
      } catch (error) {
        console.error("Failed to register user:", error);
        throw error;
      }
    },
    [program, wallet, pdas]
  );

  const submitManuscript = useCallback(
    async (submission: ManuscriptSubmission) => {
      if (!program || !wallet || !wallet.publicKey || !pdas) {
        throw new Error("Wallet not connected or program not available");
      }

      try {
        const manuscriptId = `${Date.now()}-${wallet.publicKey.toString()}`;
        const manuscriptPDA = getManuscriptPDA(manuscriptId);

        if (!manuscriptPDA) {
          throw new Error("Failed to generate manuscript PDA");
        }

        const tx = await program.methods
          .submitManuscript(submission.ipfsHash)
          .accounts({
            manuscript: manuscriptPDA,
            user: pdas.user,
            author: wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();

        console.log("Manuscript submitted successfully:", tx);
        return { tx, manuscriptId, manuscriptPDA };
      } catch (error) {
        console.error("Failed to submit manuscript:", error);
        throw error;
      }
    },
    [program, wallet, pdas, getManuscriptPDA]
  );

  const reviewManuscript = useCallback(
    async (manuscriptPDA: PublicKey, decision: string) => {
      if (!program || !wallet || !wallet.publicKey) {
        throw new Error("Wallet not connected or program not available");
      }

      try {
        const tx = await program.methods
          .reviewManuscript(decision)
          .accounts({
            manuscript: manuscriptPDA,
            reviewer: wallet.publicKey,
          })
          .rpc();

        console.log(`Manuscript ${decision.toLowerCase()} successfully:`, tx);
        return tx;
      } catch (error) {
        console.error("Failed to review manuscript:", error);
        throw error;
      }
    },
    [program, wallet]
  );

  const mintDOCINFT = useCallback(
    async (manuscriptPDA: PublicKey, title: string, description: string) => {
      if (!program || !wallet || !wallet.publicKey || !pdas) {
        throw new Error("Wallet not connected or program not available");
      }

      try {
        const tx = await program.methods
          .mintDociNft(title, description)
          .accounts({
            manuscript: manuscriptPDA,
            dociRegistry: pdas.dociRegistry,
            author: wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();

        console.log("DOCI NFT minted successfully:", tx);
        return { tx };
      } catch (error) {
        console.error("Failed to mint DOCI NFT:", error);
        throw error;
      }
    },
    [program, wallet, pdas]
  );

  return {
    registerUser,
    submitManuscript,
    reviewManuscript,
    mintDOCINFT,
    isLoading,
  };
};
