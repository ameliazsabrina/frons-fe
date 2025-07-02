"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useProgram } from "@/hooks/useProgram";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export function Header() {
  const { connected } = useProgram();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 relative">
              <Image
                src="/headerlogo.svg"
                alt="Fronsciers Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/register-institution">
              <Button variant="outline" className="hidden sm:flex text-sm ">
                Register Your Institution
              </Button>
            </Link>

            <div className="flex items-center">
              <DynamicWidget innerButtonComponent={"Get Started"} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
