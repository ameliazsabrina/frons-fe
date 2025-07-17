"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  CalendarIcon,
  BarChart3Icon,
  SendIcon,
  RefreshCwIcon,
  BookOpenIcon,
  EditIcon,
  PlusIcon,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useRouter } from "next/navigation";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import { getPrimarySolanaWalletAddress } from "@/utils/wallet";
import { WalletConnection } from "@/components/wallet-connection";
import { useManuscriptManagement } from "@/hooks/useManuscriptManagement";
import HeaderImage from "@/components/header-image";

interface ReviewInfo {
  reviewsCompleted: number;
  reviewsRequired: number;
  canPublish: boolean;
}

interface IPFSUrls {
  manuscript: string;
  metadata: string | null;
}

interface Manuscript {
  id: string;
  title: string;
  abstract: string;
  category: string[];
  keywords: string[];
  author_wallet: string;
  status: "under_review" | "published" | "rejected" | "revision_required";
  submissionDate: string;
  created_at: string;
  updated_at: string;
  publishedDate?: string;
  cid: string;
  ipfs_hash: string;
  reviewInfo?: ReviewInfo;
  reviews?: Array<{
    id: string;
    comments: string;
    decision: string;
    reviewer_wallet: string;
    created_at: string;
  }>;
  ipfsUrls?: IPFSUrls;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "accepted":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "under_review":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "revision_required":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    case "submitted":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "published":
      return <CheckCircleIcon className="h-3.5 w-3.5" />;
    case "accepted":
      return <CheckCircleIcon className="h-3.5 w-3.5" />;
    case "under_review":
      return <ClockIcon className="h-3.5 w-3.5" />;
    case "revision_required":
      return <AlertCircleIcon className="h-3.5 w-3.5" />;
    case "rejected":
      return <XCircleIcon className="h-3.5 w-3.5" />;
    case "submitted":
      return <SendIcon className="h-3.5 w-3.5" />;
    default:
      return <FileTextIcon className="h-3.5 w-3.5" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "published":
      return "Published";
    case "accepted":
      return "Accepted";
    case "under_review":
      return "Under Review";
    case "revision_required":
      return "Revision Required";
    case "rejected":
      return "Rejected";
    case "submitted":
      return "Submitted";
    default:
      return "Unknown";
  }
};

