"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Separator } from "../ui/separator";

gsap.registerPlugin(ScrollTrigger);

const splitTextIntoChars = (text: string) => {
  return text.split("").map((char, index) => (
    <span key={index} className="char inline-block">
      {char === " " ? "\u00A0" : char}
    </span>
  ));
};

export function Mission() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white">
      <div className="container max-w-7xl mx-auto px-4">
        <Separator className="mb-16" />
        <div className="text-center space-y-4">
          <h2
            ref={titleRef}
            className="font-anton uppercase text-primary word mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            {splitTextIntoChars("Fronsciers's Mission")}
          </h2>
          <p className=" text-lg lg:text-2xl text-gray-600 max-w-3xl mx-auto tracking-tight">
            To democratize academic publishing and ensure research integrity
            through blockchain technology, making knowledge accessible to
            everyone.
          </p>
        </div>
      </div>
    </section>
  );
}
