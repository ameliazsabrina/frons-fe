"use client";
import React from "react";
import { Separator } from "../ui/separator";
import { CardSwap, Card } from "../ui/card-swap";

export function Feature() {
  return (
    <section className="pt-20 pb-0 px-16 bg-white h-[85vh] lg:h-[70vh] overflow-hidden justify-between z-10">
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
              delay={4000}
              pauseOnHover={false}
            >
              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-primary/20">
                    <span className="text-3xl lg:text-4xl font-bold text-primary">
                      1
                    </span>
                  </div>
                  <h3 className="text-4xl lg:text-6xl font-bold text-primary mb-4 tracking-tight max-w-sm mx-auto">
                    <span className="block">Submit</span>
                    <span className="block">Manuscript</span>
                  </h3>
                  <p className="text-foreground/80 text-lg leading-relaxed lg:text-2xl lg:leading-tight">
                    Upload your research paper with metadata. Supports all major
                    academic formats.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-primary/20">
                    <span className="text-3xl lg:text-4xl font-bold text-primary">
                      2
                    </span>
                  </div>
                  <h3 className="text-4xl lg:text-6xl font-bold text-primary mb-4 tracking-tight max-w-sm mx-auto">
                    <span className="block">Peer</span>
                    <span className="block">Review</span>
                  </h3>
                  <p className="text-foreground/80 text-lg leading-relaxed lg:text-2xl lg:leading-tight">
                    Rigorous peer review by qualified experts ensuring quality
                    and credibility.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-primary/20">
                    <span className="text-3xl lg:text-4xl font-bold text-primary">
                      3
                    </span>
                  </div>
                  <h3 className="text-4xl lg:text-6xl font-bold text-primary mb-4 tracking-tight max-w-sm mx-auto">
                    <span className="block">Blockchain</span>
                    <span className="block">Publication</span>
                  </h3>
                  <p className="text-foreground/80 text-lg leading-relaxed lg:text-2xl lg:leading-tight">
                    Published on blockchain with immutable timestamps and
                    permanent accessibility.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-primary/20">
                    <span className="text-3xl lg:text-4xl font-bold text-primary">
                      4
                    </span>
                  </div>
                  <h3 className="text-4xl lg:text-6xl font-bold text-primary mb-4 tracking-tight max-w-sm mx-auto">
                    <span className="block">NFT</span>
                    <span className="block">Creation</span>
                  </h3>
                  <p className="text-foreground/80 text-lg leading-relaxed lg:text-2xl lg:leading-tight">
                    Your paper becomes a unique NFT with proof of ownership and
                    monetization opportunities.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-primary/20">
                    <span className="text-3xl lg:text-4xl font-bold text-primary">
                      5
                    </span>
                  </div>
                  <h3 className="text-4xl lg:text-6xl font-bold text-primary mb-4 tracking-tight max-w-sm mx-auto">
                    <span className="block">Track</span>
                    <span className="block">Impact</span>
                  </h3>
                  <p className="text-foreground/80 text-lg leading-relaxed lg:text-2xl lg:leading-tight">
                    Monitor citations and engagement metrics through real-time
                    blockchain analytics.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-primary/20">
                    <span className="text-3xl lg:text-4xl font-bold text-primary">
                      6
                    </span>
                  </div>
                  <h3 className="text-4xl lg:text-6xl font-bold text-primary mb-4 tracking-tight max-w-sm mx-auto">
                    <span className="block">Earn</span>
                    <span className="block">Revenue</span>
                  </h3>
                  <p className="text-foreground/80 text-lg leading-relaxed lg:text-2xl lg:leading-tight">
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
