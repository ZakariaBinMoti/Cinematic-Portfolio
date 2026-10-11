"use client";

import { useRef } from "react";
import { MotionValue, useMotionValueEvent } from "framer-motion";

interface OverlayProps {
  scrollYProgress: MotionValue<number>;
  heroData: any;
}

// Linear interpolation helper
function lerp(inputRange: number[], outputRange: number[], value: number): number {
  if (value <= inputRange[0]) return outputRange[0];
  if (value >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];
  
  for (let i = 0; i < inputRange.length - 1; i++) {
    if (value >= inputRange[i] && value <= inputRange[i + 1]) {
      const t = (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
      return outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
    }
  }
  return outputRange[outputRange.length - 1];
}

export default function Overlay({ scrollYProgress, heroData }: OverlayProps) {
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  const hHeadline = heroData?.headline || "Zakaria Bin Moti";
  const hSub = heroData?.subheadline || "Software Engineer crafting premium eCommerce experiences";
  const hSupport = heroData?.supporting || "250+ business websites delivered globally.";

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // Section 1: Hero (0% → 30%)
    const o1 = lerp([0, 0.18, 0.30], [1, 1, 0], progress);
    const y1 = lerp([0, 0.30], [0, -80], progress);
    
    // Section 2: (26% → 58%)
    const o2 = lerp([0.26, 0.34, 0.50, 0.58], [0, 1, 1, 0], progress);
    const y2 = lerp([0.26, 0.58], [50, -50], progress);
    
    // Section 3: (54% → 86%)
    const o3 = lerp([0.54, 0.62, 0.78, 0.86], [0, 1, 1, 0], progress);
    const y3 = lerp([0.54, 0.86], [50, -50], progress);

    if (section1Ref.current) {
      section1Ref.current.style.opacity = String(o1);
      section1Ref.current.style.transform = `translateY(${y1}px)`;
    }
    if (section2Ref.current) {
      section2Ref.current.style.opacity = String(o2);
      section2Ref.current.style.transform = `translateY(${y2}px)`;
    }
    if (section3Ref.current) {
      section3Ref.current.style.opacity = String(o3);
      section3Ref.current.style.transform = `translateY(${y3}px)`;
    }
  });

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Section 1: Main Hero */}
      <div
        ref={section1Ref}
        className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-8 pointer-events-auto will-change-transform"
      >
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-4 drop-shadow-2xl">
          {hHeadline}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mb-3 font-light leading-relaxed">
          {hSub}
        </p>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl mb-10 font-normal">
          {hSupport}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-full font-medium text-sm hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg"
          >
            <span>View Projects</span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.04] backdrop-blur-md text-white px-7 py-3.5 rounded-full font-medium text-sm hover:bg-white/10 transition-colors"
          >
            <span>Contact Me</span>
          </a>
        </div>
      </div>

      {/* Section 2: Architecture Statement */}
      <div
        ref={section2Ref}
        style={{ opacity: 0 }}
        className="absolute inset-0 flex items-center justify-start p-8 md:p-32 will-change-transform"
      >
        <h2 className="text-4xl md:text-7xl font-bold tracking-tight max-w-3xl text-white drop-shadow-2xl leading-tight">
          I build <span className="text-gray-400">scalable architectures.</span>
        </h2>
      </div>

      {/* Section 3: Design & Engineering */}
      <div
        ref={section3Ref}
        style={{ opacity: 0 }}
        className="absolute inset-0 flex items-center justify-end p-8 md:p-32 text-right will-change-transform"
      >
        <h2 className="text-4xl md:text-7xl font-bold tracking-tight max-w-3xl text-white drop-shadow-2xl leading-tight">
          Bridging <span className="text-gray-400">design</span> and <span className="text-gray-400">engineering.</span>
        </h2>
      </div>
    </div>
  );
}
