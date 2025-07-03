"use client";
import React, { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const isMovingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const rafRef = useRef<number>();

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const animate = () => {
      // Smooth interpolation
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;

      cursor.style.transform = `translate(${currentX - 30}px, ${
        currentY - 30
      }px) scale(${isHoveringRef.current ? 1.3 : 1})`;

      rafRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      isMovingRef.current = true;
      cursor.style.opacity = "1";

      // Check for interactive elements
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.hasAttribute("role") ||
        target.classList.contains("cursor-pointer") ||
        target.closest("a, button, [role='button'], .cursor-pointer");

      isHoveringRef.current = !!isInteractive;

      // Update cursor classes for hover state
      const circle = cursor.querySelector(".cursor-circle") as HTMLElement;
      const arrow = cursor.querySelector(".cursor-arrow") as SVGElement;

      if (isHoveringRef.current) {
        circle.className =
          "cursor-circle rounded-full border-2 backdrop-blur-sm flex items-center justify-center transition-all duration-300 w-16 h-16 border-primary bg-primary/20";
        arrow.setAttribute(
          "class",
          "cursor-arrow transition-all duration-300 w-6 h-6 text-primary"
        );
      } else {
        circle.className =
          "cursor-circle rounded-full border-2 backdrop-blur-sm flex items-center justify-center transition-all duration-300 w-14 h-14 border-primary/60 bg-primary/10";
        arrow.setAttribute(
          "class",
          "cursor-arrow transition-all duration-300 w-5 h-5 text-primary"
        );
      }

      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }

      moveTimeoutRef.current = setTimeout(() => {
        isMovingRef.current = false;
        cursor.style.opacity = "0";
      }, 500);
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = "0";
      isMovingRef.current = false;
    };

    const handleMouseEnter = () => {
      cursor.style.opacity = "1";
    };

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] transition-opacity duration-300"
      style={{
        opacity: 0,
      }}
    >
      <div className="relative">
        <div className="cursor-circle rounded-full border-2 backdrop-blur-sm flex items-center justify-center transition-all duration-300 w-14 h-14 border-primary/60 bg-primary/10">
          <ArrowUpRight className="cursor-arrow transition-all duration-300 w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
};
