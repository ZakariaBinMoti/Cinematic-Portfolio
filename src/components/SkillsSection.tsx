"use client";

import { motion } from "framer-motion";

export default function SkillsSection({ skills }: { skills: any[] }) {
  return (
    <section id="skills" className="bg-[#07080b] py-32 px-6 md:px-20 relative z-20">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
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
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Technical<br /><span className="text-gray-500">Arsenal.</span>
            </h2>
          </div>
        </motion.div>
        
        {/* Spatial Bento Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skillGroup: any, idx: number) => (
            <motion.div
              key={skillGroup._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-white/[0.02] border border-white/[0.08] p-8 rounded-2xl backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-[0_15px_35px_rgba(0,0,0,0.5)] group"
            >
              <h3 className="text-lg font-semibold text-white mb-5 tracking-tight group-hover:text-gray-200 transition-colors">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((item: string) => (
                  <span
                    key={item}
                    className="text-xs sm:text-sm bg-white/[0.04] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-gray-300 hover:border-white/20 hover:text-white transition-all duration-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
          {skills.length === 0 && <p className="text-gray-500 col-span-2">No skills config found.</p>}
        </div>
      </div>
    </section>
  );
}
