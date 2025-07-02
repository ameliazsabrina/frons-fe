"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
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
import { useProgram } from "@/hooks/useProgram";
import { useCVRegistration } from "@/hooks/useCVRegistration";
import { useManuscriptForm } from "@/hooks/useManuscriptForm";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useManuscriptSubmission } from "@/hooks/useManuscriptSubmission";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";

export default function SubmitManuscriptPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const { submitManuscriptSubsidized, connected, publicKey } = useProgram();
  const { checkCVRegistration } = useCVRegistration();
  const router = useRouter();

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

  const { loading, submitManuscript } = useManuscriptSubmission({
    submitManuscriptSubsidized,
    checkCVRegistration,
  });

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
    if (!connected || !publicKey) return;

    const ipfsHash = await uploadToIPFS(
      manuscriptData,
      publicKey.toString(),
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
      publicKey,
      cvVerified,
      file
    );
    if (validationError !== null || !file || !publicKey) {
      return;
    }

    const onSuccess = () => {
      resetForm();
      resetUpload();
    };

    await submitManuscript(
      manuscriptData,
      file,
      publicKey.toString(),
      apiUrl,
      onSuccess
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {connected && publicKey ? (
          <CVRegistrationGuard
            walletAddress={publicKey.toString()}
            onCVVerified={handleCVVerified}
            showUploadOption={true}
          >
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-white border-b border-gray-100">
                <div className="flex flex-col items-start justify-between gap-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Reviews
                  </Button>
                  <div className="flex flex-col items-left gap-2">
                    <CardTitle className="text-xl text-gray-900">
                      Manuscript Submission
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Fill in the details and upload your research manuscript
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
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

                <div>
                  <Label className="text-sm font-medium">
                    Research Categories *
                  </Label>
                  <ResearchCategorySelector
                    selectedCategories={manuscriptData.categories}
                    onCategoriesChange={handleCategoriesChange}
                  />
                </div>

                <Separator />

                <FileUploadSection
                  file={file}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                  uploadResult={uploadResult}
                  onFileChange={handleFileChange}
                  onUpload={handleIPFSUpload}
                />
              </CardContent>

              <CardFooter className="bg-gray-50 border-t border-gray-100 p-6">
                <SubmitButton
                  loading={loading}
                  connected={connected}
                  isFormValid={isFormValid}
                  cvVerified={cvVerified}
                  onSubmit={handleSubmit}
                />
              </CardFooter>
            </Card>
          </CVRegistrationGuard>
        ) : (
          <Card className="shadow-lg border-gray-200">
            <CardContent className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-amber-800">
                  <AlertCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Wallet Connection Required
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Please connect your wallet to submit a manuscript.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
