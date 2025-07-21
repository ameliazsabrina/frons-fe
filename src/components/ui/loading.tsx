"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  className?: string;
  progress?: number;
  variant?: "page" | "inline" | "button" | "overlay";
  size?: "sm" | "md" | "lg";
  text?: string;
  showSpinner?: boolean;
}

export function Loading({ 
  className, 
  progress, 
  variant = "page",
  size = "md",
  text,
  showSpinner = true
}: LoadingProps) {
  // Page loading (full screen)
  if (variant === "page") {
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
          {showSpinner && (
            <Loader2 className={cn(
              "animate-spin text-primary mx-auto",
              size === "sm" && "h-6 w-6",
              size === "md" && "h-8 w-8", 
              size === "lg" && "h-12 w-12"
            )} />
          )}
          
          {text && (
            <p className="text-sm text-primary/70 font-medium">{text}</p>
          )}

          {progress !== undefined && (
            <div className="w-64 mx-auto pt-2">
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

  // Inline loading (within content)
  if (variant === "inline") {
    return (
      <div className={cn(
        "flex items-center justify-center py-8",
        className
      )}>
        <div className="flex items-center space-x-3">
          {showSpinner && (
            <Loader2 className={cn(
              "animate-spin text-primary",
              size === "sm" && "h-4 w-4",
              size === "md" && "h-6 w-6",
              size === "lg" && "h-8 w-8"
            )} />
          )}
          {text && (
            <span className={cn(
              "text-primary font-medium",
              size === "sm" && "text-sm",
              size === "md" && "text-base",
              size === "lg" && "text-lg"
            )}>
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Button loading (for buttons)
  if (variant === "button") {
    return (
      <div className={cn(
        "flex items-center space-x-2",
        className
      )}>
        {showSpinner && (
          <Loader2 className={cn(
            "animate-spin",
            size === "sm" && "h-3 w-3",
            size === "md" && "h-4 w-4",
            size === "lg" && "h-5 w-5"
          )} />
        )}
        {text && (
          <span className={cn(
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Overlay loading (modal-like)
  if (variant === "overlay") {
    return (
      <div className={cn(
        "fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50",
        className
      )}>
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4">
          <div className="flex items-center space-x-3">
            {showSpinner && (
              <Loader2 className={cn(
                "animate-spin text-primary",
                size === "sm" && "h-5 w-5",
                size === "md" && "h-6 w-6",
                size === "lg" && "h-8 w-8"
              )} />
            )}
            {text && (
              <span className={cn(
                "text-gray-900 font-medium",
                size === "sm" && "text-sm",
                size === "md" && "text-base",
                size === "lg" && "text-lg"
              )}>
                {text}
              </span>
            )}
          </div>
          
          {progress !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {progress}%
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default to inline if variant not recognized
  return (
    <div className={cn(
      "flex items-center justify-center py-4",
      className
    )}>
      {showSpinner && (
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      )}
      {text && (
        <span className="text-primary font-medium ml-3">{text}</span>
      )}
    </div>
  );
}
