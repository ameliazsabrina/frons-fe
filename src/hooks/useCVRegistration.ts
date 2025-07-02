import { useState, useCallback } from "react";

interface CVStatus {
  hasCV: boolean;
  canSubmitManuscripts: boolean;
  userInfo?: {
    fullName: string;
    institution: string;
    profession: string;
    registeredAt: string;
  };
}

export function useCVRegistration() {
  const [cvStatus, setCvStatus] = useState<CVStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const checkCVRegistration = useCallback(
    async (walletAddress: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${apiUrl}/api/manuscripts/check-cv-status/${walletAddress}`
        );
        const result = await response.json();

        if (result.success) {
          setCvStatus({
            hasCV: result.hasCV,
            canSubmitManuscripts: result.canSubmitManuscripts,
            userInfo: result.userInfo,
          });
          return result.canSubmitManuscripts;
        } else {
          setError(result.message || "Failed to check CV status");
          return false;
        }
      } catch (err) {
        console.error("Failed to check CV registration:", err);
        setError("Network error while checking CV status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  return {
    cvStatus,
    loading,
    error,
    checkCVRegistration,
  };
}
