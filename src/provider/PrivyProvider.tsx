"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_API_KEY || ""}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || ""}
      config={{
        loginMethods: ["wallet", "google", "github"],
        appearance: {
          theme: "light",
          accentColor: "#16007E",
        },

        embeddedWallets: {
          createOnLogin: "all-users",
          requireUserPasswordOnCreate: false,
          solana: {
            createOnLogin: "all-users",
          },
        },
        solanaClusters: [
          {
            name: "devnet",
            rpcUrl:
              "https://devnet.helius-rpc.com/?api-key=3451b7c4-f90f-451e-a4b5-c51966815b43",
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
