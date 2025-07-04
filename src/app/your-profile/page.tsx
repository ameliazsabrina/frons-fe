"use client";
import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import SidebarProvider from "@/provider/SidebarProvider";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { isValidSolanaAddress } from "@/hooks/useProgram";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Implement API call to load profile
        // For now, using mock data
        setProfile(null);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-primary/5 flex w-full">
        <OverviewSidebar connected={connected} />
        <SidebarInset className="flex-1">
          <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-2 px-4 py-3">
              <SidebarTrigger className="" />
              <Separator orientation="vertical" className="h-6" />
            </div>
          </div>
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl text-primary mb-2 font-spectral uppercase tracking-tight">
                Your Profile
              </h1>
              <p className="text-muted-foreground text-sm sm:text-md max-w-2xl mx-auto">
                View and manage your academic profile and credentials
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-8 text-center">
                  <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-primary mb-2">
                    Error
                  </h2>
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            ) : !profile ? (
              <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-8 text-center">
                  <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-primary mb-2">
                    No Profile Found
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Please register your CV to create your academic profile.
                  </p>
                  <Button
                    variant="default"
                    onClick={() => (window.location.href = "/register-cv")}
                  >
                    Register CV
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Personal Info Card */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-primary mb-1">
                          {profile.personalInfo.fullName}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          {profile.personalInfo.title} •{" "}
                          {profile.personalInfo.institution}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            {profile.personalInfo.field}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            {profile.personalInfo.specialization}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            {profile.personalInfo.location}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4 text-center">
                      <BookIcon className="h-6 w-6 text-primary/20 mx-auto mb-2" />
                      <p className="text-2xl font-semibold text-primary">
                        {profile.summary.education}
                      </p>
                      <p className="text-sm text-muted-foreground">Education</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4 text-center">
                      <BriefcaseIcon className="h-6 w-6 text-primary/20 mx-auto mb-2" />
                      <p className="text-2xl font-semibold text-primary">
                        {profile.summary.experience}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Experience
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4 text-center">
                      <FileTextIcon className="h-6 w-6 text-primary/20 mx-auto mb-2" />
                      <p className="text-2xl font-semibold text-primary">
                        {profile.summary.publications}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Publications
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4 text-center">
                      <AwardIcon className="h-6 w-6 text-primary/20 mx-auto mb-2" />
                      <p className="text-2xl font-semibold text-primary">
                        {profile.summary.awards}
                      </p>
                      <p className="text-sm text-muted-foreground">Awards</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Info */}
                <Card className="shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MailIcon className="h-4 w-4" />
                        <span>{profile.contact.email}</span>
                      </div>
                      {profile.contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{profile.contact.phone}</span>
                        </div>
                      )}
                      {profile.contact.website && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GlobeIcon className="h-4 w-4" />
                          <a
                            href={profile.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary"
                          >
                            {profile.contact.website}
                          </a>
                        </div>
                      )}
                      {profile.contact.github && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GithubIcon className="h-4 w-4" />
                          <a
                            href={`https://github.com/${profile.contact.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary"
                          >
                            {profile.contact.github}
                          </a>
                        </div>
                      )}
                      {profile.contact.linkedIn && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <LinkedinIcon className="h-4 w-4" />
                          <a
                            href={`https://linkedin.com/in/${profile.contact.linkedIn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary"
                          >
                            {profile.contact.linkedIn}
                          </a>
                        </div>
                      )}
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
