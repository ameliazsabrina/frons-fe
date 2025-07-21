"use client";
import React from "react";
import Image from "next/image";

interface DesktopOnlyWrapperProps {
  children: React.ReactNode;
}

export function DesktopOnlyWrapper({ children }: DesktopOnlyWrapperProps) {
  return (
    <>
      <div className="hidden md:block">{children}</div>

      <div className="md:hidden min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="flex justify-center mb-8">
            <Image
              src="/headerlogo.svg"
              alt="Fronsciers Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-primary">
              Desktop Experience Required
            </h1>
            <p className="text-black ">
              Fronsciers is optimized for desktop and laptop devices to provide
              the best academic publishing experience.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
