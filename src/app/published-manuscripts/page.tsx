"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { backendAPI } from "@/lib/api";
import { getPrimarySolanaWalletAddress } from "@/utils/wallet";

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
  const { wallets } = useSolanaWallets();

  const [manuscripts, setManuscripts] = useState<PublishedManuscript[]>([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState<
    PublishedManuscript[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");

  // Mock data for demo purposes
  const generateMockManuscripts = (): PublishedManuscript[] => [
    {
      id: 1,
      title:
        "QA Blockchain Electronic Health Data System for Secure Medical Records Exchange",
      author:
        "James Kolapo Oladele, Arnold Adimabua Ojugo1*, Christopher Chukwufunaya Odiakaose2, Frances Uchechukwu Emordi3, Reuben Akporube Abere1, Blessing Nwozor1, Patrick Ogholuwarami Ejeh2 and Victor Ochuko Geteloma",
      category: ["Quantum Computing", "Machine Learning", "Medicine"],
      abstract:
        "This paper presents a groundbreaking approach to drug discovery using quantum machine learning algorithms. We demonstrate significant improvements in molecular property prediction and drug-target interaction modeling.",
      status: "Published",
      submissionDate: "2024-01-15",
      publishedDate: "2024-02-28",
      cid: "QmX7Y8Z9A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6",
      ipfsUrls: {
        manuscript:
          "https://lavender-obliged-krill-876.mypinata.cloud/ipfs/bafybeif55nxsboonmeb2a3bq6cfwyn2pp43imusvcb3cksso2ozvdybu2y?pinataGatewayToken=30J7NvmruuWRqqLcl_dP3pIOLXNPHFV9WTVmGKyiAZYAELn2aYtbB7YbegNFivjc",
      },
    },
    {
      id: 2,
      title:
        "Clinical characteristics and relevant factor analysis in super-aged COVID-19 patients",
      author:
        "MA Xiaorong, Zheng Tian, aresilan guliru, abudu shalamu rukeyamu, Zhang Jianfeng, Dai Bin",
      category: ["Medicine", "Biology", "Physics"],
      abstract:
        "We propose a novel decentralized AI framework that leverages blockchain technology for secure and privacy-preserving federated learning across multiple institutions.",
      status: "Published",
      submissionDate: "2024-01-20",
      publishedDate: "2024-03-05",
      cid: "QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0",
      ipfsUrls: {
        manuscript:
          "https://lavender-obliged-krill-876.mypinata.cloud/ipfs/bafybeid62pkhmwoqcwfnhyhcppg7j4uif3tdh7yd6jsflcg2mrl6psgsym?pinataGatewayToken=30J7NvmruuWRqqLcl_dP3pIOLXNPHFV9WTVmGKyiAZYAELn2aYtbB7YbegNFivjc",
      },
    },
    {
      id: 3,
      title: "Neural Network Optimization for Climate Change Prediction Models",
      author: "Dr. Emily Watson",
      category: ["Environmental Science", "Machine Learning", "Mathematics"],
      abstract:
        "This research introduces advanced neural network architectures optimized for long-term climate prediction, achieving unprecedented accuracy in temperature and precipitation forecasting.",
      status: "Published",
      submissionDate: "2024-02-01",
      publishedDate: "2024-03-12",
      cid: "QmB2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1",
      ipfsUrls: {
        manuscript:
          "https://ipfs.io/ipfs/QmB2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1",
      },
    },
    {
      id: 4,
      title: "CRISPR-Cas9 Enhancement Through AI-Guided Design",
      author: "Dr. James Liu",
      category: ["Biology", "Artificial Intelligence", "Medicine"],
      abstract:
        "We present an AI-guided approach to enhance CRISPR-Cas9 precision, reducing off-target effects by 95% while maintaining high editing efficiency.",
      status: "Published",
      submissionDate: "2024-02-10",
      publishedDate: "2024-03-18",
      cid: "QmC3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2",
      ipfsUrls: {
        manuscript:
          "https://ipfs.io/ipfs/QmC3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2",
      },
    },
    {
      id: 5,
      title: "Sustainable Energy Storage: Next-Generation Battery Technologies",
      author: "Prof. Anna Kowalski",
      category: ["Engineering", "Chemistry", "Environmental Science"],
      abstract:
        "This paper explores novel battery technologies using sustainable materials, achieving 300% improvement in energy density while reducing environmental impact.",
      status: "Published",
      submissionDate: "2024-02-15",
      publishedDate: "2024-03-25",
      cid: "QmD4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3",
      ipfsUrls: {
        manuscript:
          "https://ipfs.io/ipfs/QmD4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3",
      },
    },
    {
      id: 6,
      title:
        "Neuroplasticity in Virtual Reality: Cognitive Enhancement Studies",
      author: "Dr. Robert Kim",
      category: ["Neuroscience", "Psychology", "Computer Science"],
      abstract:
        "Our research demonstrates how virtual reality environments can enhance neuroplasticity, leading to improved cognitive function and memory retention in aging populations.",
      status: "Published",
      submissionDate: "2024-02-20",
      publishedDate: "2024-04-01",
      cid: "QmE5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4",
      ipfsUrls: {
        manuscript:
          "https://ipfs.io/ipfs/QmE5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4",
      },
    },
    {
      id: 7,
      title: "Economic Impact of Cryptocurrency Adoption in Developing Nations",
      author: "Prof. Maria Santos",
      category: ["Economics", "Blockchain Technology"],
      abstract:
        "This comprehensive study analyzes the economic implications of cryptocurrency adoption in developing countries, revealing significant impacts on financial inclusion and economic growth.",
      status: "Published",
      submissionDate: "2024-02-25",
      publishedDate: "2024-04-08",
      cid: "QmF6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5",
      ipfsUrls: {
        manuscript:
          "https://ipfs.io/ipfs/QmF6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5",
      },
    },
    {
      id: 8,
      title: "Quantum Entanglement in Biological Systems: New Discoveries",
      author: "Dr. Thomas Anderson",
      category: ["Physics", "Biology", "Quantum Computing"],
      abstract:
        "We present evidence of quantum entanglement effects in biological systems, particularly in photosynthesis and neural networks, opening new avenues for bio-quantum research.",
      status: "Published",
      submissionDate: "2024-03-01",
      publishedDate: "2024-04-15",
      cid: "QmG7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6",
      ipfsUrls: {
        manuscript:
          "https://ipfs.io/ipfs/QmG7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6",
      },
    },
  ];

  // Fetch published manuscripts
  const fetchPublishedManuscripts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate mock data for demo
      const mockManuscripts = generateMockManuscripts();

      // Try to fetch real data and combine with mock data
      try {
        const categories = RESEARCH_CATEGORIES.filter(
          (cat) => cat !== "All Categories"
        );
        const allManuscripts: PublishedManuscript[] = [...mockManuscripts];

        // Fetch from each category
        for (const category of categories) {
          try {
            const result = await backendAPI.getPublishedManuscripts(
              category,
              20
            );
            if (result && result.length > 0) {
              // Add real manuscripts with higher IDs to avoid conflicts
              const realManuscripts = result.map((m: any) => ({
                ...m,
                id: m.id + 1000, // Offset to avoid conflicts with mock data
              }));
              allManuscripts.push(...realManuscripts);
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
      } catch (apiError) {
        console.log("API not available, using mock data only");
        setManuscripts(mockManuscripts);
        setFilteredManuscripts(mockManuscripts);
      }
    } catch (err) {
      console.error("Failed to fetch published manuscripts:", err);
      // Fallback to mock data on error
      const mockManuscripts = generateMockManuscripts();
      setManuscripts(mockManuscripts);
      setFilteredManuscripts(mockManuscripts);
      setError(null); // Don't show error, just use mock data
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [fetchPublishedManuscripts]);

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
    <div className="min-h-screen bg-primary/5 flex w-full">
      <Sidebar>
        <OverviewSidebar connected={connected} />
      </Sidebar>
      <div className="flex-1">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="p-6 bg-white rounded-xl border space-y-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                ))}
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
        </div>
      </div>
  );
}
