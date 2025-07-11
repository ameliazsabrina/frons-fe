"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  BookOpenIcon,
  UsersIcon,
  CalendarIcon,
  BarChart3Icon,
  SendIcon,
  RefreshCwIcon,
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
      return "bg-green-100 text-green-800 border-green-200";
    case "accepted":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "under_review":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "revision_required":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "submitted":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "published":
      return <CheckCircleIcon className="h-4 w-4" />;
    case "accepted":
      return <CheckCircleIcon className="h-4 w-4" />;
    case "under_review":
      return <ClockIcon className="h-4 w-4" />;
    case "revision_required":
      return <AlertCircleIcon className="h-4 w-4" />;
    case "rejected":
      return <XCircleIcon className="h-4 w-4" />;
    case "submitted":
      return <SendIcon className="h-4 w-4" />;
    default:
      return <FileTextIcon className="h-4 w-4" />;
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
        <div className="min-h-screen bg-primary/5 flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4">
                <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2">
                  <BarChart3Icon className="h-5 w-5 text-primary" />
                  <span className="font-medium text-primary">
                    Author Dashboard
                  </span>
                </div>
              </div>
            </div>
            <div className="container max-w-5xl mx-auto px-6 py-12">
              <div className="mb-12 text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 font-spectral font-bold tracking-tight">
                  Author Dashboard
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                  Track your manuscript submissions and publication progress
                </p>
              </div>
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <UsersIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary">
                    Authentication Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  <p className="text-muted-foreground mb-8 text-center text-lg">
                    Please connect your wallet to access your author dashboard.
                  </p>
                  <div className="flex justify-center">
                    <WalletConnection />
                  </div>
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
          <div className="container max-w-7xl mx-auto px-6 py-12">
            <div className="mb-12 text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 font-spectral font-bold tracking-tight">
                Author Dashboard
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                Track your manuscript submissions and publication progress
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileTextIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {totalManuscripts}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        Total Submissions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {publishedCount}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        Published
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {underReviewCount}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        Under Review
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <AlertCircleIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {revisionRequiredCount}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        Needs Revision
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-12">
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardHeader className="border-b border-gray-100/50 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <TrendingUpIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-primary font-bold">
                          Quick Actions
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          Manage your submissions efficiently
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => router.push("/submit-manuscript")}
                      className="h-16 text-lg font-semibold"
                      size="lg"
                    >
                      <SendIcon className="h-5 w-5 mr-2" />
                      Submit New Manuscript
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRefreshStatus}
                      className="h-16 text-lg font-semibold hover:bg-primary/10 border-primary/30"
                      size="lg"
                    >
                      <RefreshCwIcon className="h-5 w-5 mr-2" />
                      Refresh Status
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/your-profile")}
                      className="h-16 text-lg font-semibold hover:bg-primary/10 border-primary/30"
                      size="lg"
                    >
                      <EyeIcon className="h-5 w-5 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Manuscripts List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-primary">
                  Your Manuscripts
                </h2>
                <Badge variant="outline" className="text-base px-4 py-2">
                  {manuscripts.length} Total
                </Badge>
              </div>

              {manuscripts.length === 0 ? (
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                  <CardContent className="py-16 text-center">
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      No Manuscripts Yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      You haven&apos;t submitted any manuscripts yet. Start by
                      submitting your first research paper.
                    </p>
                    <Button
                      onClick={() => router.push("/submit-manuscript")}
                      size="lg"
                    >
                      Submit Your First Manuscript
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {manuscripts.map((manuscript) => (
                    <Card
                      key={manuscript.id}
                      className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300"
                    >
                      <CardHeader className="border-b border-gray-100/50 pb-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-primary leading-tight">
                                {manuscript.title}
                              </h3>
                              <Badge
                                className={`${getStatusColor(
                                  manuscript.status
                                )} font-medium`}
                              >
                                {getStatusIcon(manuscript.status)}
                                <span className="ml-1">
                                  {getStatusText(manuscript.status)}
                                </span>
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">
                              {manuscript.category.join(", ")}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="h-4 w-4" />
                                <span>
                                  Submitted{" "}
                                  {new Date(
                                    manuscript.submissionDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {manuscript.reviewInfo && (
                                <div className="flex items-center space-x-1">
                                  <UsersIcon className="h-4 w-4" />
                                  <span>
                                    {manuscript.reviewInfo.reviewsCompleted}/
                                    {manuscript.reviewInfo.reviewsRequired}{" "}
                                    Reviews Completed
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-6">
                          {/* Review Progress */}
                          {manuscript.reviewInfo && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-primary">
                                  Peer Review Progress
                                </h4>
                                <span className="text-sm font-medium text-primary">
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
                                className="w-full h-3 rounded-full bg-primary/10"
                              />
                              <div className="grid grid-cols-3 gap-2">
                                {Array.from(
                                  {
                                    length:
                                      manuscript.reviewInfo.reviewsRequired,
                                  },
                                  (_, index) => (
                                    <div
                                      key={index}
                                      className={`p-3 rounded-lg text-center text-sm font-medium ${
                                        index <
                                        manuscript.reviewInfo!.reviewsCompleted
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : "bg-gray-100 text-gray-600 border border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-center space-x-1">
                                        {index <
                                        manuscript.reviewInfo!
                                          .reviewsCompleted ? (
                                          <CheckCircleIcon className="h-4 w-4" />
                                        ) : (
                                          <ClockIcon className="h-4 w-4" />
                                        )}
                                        <span>Reviewer {index + 1}</span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Abstract */}
                          <div className="space-y-2">
                            <h4 className="text-base font-semibold text-primary">
                              Abstract
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">
                              {manuscript.abstract}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-base font-semibold text-primary">
                              Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {manuscript.keywords.map((keyword, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-sm"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                            {manuscript.ipfsUrls?.manuscript && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-primary/10 border-primary/30 bg-transparent"
                                onClick={() =>
                                  window.open(
                                    manuscript.ipfsUrls!.manuscript,
                                    "_blank"
                                  )
                                }
                              >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Manuscript
                              </Button>
                            )}
                            {manuscript.status === "revision_required" && (
                              <Button size="sm">
                                <FileTextIcon className="h-4 w-4 mr-2" />
                                Submit Revision
                              </Button>
                            )}
                            {manuscript.status === "published" &&
                              manuscript.ipfsUrls?.metadata && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-green-50 border-green-200 bg-transparent"
                                  onClick={() =>
                                    window.open(
                                      manuscript.ipfsUrls!.metadata!,
                                      "_blank"
                                    )
                                  }
                                >
                                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                                  View Publication
                                </Button>
                              )}
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
      </div>
    </SidebarProvider>
  );
}
