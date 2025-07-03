"use client";

import { useEffect, Suspense } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useSearchParams } from "next/navigation";

export default function RefreshPage() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRefresh = async () => {
      if (!ready) return;

      try {
        // Call Privy's getAccessToken method to refresh the session
        const token = await getAccessToken();

        if (token) {
          // User is authenticated, redirect to the intended destination
          const redirectUri = searchParams.get("redirect_uri") || "/";
          router.push(redirectUri);
        } else {
          // User is not authenticated, redirect to login
          router.push("/");
        }
      } catch (error) {
        console.error("Error refreshing session:", error);
        // On error, redirect to login
        router.push("/");
      }
    };

    handleRefresh();
  }, [ready, getAccessToken, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Refreshing your session...</p>
      </div>
    </div>
  );
}
