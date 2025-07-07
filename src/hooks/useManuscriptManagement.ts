import { useState, useCallback } from "react";
import axios from "axios";

interface ReviewInfo {
  reviewsCompleted: number;
  reviewsRequired: number;
  canPublish: boolean;
}

interface IPFSUrls {
  manuscript: string;
  metadata: string | null;
}

interface Manuscript {
  id: string;
  title: string;
  abstract: string;
  category: string[];
  keywords: string[];
  author_wallet: string;
  status: "under_review" | "published" | "rejected" | "revision_required";
  submissionDate: string;
  created_at: string;
  updated_at: string;
  publishedDate?: string;
  cid: string;
  ipfs_hash: string;
  reviewInfo?: ReviewInfo;
  reviews?: any[];
  ipfsUrls?: IPFSUrls;
}

interface ManuscriptResponse {
  success: boolean;
  manuscripts: Manuscript[];
  count?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export function useManuscriptManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  // Get manuscripts by author wallet
  const getAuthorManuscripts = useCallback(
    async (walletAddress: string): Promise<Manuscript[] | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get<ManuscriptResponse>(
          `${apiUrl}/manuscripts/author/${walletAddress}`
        );

        if (response.data.success) {
          return response.data.manuscripts;
        } else {
          throw new Error(response.data.error || "Failed to fetch manuscripts");
        }
      } catch (err) {
        console.error("Failed to fetch author manuscripts:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch manuscripts"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl]
  );

  // Get manuscripts by status
  const getManuscriptsByStatus = useCallback(
    async (
      status: "under_review" | "published" | "rejected",
      limit: number = 20,
      category?: string
    ): Promise<Manuscript[] | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get<ManuscriptResponse>(
          `${apiUrl}/manuscripts/status/${status}`,
          {
            params: {
              limit,
              category,
            },
          }
        );

        if (response.data.success) {
          return response.data.manuscripts;
        } else {
          throw new Error(response.data.error || "Failed to fetch manuscripts");
        }
      } catch (err) {
        console.error("Failed to fetch manuscripts by status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch manuscripts"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl]
  );

  // Get pending review manuscripts
  const getPendingReviewManuscripts = useCallback(
    async (
      limit: number = 20,
      category?: string,
      reviewerWallet?: string
    ): Promise<Manuscript[] | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get<ManuscriptResponse>(
          `${apiUrl}/manuscripts/pending-review`,
          {
            params: {
              limit,
              category,
              reviewerWallet,
            },
          }
        );

        if (response.data.success) {
          return response.data.manuscripts;
        } else {
          throw new Error(
            response.data.error || "Failed to fetch pending manuscripts"
          );
        }
      } catch (err) {
        console.error("Failed to fetch pending review manuscripts:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch manuscripts"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl]
  );

  return {
    isLoading,
    error,
    getAuthorManuscripts,
    getManuscriptsByStatus,
    getPendingReviewManuscripts,
  };
}
