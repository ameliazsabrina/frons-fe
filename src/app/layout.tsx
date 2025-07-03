import type { Metadata } from "next";
import { DM_Sans, Spectral } from "next/font/google";

import "./globals.css";
import PrivyProvider from "@/provider/PrivyProvider";
import { LoadingProvider } from "@/context/LoadingContext";
import { CustomCursor } from "@/components/ui/custom-cursor";
import SidebarProvider from "@/provider/SidebarProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-spectral",
});

export const metadata: Metadata = {
  title: "Fronsciers - Revolutionary Blockchain Academic Publishing",
  description:
    "Modernizing academic research publication through decentralized technologies, tokenized incentives, and community-driven peer review on Solana blockchain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${spectral.variable} font-sans antialiased`}
      >
        <LoadingProvider>
          <PrivyProvider>
            <CustomCursor />
            <SidebarProvider>{children}</SidebarProvider>
          </PrivyProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
