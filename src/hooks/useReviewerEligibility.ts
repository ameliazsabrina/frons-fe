import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import axios from "axios";

// Backend API response interfaces
interface BackendReviewerQualification {
  qualified: boolean;
  reasons: {
    educationLevel: string;
    hasMinimumEducation: boolean;
    publicationCount: number;
    hasMinimumPublications: boolean;
    academicEmail: boolean;
    cvUploaded: boolean;
  };
  qualificationScore: number;
  requirements: {
    minimumEducation: string;
    minimumPublications: number;
  };
  details: string[];
}

// Frontend interface for compatibility
interface ReviewerEligibilityResult {
  isEligible: boolean;
  requirements: {
    hasMinimumEducation: boolean;
    hasMinimumPublications: boolean;
    publishedPapers: number;
    requiredPapers: number;
  };
  issues: string[];
  benefits: string[];
  qualificationScore?: number;
}

export function useReviewerEligibility(manuscriptId?: string) {
  const [eligibilityResult, setEligibilityResult] =
    useState<ReviewerEligibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authenticated, getAccessToken } = usePrivy();
  const { wallets } = useSolanaWallets();
  const walletAddress = wallets[0]?.address;

  // Convert backend response to frontend format
  const convertBackendResponse = (
    backendData: BackendReviewerQualification
  ): ReviewerEligibilityResult => {
    const issues: string[] = [];
    const benefits: string[] = [];

    // Process education requirement
    if (!backendData.reasons.hasMinimumEducation) {
      issues.push(
        `Minimum education requirement not met (${backendData.requirements.minimumEducation} or higher required)`
      );
    } else {
      benefits.push(`✓ Education requirement satisfied (${backendData.reasons.educationLevel})`);
    }

    // Process publication requirement
    if (!backendData.reasons.hasMinimumPublications) {
      const remaining = backendData.requirements.minimumPublications - backendData.reasons.publicationCount;
      issues.push(
        `${remaining} more publication${
          remaining > 1 ? "s" : ""
        } needed (${backendData.reasons.publicationCount}/${backendData.requirements.minimumPublications} required for reviewer eligibility)`
      );
    } else {
      benefits.push(
        `✓ Publication requirement met (${backendData.reasons.publicationCount} publications recorded)`
      );
    }

    // Process CV requirement
    if (!backendData.reasons.cvUploaded) {
      issues.push("CV upload required for reviewer eligibility");
    } else {
      benefits.push("✓ CV uploaded and verified");
    }

    // Add success messages if eligible
    if (backendData.qualified) {
      benefits.push("🎉 You are eligible to serve as a reviewer!");
      benefits.push("📚 You can review manuscripts in your field of expertise");
      benefits.push("🏆 Gain recognition for your academic contributions");
    }

    // Add backend details
    if (backendData.details && backendData.details.length > 0) {
      backendData.details.forEach(detail => {
        if (detail.startsWith("✓") || detail.includes("satisfied") || detail.includes("met")) {
          benefits.push(detail);
        } else {
          issues.push(detail);
        }
      });
    }

    return {
      isEligible: backendData.qualified,
      requirements: {
        hasMinimumEducation: backendData.reasons.hasMinimumEducation,
        hasMinimumPublications: backendData.reasons.hasMinimumPublications,
        publishedPapers: backendData.reasons.publicationCount,
        requiredPapers: backendData.requirements.minimumPublications,
      },
      issues,
      benefits,
      qualificationScore: backendData.qualificationScore,
    };
  };

  const checkReviewerEligibility = useCallback(async (): Promise<ReviewerEligibilityResult | null> => {
    if (!authenticated || !walletAddress) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";
      
      // Use the backend reviewer qualification endpoint
      const response = await axios.get(
        `${apiUrl}/reviews/reviewer/${walletAddress}/qualification`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Backend reviewer qualification response:", response.data);

      if (response.data.success && response.data.qualification) {
        const backendData = response.data.qualification as BackendReviewerQualification;
        return convertBackendResponse(backendData);
      } else {
        throw new Error(response.data.message || "Failed to get qualification data");
      }
    } catch (err) {
      console.error("Failed to check reviewer eligibility:", err);
      
      // Handle API errors gracefully
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("User profile not found. Please upload your CV first.");
        } else if (err.response?.status === 401) {
          setError("Authentication required");
        } else {
          setError(err.response?.data?.message || "Failed to check eligibility");
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to check eligibility");
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, walletAddress]);

  // Check manuscript-specific eligibility if manuscriptId is provided
  const checkManuscriptEligibility = useCallback(async (
    manuscriptIdToCheck: string
  ): Promise<ReviewerEligibilityResult | null> => {
    if (!authenticated || !walletAddress) {
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";
      
      // Use the manuscript-specific eligibility endpoint
      const response = await axios.get(
        `${apiUrl}/reviews/reviewer/${walletAddress}/can-review/${manuscriptIdToCheck}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Manuscript-specific eligibility response:", response.data);

      if (response.data.success && response.data.qualification) {
        const backendData = response.data.qualification as BackendReviewerQualification;
        return convertBackendResponse(backendData);
      } else {
        throw new Error(response.data.message || "Failed to check manuscript eligibility");
      }
    } catch (err) {
      console.error("Failed to check manuscript eligibility:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Manuscript not found or user profile not found");
        } else {
          setError(err.response?.data?.message || "Failed to check manuscript eligibility");
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to check manuscript eligibility");
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, walletAddress]);

  // Auto-check eligibility when component mounts or dependencies change
  useEffect(() => {
    if (authenticated && walletAddress) {
      if (manuscriptId) {
        // Check manuscript-specific eligibility
        checkManuscriptEligibility(manuscriptId).then(setEligibilityResult);
      } else {
        // Check general eligibility
        checkReviewerEligibility().then(setEligibilityResult);
      }
    } else {
      // Clear results when not authenticated
      setEligibilityResult(null);
      setError(null);
    }
  }, [authenticated, walletAddress, manuscriptId, checkReviewerEligibility, checkManuscriptEligibility]);

  const refreshEligibility = useCallback(async () => {
    let result: ReviewerEligibilityResult | null;
    
    if (manuscriptId) {
      result = await checkManuscriptEligibility(manuscriptId);
    } else {
      result = await checkReviewerEligibility();
    }
    
    setEligibilityResult(result);
    return result;
  }, [manuscriptId, checkManuscriptEligibility, checkReviewerEligibility]);

  return {
    eligibilityResult,
    isLoading,
    error,
    refreshEligibility,
    checkReviewerEligibility,
    checkManuscriptEligibility,
  };
}