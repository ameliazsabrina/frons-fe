"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Separator } from "../ui/separator";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export function Vision() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        pin: true,
        pinSpacing: false,
      });

      gsap.fromTo(
        titleRef.current,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
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
        textRef.current,
        { opacity: 0, x: -80 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top bottom-=50px",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom-=50px",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="h-screen pin-panel">
      <div className="container max-w-7xl mx-auto px-4">
        <Separator />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-left order-2 lg:order-1">
              <h2
                ref={titleRef}
                className="text-4xl sm:text-5xl md:text-6xl font-spectral font-bold text-primary mb-8 tracking-tight"
              >
                Fronsciers Vision
              </h2>
              <p
                ref={textRef}
                className="text-base lg:text-2xl text-muted-foreground tracking-tight leading-relaxed"
              >
                Fronsciers envisions a collaborative ecosystem where Authors,
                Peer Reviewers, and Readers continuously strengthen one another.
                Authors share new knowledge, Peer Reviewers ensure quality and
                credibility, and Readers engage with and build upon the
                research.{" "}
                <span className="font-semibold">
                  {" "}
                  Together, this cycle of contribution drives innovation and
                  keeps the community growing stronger.{" "}
                </span>{" "}
              </p>
            </div>

            <div
              ref={imageRef}
              className="flex justify-center order-1 lg:order-2"
            >
              <Image
                src="/vision.svg"
                alt="Fronsciers's Vision"
                width={600}
                height={600}
                priority
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
