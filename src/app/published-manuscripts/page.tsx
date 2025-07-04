"use client";

import React, { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  ExternalLinkIcon,
  SearchIcon,
  FilterIcon,
  AlertCircleIcon,
  FileTextIcon,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { Loading } from "@/components/ui/loading";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import { backendAPI } from "@/lib/api";

interface PublishedManuscript {
  id: number;
  title: string;
  author: string;
  category: string[];
  abstract?: string;
  status: string;
  submissionDate: string;
  publishedDate: string;
  cid: string;
  ipfsUrls?: {
    manuscript: string;
  };
}

const RESEARCH_CATEGORIES = [
  "All Categories",
  "Artificial Intelligence",
  "Machine Learning",
  "Computer Science",
  "Biology",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Engineering",
  "Medicine",
  "Economics",
  "Psychology",
  "Neuroscience",
  "Environmental Science",
  "Quantum Computing",
  "Blockchain Technology",
];

export default function PublishedManuscriptsPage() {
  const { authenticated: connected } = usePrivy();
  const { wallets } = useWallets();
  const publicKey = wallets[0]?.address;
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;

  const [manuscripts, setManuscripts] = useState<PublishedManuscript[]>([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState<
    PublishedManuscript[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch published manuscripts
  const fetchPublishedManuscripts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get published manuscripts from different categories
      const categories = RESEARCH_CATEGORIES.filter(
        (cat) => cat !== "All Categories"
      );
      const allManuscripts: PublishedManuscript[] = [];

      // Fetch from each category
      for (const category of categories) {
        try {
          const result = await backendAPI.getPublishedManuscripts(category, 50);
          if (result.success && result.manuscripts) {
            allManuscripts.push(...result.manuscripts);
          }
        } catch (err) {
          console.warn(
            `Failed to fetch manuscripts for category ${category}:`,
            err
          );
        }
      }

      // Remove duplicates by ID
      const uniqueManuscripts = allManuscripts.filter(
        (manuscript, index, self) =>
          index === self.findIndex((m) => m.id === manuscript.id)
      );

      setManuscripts(uniqueManuscripts);
      setFilteredManuscripts(uniqueManuscripts);
    } catch (err) {
      console.error("Failed to fetch published manuscripts:", err);
      setError("Failed to load published manuscripts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort manuscripts
  useEffect(() => {
    let filtered = manuscripts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (manuscript) =>
          manuscript.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manuscript.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manuscript.abstract?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((manuscript) =>
        manuscript.category.includes(selectedCategory)
      );
    }

    // Sort manuscripts
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.publishedDate).getTime() -
            new Date(a.publishedDate).getTime()
          );
        case "oldest":
          return (
            new Date(a.publishedDate).getTime() -
            new Date(b.publishedDate).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        default:
          return 0;
      }
    });

    setFilteredManuscripts(sorted);
  }, [manuscripts, searchTerm, selectedCategory, sortBy]);

  // Load manuscripts on component mount
  useEffect(() => {
    fetchPublishedManuscripts();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  const openManuscript = (manuscript: PublishedManuscript) => {
    if (manuscript.ipfsUrls?.manuscript) {
      window.open(manuscript.ipfsUrls.manuscript, "_blank");
    } else if (manuscript.cid) {
      window.open(`https://ipfs.io/ipfs/${manuscript.cid}`, "_blank");
    }
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
                Published Manuscripts
              </h1>
              <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                Explore peer-reviewed research papers published on our platform
              </p>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search manuscripts, authors, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESEARCH_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title">Title A-Z</SelectItem>
                        <SelectItem value="author">Author A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loading />
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert className="border-red-200 bg-red-50 mb-6">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {error}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPublishedManuscripts}
                    className="ml-4"
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Results Count */}
            {!loading && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {filteredManuscripts.length} manuscript
                  {filteredManuscripts.length !== 1 ? "s" : ""} found
                  {selectedCategory !== "All Categories" &&
                    ` in ${selectedCategory}`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
            )}

            {/* Manuscripts Grid */}
            {!loading && filteredManuscripts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredManuscripts.map((manuscript) => (
                  <div
                    key={manuscript.id}
                    onClick={() => openManuscript(manuscript)}
                    className="cursor-pointer group"
                  >
                    <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <Badge variant="secondary" className="mb-2">
                            {manuscript.category[0] || "Research"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            Published
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-semibold text-primary group-hover:text-primary/80 transition-colors line-clamp-2">
                          {manuscript.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <UserIcon className="h-4 w-4" />
                          <span>{manuscript.author}</span>
                        </div>

                        {manuscript.abstract && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {manuscript.abstract}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              Published {formatDate(manuscript.publishedDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors">
                            <FileTextIcon className="h-3 w-3" />
                            <span>View PDF</span>
                            <ExternalLinkIcon className="h-3 w-3" />
                          </div>
                        </div>

                        {/* Additional categories */}
                        {manuscript.category.length > 1 && (
                          <div className="flex flex-wrap gap-1">
                            {manuscript.category
                              .slice(1, 3)
                              .map((cat, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
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
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredManuscripts.length === 0 && (
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                <CardContent className="text-center py-12">
                  <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    No manuscripts found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== "All Categories"
                      ? "Try adjusting your search criteria or filters"
                      : "No published manuscripts available yet"}
                  </p>
                  {(searchTerm || selectedCategory !== "All Categories") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("All Categories");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
