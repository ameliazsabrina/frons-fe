"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Separator } from "../ui/separator";

export function PublishingAdvantages() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLLIElement[]>([]);

  const advantages = [
    "cheaper.",
    "rewarded.",
    "trustless.",
    "immutable.",
    "verified.",
    "collaborative.",
    "global.",
    "better.",
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const items = itemsRef.current.filter(Boolean);
    if (items.length === 0) return;

    gsap.set(items, { opacity: (i) => (i !== 0 ? 0.2 : 1) });

    const dimmer = gsap
      .timeline()
      .to(items.slice(1), {
        opacity: 1,
        stagger: 0.5,
      })
      .to(
        items.slice(0, items.length - 1),
        {
          opacity: 0.2,
          stagger: 0.5,
        },
        0
      );

    const dimmerScrub = ScrollTrigger.create({
      trigger: items[0],
      endTrigger: items[items.length - 1],
      start: "center center",
      end: "center center",
      animation: dimmer,
      scrub: 0.2,
    });

    return () => {
      dimmerScrub?.kill();
    };
  }, [advantages.length]);

  return (
    <div ref={containerRef} className="bg-white lg:-mt-20 -mt-10 z-30">
      {/* <header className="h-[25vh] lg:h-[40vh] w-full flex flex-col items-center justify-center pt-0"> */}
      <div className="w-full pt-36 mb-12 px-4 sm:px-8 lg:px-16">
        <h1 className="text-center font-semibold text-primary text-3xl  md:text-6xl ">
          With Fronsciers,
        </h1>
      </div>
      {/* </header> */}

      <main className="w-full justify-center ml-4 lg:ml-16">
        <section
          className="content justify-center lg:pl-14 pl-10"
          style={{
            display: "flex",
            lineHeight: "1.25",
            width: "90%",
            justifyContent: "center",
          }}
        >
          <h2
            className="text-2xl md:text-4xl whitespace-nowrap"
            style={{
              position: "sticky",
              top: "calc(50% - 0.5lh)",
              // fontSize: "clamp(3rem, 5vw, 5rem)",
              margin: 0,
              display: "inline-block",
              height: "fit-content",
              fontWeight: 600,
            }}
          >
            <span
              aria-hidden="true"
              className="text-primary mr-2 whitespace-nowrap"
            >
              research is&nbsp;
            </span>
            <span className="sr-only">research is better.</span>
          </h2>

          <ul
            aria-hidden="true"
            style={
              {
                fontWeight: 600,
                paddingInline: 0,
                margin: 0,
                listStyleType: "none",
                "--count": advantages.length,
              } as React.CSSProperties
            }
          >
            {advantages.map((advantage, index) => (
              <li
                key={index}
                ref={(el) => {
                  if (el) itemsRef.current[index] = el;
                }}
                className="text-2xl md:text-4xl"
                style={
                  {
                    "--i": index,
                    // fontSize: "clamp(3rem, 5vw, 5rem)",
                    fontWeight: 600,
                  } as React.CSSProperties
                }
              >
                {advantage}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
}
