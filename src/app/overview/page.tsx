"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { usePageReady } from "@/hooks/usePageReady";
import { useLoading } from "@/context/LoadingContext";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProgram, isValidSolanaAddress } from "@/hooks/useProgram";
import { getPrimarySolanaWalletAddress } from "@/utils/wallet";
import { usePDAs } from "@/hooks/usePDAs";
import { PublicKey } from "@solana/web3.js";
import { useOverview } from "@/hooks/useOverview";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/ui/sidebar";
import { OverviewSidebar } from "@/components/overview-sidebar";
import {
  StatsOverview,
  QuickActions,
  WalletPanel,
  ReviewActivity,
  OverviewHeader,
} from "@/components/overview";

export default function OverviewPage() {
  const router = useRouter();
  const { user, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const connected = authenticated;
  const publicKey = getPrimarySolanaWalletAddress(wallets);
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;

  const { manuscriptStats, userStats, loading, error } = useOverview(
    connected,
    validSolanaPublicKey
  );
  const walletBalances = useWalletBalances(validSolanaPublicKey);
  const { toast } = useToast();

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

  // Show toast notification for errors
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error Loading Overview",
        description: error,
      });
    }
  }, [error, toast]);

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
      <div className="min-h-screen bg-white flex w-full">
        <Sidebar>
          <OverviewSidebar connected={connected} />
        </Sidebar>
        <div className="flex-1">
          <main className="flex-1">
            <div className="container max-w-full mx-auto py-8">
              {/* Header skeleton */}
              <div className="mb-8">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>

              {/* StatsOverview skeleton - 4 columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100/80 shadow-sm"
                  >
                    <div className="text-center space-y-2">
                      <Skeleton className="h-8 w-12 mx-auto" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                      <Skeleton className="h-3 w-20 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left column - QuickActions */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Quick Actions header */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-32" />
                  </div>

                  {/* QuickActions grid - 6 cards in 3 columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Card
                        key={i}
                        className={`group transition-all duration-200 ${
                          i === 0
                            ? "ring-2 ring-primary/20 bg-primary/5"
                            : "bg-white/80"
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-28" />
                            </div>
                            {i === 1 && <Skeleton className="h-5 w-16 ml-2" />}
                          </div>
                          <Skeleton className="h-9 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                  {/* WalletPanel skeleton */}
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <Skeleton className="h-5 w-28" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* SOL Balance */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-16" />
                        </div>

                        {/* Token balances */}
                        {[...Array(2)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              i === 0
                                ? "bg-primary/10 border border-primary/20"
                                : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Skeleton className="h-4 w-12" />
                              {i === 0 && <Skeleton className="h-4 w-12" />}
                            </div>
                            <div className="text-right space-y-1">
                              <Skeleton className="h-4 w-16" />
                              {i === 1 && <Skeleton className="h-3 w-12" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* ReviewActivity skeleton */}
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <Skeleton className="h-5 w-28" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-3">
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-8 mx-auto" />
                          <Skeleton className="h-4 w-24 mx-auto" />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28 mx-auto" />
                          <Skeleton className="h-5 w-32 mx-auto" />
                        </div>
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!connected || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
        <Sidebar>
          <OverviewSidebar connected={connected} />
        </Sidebar>
        <div className="flex-1">
          <div className="container max-w-full mx-auto py-8 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold text-primary mb-2 text-center">
              Authentication Required
            </h2>
            <p className="text-muted-foreground mb-4 text-sm text-center">
              Please connect your wallet to view your dashboard overview.
            </p>
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="flex items-center"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
      <Sidebar>
        <OverviewSidebar connected={connected} />
      </Sidebar>
      <div className="flex-1">
        <main className="flex-1">
          <div className="container max-w-full mx-auto py-8">
            {/* Header */}
            <OverviewHeader userName={getUserDisplayName(user)} />

            {loading ? (
              <div className="space-y-6">
                {/* Stats skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-5 rounded" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </Card>
                  ))}
                </div>
                {/* Quick actions skeleton */}
                <Card className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <PlusIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Unable to Load Overview
                  </h2>
                  <p className="text-gray-600">
                    There was an error loading your overview data. Please try
                    refreshing the page.
                  </p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Refresh Page
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Statistics Overview */}
                <StatsOverview
                  userStats={userStats}
                  manuscriptStats={manuscriptStats}
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Quick Actions
                      </h2>
                      <Button size="sm" asChild>
                        <Link href="/submit-manuscript">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          New Submission
                        </Link>
                      </Button>
                    </div>
                    <QuickActions manuscriptStats={manuscriptStats} />
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <WalletPanel walletBalances={walletBalances} />

                    {/* Review Summary */}
                    <ReviewActivity
                      manuscriptStats={manuscriptStats}
                      userStats={userStats}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
