"use client";

import { motion } from "framer-motion";

export default function SkillsSection({ skills }: { skills: any[] }) {
  return (
    <section className="bg-[#121212] py-32 px-8 md:px-24">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white sticky top-32">
            Technical<br/><span className="text-gray-500">Arsenal.</span>
          </h2>
        </motion.div>
        
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skillGroup: any, idx: number) => (
            <motion.div
              key={skillGroup._id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.04] transition-colors group"
            >
              <h3 className="text-xl font-bold text-white mb-6 tracking-wide group-hover:text-blue-400 transition-colors">{skillGroup.category}</h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((item: string) => (
                  <span key={item} className="text-sm bg-white/5 border border-white/5 px-4 py-2 rounded-full text-gray-300 group-hover:border-white/20 transition-all duration-300">
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
