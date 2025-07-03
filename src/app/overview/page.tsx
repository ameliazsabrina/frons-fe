"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePageReady } from "@/hooks/usePageReady";
import { useLoading } from "@/context/LoadingContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  ClipboardCheckIcon,
  PlusIcon,
  WalletIcon,
  CoinsIcon,
  TrendingUpIcon,
  BookOpenIcon,
  Users2Icon,
  VoteIcon,
  AwardIcon,
  ArrowUpRight,
} from "lucide-react";
import { useProgram } from "@/hooks/useProgram";
import { usePDAs } from "@/hooks/usePDAs";
import { PublicKey } from "@solana/web3.js";
import { useOverview, ManuscriptStats, UserStats } from "@/hooks/useOverview";
import { Loading } from "@/components/ui/loading";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isPrimary?: boolean;
  badge?: string;
}

function isValidSolanaAddress(address: string | undefined): boolean {
  if (!address) return false;
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export default function OverviewPage() {
  const router = useRouter();
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const connected = authenticated;
  const publicKey = wallets[0]?.address;
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;

  const { manuscriptStats, userStats, loading, error } = useOverview(
    connected,
    validSolanaPublicKey
  );

  const [isClient, setIsClient] = useState(false);
  const [program, setProgram] = useState<any>(null);
  const [pdas, setPdas] = useState<any>(null);

  const { program: solanaProgram } = useProgram();
  const { pdas: solanaPDAs } = usePDAs(
    validSolanaPublicKey ? new PublicKey(validSolanaPublicKey) : undefined
  );

  const { isReady, progress } = usePageReady({
    checkImages: false,
    checkFonts: true,
    checkData: true,
    minLoadTime: 600,
    maxLoadTime: 3000,
  });

  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && connected && validSolanaPublicKey) {
      setProgram(solanaProgram);
      setPdas(solanaPDAs);
    }
  }, [isClient, connected, validSolanaPublicKey, solanaProgram, solanaPDAs]);

  useEffect(() => {
    setIsLoading(!isReady);
  }, [isReady, setIsLoading]);

  function StatsOverview({
    manuscriptStats,
    userStats,
  }: {
    manuscriptStats: ManuscriptStats;
    userStats: UserStats;
  }) {
    const stats = [
      {
        title: "Published Papers",
        value: manuscriptStats.published,
        icon: <BookOpenIcon className="h-6 w-6" />,
        description: "Successfully published manuscripts",
        trend: "+2 this month",
      },
      {
        title: "Pending Reviews",
        value: manuscriptStats.pendingReviews,
        icon: <ClipboardCheckIcon className="h-6 w-6" />,
        description: "Manuscripts awaiting review",
        trend: "5 due this week",
      },
      {
        title: "DOCI Minted",
        value: manuscriptStats.published,
        icon: <AwardIcon className="h-6 w-6" />,
        description: "NFT certificates issued",
        trend: "Latest 2 days ago",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            <CardContent className="p-8 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
              <div className="flex flex-col items-center gap-4">
                <div className="p-3.5 rounded-xl bg-primary/5 ring-1 ring-primary/20">
                  {stat.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-4xl font-semibold tracking-tight mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {stat.description}
                  </p>
                  <Badge className="text-xs text-primary/80 font-medium mt-2">
                    {stat.trend}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function QuickActions({
    manuscriptStats,
  }: {
    manuscriptStats: ManuscriptStats;
  }) {
    const quickActions: QuickAction[] = [
      {
        title: "Submit Manuscript",
        description: "Upload and submit a new research manuscript",
        icon: <PlusIcon className="h-5 w-5" />,
        href: "/submit-manuscript",
      },
      {
        title: "Research Trends",
        description: "Explore trending research topics and analytics",
        icon: <TrendingUpIcon className="h-5 w-5" />,
        href: "/research-trends",
        isPrimary: true,
      },
      {
        title: "Find Reviews",
        description: "Browse manuscripts available for review",
        icon: <ClipboardCheckIcon className="h-5 w-5" />,
        href: "/review-manuscript",
        badge: `${manuscriptStats.pendingReviews} available`,
      },
      {
        title: "Mint DOCI",
        description: "Create NFT certificates for your research",
        icon: <AwardIcon className="h-5 w-5" />,
        href: "/doci-tracker",
      },
      {
        title: "Researcher Profiles",
        description: "Connect with other researchers",
        icon: <Users2Icon className="h-5 w-5" />,
        href: "/researcher-profiles",
      },
      {
        title: "DAO Proposals",
        description: "Vote on community proposals",
        icon: <VoteIcon className="h-5 w-5" />,
        href: "/dao-proposals",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className={`group hover:shadow-lg transition-all duration-200 relative overflow-hidden ${
              action.isPrimary ? "ring-2 ring-primary/20 " : ""
            }`}
          >
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                action.isPrimary
                  ? "from-primary via-primary/50 to-transparent"
                  : "from-primary/20 via-primary/10 to-transparent"
              }`}
            />
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center mb-6">
                <div
                  className={`p-3.5 rounded-xl ${
                    action.isPrimary
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/5"
                  } group-hover:bg-primary group-hover:text-primary-foreground transition-colors ring-1 ring-primary/20`}
                >
                  {action.icon}
                </div>
                {action.badge && (
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium mt-3"
                  >
                    {action.badge}
                  </Badge>
                )}
              </div>
              <h3 className="font-medium mb-2 text-lg">{action.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                {action.description}
              </p>
              <Button
                variant={action.isPrimary ? "default" : "outline"}
                size="sm"
                className="w-full group-hover:translate-y-0 translate-y-1 transition-transform"
                asChild
              >
                <Link href={action.href}>
                  <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function SidePanel({
    userStats,
    manuscriptStats,
  }: {
    userStats: UserStats;
    manuscriptStats: ManuscriptStats;
  }) {
    return (
      <div className="space-y-6 sticky top-8">
        <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2">
              <CoinsIcon className="h-5 w-5 text-primary" />
              FRONS Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <div>
                <p className="text-3xl font-semibold tracking-tight mb-2">
                  {userStats.fronsTokens.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total earnings: ${userStats.totalEarnings.toFixed(2)}
                </p>
              </div>
              <Separator className="opacity-30" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Recent Activity</p>
                <Badge
                  className="text-sm text-muted-foreground"
                  variant="secondary"
                >
                  +50 FRONS from completed review
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2">
              <ClipboardCheckIcon className="h-5 w-5 text-primary" />
              Reviews Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <div>
                <p className="text-3xl font-semibold tracking-tight mb-2">
                  {manuscriptStats.pendingReviews}
                </p>
                <p className="text-sm text-muted-foreground">
                  Manuscripts awaiting review
                </p>
              </div>
              <Separator className="opacity-30" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Your Review Stats</p>
                <Badge
                  className="text-sm text-muted-foreground"
                  variant="outline"
                >
                  {userStats.reviewsCompleted} reviews completed
                </Badge>
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/review-manuscript">
                  Find Reviews
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUserDisplayName = (user: any) => {
    if (!user) return "User";

    const emailAccount = user.linkedAccounts?.find(
      (account: any) => account.type === "email"
    );

    if (emailAccount?.address) {
      return emailAccount.address.split("@")[0];
    }

    const googleAccount = user.linkedAccounts?.find(
      (account: any) => account.type === "google_oauth"
    );
    if (googleAccount?.email) {
      return googleAccount.email.split("@")[0];
    }

    return "User";
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-primary/5 flex items-center justify-center mt-20">
        <div className="text-center">
          <Loading />
        </div>
      </div>
    );
  }

  if (!connected || !isClient) {
    return (
      <div className="min-h-screen bg-primary/5">
        <div className="w-full py-12 space-y-12 lg:px-16 px-4">
          <Alert variant="destructive" className="max-w-xl mx-auto">
            <AlertDescription className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5" />
                Please connect your wallet to view your overview
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
              >
                Connect Wallet
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/5 flex items-center justify-center">
      <div className="w-full py-12 space-y-12 lg:px-16 px-4">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-spectral font-semibold text-primary tracking-tight">
            Welcome back, {getUserDisplayName(user)}
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-3xl mx-auto">
            Here's an overview of your academic publishing activity and FRONS
            token balance.
          </p>
          <Separator className="max-w-full mx-auto" />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : error ? (
          <Card className="border-destructive mx-4">
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12 max-w-[1400px] mx-auto">
            <StatsOverview
              userStats={userStats}
              manuscriptStats={manuscriptStats}
            />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="p-8 bg-primary/10 rounded-xl space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Quick Actions</h2>
                    <Badge
                      variant="secondary"
                      className="px-2 py-1.5 text-xs ml-2"
                    >
                      {manuscriptStats.pendingReviews} reviews available
                    </Badge>
                  </div>
                  <QuickActions manuscriptStats={manuscriptStats} />
                </div>
              </div>
              <div>
                <SidePanel
                  userStats={userStats}
                  manuscriptStats={manuscriptStats}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
