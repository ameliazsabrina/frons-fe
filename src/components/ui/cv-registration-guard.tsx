"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CVRegistrationGuardProps {
  walletAddress: string;
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
  const [cvStatus, setCvStatus] = useState<
    "checking" | "registered" | "not_found" | "error"
  >("checking");
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasShownToast, setHasShownToast] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const checkCVStatus = useCallback(async () => {
    try {
      setCvStatus("checking");
      const response = await fetch(
        `${apiUrl}/manuscripts/check-cv-status/${walletAddress}`
      );
      const result = await response.json();

      if (result.success && result.hasCV) {
        setCvStatus("registered");
        setCvData(result.userInfo);
        onCVVerified();
      } else {
        setCvStatus("not_found");
      }
    } catch (err) {
      console.error("Failed to check CV status:", err);
      setCvStatus("error");
      setError("Failed to check CV registration status");
    }
  }, [apiUrl, walletAddress, onCVVerified]);

  useEffect(() => {
    if (walletAddress) {
      checkCVStatus();
    }
  }, [walletAddress, checkCVStatus]);

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
