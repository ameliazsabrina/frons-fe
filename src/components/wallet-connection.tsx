"use client";
import React, { useState, useEffect } from "react";
import { useLoginWithEmail, usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  WalletIcon,
  LogOutIcon,
  CopyIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlusIcon,
} from "lucide-react";
import LoginWithEmail from "@/hooks/useLoginWithEmail";

export const WalletConnection = () => {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const { sendCode, loginWithCode } = useLoginWithEmail();

  const [copied, setCopied] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("Connected User");
  const [showEmailLogin, setShowEmailLogin] = useState(false);

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

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col gap-2">
        <Button onClick={login} variant="outline" className="text-sm">
          <WalletIcon className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
        <Button
          onClick={() => setShowEmailLogin(!showEmailLogin)}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          Login with Email
        </Button>
        {showEmailLogin && (
          <div className="mt-2 p-3 border rounded-lg bg-muted/50">
            <LoginWithEmail />
          </div>
        )}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <WalletIcon className="h-4 w-4" />
          {userDisplayName}
          <Badge variant="secondary" className="text-xs">
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
                      {wallet.chainId}
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
                    Wallets are created automatically when you log in. If you
                    don't see any wallets, try refreshing the page or logging
                    out and back in.
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    size="sm"
                    className="w-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Refresh Page
                  </Button>
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
