"use client";

import { motion } from "framer-motion";

export default function ExperienceSection({ experiences }: { experiences: any[] }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="experience" className="bg-[#07080b] py-32 px-6 md:px-20 relative z-20 overflow-hidden">
      {/* Subtle Spatial Horizon Glows */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 -left-72 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-[140px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 -right-72 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-[140px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative z-10">
        {/* Sticky Heading */}
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="lg:sticky lg:top-32">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">
              03 // Career Journey
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Experience<br /><span className="text-gray-500">Timeline.</span>
            </h2>
            <p className="text-sm text-gray-400 font-light leading-relaxed hidden lg:block max-w-xs">
              2+ years shipping 250+ production storefronts, architecting Shopify systems, and leading engineering teams.
            </p>
          </div>
        </motion.div>
        
        {/* 3D Spatial Timeline with Luminous Conduits & Nodes */}
        <motion.div 
          className="lg:col-span-8 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Luminous Light Conduit Track */}
          <div 
            aria-hidden="true"
            className="absolute left-3.5 sm:left-4 top-8 bottom-8 w-[2px] -translate-x-1/2 bg-gradient-to-b from-amber-400/80 via-cyan-400/60 to-white/10 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          />

          <div className="flex flex-col gap-8">
            {experiences.map((exp: any, idx: number) => {
              const isCurrent = exp.endDate?.toLowerCase().includes("present");

              return (
                <motion.div
                  key={exp._id || idx}
                  variants={itemVariants}
                  className="relative pl-10 sm:pl-12 group"
                >
                  {/* Luminous Spatial Timeline Node */}
                  <div 
                    aria-hidden="true"
                    className={`absolute left-3.5 sm:left-4 top-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full border transition-transform duration-300 group-hover:scale-125 z-10 ${
                      isCurrent
                        ? "bg-amber-500/20 border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                        : "bg-cyan-500/20 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    }`}
                  >
                    <div 
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCurrent ? "bg-amber-400 animate-pulse" : "bg-cyan-400"
                      }`}
                    />
                  </div>

                  {/* Floating Spatial Frosted Glass Card */}
                  <div className="p-7 sm:p-8 rounded-3xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                      <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-gray-100 transition-colors">
                        {exp.title}
                      </h3>
                      <span className={`text-xs font-mono tracking-wider uppercase px-3.5 py-1.5 rounded-full border self-start sm:self-auto ${
                        isCurrent
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                          : "bg-white/[0.04] text-gray-300 border-white/10"
                      }`}>
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-300 font-medium">
                      <span className="text-white">{exp.company}</span>
                      {exp.location && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-400 text-xs font-normal">{exp.location}</span>
                        </>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light">
                      {exp.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {experiences.length === 0 && (
            <p className="text-gray-500">No experience records found.</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
