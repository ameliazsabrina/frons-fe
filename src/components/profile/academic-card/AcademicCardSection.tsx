"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CardPreview } from "./CardPreview";

import { ShippingAddressForm } from "./ShippingAddressForm";
import { useAcademicCardPayment } from "@/hooks/useAcademicCardPayment";
import { useToast } from "@/components/ui/sonner";
import type { ShippingAddress } from "./ShippingAddressForm";
import {
  IdCardIcon,
  QrCodeIcon,
  SparklesIcon,
  CreditCardIcon,
  LoaderIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
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
  const [showShippingForm, setShowShippingForm] = useState(false);
  const { toast } = useToast();
  const hasCheckedStatus = useRef(false);

  const {
    isLoading: paymentLoading,
    error: paymentError,
    paymentStatus,
    checkPaymentStatus,
    initiatePayment,
    formatCurrency,
    hasAccess,
    isPaymentPending,
    isPaymentCompleted,
    paymentAmount,
  } = useAcademicCardPayment();

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

  // Check payment status once when profile is complete
  useEffect(() => {
    if (isProfileComplete && !paymentStatus && !paymentLoading && !hasCheckedStatus.current) {
      hasCheckedStatus.current = true;
      checkPaymentStatus();
    }
  }, [isProfileComplete, paymentStatus, paymentLoading]); // Safe dependencies

  useEffect(() => {
    if (paymentError) {
      toast.error(paymentError);
    }
  }, [paymentError, toast]);

  const handlePurchaseCard = async (shippingAddress: ShippingAddress) => {
    try {
      if (paymentLoading || isPaymentPending) return;

      const result = await initiatePayment(225000, undefined, shippingAddress);

      if (result.success && result.paymentUrl) {
        window.open(result.paymentUrl, "_blank", "noopener,noreferrer");

        toast.success(
          "Payment session created! Please complete payment in the new tab."
        );
        setShowShippingForm(false);

        setTimeout(() => {
          checkPaymentStatus();
        }, 2000);
      } else {
        toast.error(result.error || "Failed to create payment session");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment");
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Card Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              {hasAccess
                ? "Export, share, or customize your academic card."
                : "Purchase Academic Card access to generate and export your professional card."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasAccess ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCardIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      Academic Card Access Required
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Purchase one-time access to generate and export your
                    professional academic card with QR code.
                  </p>
                  <div className="text-lg font-bold text-blue-900">
                    {formatCurrency(paymentAmount)}
                  </div>
                </div>

                {isPaymentPending && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <LoaderIcon className="h-4 w-4 text-yellow-600 animate-spin" />
                      <span className="text-sm text-yellow-800">
                        Payment pending - Please complete your payment to access
                        the Academic Card
                      </span>
                    </div>
                  </div>
                )}

                {!showShippingForm ? (
                  <Button
                    className="w-full"
                    onClick={() => setShowShippingForm(true)}
                    disabled={paymentLoading || isPaymentPending}
                    size="lg"
                  >
                    Purchase Card
                  </Button>
                ) : (
                  <ShippingAddressForm
                    onSubmit={handlePurchaseCard}
                    isLoading={paymentLoading}
                  />
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• One-time payment for lifetime access</p>
                  <p>• Secure payment via Mayar payment gateway</p>
                  <p>• Supports QRIS, E-Wallet, Bank Transfer, Credit Card</p>
                  <p>• Generate unlimited exports after purchase</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                      Added to Card Shipping Queue
                    </span>
                  </div>
                  {paymentStatus?.purchasedAt && (
                    <p className="text-xs text-green-700 mt-1">
                      Purchased on{" "}
                      {new Date(paymentStatus.purchasedAt).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs text-green-700 mt-1">
                    Your physical Academic Card will be shipped in the next
                    batch (7-14 business days)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <QrCodeIcon className="h-4 w-4" />
                    <span className="text-lg font-medium">
                      QR Code Contains:
                    </span>
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

                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    onClick={() => window.open("/card-waiting-list", "_blank")}
                    variant="outline"
                  >
                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                    View Card Waiting List
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    See your position in the queue and track shipping updates
                  </p>
                </div>

                <Separator />

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Physical Card Features
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Premium card stock with professional design</li>
                    <li>• QR code for digital profile access</li>
                    <li>• Shipped within Indonesia via trusted couriers</li>
                    <li>• Tracking number provided once shipped</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
