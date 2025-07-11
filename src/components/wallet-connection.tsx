"use client";
import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  WalletIcon,
  LogOutIcon,
  CopyIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlusIcon,
  LoaderIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getPrimaryWallet } from "@/utils/wallet";

export const WalletConnection = () => {
  const {
    login,
    logout,
    authenticated,
    user,
    ready: privyReady,
    createWallet,
  } = usePrivy();
  const { wallets, ready: walletsReady } = useSolanaWallets();
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("Connected User");
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletCreationError, setWalletCreationError] = useState<string | null>(
    null
  );

  const solanaWallet = getPrimaryWallet(wallets);
  const connected = authenticated && walletsReady && wallets.length > 0;

  useEffect(() => {
    if (user) {
      const emailAccount = user.linkedAccounts?.find(
        (account) => account.type === "email"
      );
      if (emailAccount && "address" in emailAccount) {
        setUserDisplayName(emailAccount.address);
      } else if (
        user.email &&
        typeof user.email === "object" &&
        "address" in user.email
      ) {
        setUserDisplayName(user.email.address);
      } else if (typeof user.email === "string") {
        setUserDisplayName(user.email);
      } else if (user.google?.email) {
        setUserDisplayName(user.google.email);
      } else if (user.id) {
        setUserDisplayName(`User ${user.id.slice(-8)}`);
      }
    }
  }, [user]);

  useEffect(() => {
    if (
      authenticated &&
      walletsReady &&
      wallets.length === 0 &&
      !isCreatingWallet
    ) {
      handleCreateWallet();
    }
  }, [authenticated, walletsReady, wallets.length, isCreatingWallet]);

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const handleCreateWallet = async () => {
    if (!createWallet) {
      setWalletCreationError("Wallet creation not available");
      return;
    }
    setIsCreatingWallet(true);
    setWalletCreationError(null);
    try {
      await createWallet();
    } catch (error) {
      setWalletCreationError(
        "Failed to create Solana wallet. Please try again."
      );
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleLogout = async () => {
    if (solanaWallet) {
      try {
        await logout();
        router.push("/");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    } else {
      await logout();
      router.push("/");
    }
  };

  if (!privyReady || !walletsReady) {
    return (
      <div className="flex items-center gap-2">
        <LoaderIcon className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!connected) {
    return (
      <Button onClick={login} className="text-sm">
        Get Started
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <p className="text-xs">{userDisplayName}</p>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <WalletIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">{userDisplayName}</p>
              <p className="text-[10px] text-muted-foreground">
                {solanaWallet ? " Wallet Connected" : "No Wallet"}
              </p>
            </div>
          </div>

          <Separator />

          {solanaWallet ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Your Solana Wallet</h4>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-mono">
                    {solanaWallet.address.slice(0, 6)}...
                    {solanaWallet.address.slice(-4)}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {solanaWallet.walletClientType === "privy"
                      ? "Embedded"
                      : "External"}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyAddress(solanaWallet.address)}
                >
                  {copied ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">No Solana Wallet</h4>
              <Card className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
                    No Solana Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    A Solana wallet should be created automatically when you log
                    in. If you don&apos;t see a wallet, try creating one
                    manually.
                  </p>
                  {walletCreationError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      {walletCreationError}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateWallet}
                      disabled={isCreatingWallet}
                      size="sm"
                      className="flex-1"
                    >
                      {isCreatingWallet ? (
                        <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <PlusIcon className="h-4 w-4 mr-2" />
                      )}
                      Create Solana Wallet
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCwIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator />

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-destructive hover:text-destructive"
          >
            <LogOutIcon className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
