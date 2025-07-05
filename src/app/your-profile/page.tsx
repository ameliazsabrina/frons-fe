"use client";
import React, { useState, useEffect, useCallback } from "react";
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
  ImageIcon,
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
        // Get the full user profile which includes the profile photo
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

          // Set profile photo if available
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
          // If photo upload fails, show message but continue with profile update
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
                  <CardTitle className="text-xl text-primary text-center">
                    Profile Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-center">
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
                  <CardTitle className="text-xl text-primary text-center">
                    CV Registration Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <p className="text-muted-foreground mb-6">
                    Please register your CV to create and view your profile.
                  </p>
                  <Button onClick={() => router.push("/register-cv")}>
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
      <div className="min-h-screen bg-primary/5 flex w-full ">
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
              <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral font-bold tracking-tight">
                Your Profile
              </h1>
              <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                Manage your academic profile and credentials
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Loading />
                </div>
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
                    ? "border-green-200 bg-green-50 mb-6"
                    : "border-red-200 bg-red-50 mb-6"
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
                {/* Profile Header and Main Content in a grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Left: Photo and Main Info */}
                  <Card className="shadow-md border border-gray-100 rounded-xl bg-white/95 transition-all duration-300 md:col-span-1 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary/80 to-primary/60"></div>
                    <CardHeader className="flex flex-col items-center justify-center -mt-12 pt-0 border-0">
                      <div className="relative group mb-4">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-4 border-white shadow-md">
                          {photoPreview ? (
                            <img
                              src={photoPreview}
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
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                          >
                            <UploadIcon className="h-6 w-6 text-white" />
                            <span className="text-white text-xs mt-1">
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
                          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-md">
                            <UserIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-primary">
                          {profileData.personalInfo.fullName}
                        </h2>
                        <p className="text-muted-foreground">
                          {profileData.personalInfo.title} at{" "}
                          {profileData.personalInfo.institution}
                        </p>
                      </div>
                      <div className="flex space-x-2 mt-6 w-full justify-center">
                        {!isEditing ? (
                          <Button
                            onClick={handleEditStart}
                            variant="outline"
                            className="transition-all duration-300 hover:bg-primary/10"
                          >
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={handleSave}
                              disabled={saving || uploading}
                              className="transition-all duration-300"
                            >
                              <SaveIcon className="h-4 w-4 mr-2" />
                              {saving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              onClick={handleEditCancel}
                              variant="outline"
                              className="transition-all duration-300"
                            >
                              <XIcon className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                      {uploading && (
                        <div className="w-full mt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Uploading photo...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress
                              value={uploadProgress}
                              className="w-full h-2 rounded-full bg-primary/10"
                            />
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-center space-x-4 mt-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-bold text-primary">
                            {profileData.summary?.publications || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Publications
                          </span>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-bold text-primary">
                            {profileData.summary?.experience || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Experience
                          </span>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-bold text-primary">
                            {profileData.summary?.awards || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Awards
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: Main Profile Content */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Profile Stats */}
                    <Card className="shadow-md border border-gray-100 rounded-xl bg-white/95 transition-all duration-300">
                      <CardHeader className="border-b-0">
                        <CardTitle className="text-lg text-primary">
                          Academic Impact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg transition-all duration-300">
                            <div className="text-2xl font-bold text-primary">
                              {profileData.summary?.education || 0}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Education
                            </div>
                          </div>
                          <div className="text-center p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg transition-all duration-300">
                            <div className="text-2xl font-bold text-primary">
                              {profileData.summary?.experience || 0}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Experience
                            </div>
                          </div>
                          <div className="text-center p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg transition-all duration-300">
                            <div className="text-2xl font-bold text-primary">
                              {profileData.summary?.publications || 0}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Publications
                            </div>
                          </div>
                          <div className="text-center p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg transition-all duration-300">
                            <div className="text-2xl font-bold text-primary">
                              {profileData.summary?.awards || 0}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Awards
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Overview */}
                    <Card className="shadow-md border border-gray-100 rounded-xl bg-white/95 transition-all duration-300">
                      <CardHeader className="border-b-0">
                        <CardTitle className="text-lg text-primary flex items-center">
                          <BookOpenIcon className="h-5 w-5 mr-2" />
                          Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {isEditing ? (
                          <Textarea
                            value={editData.overview || ""}
                            onChange={(e) =>
                              handleOverviewChange(e.target.value)
                            }
                            placeholder="Tell us about your research interests, background, and expertise..."
                            className="min-h-[120px] border-primary/20 focus:border-primary focus:ring-primary/30"
                          />
                        ) : (
                          <p className="text-foreground leading-relaxed">
                            {(profileData as any).overview ||
                              "No overview provided yet."}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card className="shadow-md border border-gray-100 rounded-xl bg-white/95 transition-all duration-300">
                      <CardHeader className="border-b-0">
                        <CardTitle className="text-lg text-primary flex items-center">
                          <UserIcon className="h-5 w-5 mr-2" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded">
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded">
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded">
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded">
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded">
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded">
                                {profileData.personalInfo.specialization}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="shadow-md border border-gray-100 rounded-xl bg-white/95 transition-all duration-300">
                      <CardHeader className="border-b-0">
                        <CardTitle className="text-lg text-primary flex items-center">
                          <MailIcon className="h-5 w-5 mr-2" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded flex items-center">
                                <MailIcon className="h-4 w-4 mr-2 text-primary/70" />
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded">
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded">
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
                                className="mt-1 border-primary/20 focus:border-primary focus:ring-primary/30"
                              />
                            ) : (
                              <p className="mt-1 text-foreground bg-primary/5 p-2 rounded">
                                {profileData.contact.website || "Not provided"}
                              </p>
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