export default function AuthorsDashboardPage() {
  const { authenticated: connected } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const publicKey = getPrimarySolanaWalletAddress(solanaWallets);
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;
  const router = useRouter();

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const {
    getAuthorManuscripts,
    isLoading,
    error: fetchError,
  } = useManuscriptManagement();

  // Fetch manuscripts when wallet is connected
  useEffect(() => {
    const fetchManuscripts = async () => {
      if (validSolanaPublicKey) {
        const result = await getAuthorManuscripts(validSolanaPublicKey);
        if (result) {
          setManuscripts(result);
        }
      }
    };

    fetchManuscripts();
  }, [validSolanaPublicKey, getAuthorManuscripts]);

  // Calculate statistics
  const totalManuscripts = manuscripts.length;
  const publishedCount = manuscripts.filter(
    (m) => m.status === "published"
  ).length;
  const underReviewCount = manuscripts.filter(
    (m) => m.status === "under_review"
  ).length;
  const revisionRequiredCount = manuscripts.filter(
    (m) => m.status === "revision_required"
  ).length;

  const handleRefreshStatus = useCallback(async () => {
    if (validSolanaPublicKey) {
      const result = await getAuthorManuscripts(validSolanaPublicKey);
      if (result) {
        setManuscripts(result);
      }
      window.location.reload();
    }
  }, [validSolanaPublicKey, getAuthorManuscripts]);

  if (!connected || !validSolanaPublicKey) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4">
                <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-primary">
                    Author Dashboard
                  </span>
                </div>
              </div>
            </div>
            <HeaderImage />
            <div className="container max-w-4xl mx-auto px-6 py-8">
              <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UsersIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-primary mb-4">
                    Authentication Required
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg">
                    Please connect your wallet to access your author dashboard.
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
        <OverviewSidebar connected={connected} />
        <SidebarInset className="flex-1">
          <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4">
              <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-primary">
                  Author Dashboard
                </span>
              </div>
            </div>
          </div>
          <HeaderImage />
          <div className="container max-w-6xl mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-primary mb-2">
                    Author Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Manage your research submissions and track publication
                    progress
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/submit-manuscript")}
                  size="lg"
                  className="hidden md:flex"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Submission
                </Button>
              </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100/80 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileTextIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary">
                      {totalManuscripts}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100/80 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-emerald-600">
                      {publishedCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100/80 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-600">
                      {underReviewCount}
                    </p>
                    <p className="text-xs text-muted-foreground">In Review</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100/80 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircleIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-orange-600">
                      {revisionRequiredCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Revision</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="border-b border-gray-100">
                  <TabsList className="w-full justify-start bg-transparent p-0 h-auto rounded-none">
                    <TabsTrigger
                      value="overview"
                      className="flex items-center space-x-2 rounded-none border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-6 py-4"
                    >
                      <BarChart3Icon className="w-4 h-4" />
                      <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="manuscripts"
                      className="flex items-center space-x-2 rounded-none border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-6 py-4"
                    >
                      <BookOpenIcon className="w-4 h-4" />
                      <span>Manuscripts</span>
                      {manuscripts.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {manuscripts.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="actions"
                      className="flex items-center space-x-2 rounded-none border-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-6 py-4"
                    >
                      <TrendingUpIcon className="w-4 h-4" />
                      <span>Actions</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="p-8 space-y-6">
                  {manuscripts.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-primary">
                        Recent Submissions
                      </h3>
                      <div className="space-y-3">
                        {manuscripts.slice(0, 5).map((manuscript) => (
                          <div
                            key={manuscript.id}
                            className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                {getStatusIcon(manuscript.status)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">
                                  {manuscript.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(
                                    manuscript.submissionDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {manuscript.reviewInfo && (
                                <div className="text-xs text-muted-foreground hidden sm:block">
                                  {manuscript.reviewInfo.reviewsCompleted}/
                                  {manuscript.reviewInfo.reviewsRequired}{" "}
                                  reviews
                                </div>
                              )}
                              <Badge
                                className={`${getStatusColor(
                                  manuscript.status
                                )} text-xs`}
                              >
                                {getStatusText(manuscript.status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        No Submissions Yet
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Start your academic journey by submitting your first
                        manuscript.
                      </p>
                      <Button
                        onClick={() => router.push("/submit-manuscript")}
                        size="lg"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Submit Your First Manuscript
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manuscripts" className="p-8">
                  {manuscripts.length === 0 ? (
                    <div className="text-center py-16">
                      <h3 className="text-xl font-semibold text-primary mb-2">
                        No Manuscripts Yet
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        You haven't submitted any manuscripts yet. Start by
                        submitting your first research paper.
                      </p>
                      <Button
                        onClick={() => router.push("/submit-manuscript")}
                        size="lg"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Submit Your First Manuscript
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {manuscripts.map((manuscript) => (
                        <div
                          key={manuscript.id}
                          className="border border-gray-200 rounded-xl p-6 bg-white/
                          50 hover:bg-white/80 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-primary truncate">
                                  {manuscript.title}
                                </h3>
                                <Badge
                                  className={`${getStatusColor(
                                    manuscript.status
                                  )} text-xs flex-shrink-0`}
                                >
                                  {getStatusIcon(manuscript.status)}
                                  <span className="ml-1">
                                    {getStatusText(manuscript.status)}
                                  </span>
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{manuscript.category.join(", ")}</span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      manuscript.submissionDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Review Progress */}
                          {manuscript.reviewInfo && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-primary">
                                  Review Progress
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {manuscript.reviewInfo.reviewsCompleted}/
                                  {manuscript.reviewInfo.reviewsRequired}{" "}
                                  Complete
                                </span>
                              </div>
                              <Progress
                                value={
                                  (manuscript.reviewInfo.reviewsCompleted /
                                    manuscript.reviewInfo.reviewsRequired) *
                                  100
                                }
                                className="h-2"
                              />
                            </div>
                          )}

                          {/* Abstract */}
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {manuscript.abstract}
                            </p>
                          </div>

                          {/* Keywords */}
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {manuscript.keywords
                                .slice(0, 4)
                                .map((keyword, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {keyword}
                                  </Badge>
                                ))}
                              {manuscript.keywords.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{manuscript.keywords.length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                            {manuscript.ipfsUrls?.manuscript && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    manuscript.ipfsUrls!.manuscript,
                                    "_blank"
                                  )
                                }
                              >
                                <EyeIcon className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                            {manuscript.status === "revision_required" && (
                              <Button size="sm">
                                <EditIcon className="h-3 w-3 mr-1" />
                                Revise
                              </Button>
                            )}
                            {manuscript.status === "published" &&
                              manuscript.ipfsUrls?.metadata && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      manuscript.ipfsUrls!.metadata!,
                                      "_blank"
                                    )
                                  }
                                >
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  Publication
                                </Button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        Quick Actions
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Manage your submissions and profile efficiently
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button
                        onClick={() => router.push("/submit-manuscript")}
                        className="h-20 flex-col space-y-2"
                        size="lg"
                      >
                        <PlusIcon className="h-5 w-5" />
                        <span>New Submission</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleRefreshStatus}
                        className="h-20 flex-col space-y-2 bg-transparent"
                        size="lg"
                      >
                        <RefreshCwIcon className="h-5 w-5" />
                        <span>Refresh Status</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/your-profile")}
                        className="h-20 flex-col space-y-2"
                        size="lg"
                      >
                        <EyeIcon className="h-5 w-5" />
                        <span>View Profile</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
