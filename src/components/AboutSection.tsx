"use client";

import { motion } from "framer-motion";

export default function AboutSection({ aboutData }: { aboutData: any }) {
  const p1 = aboutData?.p1 || "I am a software engineer specializing in Shopify development, modern frontend systems, and high-converting eCommerce experiences.";
  const p2 = aboutData?.p2 || "My journey began through frontend engineering and evolved into delivering production-ready digital systems for international businesses.";
  const p3 = aboutData?.p3 || "I combine engineering precision with visual execution to build stores and websites that are fast, scalable, conversion-driven, and business-focused.";
  const p4 = aboutData?.p4 || "Currently leading Shopify development projects while solving advanced frontend problems for global clients.";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="about" className="min-h-screen flex items-center bg-[#07080b] py-32 px-6 md:px-20 relative z-20">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Sticky Section Heading */}
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="lg:sticky lg:top-32">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">
              01 // Background
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              About<br /><span className="text-gray-500">Me.</span>
            </h2>
          </div>
        </motion.div>
        
        {/* Spatial Glass Card Container */}
        <motion.div 
          className="lg:col-span-8 p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col space-y-6 text-lg md:text-2xl text-gray-300 font-light leading-relaxed"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p variants={itemVariants}>{p1}</motion.p>
          <motion.p variants={itemVariants}>{p2}</motion.p>
          <motion.p variants={itemVariants} className="text-white font-normal border-l-2 border-white/20 pl-6 py-1 my-2">
            {p3}
          </motion.p>
          <motion.p variants={itemVariants} className="text-gray-400">{p4}</motion.p>
        </motion.div>
      </div>
    </section>
  );
}
