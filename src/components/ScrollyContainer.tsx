"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
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
      <div className="sticky top-0 h-screen w-full overflow-hidden z-30 bg-[#07080b]">
        {/* Subtle, soft 3D Spatial Horizon ambient edge glow */}
        <div 
          aria-hidden="true" 
          className="absolute top-1/2 -left-64 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[180px] pointer-events-none z-10" 
        />
        <div 
          aria-hidden="true" 
          className="absolute top-1/2 -right-64 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[180px] pointer-events-none z-10" 
        />

        {/* Soft edge fade for seamless viewport blending */}
        <div 
          aria-hidden="true" 
          className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#07080b] via-[#07080b]/70 to-transparent pointer-events-none z-20" 
        />

        <ScrollyCanvas scrollYProgress={scrollYProgress} />
        <Overlay scrollYProgress={scrollYProgress} heroData={heroData} />
      </div>
    </div>
  );
}
