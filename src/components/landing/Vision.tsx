"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Separator } from "../ui/separator";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const splitTextIntoChars = (text: string) => {
  return text.split("").map((char, index) => (
    <span key={index} className="char inline-block">
      {char === " " ? "\u00A0" : char}
    </span>
  ));
};

export function Vision() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const titleElement = titleRef.current;
      if (titleElement) {
        const tl = gsap.timeline({ paused: true });
        const chars = titleElement.querySelectorAll(".char");

        tl.from(chars, {
          yPercent: -120,
          duration: 0.3,
          ease: "power1.out",
          stagger: { amount: 0.7 },
        });

        ScrollTrigger.create({
          trigger: titleElement,
          start: "top 80%",
          end: "bottom 20%",
          onEnter: () => tl.play(),
          onLeave: () => tl.reverse(),
          onEnterBack: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });
      }

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Image animation
      gsap.fromTo(
        imageRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white">
      <div className="container max-w-7xl mx-auto px-4">
        <Separator className="mb-16" />
        <div className="text-center ">
          <h2
            ref={titleRef}
            className="font-spectral tracking-tight font-semibold text-primary word mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            {splitTextIntoChars("Fronsciers's Vision")}
          </h2>
          <div ref={imageRef} className="flex justify-center">
            <Image
              src="/vision.svg"
              alt="Fronsciers's Vision"
              width={700}
              height={700}
              priority
              onLoad={() => console.log("Vision image loaded successfully")}
              onError={() => console.error("Vision image failed to load")}
            />
          </div>

          <p className=" text-lg lg:text-3xl text-gray-600 max-w-2xl mx-auto tracking-tight ">
            Fronsciers grows as the communities keep contribute to the
            innovations
          </p>
        </div>
      </div>
    </section>
  );
}
