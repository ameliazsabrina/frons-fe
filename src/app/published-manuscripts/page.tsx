"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  ExternalLinkIcon,
  SearchIcon,
  AlertCircleIcon,
  FileTextIcon,
  RefreshCwIcon,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import {
  useManuscriptsOverview,
  PublishedManuscript,
  RESEARCH_CATEGORIES,
} from "@/hooks/useManuscriptsOverview";

export default function PublishedManuscriptsPage() {
  const { authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");

  const validSolanaPublicKey = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  )?.address;

  // Use the shared manuscripts hook with proper filtering
  const {
    manuscripts,
    manuscriptsLoading: loading,
    manuscriptsError: error,
    filterManuscripts,
    refreshData,
  } = useManuscriptsOverview(authenticated, validSolanaPublicKey);

  // Filter manuscripts based on search criteria
  const filteredManuscripts = filterManuscripts(
    searchTerm,
    selectedCategory,
    sortBy
  );

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const openIPFS = (url: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar>
        <OverviewSidebar connected={authenticated} />
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden  max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Published Research
                </h1>
                <p className="text-sm text-gray-600">
                  Browse peer-reviewed manuscripts with complete review
                  verification
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={refreshData}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={loading}
              >
                <RefreshCwIcon
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto px-4 py-6 sm:px-6">
          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search manuscripts, authors, or abstracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-3">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-56 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="text-xs w-56 min-w-56">
                  {RESEARCH_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">By Title</SelectItem>
                  <SelectItem value="author">By Author</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-64">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Manuscripts Grid */}
          {!loading && (
            <>
              {filteredManuscripts.length === 0 ? (
                <div className="text-center py-12">
                  <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No manuscripts found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {manuscripts.length === 0
                      ? "No properly reviewed manuscripts are available. Manuscripts must have 3+ completed reviews and 3+ approved reviews to be displayed."
                      : "Try adjusting your search criteria or filters."}
                  </p>
                  {manuscripts.length === 0 && (
                    <Button onClick={refreshData} variant="outline">
                      <RefreshCwIcon className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredManuscripts.length} of {manuscripts.length}{" "}
                    properly reviewed manuscripts
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredManuscripts.map((manuscript) => (
                      <Card
                        key={manuscript.id}
                        className="hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200"
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-semibold line-clamp-2 text-gray-900">
                            {manuscript.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <UserIcon className="h-4 w-4" />
                            <span className="line-clamp-1">
                              {manuscript.author}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Categories */}
                          <div className="flex flex-wrap gap-1">
                            {manuscript.category.slice(0, 3).map((cat) => (
                              <Badge
                                key={cat}
                                variant="secondary"
                                className="text-xs"
                              >
                                {cat}
                              </Badge>
                            ))}
                            {manuscript.category.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{manuscript.category.length - 3} more
                              </Badge>
                            )}
                          </div>

                          {/* Abstract */}
                          {manuscript.abstract && (
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {manuscript.abstract}
                            </p>
                          )}

                          {/* Review Information */}
                          {manuscript.reviewInfo && (
                            <div className="flex items-center space-x-4 text-xs text-gray-600 bg-green-50 p-2 rounded">
                              <span>
                                ✅ {manuscript.reviewInfo.reviewsCompleted}{" "}
                                reviews
                              </span>
                              <span>
                                👍 {manuscript.reviewInfo.reviewsApproved}{" "}
                                approved
                              </span>
                            </div>
                          )}

                          {/* Publication Date */}
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              Published {formatDate(manuscript.publishedDate)}
                            </span>
                          </div>

                          {/* Action Button */}
                          <Button
                            onClick={() =>
                              openIPFS(
                                manuscript.ipfsUrls?.manuscript ||
                                  `https://ipfs.io/ipfs/${manuscript.cid}`
                              )
                            }
                            className="w-full"
                            variant="outline"
                          >
                            <ExternalLinkIcon className="h-4 w-4 mr-2" />
                            View Full Paper
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
