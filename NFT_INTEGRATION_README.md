# NFT Integration - Fronsciers Platform

## Overview

The Fronsciers platform now supports NFT minting for published manuscripts! Authors can mint their peer-reviewed publications as DOCI (Digital Object Content Identifier) NFTs on the Solana blockchain.

## 🎨 New Features

### For Authors

- **Automatic NFT Minting**: After your manuscript is published (approved by 3+ reviewers), you can mint it as an NFT
- **DOCI Identifiers**: Each published manuscript gets a unique DOCI identifier (e.g., `10.fronsciers/manuscript.2024.001`)
- **Proof of Authorship**: NFTs provide immutable proof of authorship on the blockchain
- **Revenue Sharing**: Built-in royalty system for future citations and usage

### For Readers

- **NFT Verification**: View NFT metadata and verify publication authenticity
- **Blockchain Explorer**: Direct links to view NFTs on Solana Explorer
- **IPFS Access**: Permanent access to manuscript content via IPFS

## 🚀 How to Use

### 1. Environment Setup

Create a `.env.local` file with the following variables:

```env
# Required for NFT functionality
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_FRONSCIERS_PROGRAM_ID=your_program_id_here
NEXT_PUBLIC_USD_MINT=your_usd_mint_address_here
NEXT_PUBLIC_FRONS_MINT=your_frons_mint_address_here
NEXT_PUBLIC_METADATA_API_URL=http://localhost:5001/api/nft-metadata
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 2. For Authors - Minting NFTs

1. **Submit Manuscript**: Submit your research through the normal submission process
2. **Peer Review**: Wait for your manuscript to be reviewed by 3+ expert reviewers
3. **Publication**: Once approved, your manuscript status changes to "Published"
4. **Mint NFT**:
   - Go to your Author Dashboard
   - Find your published manuscript
   - Click the "🎨 Mint NFT" button
   - Confirm the transaction in your wallet
   - Wait for the NFT to be created (30-60 seconds)

### 3. For Readers - Viewing NFTs

1. **Browse Publications**: Go to the Publications page
2. **View NFT Info**: Published manuscripts with NFTs show additional NFT information
3. **Explore NFT**: Click "View on Solana Explorer" to see the NFT on-chain
4. **Verify Authenticity**: Check the NFT metadata to verify publication details

## 🔧 Technical Details

### NFT Metadata

Each DOCI NFT includes:

- **Title**: Manuscript title
- **Description**: Abstract
- **Authors**: Publication authors
- **Reviewers**: Peer reviewers (anonymized)
- **Publication Date**: When the manuscript was published
- **IPFS Hash**: Link to the original manuscript
- **DOCI Identifier**: Unique publication identifier

### Revenue Sharing

- **Authors**: 50% of future revenue
- **Platform**: 20% for maintenance and development
- **Reviewers**: 30% distributed among peer reviewers

### Blockchain Details

- **Network**: Solana (Devnet for testing, Mainnet for production)
- **Token Standard**: SPL Token (NFT)
- **Metadata Storage**: IPFS via Pinata
- **Smart Contract**: Custom Anchor program

## 🛠️ Development

### Components Added

- `NFTDisplay`: Shows NFT information and metadata
- `NFTCreator`: Handles the NFT minting process
- `useMintNFT`: Hook for NFT minting functionality
- `NFTService`: Service for API interactions

### Integration Points

- **Author Dashboard**: NFT creation for published manuscripts
- **Publications Page**: NFT display for all published papers
- **Smart Contract**: On-chain NFT minting and registry

## 📊 User Flow

```
1. Author submits manuscript
   ↓
2. Manuscript undergoes peer review (3+ reviewers)
   ↓
3. Manuscript gets published
   ↓
4. Author sees "Mint NFT" option in dashboard
   ↓
5. Author clicks mint button
   ↓
6. NFT is created on Solana blockchain
   ↓
7. NFT appears in author dashboard and publications page
   ↓
8. Readers can view and verify NFT authenticity
```

## 🔍 Troubleshooting

### Common Issues

1. **"NFT service unavailable"**

   - Ensure the backend NFT metadata service is running
   - Check the `NEXT_PUBLIC_METADATA_API_URL` environment variable

2. **"Wallet not connected"**

   - Connect your Solana wallet (Phantom, Solflare, etc.)
   - Ensure you have SOL for transaction fees

3. **"Transaction failed"**

   - Check your SOL balance for transaction fees
   - Verify the program ID is correct
   - Try again after a few moments

4. **"Metadata creation failed"**
   - The on-chain NFT was created but metadata upload failed
   - Use the "Retry" button to attempt metadata creation again
   - Check IPFS/Pinata service status

### Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure the backend services are running
4. Contact the development team with error details

## 🔮 Future Enhancements

- **Citation Tracking**: Automatic royalty distribution based on citations
- **Collection Management**: Group NFTs by research areas or institutions
- **Cross-Chain Support**: Expand to other blockchains
- **Enhanced Metadata**: Additional publication metrics and data
- **Marketplace Integration**: Enable trading of publication NFTs

---

**Note**: This is a beta feature. Please test thoroughly on devnet before using on mainnet.
