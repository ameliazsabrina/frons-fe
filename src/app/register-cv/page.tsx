"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UploadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  UserIcon,
  BuildingIcon,
  GraduationCapIcon,
  MailIcon,
  MapPinIcon,
  AwardIcon,
  BookOpenIcon,
  BriefcaseIcon,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { useCVRegistration } from "@/hooks/useCVRegistration";
import { Header } from "@/components/header";
import { WalletConnection } from "@/components/wallet-connection";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function RegisterCVPage() {
  const { authenticated: connected, user } = usePrivy();
  const { wallets } = useWallets();
  const publicKey = wallets[0]?.address;
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;
  const router = useRouter();
  const {
    cvStatus,
    cvData,
    isLoading: loading,
    error,
    checkCVRegistration,
    uploadCV,
    getUserProfile,
  } = useCVRegistration();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const { isLoading } = useLoading();

  // Check CV status when wallet connects
  useEffect(() => {
    if (connected && validSolanaPublicKey) {
      checkCVRegistration(validSolanaPublicKey);
    }
  }, [connected, validSolanaPublicKey, checkCVRegistration]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please select a PDF or image file (JPG, PNG)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  // Upload CV
  const handleUploadCV = async () => {
    if (!selectedFile || !validSolanaPublicKey) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const result = await uploadCV(selectedFile, validSolanaPublicKey);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result?.success) {
        alert(
          "CV uploaded and parsed successfully! You can now submit manuscripts."
        );
        setShowProfile(true);
      } else {
        alert("Failed to upload CV. Please try again.");
      }
    } catch (err) {
      console.error("Failed to upload CV:", err);
      alert("Failed to upload CV. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Load detailed profile
  const handleLoadProfile = async () => {
    if (!validSolanaPublicKey) return;

    try {
      const result = await getUserProfile(validSolanaPublicKey);
      if (result?.success) {
        setShowProfile(true);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
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
            <div className="container max-w-4xl mx-auto px-4 py-8">
              <div className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                  CV Registration
                </h1>
                <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                  Register your academic credentials to participate in our
                  platform
                </p>
              </div>
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    CV Registration Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Please connect your wallet to register your CV and submit
                    manuscripts.
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
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                CV Registration
              </h1>
              <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                Register your academic credentials to participate in our
                platform
              </p>
            </div>
            <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center space-x-2">
                  <FileTextIcon className="h-6 w-6" />
                  <span>CV Registration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CV Status */}
                {cvStatus && (
                  <Alert
                    className={
                      cvStatus.hasCV
                        ? "border-green-200 bg-green-50"
                        : "border-yellow-200 bg-yellow-50"
                    }
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    <AlertDescription>
                      {cvStatus.hasCV ? (
                        <span className="text-green-800">
                          ✅ CV verified. You can submit manuscripts.
                        </span>
                      ) : (
                        <span className="text-yellow-800">
                          ⚠️ No CV found. Please upload your CV to submit
                          manuscripts.
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Error Display */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* CV Upload Section */}
                {(!cvStatus?.hasCV || !showProfile) && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-primary">
                        Upload Your CV (PDF or Image)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload your academic CV to verify your credentials and
                        enable manuscript submission.
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="cv-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="cv-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <UploadIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-muted-foreground">
                          {selectedFile
                            ? selectedFile.name
                            : "Click to select CV file"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          PDF, JPG, or PNG (max 10MB)
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
                          disabled={uploading}
                        >
                          Remove
                        </Button>
                      </div>
                    )}

                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading CV...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                    )}

                    <Button
                      onClick={handleUploadCV}
                      disabled={!selectedFile || uploading}
                      className="w-full"
                    >
                      {uploading ? "Uploading..." : "Upload and Parse CV"}
                    </Button>
                  </div>
                )}

                {/* CV Profile Display */}
                {cvData && showProfile && (
                  <div className="space-y-6">
                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
                        <UserIcon className="h-5 w-5" />
                        <span>Your Academic Profile</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Name
                            </span>
                          </div>
                          <p className="text-foreground">{cvData.fullName}</p>

                          <div className="flex items-center space-x-2">
                            <BuildingIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Institution
                            </span>
                          </div>
                          <p className="text-foreground">
                            {cvData.institution}
                          </p>

                          <div className="flex items-center space-x-2">
                            <GraduationCapIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Field
                            </span>
                          </div>
                          <p className="text-foreground">{cvData.field}</p>

                          <div className="flex items-center space-x-2">
                            <BookOpenIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Specialization
                            </span>
                          </div>
                          <p className="text-foreground">
                            {cvData.specialization}
                          </p>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <MailIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Email
                            </span>
                          </div>
                          <p className="text-foreground">
                            {cvData.email || "Not provided"}
                          </p>

                          <div className="flex items-center space-x-2">
                            <BriefcaseIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Profession
                            </span>
                          </div>
                          <p className="text-foreground">{cvData.profession}</p>

                          <div className="flex items-center space-x-2">
                            <AwardIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              Registered
                            </span>
                          </div>
                          <p className="text-foreground">
                            {new Date(cvData.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => router.push("/submit-manuscript")}
                        className="flex-1"
                      >
                        Submit Manuscript
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/your-profile")}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                )}

                {/* Load Profile Button (if CV exists but profile not shown) */}
                {cvStatus?.hasCV && !showProfile && (
                  <div className="text-center">
                    <Button onClick={handleLoadProfile} disabled={isLoading}>
                      {isLoading ? "Loading..." : "View Profile Details"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
