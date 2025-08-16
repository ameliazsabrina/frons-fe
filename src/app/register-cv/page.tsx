"use client";

import type React from "react";
import Image from "next/image";
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
  GraduationCapIcon,
  AwardIcon,
  BookOpenIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { WalletConnection } from "@/components/wallet-connection";
import { useRouter } from "next/navigation";
import { useLoading } from "@/context/LoadingContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/ui/sidebar";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { useCVRegistration } from "@/hooks/useCVRegistration";
import { getPrimarySolanaWalletAddress } from "@/utils/wallet";
import HeaderImage from "@/components/header-image";

interface EditableData {
  fullName: string;
  title: string;
  profession: string;
  institution: string;
  location: string;
  field: string;
  specialization: string;
  email: string;
  phone: string;
  linkedIn: string;
  github: string;
  website: string;
  overview: string;
  orcid?: string;
  googleScholar?: string;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    location?: string;
  }>;
  experience?: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    location?: string;
    type?: string;
  }>;
  publications?: Array<{
    title?: string;
    authors?: string[];
    venue?: string;
    date?: string;
    doi?: string;
    url?: string;
  }>;
  awards?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
}

const UnconnectedView = () => (
  <>
    <HeaderImage />
    <div className="container max-w-5xl mx-auto px-6 py-12">
      <p className="text-muted-foreground mb-4 text-center text-sm">
        Please connect your wallet to register your CV and submit manuscripts.
      </p>
      <div className="flex justify-center items-center">
        <WalletConnection />
      </div>
    </div>
  </>
);

