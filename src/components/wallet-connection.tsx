"use client";
import React, { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useWalletManager } from "@/hooks/useDynamicWaas";
import { ChainEnum } from "@dynamic-labs/sdk-api-core";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  WalletIcon,
  PlusIcon,
  KeyIcon,
  LogOutIcon,
  CopyIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LoaderIcon,
} from "lucide-react";

export const WalletConnection = () => {
  const { user, handleLogOut, setShowAuthFlow } = useDynamicContext();
  const {
    createWalletAccount,
    importPrivateKey,
    dynamicWaasIsEnabled,
    solWallets,
  } = useWalletManager();

  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [copied, setCopied] = useState(false);

  const connected = !!user;

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);
      await createWalletAccount([ChainEnum.Sol]);
    } catch (error: any) {
      console.error("Failed to create wallet:", error);
      alert(`Failed to create wallet: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportKey = async () => {
    if (!privateKey.trim()) {
      alert("Please enter a private key");
      return;
    }

    try {
      setIsImporting(true);
      await importPrivateKey(ChainEnum.Sol, privateKey.trim());
      setPrivateKey("");
      setShowImport(false);
    } catch (error: any) {
      console.error("Failed to import private key:", error);
      alert(`Failed to import private key: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

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
      <Button
        variant="default"
        className="text-sm"
        size="sm"
        onClick={() => setShowAuthFlow(true)}
      >
        Get Started
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <WalletIcon className="h-4 w-4" />
          {solWallets.length > 0 ? (
            <>
              <span className="hidden sm:inline">
                {solWallets[0].address.slice(0, 4)}...
                {solWallets[0].address.slice(-4)}
              </span>
              <Badge variant="secondary" className="text-xs">
                {solWallets.length}
              </Badge>
            </>
          ) : (
            <span>No Wallet</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <WalletIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {user?.email || user?.username || "Connected User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {solWallets.length > 0 ? "Wallet Connected" : "No Wallet"}
              </p>
            </div>
          </div>

          <Separator />

          {!dynamicWaasIsEnabled ? (
            <Card className="border-destructive/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircleIcon className="h-4 w-4 text-destructive" />
                  WaaS Not Enabled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Dynamic WaaS is not enabled in your project settings.
                </p>
              </CardContent>
            </Card>
          ) : solWallets.length === 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Create Wallet</CardTitle>
                <CardDescription className="text-xs">
                  Set up your Solana wallet to start using the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleCreateWallet}
                  disabled={isCreating}
                  className="w-full"
                  size="sm"
                >
                  {isCreating ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create New Wallet
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                {!showImport ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowImport(true)}
                    className="w-full"
                    size="sm"
                  >
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Import Private Key
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="privateKey" className="text-xs">
                        Solana Private Key
                      </Label>
                      <Input
                        id="privateKey"
                        type="password"
                        placeholder="Enter your private key"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleImportKey}
                        disabled={isImporting || !privateKey.trim()}
                        className="flex-1"
                        size="sm"
                      >
                        {isImporting ? (
                          <>
                            <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          "Import"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowImport(false);
                          setPrivateKey("");
                        }}
                        className="flex-1"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Your Wallets</CardTitle>
                <CardDescription className="text-xs">
                  Manage your Solana wallets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {solWallets.map((wallet, index) => (
                  <div
                    key={wallet.address}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono truncate">
                        {wallet.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Solana Wallet {index + 1}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyAddress(wallet.address)}
                      className="ml-2"
                    >
                      {copied ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleLogOut}
              className="flex-1"
              size="sm"
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
