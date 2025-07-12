import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import axios from "axios";

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
}

interface UserEducation {
  degree: string;
  institution: string;
  field: string;
  year?: number;
}

interface UserProfile {
  personalInfo?: {
    education?: string;
    academicEmail?: string;
    institution?: string;
  };
  contact?: {
    email?: string;
  };
  summary?: {
    publications?: number;
  };
  cvVerified?: boolean;
  education?: UserEducation[];
}

export function useReviewerEligibility(currentPublicationsCount?: number) {
  const [eligibilityResult, setEligibilityResult] =
    useState<ReviewerEligibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authenticated, getAccessToken } = usePrivy();
  const { wallets } = useSolanaWallets();
  const walletAddress = wallets[0]?.address;

  const checkEducationalLevel = (
    education: string,
    educationHistory?: UserEducation[]
  ): boolean => {
    const validLevels = ["PhD", "Master", "Bachelor", "Doctorate"];

    if (validLevels.includes(education)) {
      return true;
    }

    if (educationHistory && educationHistory.length > 0) {
      const degreeKeywords = [
        "bachelor",
        "bs",
        "ba",
        "bsc",
        "b.s",
        "b.a",
        "master",
        "ms",
        "ma",
        "msc",
        "m.s",
        "m.a",
        "mba",
        "phd",
        "ph.d",
        "doctorate",
        "doctoral",
      ];

      return educationHistory.some((edu) => {
        const degree = (edu.degree || "").toLowerCase();
        return degreeKeywords.some((keyword) => degree.includes(keyword));
      });
    }

    return false;
  };

  const checkAcademicEmail = (email: string): boolean => {
    const academicDomains = [".edu", ".ac.uk", ".ac.in", ".edu.au", ".ac.jp"];
    return academicDomains.some((domain) => email.endsWith(domain));
  };

  const checkReviewerEligibility =
    useCallback(async (): Promise<ReviewerEligibilityResult | null> => {
      if (!authenticated || !walletAddress) {
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const accessToken = await getAccessToken();
        const apiUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

        let profile: UserProfile = {};
        try {
          const profileResponse = await axios.get(
            `${apiUrl}/cv/user/profile/${walletAddress}`
          );
          console.log("Profile response:", profileResponse.data);

          if (profileResponse.data.success) {
            profile = profileResponse.data.profile;
          }
        } catch (profileError) {
          console.warn("Could not fetch profile:", profileError);
        }

        const hasMinimumEducation = checkEducationalLevel(
          profile.personalInfo?.education || "",
          profile.education
        );

        const publishedPapers =
          currentPublicationsCount !== undefined
            ? currentPublicationsCount
            : profile.summary?.publications || 0;
        const requiredPapers = 3;
        const hasMinimumPublications = publishedPapers >= requiredPapers;

        const isEligible = hasMinimumEducation && hasMinimumPublications;

        const issues: string[] = [];
        const benefits: string[] = [];

        if (!hasMinimumEducation) {
          issues.push(
            "Minimum education requirement not met (Bachelor's degree or higher required)"
          );
        } else {
          benefits.push("✓ Education requirement satisfied");
        }

        if (!hasMinimumPublications) {
          const remaining = requiredPapers - publishedPapers;
          issues.push(
            `${remaining} more publication${
              remaining > 1 ? "s" : ""
            } needed (${publishedPapers}/${requiredPapers} required for reviewer eligibility)`
          );
        } else {
          benefits.push(
            `✓ Publication requirement met (${publishedPapers} publications recorded)`
          );
        }

        if (isEligible) {
          benefits.push("🎉 You are eligible to serve as a reviewer!");
          benefits.push(
            "📚 You can review manuscripts in your field of expertise"
          );
          benefits.push("🏆 Gain recognition for your academic contributions");
        }

        return {
          isEligible,
          requirements: {
            hasMinimumEducation,
            hasMinimumPublications,
            publishedPapers,
            requiredPapers,
          },
          issues,
          benefits,
        };
      } catch (err) {
        console.error("Failed to check reviewer eligibility:", err);
        setError(
          err instanceof Error ? err.message : "Failed to check eligibility"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [
      authenticated,
      walletAddress,
      getAccessToken,
      currentPublicationsCount,
    ]);

  useEffect(() => {
    if (authenticated && walletAddress) {
      checkReviewerEligibility().then(setEligibilityResult);
    }
  }, [
    authenticated,
    walletAddress,
    checkReviewerEligibility,
    currentPublicationsCount,
  ]);

  const refreshEligibility = useCallback(async () => {
    const result = await checkReviewerEligibility();
    setEligibilityResult(result);
    return result;
  }, [checkReviewerEligibility]);

  return {
    eligibilityResult,
    isLoading,
    error,
    refreshEligibility,
    checkReviewerEligibility,
  };
}
