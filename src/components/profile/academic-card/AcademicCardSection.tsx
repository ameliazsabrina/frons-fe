"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CardPreview } from "./CardPreview";
import { SocialShareButtons } from "./SocialShareButtons";
import { CardExporter } from "./CardExporter";
import {
  IdCardIcon,
  DownloadIcon,
  ShareIcon,
  QrCodeIcon,
  SparklesIcon,
} from "lucide-react";

interface UserProfile {
  cv_data: {
    selfIdentity: {
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
      phone: string;
      linkedIn: string;
      github: string;
      website: string;
      orcid: string;
      googleScholar: string;
    };
  };
  wallet_address?: string;
}

interface AcademicCardSectionProps {
  userProfile: UserProfile;
  walletAddress?: string;
}

export function AcademicCardSection({
  userProfile,
  walletAddress,
}: AcademicCardSectionProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Transform user profile data for card components
  const profileData = useMemo(() => {
    const { selfIdentity, contact } = userProfile.cv_data;

    return {
      fullName: selfIdentity.fullName || "Academic Researcher",
      institution: selfIdentity.institution || "Academic Institution",
      title: selfIdentity.title || selfIdentity.profession || "Researcher",
      field: selfIdentity.field || selfIdentity.specialization || "Research",
      email: contact.email || "",
      walletAddress: walletAddress || userProfile.wallet_address || "",
      profileUrl: `https://fronsciers.com/profile/${
        walletAddress || userProfile.wallet_address
      }`,
    };
  }, [userProfile, walletAddress]);

  const isProfileComplete = useMemo(() => {
    return !!(
      profileData.fullName &&
      profileData.institution &&
      profileData.title &&
      profileData.field &&
      profileData.walletAddress
    );
  }, [profileData]);

  if (!isProfileComplete) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCardIcon className="h-5 w-5" />
            Academic Card
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            Complete Your Profile
          </h3>
          <p className="text-muted-foreground mb-6">
            Please complete your profile information to generate your academic
            card. Make sure to fill in your name, institution, title, and field
            of study.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Full Name</span>
              <Badge
                variant={profileData.fullName ? "secondary" : "destructive"}
              >
                {profileData.fullName ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Institution</span>
              <Badge
                variant={
                  profileData.institution !== "Academic Institution"
                    ? "secondary"
                    : "destructive"
                }
              >
                {profileData.institution !== "Academic Institution" ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Title</span>
              <Badge
                variant={
                  profileData.title !== "Researcher"
                    ? "secondary"
                    : "destructive"
                }
              >
                {profileData.title !== "Researcher" ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Field</span>
              <Badge
                variant={
                  profileData.field !== "Research" ? "secondary" : "destructive"
                }
              >
                {profileData.field !== "Research" ? "✓" : "✗"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCardIcon className="h-5 w-5" />
            Your Academic Card
          </CardTitle>
          <p className="text-muted-foreground">
            Generate and share your professional academic identity card with QR
            code for easy networking.
          </p>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Card Preview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Preview your academic card design with QR code.
            </p>
          </CardHeader>
          <CardContent>
            <CardPreview profileData={profileData} />
          </CardContent>
        </Card>

        {/* Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Card Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Export, share, or customize your academic card.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <QrCodeIcon className="h-4 w-4" />
                <span className="text-lg font-medium">QR Code Contains:</span>
              </div>
              <ul className="text-md text-muted-foreground ml-6">
                <li>• Your name and institution</li>
                <li>• Professional title and field</li>
                <li>• Contact information</li>
                <li>• Link to Fronsciers profile</li>
                <li>• Wallet address for verification</li>
              </ul>
            </div>

            <Separator />

            {/* Export Options */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  className="w-full justify-start"
                  onClick={() => setShowExportOptions(!showExportOptions)}
                >
                  Claim Card
                </Button>
                {showExportOptions && (
                  <CardExporter profileData={profileData} />
                )}
              </div>
            </div>

            <Separator />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
