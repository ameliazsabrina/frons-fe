import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircleIcon, LoaderIcon } from "lucide-react";
import { type WalletBalances, type TokenBalance } from "@/hooks/useWalletBalances";

interface WalletPanelProps {
  walletBalances: WalletBalances;
}

export function WalletPanel({ walletBalances }: WalletPanelProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Wallet Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {walletBalances.isLoading ? (
            <div className="text-center py-4">
              <LoaderIcon className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading balances...
              </p>
            </div>
          ) : walletBalances.error ? (
            <div className="text-center py-4">
              <AlertCircleIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">{walletBalances.error}</p>
            </div>
          ) : (
            <>
              {/* SOL Balance */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">SOL</span>
                <span className="font-semibold">
                  {walletBalances.sol.toFixed(4)}
                </span>
              </div>

              {/* Token Balances */}
              {walletBalances.tokens.map((token: TokenBalance) => (
                <div
                  key={token.symbol}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    token.symbol === "FRONS"
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-medium text-sm ${
                        token.symbol === "FRONS" ? "text-primary" : ""
                      }`}
                    >
                      {token.symbol}
                    </span>
                    {token.symbol === "FRONS" && (
                      <Badge variant="secondary" className="text-xs">
                        Rewards
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold ${
                        token.symbol === "FRONS" ? "text-primary" : ""
                      }`}
                    >
                      {token.uiAmount.toLocaleString(undefined, {
                        maximumFractionDigits:
                          token.symbol === "USDCF" ? 2 : 4,
                      })}
                    </span>
                    {token.symbol === "USDCF" && (
                      <p className="text-xs text-muted-foreground">
                        ${token.uiAmount.toFixed(2)} USD
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}