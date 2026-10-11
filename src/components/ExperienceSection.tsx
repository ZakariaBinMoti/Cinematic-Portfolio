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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="experience" className="bg-[#07080b] py-32 px-6 md:px-20 relative z-20">
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
              03 // Career Journey
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Experience<br /><span className="text-gray-500">Timeline.</span>
            </h2>
          </div>
        </motion.div>
        
        {/* Spatial Timeline Container */}
        <motion.div 
          className="lg:col-span-8 flex flex-col gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {experiences.map((exp: any) => (
            <motion.div
              key={exp._id}
              variants={itemVariants}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-[0_15px_35px_rgba(0,0,0,0.5)] group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-1">
                <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-gray-200 transition-colors">
                  {exp.title}
                </h3>
                <span className="text-xs font-mono tracking-wider uppercase text-gray-400 bg-white/[0.04] px-3 py-1 rounded-full border border-white/5 self-start sm:self-auto">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <h4 className="text-base text-gray-300 font-medium mb-4">
                {exp.company} <span className="text-gray-500 text-sm font-normal ml-2">/ {exp.location}</span>
              </h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                {exp.description}
              </p>
            </motion.div>
          ))}
          {experiences.length === 0 && <p className="text-gray-500">No experience records found.</p>}
        </motion.div>
      </div>
    </section>
  );
}
