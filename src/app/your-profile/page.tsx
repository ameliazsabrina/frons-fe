"use client";
import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertCircleIcon,
  UserIcon,
  MailIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  BookOpenIcon,
  CheckCircleIcon,
  UploadIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  AwardIcon,
  FileTextIcon,
} from "lucide-react";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { isValidSolanaAddress } from "@/hooks/useProgram";
import { useCVRegistration } from "@/hooks/useCVRegistration";
import { Loading } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletConnection } from "@/components/wallet-connection";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

interface UserProfile {
  personalInfo: {
    fullName: string;
    title: string;
    profession: string;
    institution: string;
    location: string;
    field: string;
    specialization: string;
    photoUrl?: string;
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
  const { wallets: solanaWallets } = useSolanaWallets();
  const publicKey = solanaWallets[0]?.address;
  const validSolanaPublicKey = isValidSolanaAddress(publicKey)
    ? publicKey
    : undefined;
  const router = useRouter();

  const {
    cvData,
    updateUserProfile,
    checkCVRegistration,
    isLoading,
    error,
    uploadProfilePhoto,
    getUserProfile,
  } = useCVRegistration(validSolanaPublicKey);

  const [profileData, setProfileData] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hasCV, setHasCV] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const loadUserProfile = useCallback(async () => {
    if (!validSolanaPublicKey) return;

    try {
      console.log("Loading user profile for wallet:", validSolanaPublicKey);
      const cvStatus = await checkCVRegistration(validSolanaPublicKey);
      setHasCV(cvStatus);
      console.log("CV status:", cvStatus);

      if (cvStatus) {
        const result = await getUserProfile(validSolanaPublicKey);
        console.log("User profile result:", result);

        if (result?.success) {
          console.log(
            "Full profile data structure:",
            JSON.stringify(result.profile, null, 2)
          );
          setProfileData(result.profile);
          setEditData({
            personalInfo: { ...result.profile.personalInfo },
            contact: { ...result.profile.contact },
            overview: result.profile.overview || "",
          });

          if (result.profile.profilePhoto) {
            console.log(
              "Profile photo URL found at profile.profilePhoto:",
              result.profile.profilePhoto
            );
            setPhotoPreview(result.profile.profilePhoto);
          } else if (result.profile.personalInfo.photoUrl) {
            console.log(
              "Profile photo URL found at profile.personalInfo.photoUrl:",
              result.profile.personalInfo.photoUrl
            );
            setPhotoPreview(result.profile.personalInfo.photoUrl);
          } else {
            console.log("No profile photo found in the response");
          }
        } else {
          console.log("Failed to get user profile:", result?.message);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }, [validSolanaPublicKey, checkCVRegistration, getUserProfile]);

  useEffect(() => {
    if (connected && validSolanaPublicKey) {
      loadUserProfile();
    }
  }, [connected, validSolanaPublicKey, loadUserProfile]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setMessage("❌ Please select a valid image file (JPG or PNG)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage("❌ Image size must be less than 5MB");
        return;
      }

      setSelectedPhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const maxDimension = 800;
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas to Blob conversion failed"));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.7
          );
        };
        img.onerror = () => {
          reject(new Error("Image loading error"));
        };
      };
      reader.onerror = () => {
        reject(new Error("File reading error"));
      };
    });
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto || !validSolanaPublicKey) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setMessage(null);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const result = await uploadProfilePhoto(
        selectedPhoto,
        validSolanaPublicKey
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setMessage("✅ Profile photo updated successfully!");
        if (result.profilePhoto) {
          setPhotoPreview(result.profilePhoto);
          setEditData((prev: any) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              photoUrl: result.profilePhoto,
            },
          }));
        }
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (err) {
      console.error("Failed to upload photo:", err);
      setMessage(
        `❌ Failed to update profile photo: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
      if (profileData.profilePhoto) {
        setPhotoPreview(profileData.profilePhoto);
      } else if (profileData.personalInfo.photoUrl) {
        setPhotoPreview(profileData.personalInfo.photoUrl);
      }
    }
    setMessage(null);
    setSelectedPhoto(null);
  };

  const handleSave = async () => {
    if (!validSolanaPublicKey) return;

    try {
      setSaving(true);
      setMessage(null);

      if (selectedPhoto) {
        const photoResult = await uploadProfilePhoto(
          selectedPhoto,
          validSolanaPublicKey
        );
        if (photoResult.success && photoResult.profilePhoto) {
          setPhotoPreview(photoResult.profilePhoto);

          console.log("Photo uploaded successfully:", photoResult.profilePhoto);
        } else {
          setMessage(
            `⚠️ Photo upload: ${photoResult.message}. Continuing with profile update...`
          );
        }
      }

      const result = await updateUserProfile(validSolanaPublicKey, editData);

      if (result?.success) {
        setProfileData(result.profile);
        setIsEditing(false);
        setMessage("✅ Profile updated successfully!");
        setSelectedPhoto(null);

        if (result.profile.profilePhoto) {
          console.log(
            "Profile photo found in update response at profile.profilePhoto:",
            result.profile.profilePhoto
          );
          setPhotoPreview(result.profile.profilePhoto);
        } else if (result.profile.personalInfo.photoUrl) {
          console.log(
            "Profile photo found in update response at profile.personalInfo.photoUrl:",
            result.profile.personalInfo.photoUrl
          );
          setPhotoPreview(result.profile.personalInfo.photoUrl);
        }
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
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4">
                <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-primary">Profile</span>
                </div>
              </div>
            </div>
            <div className="container max-w-5xl mx-auto px-6 py-12">
              <div className="mb-12 text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 font-spectral font-bold tracking-tight">
                  Your Profile
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                  Manage your academic profile and credentials with ease
                </p>
              </div>
              <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm  transition-all duration-300">
                <CardHeader className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary">
                    Profile Access Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  <p className="text-muted-foreground mb-8 text-center text-lg">
                    Please connect your wallet to view and manage your profile.
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

  if (!hasCV) {
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
                  <span className="font-medium text-primary">Profile</span>
                </div>
              </div>
            </div>
            <div className="container max-w-5xl mx-auto px-6 py-12">
              <div className="mb-12 text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 font-spectral font-bold tracking-tight">
                  Your Profile
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                  Manage your academic profile and credentials with ease
                </p>
              </div>
              <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm  transition-all duration-300">
                <CardHeader className="text-center py-8">
                  <CardTitle className="text-2xl text-primary">
                    Register Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pb-8">
                  <p className="text-muted-foreground mb-8 text-center text-lg">
                    Please register your CV to create and view your profile.
                  </p>
                  <Button
                    onClick={() => router.push("/register-cv")}
                    size="lg"
                    className="px-8 py-3 text-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex w-full">
        <OverviewSidebar connected={connected} />
        <SidebarInset className="flex-1">
          <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4">
              <SidebarTrigger className="w-10 h-10 hover:bg-primary/10 transition-colors" />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="font-medium text-primary">Profile</span>
              </div>
            </div>
          </div>
          <div className="container max-w-6xl mx-auto px-6 py-12">
            <div className="mb-12 text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 font-spectral font-bold tracking-tight">
                Your Profile
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                Manage your academic profile and credentials with ease
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-16 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loading />
                  <p className="text-muted-foreground text-lg">
                    Loading your profile...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert className="border-red-200 bg-red-50/80 mb-8 rounded-xl shadow-sm">
                <AlertCircleIcon className="h-5 w-5" />
                <AlertDescription className="text-red-800 text-lg">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Success/Error Messages */}
            {message && (
              <Alert
                className={
                  message.includes("✅")
                    ? "border-green-200 bg-green-50/80 mb-8 rounded-xl shadow-sm"
                    : "border-red-200 bg-red-50/80 mb-8 rounded-xl shadow-sm"
                }
              >
                <CheckCircleIcon className="h-5 w-5" />
                <AlertDescription
                  className={
                    message.includes("✅")
                      ? "text-green-800 text-lg"
                      : "text-red-800 text-lg"
                  }
                >
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {profileData && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                  <Card className="lg:col-span-1 shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300  overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40"></div>
                    <CardHeader className="flex flex-col items-center justify-center -mt-16 pt-0 border-0 pb-6">
                      <div className="relative group mb-6">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-4 border-white shadow-xl">
                          {photoPreview ? (
                            <img
                              src={photoPreview || "/placeholder.svg"}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-16 w-16 text-primary" />
                          )}
                        </div>
                        {isEditing ? (
                          <label
                            htmlFor="photo-upload"
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300"
                          >
                            <UploadIcon className="h-6 w-6 text-white" />
                            <span className="text-white text-xs mt-1 font-medium">
                              Change Photo
                            </span>
                            <input
                              id="photo-upload"
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={handlePhotoChange}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg">
                            <UserIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-primary leading-tight">
                          {profileData.personalInfo.fullName}
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {profileData.personalInfo.title}
                        </p>
                        <p className="text-muted-foreground text-sm font-medium">
                          {profileData.personalInfo.institution}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-3 mt-8 w-full">
                        {!isEditing ? (
                          <Button onClick={handleEditStart} variant="outline">
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        ) : (
                          <div className="flex flex-col space-y-2 w-full">
                            <Button
                              onClick={handleSave}
                              disabled={saving || uploading}
                              className="transition-all duration-300"
                            >
                              <SaveIcon className="h-4 w-4 mr-2" />
                              {saving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                              onClick={handleEditCancel}
                              variant="outline"
                              className="transition-all duration-300 "
                            >
                              <XIcon className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                      {uploading && (
                        <div className="w-full mt-6 space-y-3">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-primary">
                              Uploading photo...
                            </span>
                            <span className="text-primary">
                              {uploadProgress}%
                            </span>
                          </div>
                          <Progress
                            value={uploadProgress}
                            className="w-full h-3 rounded-full bg-primary/10"
                          />
                        </div>
                      )}
                    </CardHeader>
                  </Card>

                  <div className="lg:col-span-3 space-y-8">
                    <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300 ">
                      <CardHeader className="border-b border-gray-100/50 pb-6">
                        <CardTitle className="text-2xl text-primary font-bold flex items-center">
                          <GraduationCapIcon className="h-6 w-6 mr-3" />
                          Academic Impact
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                          Your academic achievements at a glance
                        </p>
                      </CardHeader>
                      <CardContent className="pt-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl transition-all duration-300  border border-primary/10">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <GraduationCapIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-3xl font-bold text-primary mb-1">
                              {profileData.summary?.education || 0}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                              Education
                            </div>
                          </div>
                          <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl transition-all duration-300  border border-primary/10">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <BriefcaseIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-3xl font-bold text-primary mb-1">
                              {profileData.summary?.experience || 0}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                              Experience
                            </div>
                          </div>
                          <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl transition-all duration-300  border border-primary/10">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <FileTextIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-3xl font-bold text-primary mb-1">
                              {profileData.summary?.publications || 0}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                              Publications
                            </div>
                          </div>
                          <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl transition-all duration-300  border border-primary/10">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <AwardIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-3xl font-bold text-primary mb-1">
                              {profileData.summary?.awards || 0}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                              Awards
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300 ">
                      <CardHeader className="border-b border-gray-100/50 pb-6">
                        <CardTitle className="text-2xl text-primary font-bold flex items-center">
                          <BookOpenIcon className="h-6 w-6 mr-3" />
                          Professional Overview
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                          Share your research interests and expertise
                        </p>
                      </CardHeader>
                      <CardContent className="pt-8">
                        {isEditing ? (
                          <Textarea
                            value={editData.overview || ""}
                            onChange={(e) =>
                              handleOverviewChange(e.target.value)
                            }
                            placeholder="Tell us about your research interests, background, and expertise..."
                            className="min-h-[150px] border-primary/20 focus:border-primary focus:ring-primary/30 text-base leading-relaxed"
                          />
                        ) : (
                          <div className="prose prose-gray max-w-none">
                            <p className="text-foreground leading-relaxed text-base">
                              {(profileData as any).overview ||
                                "No overview provided yet. Click 'Edit Profile' to add your professional summary."}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300 ">
                      <CardHeader className="border-b border-gray-100/50 pb-6">
                        <CardTitle className="text-2xl text-primary font-bold flex items-center">
                          <UserIcon className="h-6 w-6 mr-3" />
                          Personal Information
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                          Your basic profile details
                        </p>
                      </CardHeader>
                      <CardContent className="pt-8 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label
                              htmlFor="fullName"
                              className="text-sm font-semibold text-primary flex items-center"
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
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <p className="text-foreground font-medium">
                                  {profileData.personalInfo.fullName}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="title"
                              className="text-sm font-semibold text-primary"
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
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <p className="text-foreground font-medium">
                                  {profileData.personalInfo.title}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="profession"
                              className="text-sm font-semibold text-primary"
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
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <p className="text-foreground font-medium">
                                  {profileData.personalInfo.profession}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="institution"
                              className="text-sm font-semibold text-primary"
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
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <p className="text-foreground font-medium">
                                  {profileData.personalInfo.institution}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="field"
                              className="text-sm font-semibold text-primary"
                            >
                              Field of Study
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
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <p className="text-foreground font-medium">
                                  {profileData.personalInfo.field}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="specialization"
                              className="text-sm font-semibold text-primary"
                            >
                              Specialization
                            </Label>
                            {isEditing ? (
                              <Input
                                id="specialization"
                                value={
                                  editData.personalInfo?.specialization || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "personalInfo",
                                    "specialization",
                                    e.target.value
                                  )
                                }
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <p className="text-foreground font-medium">
                                  {profileData.personalInfo.specialization}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-xl border border-gray-100/80 rounded-2xl bg-white/95 backdrop-blur-sm transition-all duration-300 ">
                      <CardHeader className="border-b border-gray-100/50 pb-6">
                        <CardTitle className="text-2xl text-primary font-bold flex items-center">
                          <MailIcon className="h-6 w-6 mr-3" />
                          Contact Information
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                          How others can reach you
                        </p>
                      </CardHeader>
                      <CardContent className="pt-8 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label
                              htmlFor="email"
                              className="text-sm font-semibold text-primary"
                            >
                              Email Address
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
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <div className="flex items-center">
                                  <MailIcon className="h-4 w-4 mr-3 text-primary/70" />
                                  <p className="text-foreground font-medium">
                                    {profileData.contact.email ||
                                      "Not provided"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="phone"
                              className="text-sm font-semibold text-primary"
                            >
                              Phone Number
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
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <p className="text-foreground font-medium">
                                  {profileData.contact.phone || "Not provided"}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="linkedIn"
                              className="text-sm font-semibold text-primary"
                            >
                              LinkedIn Profile
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
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <p className="text-foreground font-medium">
                                  {profileData.contact.linkedIn ||
                                    "Not provided"}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="website"
                              className="text-sm font-semibold text-primary"
                            >
                              Personal Website
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
                                className="border-primary/20 focus:border-primary focus:ring-primary/30 text-base"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/10">
                                <p className="text-foreground font-medium">
                                  {profileData.contact.website ||
                                    "Not provided"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
