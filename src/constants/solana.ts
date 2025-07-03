export const SOLANA_CONFIG = {
  PROGRAM_ID: "28VkA76EcTTN746SxZyYT8NTte9gofeBQ2L4N8hfYPgd",
  RPC_URL: "https://api.devnet.solana.com",
  WS_URL: "wss://api.devnet.solana.com",
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
