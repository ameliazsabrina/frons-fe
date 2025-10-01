"use client";
import React, { useEffect, useRef } from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContainerScroll } from "../ui/container-scroll-animation";
import { DotBackgroundDemo } from "../ui/dot-background";
import Image from "next/image";
import LightRays from "@/components/ui/LightRays";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .learn-more-btn:hover .circle {
        width: 100% !important;
      }
      .learn-more-btn:hover .icon-default {
        opacity: 0 !important;
      }
      .learn-more-btn:hover .icon-hover {
        opacity: 1 !important;
      }
      .learn-more-btn:hover .button-text {
        color: white !important;
      }
      .learn-more-btn:hover .button-text a {
        color: white !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        ctaContainerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: "power3.out" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    // <section
    //   ref={heroRef}
    //   className="relative min-h-screen overflow-hidden bg-white dark:bg-black"
    // >
    //   <div className="absolute inset-0 z-0">{/* <DotBackgroundDemo /> */}</div>

    //   <div className="pointer-events-none absolute inset-0 z-20 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black opacity-50"></div>

    //   <div className="relative z-30 ">
    //     {/* <ContainerScroll
    //       titleComponent={
    //         <div className="text-center space-y-4 lg:space-y-8 px-4 relative z-10 mb-16">
    //           <h1
    //             ref={titleRef}
    //             className="text-6xl md:text-8xl lg:text-9xl font-semibold lg:leading-0.8 tracking-tight "
    //           >
    //             <span className="text-primary">Research</span>
    //             <br />
    //             <span className="text-gray-900 dark:text-gray-100 italic  font-spectral ">
    //               Reimagined
    //             </span>
    //           </h1>

    //           <p
    //             ref={subtitleRef}
    //             className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-tight font-medium mb-2 lg:mb-16 lg:whitespace-nowrap tracking-tight"
    //           >
    //             Spend less to publish, earn more for your impact. Start from $50
    //             only!
    //             <br />
    //             <span className="text-primary font-medium tracking-tight">
    //               Publish. Review. Earn. Repeat.
    //             </span>
    //           </p>
    //         </div>
    //       }
    //     >
    //       <LaptopDisplayContent />
    //     </ContainerScroll> */}
    //     <h1>Hello World</h1>
    //   </div>
    // </section>
    <section className="min-h-screen">
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#16007e"
          raysSpeed={1.6}
          lightSpread={1.2}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.4}
          distortion={0.0}
          className="custom-rays opacity-50"
        />
      </div>
      <div className="min-h-screen flex items-center justify-center">
        <div className="mx-auto max-w-lg md:max-w-4xl text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Blockchain‑Powered Publishing
          </p>
          <h1
            className="mt-3 text-balance text-4xl md:text-6xl font-semibold tracking-tight"
            ref={titleRef}
          >
            Open, Peer‑Reviewed, On‑Chain
          </h1>
          <p
            className="mt-4 text-pretty text-muted-foreground leading-relaxed md:text-lg text-md"
            ref={subtitleRef}
          >
            Publish faster with transparent reviews, permanent storage via
            decentralized storage, and truly open access. Built for researchers
            who value rigor, clarity, and credibility.
          </p>
          <div
            className="mt-6 flex items-center justify-center"
            ref={ctaContainerRef}
          >
            <button
              ref={startButtonRef}
              className="learn-more-btn relative inline-block cursor-pointer outline-none border-0 align-middle no-underline bg-transparent p-0 text-inherit font-inherit w-52 h-auto"
            >
              <span className="circle relative block m-0 w-12 h-12 bg-primary dark:bg-white rounded-[1.625rem] transition-all duration-&lsqb;450ms&rsqb; ease-&lsqb;cubic-bezier(0.65,0,.076,1)&rsqb; overflow-hidden"></span>
              <ChevronRight className="icon-default absolute top-1/2 left-[14px] -translate-y-1/2 w-5 h-5 text-white dark:text-primary transition-all duration-&lsqb;450ms&rsqb; ease-&lsqb;cubic-bezier(0.65,0,.076,1)&rsqb; z-10" />
              <ArrowRight className="icon-hover absolute top-1/2 left-[14px] -translate-y-1/2 w-5 h-5 text-white dark:text-primary transition-all duration-&lsqb;450ms&rsqb; ease-&lsqb;cubic-bezier(0.65,0,.076,1)&rsqb; opacity-0 z-10" />
              <span className="button-text absolute top-0 left-0 right-0 bottom-0 py-3 px-0 ml-7 text-primary dark:text-white text-center transition-all duration-&lsqb;450ms&rsqb; ease-&lsqb;cubic-bezier(0.65,0,.076,1)&rsqb;">
                <a href="#submit" className="text-inherit no-underline ml-4">
                  Start Submission
                </a>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// function LaptopDisplayContent() {
//   const imageRef = useRef<HTMLImageElement>(null);

//   return (
//     <div className="relative flex h-full w-full items-center justify-center scale-110">
//       <div className="relative w-full h-full">
//         {/* Mobile Image - visible on mobile devices */}
//         <Image
//           ref={imageRef}
//           src="/mobile-dummy.png"
//           alt="Fronsciers"
//           width={2000}
//           height={2000}
//           className="w-full h-full max-w-full object-contain md:hidden"
//           priority
//         />

//         {/* Desktop/Laptop Image - visible on md screens and above */}
//         <Image
//           src="/laptop-dummy.png"
//           alt="Fronsciers"
//           width={2000}
//           height={2000}
//           className="w-full h-full max-w-full object-contain hidden md:block"
//           priority
//         />
//       </div>
//     </div>
//   );
// }
