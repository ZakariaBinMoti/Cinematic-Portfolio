"use client";

import { motion } from "framer-motion";

export default function ContactSection({ contactData }: { contactData?: any }) {
  const headline = contactData?.headline || "Let's build something exceptional.";
  const description =
    contactData?.description ||
    "Whether you need a Shopify expert, custom frontend architecture, or a full-scale eCommerce solution.";
  const email = contactData?.email || "zakaria.binmoti@gmail.com";
  const linkedin = contactData?.linkedin || "https://www.linkedin.com/in/zakariabinmoti";
  const github = contactData?.github || "https://github.com/ZakariaBinMoti";
  const twitter = contactData?.twitter;
  const calendly = contactData?.calendly;

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
          {headline.includes("exceptional") ? (
            <>
              Let&apos;s build<br/>something <span className="text-gray-500">exceptional.</span>
            </>
          ) : (
            headline
          )}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto"
        >
          {description}
        </motion.p>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="flex flex-col md:flex-row items-center justify-center gap-6 flex-wrap"
        >
          {email && (
            <a href={`mailto:${email}`} className="w-full md:w-auto bg-white text-black px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform">
              {email}
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noreferrer" className="w-full md:w-auto border border-white/20 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              LinkedIn
            </a>
          )}
          {github && (
            <a href={github} target="_blank" rel="noreferrer" className="w-full md:w-auto border border-white/20 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              GitHub
            </a>
          )}
          {twitter && (
            <a href={twitter} target="_blank" rel="noreferrer" className="w-full md:w-auto border border-white/20 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              X / Twitter
            </a>
          )}
          {calendly && (
            <a href={calendly} target="_blank" rel="noreferrer" className="w-full md:w-auto border border-emerald-400/30 text-emerald-300 px-12 py-5 rounded-full font-bold text-lg hover:bg-emerald-500/10 transition-colors">
              Book Call
            </a>
          )}
        </motion.div>
      </div>
      
      <div className="mt-32 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Zakaria Bin Moti. All rights reserved.</p>
        <a href="/admin/login" className="hover:text-white transition-colors mt-2 inline-block">Admin Login</a>
      </div>
    </section>
  );
}
