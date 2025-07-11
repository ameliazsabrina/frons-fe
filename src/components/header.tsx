"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

import { WalletConnection } from "@/components/wallet-connection";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  FileTextIcon,
  ClipboardCheckIcon,
  UserIcon,
  BookOpenIcon,
} from "lucide-react";

export function Header() {
  const { user } = usePrivy();
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
      <div className="container max-w-7xl mx-auto px-8">
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
            {user && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" className="text-sm">
                      Overview
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/overview" className="flex items-center">
                        <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                        Overview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/submit-manuscript"
                        className="flex items-center"
                      >
                        <FileTextIcon className="mr-2 h-4 w-4" />
                        Submit Manuscript
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/review-manuscript"
                        className="flex items-center"
                      >
                        <ClipboardCheckIcon className="mr-2 h-4 w-4" />
                        Review Manuscript
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/your-profile" className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Register Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/published-manuscripts"
                        className="flex items-center"
                      >
                        <BookOpenIcon className="mr-2 h-4 w-4" />
                        Published Papers
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6" />
              </>
            )}

            <Link href="/register-institution">
              <Button variant="outline" className="hidden sm:flex text-sm ">
                Register Your Institution
              </Button>
            </Link>

            <div className="flex items-center">
              <WalletConnection />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
