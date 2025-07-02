"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheckIcon,
  CalendarIcon,
  UsersIcon,
  SearchIcon,
  FilterIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  ExternalLinkIcon,
  LoaderIcon,
} from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { useProgram } from "@/hooks/useProgram";
import axios from "axios";
import { useToast } from "@/components/ui/toast";

interface ReviewManuscript {
  id: string;
  title: string;
  author: string;
  abstract: string;
  category: string;
  submissionDate: string;
  keywords: string[];
  status: string;
  cid: string;
  metadataCid?: string;
  ipfsUrls: {
    manuscript: string;
    metadata: string | null;
  };
  gateways: string[];
  reviewStatus?:
    | "available"
    | "assigned"
    | "in_progress"
    | "completed"
    | "overdue"
    | "pending_reviews"
    | "ready_for_publication";
  assignedReviewer?: string;
  estimatedReviewTime?: string;
  deadline?: string;
  reviewCount?: number;
  requiredReviews?: number;
  completedReviews?: number;
  aiAssignmentData?: {
    assignedReviewer: string;
    reasoning: string;
    confidenceLevel: number;
    candidateAnalysis?: any[];
  };
}

interface Category {
  name: string;
  count: number;
}

const reviewStatuses = [
  "All",
  "Available",
  "Assigned",
  "In Progress",
  "Completed",
  "Pending Reviews",
  "Ready for Publication",
  "Overdue",
];

