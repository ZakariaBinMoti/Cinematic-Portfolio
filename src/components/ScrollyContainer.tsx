"use client";

import { useRef, useEffect } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import ScrollyCanvas from "./ScrollyCanvas";
import Overlay from "./Overlay";

export default function ScrollyContainer({ heroData }: { heroData: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="relative w-full h-[500vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden z-30">
        <ScrollyCanvas scrollYProgress={scrollYProgress} />
        <Overlay scrollYProgress={scrollYProgress} heroData={heroData} />
      </div>
    </div>
  );
}
