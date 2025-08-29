"use client";
import React, { useEffect, useRef } from "react";
import { Separator } from "../ui/separator";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ProblemAgitation() {
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const text = textRef.current;

    if (!text) return;

    gsap.fromTo(
      text,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: text,
          start: "top bottom-=50px",
          end: "bottom center",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="container max-w-7xl mx-auto px-4">
      <Separator className="mb-16" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="text-left tracking-tight">
            <h2 className="text-6xl font-spectral font-bold text-primary">
              The Challenge
            </h2>
          </div>

          <div className="text-left">
            <p
              ref={textRef}
              className="text-base lg:text-2xl text-muted-foreground tracking-tight leading-tight mb-16"
            >
              Publishing research today is slow, costly, and often gatekept.
              Authors face months of waiting, unclear review processes, and
              limited access to affordable tools. This slows down innovation and
              makes it harder for ideas to reach the world.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
