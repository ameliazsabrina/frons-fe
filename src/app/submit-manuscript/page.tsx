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
import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react";
import { ResearchCategorySelector } from "@/components/ui/research-category-selector";
import { CVRegistrationGuard } from "@/components/ui/cv-registration-guard";
import { BasicInfoSection } from "@/components/manuscript/BasicInfoSection";
import { AuthorsKeywordsSection } from "@/components/manuscript/AuthorsKeywordsSection";
import { FileUploadSection } from "@/components/manuscript/FileUploadSection";
import { SubmitButton } from "@/components/manuscript/SubmitButton";
import { WalletConnection } from "@/components/wallet-connection";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useCVRegistration } from "@/hooks/useCVRegistration";
import { useManuscriptForm } from "@/hooks/useManuscriptForm";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useManuscriptWorkflow } from "@/hooks/useManuscriptWorkflow";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { isValidSolanaAddress } from "@/hooks/useProgram";

export default function SubmitManuscriptPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const { authenticated: connected, user } = usePrivy();
  const { wallets } = useWallets();
  const publicKey = wallets[0]?.address;
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;
  const { submitManuscript, isLoading: loading } = useManuscriptWorkflow();
  const { checkCVRegistration } = useCVRegistration();
  const router = useRouter();
  const { isLoading } = useLoading();
  const [cvVerified, setCvVerified] = useState(false);

  const {
    manuscriptData,
    authorsInput,
    keywordsInput,
    isFormValid,
    setAuthorsInput,
    setKeywordsInput,
    handleInputChange,
    handleAuthorsBlur,
    handleKeywordsBlur,
    handleCategoriesChange,
    setIpfsHash,
    resetForm,
    validateForm,
  } = useManuscriptForm();

  const {
    file,
    uploading,
    uploadProgress,
    uploadResult,
    handleFileChange,
    uploadToIPFS,
    resetUpload,
  } = useFileUpload();

  const handleCVVerified = useCallback(() => {
    setCvVerified(true);
  }, []);

  useEffect(() => {
    if (manuscriptData.authors.length > 0 && !authorsInput) {
      setAuthorsInput(manuscriptData.authors.map((a) => a.name).join(", "));
    }
    if (manuscriptData.keywords.length > 0 && !keywordsInput) {
      setKeywordsInput(manuscriptData.keywords.join(", "));
    }
  }, [
    manuscriptData.authors,
    manuscriptData.keywords,
    authorsInput,
    keywordsInput,
    setAuthorsInput,
    setKeywordsInput,
  ]);

  const handleIPFSUpload = async () => {
    if (!connected || !validSolanaPublicKey) return;

    const ipfsHash = await uploadToIPFS(
      manuscriptData,
      validSolanaPublicKey,
      apiUrl
    );
    if (ipfsHash) {
      setIpfsHash(ipfsHash);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm(
      connected,
      validSolanaPublicKey,
      cvVerified,
      file
    );
    if (validationError !== null || !file || !validSolanaPublicKey) {
      return;
    }

    if (!manuscriptData.ipfsHash) {
      console.error("IPFS hash is required");
      return;
    }

    try {
      await submitManuscript({
        ipfsHash: manuscriptData.ipfsHash,
        title: manuscriptData.title,
        description: manuscriptData.abstract,
        authors: manuscriptData.authors.map((a) => a.name),
        keywords: manuscriptData.keywords,
      });

      resetForm();
      resetUpload();
      // Redirect to success page or show success message
    } catch (error) {
      console.error("Failed to submit manuscript:", error);
      // Handle error (show toast, etc.)
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
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                  Submit Manuscript
                </h1>
                <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                  Share your research with the academic community through our
                  blockchain-powered platform
                </p>
              </div>
              <WalletConnection />
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
          <div className="container max-w-5xl mx-auto px-4 py-8">
            <CVRegistrationGuard
              walletAddress={validSolanaPublicKey || ""}
              onCVVerified={handleCVVerified}
              showUploadOption={true}
            >
              <div className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                  Submit Manuscript
                </h1>
                <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                  Share your research with the academic community through our
                  blockchain-powered platform
                </p>
              </div>

              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex flex-col items-start justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="text-sm"
                    >
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                  <BasicInfoSection
                    title={manuscriptData.title}
                    abstract={manuscriptData.abstract}
                    onChange={handleInputChange}
                  />

                  <AuthorsKeywordsSection
                    authorsInput={authorsInput}
                    keywordsInput={keywordsInput}
                    authors={manuscriptData.authors}
                    keywords={manuscriptData.keywords}
                    onAuthorsInputChange={setAuthorsInput}
                    onKeywordsInputChange={setKeywordsInput}
                    onAuthorsBlur={handleAuthorsBlur}
                    onKeywordsBlur={handleKeywordsBlur}
                  />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-primary">
                      Research Categories *
                    </Label>
                    <ResearchCategorySelector
                      selectedCategories={manuscriptData.categories}
                      onCategoriesChange={handleCategoriesChange}
                    />
                  </div>

                  <Separator className="my-6" />

                  <FileUploadSection
                    file={file}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    uploadResult={uploadResult}
                    onFileChange={handleFileChange}
                    onUpload={handleIPFSUpload}
                  />
                </CardContent>

                <CardFooter className="bg-primary/5 border-t border-gray-100 p-6">
                  <SubmitButton
                    loading={isLoading}
                    connected={connected}
                    isFormValid={isFormValid}
                    cvVerified={cvVerified}
                    onSubmit={handleSubmit}
                  />
                </CardFooter>
              </Card>
            </CVRegistrationGuard>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
