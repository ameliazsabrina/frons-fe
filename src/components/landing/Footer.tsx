"use client";
import React from "react";
import Image from "next/image";
import { X, Linkedin, Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <Image
              src="/headerlogo.svg"
              alt="Fronsciers Logo"
              width={24}
              height={24}
              className="rounded-md w-12 h-12"
            />
          </div>

          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Revolutionizing academic publishing through blockchain technology.
          </p>

          <div className="flex justify-center space-x-6">
            <div className="text-gray-400 hover:text-gray-600 transition-colors">
              <Link href="https://x.com/fronsciers">
                <X className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-gray-400 hover:text-gray-600 transition-colors">
              <Link href="https://www.linkedin.com/company/fronsciers">
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-xs">
              © 2025 Fronsciers. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
