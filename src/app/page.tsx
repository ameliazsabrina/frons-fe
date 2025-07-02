"use client";
import { useEffect } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/landing/Hero";
import { Mission } from "@/components/landing/Mission";
import { PublishingAdvantages } from "@/components/landing/PublishingAdvantages";
import { CTA } from "@/components/landing/Cta";
import { Footer } from "@/components/landing/Footer";
import { Loading } from "@/components/ui/loading";
import { usePageReady } from "@/hooks/usePageReady";
import { useLoading } from "@/context/LoadingContext";

export default function Home() {
  const { isReady, progress, pageState } = usePageReady({
    checkImages: false,
    checkFonts: true,
    checkData: true,
    minLoadTime: 600,
    maxLoadTime: 5000,
  });

  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsLoading(!isReady);
  }, [isReady, setIsLoading]);

  if (!isReady) {
    return <Loading progress={progress} />;
  }

  return (
    <div className="bg-white">
      <Header />
      <Hero />
      <Mission />
      <PublishingAdvantages />
      <CTA />
      <Footer />
    </div>
  );
}
