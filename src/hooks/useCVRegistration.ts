import { useState, useCallback } from "react";

import {
  CVStatus,
  CVParseResponse,
  UserProfileResponse,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
} from "@/types/backend";
import { useLoading } from "@/context/LoadingContext";
import axios from "axios";

interface CVData {
  fullName: string;
  institution: string;
  profession: string;
  field: string;
  specialization: string;
  email: string;
  registeredAt: string;
  photoUrl?: string;
}

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

export function useCVRegistration(walletAddress?: string) {
  const [cvStatus, setCvStatus] = useState<CVStatus | null>(null);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setIsLoading } = useLoading();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const checkCVRegistration = useCallback(
    async (walletAddress: string): Promise<boolean> => {
      try {
        setError(null);

        const result = await axios.get(
          `${apiUrl}/manuscripts/check-cv-status/${walletAddress}`
        );
        console.log(result.data);
        setCvStatus(result.data as CVStatus);

        if (result.data.success && result.data.hasCV && result.data.userInfo) {
          setCvData({
            fullName: result.data.userInfo.fullName,
            institution: result.data.userInfo.institution,
            profession: result.data.userInfo.profession,
            field: result.data.userInfo.profession,
            specialization: result.data.userInfo.profession,
            email: "",
            registeredAt: result.data.userInfo.registeredAt,
          });
          return result.data.canSubmitManuscripts;
        } else {
          setError(result.data.message);
          return false;
        }
      } catch (err) {
        console.error("Failed to check CV registration:", err);
        setError("Network error while checking CV status");
        return false;
      } finally {
      }
    },
    []
  );

  const uploadCV = useCallback(
    async (
      cv: File,
      walletAddress: string
    ): Promise<CVParseResponse | null> => {
      try {
        setError(null);

        const formData = new FormData();
        formData.append("cv", cv);
        formData.append("walletAddress", walletAddress);

        const result = await axios.post(
          `${apiUrl}/parse-cv/parse-cv`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (result.data.success) {
          // Set CV data immediately from the upload response
          const newCvData = {
            fullName: result.data.selfIdentity?.fullName || "",
            institution: result.data.selfIdentity?.institution || "",
            profession: result.data.selfIdentity?.profession || "",
            field: result.data.selfIdentity?.field || "",
            specialization: result.data.selfIdentity?.specialization || "",
            email: result.data.contact?.email || "",
            registeredAt: new Date().toISOString(),
          };
          setCvData(newCvData);

          // Refresh the CV status but don't let it overwrite our cvData
          setTimeout(() => {
            checkCVRegistration(walletAddress);
          }, 500);
        }

        return result.data as CVParseResponse;
      } catch (err) {
        console.error("Failed to upload CV:", err);
        setError(err instanceof Error ? err.message : "Failed to upload CV");
        return null;
      } finally {
      }
    },
    [checkCVRegistration]
  );

  const getUserProfile = useCallback(
    async (walletAddress: string): Promise<UserProfileResponse | null> => {
      try {
        setError(null);
        setIsLoading(true);

        const result = await axios.get(
          `${apiUrl}/parse-cv/user/profile/${walletAddress}`
        );

        if (result.data.success) {
          console.log(
            "Full profile data from API:",
            JSON.stringify(result.data.profile, null, 2)
          );

          setCvData({
            fullName: result.data.profile.personalInfo.fullName,
            institution: result.data.profile.personalInfo.institution,
            profession: result.data.profile.personalInfo.profession,
            field: result.data.profile.personalInfo.field,
            specialization: result.data.profile.personalInfo.specialization,
            email: result.data.profile.contact.email,
            registeredAt: result.data.profile.createdAt,
            photoUrl:
              result.data.profile.profilePhoto ||
              result.data.profile.personalInfo.photoUrl,
          });

          console.log("Profile data loaded:", result.data.profile);
          if (result.data.profile.profilePhoto) {
            console.log(
              "Profile photo URL found:",
              result.data.profile.profilePhoto
            );
          } else if (result.data.profile.personalInfo.photoUrl) {
            console.log(
              "Profile photo URL found in personalInfo:",
              result.data.profile.personalInfo.photoUrl
            );
          } else {
            console.log("No profile photo URL found in the response");
          }
        }

        return result.data as UserProfileResponse;
      } catch (err) {
        console.error("Failed to get user profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to get user profile"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateUserProfile = useCallback(
    async (
      walletAddress: string,
      updateData: ProfileUpdateRequest
    ): Promise<ProfileUpdateResponse | null> => {
      try {
        setError(null);

        const result = await axios.patch(
          `${apiUrl}/parse-cv/user/profile/${walletAddress}`,
          updateData
        );
        console.log(result.data);

        if (result.data.success) {
          if (result.data.profile) {
            setCvData({
              fullName: result.data.profile.personalInfo.fullName,
              institution: result.data.profile.personalInfo.institution,
              profession: result.data.profile.personalInfo.profession,
              field: result.data.profile.personalInfo.field,
              specialization: result.data.profile.personalInfo.specialization,
              email: result.data.profile.contact.email,
              registeredAt: result.data.profile.createdAt,
              photoUrl:
                result.data.profile.profilePhoto ||
                result.data.profile.personalInfo.photoUrl,
            });
          }
        }

        return result.data as ProfileUpdateResponse;
      } catch (err) {
        console.error("Failed to update user profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update user profile"
        );
        return null;
      } finally {
      }
    },
    []
  );

  const uploadProfilePhoto = useCallback(
    async (
      photo: File,
      walletAddress: string
    ): Promise<{
      success: boolean;
      profilePhoto?: string;
      message: string;
    }> => {
      try {
        setError(null);
        setIsLoading(true);

        // Compress the image before uploading
        const compressedPhoto = await compressImage(photo);
        console.log(
          `Original size: ${photo.size / 1024}KB, Compressed size: ${
            compressedPhoto.size / 1024
          }KB`
        );

        const formData = new FormData();
        formData.append("profilePhoto", compressedPhoto);

        console.log(
          "Uploading profile photo to:",
          `${apiUrl}/parse-cv/user/profile-photo/${walletAddress}`
        );
        const response = await axios.post(
          `${apiUrl}/parse-cv/user/profile-photo/${walletAddress}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(
          "Profile photo upload response:",
          JSON.stringify(response.data, null, 2)
        );

        if (response.data.success) {
          console.log(
            "Profile photo URL from response:",
            response.data.profilePhoto
          );
          return {
            success: true,
            profilePhoto: response.data.profilePhoto,
            message: "Profile photo updated successfully",
          };
        } else {
          setError(response.data.message || "Failed to upload profile photo");
          return {
            success: false,
            message: response.data.message || "Failed to upload profile photo",
          };
        }
      } catch (err) {
        console.error("Failed to upload profile photo:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload profile photo";
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getUserSpecialization = useCallback(
    async (walletAddress: string): Promise<any> => {
      try {
        setError(null);

        const result = await axios.get(
          `${apiUrl}/parse-cv/user/specialization/${walletAddress}`
        );
        return result;
      } catch (err) {
        console.error("Failed to get user specialization:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get user specialization"
        );
        return null;
      } finally {
      }
    },
    []
  );

  const createManualProfile = useCallback(
    async (
      profileData: {
        fullName: string;
        institution: string;
        profession: string;
        field: string;
        specialization: string;
        email: string;
      },
      walletAddress: string
    ): Promise<{ success: boolean; message: string }> => {
      try {
        setError(null);
        setIsLoading(true);

        const result = await axios.post(`${apiUrl}/parse-cv/manual-profile`, {
          ...profileData,
          walletAddress,
        });

        if (result.data.success) {
          setCvData({
            ...profileData,
            registeredAt: new Date().toISOString(),
          });

          setTimeout(() => {
            checkCVRegistration(walletAddress);
          }, 500);

          return {
            success: true,
            message: "Profile created successfully!",
          };
        } else {
          setError(result.data.message || "Failed to create profile");
          return {
            success: false,
            message: result.data.message || "Failed to create profile",
          };
        }
      } catch (err) {
        console.error("Failed to create manual profile:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create profile";
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [checkCVRegistration]
  );

  return {
    cvStatus,
    cvData,
    isLoading,
    error,
    checkCVRegistration,
    uploadCV,
    getUserProfile,
    updateUserProfile,
    getUserSpecialization,
    uploadProfilePhoto,
    createManualProfile,
  };
}
