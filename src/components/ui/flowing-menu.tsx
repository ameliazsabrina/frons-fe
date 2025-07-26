import React from "react";
import { gsap } from "gsap";

interface MenuItemProps {
  text: string;
  description: string;
}

interface FlowingMenuProps {
  items?: MenuItemProps[];
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({ items = [] }) => {
  return (
    <>
      <style jsx>{`
        .menu-wrap {
          position: relative;
          overflow: hidden;
        }

        .menu {
          display: flex;
          flex-direction: column;
        }

        .menu__item {
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid #e5e5e5;
        }

        .menu__item-link {
          display: block;
          padding: 2rem;
          text-decoration: none;
          color: var(--primary);
          font-size: 1.5rem;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .menu__item-link:hover {
          color: var(--primary);
        }

        .marquee {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          background: rgba(0, 123, 255, 0.1);
        }

        .marquee__inner-wrap {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .marquee__inner {
          display: flex;
          align-items: center;
          white-space: nowrap;
          animation: marqueeFlow 30s linear infinite;
          gap: 2rem;
        }

        .marquee__text {
          font-size: 1rem;
          font-weight: 500;
          color: #060010;
        }

        .marquee__separator {
          color: #007bff;
          font-size: 1.2rem;
        }

        @keyframes marqueeFlow {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
      <div className="menu-wrap">
        <nav className="menu">
          {items.map((item, idx) => (
            <MenuItem key={idx} {...item} />
          ))}
        </nav>
      </div>
    </>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ text, description }) => {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);

  const animationDefaults: gsap.TweenVars = { duration: 0.6, ease: "expo" };

  const distMetric = (x: number, y: number, x2: number, y2: number): number => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ): "top" | "bottom" => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });

    tl.set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    const tl = gsap.timeline({ defaults: animationDefaults });

    tl.to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0).to(
      marqueeInnerRef.current,
      { y: edge === "top" ? "101%" : "-101%" },
      0
    );
  };

  const repeatedMarqueeContent = React.useMemo(() => {
    return Array.from({ length: 8 }).map((_, idx) => (
      <React.Fragment key={idx}>
        <span className="marquee__text">{description}</span>
        <span className="marquee__separator">•</span>
      </React.Fragment>
    ));
  }, [description]);

  return (
    <div className="menu__item" ref={itemRef}>
      <a
        className="menu__item-link"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </a>
      <div className="marquee" ref={marqueeRef}>
        <div className="marquee__inner-wrap" ref={marqueeInnerRef}>
          <div className="marquee__inner" aria-hidden="true">
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowingMenu;
