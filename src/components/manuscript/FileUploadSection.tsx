"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from "lucide-react";

interface FileUploadSectionProps {
  file: File | null;
  uploading: boolean;
  uploadProgress: number;
  uploadResult: { success: boolean; message: string; ipfsHash?: string } | null;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
}

export function FileUploadSection({
  file,
  uploading,
  uploadProgress,
  uploadResult,
  onFileChange,
  onUpload,
}: FileUploadSectionProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        alert("Please select a PDF file");
        return;
      }

      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB");
        return;
      }

      onFileChange(selectedFile);
    }
  };

  const removeFile = () => {
    onFileChange(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <UploadIcon className="h-5 w-5" />
          <span>Manuscript File</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        {!file && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <Label
              htmlFor="manuscript-file"
              className="text-lg font-medium text-gray-700 cursor-pointer"
            >
              Upload your manuscript (PDF only)
            </Label>
            <input
              id="manuscript-file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">
              Drag and drop your PDF file here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Maximum file size: 50MB
            </p>
          </div>
        )}

        {/* Selected File Display */}
        {file && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <FileTextIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <XIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading to IPFS...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <div
                className={`p-4 rounded-lg border ${
                  uploadResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {uploadResult.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      uploadResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {uploadResult.success
                      ? "Upload Successful"
                      : "Upload Failed"}
                  </span>
                </div>
                <p
                  className={`text-sm mt-1 ${
                    uploadResult.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {uploadResult.message}
                </p>
                {uploadResult.success && uploadResult.ipfsHash && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      IPFS Hash: {uploadResult.ipfsHash.substring(0, 20)}...
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Upload Button */}
            {!uploading && !uploadResult?.success && (
              <Button
                onClick={onUpload}
                className="w-full"
                disabled={uploading}
              >
                Upload to IPFS
              </Button>
            )}

            {/* Retry Button */}
            {uploadResult && !uploadResult.success && (
              <Button
                onClick={onUpload}
                variant="outline"
                className="w-full"
                disabled={uploading}
              >
                Retry Upload
              </Button>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            Upload Requirements
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• File format: PDF only</li>
            <li>• Maximum file size: 50MB</li>
            <li>• Ensure your manuscript is complete and properly formatted</li>
            <li>
              • The file will be uploaded to IPFS for decentralized storage
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
