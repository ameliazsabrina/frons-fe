"use client";
import React from "react";
import Image from "next/image";
import {
  SidebarBody,
  SidebarLink,
} from "./ui/sidebar";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  ClipboardCheckIcon,
  UserIcon,
  BookOpenIcon,
  FilePen,
} from "lucide-react";
import { WalletConnection } from "./wallet-connection";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function OverviewSidebar({ connected }: { connected: boolean }) {
  const pathname = usePathname();

  const links = [
    {
      label: "Overview",
      href: "/overview",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
    },
    {
      label: "Author Dashboard",
      href: "/author-dashboard",
      icon: <FilePen className="h-5 w-5" />,
    },
    {
      label: "Submit Manuscript",
      href: "/submit-manuscript",
      icon: <BookOpenIcon className="h-5 w-5" />,
    },
    {
      label: "Review Manuscript",
      href: "/review-manuscript",
      icon: <ClipboardCheckIcon className="h-5 w-5" />,
    },
    {
      label: "DOCI Tracker",
      href: "/doci-tracker",
      icon: <FileTextIcon className="h-5 w-5" />,
    },
    {
      label: "Your Profile",
      href: "/your-profile",
      icon: <UserIcon className="h-5 w-5" />,
    },
  ];

  return (
    <SidebarBody className="justify-between">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-center mb-8">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Image
              src="/logoname.svg"
              alt="Fronsciers"
              width={120}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>
        
        <div className="flex flex-col space-y-2">
          {links.map((link) => (
            <SidebarLink key={link.href} link={link} />
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <div className="text-xs text-gray-500 mb-3 text-center">
          {connected ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Not Connected</span>
            </div>
          )}
        </div>
        <WalletConnection />
      </div>
    </SidebarBody>
  );
}
