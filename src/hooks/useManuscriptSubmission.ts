import { useState, useCallback } from "react";
import { isValidSolanaAddress } from "./useProgram";
import axios from "axios";

interface UseManuscriptSubmissionProps {
  checkCVRegistration: (walletAddress: string) => Promise<boolean>;
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

  const submitManuscript = useCallback(
    async (
      file: File,
      metadata: {
        title: string;
        authors: { name: string }[];
        categories: string[];
        abstract: string;
        keywords: string[];
        walletAddress: string;
      },
      apiUrl: string
    ): Promise<SubmissionResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        // Verify CV registration first
        const cvVerified = await checkCVRegistration(metadata.walletAddress);
        if (!cvVerified) {
          const errorMsg =
            "CV verification failed. Please ensure your CV is registered.";
          setError(errorMsg);
          return null;
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
        formData.append("authorWallet", metadata.walletAddress);

        // Optional flags for auto-assignment
        formData.append("autoAssign", "true");
        formData.append("aiAutoAssign", "true");

        const result = await axios.post<SubmissionResponse>(
          `${apiUrl}/manuscripts/submit`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
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
    [checkCVRegistration]
  );

  return {
    loading,
    error,
    submitManuscript,
  };
}
