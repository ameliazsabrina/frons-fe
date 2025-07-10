import { useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";

interface UseManuscriptSubmissionProps {
  checkCVRegistration?: (walletAddress: string) => Promise<boolean>;
}

interface SubmissionResponse {
  success: boolean;
  manuscript: {
    id: string;
    cid: string;
    title: string;
    author: string;
    category: string;
    filename: string;
    size: number;
    type: string;
    uploadedAt: string;
    submittedAt: string;
  };
  metadata: {
    cid: string;
    filename: string;
  };
  ipfsUrls: {
    manuscript: string;
    metadata: string;
  };
  review: {
    id: string;
    status: string;
    autoAssignmentAttempted: boolean;
    autoAssignmentResult: any;
  };
  smartContract: {
    ipfs_hash: string;
    metadata_cid: string;
    callData: {
      function: string;
      parameter: string;
    };
  };
  message: string;
}

export function useManuscriptSubmission({
  checkCVRegistration,
}: UseManuscriptSubmissionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authenticated, getAccessToken } = usePrivy();

  const submitManuscript = useCallback(
    async (
      file: File,
      metadata: {
        title: string;
        authors: { name: string }[];
        categories: string[];
        abstract: string;
        keywords: string[];
        walletAddress?: string; // Now optional since we use Privy auth
      },
      apiUrl: string
    ): Promise<SubmissionResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated with Privy
        if (!authenticated) {
          setError("Please authenticate to submit a manuscript.");
          return null;
        }

        // Get authentication token
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setError("Failed to get authentication token. Please login again.");
          return null;
        }

        // For legacy support, still check CV registration if function provided
        if (checkCVRegistration && metadata.walletAddress) {
          const cvVerified = await checkCVRegistration(metadata.walletAddress);
          if (!cvVerified) {
            const errorMsg =
              "CV verification failed. Please ensure your CV is registered.";
            setError(errorMsg);
            return null;
          }
        }

        // Create FormData with all required fields
        const formData = new FormData();
        formData.append("manuscript", file);
        formData.append("title", metadata.title);
        formData.append(
          "author",
          metadata.authors[0]?.name || "Unknown Author"
        );
        formData.append("category", metadata.categories.join(","));
        formData.append("abstract", metadata.abstract || "");
        formData.append("keywords", metadata.keywords.join(","));

        // Optional wallet address for backward compatibility
        if (metadata.walletAddress) {
          formData.append("authorWallet", metadata.walletAddress);
        }

        // Optional flags for auto-assignment
        formData.append("autoAssign", "true");
        formData.append("aiAutoAssign", "true");

        // Use Privy-enabled endpoint with authentication
        const result = await axios.post<SubmissionResponse>(
          `${apiUrl}/manuscripts/submit/privy`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${accessToken}`,
            },
          }
        );

        if (result.data.success) {
          return result.data;
        }

        console.error("Submission error:", result.data);
        setError("Submission failed");
        return null;
      } catch (error: any) {
        console.error("Submission error:", error.response?.data || error);
        const errorData = error.response?.data;
        let errorMessage = "Failed to submit manuscript";

        if (errorData?.code === "CV_REQUIRED") {
          errorMessage = errorData.message || "CV registration required";
        } else if (errorData?.code === "ACADEMIC_PERMISSIONS_REQUIRED") {
          errorMessage = "Academic credentials required for manuscript submission";
        } else if (errorData?.code === "INVALID_TOKEN") {
          errorMessage = "Authentication expired. Please login again.";
        } else if (errorData?.code === "MISSING_WALLET") {
          errorMessage = errorData.message || "Wallet address required";
        } else if (errorData?.code === "PINATA_ERROR") {
          errorMessage = "IPFS upload failed. Please try again.";
        } else if (errorData?.code === "NETWORK_ERROR") {
          errorMessage =
            "Network connection failed. Please check your connection.";
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [authenticated, getAccessToken, checkCVRegistration]
  );

  return {
    loading,
    error,
    submitManuscript,
  };
}
