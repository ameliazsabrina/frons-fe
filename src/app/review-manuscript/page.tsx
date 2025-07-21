"use client";
import React, { useState, useEffect, useCallback } from "react";
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
  CheckIcon,
  XIcon,
  EditIcon,
  PenIcon,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth";
import axios from "axios";
import { useToast } from "@/components/ui/sonner";
import { useManuscriptManagement } from "@/hooks/useManuscriptManagement";
import { Header } from "@/components/header";
import { PendingReviewManuscript } from "@/types/backend";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLoading } from "@/context/LoadingContext";
import { WalletConnection } from "@/components/wallet-connection";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import { getPrimarySolanaWalletAddress } from "@/utils/wallet";
import HeaderImage from "@/components/header-image";
import { Loading } from "@/components/ui/loading";

interface ReviewManuscript {
  id: string;
  title: string;
  author: string;
  abstract: string;
  category: string[];
  submissionDate: string;
  keywords: string[];
  status: string;
  cid: string;
  metadataCid?: string;
  ipfsUrls: {
    manuscript: string;
    metadata?: string | null;
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
  const { authenticated: connected, user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const publicKey = getPrimarySolanaWalletAddress(wallets);
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;
  const {
    isLoading: loading,
    error,
    getPendingReviewManuscripts,
    getReviewStatus,
    assignReviewers,
    publishManuscript,
  } = useManuscriptManagement();

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [manuscripts, setManuscripts] = useState<PendingReviewManuscript[]>([]);
  const [selectedManuscript, setSelectedManuscript] =
    useState<PendingReviewManuscript | null>(null);
  const [reviewStatus, setReviewStatus] = useState<any>(null);
  const [showAssignReviewers, setShowAssignReviewers] = useState(false);
  const [reviewers, setReviewers] = useState<string[]>(["", "", ""]); // Minimum 3 reviewers
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  const { isLoading } = useLoading();

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

  useEffect(() => {
    setCategories([{ name: "All", count: 0 }]);
  }, []);

  const loadPendingManuscripts = useCallback(async () => {
    console.log("🔄 Loading pending manuscripts for review...");

    try {
      const result = await getPendingReviewManuscripts(
        20,
        undefined,
        validSolanaPublicKey
      );

      if (result && result.length > 0) {
        console.log(`✅ Received ${result.length} manuscripts from API`);

        const convertedResults = result.map((m: any) => ({
          ...m,
          author: m.author || m.authorWallet || "Unknown",
          reviewCount: m.reviewCount || 0,
          averageRating: m.averageRating || 0,
          deadline:
            m.deadline ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          reviewer: m.reviewer || "N/A",
          reviewStatus: m.reviewStatus || "pending",
          progress: m.progress || 0,
          priority: m.priority || "medium",
          assignedDate: m.assignedDate || m.submittedAt || m.created_at,
          reviewId: m.reviewId || `review-${m.id}`,
          manuscriptId: m.id,
        }));

        setManuscripts(convertedResults);
      } else {
        console.log("⚠️ No manuscripts received from API");
        setManuscripts([]);
      }
    } catch (error) {
      console.error("❌ API call failed:", error);
      setManuscripts([]);
    }
  }, [getPendingReviewManuscripts, validSolanaPublicKey]);

  useEffect(() => {
    if (connected) {
      loadPendingManuscripts();
    }
  }, [connected, loadPendingManuscripts]);

  const handleViewManuscript = async (manuscript: PendingReviewManuscript) => {
    setSelectedManuscript(manuscript);

    // Load review status
    const status = await getReviewStatus(manuscript.id.toString());
    if (status?.success) {
      setReviewStatus(status);
    }
  };

  const handleAssignReviewers = async () => {
    if (!selectedManuscript || !validSolanaPublicKey) return;

    const validReviewers = reviewers.filter((r) => r.trim() !== "");
    if (validReviewers.length < 3) {
      alert("Please provide at least 3 reviewer wallet addresses");
      return;
    }

    const result = await assignReviewers(
      selectedManuscript.id.toString(),
      validReviewers.length
    );

    if (result) {
      alert(`Successfully assigned reviewers`);
      setShowAssignReviewers(false);
      setReviewers(["", "", ""]);
      loadPendingManuscripts(); // Refresh list
    }
  };

  const handlePublishManuscript = async () => {
    if (!selectedManuscript || !validSolanaPublicKey) return;

    const confirmed = confirm(
      `Are you sure you want to publish "${selectedManuscript.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const result = await publishManuscript(selectedManuscript.id.toString());

    if (result) {
      alert("Manuscript published successfully!");
      setSelectedManuscript(null);
      setReviewStatus(null);
      loadPendingManuscripts(); // Refresh list
    }
  };

  const getStatusBadge = (manuscript: PendingReviewManuscript) => {
    const { reviewsCompleted, reviewsRequired, canPublish } =
      manuscript.reviewInfo;

    if (canPublish) {
      return (
        <Badge className="bg-green-100 text-green-800">Ready to Publish</Badge>
      );
    } else if (reviewsCompleted > 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          In Review ({reviewsCompleted}/{reviewsRequired})
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800">Awaiting Reviewers</Badge>
      );
    }
  };

  const filteredManuscripts = manuscripts.filter((manuscript) => {
    const matchesStatus =
      selectedStatus === "All" ||
      (manuscript.status &&
        manuscript.status === selectedStatus.toLowerCase().replace(" ", "_"));
    const matchesSearch =
      searchQuery === "" ||
      manuscript.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manuscript.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manuscript.category.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
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
            <HeaderImage />
            <div className="container max-w-6xl mx-auto px-4 py-8 lg:px-16">
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Review Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Please connect your wallet to access the review dashboard.
                  </p>
                  <WalletConnection />
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
            <div className="flex items-center gap-2 px-6 py-4">
              <SidebarTrigger className="w-10 h-10" />
              <Separator orientation="vertical" className="h-6" />
            </div>
          </div>
          <HeaderImage />
          <div className="flex-1 p-4 sm:p-6 mx-12">
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
                <span className="text-sm text-muted-foreground min-w-fit">
                  Filter by category:
                </span>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue
                      className="text-sm"
                      placeholder="Select a category"
                    />
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
                <span className="text-sm text-muted-foreground">
                  Filter by status:
                </span>
                {reviewStatuses.map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"}
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
                <Loading />
              ) : error ? (
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-8 text-center">
                    <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-primary mb-2">
                      Error
                    </h2>
                    <p className="text-red-600">{error}</p>
                  </CardContent>
                </Card>
              ) : manuscripts.length === 0 ? (
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-8 text-center">
                    <FileTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-primary mb-2">
                      No Manuscripts to Review
                    </h2>
                    <p className="text-muted-foreground">
                      There are no manuscripts assigned to you for review at
                      this time.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {manuscripts.map((manuscript) => (
                    <Card
                      key={manuscript.id}
                      className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <h3 className="font-medium text-primary leading-tight">
                                {manuscript.title}
                              </h3>
                            </div>

                            <div className="space-y-3 mb-4">
                              <p className="text-sm text-muted-foreground">
                                By {manuscript.author}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {manuscript.category.map((cat, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-primary/10 text-primary text-xs"
                                  >
                                    {cat}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                              <p>
                                Submitted:{" "}
                                {formatDate(manuscript.submissionDate)}
                              </p>
                              <p>Review Status: {manuscript.status}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  manuscript.ipfsUrls.manuscript,
                                  "_blank"
                                )
                              }
                              className="text-xs"
                            >
                              <ExternalLinkIcon className="h-3 w-3 mr-1" />
                              View Paper
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                router.push(`/submit-review/${manuscript.id}`)
                              }
                              className="text-xs"
                            >
                              <PenIcon className="h-3 w-3 mr-1" />
                              Submit Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>

        {/* Assign Reviewers Modal */}
        {showAssignReviewers && selectedManuscript && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 shadow-sm border border-gray-100 rounded-xl bg-white/80">
              <CardHeader>
                <CardTitle className="text-primary">Assign Reviewers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Assign at least 3 reviewers to &quot;
                  {selectedManuscript.title}&quot;
                </p>

                {reviewers.map((reviewer, index) => (
                  <div key={index}>
                    <label className="text-sm font-medium text-primary">
                      Reviewer {index + 1} Wallet Address
                    </label>
                    <input
                      type="text"
                      value={reviewer}
                      onChange={(e) => {
                        const newReviewers = [...reviewers];
                        newReviewers[index] = e.target.value;
                        setReviewers(newReviewers);
                      }}
                      placeholder="0x..."
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                    />
                  </div>
                ))}

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setShowAssignReviewers(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignReviewers}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? "Assigning..." : "Assign Reviewers"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
