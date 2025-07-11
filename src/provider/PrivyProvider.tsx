"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_API_KEY || ""}
      config={{
        loginMethods: ["email", "wallet", "google"],
        appearance: {
          theme: "light",
          accentColor: "#16007E",
          logo: "/Logo.png",
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors({
              shouldAutoConnect: true,
              // metadata: {
              //   name: "Fronsciers",
              //   description: "Academic Publishing Platform",
              //   url: "https://fronsciers.com",
              //   icons: ["/Logo.png"],
              // },
            }),
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
