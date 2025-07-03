import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { SOLANA_CONFIG } from "@/constants/solana";
import IDL from "@/constants/fronsciers.json";

export const useProgram = () => {
  const { wallets } = useWallets();
  const primaryWallet = wallets[0];

  const connection = useMemo(
    () => new Connection(SOLANA_CONFIG.RPC_URL, SOLANA_CONFIG.COMMITMENT),
    []
  );

  const wallet = useMemo(() => {
    if (!primaryWallet) return null;

    return {
      publicKey: primaryWallet.address
        ? new PublicKey(primaryWallet.address)
        : null,
    };
  }, [primaryWallet]);

  const provider = useMemo(() => {
    if (!wallet || !wallet.publicKey) return null;

    return new AnchorProvider(connection, wallet as any, {
      commitment: SOLANA_CONFIG.COMMITMENT,
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL as any, SOLANA_CONFIG.PROGRAM_ID, provider);
  }, [provider]);

  return {
    program,
    provider,
    connection,
    wallet,
    publicKey: wallet?.publicKey || null,
    connected: !!wallet?.publicKey,
  };
};
