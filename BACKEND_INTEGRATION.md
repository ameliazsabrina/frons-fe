# Backend Integration Documentation

This document outlines the backend integration implemented for the Fronsciers frontend, based on the detailed API documentation.

## 🎯 Overview

The frontend now integrates with the backend API to support the complete peer review workflow and NFT integration as described in `DETAILED_API_EXAMPLES.md`.

## 📁 New Files Created

### Types (`src/types/backend.ts`)

- Comprehensive TypeScript interfaces for all backend API endpoints
- Error handling types for specific backend error codes
- NFT integration types for academic NFT functionality

### API Service (`src/lib/api.ts`)

- Centralized API service class with all backend endpoints
- Error handling and response validation
- File upload support for CV and manuscript submissions
- NFT metadata management

### Hooks

- **`src/hooks/useCVRegistration.ts`** - CV registration and profile management
- **`src/hooks/useManuscriptManagement.ts`** - Manuscript review and publication workflow
- **`src/hooks/useNFTIntegration.ts`** - NFT creation and verification

### Pages

- **`src/app/register-cv/page.tsx`** - CV registration interface
- **`src/app/review-manuscript/page.tsx`** - Editor review dashboard
- **`src/app/published-manuscripts/page.tsx`** - Public published manuscripts display

### Components

- **`src/components/ui/nft-badge.tsx`** - NFT information display component

## 🔄 Complete Workflow Integration

### 1. CV Registration (Required First Step)

```typescript
// Check CV status
const cvStatus = await backendAPI.checkCVStatus(walletAddress);

// Upload and parse CV
const result = await backendAPI.uploadCV(cvFile, walletAddress);

// Get user profile
const profile = await backendAPI.getUserProfile(walletAddress);
```

### 2. Manuscript Submission

```typescript
// Submit manuscript for peer review
const submission = await backendAPI.submitManuscript({
  manuscript: file,
  title: "Research Title",
  author: "Author Name",
  category: "Computer Science",
  abstract: "Research abstract...",
  keywords: "AI, Machine Learning",
  authorWallet: walletAddress,
});
```

### 3. Review Management

```typescript
// Get pending manuscripts
const pending = await backendAPI.getPendingReviewManuscripts(20);

// Assign reviewers
const assignment = await backendAPI.assignReviewers(
  manuscriptId,
  ["reviewer1", "reviewer2", "reviewer3"],
  "editor@journal.com"
);

// Submit review decision
const review = await backendAPI.submitReview(
  reviewId,
  "accept",
  "Excellent research...",
  reviewerWallet
);
```

### 4. Publication

```typescript
// Check review status
const status = await backendAPI.getReviewStatus(manuscriptId);

// Publish manuscript
const publication = await backendAPI.publishManuscript(
  manuscriptId,
  "editor@journal.com"
);
```

### 5. NFT Integration

```typescript
// Create academic NFT
const nft = await backendAPI.createNFTMetadata({
  mint: mintAddress,
  doci: "10.5281/zenodo.1234567",
  title: "Research Title",
  description: "Research description",
  ipfs_hash: manuscriptIpfsHash,
  author: "Author Name",
  reviewers: ["reviewer1", "reviewer2", "reviewer3"],
});

// Verify NFT
const verification = await backendAPI.verifyNFTMetadata(mintAddress);
```

## 🎨 UI Components

### CV Registration Guard

The existing `CVRegistrationGuard` component has been updated to use the new backend API and provides:

- CV status checking
- File upload with progress
- Profile display
- Automatic verification

### NFT Badge Component

Displays NFT information for published manuscripts:

- NFT verification status
- DOI and publication details
- Author royalty information
- Solana explorer links

### Review Dashboard

Complete editor interface for:

- Viewing pending manuscripts
- Assigning reviewers
- Monitoring review progress
- Publishing approved manuscripts

## 🔧 Configuration

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Backend Health Check

The API service includes health checking:

```typescript
const isHealthy = await backendAPI.isBackendHealthy();
```

## 🚀 Usage Examples

### Complete Workflow

```typescript
// 1. Register CV
const cvResult = await uploadCV(cvFile, walletAddress);

// 2. Submit manuscript
const manuscript = await submitManuscript(manuscriptData, file, walletAddress);

// 3. Editor assigns reviewers
const reviewers = await assignReviewers(
  manuscript.id,
  reviewerAddresses,
  editorEmail
);

// 4. Reviewers submit decisions
const review = await submitReview(reviewId, "accept", comments, reviewerWallet);

// 5. Publish manuscript
const publication = await publishManuscript(manuscript.id, editorEmail);

// 6. Create NFT
const nft = await createAcademicNFT(manuscriptData, mintAddress, doci);
```

### Error Handling

```typescript
try {
  const result = await backendAPI.submitManuscript(data);
} catch (error) {
  if (backendAPI.isCVRequiredError(error)) {
    // Handle CV requirement
  } else if (backendAPI.isMissingWalletError(error)) {
    // Handle missing wallet
  }
}
```

## 📊 API Endpoints Integrated

### CV Registration

- `GET /api/manuscripts/check-cv-status/:walletAddress`
- `POST /api/parse-cv/parse-cv`
- `GET /api/parse-cv/user/profile/:walletAddress`
- `PATCH /api/parse-cv/user/profile/:walletAddress`

### Manuscript Management

- `POST /api/manuscripts/submit`
- `GET /api/manuscripts/pending-review`
- `GET /api/manuscripts/published/:category`
- `POST /api/reviews/manuscript/:id/assign-reviewers`
- `POST /api/reviews/:id/submit-review`
- `GET /api/reviews/manuscript/:id/review-status`
- `POST /api/manuscripts/:id/publish`

### NFT Integration

- `GET /api/nft-metadata/health`
- `POST /api/nft-metadata/create`
- `GET /api/nft-metadata/:mint`
- `PUT /api/nft-metadata/:mint`
- `GET /api/nft-metadata/:mint/verify`

## 🔒 Security Features

- CV registration requirement before manuscript submission
- Wallet address validation
- Minimum 3 reviewers requirement
- Publication approval workflow
- NFT verification and blockchain integration

## 🎯 Next Steps

1. **Testing**: Test all endpoints with the backend server
2. **Error Handling**: Add more comprehensive error handling
3. **UI Polish**: Enhance the user interface based on testing feedback
4. **Performance**: Optimize API calls and caching
5. **Monitoring**: Add analytics and monitoring for the workflow

## 📝 Notes

- All API calls include proper error handling
- File uploads support progress tracking
- NFT integration provides blockchain verification
- The workflow enforces the mandatory CV registration requirement
- Review process requires minimum 3 reviewers
- Publication requires sufficient approved reviews
