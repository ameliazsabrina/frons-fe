"use client";
import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertCircleIcon,
  FileTextIcon,
  ExternalLinkIcon,
  UserIcon,
  BookIcon,
  AwardIcon,
  BriefcaseIcon,
  MailIcon,
  GlobeIcon,
  PhoneIcon,
  GithubIcon,
  LinkedinIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  BuildingIcon,
  GraduationCapIcon,
  BookOpenIcon,
  MapPinIcon,
  CheckCircleIcon,
  LinkIcon,
} from "lucide-react";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import { useCVRegistration } from "@/hooks/useCVRegistration";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletConnection } from "@/components/wallet-connection";

interface UserProfile {
  personalInfo: {
    fullName: string;
    title: string;
    profession: string;
    institution: string;
    location: string;
    field: string;
    specialization: string;
  };
  contact: {
    email: string;
    phone?: string;
    linkedIn?: string;
    github?: string;
    website?: string;
  };
  summary: {
    education: number;
    experience: number;
    publications: number;
    awards: number;
  };
}

export default function YourProfilePage() {
  const { authenticated: connected } = usePrivy();
  const { wallets } = useWallets();
  const publicKey = wallets[0]?.address;
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;

  const {
    cvData,
    getUserProfile,
    updateUserProfile,
    checkCVRegistration,
    isLoading,
    error,
  } = useCVRegistration();

  const [profileData, setProfileData] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasCV, setHasCV] = useState(false);

  useEffect(() => {
    if (connected && validSolanaPublicKey) {
      loadUserProfile();
    }
  }, [connected, validSolanaPublicKey]);

  const loadUserProfile = async () => {
    if (!validSolanaPublicKey) return;

    try {
      const cvStatus = await checkCVRegistration(validSolanaPublicKey);
      setHasCV(cvStatus);

      if (cvStatus) {
        const result = await getUserProfile(validSolanaPublicKey);
        if (result?.success) {
          setProfileData(result.profile);
          setEditData({
            personalInfo: { ...result.profile.personalInfo },
            contact: { ...result.profile.contact },
            overview: (result.profile as any).overview || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    if (profileData) {
      setEditData({
        personalInfo: { ...profileData.personalInfo },
        contact: { ...profileData.contact },
        overview: (profileData as any).overview || "",
      });
    }
    setMessage(null);
  };

  const handleSave = async () => {
    if (!validSolanaPublicKey) return;

    try {
      setSaving(true);
      setMessage(null);

      const result = await updateUserProfile(validSolanaPublicKey, editData);

      if (result?.success) {
        setProfileData(result.profile);
        setIsEditing(false);
        setMessage("✅ Profile updated successfully!");
      } else {
        setMessage("❌ Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage("❌ Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    setEditData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleOverviewChange = (value: string) => {
    setEditData((prev: any) => ({
      ...prev,
      overview: value,
    }));
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
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral  font-bold tracking-tight">
                  Your Profile
                </h1>
                <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                  Manage your academic profile and credentials
                </p>
              </div>
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">
                    Profile Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Please connect your wallet to view and manage your profile.
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

  if (!hasCV) {
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
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral  font-bold tracking-tight">
                  Your Profile
                </h1>
                <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                  Manage your academic profile and credentials
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
                    Please register your CV to create and view your profile.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/register-cv")}
                  >
                    Register CV
                  </Button>
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
              <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral  font-bold tracking-tight">
                Your Profile
              </h1>
              <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                Manage your academic profile and credentials
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
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
                </AlertDescription>
              </Alert>
            )}

            {/* Success/Error Messages */}
            {message && (
              <Alert
                className={
                  message.includes("✅")
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }
              >
                <CheckCircleIcon className="h-4 w-4" />
                <AlertDescription
                  className={
                    message.includes("✅") ? "text-green-800" : "text-red-800"
                  }
                >
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {/* Profile Content */}
            {profileData && (
              <div className="space-y-6">
                {/* Profile Header */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserIcon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-primary">
                          {profileData.personalInfo.fullName}
                        </h2>
                        <p className="text-muted-foreground">
                          {profileData.personalInfo.title} at{" "}
                          {profileData.personalInfo.institution}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!isEditing ? (
                        <Button onClick={handleEditStart} variant="outline">
                          <EditIcon className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button onClick={handleSave} disabled={saving}>
                            <SaveIcon className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save"}
                          </Button>
                          <Button onClick={handleEditCancel} variant="outline">
                            <XIcon className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {/* Personal Information */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center">
                      <UserIcon className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="fullName"
                          className="text-sm font-medium text-primary"
                        >
                          Full Name
                        </Label>
                        {isEditing ? (
                          <Input
                            id="fullName"
                            value={editData.personalInfo?.fullName || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "personalInfo",
                                "fullName",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.personalInfo.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="title"
                          className="text-sm font-medium text-primary"
                        >
                          Title
                        </Label>
                        {isEditing ? (
                          <Input
                            id="title"
                            value={editData.personalInfo?.title || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "personalInfo",
                                "title",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.personalInfo.title}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="profession"
                          className="text-sm font-medium text-primary"
                        >
                          Profession
                        </Label>
                        {isEditing ? (
                          <Input
                            id="profession"
                            value={editData.personalInfo?.profession || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "personalInfo",
                                "profession",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.personalInfo.profession}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="institution"
                          className="text-sm font-medium text-primary"
                        >
                          Institution
                        </Label>
                        {isEditing ? (
                          <Input
                            id="institution"
                            value={editData.personalInfo?.institution || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "personalInfo",
                                "institution",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.personalInfo.institution}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="field"
                          className="text-sm font-medium text-primary"
                        >
                          Field
                        </Label>
                        {isEditing ? (
                          <Input
                            id="field"
                            value={editData.personalInfo?.field || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "personalInfo",
                                "field",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.personalInfo.field}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="specialization"
                          className="text-sm font-medium text-primary"
                        >
                          Specialization
                        </Label>
                        {isEditing ? (
                          <Input
                            id="specialization"
                            value={editData.personalInfo?.specialization || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "personalInfo",
                                "specialization",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.personalInfo.specialization}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center">
                      <MailIcon className="h-5 w-5 mr-2" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-primary"
                        >
                          Email
                        </Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            type="email"
                            value={editData.contact?.email || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "contact",
                                "email",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.contact.email || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-primary"
                        >
                          Phone
                        </Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={editData.contact?.phone || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "contact",
                                "phone",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.contact.phone || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="linkedIn"
                          className="text-sm font-medium text-primary"
                        >
                          LinkedIn
                        </Label>
                        {isEditing ? (
                          <Input
                            id="linkedIn"
                            value={editData.contact?.linkedIn || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "contact",
                                "linkedIn",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.contact.linkedIn || "Not provided"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="website"
                          className="text-sm font-medium text-primary"
                        >
                          Website
                        </Label>
                        {isEditing ? (
                          <Input
                            id="website"
                            value={editData.contact?.website || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "contact",
                                "website",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-foreground">
                            {profileData.contact.website || "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Overview */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center">
                      <BookOpenIcon className="h-5 w-5 mr-2" />
                      Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editData.overview || ""}
                        onChange={(e) => handleOverviewChange(e.target.value)}
                        placeholder="Tell us about your research interests, background, and expertise..."
                        className="min-h-[120px]"
                      />
                    ) : (
                      <p className="text-foreground">
                        {(profileData as any).overview ||
                          "No overview provided yet."}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Profile Stats */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">
                      Profile Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {profileData.summary?.education || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Education
                        </div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {profileData.summary?.experience || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Experience
                        </div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {profileData.summary?.publications || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Publications
                        </div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {profileData.summary?.awards || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Awards
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
