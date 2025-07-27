"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Separator } from "../ui/separator";

gsap.registerPlugin(ScrollTrigger);

export function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: titleRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleStartNow = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section ref={sectionRef} className="bg-white">
      <div className="container py-16">
        <Separator className="w-full mb-16" />

        <div className="text-center space-y-8 px-4">
          <h2
            ref={titleRef}
            className="font-spectral font-semibold text-primary word mb-[-0.1em] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            Shape the Future
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto tracking-tight mt-[-0.5em]">
            Join Fronsciers and be part of a new era in academic publishing,
            where your research reaches the world, your reviews matter, and
            innovation thrives in a transparent, global community.
          </p>

          <div ref={contentRef} className="flex justify-center mt-12">
            <Button onClick={handleStartNow}>Start Now</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
