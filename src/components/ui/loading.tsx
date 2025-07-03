"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  progress?: number;
}

export function Loading({ className, progress }: LoadingProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-white flex items-center justify-center relative overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-20 loading-float"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="text-center space-y-4 relative z-10 px-4">
        {progress !== undefined && (
          <div className="w-64 mx-auto pt-4">
            <div className="w-full bg-gray-200 rounded-full h-2 font-semibold">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out font-semibold"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-primary/50 mt-2 font-semibold">
              {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
