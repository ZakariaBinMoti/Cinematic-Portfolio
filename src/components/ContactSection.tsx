"use client";

import { motion } from "framer-motion";

export default function ContactSection() {
  return (
    <section id="contact" className="bg-[#121212] py-32 px-8 md:px-24 border-t border-white/5 relative z-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8"
        >
          Let&apos;s build<br/>something <span className="text-gray-500">exceptional.</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto"
        >
          Whether you need a Shopify expert, custom frontend architecture, or a full-scale eCommerce solution.
        </motion.p>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <a href="mailto:zakaria.binmoti@gmail.com" className="w-full md:w-auto bg-white text-black px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform">
            zakaria.binmoti@gmail.com
          </a>
          <a href="https://www.linkedin.com/in/zakariabinmoti" target="_blank" rel="noreferrer" className="w-full md:w-auto border border-white/20 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
            LinkedIn
          </a>
          <a href="https://github.com/ZakariaBinMoti" target="_blank" rel="noreferrer" className="w-full md:w-auto border border-white/20 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
            GitHub
          </a>
        </motion.div>
      </div>
      
      <div className="mt-32 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Zakaria Bin Moti. All rights reserved.</p>
        <a href="/admin/login" className="hover:text-white transition-colors mt-2 inline-block">Admin Login</a>
      </div>
    </section>
  );
}
