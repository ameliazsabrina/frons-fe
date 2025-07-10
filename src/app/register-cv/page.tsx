"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UploadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  UserIcon,
  BuildingIcon,
  GraduationCapIcon,
  MailIcon,
  AwardIcon,
  BookOpenIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useCVRegistration } from "@/hooks/useCVRegistration";
import { WalletConnection } from "@/components/wallet-connection";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

export default function RegisterCVPage() {
  const { authenticated: connected, user } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const publicKey = solanaWallets[0]?.address;
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
    createManualProfile,
  } = useCVRegistration(validSolanaPublicKey);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    fullName: "",
    institution: "",
    profession: "",
    field: "",
    specialization: "",
    email: "",
  });
  const { isLoading } = useLoading();
  const { toast } = useToast();

  useEffect(() => {
    if (connected && validSolanaPublicKey) {
      checkCVRegistration(validSolanaPublicKey);
    }
  }, [connected, validSolanaPublicKey, checkCVRegistration]);

  useEffect(() => {
    if (cvStatus?.hasCV) {
      toast({
        title: "✅ CV Verified",
        description:
          "Your CV has been verified successfully. You can now submit manuscripts.",
      });
    } else if (cvStatus && !cvStatus.hasCV) {
      toast({
        title: "⚠️ CV Required",
        description:
          "Please upload your CV or fill in your profile details to submit manuscripts.",
      });
    }
  }, [cvStatus, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadCV = async () => {
    if (!selectedFile || !validSolanaPublicKey) return;

    try {
      setUploading(true);
      setUploadProgress(0);

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
        toast({
          title: "CV Uploaded Successfully",
          description: "Redirecting to your profile...",
        });
        router.push("/your-profile");
      } else {
        toast({
          title: "Upload Failed",
          description: "Failed to upload CV. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to upload CV:", err);
      toast({
        title: "Upload Failed",
        description: "Failed to upload CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

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

  const handleManualFormChange = (field: string, value: string) => {
    setManualFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleManualSubmit = async () => {
    if (!validSolanaPublicKey) return;

    const requiredFields = [
      "fullName",
      "institution",
      "profession",
      "field",
      "specialization",
      "email",
    ];
    const missingFields = requiredFields.filter(
      (field) => !manualFormData[field as keyof typeof manualFormData].trim()
    );

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualFormData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingManual(true);

      const result = await createManualProfile(
        manualFormData,
        validSolanaPublicKey
      );

      if (result.success) {
        toast({
          title: "Profile Created",
          description: "Redirecting to your profile...",
        });
        router.push("/your-profile");
      } else {
        toast({
          title: "Profile Creation Failed",
          description:
            result.message || "Failed to create profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to create manual profile:", err);
      toast({
        title: "Profile Creation Failed",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingManual(false);
    }
  };

  if (!connected) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4">
                <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-primary">
                    CV Registration
                  </span>
                </div>
              </div>
            </div>
            <div className="container max-w-5xl mx-auto px-6 py-12">
              <div className="mb-12 text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 font-spectral font-bold tracking-tight">
                  CV Registration
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                  Register your academic credentials to participate in our
                  platform
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-primary/50 to-primary mx-auto rounded-full"></div>
              </div>
              <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheckIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary">
                    Authentication Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  <p className="text-muted-foreground mb-8 text-center text-lg">
                    Please connect your wallet to register your CV and submit
                    manuscripts.
                  </p>
                  <div className="flex justify-center items-center">
                    <WalletConnection />
                  </div>
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
        <OverviewSidebar connected={connected} />
        <SidebarInset className="flex-1">
          <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4">
              <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-primary">
                  CV Registration
                </span>
              </div>
            </div>
          </div>
          <div className="container max-w-5xl mx-auto px-6 py-12">
            <div className="mb-12 text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 font-spectral font-bold tracking-tight">
                Register Your Profile
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                Register your academic credentials to participate in our
                platform
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-primary/50 to-primary mx-auto rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
                <CardHeader className="border-b border-gray-100/50 pb-6">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="text-center">
                      <CardTitle className="text-2xl text-primary font-bold">
                        Register Your Profile
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">
                        Upload and verify your academic credentials
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                  {error && (
                    <div className="p-4 bg-red-50/80 border border-red-200/80 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-3">
                        <AlertCircleIcon className="h-5 w-5 text-red-600" />
                        <p className="text-red-800 text-lg font-medium">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  {(!cvStatus?.hasCV || !showProfile) && (
                    <div className="space-y-8">
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Label className="text-lg font-semibold text-primary">
                            Create Your Profile
                          </Label>
                        </div>
                        <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
                          Create your academic profile to verify your
                          credentials and enable manuscript submission. You can
                          either upload your CV or fill in your details
                          manually.
                        </p>
                      </div>

                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Upload CV</TabsTrigger>
                          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="space-y-6 mt-6">
                          <div className="border-2 border-dashed border-gray-300/80 rounded-xl p-8 text-center hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent">
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
                              className="cursor-pointer flex flex-col items-center space-y-4"
                            >
                              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <UploadIcon className="h-8 w-8 text-primary" />
                              </div>
                              <div className="space-y-2">
                                <span className="text-lg text-foreground font-medium">
                                  {selectedFile
                                    ? selectedFile.name
                                    : "Click to select your CV file"}
                                </span>
                                <span className="text-sm text-muted-foreground block">
                                  Supported formats: PDF, JPG, PNG (max 10MB)
                                </span>
                              </div>
                            </label>
                          </div>

                          {selectedFile && (
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                  <FileTextIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <span className="text-base text-primary font-medium block">
                                    {selectedFile.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {(selectedFile.size / 1024 / 1024).toFixed(
                                      2
                                    )}{" "}
                                    MB
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedFile(null)}
                                disabled={uploading}
                                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                              >
                                Remove
                              </Button>
                            </div>
                          )}

                          {uploading && (
                            <div className="space-y-4 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                              <div className="flex justify-between text-base font-medium">
                                <span className="text-primary">
                                  Processing your CV...
                                </span>
                                <span className="text-primary">
                                  {uploadProgress}%
                                </span>
                              </div>
                              <Progress
                                value={uploadProgress}
                                className="w-full h-3 rounded-full bg-primary/10"
                              />
                              <p className="text-sm text-muted-foreground text-center">
                                We&apos;re analyzing your CV and extracting your
                                academic information
                              </p>
                            </div>
                          )}

                          <Button
                            onClick={handleUploadCV}
                            disabled={!selectedFile || uploading}
                            className="w-full"
                          >
                            {uploading ? "Uploading..." : "Upload CV"}
                          </Button>
                        </TabsContent>

                        <TabsContent value="manual" className="space-y-6 mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="fullName"
                                className="text-sm font-medium text-primary"
                              >
                                Full Name *
                              </Label>
                              <Input
                                id="fullName"
                                type="text"
                                placeholder="Enter your full name"
                                value={manualFormData.fullName}
                                onChange={(e) =>
                                  handleManualFormChange(
                                    "fullName",
                                    e.target.value
                                  )
                                }
                                disabled={isSubmittingManual}
                                className="h-12"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="email"
                                className="text-sm font-medium text-primary"
                              >
                                Email Address *
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={manualFormData.email}
                                onChange={(e) =>
                                  handleManualFormChange(
                                    "email",
                                    e.target.value
                                  )
                                }
                                disabled={isSubmittingManual}
                                className="h-12"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="institution"
                                className="text-sm font-medium text-primary"
                              >
                                Institution *
                              </Label>
                              <Input
                                id="institution"
                                type="text"
                                placeholder="Enter your institution"
                                value={manualFormData.institution}
                                onChange={(e) =>
                                  handleManualFormChange(
                                    "institution",
                                    e.target.value
                                  )
                                }
                                disabled={isSubmittingManual}
                                className="h-12"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="profession"
                                className="text-sm font-medium text-primary"
                              >
                                Profession *
                              </Label>
                              <Input
                                id="profession"
                                type="text"
                                placeholder="e.g., Professor, Researcher, PhD Student"
                                value={manualFormData.profession}
                                onChange={(e) =>
                                  handleManualFormChange(
                                    "profession",
                                    e.target.value
                                  )
                                }
                                disabled={isSubmittingManual}
                                className="h-12"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="field"
                                className="text-sm font-medium text-primary"
                              >
                                Field of Study *
                              </Label>
                              <Input
                                id="field"
                                type="text"
                                placeholder="e.g., Computer Science, Biology, Physics"
                                value={manualFormData.field}
                                onChange={(e) =>
                                  handleManualFormChange(
                                    "field",
                                    e.target.value
                                  )
                                }
                                disabled={isSubmittingManual}
                                className="h-12"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="specialization"
                                className="text-sm font-medium text-primary"
                              >
                                Specialization *
                              </Label>
                              <Input
                                id="specialization"
                                type="text"
                                placeholder="e.g., Machine Learning, Molecular Biology"
                                value={manualFormData.specialization}
                                onChange={(e) =>
                                  handleManualFormChange(
                                    "specialization",
                                    e.target.value
                                  )
                                }
                                disabled={isSubmittingManual}
                                className="h-12"
                              />
                            </div>
                          </div>

                          <Button
                            onClick={handleManualSubmit}
                            disabled={isSubmittingManual}
                            className="w-full"
                          >
                            {isSubmittingManual
                              ? "Creating Profile..."
                              : "Create Profile"}
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {cvData &&
                    cvData.fullName &&
                    (cvStatus?.hasCV || showProfile) && (
                      <div className="space-y-8">
                        <Separator className="my-8" />

                        <div className="space-y-6">
                          <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-primary flex items-center justify-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-primary" />
                              </div>
                              <span>Your Academic Profile</span>
                            </h3>
                            <p className="text-muted-foreground">
                              Review your extracted profile information
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-semibold text-primary">
                                    Full Name
                                  </span>
                                </div>
                                <p className="text-foreground font-medium text-lg">
                                  {cvData?.fullName || "Not provided"}
                                </p>
                              </div>

                              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <BuildingIcon className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-semibold text-primary">
                                    Institution
                                  </span>
                                </div>
                                <p className="text-foreground font-medium text-lg">
                                  {cvData?.institution || "Not provided"}
                                </p>
                              </div>

                              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <GraduationCapIcon className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-semibold text-primary">
                                    Field of Study
                                  </span>
                                </div>
                                <p className="text-foreground font-medium text-lg">
                                  {cvData?.field || "Not provided"}
                                </p>
                              </div>

                              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <BookOpenIcon className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-semibold text-primary">
                                    Specialization
                                  </span>
                                </div>
                                <p className="text-foreground font-medium text-lg">
                                  {cvData?.specialization || "Not provided"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <MailIcon className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-semibold text-primary">
                                    Email Address
                                  </span>
                                </div>
                                <p className="text-foreground font-medium text-lg">
                                  {cvData.email || "Not provided"}
                                </p>
                              </div>

                              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <BriefcaseIcon className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-semibold text-primary">
                                    Profession
                                  </span>
                                </div>
                                <p className="text-foreground font-medium text-lg">
                                  {cvData?.profession || "Not provided"}
                                </p>
                              </div>

                              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    <AwardIcon className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-semibold text-primary">
                                    Registration Date
                                  </span>
                                </div>
                                <p className="text-foreground font-medium text-lg">
                                  {cvData?.registeredAt
                                    ? new Date(
                                        cvData.registeredAt
                                      ).toLocaleDateString()
                                    : "Not provided"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-8" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button
                            onClick={() => router.push("/submit-manuscript")}
                          >
                            Submit Manuscript
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => router.push("/your-profile")}
                          >
                            View Full Profile
                          </Button>
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
