import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { utils } from "@project-serum/anchor";
import { SOLANA_CONFIG, PDA_SEEDS } from "@/lib/constants/solana";
import { useProgram } from "./useProgram";

export const usePDAs = (userWallet?: PublicKey) => {
  const { program } = useProgram();

  const pdas = useMemo(() => {
    if (!userWallet || !program) return null;

    const [userPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.USER), userWallet.toBuffer()],
      new PublicKey(SOLANA_CONFIG.PROGRAM_ID)
    );

    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.ESCROW), userWallet.toBuffer()],
      new PublicKey(SOLANA_CONFIG.PROGRAM_ID)
    );

    const [dociRegistryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.DOCI_REGISTRY)],
      new PublicKey(SOLANA_CONFIG.PROGRAM_ID)
    );

    return {
      user: userPDA,
      escrow: escrowPDA,
      dociRegistry: dociRegistryPDA,
    };
  }, [userWallet, program]);

  const getManuscriptPDA = (manuscriptId: string) => {
    if (!program) return null;
    const [manuscriptPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.MANUSCRIPT), Buffer.from(manuscriptId)],
      new PublicKey(SOLANA_CONFIG.PROGRAM_ID)
    );
    return manuscriptPDA;
  };

  const getDOCIManuscriptPDA = (doci: string) => {
    if (!program) return null;
    const [dociPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.DOCI_MANUSCRIPT), Buffer.from(doci)],
      new PublicKey(SOLANA_CONFIG.PROGRAM_ID)
    );
    return dociPDA;
  };

  return { pdas, getManuscriptPDA, getDOCIManuscriptPDA };
};
