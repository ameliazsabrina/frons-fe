import { useState, useCallback } from "react";

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

        // Create form data for submission
        const formData = new FormData();
        formData.append("manuscript", file);
        formData.append("title", manuscriptData.title);
        formData.append(
          "author",
          manuscriptData.authors[0]?.name || "Unknown Author"
        );
        formData.append("category", manuscriptData.categories.join(","));
        formData.append("abstract", manuscriptData.abstract);
        formData.append("keywords", manuscriptData.keywords.join(","));
        formData.append("authorWallet", walletAddress);

        // Submit to backend
        const response = await fetch(`${apiUrl}/api/manuscripts/submit`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

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

          if (result.code === "CV_REQUIRED") {
            alert("CV registration required. Please upload your CV first.");
          } else {
            alert(`Submission failed: ${result.message || "Unknown error"}`);
          }
        }
      } catch (error) {
        console.error("Failed to submit manuscript:", error);
        alert("Network error while submitting manuscript. Please try again.");
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
