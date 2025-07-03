import { useState, useEffect } from "react";
import axios from "axios";

export interface ManuscriptStats {
  total: number;
  submitted: number;
  underReview: number;
  published: number;
  rejected: number;
  pendingReviews: number;
  readyForPublication: number;
}

export interface UserStats {
  manuscriptsSubmitted: number;
  manuscriptsPublished: number;
  reviewsCompleted: number;
  fronsTokens: number;
  totalEarnings: number;
  reputationScore: number;
}

export function useOverview(
  connected: boolean,
  validSolanaPublicKey: string | undefined
) {
  const [manuscriptStats, setManuscriptStats] = useState<ManuscriptStats>({
    total: 0,
    submitted: 0,
    underReview: 0,
    published: 0,
    rejected: 0,
    pendingReviews: 0,
    readyForPublication: 0,
  });
  const [userStats, setUserStats] = useState<UserStats>({
    manuscriptsSubmitted: 0,
    manuscriptsPublished: 0,
    reviewsCompleted: 0,
    fronsTokens: 0,
    totalEarnings: 0,
    reputationScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !validSolanaPublicKey) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

        const manuscriptsResponse = await axios.get(
          `${apiUrl}/api/manuscripts/stats?authorWallet=${validSolanaPublicKey}`
        );

        if (manuscriptsResponse.data.success) {
          setManuscriptStats(manuscriptsResponse.data.stats);
        }

        const userResponse = await axios.get(
          `${apiUrl}/api/users/stats?wallet=${validSolanaPublicKey}`
        );

        if (userResponse.data.success) {
          setUserStats(userResponse.data.stats);
        }

        setUserStats((prev) => ({
          ...prev,
          fronsTokens: 1250,
          totalEarnings: 45.5,
          reputationScore: 85,
        }));
      } catch (err: any) {
        console.error("Failed to fetch stats:", err);
        setError("Failed to load overview data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [connected, validSolanaPublicKey]);

  return {
    manuscriptStats,
    userStats,
    loading,
    error,
  };
}
