"use client";

import { useEffect, Suspense } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useSearchParams } from "next/navigation";

function RefreshPageContent() {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRefresh = async () => {
      if (!ready) return;

      try {
        const token = await getAccessToken();

        if (token) {
          const redirectUri = searchParams.get("redirect_uri") || "/";
          router.push(redirectUri);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error refreshing session:", error);
        router.push("/");
      }
    };

    handleRefresh();
  }, [ready, getAccessToken, router, searchParams]);

  return (
    <div className="min-h-screen bg-primary/5 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Refreshing your session...</p>
      </div>
    </div>
  );
}

export default function RefreshPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-primary/5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <RefreshPageContent />
    </Suspense>
  );
}
