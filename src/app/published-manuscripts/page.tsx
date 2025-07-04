"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileTextIcon,
  CalendarIcon,
  UserIcon,
  ExternalLinkIcon,
  BookOpenIcon,
  AwardIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "lucide-react";
import { useManuscriptManagement } from "@/hooks/useManuscriptManagement";
import { Header } from "@/components/header";
import { NFTBadge } from "@/components/ui/nft-badge";
import { PublishedManuscript } from "@/types/backend";
import { useLoading } from "@/context/LoadingContext";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { isValidSolanaAddress } from "@/hooks/useProgram";

const RESEARCH_CATEGORIES = [
  "Artificial Intelligence",
  "Machine Learning",
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Medicine",
  "Engineering",
  "Economics",
  "Psychology",
  "Sociology",
  "Philosophy",
  "History",
  "Literature",
  "Quantum Computing",
  "Blockchain",
  "Cybersecurity",
  "Data Science",
  "Robotics",
];

export default function PublishedManuscriptsPage() {
  const {
    getPublishedManuscripts,
    isLoading: loading,
    error,
  } = useManuscriptManagement();
  const [manuscripts, setManuscripts] = useState<PublishedManuscript[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    "Artificial Intelligence"
  );
  const [totalCount, setTotalCount] = useState(0);
  const { isLoading } = useLoading();
  const { authenticated: connected } = usePrivy();
  const { wallets } = useWallets();
  const publicKey = wallets[0]?.address;
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;

  useEffect(() => {
    loadPublishedManuscripts();
  }, [selectedCategory]);

  const loadPublishedManuscripts = async () => {
    const result = await getPublishedManuscripts(selectedCategory, 20);
    if (result?.success) {
      setManuscripts(result.manuscripts);
      setTotalCount(result.count);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-red-100 text-red-800",
      "bg-indigo-100 text-indigo-800",
      "bg-pink-100 text-pink-800",
      "bg-yellow-100 text-yellow-800",
    ];
    const index = category.length % colors.length;
    return colors[index];
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
              <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                Published Manuscripts
              </h1>
              <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                Explore groundbreaking research published on the blockchain
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
                    No Manuscripts Found
                  </h2>
                  <p className="text-muted-foreground">
                    There are no published manuscripts available at this time.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {manuscripts.map((manuscript) => (
                  <Card
                    key={manuscript.id}
                    className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <h3 className="font-medium text-primary leading-tight">
                              {manuscript.title}
                            </h3>
                          </div>

                          <div className="space-y-3 mb-4">
                            <p className="text-sm text-muted-foreground">
                              By {manuscript.author}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {manuscript.category.map((cat, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-primary/10 text-primary text-xs"
                                >
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {manuscript.nftMint && (
                            <div className="mb-4">
                              <Badge variant="outline" className="text-xs">
                                🎯 NFT Minted
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <p className="text-xs text-muted-foreground">
                            Published: {formatDate(manuscript.publishedDate)}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                manuscript.ipfsUrls.manuscript,
                                "_blank"
                              )
                            }
                            className="text-xs"
                          >
                            <ExternalLinkIcon className="h-3 w-3 mr-1" />
                            View Paper
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
