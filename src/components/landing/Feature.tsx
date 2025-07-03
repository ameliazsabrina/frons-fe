"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export function Feature() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          startAnimation();
        }
      },
      {
        threshold: 0.5,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isVisible]);

  const startAnimation = () => {
    if (!text1Ref.current || !text2Ref.current) return;

    const tl = gsap.timeline();
    timelineRef.current = tl;

    gsap.set(text2Ref.current, { opacity: 0, y: 30 });

    tl.to(
      text1Ref.current,
      {
        duration: 0.8,
        opacity: 0,
        y: -30,
        ease: "power2.inOut",
      },
      0
    );

    tl.to(
      text2Ref.current,
      {
        duration: 0.8,
        opacity: 1,
        y: 0,
        ease: "power2.inOut",
      },
      0.4
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        padding: "20px 30px",
        fontSize: "30px",
        color: "#dfdcff",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(50px)",
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
    >
      <div
        style={{
          width: "550px",
          position: "relative",
          height: "50vh",
          fontSize: "50px",
        }}
      >
        <div
          ref={text1Ref}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }}
        >
          traditional publishing costs you thousands of dollars to publish your
          paper
        </div>
        <div
          ref={text2Ref}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            opacity: 0,
          }}
        >
          with Fronsciers you only need to deposit fifty dollars for your paper
        </div>
      </div>
    </div>
  );
}
