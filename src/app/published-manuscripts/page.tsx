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
} from "lucide-react";
import { useManuscriptManagement } from "@/hooks/useManuscriptManagement";
import { Header } from "@/components/header";
import { NFTBadge } from "@/components/ui/nft-badge";
import { PublishedManuscript } from "@/types/backend";
import { useLoading } from "@/context/LoadingContext";

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
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Published Manuscripts
          </h1>
          <p className="text-gray-600">
            Peer-reviewed academic publications with blockchain verification
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Filter by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {RESEARCH_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpenIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Total Published
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {totalCount}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Peer Reviewed
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">100%</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AwardIcon className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    NFT Verified
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {manuscripts.filter((m) => m.nftMint).length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Manuscripts Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : manuscripts.length === 0 ? (
          <Card className="text-center p-12">
            <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Published Manuscripts
            </h3>
            <p className="text-gray-600">
              No manuscripts have been published in the "{selectedCategory}"
              category yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {manuscripts.map((manuscript) => (
              <Card
                key={manuscript.id}
                className="shadow-lg border-gray-200 hover:shadow-xl transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                        {manuscript.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <UserIcon className="h-4 w-4" />
                        <span>{manuscript.author}</span>
                      </div>
                    </div>
                    {manuscript.nftMint && (
                      <NFTBadge mintAddress={manuscript.nftMint} />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {manuscript.category.map((cat) => (
                      <Badge
                        key={cat}
                        variant="outline"
                        className={`text-xs ${getCategoryColor(cat)}`}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  {/* Publication Info */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        Published: {formatDate(manuscript.publishedDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileTextIcon className="h-4 w-4" />
                      <span>
                        Submitted: {formatDate(manuscript.submissionDate)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        window.open(manuscript.ipfsUrls.manuscript, "_blank")
                      }
                    >
                      <ExternalLinkIcon className="h-4 w-4 mr-1" />
                      View Paper
                    </Button>
                    {manuscript.nftMint && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://explorer.solana.com/address/${manuscript.nftMint}?cluster=devnet`,
                            "_blank"
                          )
                        }
                      >
                        🎯 NFT
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {manuscripts.length > 0 && manuscripts.length < totalCount && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={loadPublishedManuscripts}>
              Load More Manuscripts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
