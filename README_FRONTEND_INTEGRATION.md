# Fronsciers Frontend Integration Guide

This guide provides comprehensive instructions for integrating your frontend application with the Fronsciers smart contract for academic manuscript publishing and NFT minting on Solana.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Dependencies Installation](#dependencies-installation)
4. [Smart Contract Integration](#smart-contract-integration)
5. [Core Hooks and Services](#core-hooks-and-services)
6. [React Components](#react-components)
7. [User Workflows](#user-workflows)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Deployment](#deployment)

## Prerequisites

- Node.js 18+ and npm/yarn
- Solana CLI tools installed
- Basic knowledge of React/TypeScript
- Understanding of Solana wallet integration
- Backend API for metadata management (see `README_BACKEND_INTEGRATION.md`)

## Environment Setup

### 1. Environment Variables

Create a `.env.local` file in your frontend project:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=28VkA76EcTTN746SxZyYT8NTte9gofeBQ2L4N8hfYPgd

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_NFT_MINTING=true
NEXT_PUBLIC_ENABLE_PEER_REVIEW=true
```

### 2. TypeScript Configuration

Update your `tsconfig.json` to include Solana types:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/components/*": ["./src/components/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Dependencies Installation

Install required dependencies:

```bash
# Core Solana and Anchor dependencies
npm install @solana/web3.js @solana/spl-token @project-serum/anchor

# Wallet adapter dependencies
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-base @solana/wallet-adapter-wallets

# UI and utility dependencies
npm install axios socket.io-client react-hot-toast lucide-react

# UI component libraries (optional)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast @radix-ui/react-select

# Development dependencies
npm install --save-dev @types/bn.js

# Additional utility libraries
npm install bn.js buffer crypto-js bs58
```

### Dependencies Overview

| Package                    | Purpose                               |
| -------------------------- | ------------------------------------- |
| `@solana/web3.js`          | Core Solana blockchain interaction    |
| `@solana/spl-token`        | SPL token operations                  |
| `@project-serum/anchor`    | Anchor framework for Solana programs  |
| `@solana/wallet-adapter-*` | Wallet connection and management      |
| `axios`                    | HTTP client for backend API calls     |
| `socket.io-client`         | Real-time updates                     |
| `react-hot-toast`          | User notifications                    |
| `bn.js`                    | Big number handling for token amounts |
| `bs58`                     | Base58 encoding/decoding              |

## Smart Contract Integration

### 1. Wallet Provider Setup

Create `src/contexts/WalletContextProvider.tsx`:

```typescript
import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Import wallet adapter CSS
require("@solana/wallet-adapter-react-ui/styles.css");

interface Props {
  children: ReactNode;
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  // Set network to devnet, testnet, or mainnet-beta
  const network =
    process.env.NODE_ENV === "production"
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet;

  // Use environment variable or fallback to Solana's public RPC
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }
    return clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

### 2. Constants Configuration

Create `src/constants/solana.ts`:

```typescript
export const SOLANA_CONFIG = {
  PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID!,
  RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
  WS_URL: process.env.NEXT_PUBLIC_SOLANA_WS_URL!,
  COMMITMENT: "confirmed" as const,
} as const;

export const PDA_SEEDS = {
  USER: "user",
  MANUSCRIPT: "manuscript",
  ESCROW: "escrow",
  DOCI_REGISTRY: "doci_registry",
  DOCI_MANUSCRIPT: "doci_manuscript",
} as const;

export const MANUSCRIPT_STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
} as const;

export const DECISION_TYPES = {
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
} as const;

// Smart Contract Constants (in lamports - 9 decimals)
export const CONTRACT_CONSTANTS = {
  SUBMISSION_FEE: 50_000_000_000, // 50 SOL
  FRONS_REWARD: 100_000_000, // 0.1 SOL
  REVIEWER_REWARD: 60_000_000, // 0.06 SOL
  MIN_REVIEWS: 3,
  CURRENT_YEAR: 2024,
  DOCI_PREFIX: "10.fronsciers/manuscript",
} as const;

// Error Codes from Smart Contract
export const PROGRAM_ERRORS = {
  SUBMISSION_REQUIREMENTS_NOT_MET: "User does not meet submission requirements",
  INVALID_EDUCATION_LEVEL: "Invalid education level",
  INSUFFICIENT_PUBLISHED_PAPERS: "Insufficient published papers",
  INVALID_DECISION: "Invalid decision. Must be 'Accepted' or 'Rejected'",
  MISSING_CV_HASH: "CV hash is required",
  MISSING_IPFS_HASH: "IPFS hash is required",
  REVIEWER_ALREADY_ADDED: "Manuscript already reviewed by this reviewer",
  DECISION_ALREADY_ADDED: "Manuscript already has this decision",
  NOT_ENOUGH_REVIEWS: "Not enough reviews to make a decision",
  MANUSCRIPT_NOT_PENDING: "Manuscript is not pending",
  MANUSCRIPT_NOT_ACCEPTED: "Manuscript is not accepted",
} as const;
```

### 2. TypeScript Interfaces

Create `src/types/fronsciers.ts`:

```typescript
import { PublicKey } from "@solana/web3.js";

export interface User {
  wallet: PublicKey;
  education: string;
  publishedPapers: number;
  bump: number;
}

export interface Manuscript {
  author: PublicKey;
  ipfsHash: string;
  status: string;
  reviewers: PublicKey[];
  decisions: string[];
  submissionTime: number;
  doci?: string;
  dociMint?: PublicKey;
  publicationDate?: number;
  bump: number;
}

export interface DOCIManuscript {
  doci: string;
  manuscriptAccount: PublicKey;
  mintAddress: PublicKey;
  manuscriptHash: number[];
  authors: PublicKey[];
  peerReviewers: PublicKey[];
  publicationDate: number;
  version: number;
  citationCount: number;
  accessCount: number;
  metadataUri: string;
  royaltyConfig: RoyaltyConfig;
  bump: number;
}

export interface RoyaltyConfig {
  authorsShare: number;
  platformShare: number;
  reviewersShare: number;
}

export interface DOCIRegistry {
  totalPublished: number;
  currentYear: number;
  nextSequence: number;
  authority: PublicKey;
  bump: number;
}

export interface EscrowAccount {
  authority: PublicKey;
  bump: number;
}

export interface ManuscriptSubmission {
  ipfsHash: string;
  title: string;
  description: string;
  authors: string[];
  keywords: string[];
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    files: Array<{
      type: string;
      uri: string;
    }>;
    category: string;
    creators: Array<{
      address: string;
      share: number;
    }>;
  };
}
```

## Core Hooks and Services

### 1. IDL Definition

First, create the IDL file `src/idl/fronsciers.json` by copying from your Anchor build:

```bash
# Copy IDL from your Anchor project
cp target/idl/fronsciers.json src/idl/fronsciers.json
```

Create `src/types/program.ts`:

```typescript
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

// Import the IDL
import FronsciersIDL from "@/idl/fronsciers.json";

export type FronsciersProgram = Program<typeof FronsciersIDL>;

// Type definitions for accounts
export interface ProgramAccount<T> {
  publicKey: PublicKey;
  account: T;
}

// Helper type for instruction contexts
export type InstructionResult = {
  signature: string;
  slot: number;
  confirmationStatus: "processed" | "confirmed" | "finalized";
};
```

### 2. Program Connection Hook

Create `src/hooks/useProgram.ts`:

```typescript
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN, Idl } from "@project-serum/anchor";
import { useMemo } from "react";
import { SOLANA_CONFIG } from "@/constants/solana";
import FronsciersIDL from "@/idl/fronsciers.json";
import { FronsciersProgram } from "@/types/program";

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return new AnchorProvider(connection, wallet as any, {
      commitment: SOLANA_CONFIG.COMMITMENT,
      preflightCommitment: SOLANA_CONFIG.COMMITMENT,
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(
      FronsciersIDL as Idl,
      SOLANA_CONFIG.PROGRAM_ID,
      provider
    ) as FronsciersProgram;
  }, [provider]);

  // Helper function to get recent blockhash
  const getRecentBlockhash = async () => {
    return await connection.getLatestBlockhash(SOLANA_CONFIG.COMMITMENT);
  };

  // Helper function to confirm transaction
  const confirmTransaction = async (signature: string) => {
    const { blockhash, lastValidBlockHeight } = await getRecentBlockhash();
    return await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      SOLANA_CONFIG.COMMITMENT
    );
  };

  return {
    program,
    provider,
    connection,
    wallet,
    getRecentBlockhash,
    confirmTransaction,
  };
};
```

### 3. PDA Generation Hook

Create `src/hooks/usePDAs.ts`:

```typescript
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { SOLANA_CONFIG, PDA_SEEDS } from "@/constants/solana";
import { useProgram } from "./useProgram";

export const usePDAs = (userWallet?: PublicKey) => {
  const { program } = useProgram();

  const pdas = useMemo(() => {
    if (!userWallet || !program) return null;

    const programId = new PublicKey(SOLANA_CONFIG.PROGRAM_ID);

    // User PDA: [b"user", user_wallet.key()]
    const [userPDA, userBump] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.USER), userWallet.toBuffer()],
      programId
    );

    // Escrow PDA: [b"escrow"] (global escrow, no user-specific seed)
    const [escrowPDA, escrowBump] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.ESCROW)],
      programId
    );

    // DOCI Registry PDA: [b"doci_registry"] (global registry)
    const [dociRegistryPDA, dociRegistryBump] =
      PublicKey.findProgramAddressSync(
        [Buffer.from(PDA_SEEDS.DOCI_REGISTRY)],
        programId
      );

    return {
      user: { address: userPDA, bump: userBump },
      escrow: { address: escrowPDA, bump: escrowBump },
      dociRegistry: { address: dociRegistryPDA, bump: dociRegistryBump },
    };
  }, [userWallet, program]);

  // Generate manuscript PDA (manuscripts are created with Keypair, not PDA)
  const getManuscriptKeypair = () => {
    return web3.Keypair.generate();
  };

  // Generate DOCI manuscript PDA: [b"doci_manuscript", manuscript_account.key()]
  const getDOCIManuscriptPDA = (manuscriptAccount: PublicKey) => {
    if (!program) return null;
    const programId = new PublicKey(SOLANA_CONFIG.PROGRAM_ID);
    const [dociPDA, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.DOCI_MANUSCRIPT), manuscriptAccount.toBuffer()],
      programId
    );
    return { address: dociPDA, bump };
  };

  // Helper to get token account PDAs
  const getTokenAccountPDA = async (mint: PublicKey, owner: PublicKey) => {
    const { getAssociatedTokenAddress } = await import("@solana/spl-token");
    return await getAssociatedTokenAddress(mint, owner);
  };

  return {
    pdas,
    getManuscriptKeypair,
    getDOCIManuscriptPDA,
    getTokenAccountPDA,
  };
};

// Utility hook for specific PDA generation
export const usePDAUtils = () => {
  const programId = new PublicKey(SOLANA_CONFIG.PROGRAM_ID);

  const generateUserPDA = (userWallet: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.USER), userWallet.toBuffer()],
      programId
    );
  };

  const generateEscrowPDA = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.ESCROW)],
      programId
    );
  };

  const generateDOCIRegistryPDA = () => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.DOCI_REGISTRY)],
      programId
    );
  };

  const generateDOCIManuscriptPDA = (manuscriptAccount: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.DOCI_MANUSCRIPT), manuscriptAccount.toBuffer()],
      programId
    );
  };

  return {
    generateUserPDA,
    generateEscrowPDA,
    generateDOCIRegistryPDA,
    generateDOCIManuscriptPDA,
  };
};
```

### 4. Token Service

Create `src/services/tokenService.ts`:

```typescript
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  createMint,
  getMint,
} from "@solana/spl-token";
import { CONTRACT_CONSTANTS } from "@/constants/solana";

export class TokenService {
  constructor(private connection: Connection) {}

  // Get or create associated token account
  async getOrCreateAssociatedTokenAccount(
    owner: PublicKey,
    mint: PublicKey,
    payer: PublicKey
  ) {
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mint,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    try {
      const account = await getAccount(
        this.connection,
        associatedTokenAddress,
        "confirmed",
        TOKEN_PROGRAM_ID
      );
      return { address: associatedTokenAddress, account };
    } catch (error) {
      // Account doesn't exist, need to create it
      return { address: associatedTokenAddress, account: null };
    }
  }

  // Create associated token account instruction
  createAssociatedTokenAccountInstruction(
    payer: PublicKey,
    associatedToken: PublicKey,
    owner: PublicKey,
    mint: PublicKey
  ) {
    return createAssociatedTokenAccountInstruction(
      payer,
      associatedToken,
      owner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  }

  // Get token balance
  async getTokenBalance(tokenAccount: PublicKey): Promise<bigint> {
    try {
      const account = await getAccount(this.connection, tokenAccount);
      return account.amount;
    } catch (error) {
      console.error("Error getting token balance:", error);
      return BigInt(0);
    }
  }

  // Get SOL balance
  async getSolBalance(wallet: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(wallet);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error("Error getting SOL balance:", error);
      return 0;
    }
  }

  // Format token amount for display
  formatTokenAmount(amount: bigint, decimals: number = 9): string {
    const divisor = BigInt(10 ** decimals);
    const quotient = amount / divisor;
    const remainder = amount % divisor;
    const fractional = remainder.toString().padStart(decimals, "0");
    return `${quotient}.${fractional}`;
  }

  // Parse token amount from string
  parseTokenAmount(amount: string, decimals: number = 9): bigint {
    const [whole, fractional = ""] = amount.split(".");
    const paddedFractional = fractional.padEnd(decimals, "0");
    const wholeBigInt = BigInt(whole || "0") * BigInt(10 ** decimals);
    const fractionalBigInt = BigInt(paddedFractional);
    return wholeBigInt + fractionalBigInt;
  }

  // Check if user has sufficient balance for submission fee
  async hasSubmissionFeeBalance(
    userWallet: PublicKey,
    usdMint: PublicKey
  ): Promise<boolean> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(usdMint, userWallet);
      const balance = await this.getTokenBalance(tokenAccount);
      return balance >= BigInt(CONTRACT_CONSTANTS.SUBMISSION_FEE);
    } catch (error) {
      return false;
    }
  }

  // Get mint information
  async getMintInfo(mintAddress: PublicKey) {
    try {
      return await getMint(this.connection, mintAddress);
    } catch (error) {
      console.error("Error getting mint info:", error);
      return null;
    }
  }
}
```

### 5. NFT Service

Create `src/services/nftService.ts`:

```typescript
import axios from "axios";
import { PublicKey } from "@solana/web3.js";
import { NFTMetadata } from "@/types/fronsciers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class NFTService {
  static async generateMetadata(manuscript: any): Promise<NFTMetadata> {
    const response = await axios.post(`${API_BASE_URL}/nft/generate-metadata`, {
      manuscript,
    });
    return response.data;
  }

  static async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/nft/upload-metadata`, {
      metadata,
    });
    return response.data.uri;
  }

  static async mintNFT(
    manuscriptTitle: string,
    manuscriptDescription: string,
    metadataUri: string
  ): Promise<{ mintAddress: string; signature: string }> {
    const response = await axios.post(`${API_BASE_URL}/nft/mint`, {
      manuscriptTitle,
      manuscriptDescription,
      metadataUri,
    });
    return response.data;
  }

  static async getNFTMetadata(mintAddress: string): Promise<NFTMetadata> {
    const response = await axios.get(
      `${API_BASE_URL}/nft/metadata/${mintAddress}`
    );
    return response.data;
  }

  static async getNFTsByAuthor(authorWallet: string): Promise<any[]> {
    const response = await axios.get(
      `${API_BASE_URL}/nft/author/${authorWallet}`
    );
    return response.data;
  }
}
```

### 6. Complete Manuscript Workflow Hook

Create `src/hooks/useManuscriptWorkflow.ts`:

```typescript
import { useState, useCallback } from "react";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useProgram } from "./useProgram";
import { usePDAs } from "./usePDAs";
import { NFTService } from "@/services/nftService";
import { TokenService } from "@/services/tokenService";
import { ManuscriptSubmission } from "@/types/fronsciers";
import { handleSolanaError } from "@/utils/errorHandling";
import toast from "react-hot-toast";

export const useManuscriptWorkflow = () => {
  const { program, wallet, connection, confirmTransaction } = useProgram();
  const { pdas, getManuscriptKeypair, getDOCIManuscriptPDA } = usePDAs(
    wallet?.publicKey
  );
  const [loading, setLoading] = useState(false);

  const tokenService = new TokenService(connection);

  const registerUser = useCallback(
    async (education: string) => {
      if (!program || !wallet.publicKey || !pdas) {
        throw new Error("Wallet not connected or program not loaded");
      }

      setLoading(true);
      try {
        const tx = await program.methods
          .registerUser(education)
          .accounts({
            user: pdas.user.address,
            wallet: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        await confirmTransaction(tx);
        toast.success("User registered successfully!");
        return { signature: tx, userPDA: pdas.user.address };
      } catch (error) {
        handleSolanaError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, pdas, confirmTransaction]
  );

  const submitManuscript = useCallback(
    async (
      submission: ManuscriptSubmission,
      usdMint: PublicKey,
      escrowUsdAccount: PublicKey
    ) => {
      if (!program || !wallet.publicKey || !pdas) {
        throw new Error("Wallet not connected or program not loaded");
      }

      setLoading(true);
      try {
        // Check balance first
        const hasBalance = await tokenService.hasSubmissionFeeBalance(
          wallet.publicKey,
          usdMint
        );
        if (!hasBalance) {
          throw new Error("Insufficient balance for submission fee");
        }

        // Generate manuscript keypair
        const manuscriptKeypair = getManuscriptKeypair();

        // Get author's USD token account
        const authorUsdAccount = await getAssociatedTokenAddress(
          usdMint,
          wallet.publicKey
        );

        const tx = await program.methods
          .submitManuscript(submission.ipfsHash)
          .accounts({
            manuscript: manuscriptKeypair.publicKey,
            user: pdas.user.address,
            author: wallet.publicKey,
            authorUsdAccount,
            escrowUsdAccount,
            escrow: pdas.escrow.address,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([manuscriptKeypair])
          .rpc();

        await confirmTransaction(tx);
        toast.success("Manuscript submitted successfully!");

        return {
          signature: tx,
          manuscriptPDA: manuscriptKeypair.publicKey,
          manuscriptKeypair,
        };
      } catch (error) {
        handleSolanaError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      program,
      wallet,
      pdas,
      confirmTransaction,
      tokenService,
      getManuscriptKeypair,
    ]
  );

  const reviewManuscript = useCallback(
    async (
      manuscriptPDA: PublicKey,
      decision: string,
      manuscriptAuthor: PublicKey,
      usdMint: PublicKey,
      fronsMint: PublicKey,
      platformUsdAccount: PublicKey
    ) => {
      if (!program || !wallet.publicKey || !pdas) {
        throw new Error("Wallet not connected or program not loaded");
      }

      setLoading(true);
      try {
        // Get all required token accounts
        const escrowUsdAccount = await getAssociatedTokenAddress(
          usdMint,
          pdas.escrow.address,
          true
        );

        const authorUsdAccount = await getAssociatedTokenAddress(
          usdMint,
          manuscriptAuthor
        );

        const escrowFronsAccount = await getAssociatedTokenAddress(
          fronsMint,
          pdas.escrow.address,
          true
        );

        const reviewerEscrowFronsAccount = escrowFronsAccount; // Shared escrow account

        // Get author user PDA
        const [authorUserPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), manuscriptAuthor.toBuffer()],
          program.programId
        );

        const tx = await program.methods
          .reviewManuscript(decision)
          .accounts({
            manuscript: manuscriptPDA,
            reviewer: wallet.publicKey,
            author: authorUserPDA,
            escrowUsdAccount,
            authorUsdAccount,
            platformUsdAccount,
            fronsMint,
            escrow: pdas.escrow.address,
            escrowTokenAccount: escrowFronsAccount,
            reviewerEscrowTokenAccount: reviewerEscrowFronsAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();

        await confirmTransaction(tx);
        toast.success(`Manuscript ${decision.toLowerCase()} successfully!`);
        return { signature: tx };
      } catch (error) {
        handleSolanaError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, pdas, confirmTransaction]
  );

  const mintDOCINFT = useCallback(
    async (manuscriptPDA: PublicKey, title: string, description: string) => {
      if (!program || !wallet.publicKey || !pdas) {
        throw new Error("Wallet not connected or program not loaded");
      }

      setLoading(true);
      try {
        // Generate DOCI manuscript PDA
        const dociManuscriptPDA = getDOCIManuscriptPDA(manuscriptPDA);
        if (!dociManuscriptPDA) {
          throw new Error("Failed to generate DOCI manuscript PDA");
        }

        // Create NFT mint keypair
        const dociMintKeypair = Keypair.generate();

        // Get author's NFT token account
        const authorNftTokenAccount = await getAssociatedTokenAddress(
          dociMintKeypair.publicKey,
          wallet.publicKey
        );

        // Generate and upload metadata first
        const metadata = await NFTService.generateMetadata({
          title,
          description,
          author: wallet.publicKey.toString(),
          manuscriptPDA: manuscriptPDA.toString(),
          mint: dociMintKeypair.publicKey.toString(),
        });
        const metadataUri = await NFTService.uploadMetadata(metadata);

        const tx = await program.methods
          .mintDociNft(title, description)
          .accounts({
            manuscript: manuscriptPDA,
            dociRegistry: pdas.dociRegistry.address,
            dociManuscript: dociManuscriptPDA.address,
            dociMint: dociMintKeypair.publicKey,
            author: wallet.publicKey,
            authorTokenAccount: authorNftTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([dociMintKeypair])
          .rpc();

        await confirmTransaction(tx);
        toast.success("DOCI NFT minted successfully!");

        return {
          signature: tx,
          mintAddress: dociMintKeypair.publicKey,
          metadataUri,
          dociManuscriptPDA: dociManuscriptPDA.address,
        };
      } catch (error) {
        handleSolanaError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, pdas, getDOCIManuscriptPDA, confirmTransaction]
  );

  // Get manuscript account data
  const getManuscript = useCallback(
    async (manuscriptPDA: PublicKey) => {
      if (!program) return null;
      try {
        return await program.account.manuscript.fetch(manuscriptPDA);
      } catch (error) {
        console.error("Error fetching manuscript:", error);
        return null;
      }
    },
    [program]
  );

  // Get user account data
  const getUser = useCallback(
    async (userPDA: PublicKey) => {
      if (!program) return null;
      try {
        return await program.account.user.fetch(userPDA);
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    [program]
  );

  // Get DOCI manuscript data
  const getDOCIManuscript = useCallback(
    async (dociManuscriptPDA: PublicKey) => {
      if (!program) return null;
      try {
        return await program.account.dociManuscript.fetch(dociManuscriptPDA);
      } catch (error) {
        console.error("Error fetching DOCI manuscript:", error);
        return null;
      }
    },
    [program]
  );

  return {
    // Core functions
    registerUser,
    submitManuscript,
    reviewManuscript,
    mintDOCINFT,

    // Data fetching
    getManuscript,
    getUser,
    getDOCIManuscript,

    // State
    loading,
  };
};
```

## React Components

### 1. Wallet Connection Component

Create `src/components/WalletConnection.tsx`:

```typescript
import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";

export const WalletConnection: React.FC = () => {
  const { connected } = useWallet();

  if (connected) {
    return <WalletMultiButton />;
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
```

### 2. Manuscript Submission Form

Create `src/components/ManuscriptSubmissionForm.tsx`:

```typescript
import React, { useState } from "react";
import { useManuscriptWorkflow } from "@/hooks/useManuscriptWorkflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ManuscriptSubmission } from "@/types/fronsciers";

export const ManuscriptSubmissionForm: React.FC = () => {
  const { submitManuscript, loading } = useManuscriptWorkflow();
  const [formData, setFormData] = useState<ManuscriptSubmission>({
    ipfsHash: "",
    title: "",
    description: "",
    authors: [""],
    keywords: [""],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitManuscript(formData);
      setFormData({
        ipfsHash: "",
        title: "",
        description: "",
        authors: [""],
        keywords: [""],
      });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">IPFS Hash</label>
        <Input
          value={formData.ipfsHash}
          onChange={(e) =>
            setFormData({ ...formData, ipfsHash: e.target.value })
          }
          placeholder="QmHash..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Manuscript title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Brief description of the manuscript"
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Manuscript"}
      </Button>
    </form>
  );
};
```

### 3. NFT Display Component

Create `src/components/NFTDisplay.tsx`:

```typescript
import React, { useEffect, useState } from "react";
import { NFTService } from "@/services/nftService";
import { NFTMetadata } from "@/types/fronsciers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NFTDisplayProps {
  mintAddress: string;
}

export const NFTDisplay: React.FC<NFTDisplayProps> = ({ mintAddress }) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await NFTService.getNFTMetadata(mintAddress);
        setMetadata(data);
      } catch (error) {
        console.error("Failed to fetch NFT metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [mintAddress]);

  if (loading) {
    return <div>Loading NFT...</div>;
  }

  if (!metadata) {
    return <div>Failed to load NFT metadata</div>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{metadata.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={metadata.image}
          alt={metadata.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <p className="text-sm text-gray-600 mb-4">{metadata.description}</p>

        <div className="space-y-2">
          <h4 className="font-medium">Attributes:</h4>
          {metadata.attributes.map((attr, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="font-medium">{attr.trait_type}:</span>
              <span>{attr.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

### 4. Manuscript Review Component

Create `src/components/ManuscriptReview.tsx`:

```typescript
import React from "react";
import { useManuscriptWorkflow } from "@/hooks/useManuscriptWorkflow";
import { Button } from "@/components/ui/button";
import { Manuscript } from "@/types/fronsciers";
import { DECISION_TYPES } from "@/constants/solana";

interface ManuscriptReviewProps {
  manuscript: Manuscript;
  manuscriptPDA: string;
}

export const ManuscriptReview: React.FC<ManuscriptReviewProps> = ({
  manuscript,
  manuscriptPDA,
}) => {
  const { reviewManuscript, mintDOCINFT, loading } = useManuscriptWorkflow();

  const handleReview = async (decision: string) => {
    try {
      await reviewManuscript(new PublicKey(manuscriptPDA), decision);
    } catch (error) {
      console.error("Review failed:", error);
    }
  };

  const handleMintNFT = async () => {
    try {
      await mintDOCINFT(
        new PublicKey(manuscriptPDA),
        "Manuscript Title", // Get from manuscript data
        "Manuscript Description" // Get from manuscript data
      );
    } catch (error) {
      console.error("NFT minting failed:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => handleReview(DECISION_TYPES.ACCEPTED)}
          disabled={loading}
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          Accept
        </Button>
        <Button
          onClick={() => handleReview(DECISION_TYPES.REJECTED)}
          disabled={loading}
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Reject
        </Button>
      </div>

      {manuscript.status === "Accepted" && (
        <Button
          onClick={handleMintNFT}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Mint DOCI NFT
        </Button>
      )}
    </div>
  );
};
```

## User Workflows

### 1. Author Workflow

```typescript
// 1. Register as user
const { registerUser } = useManuscriptWorkflow();
await registerUser("PhD");

// 2. Submit manuscript
const { submitManuscript } = useManuscriptWorkflow();
const submission = {
  ipfsHash: "QmHash...",
  title: "Research Paper Title",
  description: "Paper description",
  authors: ["Author Name"],
  keywords: ["keyword1", "keyword2"],
};
await submitManuscript(submission);

// 3. Monitor review status
// 4. Mint NFT when accepted
```

### 2. Reviewer Workflow

```typescript
// 1. Review manuscript
const { reviewManuscript } = useManuscriptWorkflow();
await reviewManuscript(manuscriptPDA, "Accepted");

// 2. View review history
```

### 3. Reader Workflow

```typescript
// 1. Browse published manuscripts
// 2. View NFT metadata
// 3. Access manuscript content
```

## Error Handling

Create `src/utils/errorHandling.ts`:

```typescript
import toast from "react-hot-toast";
import { PROGRAM_ERRORS } from "@/constants/solana";

// Enhanced Solana error handling
export const handleSolanaError = (error: any) => {
  console.error("Solana error:", error);

  // Extract error message from different error formats
  let errorMessage = "";

  if (error?.error?.errorMessage) {
    errorMessage = error.error.errorMessage;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // Handle specific program errors
  if (errorMessage.includes("SubmissionRequirementsNotMet")) {
    toast.error(PROGRAM_ERRORS.SUBMISSION_REQUIREMENTS_NOT_MET);
  } else if (errorMessage.includes("InvalidEducationLevel")) {
    toast.error(PROGRAM_ERRORS.INVALID_EDUCATION_LEVEL);
  } else if (errorMessage.includes("InsufficientPublishedPapers")) {
    toast.error(PROGRAM_ERRORS.INSUFFICIENT_PUBLISHED_PAPERS);
  } else if (errorMessage.includes("InvalidDecision")) {
    toast.error(PROGRAM_ERRORS.INVALID_DECISION);
  } else if (errorMessage.includes("MissingIpfsHash")) {
    toast.error(PROGRAM_ERRORS.MISSING_IPFS_HASH);
  } else if (errorMessage.includes("ReviewerAlreadyAdded")) {
    toast.error(PROGRAM_ERRORS.REVIEWER_ALREADY_ADDED);
  } else if (errorMessage.includes("ManuscriptNotPending")) {
    toast.error(PROGRAM_ERRORS.MANUSCRIPT_NOT_PENDING);
  } else if (errorMessage.includes("ManuscriptNotAccepted")) {
    toast.error(PROGRAM_ERRORS.MANUSCRIPT_NOT_ACCEPTED);
  }
  // Handle common Solana errors
  else if (
    errorMessage.includes("insufficient funds") ||
    errorMessage.includes("insufficient lamports")
  ) {
    toast.error("Insufficient SOL balance for transaction");
  } else if (
    errorMessage.includes("user rejected") ||
    errorMessage.includes("User rejected")
  ) {
    toast.error("Transaction was rejected by user");
  } else if (
    errorMessage.includes("blockhash") ||
    errorMessage.includes("block height")
  ) {
    toast.error("Transaction expired. Please try again");
  } else if (errorMessage.includes("account not found")) {
    toast.error(
      "Account not found. Please ensure all accounts are properly initialized"
    );
  } else if (errorMessage.includes("invalid account")) {
    toast.error("Invalid account data. Please check your wallet connection");
  } else if (errorMessage.includes("simulation failed")) {
    toast.error("Transaction simulation failed. Please check your inputs");
  } else if (errorMessage.includes("TokenAccountNotFoundError")) {
    toast.error(
      "Token account not found. Please create the required token account first"
    );
  } else if (errorMessage.includes("InsufficientFunds")) {
    toast.error("Insufficient token balance for this operation");
  } else {
    toast.error(`Transaction failed: ${errorMessage || "Unknown error"}`);
  }
};

// Enhanced API error handling
export const handleAPIError = (error: any) => {
  console.error("API error:", error);

  if (error.response?.data?.message) {
    toast.error(`API Error: ${error.response.data.message}`);
  } else if (error.response?.status === 400) {
    toast.error("Invalid request. Please check your input data");
  } else if (error.response?.status === 401) {
    toast.error("Authentication required. Please connect your wallet");
  } else if (error.response?.status === 403) {
    toast.error("Access denied. You don't have permission for this operation");
  } else if (error.response?.status === 404) {
    toast.error("Resource not found");
  } else if (error.response?.status === 429) {
    toast.error("Too many requests. Please wait and try again");
  } else if (error.response?.status === 500) {
    toast.error("Server error. Please try again later");
  } else if (error.response?.status === 503) {
    toast.error("Service unavailable. Please try again later");
  } else if (error.code === "NETWORK_ERROR") {
    toast.error("Network error. Please check your internet connection");
  } else {
    toast.error("Network error. Please check your connection");
  }
};

// Wallet connection error handling
export const handleWalletError = (error: any) => {
  console.error("Wallet error:", error);

  if (error.name === "WalletNotConnectedError") {
    toast.error("Please connect your wallet first");
  } else if (error.name === "WalletNotInstalledError") {
    toast.error("Wallet not installed. Please install a Solana wallet");
  } else if (error.name === "WalletConnectionError") {
    toast.error("Failed to connect wallet. Please try again");
  } else if (error.name === "WalletDisconnectedError") {
    toast.error("Wallet disconnected. Please reconnect your wallet");
  } else {
    toast.error(`Wallet error: ${error.message || "Unknown wallet error"}`);
  }
};

// Transaction status helper
export const getTransactionStatus = (status: string) => {
  switch (status) {
    case "processed":
      return "Transaction processed";
    case "confirmed":
      return "Transaction confirmed";
    case "finalized":
      return "Transaction finalized";
    default:
      return "Transaction pending";
  }
};

// Helper to format error for logging
export const formatErrorForLogging = (error: any) => {
  return {
    message: error.message || "Unknown error",
    name: error.name || "Error",
    stack: error.stack,
    timestamp: new Date().toISOString(),
    additionalInfo: {
      errorCode: error.code,
      errorLogs: error.logs,
      programErrorCode: error.error?.errorCode?.number,
      programErrorName: error.error?.errorCode?.name,
    },
  };
};

// Error boundary component for React
export class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error boundary caught error:", formatErrorForLogging(error));
    console.error("Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            An unexpected error occurred. Please refresh the page or try again.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing

### 1. Unit Tests

Create `src/__tests__/hooks/useManuscriptWorkflow.test.ts`:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useManuscriptWorkflow } from "@/hooks/useManuscriptWorkflow";

// Mock dependencies
jest.mock("@/hooks/useProgram");
jest.mock("@/hooks/usePDAs");
jest.mock("@/services/nftService");

describe("useManuscriptWorkflow", () => {
  it("should register user successfully", async () => {
    const { result } = renderHook(() => useManuscriptWorkflow());

    await act(async () => {
      const tx = await result.current.registerUser("PhD");
      expect(tx).toBeDefined();
    });
  });
});
```

### 2. Integration Tests

Create `src/__tests__/integration/manuscriptWorkflow.test.ts`:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ManuscriptSubmissionForm } from "@/components/ManuscriptSubmissionForm";

describe("Manuscript Submission Integration", () => {
  it("should submit manuscript successfully", async () => {
    render(<ManuscriptSubmissionForm />);

    fireEvent.change(screen.getByPlaceholderText("QmHash..."), {
      target: { value: "QmTestHash" },
    });

    fireEvent.click(screen.getByText("Submit Manuscript"));

    await waitFor(() => {
      expect(
        screen.getByText("Manuscript submitted successfully!")
      ).toBeInTheDocument();
    });
  });
});
```

## Deployment

### 1. Production Environment Variables

```env
# Production Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_WS_URL=wss://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api
NEXT_PUBLIC_WS_URL=wss://your-backend-api.com
```

### 2. Build and Deploy

```bash
# Build the application
npm run build

# Deploy to Vercel/Netlify
npm run deploy
```

### 3. Post-Deployment Checklist

- [ ] Verify wallet connection works
- [ ] Test manuscript submission flow
- [ ] Test NFT minting functionality
- [ ] Verify error handling
- [ ] Check mobile responsiveness
- [ ] Test with different Solana wallets
- [ ] Monitor transaction success rates

## File Structure

```
src/
├── components/
│   ├── ui/
│   ├── WalletConnection.tsx
│   ├── ManuscriptSubmissionForm.tsx
│   ├── NFTDisplay.tsx
│   └── ManuscriptReview.tsx
├── hooks/
│   ├── useProgram.ts
│   ├── usePDAs.ts
│   └── useManuscriptWorkflow.ts
├── services/
│   └── nftService.ts
├── types/
│   └── fronsciers.ts
├── constants/
│   └── solana.ts
├── utils/
│   └── errorHandling.ts
└── __tests__/
    ├── hooks/
    └── integration/
```

## Troubleshooting

### Common Issues

1. **Wallet Connection Fails**

   - Check if wallet extension is installed
   - Verify network configuration
   - Clear browser cache

2. **Transaction Fails**

   - Ensure sufficient SOL balance
   - Check program ID configuration
   - Verify PDA generation

3. **NFT Metadata Issues**
   - Check backend API connectivity
   - Verify metadata format
   - Check IPFS upload status

### Support

For additional support:

- Check the backend integration guide
- Review Solana documentation
- Check Anchor framework documentation
- Monitor transaction logs in Solana Explorer

## Complete Application Setup

### 1. Main App Component

Create `src/App.tsx`:

```typescript
import React from "react";
import { WalletContextProvider } from "@/contexts/WalletContextProvider";
import { ErrorBoundary } from "@/utils/errorHandling";
import { MainDashboard } from "@/components/MainDashboard";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ErrorBoundary>
      <WalletContextProvider>
        <div className="min-h-screen bg-gray-50">
          <MainDashboard />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </div>
      </WalletContextProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### 2. Main Dashboard Component

Create `src/components/MainDashboard.tsx`:

```typescript
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { WalletConnection } from "./WalletConnection";
import { UserRegistration } from "./UserRegistration";
import { ManuscriptSubmissionForm } from "./ManuscriptSubmissionForm";
import { ManuscriptList } from "./ManuscriptList";
import { ReviewDashboard } from "./ReviewDashboard";
import { NFTGallery } from "./NFTGallery";
import { useManuscriptWorkflow } from "@/hooks/useManuscriptWorkflow";
import { usePDAs } from "@/hooks/usePDAs";

export const MainDashboard: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { getUser } = useManuscriptWorkflow();
  const { pdas } = usePDAs(publicKey);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("submit");

  useEffect(() => {
    const fetchUser = async () => {
      if (publicKey && pdas) {
        const userData = await getUser(pdas.user.address);
        setUser(userData);
      }
    };

    fetchUser();
  }, [publicKey, pdas, getUser]);

  if (!connected) {
    return <WalletConnection />;
  }

  if (!user) {
    return <UserRegistration onUserRegistered={setUser} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Fronsciers Dashboard
        </h1>
        <p className="text-gray-600">
          Academic manuscript publishing on Solana
        </p>
      </header>

      <nav className="mb-8">
        <div className="flex space-x-4">
          {["submit", "manuscripts", "review", "nfts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab === "nfts" ? "NFT Gallery" : tab}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {activeTab === "submit" && <ManuscriptSubmissionForm />}
        {activeTab === "manuscripts" && <ManuscriptList />}
        {activeTab === "review" && <ReviewDashboard />}
        {activeTab === "nfts" && <NFTGallery />}
      </main>
    </div>
  );
};
```

### 3. Environment Variables Validation

Create `src/utils/env.ts`:

```typescript
// Validate required environment variables
export const validateEnvironment = () => {
  const required = [
    "NEXT_PUBLIC_SOLANA_RPC_URL",
    "NEXT_PUBLIC_PROGRAM_ID",
    "NEXT_PUBLIC_API_BASE_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

// Call this in your app initialization
export const initializeApp = () => {
  try {
    validateEnvironment();
    console.log("✅ Environment validation passed");
  } catch (error) {
    console.error("❌ Environment validation failed:", error.message);
    throw error;
  }
};
```

### 4. Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "generate-idl": "cp ../target/idl/fronsciers.json src/idl/",
    "validate-env": "node -e \"require('./src/utils/env').validateEnvironment()\""
  }
}
```

### 5. Development Workflow

1. **Initial Setup**:

   ```bash
   # Install dependencies
   npm install

   # Copy IDL from your Anchor project
   npm run generate-idl

   # Validate environment
   npm run validate-env

   # Start development server
   npm run dev
   ```

2. **Testing Workflow**:

   ```bash
   # Run type checking
   npm run type-check

   # Run tests
   npm run test

   # Run tests with coverage
   npm run test:coverage
   ```

3. **Deployment Workflow**:

   ```bash
   # Build for production
   npm run build

   # Start production server
   npm run start
   ```

### 6. Quick Start Checklist

- [ ] Install all dependencies
- [ ] Set up environment variables
- [ ] Copy IDL file from Anchor project
- [ ] Configure wallet provider
- [ ] Test wallet connection
- [ ] Test user registration
- [ ] Test manuscript submission
- [ ] Test review process
- [ ] Test NFT minting
- [ ] Deploy to production

### 7. Development Tips

1. **Debugging Transactions**:

   - Use Solana Explorer to inspect failed transactions
   - Check transaction logs for detailed error messages
   - Verify all account addresses and PDAs

2. **Testing with Devnet**:

   - Use Solana CLI to airdrop SOL for testing
   - Create test tokens for USD and FRONS
   - Test all workflows with small amounts first

3. **Performance Optimization**:

   - Use React.memo for expensive components
   - Implement proper loading states
   - Cache account data where appropriate
   - Use parallel requests for data fetching

4. **Security Best Practices**:
   - Validate all user inputs
   - Implement proper error boundaries
   - Never expose private keys or seeds
   - Validate transaction results before showing success

This integration guide provides a complete foundation for building a frontend application that interacts with the Fronsciers smart contract. Follow the steps sequentially and test each component thoroughly before proceeding to the next step.
