"use client";
import React, { useState, useEffect } from "react";
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
import { PublicKey } from "@solana/web3.js";

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

  // Generate mock DOCI data for demo purposes (client-side only)
  const generateMockDOCIs = (): DOCIManuscript[] => {
    if (typeof window === "undefined") return []; // Prevent SSR issues

    try {
      return [
        {
          doci: "10.fronsciers/manuscript.2024.001.v1",
          manuscriptAccount: new PublicKey("11111111111111111111111111111111"),
          mintAddress: new PublicKey("22222222222222222222222222222222"),
          manuscriptHash: Array.from({ length: 32 }, (_, i) => i),
          authors: [new PublicKey("33333333333333333333333333333333")],
          peerReviewers: [
            new PublicKey("44444444444444444444444444444444"),
            new PublicKey("55555555555555555555555555555555"),
            new PublicKey("66666666666666666666666666666666"),
          ],
          publicationDate: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
          version: 1,
          citationCount: 23,
          accessCount: 156,
          metadataUri:
            "https://ipfs.io/ipfs/QmX7Y8Z9A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6",
          royaltyConfig: {
            authorsShare: 70,
            platformShare: 20,
            reviewersShare: 10,
          },
          bump: 255,
        },
        {
          doci: "10.fronsciers/manuscript.2024.002.v2",
          manuscriptAccount: new PublicKey("77777777777777777777777777777777"),
          mintAddress: new PublicKey("88888888888888888888888888888888"),
          manuscriptHash: Array.from({ length: 32 }, (_, i) => i + 32),
          authors: [
            new PublicKey("99999999999999999999999999999999"),
            new PublicKey("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),
          ],
          peerReviewers: [
            new PublicKey("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"),
            new PublicKey("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC"),
            new PublicKey("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"),
          ],
          publicationDate: Math.floor(Date.now() / 1000) - 86400 * 15, // 15 days ago
          version: 2,
          citationCount: 45,
          accessCount: 289,
          metadataUri:
            "https://ipfs.io/ipfs/QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0",
          royaltyConfig: {
            authorsShare: 70,
            platformShare: 20,
            reviewersShare: 10,
          },
          bump: 254,
        },
        {
          doci: "10.fronsciers/manuscript.2024.003.v1",
          manuscriptAccount: new PublicKey(
            "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"
          ),
          mintAddress: new PublicKey("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"),
          manuscriptHash: Array.from({ length: 32 }, (_, i) => i + 64),
          authors: [new PublicKey("1111111111111111111111111111111112")],
          peerReviewers: [
            new PublicKey("1111111111111111111111111111111113"),
            new PublicKey("1111111111111111111111111111111114"),
            new PublicKey("1111111111111111111111111111111115"),
            new PublicKey("1111111111111111111111111111111116"),
          ],
          publicationDate: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
          version: 1,
          citationCount: 12,
          accessCount: 78,
          metadataUri:
            "https://ipfs.io/ipfs/QmB2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1",
          royaltyConfig: {
            authorsShare: 70,
            platformShare: 20,
            reviewersShare: 10,
          },
          bump: 253,
        },
        {
          doci: "10.fronsciers/manuscript.2024.004.v1",
          manuscriptAccount: new PublicKey(
            "1111111111111111111111111111111117"
          ),
          mintAddress: new PublicKey("1111111111111111111111111111111118"),
          manuscriptHash: Array.from({ length: 32 }, (_, i) => i + 96),
          authors: [
            new PublicKey("1111111111111111111111111111111119"),
            new PublicKey("111111111111111111111111111111111A"),
            new PublicKey("111111111111111111111111111111111B"),
          ],
          peerReviewers: [
            new PublicKey("111111111111111111111111111111111C"),
            new PublicKey("111111111111111111111111111111111D"),
            new PublicKey("111111111111111111111111111111111E"),
          ],
          publicationDate: Math.floor(Date.now() / 1000) - 86400 * 3, // 3 days ago
          version: 1,
          citationCount: 8,
          accessCount: 34,
          metadataUri:
            "https://ipfs.io/ipfs/QmC3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2",
          royaltyConfig: {
            authorsShare: 70,
            platformShare: 20,
            reviewersShare: 10,
          },
          bump: 252,
        },
        {
          doci: "10.fronsciers/manuscript.2024.005.v3",
          manuscriptAccount: new PublicKey(
            "111111111111111111111111111111111F"
          ),
          mintAddress: new PublicKey("1111111111111111111111111111111120"),
          manuscriptHash: Array.from({ length: 32 }, (_, i) => i + 128),
          authors: [new PublicKey("1111111111111111111111111111111121")],
          peerReviewers: [
            new PublicKey("1111111111111111111111111111111122"),
            new PublicKey("1111111111111111111111111111111123"),
            new PublicKey("1111111111111111111111111111111124"),
            new PublicKey("1111111111111111111111111111111125"),
            new PublicKey("1111111111111111111111111111111126"),
          ],
          publicationDate: Math.floor(Date.now() / 1000) - 86400 * 1, // 1 day ago
          version: 3,
          citationCount: 67,
          accessCount: 412,
          metadataUri:
            "https://ipfs.io/ipfs/QmD4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3",
          royaltyConfig: {
            authorsShare: 70,
            platformShare: 20,
            reviewersShare: 10,
          },
          bump: 251,
        },
      ];
    } catch (error) {
      console.error("Error generating mock DOCIs:", error);
      return [];
    }
  };

  // Initialize mock data on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setManuscripts(generateMockDOCIs());
    }
  }, []);

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
                    You haven&apos;t minted any DOCIs for your manuscripts yet.
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
