"use client";
import Image from "next/image";
import { Twitter, Linkedin, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="bg-primary rounded-t-3xl overflow-hidden mx-4">
        <div className="py-12 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex justify-center md:justify-start">
              <div className="flex items-center space-x-3">
                <Image
                  src="/logowhite.svg"
                  alt="Fronsciers Logo"
                  width={32}
                  height={32}
                  className="rounded-md w-32 h-32"
                />
              </div>
            </div>

            <div className="flex justify-center space-x-6">
              <Link
                href="https://x.com/fronsciers"
                className="text-white/70 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/fronsciers"
                className="text-white/70 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex justify-center md:justify-end">
              <Link href="mailto:hello@fronsciers.com">
                <Button variant="outline" size="lg" className="px-8 py-4">
                  Contact Us
                  <ArrowDownRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-white/20 text-center">
            <p className="text-white/70 text-xs">
              © 2025 Fronsciers. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
