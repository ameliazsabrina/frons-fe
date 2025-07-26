"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import {
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  FileTextIcon,
  ClipboardCheckIcon,
  UserIcon,
  BookOpenIcon,
  MenuIcon,
} from "lucide-react";

function ConditionalSidebarTrigger() {
  try {
    const sidebarProps = useSidebar();
    return <SidebarTrigger />;
  } catch (error) {
    return null;
  }
}

export function Header() {
  const { user, authenticated } = usePrivy();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Helper function to generate link classes
  const getLinkClasses = (href: string) => {
    const baseClasses = "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 group hover:bg-white hover:shadow-sm";
    const activeClasses = pathname === href
      ? "bg-white text-gray-900 shadow-sm border border-gray-100"
      : "text-gray-600 hover:text-gray-900";
    return `${baseClasses} ${activeClasses}`;
  };

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
      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {authenticated && <ConditionalSidebarTrigger />}
            <Link
              href="/"
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative ml-4 lg:ml-0">
                <Image
                  src="/headerlogo.svg"
                  alt="Fronsciers Logo"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {authenticated && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      className="text-sm px-4 py-2 h-10"
                    >
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
              <Button variant="outline" className="text-sm px-4 py-2 h-10">
                Register Your Institution
              </Button>
            </Link>

            <div className="flex items-center">
              <WalletConnection />
            </div>
          </div>

          <div className="flex md:hidden items-center justify-end">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-4">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[400px] p-4">
                <SheetHeader>
                  <SheetTitle className="text-xl font-spectral mb-4 text-primary">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col">
                  {authenticated && (
                    <>
                      <div className="space-y-2">
                        <Link
                          href="/overview"
                          className={getLinkClasses("/overview")}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <LayoutDashboardIcon className="h-4 w-4" />
                          <span>Overview</span>
                        </Link>
                        <Separator className="my-2 bg-primary/10" />

                        <Link
                          href="/submit-manuscript"
                          className={getLinkClasses("/submit-manuscript")}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <FileTextIcon className="h-4 w-4" />
                          <span>Submit Manuscript</span>
                        </Link>
                        <Separator className="my-2 bg-primary/10" />

                        <Link
                          href="/review-manuscript"
                          className={getLinkClasses("/review-manuscript")}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <ClipboardCheckIcon className="h-4 w-4" />
                          <span>Review Manuscript</span>
                        </Link>
                        <Separator className="my-2 bg-primary/10" />

                        <Link
                          href="/your-profile"
                          className={getLinkClasses("/your-profile")}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <UserIcon className="h-4 w-4" />
                          <span>Register Profile</span>
                        </Link>
                        <Separator className="my-2 bg-primary/10" />

                        <Link
                          href="/published-manuscripts"
                          className={getLinkClasses("/published-manuscripts")}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <BookOpenIcon className="h-4 w-4" />
                          <span>Published Papers</span>
                        </Link>
                      </div>

                      <Separator className="my-6 bg-primary/10" />
                    </>
                  )}

                  <div className="space-y-6">
                    <Link
                      href="/register-institution"
                      className={getLinkClasses("/register-institution")}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register Your Institution
                    </Link>

                    <div className="px-3">
                      <p className="text-sm font-medium mb-3">Connect Wallet</p>
                      <WalletConnection />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
