"use client";
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OverviewSidebar } from "@/components/overview-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex min-h-screen">
        <OverviewSidebar connected />
        <main className="flex-1">
          <div className="sticky top-0 z-10 bg-white border-b">
            <div className="flex items-center px-8 h-16">
              <SidebarTrigger className="h-10 w-10" />
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
