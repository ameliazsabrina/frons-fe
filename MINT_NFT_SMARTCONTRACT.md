# Frontend Integration Guide - Fronsciers Smart Contract

This guide shows how to update your frontend constants and `useProgram` code to integrate with the Fronsciers smart contract and NFT functionality.

## 📋 **Overview**

Your smart contract now includes:

- ✅ User registration with education verification
- ✅ Manuscript submission with $50 USD escrow
- ✅ Multi-reviewer peer review process
- ✅ Automatic FRONS token rewards
- ✅ **NEW**: DOCI NFT minting for published manuscripts
- ✅ **NEW**: Royalty configuration and revenue sharing

## 🔧 **1. Update Constants**

``

### **Constants File** (`src/lib/constants.ts`)

```typescript
import { PublicKey } from "@solana/web3.js";

// Program Configuration
export const FRONSCIERS_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_FRONSCIERS_PROGRAM_ID!
);

// Token Mint Addresses
export const USD_MINT = new PublicKey(process.env.NEXT_PUBLIC_USD_MINT!);
export const FRONS_MINT = new PublicKey(process.env.NEXT_PUBLIC_FRONS_MINT!);

// Network Configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK as
  | "devnet"
  | "mainnet-beta";
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;

// Economic Constants
export const SUBMISSION_FEE_USD = 50; // $50 USD
export const AUTHOR_REWARD_USD = 0.1; // $0.1 USD in FRONS
export const REVIEWER_REWARD_USD = 0.06; // $0.06 USD in FRONS per reviewer

// PDA Seeds (must match smart contract)
export const USER_SEED = "user";
export const ESCROW_SEED = "escrow";
export const DOCI_REGISTRY_SEED = "doci_registry";
export const DOCI_MANUSCRIPT_SEED = "doci_manuscript";

// UI Constants
export const REQUIRED_REVIEWERS = 3;
export const EDUCATION_LEVELS = [
  "PhD",
  "Master",
  "Bachelor",
  "Doctorate",
] as const;
export const MANUSCRIPT_STATUSES = [
  "Pending",
  "Accepted",
  "Rejected",
  "Published",
] as const;
```

## 🎯 **2. Update TypeScript Interfaces**

### **Types File** (`src/types/fronsciers.ts`)

```typescript
import { PublicKey } from "@solana/web3.js";

// User Account
export interface User {
  wallet: PublicKey;
  education: string;
  publishedPapers: number;
  bump: number;
}

// Manuscript Account
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

// NEW: DOCI Manuscript Account
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

// NEW: Royalty Configuration
export interface RoyaltyConfig {
  authorsShare: number; // Basis points (5000 = 50%)
  platformShare: number; // Basis points (2000 = 20%)
  reviewersShare: number; // Basis points (3000 = 30%)
}

// DOCI Registry
export interface DOCIRegistry {
  totalPublished: number;
  currentYear: number;
  nextSequence: number;
  authority: PublicKey;
  bump: number;
}

// Escrow Account
export interface EscrowAccount {
  authority: PublicKey;
  bump: number;
}

// NEW: NFT Metadata Structure
export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  collection: {
    name: string;
    family: string;
  };
}

// Frontend-specific types
export type EducationLevel =
  typeof import("../lib/constants").EDUCATION_LEVELS[number];
export type ManuscriptStatus =
  typeof import("../lib/constants").MANUSCRIPT_STATUSES[number];

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface NFTCreationResponse {
  success: boolean;
  mint?: string;
  doci?: string;
  metadataPath?: string;
  error?: string;
}
```

## 🔗 **3. Update useProgram Hook**

### **Program Hook** (`src/hooks/useProgram.ts`)

```typescript
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useMemo } from "react";
import { FRONSCIERS_PROGRAM_ID } from "@/lib/constants";
import { Fronsciers } from "@/types/fronsciers"; // Your generated IDL types

// Import your IDL
import IDL from "@/idl/fronsciers.json";

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;

    return new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;

    return new Program<Fronsciers>(
      IDL as Fronsciers,
      FRONSCIERS_PROGRAM_ID,
      provider
    );
  }, [provider]);

  return {
    program,
    provider,
    connected: !!wallet.connected,
    publicKey: wallet.publicKey,
  };
}
```

### **PDA Helper Hook** (`src/hooks/usePDAs.ts`)

