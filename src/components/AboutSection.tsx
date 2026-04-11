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
      transition: { staggerChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  return (
    <section className="min-h-screen flex items-center bg-[#121212] py-32 px-8 md:px-24 border-t border-white/5 relative z-20">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white sticky top-32">
            About<br/><span className="text-gray-500">Me.</span>
          </h2>
        </motion.div>
        
        <motion.div 
          className="lg:col-span-8 flex flex-col space-y-8 text-xl md:text-3xl text-gray-300 font-light leading-relaxed"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p variants={itemVariants}>{p1}</motion.p>
          <motion.p variants={itemVariants}>{p2}</motion.p>
          <motion.p variants={itemVariants} className="text-white font-medium">{p3}</motion.p>
          <motion.p variants={itemVariants}>{p4}</motion.p>
        </motion.div>
      </div>
    </section>
  );
}
