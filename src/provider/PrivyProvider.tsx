"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  const isProduction = process.env.NEXT_PUBLIC_ENV === "production";
  const isDevelopment = process.env.NEXT_PUBLIC_ENV === "development";

  // Environment-specific configuration
  const getSolanaClusters = () => {
    if (isProduction) {
      return [
        {
          name: "mainnet-beta",
          rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
        }
      ];
    } else {
      return [
        {
          name: "devnet",
          rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
        },
        {
          name: "mainnet-beta", 
          rpcUrl: "https://api.mainnet-beta.solana.com",
        },
      ];
    }
  };

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_API_KEY || ""}
      config={{
        // Authentication methods
        loginMethods: ["email", "google", "github", "wallet"],
        
        // UI Configuration
        appearance: {
          theme: "light",
          accentColor: "#16007E",
          logo: isProduction ? "https://fronsciers.com/logo.png" : "/Logo.png",
          walletChainType: "solana-only",
          showWalletLoginFirst: false,
        },

        // Embedded wallet configuration for Solana
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },

        // Environment-specific Solana cluster configuration
        solanaClusters: getSolanaClusters() as any,

        // External wallet configuration  
        externalWallets: {
          solana: {
            connectors: isProduction 
              ? ["phantom", "solflare"] as any
              : ["phantom", "solflare", "backpack", "coinbase"] as any,
          },
        },

        // Privacy and legal
        legal: {
          termsAndConditionsUrl: "https://fronsciers.com/terms",
          privacyPolicyUrl: "https://fronsciers.com/privacy",
        },

        // MFA configuration for academic users
        mfa: {
          noPromptOnMfaRequired: false,
        },

        // Custom authentication flows - removed due to API changes

        // Development-specific settings
        ...(isDevelopment && {
          defaultChain: "solana:devnet",
        }),

        // Production-specific settings
        ...(isProduction && {
          defaultChain: "solana:mainnet",
        }),
      }}
    >
      {children}
    </PrivyProvider>
  );
}
