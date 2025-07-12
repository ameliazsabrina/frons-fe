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
      label: "Author Dashboard ",
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
    <Sidebar className="border-r border-gray-100 bg-gray-50/50 bg-white">
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <div className="flex justify-center mt-20 mb-8">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Image
                src="/logoname.svg"
                alt="Fronsciers"
                width={180}
                height={180}
                className="object-contain"
              />
            </Link>
          </div>

          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 group",
                        "hover:bg-white hover:shadow-sm",
                        pathname === link.href
                          ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <span
                        className={cn(
                          "transition-colors duration-200 flex-shrink-0",
                          pathname === link.href
                            ? "text-primary"
                            : "text-gray-400 group-hover:text-gray-600"
                        )}
                      >
                        {link.icon}
                      </span>
                      <span className="font-medium text-sm">{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white py-3 px-2 border-t border-gray-100">
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
      </SidebarFooter>
    </Sidebar>
  );
}
