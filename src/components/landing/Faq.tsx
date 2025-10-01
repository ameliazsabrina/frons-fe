"use client";
import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Separator } from "@/components/ui/separator";
gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Fronsciers and how does it work?",
    answer:
      "Fronsciers is a decentralized academic publishing platform that combines blockchain technology with traditional peer review. We mint accepted manuscripts as NFTs on Solana blockchain while providing fair compensation to reviewers and affordable publishing for authors.",
  },
  {
    question: "How much does it cost to publish on Fronsciers?",
    answer:
      "We offer simple, transparent pricing: Student Plan at IDR 50k per manuscript, Researcher Plan at IDR 150k per manuscript, and Custom pricing for institutions. This is significantly cheaper than traditional journals that charge $3,000+ in APCs.",
  },
  {
    question: "How does the peer review process work?",
    answer:
      "Every manuscript is reviewed by 3 qualified experts in your field. Reviewers are compensated with FRONS tokens for their valuable feedback. The process typically takes 2-6 weeks compared to 6-18 months in traditional journals.",
  },
  {
    question: "Are published papers academically credible?",
    answer:
      "Absolutely. Our rigorous peer review maintains high academic standards. Published papers receive DOI-equivalent identifiers, are permanently archived on blockchain, and can be cited normally. Many institutions already recognize blockchain publications.",
  },
  {
    question: "What happens to my manuscript if it gets rejected?",
    answer:
      "If your manuscript is rejected, you receive a $45 refund (we keep $5 to cover review costs). You'll also receive valuable feedback from reviewers that you can use to improve your work before resubmitting elsewhere.",
  },
  {
    question: "How secure is the storage of my research?",
    answer:
      "Your research is stored on decentralized IPFS/Walrus networks and recorded on Solana blockchain. This means it exists independently forever, even if our platform disappears. The blockchain record proves ownership and prevents tampering.",
  },
];

export function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const leftSection = leftSectionRef.current;
    const rightSection = rightSectionRef.current;
    const items = itemsRef.current;

    if (!section || !leftSection || !rightSection) return;

    gsap.fromTo(
      leftSection,
      {
        x: -100,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    gsap.fromTo(
      rightSection,
      {
        x: 100,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        delay: 0.2,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    items.forEach((item, index) => {
      if (item) {
        gsap.fromTo(
          item,
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: 0.5 + index * 0.1,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (
          trigger.trigger &&
          (trigger.trigger === section ||
            trigger.trigger === leftSection ||
            trigger.trigger === rightSection ||
            items.includes(trigger.trigger as HTMLDivElement))
        ) {
          trigger.kill();
        }
      });
    };
  }, []);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div ref={sectionRef} className="pb-16  bg-white">
      <div className="container max-w-7xl mx-auto px-6 lg:px-8">
        <Separator className="w-full mb-16" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div ref={leftSectionRef} className="lg:sticky lg:top-24">
            <h2 className="text-2xl md:text-5xl font-semibold text-primary mb-6 ">
              Got Questions?
              <br />
              We&apos;ve Got Answers.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Find answers to common questions about Fronsciers and how our
              decentralized academic publishing platform revolutionizes research
              publication with blockchain technology.
            </p>
          </div>

          <div ref={rightSectionRef} className="space-y-3">
            {faqData.map((faq, index) => (
              <div
                key={index}
                ref={(el) => {
                  itemsRef.current[index] = el;
                }}
                className="group"
              >
                <div className="border-b border-border/50 last:border-b-0">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full py-6 text-left flex items-center justify-between gap-4 transition-colors duration-200"
                  >
                    <h3 className="text-lg lg:text-xl font-medium text-primary ">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {activeIndex === index ? (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <div className="w-4 h-0.5 bg-primary"></div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 flex items-center justify-center relative">
                          <div className="w-4 h-0.5 bg-primary"></div>
                          <div className="w-0.5 h-4 bg-primary absolute"></div>
                        </div>
                      )}
                    </div>
                  </button>

                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-out
                      ${
                        activeIndex === index
                          ? "max-h-96 opacity-100 pb-6"
                          : "max-h-0 opacity-0"
                      }
                    `}
                  >
                    <p className="text-muted-foreground  pr-8">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
