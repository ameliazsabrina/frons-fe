# Detailed API Examples - Peer Review Workflow & NFT Integration

## Base URL: `https://fronsciers-be.azakiyasabrina.workers.dev` (Production) | `https://fronsciers-be.azakiyasabrina.workers.dev` (Development)

This document provides detailed request/response examples for the **peer review workflow** and **NFT integration** API endpoints.

## ⚠️ Important: Current Service Status

**PRODUCTION STATUS (Cloudflare Workers):**

- ✅ **CV Registration**: Fully operational
- ✅ **Manuscript Submission**: Fully operational
- ✅ **Peer Review Workflow**: Fully operational
- ✅ **Publication Process**: Fully operational
- ✅ **IPFS File Storage**: Fully operational
- ✅ **Database Operations**: Fully operational
- ⚠️ **NFT Service**: **Temporarily disabled** (returns 503 Service Unavailable)

**NFT SERVICE NOTICE:**
The NFT creation service is currently disabled in the Cloudflare Workers environment due to technical limitations with native dependencies (Metaboss CLI, Sharp image processing). NFT endpoints will return a 503 response with an appropriate message. The core peer review workflow remains fully functional.

## 📋 Using This Documentation

**URL Usage in Examples:**

- Most curl examples use `localhost:5001` for **development/testing**
- For **production**, replace with `https://fronsciers-be.azakiyasabrina.workers.dev`
- Frontend integrations should use the appropriate URL based on environment
- Key workflow examples show both development and production URLs

## 🎯 Complete Workflow Overview

**CURRENT OPERATIONAL FLOW:** CV Registration → Submit → Review Queue → 3+ Reviewers → Publication Decision → Published

**FULL FUTURE FLOW:** CV Registration → Submit → Review Queue → 3+ Reviewers → Publication Decision → Published → NFT Creation → Blockchain Verification

**NFT INTEGRATION (Temporarily Disabled):** Published manuscripts will be automatically converted to academic NFTs on Solana blockchain when the service is restored, providing:

- Immutable proof of publication
- Royalty distribution to authors, reviewers, and platform
- Academic credential verification
- Decentralized storage on IPFS

## ⚠️ Important: Workflow Changes

**NEW FLOW:** CV Registration → Submit → Review Queue → 3+ Reviewers → Publication Decision → Published → NFT Creation

**OLD FLOW:** ~~Submit → Immediately Published~~ (No longer supported)

## 🆕 New Requirement: CV Registration

**MANDATORY:** All authors must upload and register their CV before submitting manuscripts. This ensures:

- Academic qualification verification
- Peer reviewer pool expansion
- Author credibility and institutional affiliation
- Better manuscript-reviewer matching

**Prerequisites for manuscript submission:**

1. ✅ Upload CV (PDF/Image)
2. ✅ Complete CV parsing and verification
3. ✅ CV saved to your wallet address
4. ✅ Then submit manuscripts

## 0. CV Registration Check (Required Before Submission)

### Check CV Registration Status

**GET** `/api/manuscripts/check-cv-status/:walletAddress`

Check if a user has registered their CV and can submit manuscripts.

> **📝 Note:** The examples below use `localhost:5001` for development. For production, replace with `https://fronsciers-be.azakiyasabrina.workers.dev`

**Request (Development):**

```bash
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/check-cv-status/0x1234567890abcdef1234567890abcdef12345678"
```

**Request (Production):**

```bash
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/check-cv-status/0x1234567890abcdef1234567890abcdef12345678"
```

**Response (CV Registered):**

```json
{
  "success": true,
  "hasCV": true,
  "canSubmitManuscripts": true,
  "hasCompleteProfile": true,
  "userInfo": {
    "fullName": "Dr. John Doe",
    "institution": "MIT",
    "profession": "Computer Scientist",
    "registeredAt": "2024-01-01T10:00:00.000Z"
  },
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "message": "CV verified. You can submit manuscripts."
}
```

**Response (No CV Found):**

```json
{
  "success": false,
  "hasCV": false,
  "canSubmitManuscripts": false,
  "message": "No CV found for this wallet address. Please upload your CV first.",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "requiresAction": "cv_upload"
}
```

### Error Response When Attempting Manuscript Submission Without CV

If you try to submit a manuscript without registering your CV first:

```json
{
  "error": "CV registration required",
  "code": "CV_REQUIRED",
  "message": "You must upload and register your CV before submitting manuscripts. Please visit the CV upload page first.",
  "requiresCV": true,
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

## 1. Manuscript Submission for Review

### Submit Manuscript for Peer Review (Recommended)

**POST** `/api/manuscripts/submit`

Manuscripts are now submitted to the review queue, **not immediately published**.

⚠️ **REQUIREMENT:** `authorWallet` is now **mandatory** and must have a registered CV.

**Request Example:**

```bash
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/submit \
  -F "manuscript=@research_paper.pdf" \
  -F "title=AI Applications in Healthcare" \
  -F "author=Dr. John Doe" \
  -F "category=Artificial Intelligence,Healthcare" \
  -F "abstract=This paper explores the applications of artificial intelligence in modern healthcare systems..." \
  -F "keywords=AI,Healthcare,Machine Learning,Medical Diagnosis" \
  -F "authorWallet=0x1234567890abcdef1234567890abcdef12345678"
