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
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6 }
    }
  };

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
            Experience<br/><span className="text-gray-500">Timeline.</span>
          </h2>
        </motion.div>
        
        <motion.div 
          className="lg:col-span-8 relative border-left border-l border-white/10 pl-8 md:pl-12 py-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {experiences.map((exp: any, index: number) => (
            <motion.div key={exp._id} variants={itemVariants} className="relative mb-16 last:mb-0 group">
              <div className="absolute -left-[41px] md:-left-[57px] top-1 w-4 h-4 rounded-full border-2 border-[#121212] bg-gray-500 group-hover:bg-white transition-colors duration-300" />
              
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">{exp.title}</h3>
                <span className="text-gray-400 font-mono text-sm tracking-widest uppercase mt-2 md:mt-0">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <h4 className="text-xl text-gray-300 mb-4 font-medium">{exp.company} <span className="text-gray-500 font-light text-sm ml-2">{exp.location}</span></h4>
              <p className="text-gray-400 leading-relaxed text-lg">
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
