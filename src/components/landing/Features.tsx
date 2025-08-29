"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Separator } from "../ui/separator";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: "⚡️",
    title: "Fast & Transparent Reviews",
    description:
      "Decisions in weeks, not months, with 3 reviewers and clear outcomes (Rejected, Minor Revisions, Major Revisions, Accepted).",
  },
  {
    icon: "🔒",
    title: "Secure Storage with Walrus & IPFS",
    description: "Manuscripts stored permanently and verifiably.",
  },
  {
    icon: "🔍",
    title: "Rich Metadata",
    description:
      "Each manuscript includes keywords, versioning, and reviewer history.",
  },
  {
    icon: "🌍",
    title: "Open Access",
    description: "Free to read, affordable to publish.",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { y: 100, opacity: 100 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom-=50px",
            end: "top center",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        titleRef.current,
        { opacity: 0, x: -80 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top bottom-=100px",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: subtitleRef.current,
            start: "top bottom-=80px",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, x: 100, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          delay: 0.7,
          ease: "power2.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: cardsRef.current[0],
            start: "top bottom-=50px",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-[700px] bg-primary rounded-3xl overflow-hidden mx-4 justify-center"
    >
      <div className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start justify-center">
          <div className="lg:sticky lg:top-24">
            <div className="space-y-6">
              <h2
                ref={titleRef}
                className="text-4xl lg:text-5xl font-spectral font-bold text-white leading-tight"
              >
                What You Get
              </h2>
              <p
                ref={subtitleRef}
                className="text-xl text-white/80 leading-tight tracking-tight"
              >
                Experience the future of academic publishing with our
                comprehensive platform designed for researchers and academics
                who demand excellence.
              </p>
            </div>
          </div>

          <div>
            <div className="space-y-12">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    ref={addToRefs}
                    className="flex items-start gap-6"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 flex justify-center items-center">
                        <span className="text-4xl">{IconComponent}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-white/80 tracking-tight">
                        {feature.description}
                      </p>
                      {index < features.length - 1 && (
                        <Separator className="bg-white/20 mt-6" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
