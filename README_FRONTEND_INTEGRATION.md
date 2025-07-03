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
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
NEXT_PUBLIC_WS_URL=ws://localhost:5001

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
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-base @solana/wallet-adapter-wallets @project-serum/anchor axios socket.io-client react-hot-toast lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
```

## Smart Contract Integration

### 1. Constants Configuration

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

### 1. Program Connection Hook

Create `src/hooks/useProgram.ts`:

```typescript
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
import { IDL } from "@/types/fronsciers";

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
    return new Program(IDL, SOLANA_CONFIG.PROGRAM_ID, provider);
  }, [provider]);

  return { program, provider, connection, wallet };
};
```

### 2. PDA Generation Hook

Create `src/hooks/usePDAs.ts`:

```typescript
import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { utils } from "@project-serum/anchor";
import { SOLANA_CONFIG, PDA_SEEDS } from "@/constants/solana";
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
```

### 3. NFT Service

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

### 4. Manuscript Workflow Hook

Create `src/hooks/useManuscriptWorkflow.ts`:

```typescript
import { useState, useCallback } from "react";
import { useProgram } from "./useProgram";
import { usePDAs } from "./usePDAs";
import { NFTService } from "@/services/nftService";
import { ManuscriptSubmission } from "@/types/fronsciers";
import toast from "react-hot-toast";

export const useManuscriptWorkflow = () => {
  const { program, wallet } = useProgram();
  const { pdas, getManuscriptPDA } = usePDAs(wallet?.publicKey);
  const [loading, setLoading] = useState(false);

  const registerUser = useCallback(
    async (education: string) => {
      if (!program || !wallet || !pdas) return;

      setLoading(true);
      try {
        const tx = await program.methods
          .registerUser(education)
          .accounts({
            user: pdas.user,
            authority: wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();

        toast.success("User registered successfully!");
        return tx;
      } catch (error) {
        toast.error("Failed to register user");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, pdas]
  );

  const submitManuscript = useCallback(
    async (submission: ManuscriptSubmission) => {
      if (!program || !wallet || !pdas) return;

      setLoading(true);
      try {
        const manuscriptId = `${Date.now()}-${wallet.publicKey.toString()}`;
        const manuscriptPDA = getManuscriptPDA(manuscriptId);

        const tx = await program.methods
          .submitManuscript(submission.ipfsHash)
          .accounts({
            manuscript: manuscriptPDA,
            author: wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();

        toast.success("Manuscript submitted successfully!");
        return { tx, manuscriptId, manuscriptPDA };
      } catch (error) {
        toast.error("Failed to submit manuscript");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, pdas, getManuscriptPDA]
  );

  const reviewManuscript = useCallback(
    async (manuscriptPDA: PublicKey, decision: string) => {
      if (!program || !wallet) return;

      setLoading(true);
      try {
        const tx = await program.methods
          .reviewManuscript(decision)
          .accounts({
            manuscript: manuscriptPDA,
            reviewer: wallet.publicKey,
          })
          .rpc();

        toast.success(`Manuscript ${decision.toLowerCase()} successfully!`);
        return tx;
      } catch (error) {
        toast.error("Failed to review manuscript");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet]
  );

  const mintDOCINFT = useCallback(
    async (manuscriptPDA: PublicKey, title: string, description: string) => {
      if (!program || !wallet || !pdas) return;

      setLoading(true);
      try {
        // Generate and upload metadata
        const metadata = await NFTService.generateMetadata({
          title,
          description,
          author: wallet.publicKey.toString(),
        });
        const metadataUri = await NFTService.uploadMetadata(metadata);

        // Mint NFT on-chain
        const tx = await program.methods
          .mintDociNft(title, description)
          .accounts({
            manuscript: manuscriptPDA,
            dociRegistry: pdas.dociRegistry,
            author: wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();

        toast.success("DOCI NFT minted successfully!");
        return { tx, metadataUri };
      } catch (error) {
        toast.error("Failed to mint DOCI NFT");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, pdas]
  );

  return {
    registerUser,
    submitManuscript,
    reviewManuscript,
    mintDOCINFT,
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

export const handleSolanaError = (error: any) => {
  console.error("Solana error:", error);

  if (error.message?.includes("insufficient funds")) {
    toast.error("Insufficient SOL balance");
  } else if (error.message?.includes("user rejected")) {
    toast.error("Transaction was rejected by user");
  } else if (error.message?.includes("blockhash")) {
    toast.error("Transaction expired. Please try again");
  } else {
    toast.error("Transaction failed. Please try again");
  }
};

export const handleAPIError = (error: any) => {
  console.error("API error:", error);

  if (error.response?.status === 404) {
    toast.error("Resource not found");
  } else if (error.response?.status === 500) {
    toast.error("Server error. Please try again later");
  } else {
    toast.error("Network error. Please check your connection");
  }
};
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

This integration guide provides a complete foundation for building a frontend application that interacts with the Fronsciers smart contract. Follow the steps sequentially and test each component thoroughly before proceeding to the next step.
