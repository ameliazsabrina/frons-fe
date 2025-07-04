"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
} from "lucide-react";
import { ResearchCategorySelector } from "@/components/ui/research-category-selector";
import { CVRegistrationGuard } from "@/components/ui/cv-registration-guard";
import { WalletConnection } from "@/components/wallet-connection";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useCVRegistration } from "@/hooks/useCVRegistration";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import { backendAPI } from "@/lib/api";

export default function SubmitManuscriptPage() {
  const { authenticated: connected, user } = usePrivy();
  const { wallets } = useWallets();
  const publicKey = wallets[0]?.address;
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;
  const { checkCVRegistration } = useCVRegistration();
  const router = useRouter();
  const { isLoading } = useLoading();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    abstract: "",
    keywords: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [cvVerified, setCvVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCVVerified = useCallback(() => {
    setCvVerified(true);
  }, []);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        alert("Please select a PDF file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  // Handle category change
  const handleCategoriesChange = (categories: string[]) => {
    setFormData((prev) => ({
      ...prev,
      category: categories.join(", "),
    }));
  };

  // Form validation
  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.author.trim()) return "Author is required";
    if (!formData.category.trim()) return "Category is required";
    if (!formData.abstract.trim()) return "Abstract is required";
    if (!formData.keywords.trim()) return "Keywords are required";
    if (!selectedFile) return "Manuscript file is required";
    if (!validSolanaPublicKey) return "Valid wallet connection required";
    if (!cvVerified) return "CV verification required";
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!selectedFile || !validSolanaPublicKey) return;

    try {
      setSubmitting(true);
      setSubmitProgress(0);
      setError(null);
      setSuccess(null);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setSubmitProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      // Submit manuscript using backend API
      const result = await backendAPI.submitManuscript({
        manuscript: selectedFile,
        title: formData.title,
        author: formData.author,
        category: formData.category,
        abstract: formData.abstract,
        keywords: formData.keywords,
        authorWallet: validSolanaPublicKey,
      });

      clearInterval(progressInterval);
      setSubmitProgress(100);

      if (result.success) {
        setSuccess(
          `✅ Manuscript "${formData.title}" submitted successfully! Status: ${result.manuscript.status}. It will now go through peer review.`
        );

        // Reset form
        setFormData({
          title: "",
          author: "",
          category: "",
          abstract: "",
          keywords: "",
        });
        setSelectedFile(null);

        // Redirect to overview after 3 seconds
        setTimeout(() => {
          router.push("/overview");
        }, 3000);
      } else {
        setError("Failed to submit manuscript. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to submit manuscript:", err);

      // Handle specific backend errors
      if (err.message?.includes("CV registration required")) {
        setError("CV registration required. Please upload your CV first.");
      } else if (err.message?.includes("Author wallet address is required")) {
        setError("Valid wallet connection required.");
      } else {
        setError(
          err.message || "Failed to submit manuscript. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
      setSubmitProgress(0);
    }
  };

  if (!connected) {
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
            <div className="container max-w-5xl mx-auto px-4 py-8">
              <div className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral  text-bold tracking-tight">
                  Submit Manuscript
                </h1>
                <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                  Share your research with the academic community through our
                  blockchain-powered platform
                </p>
              </div>
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Manuscript Submission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Please connect your wallet to submit manuscripts.
                  </p>
                  <WalletConnection />
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

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
          <div className="container max-w-5xl mx-auto px-4 lg:px-16 py-8">
            <CVRegistrationGuard
              walletAddress={validSolanaPublicKey || ""}
              onCVVerified={handleCVVerified}
              showUploadOption={true}
            >
              <div className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral  font-bold tracking-tight">
                  Submit Manuscript
                </h1>
                <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                  Share your research with the academic community through our
                  blockchain-powered platform
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Success Message */}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircleIcon className="h-4 w-4" />
                    <AlertDescription className="text-green-800">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Message */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Basic Information */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label
                        htmlFor="title"
                        className="text-sm font-medium text-primary"
                      >
                        Manuscript Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Enter your manuscript title"
                        className="mt-1"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="author"
                        className="text-sm font-medium text-primary"
                      >
                        Author(s) *
                      </Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) =>
                          handleInputChange("author", e.target.value)
                        }
                        placeholder="Enter author name(s)"
                        className="mt-1"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-primary">
                        Research Category *
                      </Label>
                      <ResearchCategorySelector
                        selectedCategories={
                          formData.category ? formData.category.split(", ") : []
                        }
                        onCategoriesChange={handleCategoriesChange}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Abstract and Keywords */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">
                      Abstract & Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label
                        htmlFor="abstract"
                        className="text-sm font-medium text-primary"
                      >
                        Abstract *
                      </Label>
                      <Textarea
                        id="abstract"
                        value={formData.abstract}
                        onChange={(e) =>
                          handleInputChange("abstract", e.target.value)
                        }
                        placeholder="Enter your manuscript abstract"
                        className="mt-1 min-h-[120px]"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="keywords"
                        className="text-sm font-medium text-primary"
                      >
                        Keywords *
                      </Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) =>
                          handleInputChange("keywords", e.target.value)
                        }
                        placeholder="Enter keywords separated by commas"
                        className="mt-1"
                        disabled={submitting}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">
                      Manuscript File
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-primary">
                        Upload Manuscript (PDF) *
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload your manuscript in PDF format (max 10MB)
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="manuscript-upload"
                        disabled={submitting}
                      />
                      <label
                        htmlFor="manuscript-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <UploadIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-muted-foreground">
                          {selectedFile
                            ? selectedFile.name
                            : "Click to select manuscript file"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PDF only (max 10MB)
                        </span>
                      </label>
                    </div>

                    {selectedFile && (
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileTextIcon className="h-4 w-4 text-primary" />
                          <span className="text-sm text-primary">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          disabled={submitting}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submit Progress */}
                {submitting && (
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Submitting manuscript...</span>
                          <span>{submitProgress}%</span>
                        </div>
                        <Progress value={submitProgress} className="w-full" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={submitting || !cvVerified}
                    className="px-8 py-2"
                  >
                    {submitting ? "Submitting..." : "Submit Manuscript"}
                  </Button>
                </div>
              </form>
            </CVRegistrationGuard>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
