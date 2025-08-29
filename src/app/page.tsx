"use client";
import { useEffect } from "react";
import { Header } from "@/components/header";
import { Hero } from "@/components/landing/Hero";
import { ProblemAgitation } from "@/components/landing/ProblemAgitation";
import { Vision } from "@/components/landing/Vision";
// import { Steps } from "@/components/landing/Steps";
import { Features } from "@/components/landing/Features";
import { PublishingAdvantages } from "@/components/landing/PublishingAdvantages";
// import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { CTA } from "@/components/landing/Cta";
import { Footer } from "@/components/landing/Footer";
import { Loading } from "@/components/ui/loading";
import { usePageReady } from "@/hooks/usePageReady";
import { useLoading } from "@/context/LoadingContext";

export default function Home() {
  const { isReady, progress, pageState } = usePageReady({
    checkImages: true,
    checkFonts: true,
    checkData: true,
    minLoadTime: 600,
    maxLoadTime: 8000,
  });

  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsLoading(!isReady);
  }, [isReady, setIsLoading]);

  if (!isReady) {
    return <Loading progress={progress} showSpinner={false} />;
  }

  return (
    <div className="bg-white">
      <Header />
      <Hero />
      <ProblemAgitation />
      <Vision />
      <Features />
      {/* <Steps /> */}
      <PublishingAdvantages />
      {/* <Pricing /> */}
      <Faq />
      <CTA />
      <Footer />
    </div>
  );
}
