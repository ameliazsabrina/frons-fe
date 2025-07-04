"use client";
import React from "react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "./ui/sidebar";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  ClipboardCheckIcon,
  UserIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { WalletConnection } from "./wallet-connection";
import Link from "next/link";

export function OverviewSidebar({ connected }: { connected: boolean }) {
  const links = [
    {
      label: "Overview",
      href: "/overview",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
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
    <Sidebar className="bg-white">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <div className="font-bold text-lg mb-4 flex justify-center mt-16 border-b border-gray-200 pb-4">
            <Link href="/">
              <Image
                src="/logoname.svg"
                alt="Fronsciers"
                width={200}
                height={200}
              />
            </Link>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild>
                    <a href={link.href} className="flex items-center gap-3">
                      {link.icon}
                      <span>{link.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex bg-white">
        <div className="text-sm text-gray-600 mb-2 ml-4">
          {connected ? (
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              Connected
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircleIcon className="h-4 w-4 text-red-500" />
              Not Connected
            </div>
          )}
        </div>
        <WalletConnection />
      </SidebarFooter>
    </Sidebar>
  );
}
