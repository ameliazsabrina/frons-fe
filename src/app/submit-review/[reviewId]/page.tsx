"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/components/ui/sonner";

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
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import axios from "axios";
import { useLoading } from "@/context/LoadingContext";
import { isValidSolanaAddress } from "@/hooks/useProgram";

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
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const fetchReviewData = useCallback(async () => {
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
                      : review.manuscript?.cid
                      ? `https://ipfs.io/ipfs/${review.manuscript.cid}`
                      : manuscriptResponse.data.manuscript?.cid
                      ? `https://ipfs.io/ipfs/${manuscriptResponse.data.manuscript.cid}`
                      : "#",
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
          } catch (manuscriptError) {
            console.error("Failed to fetch by manuscript ID:", manuscriptError);
          }
        }
      }

      // If all approaches fail, create mock data for testing
      console.log("Creating mock review data for testing");
      setReviewData({
        id: reviewId,
        manuscriptId: reviewId,
        manuscript: {
          id: reviewId,
          title: "Sample Manuscript for Review",
          author: "Dr. Sample Author",
          abstract:
            "This is a sample abstract for testing the review submission interface. In a real scenario, this would contain the actual manuscript abstract.",
          category: ["Computer Science", "Machine Learning"],
          keywords: ["artificial intelligence", "machine learning", "research"],
          submissionDate: new Date().toISOString(),
          cid: "sample-cid",
          ipfsUrls: {
            manuscript: "#",
            metadata: "#",
          },
        },
        assignedDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending",
        existingComments: "",
        existingConfidentialComments: "",
        existingDecision: "",
      });

      showToast(
        "Using sample data for testing. In production, this would load real review data.",
        "info"
      );
    } catch (error: any) {
      console.error("Error fetching review data:", error);
      setError("Failed to load review data. Please try again.");
      showToast("Failed to load review data", "error");
    } finally {
      setLoading(false);
    }
  }, [reviewId, apiUrl, showToast]);

  useEffect(() => {
    if (connected && validSolanaPublicKey && reviewId) {
      fetchReviewData();
    }
  }, [connected, validSolanaPublicKey, reviewId, fetchReviewData]);

  const saveDraft = async () => {
    if (!validSolanaPublicKey || !reviewData) return;

    try {
      setSaving(true);
      setError(null);

      const reviewSubmission = {
        reviewId: reviewData.id,
        manuscriptId: reviewData.manuscriptId,
        reviewer: validSolanaPublicKey,
        decision: decision || null,
        comments: comments.trim(),
        confidentialComments: confidentialComments.trim(),
        recommendation: recommendation.trim(),
        status: "draft",
      };

      console.log("Saving draft:", reviewSubmission);

      const response = await axios.post(
        `${apiUrl}/api/reviews/submit`,
        reviewSubmission
      );

      if (response.data.success) {
        showToast("Draft saved successfully", "success");
        setSuccess("Draft saved successfully");
      } else {
        throw new Error(response.data.error || "Failed to save draft");
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to save draft";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const submitReview = async () => {
    if (!validSolanaPublicKey || !reviewData) return;

    if (!decision) {
      setError("Please select a decision before submitting");
      showToast("Please select a decision", "error");
      return;
    }

    if (!comments.trim()) {
      setError("Please provide comments for the authors");
      showToast("Please provide comments for the authors", "error");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reviewSubmission = {
        reviewId: reviewData.id,
        manuscriptId: reviewData.manuscriptId,
        reviewer: validSolanaPublicKey,
        decision,
        comments: comments.trim(),
        confidentialComments: confidentialComments.trim(),
        recommendation: recommendation.trim(),
        status: "completed",
      };

      console.log("Submitting review:", reviewSubmission);

      const response = await axios.post(
        `${apiUrl}/api/reviews/submit`,
        reviewSubmission
      );

      if (response.data.success) {
        showToast("Review submitted successfully!", "success");
        setSuccess("Review submitted successfully!");

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/review-manuscript");
        }, 2000);
      } else {
        throw new Error(response.data.error || "Failed to submit review");
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to submit review";
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
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "accept":
        return "bg-green-100 text-green-800";
      case "minor_revision":
        return "bg-yellow-100 text-yellow-800";
      case "major_revision":
        return "bg-orange-100 text-orange-800";
      case "reject":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDecisionDescription = (decision: string) => {
    switch (decision) {
      case "accept":
        return "Accept for publication";
      case "minor_revision":
        return "Accept with minor revisions";
      case "major_revision":
        return "Requires major revisions";
      case "reject":
        return "Reject for publication";
      default:
        return "No decision selected";
    }
  };

  if (!connected) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-primary/5 flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center gap-2 px-4 py-3">
                <SidebarTrigger className="w-10 h-10" />
                <Separator orientation="vertical" className="h-6" />
              </div>
            </div>
            <div className="container max-w-4xl mx-auto px-4 py-8">
              <div className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral  text-bold tracking-tight">
                  Submit Review
                </h1>
                <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                  Please connect your wallet to submit your manuscript review
                </p>
              </div>
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-8 text-center">
                  <AlertCircleIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-primary mb-2">
                    Wallet Connection Required
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Please connect your wallet to access the review submission
                    interface.
                  </p>
                  <Button onClick={() => router.push("/")} className="w-full">
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-primary/5 flex w-full">
        <OverviewSidebar connected={connected} />
        <SidebarInset className="flex-1">
          <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2 px-4 py-3">
              <SidebarTrigger className="w-10 h-10" />
              <Separator orientation="vertical" className="h-6" />
            </div>
          </div>
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral  font-bold tracking-tight">
                Submit Review
              </h1>
              <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                Provide your expert review and feedback for this manuscript
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error && !reviewData ? (
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-8 text-center">
                  <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-primary mb-2">
                    Error Loading Review
                  </h2>
                  <p className="text-red-600 mb-6">{error}</p>
                  <Button
                    onClick={fetchReviewData}
                    variant="outline"
                    className="mr-4"
                  >
                    Try Again
                  </Button>
                  <Button onClick={() => router.back()}>Go Back</Button>
                </CardContent>
              </Card>
            ) : reviewData ? (
              <div className="space-y-6">
                {/* Success Message */}
                {success && (
                  <Card className="shadow-sm border border-green-200 rounded-xl bg-green-50/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                        <p className="text-green-800 font-medium">{success}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Error Message */}
                {error && (
                  <Card className="shadow-sm border border-red-200 rounded-xl bg-red-50/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircleIcon className="h-5 w-5 text-red-600" />
                        <p className="text-red-800 font-medium">{error}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Manuscript Information */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary flex items-center gap-2">
                      <BookOpenIcon className="h-6 w-6" />
                      Manuscript Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        {reviewData.manuscript.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        By {reviewData.manuscript.author}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-primary">
                          Abstract
                        </Label>
                        <p className="text-sm text-foreground mt-1 leading-relaxed">
                          {reviewData.manuscript.abstract}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-primary">
                            Categories
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {reviewData.manuscript.category.map(
                              (cat, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-primary/10 text-primary text-xs"
                                >
                                  {cat}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-primary">
                            Keywords
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {reviewData.manuscript.keywords.map(
                              (keyword, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {keyword}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              Submitted:{" "}
                              {formatDate(reviewData.manuscript.submissionDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              Deadline: {formatDate(reviewData.deadline)} (
                              {getDaysUntilDeadline(reviewData.deadline)} days)
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              reviewData.manuscript.ipfsUrls.manuscript,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          View Manuscript
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Form */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">
                      Your Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Decision */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-primary">
                        Decision *
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "accept",
                          "minor_revision",
                          "major_revision",
                          "reject",
                        ].map((option) => (
                          <Button
                            key={option}
                            variant={
                              decision === option ? "default" : "outline"
                            }
                            onClick={() =>
                              setDecision(option as ReviewDecision)
                            }
                            className="text-left justify-start h-auto p-4"
                          >
                            <div>
                              <div className="font-medium">
                                {getDecisionDescription(option)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {option === "accept" &&
                                  "Manuscript is ready for publication"}
                                {option === "minor_revision" &&
                                  "Small changes needed"}
                                {option === "major_revision" &&
                                  "Significant changes required"}
                                {option === "reject" &&
                                  "Not suitable for publication"}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                      {decision && (
                        <Badge className={getDecisionColor(decision)}>
                          {getDecisionDescription(decision)}
                        </Badge>
                      )}
                    </div>

                    {/* Comments for Authors */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-primary">
                        Comments for Authors *
                      </Label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Provide detailed feedback for the authors. This will be shared with them."
                        className="min-h-[120px] resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                      />
                      <p className="text-xs text-muted-foreground">
                        This feedback will be shared with the authors to help
                        them improve their manuscript.
                      </p>
                    </div>

                    {/* Confidential Comments */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-primary">
                        Confidential Comments (Optional)
                      </Label>
                      <Textarea
                        value={confidentialComments}
                        onChange={(e) =>
                          setConfidentialComments(e.target.value)
                        }
                        placeholder="Private comments for editors only. These will not be shared with authors."
                        className="min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                      />
                      <p className="text-xs text-muted-foreground">
                        These comments are only visible to editors and will not
                        be shared with authors.
                      </p>
                    </div>

                    {/* Recommendation */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-primary">
                        Additional Recommendations (Optional)
                      </Label>
                      <Textarea
                        value={recommendation}
                        onChange={(e) => setRecommendation(e.target.value)}
                        placeholder="Any additional recommendations or suggestions for the manuscript or the review process."
                        className="min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-primary/5 border-t border-gray-100 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={saveDraft}
                      disabled={saving || submitting}
                    >
                      <SaveIcon className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button
                      onClick={submitReview}
                      disabled={
                        !decision || !comments.trim() || submitting || saving
                      }
                    >
                      <SendIcon className="h-4 w-4 mr-2" />
                      {submitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : null}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
