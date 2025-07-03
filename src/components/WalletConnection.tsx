import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";

export const WalletConnection: React.FC = () => {
  const { connected, publicKey } = useWallet();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Connected: {publicKey.toString().slice(0, 4)}...
          {publicKey.toString().slice(-4)}
        </div>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
      <p className="text-gray-600">
        Connect your Solana wallet to access Fronsciers
      </p>
      <WalletMultiButton />
    </div>
  );
};
