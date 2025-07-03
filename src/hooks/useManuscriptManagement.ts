import { useState, useCallback } from "react";
import { backendAPI } from "@/lib/api";
import {
  PendingReviewResponse,
  PublishedManuscriptsResponse,
  ReviewStatusResponse,
  PublicationRequest,
  PublicationResponse,
  ReviewAssignmentRequest,
  ReviewAssignmentResponse,
  ReviewSubmissionRequest,
  ReviewSubmissionResponse,
} from "@/types/backend";

export function useManuscriptManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get manuscripts pending review
  const getPendingReviewManuscripts = useCallback(
    async (
      limit: number = 20,
      category?: string
    ): Promise<PendingReviewResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await backendAPI.getPendingReviewManuscripts(
          limit,
          category
        );
        return result;
      } catch (err) {
        console.error("Failed to get pending review manuscripts:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get pending manuscripts"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get published manuscripts
  const getPublishedManuscripts = useCallback(
    async (
      category: string,
      limit: number = 10
    ): Promise<PublishedManuscriptsResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await backendAPI.getPublishedManuscripts(
          category,
          limit
        );
        return result;
      } catch (err) {
        console.error("Failed to get published manuscripts:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get published manuscripts"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get manuscripts by status
  const getManuscriptsByStatus = useCallback(
    async (status: string, limit: number = 20): Promise<any> => {
      try {
        setLoading(true);
        setError(null);

        const result = await backendAPI.getManuscriptsByStatus(status, limit);
        return result;
      } catch (err) {
        console.error("Failed to get manuscripts by status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to get manuscripts"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get recent manuscripts (legacy endpoint)
  const getRecentManuscripts = useCallback(
    async (
      category: string,
      limit: number = 5
    ): Promise<PublishedManuscriptsResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await backendAPI.getRecentManuscripts(category, limit);
        return result;
      } catch (err) {
        console.error("Failed to get recent manuscripts:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get recent manuscripts"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Assign reviewers to manuscript
  const assignReviewers = useCallback(
    async (
      manuscriptId: number,
      reviewers: string[],
      assignedBy: string
    ): Promise<ReviewAssignmentResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const data: ReviewAssignmentRequest = {
          reviewers,
          assignedBy,
        };

        const result = await backendAPI.assignReviewers(manuscriptId, data);
        return result;
      } catch (err) {
        console.error("Failed to assign reviewers:", err);

        if (backendAPI.isInsufficientReviewersError(err)) {
          setError("Minimum 3 reviewers required");
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to assign reviewers"
          );
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Submit review decision
  const submitReview = useCallback(
    async (
      reviewId: number,
      decision: "accept" | "reject" | "minor_revision" | "major_revision",
      comments: string,
      reviewerWallet: string,
      confidentialComments?: string
    ): Promise<ReviewSubmissionResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const data: ReviewSubmissionRequest = {
          decision,
          comments,
          reviewerWallet,
          confidentialComments,
        };

        const result = await backendAPI.submitReview(reviewId, data);
        return result;
      } catch (err) {
        console.error("Failed to submit review:", err);

        if (backendAPI.isInvalidDecisionError(err)) {
          setError(
            "Valid decision required: accept, reject, minor_revision, major_revision"
          );
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to submit review"
          );
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get review status for manuscript
  const getReviewStatus = useCallback(
    async (manuscriptId: number): Promise<ReviewStatusResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await backendAPI.getReviewStatus(manuscriptId);
        return result;
      } catch (err) {
        console.error("Failed to get review status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to get review status"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Publish manuscript
  const publishManuscript = useCallback(
    async (
      manuscriptId: number,
      publishedBy: string
    ): Promise<PublicationResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const data: PublicationRequest = {
          publishedBy,
        };

        const result = await backendAPI.publishManuscript(manuscriptId, data);
        return result;
      } catch (err) {
        console.error("Failed to publish manuscript:", err);

        if (backendAPI.isPublicationNotReadyError(err)) {
          setError(
            "Manuscript not ready for publication - insufficient approved reviews"
          );
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to publish manuscript"
          );
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    getPendingReviewManuscripts,
    getPublishedManuscripts,
    getManuscriptsByStatus,
    getRecentManuscripts,
    assignReviewers,
    submitReview,
    getReviewStatus,
    publishManuscript,
  };
}
