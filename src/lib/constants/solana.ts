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