```

**⚠️ Required Fields:**

- `manuscript` - PDF file
- `title` - Manuscript title
- `author` - Author name
- `category` - Research category
- **`authorWallet`** - ✅ **MANDATORY** - Wallet address with registered CV

**Response Example (NEW STATUS):**

```json
{
  "success": true,
  "manuscript": {
    "id": 123,
    "cid": "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
    "title": "AI Applications in Healthcare",
    "author": "Dr. John Doe",
    "category": "Artificial Intelligence,Healthcare",
    "filename": "research_paper.pdf",
    "size": 1048576,
    "type": "application/pdf",
    "submittedAt": "2024-01-01T12:00:00.000Z",
    "status": "under_review" // ← NEW: Starts in review, not published
  },
  "metadata": {
    "cid": "QmMetadataHashExample123456789"
  },
  "ipfsUrls": {
    "manuscript": "https://ipfs.io/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
    "metadata": "https://ipfs.io/ipfs/QmMetadataHashExample123456789"
  },
  "review": {
    "id": 456,
    "status": "submitted" // ← NEW: Review record created automatically
  }
}
```

### Alternative: Save Manuscript Metadata Only

**POST** `/api/manuscripts/all`

If you already have an IPFS hash, you can save manuscript metadata directly.

⚠️ **REQUIREMENT:** `author_wallet` is now **mandatory** and must have a registered CV.

**Request:**

```bash
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/all \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Applications in Healthcare",
    "author": "Dr. John Doe",
    "category": "Artificial Intelligence,Healthcare",
    "ipfs_hash": "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
    "abstract": "This paper explores the applications of AI in healthcare...",
    "keywords": ["AI", "Healthcare", "Machine Learning"],
    "author_wallet": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

**⚠️ Required Fields:**

- `title` - Manuscript title
- `author` - Author name
- `category` - Research category or array
- `ipfs_hash` - IPFS hash of the manuscript file
- **`author_wallet`** - ✅ **MANDATORY** - Wallet address with registered CV

**Response:**

```json
{
  "success": true,
  "manuscript": {
    "id": 123,
    "title": "AI Applications in Healthcare",
    "author": "Dr. John Doe",
    "status": "under_review", // ← Starts in review queue
    "created_at": "2024-01-01T12:00:00.000Z"
  },
  "review": {
    "id": 456,
    "status": "submitted"
  }
}
```

## 2. Review Dashboard Endpoints

### Get Manuscripts Pending Review

**GET** `/api/manuscripts/pending-review`

For editors/administrators to see manuscripts awaiting review.

**Request:**

```bash
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/pending-review?limit=20&category=Artificial Intelligence"
```

**Response:**

```json
{
  "success": true,
  "status": "under_review",
  "count": 2,
  "manuscripts": [
    {
      "id": 123,
      "title": "AI Applications in Healthcare",
      "author": "Dr. John Doe",
      "category": ["Artificial Intelligence", "Healthcare"],
      "abstract": "This paper explores...",
      "status": "under_review",
      "submissionDate": "2024-01-01T12:00:00.000Z",
      "cid": "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
      "reviewInfo": {
        "reviewsCompleted": 1,
        "reviewsRequired": 3,
        "canPublish": false
      },
      "ipfsUrls": {
        "manuscript": "https://ipfs.io/ipfs/QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o"
      }
    }
  ]
}
```

### Get Published Manuscripts (Public)

**GET** `/api/manuscripts/published/:category`

Public endpoint showing only peer-reviewed, published manuscripts.

**Request:**

```bash
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/published/Artificial Intelligence?limit=10"
```

**Response:**

```json
{
  "success": true,
  "category": ["Artificial Intelligence"],
  "count": 1,
  "manuscripts": [
    {
      "id": 789,
      "title": "Machine Learning in Medical Diagnosis",
      "author": "Dr. Jane Smith",
      "category": ["Artificial Intelligence", "Healthcare"],
      "status": "published", // ← Only published manuscripts shown
      "submissionDate": "2024-01-01T12:00:00.000Z",
      "publishedDate": "2024-01-15T14:30:00.000Z", // ← Publication date
      "cid": "QmPublishedManuscriptHash...",
      "ipfsUrls": {
        "manuscript": "https://ipfs.io/ipfs/QmPublishedManuscriptHash..."
      }
    }
  ]
}
```

### Get Manuscripts by Status

**GET** `/api/manuscripts/status/:status`

Filter manuscripts by their current status.

**Request:**

```bash
# Get all manuscripts under review
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/status/under_review?limit=20"

# Get all published manuscripts
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/status/published?limit=10"
```

**Response:**

```json
{
  "success": true,
  "status": "under_review",
  "count": 5,
  "manuscripts": [
    {
      "id": 123,
      "title": "AI Applications in Healthcare",
      "status": "under_review",
      "submissionDate": "2024-01-01T12:00:00.000Z",
      "author": "Dr. John Doe"
    }
  ]
}
```

## 3. Reviewer Assignment and Review Process

### Assign Multiple Reviewers (Min. 3 Required)

**POST** `/api/reviews/manuscript/:manuscriptId/assign-reviewers`

Assign minimum 3 reviewers to ensure thorough peer review.

**Request:**

```bash
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/manuscript/123/assign-reviewers \
  -H "Content-Type: application/json" \
  -d '{
    "reviewers": [
      "0xReviewer1Address123...",
      "0xReviewer2Address456...",
      "0xReviewer3Address789..."
    ],
    "assignedBy": "editor@journal.com"
  }'
```

**Response:**

```json
{
  "success": true,
  "manuscriptId": 123,
  "reviewersAssigned": 3,
  "reviewRecords": [
    {
      "id": 501,
      "reviewer": "0xReviewer1Address123...",
      "deadline": "2024-02-01T00:00:00.000Z"
    },
    {
      "id": 502,
      "reviewer": "0xReviewer2Address456...",
      "deadline": "2024-02-01T00:00:00.000Z"
    },
    {
      "id": 503,
      "reviewer": "0xReviewer3Address789...",
      "deadline": "2024-02-01T00:00:00.000Z"
    }
  ],
  "message": "3 reviewers assigned successfully"
}
```

