"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WalletConnection } from "@/components/wallet-connection";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { PanelLeftIcon } from "lucide-react";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import { getPrimarySolanaWallet } from "@/utils/wallet";
import { useManuscriptSubmission } from "@/hooks/useManuscriptSubmission";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileTextIcon,
  UsersIcon,
  UploadIcon,
  CheckCircleIcon,
} from "lucide-react";
import { BasicInformationForm } from "@/components/manuscript/BasicInformationForm";
import { AbstractKeywordsForm } from "@/components/manuscript/AbstractKeywordsForm";
import { FileUploadForm } from "@/components/manuscript/FileUploadForm";
import { IPFSInfoDisplay } from "@/components/manuscript/IPFSInfoDisplay";
import { SubmissionProgress } from "@/components/manuscript/SubmissionProgress";
import { useSubmissionForm } from "@/hooks/useSubmissionForm";
import { useCVVerification } from "@/hooks/useCVVerification";
import { usePayment } from "@/hooks/usePayment";
import HeaderImage from "@/components/header-image";


export default function SubmitManuscriptPage() {
  const { toast } = useToast();
  const { authenticated: connected, authenticated } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const router = useRouter();
  const { isLoading } = useLoading();

  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

  const solanaWallet = getPrimarySolanaWallet(solanaWallets);
  const validSolanaPublicKey =
    solanaWallet?.address && isValidSolanaAddress(solanaWallet.address)
      ? solanaWallet.address
      : undefined;

  const {
    formData,
    selectedFile,
    authors,
    keywords,
    error,
    handleInputChange,
    handleRemoveItem,
    handleCategoriesChange,
    handleFileChange,
    handleRemoveFile,
    validateForm,
    resetForm,
    getArrayFromCommaString,
  } = useSubmissionForm();

  const { cvVerified, cvChecking, verificationError } = useCVVerification({
    walletAddress: validSolanaPublicKey,
    connected,
    authenticated,
  });

  const { processUSDCPayment, paymentProcessing, paymentError } = usePayment({
    walletAddress: validSolanaPublicKey,
    wallet: solanaWallet,
  });

  const { submitManuscript } = useManuscriptSubmission({
    checkCVRegistration: undefined,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [ipfsData, setIpfsData] = useState<{
    cid: string;
    ipfsUrl: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState("basic-info");

  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newCompletedTabs = new Set<string>();

    if (formData.title && formData.author && formData.category) {
      newCompletedTabs.add("basic-info");
    }

    if (formData.abstract && formData.keywords) {
      newCompletedTabs.add("authors-keywords");
    }

    if (selectedFile) {
      newCompletedTabs.add("manuscript-file");
    }

    setCompletedTabs(newCompletedTabs);
  }, [formData, selectedFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
        className: "bg-white text-red-600 border-red-500 shadow-lg",
        duration: 5000,
      });
      return;
    }

    if (!validSolanaPublicKey || !cvVerified) {
      toast({
        title: "Error",
        description: "Wallet connection and CV verification required",
        variant: "destructive",
        className: "bg-white text-red-600 border-red-500 shadow-lg",
        duration: 5000,
      });
      return;
    }

    try {
      setSubmitting(true);
      setSubmitProgress(0);
      setSuccess(null);
      setIpfsData(null);

      setSubmitProgress(10);
      toast({
        title: "Processing Payment",
        description: "Please approve the $50 USDCF payment to escrow...",
        className: "bg-white text-blue-600 border-blue-500 shadow-lg",
        duration: 5000,
      });

      const paymentSignature = await processUSDCPayment();

      setSubmitProgress(30);
      toast({
        title: "Payment Successful",
        description: "Payment processed successfully. Submitting manuscript...",
        className: "bg-green-500 text-white border-none",
      });

      setSubmitProgress(50);


      const submissionMetadata = {
        title: formData.title,
        authors: getArrayFromCommaString(formData.author).map((name) => ({
          name,
        })),
        categories: getArrayFromCommaString(formData.category),
        abstract: formData.abstract,
        keywords: getArrayFromCommaString(formData.keywords),
        walletAddress: validSolanaPublicKey,
      };


      const result = await submitManuscript(
        selectedFile!,
        submissionMetadata,
        apiUrl
      );


      if (!result) {
        throw new Error("Failed to submit manuscript");
      }

      setSubmitProgress(100);
      const successMsg = `Manuscript "${formData.title}" submitted successfully!`;
      toast({
        title: "Success!",
        description: successMsg,
        className: "bg-green-500 text-white border-none",
      });
      setSuccess(successMsg);

      setIpfsData({
        cid: result.manuscript.cid,
        ipfsUrl: result.ipfsUrls.manuscript,
      });

      toast({
        title: "IPFS Links",
        description: (
          <div className="space-y-2">
            <p>Your manuscript has been uploaded to IPFS:</p>
            <a
              href={result.ipfsUrls.manuscript}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-100 hover:text-blue-200 underline block"
            >
              View Manuscript
            </a>
            <p className="text-sm mt-2">
              Payment Transaction: {paymentSignature}
            </p>
          </div>
        ),
        className: "bg-primary text-white border-none",
      });

      resetForm();

      setTimeout(() => {
        router.push("/overview");
      }, 5000);
    } catch (err: any) {

      let errorMsg = "Failed to submit manuscript. Please try again.";
      if (paymentError || err.message?.includes("Payment failed")) {
        errorMsg =
          paymentError ||
          "Payment failed. Please ensure you have sufficient USDCF balance.";
      } else if (err.response?.data?.code === "CV_REQUIRED") {
        errorMsg = err.response.data.message;
        setTimeout(() => router.push("/register-cv"), 2000);
      } else if (err.response?.data?.code === "MISSING_WALLET") {
        errorMsg =
          err.response.data.message || "Valid wallet connection required.";
      } else if (err.response?.data?.code === "PINATA_ERROR") {
        errorMsg = "IPFS upload failed. Please try again later.";
      } else if (err.response?.status === 503) {
        errorMsg = "Service temporarily unavailable. Please try again later.";
      }

      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
        className: "bg-white text-red-600 border-red-500 shadow-lg",
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
      setSubmitProgress(0);
    }
  };

  if (!connected || !validSolanaPublicKey) {
    return (
      <div className="min-h-screen bg-white flex w-full">
        <Sidebar>
          <OverviewSidebar connected={connected} />
        </Sidebar>
        <div className="flex-1">
          <HeaderImage />
          <div className="flex-1 p-4 sm:p-6">
            <div className="text-center py-8">
              <h2 className="text-xl sm:text-2xl text-primary mb-4">
                Authentication Required
              </h2>
              <p className="text-muted-foreground mb-8 text-base sm:text-lg px-4">
                Connect your wallet to submit manuscripts.
              </p>
              <WalletConnection />
            </div>
          </div>
          <Toaster />
        </div>
      </div>
    );
  }

  if (cvChecking || !cvVerified) {
    return (
      <div className="min-h-screen bg-white flex w-full">
        <Sidebar>
          <OverviewSidebar connected={connected} />
        </Sidebar>
        <div className="flex-1">
          <HeaderImage />
          <div className="flex-1 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-4">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-xl border space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-18" />
                  </div>
                </div>
                <div className="p-6 bg-white rounded-xl border space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          </div>
          <Toaster />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex w-full">
      <Sidebar>
        <OverviewSidebar connected={connected} />
      </Sidebar>
      <div className="flex-1">
        <HeaderImage />
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {ipfsData && <IPFSInfoDisplay ipfsData={ipfsData} />}

            {submitting && (
              <SubmissionProgress submitProgress={submitProgress} />
            )}

            <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="border-b border-gray-100">
                    <TabsList className="w-full justify-start bg-transparent p-0 h-auto rounded-none overflow-x-auto">
                      <TabsTrigger
                        value="basic-info"
                        className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-3 sm:px-6 py-4 relative rounded-none text-xs sm:text-sm whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">
                          Basic Information
                        </span>
                        <span className="sm:hidden">Basic</span>
                        {completedTabs.has("basic-info") && (
                          <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 ml-1" />
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="authors-keywords"
                        className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-3 sm:px-6 py-4 relative rounded-none text-xs sm:text-sm whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">
                          Abstract & Keywords
                        </span>
                        <span className="sm:hidden">Abstract</span>
                        {completedTabs.has("authors-keywords") && (
                          <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 ml-1" />
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="manuscript-file"
                        className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:border-b-primary data-[state=active]:bg-transparent px-3 sm:px-6 py-4 relative rounded-none text-xs sm:text-sm whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">
                          Manuscript File
                        </span>
                        <span className="sm:hidden">File</span>
                        {completedTabs.has("manuscript-file") && (
                          <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 ml-1" />
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent
                    value="basic-info"
                    className="p-4 sm:p-8 space-y-6"
                  >
                    <BasicInformationForm
                      formData={formData}
                      authors={authors}
                      submitting={submitting}
                      onInputChange={handleInputChange}
                      onRemoveItem={handleRemoveItem}
                      onCategoriesChange={handleCategoriesChange}
                    />
                    <div className="flex justify-end pt-6">
                      <Button
                        type="button"
                        onClick={() => setActiveTab("authors-keywords")}
                        disabled={!completedTabs.has("basic-info")}
                        className="w-full sm:w-auto min-w-[120px] text-sm sm:text-base"
                      >
                        <span className="hidden sm:inline">
                          Next: Abstract & Keywords
                        </span>
                        <span className="sm:hidden">Next</span>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="authors-keywords"
                    className="p-4 sm:p-8 space-y-6"
                  >
                    <AbstractKeywordsForm
                      formData={{
                        abstract: formData.abstract,
                        keywords: formData.keywords,
                      }}
                      keywords={keywords}
                      submitting={submitting}
                      onInputChange={handleInputChange}
                      onRemoveItem={handleRemoveItem}
                    />
                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("basic-info")}
                        className="w-full sm:w-auto min-w-[120px] text-sm sm:text-base order-2 sm:order-1"
                      >
                        <span className="hidden sm:inline">
                          Previous: Basic Info
                        </span>
                        <span className="sm:hidden">Previous</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab("manuscript-file")}
                        disabled={!completedTabs.has("authors-keywords")}
                        className="w-full sm:w-auto min-w-[120px] text-sm sm:text-base order-1 sm:order-2"
                      >
                        <span className="hidden sm:inline">
                          Next: Upload File
                        </span>
                        <span className="sm:hidden">Next</span>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="manuscript-file"
                    className="p-4 sm:p-8 space-y-6"
                  >
                    <FileUploadForm
                      selectedFile={selectedFile}
                      submitting={submitting}
                      onFileChange={handleFileChange}
                      onRemoveFile={handleRemoveFile}
                    />
                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("authors-keywords")}
                        className="w-full sm:w-auto min-w-[120px] text-sm sm:text-base order-2 sm:order-1"
                      >
                        <span className="hidden sm:inline">
                          Previous: Authors & Keywords
                        </span>
                        <span className="sm:hidden">Previous</span>
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          submitting ||
                          !cvVerified ||
                          paymentProcessing ||
                          !completedTabs.has("basic-info") ||
                          !completedTabs.has("authors-keywords") ||
                          !completedTabs.has("manuscript-file")
                        }
                        onClick={() => {}}
                        className="w-full sm:w-auto min-w-[200px] text-sm sm:text-base order-1 sm:order-2"
                      >
                        {paymentProcessing
                          ? "Processing Payment..."
                          : submitting
                          ? "Submitting..."
                          : "Submit Manuscript"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </form>
        </div>
        <Toaster />
      </div>
    </div>
  );
}
