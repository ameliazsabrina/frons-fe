"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePageReady } from "@/hooks/usePageReady";
import { useLoading } from "@/context/LoadingContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusIcon } from "lucide-react";
import { useProgram, isValidSolanaAddress } from "@/hooks/useProgram";
import { getPrimaryWalletAddress } from "@/utils/wallet";
import { usePDAs } from "@/hooks/usePDAs";
import { PublicKey } from "@solana/web3.js";
import { useOverview } from "@/hooks/useOverview";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { Loading } from "@/components/ui/loading";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
  const { wallets } = useWallets();
  const connected = authenticated;
  const publicKey = getPrimaryWalletAddress(wallets);
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;

  const { manuscriptStats, userStats, loading, error } = useOverview(
    connected,
    validSolanaPublicKey
  );
  const walletBalances = useWalletBalances(validSolanaPublicKey);

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
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <Loading />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!connected || !isClient) {
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
                  <span className="font-medium text-primary">Overview</span>
                </div>
              </div>
            </div>
            <div className="container max-w-4xl mx-auto px-6 py-8">
              <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-semibold text-primary mb-4">
                    Authentication Required
                  </h2>
                  <p className="text-muted-foreground mb-8 text-lg">
                    Please connect your wallet to view your dashboard overview.
                  </p>
                  <Button onClick={() => router.push("/")} size="lg">
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
        <OverviewSidebar connected={connected} />
        <SidebarInset className="flex-1">
          <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4">
              <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-primary">Overview</span>
              </div>
            </div>
          </div>
          <main className="flex-1">
            <div className="container max-w-6xl mx-auto px-6 py-8">
              {/* Header */}
              <OverviewHeader userName={getUserDisplayName(user)} />

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loading />
                </div>
              ) : error ? (
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