### Submit Review Decision

**POST** `/api/reviews/:reviewId/submit-review`

Reviewers submit their decisions and comments.

**Request:**

```bash
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/501/submit-review \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "accept",
    "comments": "Excellent methodology and clear presentation. The experimental results strongly support the conclusions. Minor typos on pages 5 and 12.",
    "confidentialComments": "This is a strong contribution to the field. The author has addressed previous concerns well.",
    "reviewerWallet": "0xReviewer1Address123..."
  }'
```

**Valid Decisions:**

- `accept` - Manuscript ready for publication
- `reject` - Manuscript not suitable for publication
- `minor_revision` - Accept after minor changes
- `major_revision` - Significant changes needed

**Response:**

```json
{
  "success": true,
  "review": {
    "id": 501,
    "status": "completed",
    "decision": "accept",
    "completedAt": "2024-01-20T14:30:00.000Z"
  },
  "manuscriptId": 123,
  "reviewProgress": {
    "completed": 1,
    "required": 3,
    "canPublish": false,
    "publishRecommendation": null
  },
  "message": "Review submitted successfully"
}
```

### Check Review Status & Publication Readiness

**GET** `/api/reviews/manuscript/:manuscriptId/review-status`

Monitor review progress and publication eligibility.

**Request:**

```bash
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/manuscript/123/review-status"
```

**Response (All Reviews Completed):**

```json
{
  "success": true,
  "manuscriptId": 123,
  "manuscriptTitle": "AI Applications in Healthcare",
  "currentStatus": "under_review",
  "totalReviewers": 3,
  "reviewsCompleted": 3,
  "reviewsInProgress": 0,
  "reviewsPending": 0,
  "requiredReviews": 3,
  "canPublish": true, // ← Ready for publication!
  "nextAction": "ready_to_publish",
  "reviews": [
    {
      "id": 501,
      "reviewer": "0xReviewer1Address123...",
      "status": "completed",
      "deadline": "2024-02-01T00:00:00.000Z",
      "completed": "2024-01-20T14:30:00.000Z",
      "overdue": false
    },
    {
      "id": 502,
      "reviewer": "0xReviewer2Address456...",
      "status": "completed",
      "completed": "2024-01-21T09:15:00.000Z",
      "overdue": false
    },
    {
      "id": 503,
      "reviewer": "0xReviewer3Address789...",
      "status": "completed",
      "completed": "2024-01-22T11:45:00.000Z",
      "overdue": false
    }
  ]
}
```

## 4. Publication Process

### Publish Approved Manuscript

**POST** `/api/manuscripts/:id/publish`

Publish manuscript after successful peer review (requires 2+ accepts from 3+ reviews).

**Request:**

```bash
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/123/publish \
  -H "Content-Type: application/json" \
  -d '{
    "publishedBy": "editor@journal.com"
  }'
```

**Response:**

```json
{
  "success": true,
  "manuscript": {
    "id": 123,
    "title": "AI Applications in Healthcare",
    "author": "Dr. John Doe",
    "status": "published",
    "publishedDate": "2024-01-22T16:00:00.000Z",
    "publishedBy": "editor@journal.com"
  },
  "message": "Manuscript published successfully"
}
```

## 5. CV Registration Process (MANDATORY)

### Step 1: Upload and Parse CV

**POST** `/api/parse-cv/parse-cv`

Upload your CV (PDF or image) and parse it with AI to extract structured data.

**Request:**

```bash
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/parse-cv/parse-cv \
  -F "cv=@john_doe_cv.pdf" \
  -F "walletAddress=0x1234567890abcdef1234567890abcdef12345678"
```

**⚠️ Required Fields:**

- `cv` - CV file (PDF, JPG, PNG)
- `walletAddress` - Your wallet address (links CV to your account)

**🤖 Enhanced AI Extraction:**

- **Field**: General academic domain (e.g., "Computer Science", "Biology")
- **Specialization**: Specific expertise area (e.g., "Machine Learning", "Quantum Computing")
- **Smart Detection**: AI analyzes research interests, dissertation topics, publications, and technical skills to identify your specialization

**Response:**

```json
{
  "success": true,
  "data": {
    "selfIdentity": {
      "fullName": "Dr. John Doe",
      "title": "Associate Professor",
      "profession": "Computer Scientist",
      "institution": "MIT",
      "location": "Cambridge, MA",
      "field": "Computer Science",
      "specialization": "Machine Learning and Artificial Intelligence"
    },
    "contact": {
      "email": "john.doe@mit.edu",
      "phone": "+1-555-0123",
      "linkedIn": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "website": "https://johndoe.mit.edu"
    },
    "overview": "Experienced researcher in artificial intelligence and machine learning with 15+ years of experience...",
    "education": [
      {
        "degree": "PhD",
        "field": "Computer Science",
        "institution": "Stanford University",
        "year": "2010",
        "details": "Dissertation: Deep Learning Applications in Natural Language Processing"
      }
    ],
    "experience": [
      {
        "position": "Associate Professor",
        "institution": "MIT",
        "startDate": "2015",
        "endDate": "Present",
        "description": "Leading research in AI and machine learning..."
      }
    ],
    "publications": [
      {
        "title": "Deep Learning for Medical Diagnosis",
        "journal": "Nature Medicine",
        "year": "2023",
        "type": "first-author",
        "citations": 150
      }
    ],
    "skills": ["Machine Learning", "Deep Learning", "Python", "TensorFlow"],
    "awards": [
      {
        "name": "Best Paper Award",
        "organization": "ICML",
        "year": "2022"
      }
    ]
  },
  "extractedText": "Dr. John Doe Associate Professor MIT...",
  "message": "CV parsed successfully"
}
```

