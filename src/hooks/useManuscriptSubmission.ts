import { useState, useCallback } from "react";
import { backendAPI } from "@/lib/api";
import {
  ManuscriptSubmissionRequest,
  ManuscriptSubmissionResponse,
} from "@/types/backend";

interface ManuscriptSubmissionProps {
  submitManuscriptSubsidized: any;
  checkCVRegistration: (walletAddress: string) => Promise<boolean>;
}

export function useManuscriptSubmission({
  submitManuscriptSubsidized,
  checkCVRegistration,
}: ManuscriptSubmissionProps) {
  const [loading, setLoading] = useState(false);

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

        // Final CV check before submission
        const cvVerified = await checkCVRegistration(walletAddress);
        if (!cvVerified) {
          alert("CV verification failed. Please ensure your CV is registered.");
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
        const result = await backendAPI.submitManuscript(submissionData);

        if (result.success) {
          console.log("✅ Manuscript submitted successfully:", result);

          // Call success callback if provided
          if (onSuccess) {
            onSuccess();
          }

          // Show success message
          alert(`Manuscript submitted successfully! 
        
Manuscript ID: ${result.manuscript.id}
Status: ${result.manuscript.status}
IPFS Hash: ${result.manuscript.cid}

Your manuscript is now under peer review. You will be notified when the review process is complete.`);
        } else {
          console.error("❌ Manuscript submission failed:", result);
          alert(`Submission failed: Unknown error`);
        }
      } catch (error) {
        console.error("Failed to submit manuscript:", error);

        // Handle specific backend errors
        if (backendAPI.isCVRequiredError(error)) {
          alert("CV registration required. Please upload your CV first.");
        } else if (backendAPI.isMissingWalletError(error)) {
          alert("Please provide your wallet address to submit manuscripts.");
        } else {
          alert("Network error while submitting manuscript. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [checkCVRegistration]
  );

  return {
    loading,
    submitManuscript,
  };
}
