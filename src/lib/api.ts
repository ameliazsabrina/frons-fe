import {
  CVStatus,
  ManuscriptSubmissionRequest,
  ManuscriptSubmissionResponse,
  ManuscriptMetadataRequest,
  PendingReviewResponse,
  PublishedManuscriptsResponse,
  ReviewAssignmentRequest,
  ReviewAssignmentResponse,
  ReviewSubmissionRequest,
  ReviewSubmissionResponse,
  ReviewStatusResponse,
  PublicationRequest,
  PublicationResponse,
  CVUploadRequest,
  CVParseResponse,
  UserProfileResponse,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
  NFTHealthResponse,
  NFTMetadataRequest,
  NFTMetadataResponse,
  NFTMetadataGetResponse,
  NFTVerificationResponse,
  BackendError,
} from "@/types/backend";

class BackendAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://fronsciers-be.azakiyasabrina.workers.dev";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private async uploadFile<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`File upload failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // CV Registration & Profile Management
  async checkCVStatus(walletAddress: string): Promise<CVStatus> {
    return this.request<CVStatus>(
      `/api/manuscripts/check-cv-status/${walletAddress}`
    );
  }

  async uploadCV(cv: File, walletAddress: string): Promise<CVParseResponse> {
    const formData = new FormData();
    formData.append("cv", cv);
    formData.append("walletAddress", walletAddress);

    return this.uploadFile<CVParseResponse>("/api/parse-cv/parse-cv", formData);
  }

  async getUserProfile(walletAddress: string): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>(
      `/api/parse-cv/user/profile/${walletAddress}`
    );
  }

  async updateUserProfile(
    walletAddress: string,
    updateData: ProfileUpdateRequest
  ): Promise<ProfileUpdateResponse> {
    return this.request<ProfileUpdateResponse>(
      `/api/parse-cv/user/profile/${walletAddress}`,
      {
        method: "PATCH",
        body: JSON.stringify(updateData),
      }
    );
  }

  async getUserSpecialization(walletAddress: string): Promise<any> {
    return this.request(`/api/parse-cv/user/specialization/${walletAddress}`);
  }

  // Manuscript Submission
  async submitManuscript(
    data: ManuscriptSubmissionRequest
  ): Promise<ManuscriptSubmissionResponse> {
    const formData = new FormData();
    formData.append("manuscript", data.manuscript);
    formData.append("title", data.title);
    formData.append("author", data.author);
    formData.append("category", data.category);
    formData.append("abstract", data.abstract);
    formData.append("keywords", data.keywords);
    formData.append("authorWallet", data.authorWallet);

    return this.uploadFile<ManuscriptSubmissionResponse>(
      "/api/manuscripts/submit",
      formData
    );
  }

  async submitManuscriptMetadata(
    data: ManuscriptMetadataRequest
  ): Promise<any> {
    return this.request("/api/manuscripts/all", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Manuscript Retrieval
  async getPendingReviewManuscripts(
    limit: number = 20,
    category?: string
  ): Promise<PendingReviewResponse> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (category) params.append("category", category);

    return this.request<PendingReviewResponse>(
      `/api/manuscripts/pending-review?${params}`
    );
  }

  async getPublishedManuscripts(
    category: string,
    limit: number = 10
  ): Promise<PublishedManuscriptsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    return this.request<PublishedManuscriptsResponse>(
      `/api/manuscripts/published/${encodeURIComponent(category)}?${params}`
    );
  }

  async getManuscriptsByStatus(
    status: string,
    limit: number = 20
  ): Promise<any> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    return this.request(`/api/manuscripts/status/${status}?${params}`);
  }

  async getRecentManuscripts(
    category: string,
    limit: number = 5
  ): Promise<PublishedManuscriptsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    return this.request<PublishedManuscriptsResponse>(
      `/api/manuscripts/recent/${encodeURIComponent(category)}?${params}`
    );
  }

  // Review Management
  async assignReviewers(
    manuscriptId: number,
    data: ReviewAssignmentRequest
  ): Promise<ReviewAssignmentResponse> {
    return this.request<ReviewAssignmentResponse>(
      `/api/reviews/manuscript/${manuscriptId}/assign-reviewers`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async submitReview(
    reviewId: number,
    data: ReviewSubmissionRequest
  ): Promise<ReviewSubmissionResponse> {
    return this.request<ReviewSubmissionResponse>(
      `/api/reviews/${reviewId}/submit-review`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getReviewStatus(manuscriptId: number): Promise<ReviewStatusResponse> {
    return this.request<ReviewStatusResponse>(
      `/api/reviews/manuscript/${manuscriptId}/review-status`
    );
  }

  // Publication
  async publishManuscript(
    manuscriptId: number,
    data: PublicationRequest
  ): Promise<PublicationResponse> {
    return this.request<PublicationResponse>(
      `/api/manuscripts/${manuscriptId}/publish`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  // NFT Integration
  async checkNFTHealth(): Promise<NFTHealthResponse> {
    return this.request<NFTHealthResponse>("/api/nft-metadata/health");
  }

  async createNFTMetadata(
    data: NFTMetadataRequest
  ): Promise<NFTMetadataResponse> {
    return this.request<NFTMetadataResponse>("/api/nft-metadata/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getNFTMetadata(mint: string): Promise<NFTMetadataGetResponse> {
    return this.request<NFTMetadataGetResponse>(`/api/nft-metadata/${mint}`);
  }

  async updateNFTMetadata(
    mint: string,
    data: Partial<NFTMetadataRequest>
  ): Promise<NFTMetadataResponse> {
    return this.request<NFTMetadataResponse>(`/api/nft-metadata/${mint}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async verifyNFTMetadata(mint: string): Promise<NFTVerificationResponse> {
    return this.request<NFTVerificationResponse>(
      `/api/nft-metadata/${mint}/verify`
    );
  }

  async generateNFTPreviewImage(data: {
    doci: string;
    ownerName: string;
    title: string;
    publicationDate: string;
  }): Promise<any> {
    return this.request("/api/nft-metadata/preview-image", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Utility Methods
  async isBackendHealthy(): Promise<boolean> {
    try {
      await this.checkNFTHealth();
      return true;
    } catch (error) {
      console.error("Backend health check failed:", error);
      return false;
    }
  }

  // Error Handling
  isCVRequiredError(error: any): error is BackendError {
    return error?.code === "CV_REQUIRED";
  }

  isMissingWalletError(error: any): error is BackendError {
    return error?.code === "MISSING_WALLET";
  }

  isInsufficientReviewersError(error: any): error is BackendError {
    return error?.code === "INSUFFICIENT_REVIEWERS";
  }

  isInvalidDecisionError(error: any): error is BackendError {
    return error?.code === "INVALID_DECISION";
  }

  isPublicationNotReadyError(error: any): error is BackendError {
    return error?.code === "PUBLICATION_NOT_READY";
  }
}

// Export singleton instance
export const backendAPI = new BackendAPI();

// Export class for testing
export { BackendAPI };
