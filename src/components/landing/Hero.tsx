"use client";
import React, { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContainerScroll } from "../ui/container-scroll-animation";
import { DotBackgroundDemo } from "../ui/dot-background";

import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
      );

      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: "power3.out" }
      );

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: "power3.out" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-white dark:bg-black"
    >
      <div className="absolute inset-0 z-0">
        <DotBackgroundDemo />
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black opacity-50"></div>

      <div className="relative z-30 ">
        <ContainerScroll
          titleComponent={
            <div className="text-center space-y-4 lg:space-y-8 px-4 relative z-10 mb-16">
              <h1
                ref={titleRef}
                className="text-6xl md:text-8xl lg:text-9xl font-semibold lg:leading-0.8 tracking-tight "
              >
                <span className="text-primary">Research</span>
                <br />
                <span className="text-gray-900 dark:text-gray-100 italic ">
                  Reimagined
                </span>
              </h1>

              <p
                ref={subtitleRef}
                className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-tight font-medium mb-2 lg:mb-16 whitespace-nowrap"
              >
                Spend less to publish, earn more for your impact. Start from $50
                only!
                <br />
                <span className="text-primary font-medium ">
                  Publish. Review. Earn. Repeat.
                </span>
              </p>
            </div>
          }
        >
          <LaptopDisplayContent />
        </ContainerScroll>
      </div>
    </section>
  );
}

function LaptopDisplayContent() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <Image
          src="/laptop-size.png"
          alt="Fronsciers Platform on Laptop"
          width={1200}
          height={800}
          className="w-full h-auto max-w-5xl object-contain"
          priority
        />
      </div>
    </div>
  );
}