```typescript
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  FRONSCIERS_PROGRAM_ID,
  USER_SEED,
  ESCROW_SEED,
  DOCI_REGISTRY_SEED,
  DOCI_MANUSCRIPT_SEED,
} from "@/lib/constants";

export function usePDAs() {
  const { publicKey } = useWallet();

  const userPDA = useMemo(() => {
    if (!publicKey) return null;

    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_SEED), publicKey.toBuffer()],
      FRONSCIERS_PROGRAM_ID
    );
    return pda;
  }, [publicKey]);

  const escrowPDA = useMemo(() => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(ESCROW_SEED)],
      FRONSCIERS_PROGRAM_ID
    );
    return pda;
  }, []);

  const dociRegistryPDA = useMemo(() => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(DOCI_REGISTRY_SEED)],
      FRONSCIERS_PROGRAM_ID
    );
    return pda;
  }, []);

  const getDociManuscriptPDA = useMemo(() => {
    return (manuscriptAccount: PublicKey) => {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(DOCI_MANUSCRIPT_SEED), manuscriptAccount.toBuffer()],
        FRONSCIERS_PROGRAM_ID
      );
      return pda;
    };
  }, []);

  return {
    userPDA,
    escrowPDA,
    dociRegistryPDA,
    getDociManuscriptPDA,
  };
}
```

## 🎨 **4. NFT Integration Functions**

### **NFT Service** (`src/services/nft.service.ts`)

```typescript
import { PublicKey, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import { Fronsciers } from "@/types/fronsciers";
import { NFTCreationResponse } from "@/types/fronsciers";

export class NFTService {
  constructor(private program: Program<Fronsciers>) {}

  async mintDOCINFT(
    manuscriptAccount: PublicKey,
    title: string,
    description: string,
    dociRegistryPDA: PublicKey,
    userPDA: PublicKey
  ): Promise<{ signature: string; mintAddress: PublicKey }> {
    // Generate new keypair for NFT mint
    const dociMintKeypair = Keypair.generate();

    // Calculate DOCI manuscript PDA
    const [dociManuscriptPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("doci_manuscript"), manuscriptAccount.toBuffer()],
      this.program.programId
    );

    // Get author's NFT token account
    const authorNftTokenAccount = getAssociatedTokenAddressSync(
      dociMintKeypair.publicKey,
      this.program.provider.publicKey!
    );

    // Call smart contract
    const signature = await this.program.methods
      .mintDociNft(title, description)
      .accountsPartial({
        manuscript: manuscriptAccount,
        dociRegistry: dociRegistryPDA,
        dociManuscript: dociManuscriptPDA,
        dociMint: dociMintKeypair.publicKey,
        author: this.program.provider.publicKey!,
        authorTokenAccount: authorNftTokenAccount,
      })
      .signers([dociMintKeypair])
      .rpc();

    return {
      signature,
      mintAddress: dociMintKeypair.publicKey,
    };
  }

  async createNFTMetadata(
    mint: string,
    doci: string,
    title: string,
    description: string,
    ipfsHash: string,
    author: string,
    reviewers: string[] = [],
    publicationDate: number = Date.now() / 1000,
    authorsShare: number = 5000,
    platformShare: number = 2000,
    reviewersShare: number = 3000
  ): Promise<NFTCreationResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_METADATA_API_URL}/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mint,
          doci,
          title,
          description,
          ipfs_hash: ipfsHash,
          author,
          reviewers,
          publication_date: publicationDate,
          authors_share: authorsShare,
          platform_share: platformShare,
          reviewers_share: reviewersShare,
        }),
      }
    );

    return response.json();
  }

  async getNFTMetadata(mint: string): Promise<any> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_METADATA_API_URL}/${mint}`
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  }
}
```

## 🔄 **5. Updated Hook for Complete Workflow**

### **Manuscript Workflow Hook** (`src/hooks/useManuscriptWorkflow.ts`)

```typescript
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "./useProgram";
import { usePDAs } from "./usePDAs";
import { NFTService } from "@/services/nft.service";
import { toast } from "react-hot-toast";

