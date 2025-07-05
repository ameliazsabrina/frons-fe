"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  UploadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  UserIcon,
  BuildingIcon,
  GraduationCapIcon,
} from "lucide-react";

interface CVRegistrationGuardProps {
  walletAddress: string;
  onCVVerified: () => void;
  showUploadOption?: boolean;
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
  showUploadOption = false,
  children,
}: CVRegistrationGuardProps) {
  const [cvStatus, setCvStatus] = useState<
    "checking" | "registered" | "not_found" | "error"
  >("checking");
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const checkCVStatus = useCallback(async () => {
    try {
      setCvStatus("checking");
      const response = await fetch(
        `${apiUrl}/api/manuscripts/check-cv-status/${walletAddress}`
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
        setError("Please select a PDF or image file (JPG, PNG)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const uploadCV = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("cv", selectedFile);
      formData.append("walletAddress", walletAddress);

      const response = await fetch(`${apiUrl}/api/parse-cv/parse-cv`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadProgress(100);
        setTimeout(() => {
          checkCVStatus();
        }, 1000);
      } else {
        throw new Error(result.message || "Failed to upload CV");
      }
    } catch (err) {
      console.error("Failed to upload CV:", err);
      setError(err instanceof Error ? err.message : "Failed to upload CV");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [uploading]);

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
    return (
      <div className="space-y-6">
        {/* CV Status Banner */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">CV Verified</h3>
                <p className="text-sm text-green-700">
                  You can now submit manuscripts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Information */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <FileTextIcon className="h-5 w-5" />
              <span>Your Academic Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Name</span>
                </Label>
                <p className="text-sm text-gray-900">{cvData.fullName}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <BuildingIcon className="h-4 w-4" />
                  <span>Institution</span>
                </Label>
                <p className="text-sm text-gray-900">{cvData.institution}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <GraduationCapIcon className="h-4 w-4" />
                  <span>Field</span>
                </Label>
                <p className="text-sm text-gray-900">{cvData.field}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Specialization
                </Label>
                <p className="text-sm text-gray-900">{cvData.specialization}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Registered: {new Date(cvData.registeredAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {children}
      </div>
    );
  }

  if (cvStatus === "not_found") {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-800 mb-2">
                  CV Registration Required
                </h3>
                <p className="text-sm text-amber-700 mb-4">
                  You must upload and register your CV before submitting
                  manuscripts. This ensures academic qualification verification
                  and better manuscript-reviewer matching.
                </p>

                {showUploadOption && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center">
                      <UploadIcon className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                      <Label
                        htmlFor="cv-upload"
                        className="text-sm font-medium text-amber-800 cursor-pointer"
                      >
                        Upload your CV (PDF or Image)
                      </Label>
                      <input
                        id="cv-upload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <p className="text-xs text-amber-600 mt-1">
                        Supported formats: PDF, JPG, PNG (max 10MB)
                      </p>
                    </div>

                    {selectedFile && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                          <div className="flex items-center space-x-2">
                            <FileTextIcon className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium">
                              {selectedFile.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>

                        {uploading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Uploading CV...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                        )}

                        {error && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        )}

                        <Button
                          onClick={uploadCV}
                          disabled={uploading}
                          className="w-full"
                        >
                          {uploading
                            ? "Uploading..."
                            : "Upload and Register CV"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
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
