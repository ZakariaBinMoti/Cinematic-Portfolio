"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ProjectsSection({ projects }: { projects: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = projects.length;

  const nextSlide = () => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  if (total === 0) {
    return (
      <section id="projects" className="bg-[#080a10] py-32 px-6 md:px-20 relative z-20">
        <div className="max-w-7xl mx-auto text-center py-20 text-gray-500">
          Projects are currently being curated.
        </div>
      </section>
    );
  }

  const activeProject = projects[activeIndex];

  return (
    <section id="projects" className="min-h-screen bg-[#080a10] py-32 px-4 sm:px-8 md:px-16 relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">
              04 // Widescreen Showcase
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Featured<span className="text-gray-500"> Projects.</span>
            </h2>
          </div>

          {/* Filmstrip Navigation & Counter */}
          <div className="flex items-center gap-4 self-start md:self-auto">
            <span className="text-sm font-mono text-gray-400">
              <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="text-gray-600"> / </span>
              {String(total).padStart(2, "0")}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                aria-label="Previous project"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                aria-label="Next project"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Widescreen Filmstrip Reel Container */}
        <div ref={containerRef} className="relative w-full">
          <motion.div
            key={activeProject._id || activeIndex}
            className="w-full rounded-3xl bg-white/[0.025] border border-white/[0.09] backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.7)] mb-8 transition-all relative overflow-hidden"
          >
            {/* 3D Spatial Dual Rim Top Highlight */}
            <div 
              aria-hidden="true" 
              className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#3594bd]/60 via-white/20 to-[#f6602d]/60 opacity-80" 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Widescreen Media Display */}
              <div className="col-span-1 lg:col-span-7">
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-black/50 border border-white/[0.08] shadow-2xl group">
                  {activeProject.imageUrl ? (
                    <Image
                      src={activeProject.imageUrl}
                      alt={activeProject.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm italic">
                      Media preview unavailable
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Project Details */}
              <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-4">
                  {activeProject.techStack?.map((tech: string) => (
                    <span
                      key={tech}
                      className="text-xs font-medium text-gray-300 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                  {activeProject.title}
                </h3>

                <p className="text-base text-gray-300 leading-relaxed mb-8 font-light">
                  {activeProject.description}
                </p>

                <div className="flex items-center gap-4">
                  {activeProject.liveLink && (
                    <a
                      href={activeProject.liveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-full font-medium text-sm hover:bg-gray-100 transition-all shadow-lg hover:scale-105 group"
                    >
                      <span>View Live Project</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filmstrip Bottom Card Peeks / Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8 relative z-20">
            {projects.map((proj, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={proj._id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`text-left p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    isSelected
                      ? "bg-white/[0.08] border-white/30 shadow-[0_10px_25px_rgba(0,0,0,0.5)] -translate-y-1 text-white"
                      : "bg-white/[0.02] border-white/[0.06] opacity-70 hover:opacity-100 hover:border-white/15 text-gray-400"
                  }`}
                >
                  {isSelected && (
                    <div 
                      aria-hidden="true" 
                      className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-[#3594bd] via-white to-[#f6602d]" 
                    />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-gray-400">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#3594bd] shadow-[0_0_8px_rgba(53,148,189,0.9)]" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate mb-1">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">
                    {proj.techStack?.[0] || "eCommerce"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
