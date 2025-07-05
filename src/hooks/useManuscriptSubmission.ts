import { useState, useCallback } from "react";

import { ManuscriptSubmissionRequest } from "@/types/backend";
import axios from "axios";

interface ManuscriptSubmissionProps {
  submitManuscriptSubsidized: any;
  checkCVRegistration: (walletAddress: string) => Promise<boolean>;
}

export function useManuscriptSubmission({
  submitManuscriptSubsidized,
  checkCVRegistration,
}: ManuscriptSubmissionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitManuscript = useCallback(
    async (
      manuscriptData: any,
      file: File,
      walletAddress: string,
      apiUrl: string,
      onSuccess?: () => void
    ) => {
      try {
        setLoading(true);
        setError(null);

        // Final CV check before submission
        const cvVerified = await checkCVRegistration(walletAddress);
        if (!cvVerified) {
          const errorMsg =
            "CV verification failed. Please ensure your CV is registered.";
          setError(errorMsg);
          alert(errorMsg);
          return;
        }

        // Prepare submission data
        const submissionData: ManuscriptSubmissionRequest = {
          manuscript: file,
          title: manuscriptData.title,
          author: manuscriptData.authors[0]?.name || "Unknown Author",
          category: manuscriptData.categories.join(","),
          abstract: manuscriptData.abstract,
          keywords: manuscriptData.keywords.join(","),
          authorWallet: walletAddress,
        };

        // Submit to backend
        const result = await axios.post(
          `${apiUrl}/submit-manuscript/submit-manuscript`,
          submissionData
        );

        if (result.data.success) {
          console.log("✅ Manuscript submitted successfully:", result);

          // Call success callback if provided
          if (onSuccess) {
            onSuccess();
          }

          // Show success message
          alert(`Manuscript submitted successfully! 
        
Manuscript ID: ${result.data.manuscript.id}
Status: ${result.data.manuscript.status}
IPFS Hash: ${result.data.manuscript.cid}

Your manuscript is now under peer review. You will be notified when the review process is complete.`);
        } else {
          console.error("❌ Manuscript submission failed:", result);
          const errorMsg = "Submission failed: Unknown error";
          setError(errorMsg);
          alert(errorMsg);
        }
      } catch (error: any) {
        console.error("Failed to submit manuscript:", error);

        let errorMessage =
          "Network error while submitting manuscript. Please try again.";

        // Handle specific backend errors
        if (error.response?.data?.error === "CV registration required") {
          errorMessage =
            "CV registration required. Please upload your CV first.";
        } else if (error.response?.data?.error === "Missing wallet address") {
          errorMessage =
            "Please provide your wallet address to submit manuscripts.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        alert(errorMessage);
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
