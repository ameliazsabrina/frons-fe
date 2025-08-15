"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

import { WalletConnection } from "@/components/wallet-connection";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizeable-navbar";
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

function ConditionalSidebarTrigger() {
  try {
    const sidebarProps = useSidebar();
    return <SidebarTrigger />;
  } catch (error) {
    return null;
  }
}

const FronciersLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal"
    >
      <Image
        src="/headerlogo.svg"
        alt="Fronsciers Logo"
        width={30}
        height={30}
        className="object-contain"
      />
    </Link>
  );
};

export function Header() {
  const { authenticated } = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items for authenticated users
  const navItems = authenticated
    ? [
        {
          name: "Overview",
          link: "/overview",
        },
        {
          name: "Submit",
          link: "/submit-manuscript",
        },
        {
          name: "Review",
          link: "/review-manuscript",
        },
        {
          name: "Profile",
          link: "/your-profile",
        },
        {
          name: "Published",
          link: "/published-manuscripts",
        },
      ]
    : [];

  return (
    <div className="relative w-full">
      <Navbar className="fixed inset-x-0 top-0 z-40 w-full">
        {/* Desktop Navigation */}
        <NavBody>
          <div className="flex items-center space-x-2">
            {authenticated && <ConditionalSidebarTrigger />}
            <FronciersLogo />
          </div>

          {authenticated && <NavItems items={navItems} />}

          <div className="flex items-center gap-4">
            {authenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <NavbarButton variant="secondary" className="text-sm">
                    Menu
                    <ChevronDownIcon className="ml-1 h-4 w-4" />
                  </NavbarButton>
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
                    <Link href="/your-profile" className="flex items-center ">
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
            )}

            <NavbarButton
              as={Link}
              href="/register-institution"
              variant="secondary"
              className="text-sm font-semibold -mr-2"
            >
              Register Institution
            </NavbarButton>

            <div className="flex items-center">
              <WalletConnection />
            </div>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <div className="flex items-center space-x-2">
              {authenticated && <ConditionalSidebarTrigger />}
              <FronciersLogo />
            </div>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {authenticated &&
              navItems.map((item, idx) => (
                <Link
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300 flex items-center gap-3 p-2"
                >
                  {item.name === "Overview" && (
                    <LayoutDashboardIcon className="h-4 w-4" />
                  )}
                  {item.name === "Submit" && (
                    <FileTextIcon className="h-4 w-4" />
                  )}
                  {item.name === "Review" && (
                    <ClipboardCheckIcon className="h-4 w-4" />
                  )}
                  {item.name === "Profile" && <UserIcon className="h-4 w-4" />}
                  {item.name === "Published" && (
                    <BookOpenIcon className="h-4 w-4" />
                  )}
                  <span className="block">{item.name}</span>
                </Link>
              ))}

            <div className="flex w-full flex-col gap-4 mt-4">
              <NavbarButton
                as={Link}
                href="/register-institution"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full text-left"
              >
                Register Institution
              </NavbarButton>

              <div className="w-full">
                <p className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                  Connect Wallet
                </p>
                <WalletConnection />
              </div>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
