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
  CheckIcon,
  XIcon,
  EditIcon,
} from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useToast } from "@/components/ui/toast";
import { useManuscriptManagement } from "@/hooks/useManuscriptManagement";
import { Header } from "@/components/header";
import { CreateWallets } from "@/components/wallet-connection";
import { PendingReviewManuscript } from "@/types/backend";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { connected, publicKey } = useWallet();
  const {
    loading,
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

  useEffect(() => {
    setCategories([{ name: "All", count: 0 }]);
  }, []);

  useEffect(() => {
    if (connected) {
      loadPendingManuscripts();
    }
  }, [connected]);

  const loadPendingManuscripts = async () => {
    const result = await getPendingReviewManuscripts(20);
    if (result?.success) {
      setManuscripts(result.manuscripts);
    }
  };

  const handleViewManuscript = async (manuscript: PendingReviewManuscript) => {
    setSelectedManuscript(manuscript);

    // Load review status
    const status = await getReviewStatus(manuscript.id);
    if (status?.success) {
      setReviewStatus(status);
    }
  };

  const handleAssignReviewers = async () => {
    if (!selectedManuscript || !publicKey) return;

    const validReviewers = reviewers.filter((r) => r.trim() !== "");
    if (validReviewers.length < 3) {
      alert("Please provide at least 3 reviewer wallet addresses");
      return;
    }

    const result = await assignReviewers(
      selectedManuscript.id,
      validReviewers,
      publicKey.toString()
    );

    if (result?.success) {
      alert(`Successfully assigned ${result.reviewersAssigned} reviewers`);
      setShowAssignReviewers(false);
      setReviewers(["", "", ""]);
      loadPendingManuscripts(); // Refresh list
    }
  };

  const handlePublishManuscript = async () => {
    if (!selectedManuscript || !publicKey) return;

    const confirmed = confirm(
      `Are you sure you want to publish "${selectedManuscript.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const result = await publishManuscript(
      selectedManuscript.id,
      publicKey.toString()
    );

    if (result?.success) {
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <Card className="shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">
                Review Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Please connect your wallet to access the review dashboard.
              </p>
              <CreateWallets />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                  <div className="space-y-4">
                    {filteredManuscripts.map((manuscript) => (
                      <div
                        key={manuscript.id}
                        onClick={() => handleViewManuscript(manuscript)}
                        className="cursor-pointer"
                      >
                        <Card
                          className={`transition-colors ${
                            selectedManuscript?.id === manuscript.id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:border-gray-300"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 mb-2">
                                  {manuscript.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  By {manuscript.author}
                                </p>
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="outline">
                                    {manuscript.category.join(", ")}
                                  </Badge>
                                  {getStatusBadge(manuscript)}
                                </div>
                                <p className="text-xs text-gray-500">
                                  Submitted:{" "}
                                  {new Date(
                                    manuscript.submissionDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <EyeIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Manuscript Details */}
              <div className="lg:col-span-1">
                {selectedManuscript ? (
                  <Card className="shadow-lg border-gray-200 sticky top-8">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">
                        Manuscript Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          {selectedManuscript.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          By {selectedManuscript.author}
                        </p>
                        <p className="text-sm text-gray-700 mb-4">
                          {selectedManuscript.abstract.substring(0, 200)}...
                        </p>
                      </div>

                      <Separator />

                      {/* Review Progress */}
                      {reviewStatus && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">
                            Review Progress
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Reviews Completed:</span>
                              <span className="font-medium">
                                {reviewStatus.reviewsCompleted}/
                                {reviewStatus.requiredReviews}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Can Publish:</span>
                              <span
                                className={
                                  reviewStatus.canPublish
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {reviewStatus.canPublish ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Next Action:</span>
                              <span className="text-blue-600">
                                {reviewStatus.nextAction}
                              </span>
                            </div>
                          </div>

                          {/* Review Details */}
                          {reviewStatus.reviews &&
                            reviewStatus.reviews.length > 0 && (
                              <div className="mt-4">
                                <h5 className="font-medium text-gray-900 mb-2">
                                  Review Details
                                </h5>
                                <div className="space-y-2">
                                  {reviewStatus.reviews.map((review: any) => (
                                    <div
                                      key={review.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span className="truncate">
                                        {review.reviewer.substring(0, 8)}...
                                      </span>
                                      <Badge
                                        variant={
                                          review.status === "completed"
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {review.status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}

                      <Separator />

                      {/* Actions */}
                      <div className="space-y-3">
                        <Button
                          onClick={() =>
                            window.open(
                              selectedManuscript.ipfsUrls.manuscript,
                              "_blank"
                            )
                          }
                          variant="outline"
                          className="w-full"
                        >
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          View Manuscript
                        </Button>

                        {(!reviewStatus ||
                          reviewStatus.reviewsCompleted === 0) && (
                          <Button
                            onClick={() => setShowAssignReviewers(true)}
                            className="w-full"
                          >
                            <UsersIcon className="h-4 w-4 mr-2" />
                            Assign Reviewers
                          </Button>
                        )}

                        {reviewStatus?.canPublish && (
                          <Button
                            onClick={handlePublishManuscript}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Publish Manuscript
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-lg border-gray-200">
                    <CardContent className="p-8 text-center text-gray-500">
                      <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Select a manuscript to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>

        {/* Assign Reviewers Modal */}
        {showAssignReviewers && selectedManuscript && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Assign Reviewers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Assign at least 3 reviewers to "{selectedManuscript.title}"
                </p>

                {reviewers.map((reviewer, index) => (
                  <div key={index}>
                    <label className="text-sm font-medium text-gray-700">
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
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
