"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { usePageReady } from "@/hooks/usePageReady";
import { useLoading } from "@/context/LoadingContext";
import {
  FileTextIcon,
  ClipboardCheckIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  EyeIcon,
  PlusIcon,
  BarChart3Icon,
  WalletIcon,
  CoinsIcon,
  ArrowRightIcon,
  StarIcon,
  TrendingUpIcon,
} from "lucide-react";
import axios from "axios";
import { useProgram } from "@/hooks/useProgram";
import { usePDAs } from "@/hooks/usePDAs";
import { PublicKey } from "@solana/web3.js";

interface ManuscriptStats {
  total: number;
  submitted: number;
  underReview: number;
  published: number;
  rejected: number;
  pendingReviews: number;
  readyForPublication: number;
}

interface UserStats {
  manuscriptsSubmitted: number;
  manuscriptsPublished: number;
  reviewsCompleted: number;
  fronsTokens: number;
  totalEarnings: number;
  reputationScore: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isPrimary?: boolean;
  badge?: string;
}

export default function OverviewPage() {
  const router = useRouter();
  const { user, primaryWallet } = useDynamicContext();
  const connected = !!user;
  const publicKey = primaryWallet?.address;

  const [isClient, setIsClient] = useState(false);
  const [program, setProgram] = useState<any>(null);
  const [pdas, setPdas] = useState<any>(null);

  const { program: solanaProgram } = useProgram();
  const { pdas: solanaPDAs } = usePDAs(
    publicKey ? new PublicKey(publicKey) : null
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && connected && publicKey) {
      setProgram(solanaProgram);
      setPdas(solanaPDAs);
    }
  }, [isClient, connected, publicKey, solanaProgram, solanaPDAs]);

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

  const { isReady, progress } = usePageReady({
    checkImages: false,
    checkFonts: true,
    checkData: true,
    minLoadTime: 600,
    maxLoadTime: 3000,
  });

  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsLoading(!isReady);
  }, [isReady, setIsLoading]);

  useEffect(() => {
    if (!connected || !publicKey) {
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
          `${apiUrl}/api/manuscripts/stats?authorWallet=${publicKey}`
        );

        if (manuscriptsResponse.data.success) {
          setManuscriptStats(manuscriptsResponse.data.stats);
        }

        const userResponse = await axios.get(
          `${apiUrl}/api/users/stats?wallet=${publicKey}`
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
  }, [connected, publicKey]);

  const quickActions: QuickAction[] = [
    {
      title: "Submit Manuscript",
      description: "Upload and submit a new research manuscript",
      icon: <PlusIcon className="h-5 w-5" />,
      href: "/submit-manuscript",
      isPrimary: true,
    },
    {
      title: "Review Manuscripts",
      description: "Review pending manuscripts and earn FRONS tokens",
      icon: <ClipboardCheckIcon className="h-5 w-5" />,
      href: "/review-manuscript",
      badge: `${manuscriptStats.pendingReviews} available`,
    },
    {
      title: "DOCI Tracker",
      description: "Track your published manuscripts and DOCI NFTs",
      icon: <BarChart3Icon className="h-5 w-5" />,
      href: "/doci-tracker",
    },
    {
      title: "Your Profile",
      description: "View and manage your academic profile",
      icon: <UsersIcon className="h-5 w-5" />,
      href: "/your-profile",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <FileTextIcon className="h-4 w-4" />;
      case "under_review":
        return <ClockIcon className="h-4 w-4" />;
      case "published":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "rejected":
        return <AlertCircleIcon className="h-4 w-4" />;
      case "pending_reviews":
        return <EyeIcon className="h-4 w-4" />;
      case "ready_for_publication":
        return <StarIcon className="h-4 w-4" />;
      default:
        return <FileTextIcon className="h-4 w-4" />;
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
          <Progress value={progress} className="w-64 mt-2" />
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex">
          <OverviewSidebar connected={false} />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <WalletIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-semibold mb-3">
                Connect Your Wallet
              </h1>
              <p className="text-muted-foreground mb-6">
                Connect your Solana wallet to view your overview and manage your
                manuscripts.
              </p>
              <Button onClick={() => router.push("/")}>Connect Wallet</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex">
          <OverviewSidebar connected={false} />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <OverviewSidebar connected={connected} />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-semibold mb-2">
                Welcome back, Researcher
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your academic publishing activity and
                FRONS token balance.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Card className="border-destructive">
                <CardContent className="p-6">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            FRONS Tokens
                          </p>
                          <p className="text-2xl font-semibold">
                            {userStats.fronsTokens.toLocaleString()}
                          </p>
                        </div>
                        <CoinsIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Total Earnings
                          </p>
                          <p className="text-2xl font-semibold">
                            ${userStats.totalEarnings.toFixed(2)}
                          </p>
                        </div>
                        <TrendingUpIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Published
                          </p>
                          <p className="text-2xl font-semibold">
                            {manuscriptStats.published}
                          </p>
                        </div>
                        <CheckCircleIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Reputation
                          </p>
                          <p className="text-2xl font-semibold">
                            {userStats.reputationScore}
                          </p>
                        </div>
                        <StarIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <Card
                        key={index}
                        className="group hover:shadow-md transition-all duration-200"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              {action.icon}
                            </div>
                            {action.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium mb-2">{action.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {action.description}
                          </p>
                          <Button
                            variant={action.isPrimary ? "default" : "outline"}
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <Link href={action.href}>
                              Get Started
                              <ArrowRightIcon className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Manuscript Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Statistics */}
                  <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">
                      Manuscript Statistics
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <FileTextIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-2xl font-semibold">
                            {manuscriptStats.total}
                          </p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <ClockIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-2xl font-semibold">
                            {manuscriptStats.underReview}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Under Review
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <CheckCircleIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-2xl font-semibold">
                            {manuscriptStats.published}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Published
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <ClipboardCheckIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-2xl font-semibold">
                            {userStats.reviewsCompleted}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Reviews
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Status Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Status Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(manuscriptStats)
                            .filter(
                              ([key, value]) => key !== "total" && value > 0
                            )
                            .map(([status, count]) => (
                              <div
                                key={status}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(status)}
                                    <span className="text-sm font-medium">
                                      {status
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                    </span>
                                  </div>
                                  <Badge variant="secondary">{count}</Badge>
                                </div>
                                <div className="w-24">
                                  <Progress
                                    value={
                                      (count / manuscriptStats.total) * 100
                                    }
                                    className="h-2"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Recent Activity
                    </h2>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Manuscript published successfully
                              </p>
                              <p className="text-xs text-muted-foreground">
                                "Blockchain Applications in Academic Publishing"
                                is now live
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                2 hours ago
                              </p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Earned 50 FRONS tokens
                              </p>
                              <p className="text-xs text-muted-foreground">
                                For completing a manuscript review
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                1 day ago
                              </p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Manuscript submitted for review
                              </p>
                              <p className="text-xs text-muted-foreground">
                                "AI in Scientific Research" is now under peer
                                review
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                3 days ago
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
