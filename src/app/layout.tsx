import type { Metadata } from "next";
import { DM_Sans, Anton } from "next/font/google";

import "./globals.css";
import DynamicProvider from "@/provider/DynamicProvider";
import { LoadingProvider } from "@/context/LoadingContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "FRONSCIERS - Revolutionary Blockchain Academic Publishing",
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
        className={`${dmSans.variable} ${anton.variable} font-sans antialiased`}
      >
        <LoadingProvider>
          <DynamicProvider>{children}</DynamicProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