export default function ReviewManuscriptPage() {
  const router = useRouter();
  const { connected, publicKey } = useProgram();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [manuscripts, setManuscripts] = useState<ReviewManuscript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [showAiDetails, setShowAiDetails] = useState<string | null>(null);
  const { showToast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const parseCategory = (categoryData: any): string => {
    if (!categoryData) return "Uncategorized";

    if (Array.isArray(categoryData)) {
      return categoryData.length > 0 ? categoryData[0] : "Uncategorized";
    }

    if (typeof categoryData === "string") {
      const firstCategory = categoryData.split(",")[0].trim();
      return firstCategory || "Uncategorized";
    }

    return "Uncategorized";
  };

  const extractAllCategories = (categoryData: any): string[] => {
    if (!categoryData) return [];

    if (Array.isArray(categoryData)) {
      return categoryData;
    }

    if (typeof categoryData === "string") {
      return categoryData
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);
    }

    return [];
  };

  const getReviewStatus = (review: any): string => {
    const completedReviews = review.completed_reviews || 0;
    const requiredReviews = 3;

    if (completedReviews >= requiredReviews) {
      return "ready_for_publication";
    }

    if (
      review.status === "submitted" ||
      review.status === "submitted_for_review"
    ) {
      return "available";
    } else if (review.status === "assigned") {
      return "assigned";
    } else if (
      review.status === "in_review" ||
      review.status === "under_review"
    ) {
      return "in_progress";
    } else if (review.status === "completed") {
      return completedReviews < requiredReviews
        ? "pending_reviews"
        : "ready_for_publication";
    } else {
      return "available";
    }
  };

  useEffect(() => {
    setCategories([{ name: "All", count: 0 }]);
  }, []);

  useEffect(() => {
    const fetchManuscripts = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          limit: "50",
        });

        // Add reviewer wallet to filter out already reviewed manuscripts
        if (connected && publicKey) {
          queryParams.append("reviewerWallet", publicKey.toString());
        }

        const res = await axios.get(
          `${apiUrl}/api/manuscripts/pending-review?${queryParams.toString()}`
        );

        console.log("Pending review API response:", res.data);

        if (res.data.success) {
          const manuscriptsData = res.data.manuscripts.map(
            (manuscript: any) => {
              console.log(
                "Processing manuscript:",
                manuscript.id,
                manuscript.title
              );
              console.log("Original status:", manuscript.status);

              const reviewStatus = manuscript.reviewInfo?.canPublish
                ? "ready_for_publication"
                : "pending_reviews";

              console.log("Computed reviewStatus:", reviewStatus);

              const processedManuscript = {
                id: manuscript.id?.toString() || "unknown",
                title: manuscript.title || "Untitled",
                author: manuscript.author || "Unknown Author",
                abstract: manuscript.abstract || "No abstract available",
                category: parseCategory(manuscript.category),
                keywords: manuscript.keywords || [],
                cid: manuscript.cid || "unknown",
                submissionDate:
                  manuscript.submissionDate || new Date().toISOString(),
                reviewStatus: reviewStatus,
                reviewCount: manuscript.reviewInfo?.reviewsCompleted || 0,
                requiredReviews: manuscript.reviewInfo?.reviewsRequired || 3,
                completedReviews: manuscript.reviewInfo?.reviewsCompleted || 0,
                estimatedReviewTime: "2-3 weeks",
                deadline:
                  manuscript.deadline ||
                  new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                assignedReviewer: manuscript.assignedReviewer || null,
                ipfsUrls: {
                  manuscript:
                    manuscript.ipfsUrls?.manuscript ||
                    `https://ipfs.io/ipfs/${manuscript.cid}`,
                  metadata:
                    manuscript.ipfsUrls?.metadata ||
                    (manuscript.metadataCid
                      ? `https://ipfs.io/ipfs/${manuscript.metadataCid}`
                      : null),
                },
                gateways: [
                  `https://ipfs.io/ipfs/${manuscript.cid}`,
                  `https://gateway.pinata.cloud/ipfs/${manuscript.cid}`,
                  `https://dweb.link/ipfs/${manuscript.cid}`,
                ],
              };

              console.log("Final processed manuscript:", processedManuscript);
              return processedManuscript;
            }
          );

          console.log("Total manuscripts processed:", manuscriptsData.length);
          setManuscripts(manuscriptsData);

          const uniqueCategories = new Set<string>();
          manuscriptsData.forEach((m: any) => {
            const allCategories = extractAllCategories(m.category);
            allCategories.forEach((cat) => uniqueCategories.add(cat));
          });

          setCategories([
            { name: "All", count: manuscriptsData.length },
            ...Array.from(uniqueCategories).map((cat) => ({
              name: cat,
              count: manuscriptsData.filter((m: any) =>
                extractAllCategories(m.category).includes(cat)
              ).length,
            })),
          ]);

          const filteredManuscripts =
            selectedCategory === "All"
              ? manuscriptsData
              : manuscriptsData.filter((m: any) => {
                  const allCategories = extractAllCategories(m.category);
                  return allCategories.some(
                    (cat) =>
                      cat
                        .toLowerCase()
                        .includes(selectedCategory.toLowerCase()) ||
                      selectedCategory.toLowerCase().includes(cat.toLowerCase())
                  );
                });

          console.log(
            "Filtered manuscripts for selectedCategory:",
            selectedCategory,
            filteredManuscripts.length
          );
          setManuscripts(filteredManuscripts);
        } else {
          setError(res.data.error || "Failed to fetch manuscripts");
        }
      } catch (err: any) {
        console.error("Manuscripts fetch error:", err);
        setError(
          "Failed to fetch manuscripts: " +
            (err.response?.data?.error || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchManuscripts();
  }, [selectedCategory, connected, publicKey]);

  const handleAiAutoAssign = async (reviewId: string) => {
    try {
      setAiLoading(reviewId);
      setError(null);

      console.log(`Starting AI auto-assignment for review ${reviewId}`);

      const response = await axios.post(
        `${apiUrl}/api/reviews/${reviewId}/ai-auto-assign`
      );

      if (response.data.success) {
        console.log("AI auto-assignment successful:", response.data);

        setError(null);

        const queryParams = new URLSearchParams({
          limit: "50",
        });

        if (connected && publicKey) {
          queryParams.append("reviewerWallet", publicKey.toString());
        }

        const res = await axios.get(
          `${apiUrl}/api/manuscripts/pending-review?${queryParams.toString()}`
        );
        if (res.data.success) {
          const updatedManuscripts = res.data.manuscripts.map(
            (manuscript: any) => ({
              id: manuscript.id?.toString() || "unknown",
              title: manuscript.title || "Untitled",
              author: manuscript.author || "Unknown Author",
              abstract: manuscript.abstract || "No abstract available",
              category: parseCategory(manuscript.category),
              keywords: manuscript.keywords || [],
              cid: manuscript.cid || "unknown",
              submissionDate:
                manuscript.submissionDate || new Date().toISOString(),
              reviewStatus: manuscript.reviewInfo?.canPublish
                ? "ready_for_publication"
                : "pending_reviews",
              reviewCount: manuscript.reviewInfo?.reviewsCompleted || 0,
              requiredReviews: manuscript.reviewInfo?.reviewsRequired || 3,
              completedReviews: manuscript.reviewInfo?.reviewsCompleted || 0,
              estimatedReviewTime: "2-3 weeks",
              deadline:
                manuscript.deadline ||
                new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              assignedReviewer: manuscript.assignedReviewer || null,
              aiAssignmentData: response.data, // Include AI assignment data
              ipfsUrls: {
                manuscript:
                  manuscript.ipfsUrls?.manuscript ||
                  `https://ipfs.io/ipfs/${manuscript.cid}`,
                metadata: manuscript.ipfsUrls?.metadata || null,
              },
              gateways: manuscript.ipfsUrls
                ? [manuscript.ipfsUrls.manuscript]
                : [`https://ipfs.io/ipfs/${manuscript.cid}`],
              status: manuscript.status || "under_review",
            })
          );

          setManuscripts(updatedManuscripts);
        }
      } else {
        setError(response.data.error || "AI auto-assignment failed");
      }
    } catch (err: any) {
      console.error("AI auto-assignment error:", err);
      setError(
        `AI auto-assignment failed: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setAiLoading(null);
    }
  };

  const fetchAiAnalysis = async (manuscriptId: string) => {
    try {
      setAiLoading(`analysis-${manuscriptId}`);

      const response = await axios.get(
        `${apiUrl}/api/reviews/manuscript/${manuscriptId}/ai-analysis`
      );

      if (response.data.success) {
        setAiAnalysis(response.data);
        setShowAiDetails(`analysis-${manuscriptId}`);
      } else {
        setError("Failed to fetch AI analysis");
      }
    } catch (err: any) {
      console.error("AI analysis error:", err);
      setError(
        `AI analysis failed: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setAiLoading(null);
    }
  };

  const fetchAiRecommendations = async (manuscriptId: string) => {
    try {
      setAiLoading(`recommendations-${manuscriptId}`);

      const response = await axios.get(
        `${apiUrl}/api/reviews/manuscript/${manuscriptId}/ai-recommendations`
      );

      if (response.data.success) {
        setAiRecommendations(response.data);
        setShowAiDetails(`recommendations-${manuscriptId}`);
      } else {
        setError("Failed to fetch AI recommendations");
      }
    } catch (err: any) {
      console.error("AI recommendations error:", err);
      setError(
        `AI recommendations failed: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setAiLoading(null);
    }
  };

  const handlePublishManuscript = async (manuscriptId: string) => {
    try {
      setAiLoading(`publish-${manuscriptId}`);
      setError(null);

      console.log(`Publishing manuscript ${manuscriptId} to publications...`);

      const response = await axios.post(
        `${apiUrl}/api/manuscripts/${manuscriptId}/publish`
      );

      if (response.data.success) {
        console.log("Manuscript published successfully:", response.data);

        const queryParams = new URLSearchParams({
          limit: "50",
        });

        if (connected && publicKey) {
          queryParams.append("reviewerWallet", publicKey.toString());
        }

        const res = await axios.get(
          `${apiUrl}/api/manuscripts/pending-review?${queryParams.toString()}`
        );
        if (res.data.success) {
          const updatedManuscripts = res.data.manuscripts.map(
            (manuscript: any) => ({
              id: manuscript.id?.toString() || "unknown",
              title: manuscript.title || "Untitled",
              author: manuscript.author || "Unknown Author",
              abstract: manuscript.abstract || "No abstract available",
              category: parseCategory(manuscript.category),
              keywords: manuscript.keywords || [],
              cid: manuscript.cid || "unknown",
              submissionDate:
                manuscript.submissionDate || new Date().toISOString(),
              reviewStatus: manuscript.reviewInfo?.canPublish
                ? "ready_for_publication"
                : "pending_reviews",
              reviewCount: manuscript.reviewInfo?.reviewsCompleted || 0,
              requiredReviews: manuscript.reviewInfo?.reviewsRequired || 3,
              completedReviews: manuscript.reviewInfo?.reviewsCompleted || 0,
              estimatedReviewTime: "2-3 weeks",
              deadline:
                manuscript.deadline ||
                new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              assignedReviewer: manuscript.assignedReviewer || null,
              ipfsUrls: {
                manuscript:
                  manuscript.ipfsUrls?.manuscript ||
                  `https://ipfs.io/ipfs/${manuscript.cid}`,
                metadata: manuscript.ipfsUrls?.metadata || null,
              },
              gateways: manuscript.ipfsUrls
                ? [manuscript.ipfsUrls.manuscript]
                : [`https://ipfs.io/ipfs/${manuscript.cid}`],
              status: manuscript.status || "under_review",
            })
          );

          setManuscripts(updatedManuscripts);
        }

        alert(
          `Manuscript published successfully! Publication ID: ${response.data.publication?.id}`
        );
      } else {
        setError(response.data.error || "Failed to publish manuscript");
      }
    } catch (err: any) {
      console.error("Publication error:", err);
      setError(
        `Failed to publish manuscript: ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setAiLoading(null);
    }
  };

  const filteredManuscripts = manuscripts.filter((manuscript) => {
    const matchesStatus =
      selectedStatus === "All" ||
      (manuscript.reviewStatus &&
        manuscript.reviewStatus ===
          selectedStatus.toLowerCase().replace(" ", "_"));
    const matchesSearch =
      searchQuery === "" ||
      manuscript.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manuscript.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manuscript.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending_reviews":
        return "bg-orange-100 text-orange-800";
      case "ready_for_publication":
        return "bg-emerald-100 text-emerald-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "assigned":
        return "Assigned";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "pending_reviews":
        return "Pending Reviews";
      case "ready_for_publication":
        return "Ready for Publication";
      case "overdue":
        return "Overdue";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <EyeIcon className="h-4 w-4" />;
      case "assigned":
        return <ClipboardCheckIcon className="h-4 w-4" />;
      case "in_progress":
        return <ClockIcon className="h-4 w-4" />;
      case "completed":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "pending_reviews":
        return <LoaderIcon className="h-4 w-4" />;
      case "ready_for_publication":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "overdue":
        return <AlertCircleIcon className="h-4 w-4" />;
      default:
        return <FileTextIcon className="h-4 w-4" />;
    }
  };
  const handleStartReview = async (manuscriptId: string) => {
    if (!connected || !publicKey) {
      showToast("Please connect your wallet to start reviewing", "error");
      return;
    }

    try {
      setAiLoading(manuscriptId);
      setError(null);

      const response = await axios.post(`${apiUrl}/api/reviews/start`, {
        manuscriptId,
        reviewerWallet: publicKey.toString(),
      });

      if (response.data.success) {
        const reviewId = response.data.reviewId;
        showToast("Review started successfully!", "success");

        console.log("Review started successfully, redirecting to:", reviewId);
        router.push(`/submit-review/${reviewId}`);
      } else {
        const errorMsg = response.data.error || "Failed to start review";
        setError(errorMsg);
        showToast(errorMsg, "error");
      }
    } catch (error: any) {
      console.error("Error starting review:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      let errorMessage = "Failed to start review: ";
      if (error.response?.status === 404) {
        errorMessage = "Manuscript not found or not available for review.";
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      showToast(errorMessage, "error");

      // Fallback: use manuscript ID as review ID
      console.warn("Error occurred, using manuscript ID as fallback");
      router.push(`/submit-review/${manuscriptId}`);
    } finally {
      setAiLoading(null);
    }
  };

  const isDeadlineNear = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 5 && diffDays > 0;
  };

  const getActionButtons = (manuscript: ReviewManuscript) => {
    const isAiLoading = aiLoading === manuscript.id;
    const isAnalysisLoading = aiLoading === `analysis-${manuscript.id}`;
    const isRecommendationsLoading =
      aiLoading === `recommendations-${manuscript.id}`;

    switch (manuscript.reviewStatus) {
      case "available":
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              className="text-xs bg-blue-600 hover:bg-blue-700 btn-enhanced"
              onClick={() => handleAiAutoAssign(manuscript.id)}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <>
                  <LoaderIcon className="h-3 w-3 mr-1 animate-spin" />
                  AI Assigning...
                </>
              ) : (
                <>AI Auto-Assign</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => fetchAiAnalysis(manuscript.id)}
              disabled={isAnalysisLoading}
            >
              {isAnalysisLoading ? (
                <LoaderIcon className="h-3 w-3 animate-spin" />
              ) : (
                "AI Analysis"
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => fetchAiRecommendations(manuscript.id)}
              disabled={isRecommendationsLoading}
            >
              {isRecommendationsLoading ? (
                <LoaderIcon className="h-3 w-3 animate-spin" />
              ) : (
                "AI Recommendations"
              )}
            </Button>
          </div>
        );
      case "assigned":
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                handleStartReview(manuscript.id);
              }}
            >
              Start Review
            </Button>
            {manuscript.aiAssignmentData && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-blue-600"
                onClick={() => setShowAiDetails(`assignment-${manuscript.id}`)}
              >
                View AI Details
              </Button>
            )}
          </div>
        );
      case "in_progress":
        return (
          <Button size="sm" variant="outline" className="text-xs">
            Continue Review
          </Button>
        );
      case "completed":
        return (
          <Button size="sm" variant="outline" className="text-xs">
            View Review
          </Button>
        );
      case "pending_reviews":
        return (
          <div className="flex flex-col items-end gap-2 justify-end">
            <Button
              size="sm"
              variant="default"
              className="btn-enhanced"
              onClick={() => handleStartReview(manuscript.id)}
            >
              Start Review
            </Button>
          </div>
        );
      case "ready_for_publication":
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="text-xs bg-emerald-600 hover:bg-emerald-700 btn-enhanced"
              onClick={() => handlePublishManuscript(manuscript.id)}
            >
              Publish to Publications
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              View All Reviews
            </Button>
          </div>
        );
      case "overdue":
        return (
          <Button
            size="sm"
            variant="outline"
            className="text-xs text-red-600 border-red-200"
          >
            Urgent Action
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline" className="text-xs">
            Review
          </Button>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white flex w-full">
        <OverviewSidebar connected={connected} />

        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen">
            {/* Header with Sidebar Trigger */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center gap-2 px-4 py-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-6">
              {/* Header Section */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-anton uppercase tracking-tight">
                  Peer Review
                </h1>
                <p className="text-primary/80 text-sm sm:text-md max-w-2xl mx-auto">
                  Review manuscripts, provide feedback, and contribute to the
                  quality of academic research.
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-full">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search manuscripts by title, author, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-sm"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-3">
                  <FilterIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 min-w-fit">
                    Filter by category:
                  </span>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                          {category.name !== "All" && ` (${category.count})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <FilterIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Filter by status:
                  </span>
                  {reviewStatuses.map((status) => (
                    <Button
                      key={status}
                      variant={
                        selectedStatus === status ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedStatus(status)}
                      className="text-xs"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Manuscripts List */}
              <div className="space-y-6">
                {loading ? (
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardContent className="p-8 text-center">
                      <ClipboardCheckIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">
                        Loading manuscripts for review...
                      </p>
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardContent className="p-8 text-center">
                      <ClipboardCheckIcon className="h-12 w-12 text-red-200 mx-auto mb-4" />
                      <p className="text-red-500 mb-2">{error}</p>
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="mt-2"
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : filteredManuscripts.length === 0 ? (
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardContent className="p-8 text-center">
                      <ClipboardCheckIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">
                        {manuscripts.length === 0
                          ? "No manuscripts available for review"
                          : "No manuscripts found"}
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        {manuscripts.length === 0
                          ? "Manuscripts will appear here once they are submitted and ready for review."
                          : "Try adjusting your search or filter criteria"}
                      </p>
                      {manuscripts.length === 0 && (
                        <Button variant="default" asChild>
                          <Link href="/submit-manuscript">
                            Submit a Manuscript
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredManuscripts.map((manuscript) => (
                    <Card
                      key={manuscript.id}
                      className="shadow-sm border border-gray-100 rounded-xl bg-white/80 card-hover"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                {manuscript.title}
                              </h3>
                              {manuscript.deadline &&
                                isDeadlineNear(manuscript.deadline) && (
                                  <Badge className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                    Deadline Soon
                                  </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <UsersIcon className="h-4 w-4" />
                                {manuscript.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                Submitted:{" "}
                                {formatDate(manuscript.submissionDate)}
                              </span>
                              {manuscript.deadline && (
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-4 w-4" />
                                  Due: {formatDate(manuscript.deadline)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <Badge
                              className={`${getStatusColor(
                                manuscript.reviewStatus || "available"
                              )} text-xs px-2 py-1 rounded-full flex items-center gap-1`}
                            >
                              {getStatusIcon(
                                manuscript.reviewStatus || "available"
                              )}
                              {getStatusLabel(
                                manuscript.reviewStatus || "available"
                              )}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                          {manuscript.abstract}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary"
                          >
                            {manuscript.category}
                          </Badge>
                          {manuscript.keywords
                            .slice(0, 3)
                            .map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          {manuscript.keywords.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                            >
                              +{manuscript.keywords.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Review Progress Indicator */}
                        {(manuscript.reviewStatus === "pending_reviews" ||
                          manuscript.reviewStatus ===
                            "ready_for_publication") && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Review Progress
                              </span>
                              <span className="text-sm text-gray-600">
                                {manuscript.completedReviews || 0}/
                                {manuscript.requiredReviews || 3} Completed
                              </span>
                            </div>
                            <Progress
                              value={
                                ((manuscript.completedReviews || 0) /
                                  (manuscript.requiredReviews || 3)) *
                                100
                              }
                              animated={true}
                              gradient={
                                (manuscript.completedReviews || 0) <
                                (manuscript.requiredReviews || 3)
                              }
                              className={`h-3 ${
                                (manuscript.completedReviews || 0) >=
                                (manuscript.requiredReviews || 3)
                                  ? "[&>div]:bg-emerald-600"
                                  : ""
                              }`}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span>DOCI: {manuscript.cid}</span>
                            {manuscript.estimatedReviewTime && (
                              <span>
                                Est. time: {manuscript.estimatedReviewTime}
                              </span>
                            )}
                            {manuscript.assignedReviewer && (
                              <span>
                                Reviewer: {manuscript.assignedReviewer}
                              </span>
                            )}
                            {manuscript.aiAssignmentData && (
                              <span className="text-blue-600">
                                AI Confidence:{" "}
                                {Math.round(
                                  manuscript.aiAssignmentData.confidenceLevel *
                                    100
                                )}
                                %
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {manuscript.cid && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                asChild
                              >
                                <a
                                  href={manuscript.ipfsUrls.manuscript}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View on IPFS
                                  <ExternalLinkIcon className="h-3 w-3 ml-1" />
                                </a>
                              </Button>
                            )}
                            {getActionButtons(manuscript)}
                          </div>
                        </div>

                        {/* AI Assignment Details */}
                        {manuscript.aiAssignmentData &&
                          showAiDetails === `assignment-${manuscript.id}` && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-900 mb-2">
                                AI Assignment Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>Assigned Reviewer:</strong>{" "}
                                  {manuscript.aiAssignmentData.assignedReviewer}
                                </div>
                                <div>
                                  <strong>Confidence Level:</strong>{" "}
                                  {Math.round(
                                    manuscript.aiAssignmentData
                                      .confidenceLevel * 100
                                  )}
                                  %
                                </div>
                                <div>
                                  <strong>AI Reasoning:</strong>
                                  <p className="mt-1 text-gray-700">
                                    {manuscript.aiAssignmentData.reasoning}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="mt-2 text-xs"
                                onClick={() => setShowAiDetails(null)}
                              >
                                Hide Details
                              </Button>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* AI Analysis Modal */}
              {aiAnalysis && showAiDetails?.startsWith("analysis-") && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          AI Manuscript Analysis
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAiDetails(null)}
                        >
                          ✕
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Research Area
                        </h4>
                        <p className="text-gray-700">
                          {aiAnalysis.analysis?.researchArea}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Methodology
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {aiAnalysis.analysis?.methodology?.map(
                            (method: string, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {method}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Expertise Required
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {aiAnalysis.analysis?.expertiseRequired?.map(
                            (expertise: string, i: number) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700"
                              >
                                {expertise}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Reviewer Profile
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {aiAnalysis.analysis?.reviewerProfile}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Complexity Level
                          </h4>
                          <Badge
                            className={`${
                              aiAnalysis.analysis?.complexityLevel ===
                              "advanced"
                                ? "bg-red-100 text-red-800"
                                : aiAnalysis.analysis?.complexityLevel ===
                                  "intermediate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {aiAnalysis.analysis?.complexityLevel}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Interdisciplinary
                          </h4>
                          <Badge
                            className={`${
                              aiAnalysis.analysis?.interdisciplinary
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {aiAnalysis.analysis?.interdisciplinary
                              ? "Yes"
                              : "No"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* AI Recommendations Modal */}
              {aiRecommendations &&
                showAiDetails?.startsWith("recommendations-") && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            AI Reviewer Recommendations
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAiDetails(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            Summary
                          </h4>
                          <p className="text-blue-800 text-sm">
                            {aiRecommendations.summary}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            Recommended Reviewers
                          </h4>
                          {aiRecommendations.recommendations?.map(
                            (rec: any, index: number) => (
                              <Card
                                key={index}
                                className="border border-gray-200"
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h5 className="font-semibold text-gray-900">
                                        {rec.name}
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        {rec.institution}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {rec.walletAddress}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-blue-600">
                                        {rec.overallScore}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Overall Score
                                      </div>
                                      <Badge
                                        className={`mt-1 ${
                                          rec.recommendation ===
                                          "highly_recommended"
                                            ? "bg-green-100 text-green-800"
                                            : rec.recommendation ===
                                              "recommended"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {rec.recommendation.replace("_", " ")}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                                    <div className="text-center">
                                      <div className="font-semibold text-gray-900">
                                        {rec.qualificationScore}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Qualification
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-semibold text-gray-900">
                                        {rec.expertiseScore}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Expertise
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-semibold text-gray-900">
                                        {rec.availabilityScore}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Availability
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <h6 className="font-medium text-gray-900 mb-1">
                                      AI Reasoning
                                    </h6>
                                    <p className="text-sm text-gray-700">
                                      {rec.reasoningExplanation}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <h6 className="font-medium text-green-800 mb-1">
                                        Strengths
                                      </h6>
                                      <ul className="text-xs text-gray-600 space-y-1">
                                        {rec.strengths?.map(
                                          (strength: string, i: number) => (
                                            <li key={i}>• {strength}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                    <div>
                                      <h6 className="font-medium text-orange-800 mb-1">
                                        Concerns
                                      </h6>
                                      <ul className="text-xs text-gray-600 space-y-1">
                                        {rec.concerns?.map(
                                          (concern: string, i: number) => (
                                            <li key={i}>• {concern}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
