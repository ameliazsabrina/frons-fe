"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

import {
  BookOpenIcon,
  CalendarIcon,
  ExternalLinkIcon,
  SaveIcon,
  SendIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import axios from "axios";
import { useLoading } from "@/context/LoadingContext";

interface ReviewData {
  id: string;
  manuscriptId: string;
  manuscript: {
    id: string;
    title: string;
    author: string;
    abstract: string;
    category: string[];
    keywords: string[];
    submissionDate: string;
    cid: string;
    ipfsUrls: {
      manuscript: string;
      metadata?: string;
    };
  };
  assignedDate: string;
  deadline: string;
  status: string;
  existingComments?: string;
  existingConfidentialComments?: string;
  existingDecision?: string;
}

type ReviewDecision = "accept" | "reject" | "minor_revision" | "major_revision";

export default function SubmitReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.reviewId as string;
  const { authenticated: connected, user } = usePrivy();
  const { wallets } = useWallets();
  const publicKey = wallets[0]?.address;
  const { showToast } = useToast();
  const { isLoading } = useLoading();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [decision, setDecision] = useState<ReviewDecision | "">("");
  const [comments, setComments] = useState("");
  const [confidentialComments, setConfidentialComments] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    if (connected && publicKey && reviewId) {
      fetchReviewData();
    }
  }, [connected, publicKey, reviewId]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${apiUrl}/api/reviews/${reviewId}`);

        if (response.data.success) {
          console.log("Successfully fetched review data:", response.data);
          const review = response.data.review;
          setReviewData({
            id: review.id?.toString(),
            manuscriptId: review.manuscript_id?.toString(),
            manuscript: {
              id: review.manuscript?.id?.toString(),
              title: review.manuscript?.title || "Untitled",
              author: review.manuscript?.author || "Unknown Author",
              abstract: review.manuscript?.abstract || "No abstract available",
              category: Array.isArray(review.manuscript?.category)
                ? review.manuscript.category
                : review.manuscript?.category?.split(",") || [],
              keywords: review.manuscript?.keywords || [],
              submissionDate:
                review.manuscript?.submissionDate || new Date().toISOString(),
              cid: review.manuscript?.ipfs_hash || review.manuscript?.cid,
              ipfsUrls: {
                manuscript: review.manuscript?.ipfs_hash
                  ? `https://ipfs.io/ipfs/${review.manuscript.ipfs_hash}`
                  : `https://ipfs.io/ipfs/${review.manuscript?.cid}`,
                metadata: review.manuscript?.metadata_cid
                  ? `https://ipfs.io/ipfs/${review.manuscript.metadata_cid}`
                  : undefined,
              },
            },
            assignedDate: review.assigned_date || review.created_at,
            deadline:
              review.deadline ||
              new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: review.status || "pending",
            existingComments: review.comments || "",
            existingConfidentialComments: review.confidential_comments || "",
            existingDecision: review.decision || "",
          });

          if (review.comments) setComments(review.comments);
          if (review.confidential_comments)
            setConfidentialComments(review.confidential_comments);
          if (review.decision) setDecision(review.decision);
          if (review.recommendation) setRecommendation(review.recommendation);

          showToast("Review data loaded successfully", "success");
          return;
        }
      } catch (directReviewError: any) {
        console.log(
          "Direct review endpoint failed, trying alternative approach:",
          directReviewError.response?.status
        );

        // If direct review endpoint fails with 404, try using reviewId as manuscriptId
        if (directReviewError.response?.status === 404) {
          console.log("Attempting to fetch by manuscript ID instead...");

          try {
            const manuscriptResponse = await axios.get(
              `${apiUrl}/api/reviews/manuscript/${reviewId}`
            );

            if (manuscriptResponse.data.success) {
              console.log(
                "Successfully fetched by manuscript ID:",
                manuscriptResponse.data
              );
              const review = manuscriptResponse.data.review;

              setReviewData({
                id: review.id?.toString() || reviewId,
                manuscriptId: reviewId,
                manuscript: {
                  id: reviewId,
                  title:
                    review.manuscript?.title ||
                    manuscriptResponse.data.manuscript?.title ||
                    "Untitled",
                  author:
                    review.manuscript?.author ||
                    manuscriptResponse.data.manuscript?.author ||
                    "Unknown Author",
                  abstract:
                    review.manuscript?.abstract ||
                    manuscriptResponse.data.manuscript?.abstract ||
                    "No abstract available",
                  category: Array.isArray(review.manuscript?.category)
                    ? review.manuscript.category
                    : review.manuscript?.category?.split(",") || [],
                  keywords:
                    review.manuscript?.keywords ||
                    manuscriptResponse.data.manuscript?.keywords ||
                    [],
                  submissionDate:
                    review.manuscript?.submissionDate ||
                    manuscriptResponse.data.manuscript?.submissionDate ||
                    new Date().toISOString(),
                  cid:
                    review.manuscript?.ipfs_hash ||
                    review.manuscript?.cid ||
                    manuscriptResponse.data.manuscript?.cid,
                  ipfsUrls: {
                    manuscript: review.manuscript?.ipfs_hash
                      ? `https://ipfs.io/ipfs/${review.manuscript.ipfs_hash}`
                      : `https://ipfs.io/ipfs/${
                          review.manuscript?.cid ||
                          manuscriptResponse.data.manuscript?.cid
                        }`,
                    metadata: review.manuscript?.metadata_cid
                      ? `https://ipfs.io/ipfs/${review.manuscript.metadata_cid}`
                      : undefined,
                  },
                },
                assignedDate:
                  review.assigned_date ||
                  review.created_at ||
                  new Date().toISOString(),
                deadline:
                  review.deadline ||
                  new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                status: review.status || "pending",
                existingComments: review.comments || "",
                existingConfidentialComments:
                  review.confidential_comments || "",
                existingDecision: review.decision || "",
              });

              if (review.comments) setComments(review.comments);
              if (review.confidential_comments)
                setConfidentialComments(review.confidential_comments);
              if (review.decision) setDecision(review.decision);
              if (review.recommendation)
                setRecommendation(review.recommendation);

              showToast("Review data loaded successfully", "success");
              return;
            }
          } catch (manuscriptError: any) {
            console.log(
              "Manuscript endpoint also failed:",
              manuscriptError.response?.status
            );
          }
        }

        // If both approaches fail, throw the original error
        throw directReviewError;
      }

      setError("Failed to fetch review data from any available endpoint");
      showToast("Failed to fetch review data", "error");
    } catch (err: any) {
      console.error("Review fetch error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      let errorMessage = "Failed to fetch review data: ";
      if (err.response?.status === 404) {
        errorMessage =
          "Review not found. This may be because the review hasn't been created yet or the review ID is invalid.";
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    try {
      setSaving(true);
      setError(null);

      const draftData = {
        comments,
        confidentialComments,
        decision: decision || null,
        recommendation,
        status: "draft",
        reviewerWallet: publicKey?.toString(),
      };

      const response = await axios.patch(
        `${apiUrl}/api/reviews/${reviewId}/save-draft`,
        draftData
      );

      if (response.data.success) {
        setSuccess("Draft saved successfully!");
        showToast("Draft saved successfully!", "success");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorMsg = response.data.error || "Failed to save draft";
        setError(errorMsg);
        showToast(errorMsg, "error");
      }
    } catch (err: any) {
      console.error("Save draft error:", err);
      const errorMsg =
        "Failed to save draft: " + (err.response?.data?.error || err.message);
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const submitReview = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!decision) {
        setError("Please select a review decision before submitting.");
        return;
      }

      if (!comments.trim()) {
        setError("Please provide comments for the authors.");
        return;
      }

      const reviewData = {
        decision,
        comments: comments.trim(),
        confidentialComments: confidentialComments.trim(),
        recommendation: recommendation.trim(),
        reviewerWallet: publicKey?.toString(),
      };

      const response = await axios.post(
        `${apiUrl}/api/reviews/${reviewId}/submit-review`,
        reviewData
      );

      if (response.data.success) {
        setSuccess("Review submitted successfully!");
        showToast("Review submitted successfully!", "success");

        setTimeout(() => {
          router.push("/reviewer-dashboard");
        }, 2000);
      } else {
        setError(response.data.error || "Failed to submit review");
        showToast(response.data.error || "Failed to submit review", "error");
      }
    } catch (err: any) {
      console.error("Submit review error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      let errorMessage = "Failed to submit review: ";
      if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
        if (err.response.data.details) {
          errorMessage += ` (${err.response.data.details})`;
        }
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "accept":
        return "bg-green-100 text-green-800 border-green-200";
      case "reject":
        return "bg-red-100 text-red-800 border-red-200";
      case "minor_revision":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "major_revision":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDecisionDescription = (decision: string) => {
    switch (decision) {
      case "accept":
        return "The manuscript is ready for publication as is.";
      case "reject":
        return "The manuscript is not suitable for publication in this venue.";
      case "minor_revision":
        return "The manuscript needs minor changes before publication.";
      case "major_revision":
        return "The manuscript requires significant revisions before reconsideration.";
      default:
        return "";
    }
  };

  if (!connected) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-white flex w-full">
          <OverviewSidebar connected={connected} />
          <div className="flex-1">
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Wallet Not Connected
                </h1>
                <p className="text-gray-600 mb-4">
                  Please connect your wallet to submit a review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-white flex w-full">
          <OverviewSidebar connected={connected} />
          <div className="flex-1">
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading review data...</p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error && !reviewData) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-white flex w-full">
          <OverviewSidebar connected={connected} />
          <div className="flex-1">
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <div className="text-center">
                <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Error Loading Review
                </h1>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => router.push("/reviewer-dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!reviewData) return null;

  const daysLeft = getDaysUntilDeadline(reviewData.deadline);
  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft <= 3 && daysLeft >= 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white flex w-full">
        <OverviewSidebar connected={connected} />

        <div className="flex-1">
          <div className="flex flex-col min-h-screen">
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Submit Review
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight text-center">
                  Submit Review
                </h1>
                <p className="text-primary/80 text-sm sm:text-md text-center">
                  Provide your expert review for this manuscript submission
                </p>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-green-50/50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  <p className="text-green-700">{success}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50/50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircleIcon className="h-5 w-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {(isOverdue || isUrgent) && (
                <div
                  className={`mb-6 p-4 rounded-lg border ${
                    isOverdue
                      ? "bg-red-50/50 border-red-200"
                      : "bg-orange-50/50 border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircleIcon
                      className={`h-5 w-5 ${
                        isOverdue ? "text-red-600" : "text-orange-600"
                      }`}
                    />
                    <p
                      className={`font-medium ${
                        isOverdue ? "text-red-700" : "text-orange-700"
                      }`}
                    >
                      {isOverdue
                        ? `This review is ${Math.abs(daysLeft)} days overdue!`
                        : `Review deadline is in ${daysLeft} ${
                            daysLeft === 1 ? "day" : "days"
                          }`}
                    </p>
                  </div>
                </div>
              )}

              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-primary">
                    <BookOpenIcon className="h-5 w-5" />
                    Manuscript Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {reviewData.manuscript.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Author:</strong> {reviewData.manuscript.author}
                    </p>
                    <p className="text-gray-700 mb-4">
                      {reviewData.manuscript.abstract}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {reviewData.manuscript.category.map((cat, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {reviewData.manuscript.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          Submitted:{" "}
                          {formatDate(reviewData.manuscript.submissionDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          Review Due: {formatDate(reviewData.deadline)}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(
                            reviewData.manuscript.ipfsUrls.manuscript,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-2 text-sm"
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                        View Manuscript
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 mb-8">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">
                    Your Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <Label htmlFor="decision" className="text-base font-medium">
                      Review Decision *
                    </Label>
                    <p className="text-sm text-gray-600 mt-1 mb-4">
                      Select your recommendation for this manuscript:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDecision("accept")}
                        className={`h-auto p-4 flex flex-col items-start text-left transition-all duration-200 ${
                          decision === "accept"
                            ? "border-green-500 bg-green-50/30 text-green-700 hover:bg-green-100/30"
                            : "border-green-300 bg-transparent text-green-600 hover:bg-green-50/20"
                        }`}
                      >
                        <span className="font-semibold text-sm">Accept</span>
                        <span className="text-xs mt-1 opacity-80">
                          Ready for publication as is
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDecision("minor_revision")}
                        className={`h-auto p-4 flex flex-col items-start text-left transition-all duration-200 ${
                          decision === "minor_revision"
                            ? "border-yellow-500 bg-yellow-50/30 text-yellow-700 hover:bg-yellow-100/30"
                            : "border-yellow-300 bg-transparent text-yellow-600 hover:bg-yellow-50/20"
                        }`}
                      >
                        <span className="font-semibold text-sm">
                          Minor Revision
                        </span>
                        <span className="text-xs mt-1 opacity-80">
                          Small changes needed
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDecision("major_revision")}
                        className={`h-auto p-4 flex flex-col items-start text-left transition-all duration-200 ${
                          decision === "major_revision"
                            ? "border-orange-500 bg-orange-50/30 text-orange-700 hover:bg-orange-100/30"
                            : "border-orange-300 bg-transparent text-orange-600 hover:bg-orange-50/20"
                        }`}
                      >
                        <span className="font-semibold text-sm">
                          Major Revision
                        </span>
                        <span className="text-xs mt-1 opacity-80">
                          Significant changes required
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDecision("reject")}
                        className={`h-auto p-4 flex flex-col items-start text-left transition-all duration-200 ${
                          decision === "reject"
                            ? "border-red-500 bg-red-50/30 text-red-700 hover:bg-red-100/30"
                            : "border-red-300 bg-transparent text-red-600 hover:bg-red-50/20"
                        }`}
                      >
                        <span className="font-semibold text-sm">Reject</span>
                        <span className="text-xs mt-1 opacity-80">
                          Not suitable for publication
                        </span>
                      </Button>
                    </div>

                    {decision && (
                      <div
                        className={`p-3 rounded-lg border ${getDecisionColor(
                          decision
                        )}`}
                      >
                        <p className="text-sm font-medium">
                          {getDecisionDescription(decision)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="comments" className="text-base font-medium">
                      Comments for Authors *
                    </Label>
                    <p className="text-sm text-gray-600">
                      Provide constructive feedback that will be shared with the
                      authors.
                    </p>
                    <Textarea
                      id="comments"
                      value={comments}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setComments(e.target.value)
                      }
                      placeholder="Enter your detailed comments and suggestions for the authors..."
                      className="min-h-[120px]"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      {comments.length} characters
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="confidentialComments"
                      className="text-base font-medium"
                    >
                      Confidential Comments for Editors
                    </Label>
                    <p className="text-sm text-gray-600">
                      Private comments that will only be visible to editors
                      (optional).
                    </p>
                    <Textarea
                      id="confidentialComments"
                      value={confidentialComments}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setConfidentialComments(e.target.value)
                      }
                      placeholder="Enter any confidential comments for the editorial team..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="recommendation"
                      className="text-base font-medium"
                    >
                      Additional Recommendations
                    </Label>
                    <p className="text-sm text-gray-600">
                      Any additional suggestions for improving the manuscript
                      (optional).
                    </p>
                    <Textarea
                      id="recommendation"
                      value={recommendation}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setRecommendation(e.target.value)
                      }
                      placeholder="Enter any additional recommendations..."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push("/reviewer-dashboard")}
                  className="text-sm"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={saveDraft}
                    disabled={saving}
                    className="flex items-center gap-2 text-sm"
                  >
                    <SaveIcon className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Draft"}
                  </Button>

                  <Button
                    onClick={submitReview}
                    disabled={submitting || !decision || !comments.trim()}
                    className="flex items-center gap-2 text-sm"
                  >
                    <SendIcon className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50/30 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> All fields marked with * are required.
                  Your review will help maintain the quality and integrity of
                  academic publications in the Fronsciers platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