export function useManuscriptWorkflow() {
  const { program } = useProgram();
  const { userPDA, dociRegistryPDA } = usePDAs();
  const [loading, setLoading] = useState(false);

  const submitManuscript = async (ipfsHash: string) => {
    if (!program || !userPDA) throw new Error("Program not initialized");

    setLoading(true);
    try {
      // Implementation for manuscript submission
      // ... your existing submit logic

      toast.success("Manuscript submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit manuscript");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reviewManuscript = async (
    manuscriptAccount: PublicKey,
    decision: "Accepted" | "Rejected"
  ) => {
    if (!program) throw new Error("Program not initialized");

    setLoading(true);
    try {
      // Implementation for manuscript review
      // ... your existing review logic

      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit review");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async (
    manuscriptAccount: PublicKey,
    title: string,
    description: string,
    ipfsHash: string
  ) => {
    if (!program || !dociRegistryPDA || !userPDA) {
      throw new Error("Program not initialized");
    }

    setLoading(true);
    try {
      const nftService = new NFTService(program);

      // Step 1: Mint DOCI NFT on-chain
      toast.loading("Minting DOCI NFT...", { id: "nft-mint" });

      const { signature, mintAddress } = await nftService.mintDOCINFT(
        manuscriptAccount,
        title,
        description,
        dociRegistryPDA,
        userPDA
      );

      toast.success("NFT minted successfully!", { id: "nft-mint" });

      // Step 2: Create NFT metadata
      toast.loading("Creating NFT metadata...", { id: "nft-metadata" });

      const metadataResult = await nftService.createNFTMetadata(
        mintAddress.toString(),
        `10.fronsciers/manuscript.2024.0001`, // Generated DOCI
        title,
        description,
        ipfsHash,
        program.provider.publicKey!.toString()
      );

      if (metadataResult.success) {
        toast.success("NFT metadata created successfully!", {
          id: "nft-metadata",
        });
      } else {
        toast.error(`Metadata creation failed: ${metadataResult.error}`, {
          id: "nft-metadata",
        });
      }

      return {
        signature,
        mintAddress: mintAddress.toString(),
        metadataCreated: metadataResult.success,
        doci: metadataResult.doci,
      };
    } catch (error) {
      toast.error("Failed to mint NFT");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitManuscript,
    reviewManuscript,
    mintNFT,
    loading,
  };
}
```

## 🎯 **6. Component Integration Examples**

### **NFT Display Component** (`src/components/NFTDisplay.tsx`)

```typescript
import { useState, useEffect } from "react";
import { NFTService } from "@/services/nft.service";
import { useProgram } from "@/hooks/useProgram";

interface NFTDisplayProps {
  mintAddress: string;
  className?: string;
}

export function NFTDisplay({ mintAddress, className }: NFTDisplayProps) {
  const { program } = useProgram();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program || !mintAddress) return;

    const loadMetadata = async () => {
      try {
        const nftService = new NFTService(program);
        const data = await nftService.getNFTMetadata(mintAddress);
        setMetadata(data);
      } catch (error) {
        console.error("Failed to load NFT metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [program, mintAddress]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>;
  }

  if (!metadata) {
    return <div className="text-gray-500">NFT metadata not available</div>;
  }

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-4">
        <img
          src={metadata.image}
          alt={metadata.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{metadata.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{metadata.description}</p>

          <div className="space-y-1 text-xs">
            {metadata.attributes?.map((attr: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-500">{attr.trait_type}:</span>
                <span className="font-medium">{attr.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <a
              href={`https://explorer.solana.com/address/${mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View on Solana Explorer →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **Manuscript Actions Component** (Updated)

```typescript
// Add to your existing manuscript component
import { useManuscriptWorkflow } from "@/hooks/useManuscriptWorkflow";
import { NFTDisplay } from "./NFTDisplay";

export function ManuscriptActions({ manuscript }: { manuscript: Manuscript }) {
  const { mintNFT, loading } = useManuscriptWorkflow();
  const [nftMint, setNftMint] = useState<string | null>(null);

  const handleMintNFT = async () => {
    try {
      const result = await mintNFT(
        manuscript.key, // manuscript account public key
        "My Research Paper", // title
        "Description of my research", // description
        manuscript.ipfsHash // IPFS hash
      );

      setNftMint(result.mintAddress);
    } catch (error) {
      console.error("Failed to mint NFT:", error);
    }
  };

  // Show NFT if manuscript is published and has DOCI mint
  if (manuscript.status === "Published" && (manuscript.dociMint || nftMint)) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="text-green-800 font-semibold">
            ✅ Published as DOCI NFT
          </h3>
          <p className="text-green-600 text-sm">
            This manuscript has been published and minted as a DOCI NFT.
          </p>
        </div>

        <NFTDisplay
          mintAddress={(manuscript.dociMint || nftMint)!.toString()}
          className="bg-gray-50"
        />
      </div>
    );
  }

  // Show mint button if manuscript is accepted but not yet published
  if (manuscript.status === "Accepted") {
    return (
      <button
        onClick={handleMintNFT}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Minting NFT..." : "Mint DOCI NFT"}
      </button>
    );
  }

  return null;
}
```

## 📋 **7. Update Checklist**

### **Files to Update:**

- [ ] `.env.local` - Add environment variables
- [ ] `src/lib/constants.ts` - Update program ID and constants
- [ ] `src/types/fronsciers.ts` - Add new TypeScript interfaces
- [ ] `src/hooks/useProgram.ts` - Update program initialization
- [ ] `src/hooks/usePDAs.ts` - Add PDA helper functions
- [ ] `src/services/nft.service.ts` - Create NFT service
- [ ] `src/hooks/useManuscriptWorkflow.ts` - Add NFT minting workflow
- [ ] Manuscript components - Add NFT display and minting

### **Dependencies to Install:**

```bash
npm install @coral-xyz/anchor @solana/web3.js @solana/wallet-adapter-react @solana/spl-token
```

### **IDL File:**

- [ ] Copy generated IDL from `target/types/fronsciers.ts` to your frontend
- [ ] Update import paths in hooks and services

---

**✅ This guide provides everything needed to integrate your smart contract with the frontend, including the new NFT functionality!**
