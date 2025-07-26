import FlowingMenu from "@/components/ui/flowing-menu";
import { Separator } from "@/components/ui/separator";

const demoItems = [
  {
    text: "1. Submit Your Manuscript",
    description:
      "Upload your manuscript and CV to begin the publishing process.",
  },
  {
    text: "2. Peer Review Process",
    description:
      "Your work will be reviewed by qualified community members for quality and relevance.",
  },
  {
    text: "3. Publish to Fronsciers",
    description:
      "Once approved, your manuscript is published to the decentralized archive.",
  },
  {
    text: "4. Earn FRONS Tokens",
    description:
      "Receive token rewards for successful submissions and peer reviews.",
  },
];

export function Feature() {
  return (
    <div className="bg-white pt-20 max-w-full">
      <div className="flex-col items-center justify-center max-w-full">
        <Separator className="mb-16" />
        <div className="text-center justify-center items-center">
          <h2 className="font-spectral tracking-tight font-semibold text-primary word mb-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl">
            How Fronsciers Works
          </h2>
          <p className="text-base lg:text-2xl text-muted-foreground max-w-3xl mx-4 mb-8 lg:mb-0 mt-4 lg:mt-2 leading-tight text-center lg:mx-auto">
            Experience the future of academic publishing with our streamlined
            blockchain-powered platform
          </p>
        </div>
      </div>
      <div className="py-8">
        <div
          style={{ height: "600px", position: "relative" }}
          className="max-w-full"
        >
          <FlowingMenu items={demoItems} />
        </div>
      </div>
    </div>
  );
}