const ConnectedView = () => {
  const { authenticated: connected, user } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const walletAddress = getPrimarySolanaWalletAddress(solanaWallets) ?? "";
  const validSolanaPublicKey = walletAddress || "";
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [editableData, setEditableData] = useState<EditableData>({
    fullName: "",
    title: "",
    profession: "",
    institution: "",
    location: "",
    field: "",
    specialization: "",
    email: "",
    phone: "",
    linkedIn: "",
    github: "",
    website: "",
    overview: "",
    orcid: "",
    googleScholar: "",
    education: [],
    experience: [],
    publications: [],
    awards: [],
  });
  const [confirmingRegistration, setConfirmingRegistration] = useState(false);
  const { isLoading } = useLoading();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const {
    cvStatus,
    cvData,
    parseCV,
    uploadProgress,
    getUserProfile,
    createManualProfile,
    error: cvError,
  } = useCVRegistration(validSolanaPublicKey);

  useEffect(() => {
    if (cvError) {
      setError(cvError);
    }
  }, [cvError]);

  // Show toast notifications for errors
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    const checkProfile = async () => {
      if (!validSolanaPublicKey) return;

      try {
        const result = await getUserProfile(validSolanaPublicKey);
        if (result?.success) {
          setShowProfile(true);
        }
      } catch (err) {
        console.error("Failed to get user profile:", err);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
          className: "bg-white text-red-600 border-red-500 shadow-lg",
          duration: 5000,
        });
      }
    };

    if (connected && validSolanaPublicKey) {
      checkProfile();
    }
  }, [connected, validSolanaPublicKey, getUserProfile, toast]);

  useEffect(() => {
    if (cvStatus?.hasCV) {
      toast({
        title: "✅ CV Verified",
        description:
          "Your CV has been verified successfully. You can now submit manuscripts.",
        variant: "success",
        className: "bg-white text-green-600 border-green-500 shadow-lg",
        duration: 5000,
      });
      setShowProfile(true);
      router.push("/your-profile");
    } else if (cvStatus && !cvStatus.hasCV) {
      toast({
        title: "⚠️ CV Required",
        description:
          "Please upload your CV or fill in your profile details to submit manuscripts.",
      });
    }
  }, [cvStatus, toast, router]);

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
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select a PDF or image file (JPG, PNG).",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "File size must be less than 10MB.",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleParseCV = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    if (!validSolanaPublicKey) {
      setError("Please connect your wallet");
      return;
    }

    setUploading(true);
    try {
      const result = await parseCV(selectedFile);

      if (result.success && result.data) {
        console.log(
          "📄 CV data received in register-cv component:",
          JSON.stringify(result.data, null, 2)
        );
        setEditableData(result.data);
        setShowPreview(true);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!validSolanaPublicKey) return;

    try {
      setConfirmingRegistration(true);

      const finalData = {
        fullName: editableData.fullName,
        institution: editableData.institution,
        profession: editableData.profession,
        field: editableData.field,
        specialization: editableData.specialization,
        email: editableData.email,
        orcid: "",
        googleScholar: "",
      };

      const result = await createManualProfile(finalData, validSolanaPublicKey);

      if (result.success) {
        toast({
          title: "Profile Registered Successfully",
          description: "Redirecting to your profile...",
        });
        router.push("/your-profile");
      } else {
        toast({
          title: "Registration Failed",
          description:
            result.message || "Failed to register profile. Please try again.",
          variant: "destructive",
          className: "bg-white text-red-600 border-red-500 shadow-lg",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Failed to register profile:", err);
      toast({
        title: "Registration Failed",
        description: "Failed to register profile. Please try again.",
        variant: "destructive",
        className: "bg-white text-red-600 border-red-500 shadow-lg",
        duration: 5000,
      });
    } finally {
      setConfirmingRegistration(false);
    }
  };

  const handleBackToUpload = () => {
    setShowPreview(false);
    setEditableData({
      fullName: "",
      title: "",
      profession: "",
      institution: "",
      location: "",
      field: "",
      specialization: "",
      email: "",
      phone: "",
      linkedIn: "",
      github: "",
      website: "",
      overview: "",
      orcid: "",
      googleScholar: "",
    });
    setSelectedFile(null);
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
    setEditableData((prev) => ({
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
    ] as const;
    const missingFields = requiredFields.filter((field) => {
      const value = editableData[field];
      return typeof value !== "string" || !value.trim();
    });

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
        className: "bg-white text-red-600 border-red-500 shadow-lg",
        duration: 5000,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editableData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
        className: "bg-white text-red-600 border-red-500 shadow-lg",
        duration: 5000,
      });
      return;
    }

    try {
      const result = await createManualProfile(
        editableData,
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
          className: "bg-white text-red-600 border-red-500 shadow-lg",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Failed to create manual profile:", err);
      toast({
        title: "Profile Creation Failed",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
        className: "bg-white text-red-600 border-red-500 shadow-lg",
        duration: 5000,
      });
    } finally {
    }
  };

  return (
    <>
      {" "}
      <HeaderImage />
      <div className="container max-w-5xl mx-auto px-6 pb-12">
        <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300">
          <CardContent className="space-y-8 ">
            {(!cvStatus?.hasCV || !editableData.fullName) && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Label className="text-xl font-semibold text-primary">
                      Create Your Profile
                    </Label>
                  </div>
                  <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-tight">
                    Create your academic profile to verify your credentials and
                    enable manuscript submission. You can either upload your CV
                    or fill in your details manually.
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
                    {!showPreview ? (
                      <>
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
                                Supported formats: PDF (Max 5MB)
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
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
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
                          <div className="space-y-4 p-6 bg-white/95 rounded-xl border border-primary/20">
                            <div className="flex items-center space-x-3">
                              <Skeleton className="h-6 w-6 rounded-full" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-4/5" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleParseCV}
                          disabled={!selectedFile || uploading}
                          className="w-full !text-md font-semibold py-6"
                        >
                          {uploading ? "Processing..." : "Upload CV"}
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-primary">
                                CV Parsed Successfully
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Please review and edit the information below
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBackToUpload}
                            className="flex items-center space-x-2"
                          >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Back</span>
                          </Button>
                        </div>

                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="docis">DOCIs</TabsTrigger>
                            <TabsTrigger value="publications">
                              Publications
                            </TabsTrigger>
                            <TabsTrigger value="experience">
                              Experience
                            </TabsTrigger>
                            <TabsTrigger value="education">
                              Education
                            </TabsTrigger>
                            <TabsTrigger value="awards">Awards</TabsTrigger>
                          </TabsList>

                          <TabsContent
                            value="overview"
                            className="space-y-6 mt-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-fullName"
                                  className="text-sm font-medium text-primary"
                                >
                                  Full Name *
                                </Label>
                                <Input
                                  id="preview-fullName"
                                  value={editableData.fullName}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      fullName: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter your full name"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-email"
                                  className="text-sm font-medium text-primary"
                                >
                                  Email *
                                </Label>
                                <Input
                                  id="preview-email"
                                  value={editableData.email}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      email: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter your email"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-institution"
                                  className="text-sm font-medium text-primary"
                                >
                                  Institution *
                                </Label>
                                <Input
                                  id="preview-institution"
                                  value={editableData.institution}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      institution: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter your institution"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-profession"
                                  className="text-sm font-medium text-primary"
                                >
                                  Profession *
                                </Label>
                                <Input
                                  id="preview-profession"
                                  value={editableData.profession}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      profession: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter your profession"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-field"
                                  className="text-sm font-medium text-primary"
                                >
                                  Field of Study *
                                </Label>
                                <Input
                                  id="preview-field"
                                  value={editableData.field}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      field: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter your field of study"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-specialization"
                                  className="text-sm font-medium text-primary"
                                >
                                  Specialization *
                                </Label>
                                <Input
                                  id="preview-specialization"
                                  value={editableData.specialization}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      specialization: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter your specialization"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-title"
                                  className="text-sm font-medium text-primary"
                                >
                                  Title
                                </Label>
                                <Input
                                  id="preview-title"
                                  value={editableData.title}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      title: e.target.value,
                                    }))
                                  }
                                  placeholder="Dr., Prof., etc."
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-location"
                                  className="text-sm font-medium text-primary"
                                >
                                  Location
                                </Label>
                                <Input
                                  id="preview-location"
                                  value={editableData.location}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      location: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter your location"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-phone"
                                  className="text-sm font-medium text-primary"
                                >
                                  Phone
                                </Label>
                                <Input
                                  id="preview-phone"
                                  value={editableData.phone}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      phone: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter your phone number"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-website"
                                  className="text-sm font-medium text-primary"
                                >
                                  Website
                                </Label>
                                <Input
                                  id="preview-website"
                                  value={editableData.website}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      website: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter your website URL"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="preview-overview"
                                className="text-sm font-medium text-primary"
                              >
                                Overview
                              </Label>
                              <Textarea
                                id="preview-overview"
                                value={editableData.overview}
                                onChange={(e) =>
                                  setEditableData((prev) => ({
                                    ...prev,
                                    overview: e.target.value,
                                  }))
                                }
                                placeholder="Enter a brief overview or summary"
                                rows={4}
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="docis" className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-orcid"
                                  className="text-sm font-medium text-primary"
                                >
                                  ORCID ID
                                </Label>
                                <Input
                                  id="preview-orcid"
                                  value={editableData.orcid || ""}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      orcid: e.target.value,
                                    }))
                                  }
                                  placeholder="https://orcid.org/0000-0000-0000-0000"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-googleScholar"
                                  className="text-sm font-medium text-primary"
                                >
                                  Google Scholar Profile
                                </Label>
                                <Input
                                  id="preview-googleScholar"
                                  value={editableData.googleScholar || ""}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      googleScholar: e.target.value,
                                    }))
                                  }
                                  placeholder="https://scholar.google.com/citations?user=..."
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-linkedIn"
                                  className="text-sm font-medium text-primary"
                                >
                                  LinkedIn Profile
                                </Label>
                                <Input
                                  id="preview-linkedIn"
                                  value={editableData.linkedIn}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      linkedIn: e.target.value,
                                    }))
                                  }
                                  placeholder="https://linkedin.com/in/..."
                                />
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor="preview-github"
                                  className="text-sm font-medium text-primary"
                                >
                                  GitHub Profile
                                </Label>
                                <Input
                                  id="preview-github"
                                  value={editableData.github}
                                  onChange={(e) =>
                                    setEditableData((prev) => ({
                                      ...prev,
                                      github: e.target.value,
                                    }))
                                  }
                                  placeholder="https://github.com/..."
                                />
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="publications"
                            className="space-y-6 mt-6"
                          >
                            {editableData.publications &&
                            editableData.publications.length > 0 ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <BookOpenIcon className="h-5 w-5 text-primary" />
                                  <Label className="text-lg font-semibold text-primary">
                                    Publications (
                                    {editableData.publications.length})
                                  </Label>
                                </div>
                                <div className="space-y-3">
                                  {editableData.publications.map(
                                    (pub, index) => (
                                      <div
                                        key={index}
                                        className="p-4 bg-gray-50 rounded-lg border"
                                      >
                                        <div className="space-y-2">
                                          <div className="font-medium text-gray-900">
                                            {pub.title}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {pub.authors &&
                                              pub.authors.length > 0 && (
                                                <div>
                                                  Authors:{" "}
                                                  {Array.isArray(pub.authors)
                                                    ? pub.authors.join(", ")
                                                    : pub.authors}
                                                </div>
                                              )}
                                            {pub.venue && (
                                              <div>
                                                Published in: {pub.venue}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {pub.date && `Date: ${pub.date}`}
                                            {pub.doi && ` • DOI: ${pub.doi}`}
                                          </div>
                                          {pub.url && (
                                            <div className="text-sm">
                                              <a
                                                href={pub.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                              >
                                                View Publication
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                  No publications found in your CV
                                </p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent
                            value="experience"
                            className="space-y-6 mt-6"
                          >
                            {editableData.experience &&
                            editableData.experience.length > 0 ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <BriefcaseIcon className="h-5 w-5 text-primary" />
                                  <Label className="text-lg font-semibold text-primary">
                                    Experience ({editableData.experience.length}
                                    )
                                  </Label>
                                </div>
                                <div className="space-y-3">
                                  {editableData.experience.map((exp, index) => (
                                    <div
                                      key={index}
                                      className="p-4 bg-gray-50 rounded-lg border"
                                    >
                                      <div className="space-y-2">
                                        <div className="font-medium text-gray-900">
                                          {exp.position}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {exp.company}{" "}
                                          {exp.location && `• ${exp.location}`}
                                          {exp.type && ` • ${exp.type}`}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {exp.startDate && exp.endDate
                                            ? `${exp.startDate} - ${exp.endDate}`
                                            : exp.startDate
                                            ? `Started ${exp.startDate}`
                                            : exp.endDate
                                            ? `Ended ${exp.endDate}`
                                            : ""}
                                        </div>
                                        {exp.description && (
                                          <div className="text-sm text-gray-700 mt-2">
                                            {exp.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                  No experience found in your CV
                                </p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent
                            value="education"
                            className="space-y-6 mt-6"
                          >
                            {editableData.education &&
                            editableData.education.length > 0 ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <GraduationCapIcon className="h-5 w-5 text-primary" />
                                  <Label className="text-lg font-semibold text-primary">
                                    Education ({editableData.education.length})
                                  </Label>
                                </div>
                                <div className="space-y-3">
                                  {editableData.education.map((edu, index) => (
                                    <div
                                      key={index}
                                      className="p-4 bg-gray-50 rounded-lg border"
                                    >
                                      <div className="space-y-2">
                                        <div className="font-medium text-gray-900">
                                          {edu.degree}{" "}
                                          {edu.field && `in ${edu.field}`}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {edu.institution}{" "}
                                          {edu.location && `• ${edu.location}`}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {edu.startDate && edu.endDate
                                            ? `${edu.startDate} - ${edu.endDate}`
                                            : edu.startDate
                                            ? `Started ${edu.startDate}`
                                            : edu.endDate
                                            ? `Ended ${edu.endDate}`
                                            : ""}
                                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <GraduationCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                  No education found in your CV
                                </p>
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent
                            value="awards"
                            className="space-y-6 mt-6"
                          >
                            {editableData.awards &&
                            editableData.awards.length > 0 ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <AwardIcon className="h-5 w-5 text-primary" />
                                  <Label className="text-lg font-semibold text-primary">
                                    Awards & Honors (
                                    {editableData.awards.length})
                                  </Label>
                                </div>
                                <div className="space-y-3">
                                  {editableData.awards.map((award, index) => (
                                    <div
                                      key={index}
                                      className="p-4 bg-gray-50 rounded-lg border"
                                    >
                                      <div className="space-y-2">
                                        <div className="font-medium text-gray-900">
                                          {award.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {award.issuer &&
                                            `Issued by: ${award.issuer}`}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {award.date && `Date: ${award.date}`}
                                        </div>
                                        {award.description && (
                                          <div className="text-sm text-gray-700 mt-2">
                                            {award.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <AwardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                  No awards found in your CV
                                </p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>

                        <div className="flex space-x-4">
                          <Button
                            variant="outline"
                            onClick={handleBackToUpload}
                            className="flex-1"
                          >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Upload
                          </Button>
                          <Button
                            onClick={handleConfirmRegistration}
                            disabled={
                              confirmingRegistration ||
                              !editableData.fullName ||
                              !editableData.email ||
                              !editableData.institution ||
                              !editableData.profession ||
                              !editableData.field ||
                              !editableData.specialization
                            }
                            className="flex-1"
                          >
                            {confirmingRegistration
                              ? "Registering..."
                              : "Confirm Registration"}
                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}
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
                          value={editableData.fullName}
                          onChange={(e) =>
                            setEditableData((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          disabled={uploading}
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
                          value={editableData.email}
                          onChange={(e) =>
                            setEditableData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          disabled={uploading}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="orcid"
                          className="text-sm font-medium text-primary"
                        >
                          ORCID ID
                        </Label>
                        <Input
                          id="orcid"
                          type="url"
                          placeholder="https://orcid.org/0000-0000-0000-0000"
                          value={editableData.orcid}
                          onChange={(e) =>
                            setEditableData((prev) => ({
                              ...prev,
                              orcid: e.target.value,
                            }))
                          }
                          disabled={uploading}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="googleScholar"
                          className="text-sm font-medium text-primary"
                        >
                          Google Scholar Profile
                        </Label>
                        <Input
                          id="googleScholar"
                          type="url"
                          placeholder="https://scholar.google.com/citations?user=..."
                          value={editableData.googleScholar}
                          onChange={(e) =>
                            setEditableData((prev) => ({
                              ...prev,
                              googleScholar: e.target.value,
                            }))
                          }
                          disabled={uploading}
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
                          value={editableData.institution}
                          onChange={(e) =>
                            setEditableData((prev) => ({
                              ...prev,
                              institution: e.target.value,
                            }))
                          }
                          disabled={uploading}
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
                          value={editableData.profession}
                          onChange={(e) =>
                            setEditableData((prev) => ({
                              ...prev,
                              profession: e.target.value,
                            }))
                          }
                          disabled={uploading}
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
                          value={editableData.field}
                          onChange={(e) =>
                            setEditableData((prev) => ({
                              ...prev,
                              field: e.target.value,
                            }))
                          }
                          disabled={uploading}
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
                          value={editableData.specialization}
                          onChange={(e) =>
                            setEditableData((prev) => ({
                              ...prev,
                              specialization: e.target.value,
                            }))
                          }
                          disabled={uploading}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleManualSubmit}
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? "Creating Profile..." : "Create Profile"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default function RegisterCV() {
  const { authenticated: connected } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const walletAddress = getPrimarySolanaWalletAddress(solanaWallets) ?? "";
  const validSolanaPublicKey = walletAddress || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
      <Sidebar>
        <OverviewSidebar connected={connected} />
      </Sidebar>
      <div className="flex-1">
        <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-primary">Register CV</span>
            </div>
          </div>
        </div>
        {!connected ? <UnconnectedView /> : <ConnectedView />}
      </div>
    </div>
  );
}
