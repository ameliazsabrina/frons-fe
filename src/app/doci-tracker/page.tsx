"use client";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SearchIcon,
  ScanIcon,
  ClipboardIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  FileTextIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DOCIManuscript } from "@/types/fronsciers";
import { isValidSolanaAddress } from "@/hooks/useProgram";

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

export default function DocisPage() {
  const { authenticated: connected } = usePrivy();
  const { wallets } = useWallets();
  const publicKey = wallets[0]?.address;
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manuscripts, setManuscripts] = useState<DOCIManuscript[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showToast("Please enter a search term", "error");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Searching for DOCI:", searchQuery);

      // TODO: Implement DOCI search functionality
      // For now, show a placeholder message
      showToast("DOCI search functionality is coming soon!", "info");

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error("DOCI search error:", error);
      setError("Failed to search DOCI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setSearchQuery(text.trim());
        showToast("DOCI ID pasted from clipboard", "success");
      } else {
        showToast("Clipboard is empty", "error");
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      showToast("Failed to read from clipboard", "error");
    }
  };

  const handleScanQR = () => {
    // TODO: Implement QR code scanning
    showToast("QR code scanning functionality is coming soon!", "info");
  };

  const handleExampleSearch = (example: string) => {
    setSearchQuery(example);
    showToast(`Example search "${example}" selected`, "info");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-primary/5 flex w-full">
        <OverviewSidebar connected={connected} />
        <SidebarInset className="flex-1">
          <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2 px-4 py-3">
              <SidebarTrigger className="w-10 h-10" />
              <Separator orientation="vertical" className="h-6" />
            </div>
          </div>
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral  font-bold tracking-tight">
                DOCI Tracker
              </h1>
              <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                Track and manage your Digital Object Certification Identifiers
                (DOCIs)
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-8 text-center">
                  <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-primary mb-2">
                    Error
                  </h2>
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            ) : manuscripts.length === 0 ? (
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-8 text-center">
                  <FileTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-primary mb-2">
                    No DOCIs Found
                  </h2>
                  <p className="text-muted-foreground">
                    You haven't minted any DOCIs for your manuscripts yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {manuscripts.map((manuscript) => (
                  <Card
                    key={manuscript.doci}
                    className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <h3 className="font-medium text-primary leading-tight">
                              DOCI: {manuscript.doci}
                            </h3>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary text-xs"
                              >
                                Citations: {manuscript.citationCount}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary text-xs"
                              >
                                Access: {manuscript.accessCount}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Version: {manuscript.version}</p>
                            <p>
                              Published:{" "}
                              {formatDate(manuscript.publicationDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(manuscript.metadataUri, "_blank")
                            }
                            className="text-xs"
                          >
                            <ExternalLinkIcon className="h-3 w-3 mr-1" />
                            View Metadata
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                `https://explorer.solana.com/address/${manuscript.mintAddress}?cluster=devnet`,
                                "_blank"
                              )
                            }
                            className="text-xs"
                          >
                            <ExternalLinkIcon className="h-3 w-3 mr-1" />
                            View NFT
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
