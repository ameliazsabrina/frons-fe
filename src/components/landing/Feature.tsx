"use client";
import React from "react";
import { Separator } from "../ui/separator";
import { CardSwap, Card } from "../ui/card-swap";
import {
  Upload,
  Eye,
  Shield,
  FileText,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export function Feature() {
  return (
    <section className="pt-20 pb-0 px-4 bg-white h-[85vh] lg:h-[70vh] overflow-hidden justify-between">
      <Separator className="mb-16" />
      <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="order-1 lg:order-1">
          <div className="text-center lg:text-left mb-8 lg:mb-16">
            <h2 className="font-spectral tracking-tight font-semibold text-primary word mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl">
              How Fronsciers Works
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto lg:max-w-xl -mb-48 mt-2 lg:mb-0 lg:mt-0 leading-tight">
              Experience the future of academic publishing with our streamlined
              blockchain-powered platform
            </p>
          </div>
        </div>
        <div className="order-2 lg:order-2 flex flex-col -mt-24">
          <div
            style={{ height: "600px", position: "relative" }}
            className="md:h-[700px] lg:h-[700px] "
          >
            <CardSwap
              cardDistance={20}
              verticalDistance={10}
              delay={3000}
              pauseOnHover={true}
            >
              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-semibold text-foreground mb-3">
                    Submit Manuscript
                  </h3>
                  <p className="text-muted-foreground text-md leading-tight">
                    Upload your research paper with metadata. Supports all major
                    academic formats.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-semibold text-foreground mb-3">
                    Peer Review
                  </h3>
                  <p className="text-muted-foreground text-md leading-tight">
                    Rigorous peer review by qualified experts ensuring quality
                    and credibility.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-semibold text-foreground mb-3">
                    Blockchain Publication
                  </h3>
                  <p className="text-muted-foreground text-md leading-tight">
                    Published on blockchain with immutable timestamps and
                    permanent accessibility.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-semibold text-foreground mb-3">
                    NFT Creation
                  </h3>
                  <p className="text-muted-foreground text-md leading-tight">
                    Your paper becomes a unique NFT with proof of ownership and
                    monetization opportunities.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-semibold text-foreground mb-3">
                    Track Impact
                  </h3>
                  <p className="text-muted-foreground text-md leading-tight">
                    Monitor citations and engagement metrics through real-time
                    blockchain analytics.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-semibold text-foreground mb-3">
                    Earn Revenue
                  </h3>
                  <p className="text-muted-foreground text-md leading-tight">
                    Generate income through NFT sales, citation royalties, and
                    platform revenue sharing.
                  </p>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
}