### Step 2: Save CV Data (Automatic)

The CV parsing endpoint automatically saves the parsed data to your wallet address, so no additional step is required. The CV is immediately available for manuscript submission.

### Step 3: Verify CV Registration

**GET** `/api/parse-cv/user/profile/:walletAddress`

Check that your CV was saved correctly and view your parsed profile.

**Request:**

```bash
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/parse-cv/user/profile/0x1234567890abcdef1234567890abcdef12345678"
```

**Response:**

```json
{
  "success": true,
  "profile": {
    "id": 123,
    "filename": "john_doe_cv.pdf",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "personalInfo": {
      "fullName": "Dr. John Doe",
      "title": "Associate Professor",
      "profession": "Computer Scientist",
      "institution": "MIT",
      "location": "Cambridge, MA",
      "field": "Computer Science",
      "specialization": "Machine Learning and Artificial Intelligence"
    },
    "contact": {
      "email": "john.doe@mit.edu",
      "phone": "+1-555-0123",
      "linkedIn": "https://linkedin.com/in/johndoe"
    },
    "summary": {
      "education": 3,
      "experience": 5,
      "publications": 25,
      "awards": 4
    }
  },
  "message": "✅ CV verified - You can now submit manuscripts"
}
```

### Step 4: Check Specialization Extraction (Optional)

**GET** `/api/parse-cv/user/specialization/:walletAddress`

Get detailed information about the user's extracted field and specialization.

**Request:**

```bash
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/parse-cv/user/specialization/0x1234567890abcdef1234567890abcdef12345678"
```

**Response:**

```json
{
  "success": true,
  "message": "Specialization data retrieved successfully",
  "data": {
    "fullName": "Dr. John Doe",
    "field": "Computer Science",
    "specialization": "Machine Learning and Artificial Intelligence",
    "profession": "Associate Professor",
    "institution": "MIT",
    "researchAreas": [
      "Nature Machine Intelligence",
      "IEEE Transactions on AI",
      "ICML",
      "NeurIPS",
      "AAAI"
    ],
    "extractedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**What the AI Extracts for Specialization:**

- Research interests and focus areas
- PhD dissertation topics
- Specialized technical skills
- Niche expertise within broader field
- Teaching specializations
- Publication domains and research themes

### Step 5: Update Profile (Optional)

**PATCH** `/api/parse-cv/user/profile/:walletAddress`

Update user profile information after initial CV registration.

**Request:**

```bash
curl -X PATCH "https://fronsciers-be.azakiyasabrina.workers.dev/api/parse-cv/user/profile/0x1234567890abcdef1234567890abcdef12345678" \
  -H "Content-Type: application/json" \
  -d '{
    "personalInfo": {
      "fullName": "Dr. John Doe",
      "title": "Full Professor",
      "profession": "Senior Research Scientist",
      "institution": "Stanford University",
      "location": "Stanford, CA",
      "field": "Computer Science",
      "specialization": "Deep Learning and Neural Networks"
    },
    "contact": {
      "email": "john.doe@stanford.edu",
      "phone": "+1-650-555-0123",
      "linkedIn": "https://linkedin.com/in/johndoe-stanford",
      "github": "https://github.com/johndoe-ai",
      "website": "https://johndoe.stanford.edu"
    },
    "overview": "Leading researcher in deep learning with 20+ years of experience in neural network architectures and AI applications."
  }'
```

**Request Body Structure:**

```json
{
  "personalInfo": {
    "fullName": "string (optional)",
    "title": "string (optional)",
    "profession": "string (optional)",
    "institution": "string (optional)",
    "location": "string (optional)",
    "field": "string (optional)",
    "specialization": "string (optional)"
  },
  "contact": {
    "email": "string (optional)",
    "phone": "string (optional)",
    "linkedIn": "string (optional)",
    "github": "string (optional)",
    "website": "string (optional)"
  },
  "overview": "string (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "id": 123,
    "filename": "john_doe_cv.pdf",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "personalInfo": {
      "fullName": "Dr. John Doe",
      "title": "Full Professor",
      "profession": "Senior Research Scientist",
      "institution": "Stanford University",
      "location": "Stanford, CA",
      "field": "Computer Science",
      "specialization": "Deep Learning and Neural Networks"
    },
    "contact": {
      "email": "john.doe@stanford.edu",
      "phone": "+1-650-555-0123",
      "linkedIn": "https://linkedin.com/in/johndoe-stanford"
    },
    "overview": "Leading researcher in deep learning with 20+ years of experience...",
    "summary": {
      "education": 3,
      "experience": 5,
      "publications": 25,
      "awards": 4
    }
  },
  "updatedFields": ["fullName", "title", "profession", "institution", "email"]
}
```

**🔒 Security Notes:**

- Only the wallet owner can update their profile
- All fields are optional - update only what you need
- Changes are immediately reflected in manuscript submissions
- Updated timestamp is automatically tracked

## 6. Complete Workflow Example

### End-to-End Manuscript Publication

```bash
# 0. MANDATORY FIRST STEP: Register CV
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/parse-cv/parse-cv \
  -F "cv=@alice_johnson_cv.pdf" \
  -F "walletAddress=0xAliceWallet123..."
# Response: CV parsed and saved successfully

# 0.1. Verify CV registration
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/check-cv-status/0xAliceWallet123..."
# Response: { "success": true, "canSubmitManuscripts": true }

# 1. Submit manuscript for peer review (CV required)
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/submit \
  -F "manuscript=@quantum_research.pdf" \
  -F "title=Quantum Error Correction Methods" \
  -F "author=Dr. Alice Johnson" \
  -F "category=Quantum Computing" \
  -F "abstract=Novel approaches to quantum error correction..." \
  -F "authorWallet=0xAliceWallet123..."
