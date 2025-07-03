"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  MapPinIcon,
  MailIcon,
  BuildingIcon,
  LinkIcon,
  PlusIcon,
  LoaderIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import axios from "axios";
import { useToast } from "@/components/ui/toast";
import { useLoading } from "@/context/LoadingContext";

interface ProfileData {
  name: string;
  title: string;
  profession: string;
  institution: string;
  location: string;
  email: string;
  bio: string;
  orcid: string;
  website: string;
  phone: string;
  linkedIn: string;
  github: string;
  fields: string[];
  specializations: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  publications: Array<{
    title: string;
    venue: string;
    year: string;
  }>;
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
  }>;
  awards: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface ApiProfileResponse {
  success: boolean;
  message: string;
  profile: {
    id: number;
    filename: string;
    createdAt: string;
    walletAddress: string;
    cvData: any;
    personalInfo: {
      fullName: string;
      title: string;
      profession: string;
      institution: string;
      location: string;
    };
    contact: {
      email: string;
      linkedIn: string;
      github: string;
      website: string;
      phone: string;
    };
    overview: string;
    summary: {
      education: number;
      experience: number;
      publications: number;
      awards: number;
    };
  };
}

export default function YourProfilePage() {
  const { authenticated: connected, user } = usePrivy();
  const { wallets } = useWallets();
  const publicKey = wallets[0]?.address;
  const router = useRouter();
  const { showToast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const { isLoading } = useLoading();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const [showWalletRegistration, setShowWalletRegistration] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    title: "",
    profession: "",
    institution: "",
    location: "",
    email: "",
    bio: "",
    orcid: "",
    website: "",
    phone: "",
    linkedIn: "",
    github: "",
    fields: [],
    specializations: [],
    education: [],
    publications: [],
    experience: [],
    awards: [],
  });

  const [editData, setEditData] = useState<ProfileData>(profileData);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!connected || !publicKey) {
        setLoading(false);
        setShowWalletRegistration(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const walletAddress = publicKey.toString();
        const requestUrl = `${apiUrl}/api/parse-cv/user/profile/${walletAddress}`;

        console.log("Fetching profile from:", requestUrl);
        console.log("Wallet address:", walletAddress);
        console.log("API URL:", apiUrl);

        const response = await axios.get<ApiProfileResponse>(requestUrl, {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.success && response.data.profile) {
          const profile = response.data.profile;

          const mappedProfile: ProfileData = {
            name: profile.personalInfo?.fullName || "",
            title: profile.personalInfo?.title || "",
            profession: profile.personalInfo?.profession || "",
            institution: profile.personalInfo?.institution || "",
            location: profile.personalInfo?.location || "",
            email: profile.contact?.email || "",
            bio: profile.overview || "",
            orcid: "",
            website: profile.contact?.website || "",
            phone: profile.contact?.phone || "",
            linkedIn: profile.contact?.linkedIn || "",
            github: profile.contact?.github || "",
            fields: extractFields(profile.cvData),
            specializations:
              profile.cvData?.specializations ||
              extractSpecializations(profile.cvData),
            education: mapEducation(profile.cvData?.education || []),
            publications: mapPublications(profile.cvData?.publications || []),
            experience: mapExperience(profile.cvData?.experience || []),
            awards: mapAwards(profile.cvData?.awards || []),
          };

          setProfileData(mappedProfile);
          setEditData(mappedProfile);
          showToast("Profile loaded successfully", "success");
        } else {
          setError("Failed to load profile data");
          showToast("Failed to load profile data", "error");
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);

        if (err.code === "ECONNABORTED") {
          setError(
            "Request timed out. Please check if the API server is running."
          );
          showToast(
            "Request timed out. Please check if the API server is running.",
            "error"
          );
        } else if (err.message === "Network Error") {
          setError(
            `Network Error: Cannot connect to API server at ${apiUrl}. Please check if the server is running and accessible.`
          );
          showToast(
            `Network Error: Cannot connect to API server at ${apiUrl}. Please check if the server is running and accessible.`,
            "error"
          );
        } else if (err.response?.status === 404) {
          console.log("Profile not found (404), showing registration prompt");
          setShowRegistrationPrompt(true);
          showToast(
            "Profile not found. Please register your CV first.",
            "info"
          );
        } else if (err.response?.status === 500) {
          setError("Server error occurred. Please try again later.");
          showToast("Server error occurred. Please try again later.", "error");
        } else if (err.response) {
          setError(
            err.response?.data?.message ||
              `API Error: ${err.response.status} - ${err.response.statusText}`
          );
          showToast(
            err.response?.data?.message ||
              `API Error: ${err.response.status} - ${err.response.statusText}`,
            "error"
          );
        } else {
          setError(
            `Connection failed: ${err.message}. Check API server status.`
          );
          showToast(
            `Connection failed: ${err.message}. Check API server status.`,
            "error"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [connected, publicKey, apiUrl, showToast]);

  const handleRegisterWallet = () => {
    router.push("/register-wallet");
  };

  const extractFields = (cvData: any): string[] => {
    const fields = [];
    if (cvData?.selfIdentity?.field) {
      fields.push(cvData.selfIdentity.field);
    }
    if (cvData?.selfIdentity?.profession) {
      fields.push(cvData.selfIdentity.profession);
    }
    return [...new Set(fields)]; // Remove duplicates
  };

  const extractSpecializations = (cvData: any): string[] => {
    const specializations: string[] = [];
    if (cvData?.experience) {
      cvData.experience.forEach((exp: any) => {
        if (exp.description) {
          const skills =
            exp.description.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
          specializations.push(...skills.slice(0, 3));
        }
      });
    }
    return [...new Set(specializations)].slice(0, 5);
  };

  const mapEducation = (
    education: any[]
  ): Array<{ degree: string; institution: string; year: string }> => {
    return education.map((edu) => ({
      degree: edu.degree || "",
      institution: edu.institution || "",
      year: edu.endDate || edu.year || "",
    }));
  };

  const mapPublications = (
    publications: any[]
  ): Array<{ title: string; venue: string; year: string }> => {
    return publications.map((pub) => ({
      title: pub.title || "",
      venue: pub.venue || "",
      year: pub.date || pub.year || "",
    }));
  };

  const mapExperience = (
    experience: any[]
  ): Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
  }> => {
    return experience.map((exp) => ({
      position: exp.position || "",
      company: exp.company || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
    }));
  };

  const mapAwards = (
    awards: any[]
  ): Array<{ name: string; issuer: string; date: string }> => {
    return awards.map((award) => ({
      name: award.name || "",
      issuer: award.issuer || "",
      date: award.date || "",
    }));
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (
    field: "fields" | "specializations",
    value: string
  ) => {
    const arrayValue = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setEditData((prev) => ({
      ...prev,
      [field]: arrayValue,
    }));
  };

  const handleEducationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setEditData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addEducation = () => {
    setEditData((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "" }],
    }));
  };

  const removeEducation = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handlePublicationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setEditData((prev) => ({
      ...prev,
      publications: prev.publications.map((pub, i) =>
        i === index ? { ...pub, [field]: value } : pub
      ),
    }));
  };

  const addPublication = () => {
    setEditData((prev) => ({
      ...prev,
      publications: [...prev.publications, { title: "", venue: "", year: "" }],
    }));
  };

  const removePublication = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      publications: prev.publications.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!connected || !publicKey) {
      showToast("Please connect your wallet first", "error");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const walletAddress = publicKey.toString();

      const updatePayload = {
        personalInfo: {
          fullName: editData.name,
          title: editData.title,
          profession: editData.profession,
          institution: editData.institution,
          location: editData.location,
          field: editData.fields.join(", "),
          specialization: editData.specializations.join(", "),
        },
        contact: {
          email: editData.email,
          phone: editData.phone,
          linkedIn: editData.linkedIn,
          github: editData.github,
          website: editData.website,
        },
        overview: editData.bio,
      };

      console.log("Updating profile with data:", updatePayload);

      const response = await axios.patch(
        `${apiUrl}/api/parse-cv/user/profile/${walletAddress}`,
        updatePayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        console.log("✅ Profile updated successfully:", response.data.message);
        console.log("Updated fields:", response.data.updatedFields);

        if (response.data.profile) {
          const updatedProfile = response.data.profile;
          const mappedProfile: ProfileData = {
            name: updatedProfile.personalInfo?.fullName || "",
            title: updatedProfile.personalInfo?.title || "",
            profession: updatedProfile.personalInfo?.profession || "",
            institution: updatedProfile.personalInfo?.institution || "",
            location: updatedProfile.personalInfo?.location || "",
            email: updatedProfile.contact?.email || "",
            bio: updatedProfile.overview || "",
            orcid: "",
            website: updatedProfile.contact?.website || "",
            phone: updatedProfile.contact?.phone || "",
            linkedIn: updatedProfile.contact?.linkedIn || "",
            github: updatedProfile.contact?.github || "",
            fields: extractFields(updatedProfile.cvData),
            specializations:
              updatedProfile.cvData?.specializations ||
              extractSpecializations(updatedProfile.cvData),
            education: mapEducation(updatedProfile.cvData?.education || []),
            publications: mapPublications(
              updatedProfile.cvData?.publications || []
            ),
            experience: mapExperience(updatedProfile.cvData?.experience || []),
            awards: mapAwards(updatedProfile.cvData?.awards || []),
          };

          setProfileData(mappedProfile);
          setEditData(mappedProfile);
        } else {
          setProfileData(editData);
        }

        setIsEditing(false);
        showToast("Profile updated successfully!", "success");
      } else {
        setError(response.data.message || "Failed to update profile");
        showToast(response.data.message || "Failed to update profile", "error");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);

      if (err.code === "ECONNABORTED") {
        setError("Request timed out. Please try again.");
        showToast("Request timed out. Please try again.", "error");
      } else if (err.response) {
        const errorMsg =
          err.response.data?.message ||
          err.response.data?.error ||
          "Failed to update profile";
        setError(errorMsg);
        showToast(errorMsg, "error");
      } else if (err.message) {
        setError(err.message);
        showToast(err.message, "error");
      } else {
        setError("Failed to update profile. Please try again.");
        showToast("Failed to update profile. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-white flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="flex flex-col min-h-screen">
              <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center gap-2 px-4 py-3">
                  <SidebarTrigger />
                  <Separator orientation="vertical" className="h-6" />
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <LoaderIcon className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Loading your profile...
                  </p>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (showWalletRegistration) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-white flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="flex flex-col min-h-screen">
              <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center gap-2 px-4 py-3">
                  <SidebarTrigger />
                  <Separator orientation="vertical" className="h-6" />
                </div>
              </div>
              <div className="flex-1 p-4 sm:p-6">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                    Your Profile
                  </h1>
                  <p className="text-primary/80 text-sm sm:text-md max-w-2xl mx-auto">
                    Manage your academic profile and research information
                  </p>
                </div>
                <div className="flex-col items-center justify-center mt-16">
                  <Card className="max-w-md mx-auto shadow-lg border border-gray-200 rounded-xl bg-white">
                    <CardContent className="p-8 text-center">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Wallet Required
                      </h2>
                      <p className="text-gray-600 mb-6">
                        You need to connect or create a Solana wallet to access
                        your profile.
                      </p>
                      <Button
                        onClick={handleRegisterWallet}
                        className="w-full  text-sm"
                      >
                        Register Wallet
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-white flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="flex flex-col min-h-screen">
              <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center gap-2 px-4 py-3">
                  <SidebarTrigger />
                  <Separator orientation="vertical" className="h-6" />
                </div>
              </div>
              <div className="flex-1 p-4 sm:p-6">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                    Your Profile
                  </h1>
                  <p className="text-primary/80 text-sm sm:text-md max-w-2xl mx-auto">
                    Manage your academic profile and research information
                  </p>
                </div>
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (showRegistrationPrompt) {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-white flex w-full">
          <OverviewSidebar connected={connected} />
          <SidebarInset className="flex-1">
            <div className="flex flex-col min-h-screen">
              <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="flex items-center gap-2 px-4 py-3">
                  <SidebarTrigger />
                  <Separator orientation="vertical" className="h-6" />
                </div>
              </div>
              <div className="flex-1 p-4 sm:p-6">
                <div className="mb-8 text-center">
                  <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                    Your Profile
                  </h1>
                  <p className="text-primary/80 text-sm sm:text-md max-w-2xl mx-auto">
                    Manage your academic profile and research information
                  </p>
                </div>
                <div className="flex-col items-center justify-center mt-16">
                  <Card className="max-w-md mx-auto shadow-lg border border-gray-200 rounded-xl bg-white">
                    <CardContent className="p-8 text-center">
                      <UserIcon className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Registration Required
                      </h2>
                      <p className="text-gray-600 mb-6">
                        You have not registered your identity, please do
                        register it first.
                      </p>
                      <Button
                        onClick={() => router.push("/register-cv")}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        Register Your Profile
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white flex w-full">
        <OverviewSidebar connected={connected} />

        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen">
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center gap-2 px-4 py-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6">
              <div className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                  Your Profile
                </h1>
                <p className="text-primary/80 text-sm sm:text-md max-w-2xl mx-auto">
                  Manage your academic profile and research information
                </p>
              </div>

              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 mb-8">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0"></div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {isEditing ? (
                            <Input
                              value={editData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              className="text-3xl font-bold text-gray-900 border-0 p-0 focus:ring-0"
                              placeholder="Your Name"
                            />
                          ) : (
                            <h1 className="text-3xl font-bold text-gray-900">
                              {profileData.name || "Your Name"}
                            </h1>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                onClick={handleSave}
                                size="sm"
                                variant="default"
                              >
                                <SaveIcon className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                              <Button
                                onClick={handleCancel}
                                variant="outline"
                                size="sm"
                              >
                                <XIcon className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => setIsEditing(true)}
                              variant="outline"
                              size="sm"
                            >
                              <EditIcon className="h-4 w-4 mr-2" />
                              Edit Profile
                            </Button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <Input
                          value={editData.title}
                          onChange={(e) =>
                            handleInputChange("title", e.target.value)
                          }
                          className="text-lg text-gray-600 mb-4 border-gray-300"
                          placeholder="Your Title"
                        />
                      ) : (
                        <p className="text-lg text-gray-600 mb-4">
                          {profileData.title || "Your Title"}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <BuildingIcon className="h-4 w-4" />
                          {isEditing ? (
                            <Input
                              value={editData.institution}
                              onChange={(e) =>
                                handleInputChange("institution", e.target.value)
                              }
                              className="border-gray-300 text-sm"
                              placeholder="Institution"
                            />
                          ) : (
                            <span>
                              {profileData.institution || "Institution"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPinIcon className="h-4 w-4" />
                          {isEditing ? (
                            <Input
                              value={editData.location}
                              onChange={(e) =>
                                handleInputChange("location", e.target.value)
                              }
                              className="border-gray-300 text-sm"
                              placeholder="Location"
                            />
                          ) : (
                            <span>{profileData.location || "Location"}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MailIcon className="h-4 w-4" />
                          {isEditing ? (
                            <Input
                              value={editData.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              className="border-gray-300 text-sm"
                              placeholder="Email"
                            />
                          ) : (
                            <span>{profileData.email || "Email"}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <LinkIcon className="h-4 w-4" />
                          {isEditing ? (
                            <Input
                              value={editData.orcid}
                              onChange={(e) =>
                                handleInputChange("orcid", e.target.value)
                              }
                              className="border-gray-300 text-sm"
                              placeholder="ORCID ID"
                            />
                          ) : (
                            <span>
                              ORCID: {profileData.orcid || "Not provided"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {profileData.fields.map((field, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Bio Section */}
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">
                        About
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea
                          value={editData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          className="min-h-[120px] border-gray-300"
                          placeholder="Tell us about your research and interests..."
                        />
                      ) : (
                        <p className="text-gray-700 leading-relaxed">
                          {profileData.bio || "No bio available"}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Research Fields */}
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">
                        Research Fields
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Label
                            htmlFor="fields"
                            className="text-sm font-medium text-gray-700"
                          >
                            Fields (comma-separated)
                          </Label>
                          <Input
                            id="fields"
                            value={editData.fields.join(", ")}
                            onChange={(e) =>
                              handleArrayChange("fields", e.target.value)
                            }
                            className="border-gray-300"
                            placeholder="e.g., Computer Science, Data Science"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profileData.fields.length > 0 ? (
                            profileData.fields.map((field, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-primary/10 text-primary"
                              >
                                {field}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No research fields specified
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Specializations */}
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">
                        Specializations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Label
                            htmlFor="specializations"
                            className="text-sm font-medium text-gray-700"
                          >
                            Specializations (comma-separated)
                          </Label>
                          <Input
                            id="specializations"
                            value={editData.specializations.join(", ")}
                            onChange={(e) =>
                              handleArrayChange(
                                "specializations",
                                e.target.value
                              )
                            }
                            className="border-gray-300"
                            placeholder="e.g., Machine Learning, Blockchain, Distributed Systems"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profileData.specializations.length > 0 ? (
                            profileData.specializations.map((spec, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-gray-50 text-gray-700 border-gray-200"
                              >
                                {spec}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No specializations specified
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-primary">
                          Previous Publications
                        </CardTitle>
                        {isEditing && (
                          <Button
                            onClick={addPublication}
                            variant="outline"
                            size="sm"
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(isEditing
                          ? editData.publications
                          : profileData.publications
                        ).length > 0 ? (
                          (isEditing
                            ? editData.publications
                            : profileData.publications
                          ).map((pub, index) => (
                            <div
                              key={index}
                              className="border-b border-gray-100 pb-4 last:border-b-0"
                            >
                              {isEditing ? (
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-2">
                                      <div>
                                        <Label className="text-xs font-medium text-gray-700 mb-1 block">
                                          Title
                                        </Label>
                                        <Input
                                          value={pub.title}
                                          onChange={(e) =>
                                            handlePublicationChange(
                                              index,
                                              "title",
                                              e.target.value
                                            )
                                          }
                                          className="border-gray-300 text-sm"
                                          placeholder="Publication title"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs font-medium text-gray-700 mb-1 block">
                                          Venue
                                        </Label>
                                        <Input
                                          value={pub.venue}
                                          onChange={(e) =>
                                            handlePublicationChange(
                                              index,
                                              "venue",
                                              e.target.value
                                            )
                                          }
                                          className="border-gray-300 text-sm"
                                          placeholder="Journal/Conference"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-xs font-medium text-gray-700 mb-1 block">
                                          Year
                                        </Label>
                                        <Input
                                          value={pub.year}
                                          onChange={(e) =>
                                            handlePublicationChange(
                                              index,
                                              "year",
                                              e.target.value
                                            )
                                          }
                                          className="border-gray-300 text-sm"
                                          placeholder="2024"
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => removePublication(index)}
                                      variant="ghost"
                                      size="sm"
                                      className="ml-2 text-red-600 hover:text-red-800"
                                    >
                                      <XIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h4 className="font-semibold text-gray-900 leading-tight mb-1">
                                    {pub.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-1">
                                    {pub.venue}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {pub.year}
                                  </p>
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No publications available
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">
                        Contact & Links
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label
                          htmlFor="website"
                          className="text-sm font-medium text-gray-700"
                        >
                          Website
                        </Label>
                        {isEditing ? (
                          <Input
                            id="website"
                            value={editData.website}
                            onChange={(e) =>
                              handleInputChange("website", e.target.value)
                            }
                            className="mt-1 border-gray-300"
                            placeholder="https://yourwebsite.com"
                          />
                        ) : profileData.website ? (
                          <a
                            href={
                              profileData.website.startsWith("http")
                                ? profileData.website
                                : `https://${profileData.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 block"
                          >
                            {profileData.website}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">
                            No website provided
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          LinkedIn
                        </Label>
                        {profileData.linkedIn ? (
                          <a
                            href={
                              profileData.linkedIn.startsWith("http")
                                ? profileData.linkedIn
                                : `https://${profileData.linkedIn}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 block"
                          >
                            {profileData.linkedIn}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">
                            No LinkedIn provided
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          GitHub
                        </Label>
                        {profileData.github ? (
                          <a
                            href={
                              profileData.github.startsWith("http")
                                ? profileData.github
                                : `https://${profileData.github}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline mt-1 block"
                          >
                            {profileData.github}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">
                            No GitHub provided
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Education */}
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-primary">
                          Education
                        </CardTitle>
                        {isEditing && (
                          <Button
                            onClick={addEducation}
                            variant="outline"
                            size="sm"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(isEditing
                          ? editData.education
                          : profileData.education
                        ).length > 0 ? (
                          (isEditing
                            ? editData.education
                            : profileData.education
                          ).map((edu, index) => (
                            <div
                              key={index}
                              className="border-b border-gray-100 pb-3 last:border-b-0"
                            >
                              {isEditing ? (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1 space-y-2">
                                      <Input
                                        value={edu.degree}
                                        onChange={(e) =>
                                          handleEducationChange(
                                            index,
                                            "degree",
                                            e.target.value
                                          )
                                        }
                                        className="border-gray-300 text-sm"
                                        placeholder="Degree"
                                      />
                                      <Input
                                        value={edu.institution}
                                        onChange={(e) =>
                                          handleEducationChange(
                                            index,
                                            "institution",
                                            e.target.value
                                          )
                                        }
                                        className="border-gray-300 text-sm"
                                        placeholder="Institution"
                                      />
                                      <Input
                                        value={edu.year}
                                        onChange={(e) =>
                                          handleEducationChange(
                                            index,
                                            "year",
                                            e.target.value
                                          )
                                        }
                                        className="border-gray-300 text-sm"
                                        placeholder="Year"
                                      />
                                    </div>
                                    <Button
                                      onClick={() => removeEducation(index)}
                                      variant="ghost"
                                      size="sm"
                                      className="ml-2 text-red-600 hover:text-red-800"
                                    >
                                      <XIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h4 className="font-semibold text-gray-900">
                                    {edu.degree}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {edu.institution}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {edu.year}
                                  </p>
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No education information available
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
