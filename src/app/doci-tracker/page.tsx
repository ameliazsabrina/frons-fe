"use client";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SearchIcon,
  ScanIcon,
  ClipboardIcon,
  ArrowRightIcon,
} from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { OverviewSidebar } from "@/components/overview-sidebar";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/components/ui/toast";

export default function DocisPage() {
  const { connected } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const { showToast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showToast("Please enter a search term", "error");
      return;
    }

    try {
      setSearching(true);
      console.log("Searching for DOCI:", searchQuery);

      // TODO: Implement DOCI search functionality
      // For now, show a placeholder message
      showToast("DOCI search functionality is coming soon!", "info");

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error("DOCI search error:", error);
      showToast("Failed to search DOCI. Please try again.", "error");
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setSearchQuery(text.trim());
        showToast("DOCI ID pasted from clipboard", "success");
      } else {
        showToast("Clipboard is empty", "error");
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      showToast("Failed to read from clipboard", "error");
    }
  };

  const handleScanQR = () => {
    // TODO: Implement QR code scanning
    showToast("QR code scanning functionality is coming soon!", "info");
  };

  const handleExampleSearch = (example: string) => {
    setSearchQuery(example);
    showToast(`Example search "${example}" selected`, "info");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white flex w-full">
        <OverviewSidebar connected={connected} />

        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen">
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center gap-2 px-4 py-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <ScanIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl text-primary font-spectral tracking-tight">
                    DOCI Tracker
                  </h1>
                  <p className="text-primary/80 text-sm sm:text-md max-w-lg mx-auto">
                    Search and track Digital Object Content Identifiers (DOCIs)
                    in the Fronsciers network. Enter a DOCI ID, manuscript
                    title, or author name to find research documents.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter DOCI ID, title, or author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-32 py-4 text-lg border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 text-gray-900 placeholder-gray-500 shadow-sm"
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={searching}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2"
                    >
                      {searching ? "Searching..." : "Search"}
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={handlePasteFromClipboard}
                      className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
                    >
                      <ClipboardIcon className="h-4 w-4" />
                      Paste DOCI ID
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleScanQR}
                      className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
                    >
                      <ScanIcon className="h-4 w-4" />
                      Scan QR Code
                    </Button>
                  </div>

                  {/* Example Searches */}
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-500">Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        "DOCI-2024-001",
                        "Blockchain Consensus",
                        "Dr. Sarah Chen",
                        "Peer Review Systems",
                      ].map((example, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleSearch(example)}
                          className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                  <div className="text-center p-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <SearchIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Track Research
                    </p>
                    <p className="text-xs text-gray-500">
                      Find and verify published research documents
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ClipboardIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Verify Authenticity
                    </p>
                    <p className="text-xs text-gray-500">
                      Confirm document integrity and ownership
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ScanIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Access Metadata
                    </p>
                    <p className="text-xs text-gray-500">
                      View detailed publication information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
