export const SOLANA_CONFIG = {
  PROGRAM_ID: "28VkA76EcTTN746SxZyYT8NTte9gofeBQ2L4N8hfYPgd",
  RPC_URL:
    "https://devnet.helius-rpc.com/?api-key=3451b7c4-f90f-451e-a4b5-c51966815b43",
  WS_URL:
    "wss://devnet.helius-rpc.com/?api-key=3451b7c4-f90f-451e-a4b5-c51966815b43",
  COMMITMENT: "confirmed" as const,
} as const;

export const DEVNET_USDCF_ADDRESS =
  "B4UmZhTkjFJoAFp2r4LcuWaY8aPy4oH7kE9ej1Ctp4Vo";
export const DEVNET_FRONS_ADDRESS =
  "2MjhRY9M2qL3PxAa5jCw4hqkpjbebLwq7EkLHtowDkUL";
export const ESCROW_ADDRESS = "5KpNaznowuAnjgvT56aghxT8rpPHCcpUmupSdgtA923H";

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