# Response: Manuscript ID 456, Status: "under_review"

# 2. Editor checks pending manuscripts
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/pending-review?limit=10"
# Response: Shows manuscript 456 awaiting review

# 3. Editor assigns 3 reviewers
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/manuscript/456/assign-reviewers \
  -H "Content-Type: application/json" \
  -d '{
    "reviewers": ["0xExpert1", "0xExpert2", "0xExpert3"],
    "assignedBy": "editor@quantumjournal.com"
  }'
# Response: 3 review records created (IDs: 601, 602, 603)

# 4. Reviewer 1 accepts
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/601/submit-review \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "accept",
    "comments": "Innovative approach with solid theoretical foundation.",
    "reviewerWallet": "0xExpert1"
  }'

# 5. Reviewer 2 accepts
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/602/submit-review \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "accept",
    "comments": "Excellent experimental validation of the proposed methods.",
    "reviewerWallet": "0xExpert2"
  }'

# 6. Reviewer 3 requests minor revision
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/603/submit-review \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "minor_revision",
    "comments": "Please clarify the complexity analysis in section 4.2.",
    "reviewerWallet": "0xExpert3"
  }'
# Result: 2 accepts + 1 minor revision = Publication eligible

# 7. Check if ready to publish
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/manuscript/456/review-status"
# Response: canPublish: true, nextAction: "ready_to_publish"

# 8. Publish the manuscript
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/456/publish \
  -H "Content-Type: application/json" \
  -d '{"publishedBy": "editor@quantumjournal.com"}'
# Response: Status changed to "published"

