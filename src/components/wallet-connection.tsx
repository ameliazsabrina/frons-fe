"use client";
import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
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

export const WalletConnection = () => {
  const { login, logout, authenticated, user, ready, createWallet } =
    usePrivy();
  const { wallets } = useWallets();

  const [copied, setCopied] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("Connected User");
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletCreationError, setWalletCreationError] = useState<string | null>(
    null
  );

  const connected = authenticated;

  useEffect(() => {
    if (user) {
      if (user.email && typeof user.email === "object" && user.email.address) {
        setUserDisplayName(user.email.address);
      } else if (typeof user.email === "string") {
        setUserDisplayName(user.email);
      } else if (user.id) {
        setUserDisplayName(`User ${user.id.slice(0, 8)}`);
      }
    }
  }, [user]);

  useEffect(() => {
    if (authenticated && wallets.length === 0 && !isCreatingWallet) {
      handleCreateWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, wallets.length]);

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
      setWalletCreationError("Failed to create wallet. Please try again.");
    } finally {
      setIsCreatingWallet(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center gap-2">
        <LoaderIcon className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!connected) {
    return (
      <Button onClick={login} className="text-sm  ">
        Get Started
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <p className="text-xs">{userDisplayName}</p>
          <Badge variant="secondary" className="text-xs ">
            {wallets.length > 0
              ? `${wallets.length} Wallet${wallets.length > 1 ? "s" : ""}`
              : "No Wallet"}
          </Badge>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <WalletIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{userDisplayName}</p>
              <p className="text-xs text-muted-foreground">
                {wallets.length > 0
                  ? `${wallets.length} Wallet${
                      wallets.length > 1 ? "s" : ""
                    } Connected`
                  : "No Wallet"}
              </p>
            </div>
          </div>

          <Separator />

          {wallets.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Your Wallets</h4>
              {wallets.map((wallet, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-mono">
                      {wallet.address.slice(0, 6)}...
                      {wallet.address.slice(-4)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Solana
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyAddress(wallet.address)}
                  >
                    {copied ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">No Wallets</h4>
              <Card className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
                    No Embedded Wallets
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
                      Create Wallet
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
            onClick={logout}
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
