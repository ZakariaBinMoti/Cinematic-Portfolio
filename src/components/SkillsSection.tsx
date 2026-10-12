"use client";

import { motion } from "framer-motion";

export default function SkillsSection({ skills }: { skills: any[] }) {
  return (
    <section id="skills" className="bg-[#080a10] py-32 px-6 md:px-20 relative z-20 overflow-hidden">
      {/* Exact Hero Sampled Ambient Horizon Glows */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 -right-72 w-96 h-96 bg-[#3594bd]/[0.04] rounded-full blur-[140px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/3 -left-72 w-96 h-96 bg-[#f6602d]/[0.04] rounded-full blur-[140px] pointer-events-none"
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
              02 // Technologies
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Technical<br /><span className="text-gray-500">Arsenal.</span>
            </h2>
            <p className="text-sm text-gray-400 font-light leading-relaxed hidden lg:block max-w-xs">
              Curated stack across Shopify Plus engineering, modern front-end architectures, and cloud infrastructures.
            </p>
          </div>
        </motion.div>
        
        {/* 3D Spatial Bento Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skillGroup: any, idx: number) => {
            const isShopify = skillGroup.category?.toLowerCase().includes("shopify");
            const isFrontend = skillGroup.category?.toLowerCase().includes("front");

            return (
              <motion.div
                key={skillGroup._id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="bg-[#0b0f1a]/50 border border-white/[0.08] p-7 md:p-8 rounded-3xl backdrop-blur-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-[0_15px_35px_rgba(0,0,0,0.5)] group relative overflow-hidden"
              >
                {/* Subtle top rim light */}
                <div 
                  aria-hidden="true" 
                  className={`absolute top-0 inset-x-8 h-[1px] opacity-40 group-hover:opacity-100 transition-opacity ${
                    isShopify 
                      ? "bg-gradient-to-r from-transparent via-[#f6602d]/80 to-transparent" 
                      : isFrontend
                      ? "bg-gradient-to-r from-transparent via-[#3594bd]/80 to-transparent"
                      : "bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  }`} 
                />

                <div className="flex items-center gap-2.5 mb-5">
                  <span 
                    className={`w-2 h-2 rounded-full ${
                      isShopify 
                        ? "bg-[#f6602d] shadow-[0_0_8px_rgba(246,96,45,0.8)]" 
                        : isFrontend
                        ? "bg-[#3594bd] shadow-[0_0_8px_rgba(53,148,189,0.8)]"
                        : "bg-white/40"
                    }`} 
                  />
                  <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight group-hover:text-gray-100 transition-colors">
                    {skillGroup.category}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((item: string) => (
                    <span
                      key={item}
                      className="text-xs sm:text-sm bg-white/[0.035] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-gray-300 hover:border-[#3594bd]/35 hover:bg-[#3594bd]/10 hover:text-white hover:shadow-[0_0_12px_rgba(53,148,189,0.15)] transition-all duration-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
          {skills.length === 0 && <p className="text-gray-500 col-span-2">No skills config found.</p>}
        </div>
      </div>
    </section>
  );
}