# 9. Manuscript now appears in public listings
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/published/Quantum Computing"
# Response: Shows published manuscript in public feed
```

## 7. Legacy Endpoints (Modified Behavior)

### Recent Manuscripts (Now Shows Only Published)

**GET** `/api/manuscripts/recent/:category`

⚠️ **Legacy endpoint** - now only returns published manuscripts for backward compatibility.

**Request:**

```bash
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/recent/Artificial Intelligence?limit=5"
```

**Response:**

```json
{
  "success": true,
  "category": ["Artificial Intelligence"],
  "count": 1,
  "manuscripts": [
    {
      "id": 789,
      "title": "Machine Learning in Medical Diagnosis",
      "status": "published", // ← Only published manuscripts
      "publishedDate": "2024-01-15T14:30:00.000Z",
      "submissionDate": "2024-01-01T12:00:00.000Z"
    }
  ],
  "message": "Published manuscripts retrieved successfully (legacy endpoint)"
}
```

## 8. Frontend Integration Examples

### Profile Update Interface

```javascript
// Update user profile with edited data
const updateUserProfile = async (walletAddress, editData) => {
  try {
    const response = await fetch(
      `/api/parse-cv/user/profile/${walletAddress}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("✅ Profile updated successfully");
      console.log(`📝 Updated fields: ${result.updatedFields.join(", ")}`);

      // Update local state with new profile data
      return {
        success: true,
        profile: result.profile,
        updatedFields: result.updatedFields,
      };
    } else {
      console.error("❌ Profile update failed:", result.message);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: error.message };
  }
};

// Example usage in a React component
const handleSave = async () => {
  const result = await updateUserProfile(walletAddress, {
    personalInfo: {
      fullName: editData.personalInfo.fullName,
      title: editData.personalInfo.title,
      profession: editData.personalInfo.profession,
      institution: editData.personalInfo.institution,
      specialization: editData.personalInfo.specialization,
    },
    contact: {
      email: editData.contact.email,
      phone: editData.contact.phone,
      linkedIn: editData.contact.linkedIn,
    },
    overview: editData.overview,
  });

  if (result.success) {
    setProfileData(result.profile);
    setIsEditing(false);
    alert("Profile updated successfully!");
  } else {
    alert(`Failed to update profile: ${result.error}`);
  }
};

// Validate profile completeness
const checkProfileCompleteness = (profile) => {
  const required = ["fullName", "institution", "field"];
  const missing = required.filter(
    (field) =>
      !profile.personalInfo[field] || profile.personalInfo[field].trim() === ""
  );

  return {
    isComplete: missing.length === 0,
    missingFields: missing,
    completionScore:
      ((required.length - missing.length) / required.length) * 100,
  };
};
```

### CV Registration Check (Required Before Manuscript Submission)

```javascript
// Check if user has registered CV before allowing manuscript submission
const checkCVRegistration = async (walletAddress) => {
  try {
    const response = await fetch(
      `/api/manuscripts/check-cv-status/${walletAddress}`
    );
    const result = await response.json();

    if (result.success && result.canSubmitManuscripts) {
      console.log(`✅ CV verified for ${result.userInfo.fullName}`);
      console.log(`🏫 Institution: ${result.userInfo.institution}`);
      console.log(`📅 Registered: ${result.userInfo.registeredAt}`);
      return true; // Allow manuscript submission
    } else {
      console.log(`❌ ${result.message}`);
      alert("Please upload your CV before submitting manuscripts.");
      return false; // Block manuscript submission
    }
  } catch (error) {
    console.error("Failed to check CV status:", error);
    return false;
  }
};

// Submit manuscript with CV validation
const submitManuscript = async (manuscriptData, walletAddress) => {
  // First check CV registration
  const hasCV = await checkCVRegistration(walletAddress);
  if (!hasCV) {
    return { success: false, error: "CV registration required" };
  }

  // Proceed with manuscript submission
  const formData = new FormData();
  formData.append("manuscript", manuscriptData.file);
  formData.append("title", manuscriptData.title);
  formData.append("author", manuscriptData.author);
  formData.append("category", manuscriptData.category);
  formData.append("authorWallet", walletAddress); // Required!

  try {
    const response = await fetch("/api/manuscripts/submit", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Manuscript submitted: ${result.manuscript.title}`);
      console.log(`🆔 Manuscript ID: ${result.manuscript.id}`);
      return result;
    } else {
      if (result.code === "CV_REQUIRED") {
        alert("CV registration required. Please upload your CV first.");
      }
      return result;
    }
  } catch (error) {
    console.error("Failed to submit manuscript:", error);
    return { success: false, error: error.message };
  }
};
```

### Review Dashboard Component

```javascript
// Get manuscripts pending review for admin dashboard
const getPendingManuscripts = async () => {
  try {
    const response = await fetch("/api/manuscripts/pending-review?limit=20");
    const result = await response.json();

    if (result.success) {
      result.manuscripts.forEach((manuscript) => {
        const progress = manuscript.reviewInfo;
        console.log(
          `${manuscript.title}: ${progress.reviewsCompleted}/${progress.reviewsRequired} reviews completed`
        );

        if (progress.canPublish) {
          console.log(`✅ Ready to publish: ${manuscript.title}`);
        }
      });
    }

    return result.manuscripts;
  } catch (error) {
    console.error("Failed to get pending manuscripts:", error);
  }
};
```

### Public Publication Feed

```javascript
// Get published manuscripts for public viewing
const getPublishedManuscripts = async (category) => {
  try {
    const response = await fetch(
      `/api/manuscripts/published/${encodeURIComponent(category)}?limit=10`
    );
    const result = await response.json();

    if (result.success) {
      // Only shows peer-reviewed, published content
      result.manuscripts.forEach((manuscript) => {
        console.log(`📚 Published: ${manuscript.title}`);
        console.log(`📅 Publication Date: ${manuscript.publishedDate}`);
        console.log(`🔗 IPFS: ${manuscript.ipfsUrls.manuscript}`);
      });
    }

    return result.manuscripts;
  } catch (error) {
    console.error("Failed to get published manuscripts:", error);
  }
};
```

### Reviewer Interface

```javascript
// Submit review decision
const submitReview = async (reviewId, decision, comments) => {
  try {
    const reviewData = {
      decision: decision, // 'accept', 'reject', 'minor_revision', 'major_revision'
      comments: comments,
      confidentialComments: "Confidential notes for editors...",
      reviewerWallet: getCurrentUserWallet(),
    };

    const response = await fetch(`/api/reviews/${reviewId}/submit-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Review submitted successfully");

      if (result.reviewProgress.canPublish) {
        alert("🎉 This manuscript is now ready for publication!");
      } else {
        const remaining =
          result.reviewProgress.required - result.reviewProgress.completed;
        console.log(`📊 ${remaining} more reviews needed for publication`);
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to submit review:", error);
  }
};
```

### Editor Publication Interface

```javascript
// Check if manuscript is ready and publish it
const publishManuscript = async (manuscriptId) => {
  try {
    // First check review status
    const statusResponse = await fetch(
      `/api/reviews/manuscript/${manuscriptId}/review-status`
    );
    const statusResult = await statusResponse.json();

    if (!statusResult.canPublish) {
      alert(`❌ Cannot publish: ${statusResult.nextAction}`);
      return false;
    }

    // Publish the manuscript
    const publishResponse = await fetch(
      `/api/manuscripts/${manuscriptId}/publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishedBy: getCurrentEditorEmail(),
        }),
      }
    );

    const publishResult = await publishResponse.json();

    if (publishResult.success) {
      console.log(`✅ Published: ${publishResult.manuscript.title}`);
      console.log(
        `📅 Publication Date: ${publishResult.manuscript.publishedDate}`
      );
      return true;
    }
  } catch (error) {
    console.error("Failed to publish manuscript:", error);
  }

  return false;
};
```

## 9. Error Handling

### CV Registration Errors

**Missing CV Registration:**

```json
{
  "error": "CV registration required",
  "code": "CV_REQUIRED",
  "message": "You must upload and register your CV before submitting manuscripts. Please visit the CV upload page first.",
  "requiresCV": true,
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Missing Wallet Address:**

```json
{
  "error": "Author wallet address is required for manuscript submission",
  "code": "MISSING_WALLET",
  "message": "Please provide your wallet address to submit manuscripts"
}
```

### Profile Update Errors

**User Not Found:**

```json
{
  "error": "User not found",
  "message": "No CV data found for this wallet address"
}
```

**No Valid Updates:**

```json
{
  "error": "No valid updates provided",
  "message": "Please provide at least one field to update"
}
```

**Update Failed:**

```json
{
  "error": "Failed to update profile",
  "message": "Database connection failed",
  "code": "UPDATE_ERROR"
}
```

### Workflow-Specific Errors

**Insufficient Reviewers:**

```json
{
  "error": "Minimum 3 reviewers required",
  "code": "INSUFFICIENT_REVIEWERS"
}
```

**Invalid Review Decision:**

```json
{
  "error": "Valid decision required: accept, reject, minor_revision, major_revision",
  "code": "INVALID_DECISION"
}
```

**Manuscript Not Ready for Publication:**

```json
{
  "error": "Manuscript not ready for publication - insufficient approved reviews",
  "code": "PUBLICATION_NOT_READY",
  "details": {
    "reviewsCompleted": 2,
    "reviewsRequired": 3,
    "approvedReviews": 1,
    "requiredApprovals": 2
  }
}
```

## 10. NFT Integration (⚠️ Currently Disabled)

### ⚠️ Service Status Notice

**ALL NFT endpoints are currently returning 503 Service Unavailable** due to Cloudflare Workers technical limitations. The service will be restored in a future update.

### Typical Error Response for NFT Endpoints

**All NFT endpoints** (`/api/nft-metadata/*`) currently return:

```json
{
  "error": "Service temporarily unavailable",
  "message": "NFT metadata service is temporarily disabled for Cloudflare Workers deployment due to technical limitations with native dependencies.",
  "status": 503,
  "serviceStatus": "disabled",
  "expectedResolution": "Future update with Workers-compatible implementation"
}
```

### Affected NFT Endpoints (Currently Disabled)

The following endpoints are temporarily unavailable:

- `GET /api/nft-metadata/health` - NFT service health check
- `POST /api/nft-metadata/create` - Create academic NFT
- `GET /api/nft-metadata/:mint` - Get NFT metadata
- `PUT /api/nft-metadata/:mint` - Update NFT metadata
- `GET /api/nft-metadata/:mint/verify` - Verify NFT metadata
- `POST /api/nft-metadata/preview-image` - Generate preview image

### Frontend Integration Notes for NFT Features

When integrating NFT features in your frontend:

````javascript
// Check NFT service availability
const checkNFTServiceStatus = async () => {
  try {
    const response = await fetch("/api/nft-metadata/health");
    const result = await response.json();

    if (response.status === 503) {
      console.log("ℹ️ NFT service currently disabled");
      return {
        available: false,
        message: result.message,
        status: "disabled"
      };
    }

    return {
      available: true,
      status: result.status,
      services: result.services
    };
  } catch (error) {
    console.error("Failed to check NFT service:", error);
    return {
      available: false,
      status: "error",
      error: error.message
    };
  }
};

// Conditional NFT features
const ManuscriptActions = ({ manuscript }) => {
  const [nftServiceAvailable, setNftServiceAvailable] = useState(false);

  useEffect(() => {
    checkNFTServiceStatus().then(status => {
      setNftServiceAvailable(status.available);
    });
  }, []);

  return (
    <div className="manuscript-actions">
      <a href={manuscript.ipfsUrls.manuscript} target="_blank">
        📄 View Manuscript
      </a>

      {/* Conditionally show NFT actions */}
      {nftServiceAvailable ? (
        <button onClick={() => createNFT(manuscript.id)}>
          🎯 Create NFT
        </button>
      ) : (
        <div className="nft-disabled-notice">
          <span>🔧 NFT service temporarily unavailable</span>
          <small>Feature will be restored in future update</small>
        </div>
      )}
    </div>
  );
};

// Graceful degradation for NFT features
const PublicationCard = ({ manuscript }) => {
  return (
    <div className="publication-card">
      <h3>{manuscript.title}</h3>
      <p className="author">By {manuscript.author}</p>
      <p className="abstract">{manuscript.abstract}</p>

      <div className="publication-meta">
        <span className="status published">✅ Published</span>
        <span className="date">{manuscript.publishedDate}</span>
        <span className="reviewers">
          {manuscript.reviewers?.length || 0} reviewers
        </span>
      </div>

      {/* Show NFT placeholder when service is disabled */}
      <div className="nft-section">
        {manuscript.nftMint ? (
          <div className="nft-badge">
            <div className="nft-icon">🎯</div>
            <div className="nft-info">
              <div className="nft-title">Academic NFT</div>
              <div className="nft-status">Available on blockchain</div>
            </div>
          </div>
        ) : (
          <div className="nft-placeholder">
            <div className="nft-icon">🔧</div>
            <div className="nft-info">
              <div className="nft-title">NFT Creation</div>
              <div className="nft-status">Temporarily unavailable</div>
            </div>
          </div>
        )}
      </div>

      <div className="actions">
        <a
          href={manuscript.ipfsUrls.manuscript}
          target="_blank"
          rel="noopener noreferrer"
        >
          📄 View Manuscript
        </a>
      </div>
    </div>
  );
};

### Future NFT Integration

When the NFT service is restored, it will provide:

## 11. Complete End-to-End Workflow Example (Current)

### Full Academic Publication Workflow (NFT Creation Temporarily Disabled)

```bash
# 0. MANDATORY FIRST STEP: Register CV
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/parse-cv/parse-cv \
  -F "cv=@alice_johnson_cv.pdf" \
  -F "walletAddress=0xAliceWallet123..."
# Response: CV parsed and saved successfully

# 0.1. Verify CV registration
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/check-cv-status/0xAliceWallet123..."
# Response: { "success": true, "canSubmitManuscripts": true }

# 1. Submit manuscript for peer review (CV required)
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/submit \
  -F "manuscript=@quantum_research.pdf" \
  -F "title=Quantum Error Correction Methods" \
  -F "author=Dr. Alice Johnson" \
  -F "category=Quantum Computing" \
  -F "abstract=Novel approaches to quantum error correction..." \
  -F "authorWallet=0xAliceWallet123..."
# Response: Manuscript ID 456, Status: "under_review"

# 2. Editor assigns 3 reviewers
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/manuscript/456/assign-reviewers \
  -H "Content-Type: application/json" \
  -d '{
    "reviewers": ["0xExpert1", "0xExpert2", "0xExpert3"],
    "assignedBy": "editor@quantumjournal.com"
  }'
# Response: 3 review records created (IDs: 601, 602, 603)

# 3. All reviewers submit decisions
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/601/submit-review \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "accept",
    "comments": "Innovative approach with solid theoretical foundation.",
    "reviewerWallet": "0xExpert1"
  }'

curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/602/submit-review \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "accept",
    "comments": "Excellent experimental validation of the proposed methods.",
    "reviewerWallet": "0xExpert2"
  }'

curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/603/submit-review \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "accept",
    "comments": "Innovative approach with solid foundation.",
    "reviewerWallet": "0xExpert3"
  }'

# 4. Check if ready to publish
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/reviews/manuscript/456/review-status"
# Response: canPublish: true, nextAction: "ready_to_publish"

# 5. Publish the manuscript
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/456/publish \
  -H "Content-Type: application/json" \
  -d '{"publishedBy": "editor@quantumjournal.com"}'
# Response: Status changed to "published"

# 6. ⚠️ NFT Creation (Currently Disabled)
curl -X POST https://fronsciers-be.azakiyasabrina.workers.dev/api/nft-metadata/create \
  -H "Content-Type: application/json" \
  -d '{
    "mint": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "doci": "10.5281/zenodo.1234567",
    "title": "Quantum Error Correction Methods in Modern Computing",
    "description": "This paper presents novel approaches to quantum error correction...",
    "ipfs_hash": "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
    "author": "Dr. Alice Johnson"
  }'
# Response: 503 Service Unavailable - NFT service temporarily disabled

# 7. Manuscript appears in public listings (without NFT for now)
curl "https://fronsciers-be.azakiyasabrina.workers.dev/api/manuscripts/published/Quantum Computing"
# Response: Shows published manuscript in public feed
````

## 12. Production Deployment Information

### API Base URLs

**Production (Cloudflare Workers):**

```
https://fronsciers-be.azakiyasabrina.workers.dev
```

**Local Development:**

```
https://fronsciers-be.azakiyasabrina.workers.dev
```

### Service Status Summary

| Service               | Status         | Notes                      |
| --------------------- | -------------- | -------------------------- |
| CV Registration       | ✅ Operational | Full functionality         |
| Manuscript Submission | ✅ Operational | All features working       |
| Peer Review Workflow  | ✅ Operational | Complete review process    |
| Publication Process   | ✅ Operational | Publishing workflow active |
| IPFS File Storage     | ✅ Operational | Pinata integration working |
| Database Operations   | ✅ Operational | Supabase connection active |
| NFT Creation          | ⚠️ Disabled    | Temporarily unavailable    |
| Health Check          | ✅ Operational | System monitoring active   |

### Frontend Integration URLs

Update your frontend configuration to use the production URLs:

```javascript
// Frontend configuration
const API_CONFIG = {
  production: {
    baseURL: "https://fronsciers-be.azakiyasabrina.workers.dev",
    nftEnabled: false, // Currently disabled
  },
  development: {
    baseURL: "https://fronsciers-be.azakiyasabrina.workers.dev",
    nftEnabled: true, // Available in local development
  },
};

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? API_CONFIG.production.baseURL
    : API_CONFIG.development.baseURL;

const NFT_ENABLED =
  process.env.NODE_ENV === "production"
    ? API_CONFIG.production.nftEnabled
    : API_CONFIG.development.nftEnabled;
```

### Error Handling for Disabled Services

```javascript
// Handle NFT service unavailability
const handleNFTRequest = async (endpoint, data) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/nft-metadata/${endpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (response.status === 503) {
      const result = await response.json();
      return {
        success: false,
        disabled: true,
        message: result.message,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
```

## 13. Summary & Frontend Integration Checklist

### ✅ What's Working in Production

**Full Operational Services:**

- ✅ CV registration and parsing
- ✅ Manuscript submission and storage
- ✅ Complete peer review workflow (3+ reviewers required)
- ✅ Publication process
- ✅ IPFS file storage via Pinata
- ✅ Database operations via Supabase
- ✅ Health monitoring

**Current Production URL:** `https://fronsciers-be.azakiyasabrina.workers.dev`

### ⚠️ Temporarily Disabled

**NFT Service:** All `/api/nft-metadata/*` endpoints return 503 due to Cloudflare Workers limitations with:

- Metaboss CLI (native binary)
- Sharp image processing (native dependencies)
- File system operations

### 🚀 Frontend Integration Quick Start

```javascript
// Production-ready configuration
const API_CONFIG = {
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://fronsciers-be.azakiyasabrina.workers.dev"
      : "https://fronsciers-be.azakiyasabrina.workers.dev",
  nftEnabled: process.env.NODE_ENV !== "production", // Disabled in production
};

// Essential endpoints for your frontend:
const ENDPOINTS = {
  // CV Registration (Required first step)
  uploadCV: "/api/parse-cv/parse-cv",
  checkCVStatus: "/api/manuscripts/check-cv-status/:wallet",
  getUserProfile: "/api/parse-cv/user/profile/:wallet",

  // Manuscript Workflow
  submitManuscript: "/api/manuscripts/submit",
  getPendingReview: "/api/manuscripts/pending-review",
  getPublished: "/api/manuscripts/published/:category",

  // Review Process
  assignReviewers: "/api/reviews/manuscript/:id/assign-reviewers",
  submitReview: "/api/reviews/:id/submit-review",
  checkReviewStatus: "/api/reviews/manuscript/:id/review-status",
  publishManuscript: "/api/manuscripts/:id/publish",

  // System Health
  health: "/api/health",
};
```

### 🔄 Migration from Previous Version

If updating from a previous implementation:

1. **Add CV requirement checks** before manuscript submission
2. **Update status handling** - manuscripts start as "under_review", not "published"
3. **Implement review workflow** with minimum 3 reviewers
4. **Handle NFT service gracefully** - show disabled state, don't break UI
5. **Update URLs** to production endpoint

### 📈 Deployment Status

- **Startup Time:** ~32ms
- **Bundle Size:** 4.7MB (1.4MB compressed)
- **Success Rate:** 100% for operational endpoints
- **Monitoring:** Active health checks on all services

This documentation provides complete coverage of the **peer review workflow** and **temporary NFT service status**, ensuring seamless frontend integration with the current production deployment.
