import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";
import { useMemo } from "react";
import { SOLANA_CONFIG } from "@/constants/solana";
import IDL from "@/constants/fronsciers.json";

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet as any, {
      commitment: SOLANA_CONFIG.COMMITMENT,
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL as any, SOLANA_CONFIG.PROGRAM_ID, provider);
  }, [provider]);

  return { program, provider, connection, wallet };
};
