"use client";
import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg w-80 h-72 md:w-[500px] md:h-[400px] lg:w-[600px] lg:h-[450px] ${className}`}
    >
      {children}
    </div>
  );
};

interface CardSwapProps {
  children: React.ReactElement<CardProps>[];
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
}

export const CardSwap: React.FC<CardSwapProps> = ({
  children,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const nextCard = () => {
      if (!isPaused) {
        setCurrentIndex((prev) => (prev + 1) % children.length);
      }
    };

    timeoutRef.current = setTimeout(nextCard, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isPaused, delay, children.length]);

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.children;
    const totalCards = cards.length;

    gsap.to(cards, {
      duration: 0.8,
      ease: "power2.inOut",
      stagger: 0.1,
    });

    // Position each card
    Array.from(cards).forEach((card, index) => {
      const adjustedIndex = (index - currentIndex + totalCards) % totalCards;
      const zIndex = totalCards - adjustedIndex;
      const scale = Math.max(0.7, 1 - adjustedIndex * 0.15);
      const opacity = Math.max(0.2, 1 - adjustedIndex * 0.4);
      const x = adjustedIndex * cardDistance;
      const y = adjustedIndex * verticalDistance;

      gsap.to(card as HTMLElement, {
        duration: 0.8,
        ease: "power2.inOut",
        x,
        y,
        scale,
        opacity,
        zIndex,
      });
    });
  }, [currentIndex, cardDistance, verticalDistance, children.length]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children.map((child, index) => (
        <div
          key={index}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            zIndex: children.length - index,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
