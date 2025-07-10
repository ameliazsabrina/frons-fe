"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCVRegistration } from "@/hooks/useCVRegistration";

interface CVRegistrationGuardProps {
  walletAddress?: string; // Now optional since we can use Privy
  onCVVerified: () => void;
  children: React.ReactNode;
}

interface CVData {
  fullName: string;
  institution: string;
  profession: string;
  field: string;
  specialization: string;
  email: string;
  registeredAt: string;
}

export function CVRegistrationGuard({
  walletAddress,
  onCVVerified,
  children,
}: CVRegistrationGuardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { authenticated } = usePrivy();
  const [cvStatus, setCvStatus] = useState<
    "checking" | "registered" | "not_found" | "error"
  >("checking");
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasShownToast, setHasShownToast] = useState(false);

  // Use the CV registration hook with both Privy and legacy support
  const { checkCVRegistration, checkCVRegistrationPrivy } = useCVRegistration(walletAddress);

  const checkCVStatus = useCallback(async () => {
    try {
      setCvStatus("checking");
      
      let isVerified = false;
      
      if (authenticated) {
        // Use Privy authentication if available
        isVerified = await checkCVRegistrationPrivy();
      } else if (walletAddress) {
        // Fall back to legacy wallet-based check
        isVerified = await checkCVRegistration(walletAddress);
      } else {
        setCvStatus("error");
        setError("No authentication method available");
        return;
      }

      if (isVerified) {
        setCvStatus("registered");
        onCVVerified();
      } else {
        setCvStatus("not_found");
      }
    } catch (err) {
      console.error("Failed to check CV status:", err);
      setCvStatus("error");
      setError("Failed to check CV registration status");
    }
  }, [authenticated, walletAddress, checkCVRegistration, checkCVRegistrationPrivy, onCVVerified]);

  useEffect(() => {
    if (authenticated || walletAddress) {
      checkCVStatus();
    }
  }, [authenticated, walletAddress, checkCVStatus]);

  useEffect(() => {
    if (cvStatus === "registered" && !hasShownToast) {
      toast({
        title: "CV Verified!",
        description: "You can now submit manuscripts.",
      });
      setHasShownToast(true);
    }
  }, [cvStatus, hasShownToast, toast]);

  useEffect(() => {
    if (cvStatus === "not_found") {
      router.push("/register-cv");
    }
  }, [cvStatus, router]);

  if (cvStatus === "checking") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your profile status...</p>
        </div>
      </div>
    );
  }

  if (cvStatus === "registered" && cvData) {
    return <div className="space-y-6">{children}</div>;
  }

  if (cvStatus === "not_found") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Redirecting to profile registration...
          </p>
        </div>
      </div>
    );
  }

  if (cvStatus === "error") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <AlertCircleIcon className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">
                {error ||
                  "Failed to check CV registration status. Please try again."}
              </p>
              <Button
                onClick={checkCVStatus}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
