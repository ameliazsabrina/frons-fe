import { useState, useCallback } from "react";
import { backendAPI } from "@/lib/api";
import {
  CVStatus,
  CVParseResponse,
  UserProfileResponse,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
} from "@/types/backend";

interface CVData {
  fullName: string;
  institution: string;
  profession: string;
  field: string;
  specialization: string;
  email: string;
  registeredAt: string;
}

export function useCVRegistration() {
  const [cvStatus, setCvStatus] = useState<CVStatus | null>(null);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCVRegistration = useCallback(
    async (walletAddress: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const result = await backendAPI.checkCVStatus(walletAddress);
        setCvStatus(result);

        if (result.success && result.hasCV && result.userInfo) {
          setCvData({
            fullName: result.userInfo.fullName,
            institution: result.userInfo.institution,
            profession: result.userInfo.profession,
            field: result.userInfo.profession, // Map profession to field
            specialization: result.userInfo.profession, // Default mapping
            email: "", // Will be populated from profile if available
            registeredAt: result.userInfo.registeredAt,
          });
          return result.canSubmitManuscripts;
        } else {
          setError(result.message || "No CV found for this wallet address");
          return false;
        }
      } catch (err) {
        console.error("Failed to check CV registration:", err);
        setError("Network error while checking CV status");
        return false;
      } finally {
        setLoading(false);
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
        setLoading(true);
        setError(null);

        const result = await backendAPI.uploadCV(cv, walletAddress);

        if (result.success) {
          // Update CV data with parsed information
          setCvData({
            fullName: result.data.selfIdentity.fullName,
            institution: result.data.selfIdentity.institution,
            profession: result.data.selfIdentity.profession,
            field: result.data.selfIdentity.field,
            specialization: result.data.selfIdentity.specialization,
            email: result.data.contact.email,
            registeredAt: new Date().toISOString(),
          });

          // Re-check CV status after successful upload
          await checkCVRegistration(walletAddress);
        }

        return result;
      } catch (err) {
        console.error("Failed to upload CV:", err);
        setError(err instanceof Error ? err.message : "Failed to upload CV");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [checkCVRegistration]
  );

  const getUserProfile = useCallback(
    async (walletAddress: string): Promise<UserProfileResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await backendAPI.getUserProfile(walletAddress);

        if (result.success) {
          // Update CV data with profile information
          setCvData({
            fullName: result.profile.personalInfo.fullName,
            institution: result.profile.personalInfo.institution,
            profession: result.profile.personalInfo.profession,
            field: result.profile.personalInfo.field,
            specialization: result.profile.personalInfo.specialization,
            email: result.profile.contact.email,
            registeredAt: result.profile.createdAt,
          });
        }

        return result;
      } catch (err) {
        console.error("Failed to get user profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to get user profile"
        );
        return null;
      } finally {
        setLoading(false);
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
        setLoading(true);
        setError(null);

        const result = await backendAPI.updateUserProfile(
          walletAddress,
          updateData
        );

        if (result.success) {
          // Update local CV data with updated information
          if (result.profile) {
            setCvData({
              fullName: result.profile.personalInfo.fullName,
              institution: result.profile.personalInfo.institution,
              profession: result.profile.personalInfo.profession,
              field: result.profile.personalInfo.field,
              specialization: result.profile.personalInfo.specialization,
              email: result.profile.contact.email,
              registeredAt: result.profile.createdAt,
            });
          }
        }

        return result;
      } catch (err) {
        console.error("Failed to update user profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update user profile"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUserSpecialization = useCallback(
    async (walletAddress: string): Promise<any> => {
      try {
        setLoading(true);
        setError(null);

        const result = await backendAPI.getUserSpecialization(walletAddress);
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
        setLoading(false);
      }
    },
    []
  );

  return {
    cvStatus,
    cvData,
    loading,
    error,
    checkCVRegistration,
    uploadCV,
    getUserProfile,
    updateUserProfile,
    getUserSpecialization,
  };
}
