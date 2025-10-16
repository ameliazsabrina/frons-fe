import ScrollVelocity from "@/components/ui/ScrollVelocity";

export function Ctanew() {
  return (
    <section className="w-full h-fit flex items-center justify-center  ">
      <div className="py-16">
        <ScrollVelocity
          texts={["Ready to Publish the Future?"]}
          velocity={50}
          className="custom-scroll-text   "
        />
      </div>
    </section>
  );
}
