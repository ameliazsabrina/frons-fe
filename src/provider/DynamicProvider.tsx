"use client";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";

interface DynamicProviderProps {
  children: React.ReactNode;
}

export default function DynamicProvider({ children }: DynamicProviderProps) {
  const router = useRouter();
  const { isLoading } = useLoading();

  return (
    <DynamicContextProvider
      settings={{
        environmentId: "d73d73bd-6e9a-4603-b5a5-ab8e25f9a7cb",
        walletConnectors: [SolanaWalletConnectors],
        events: {
          onLogout: () => router.push("/"),
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
