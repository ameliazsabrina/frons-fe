"use client";

import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPrivyPage() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading Privy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          Privy Integration Test
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Authenticated:</span>
              <span
                className={`font-mono ${
                  authenticated ? "text-green-600" : "text-red-600"
                }`}
              >
                {authenticated ? "Yes" : "No"}
              </span>
            </div>

            {user && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>User ID:</span>
                  <span className="font-mono text-sm">{user.id}</span>
                </div>
                {user.email && (
                  <div className="flex items-center justify-between">
                    <span>Email:</span>
                    <span className="font-mono text-sm">
                      {user.email.address}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Number of Wallets:</span>
                <span className="font-mono">{wallets.length}</span>
              </div>

              {wallets.map((wallet, index) => (
                <div key={index} className="p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Chain ID: {wallet.chainId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          {!authenticated ? (
            <Button onClick={login} size="lg">
              Connect with Privy
            </Button>
          ) : (
            <Button onClick={logout} variant="outline" size="lg">
              Disconnect
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>PRIVY_API_KEY:</span>
                <span className="font-mono text-sm">
                  {process.env.NEXT_PUBLIC_PRIVY_API_KEY ? "Set" : "Not Set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>PRIVY_APP_SECRET:</span>
                <span className="font-mono text-sm">
                  {process.env.PRIVY_APP_SECRET ? "Set" : "Not Set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
