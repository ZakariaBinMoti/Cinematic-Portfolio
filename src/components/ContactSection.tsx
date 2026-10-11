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
    <section id="contact" className="bg-[#07080b] py-36 px-6 md:px-20 relative z-20 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
            06 // Get in Touch
          </span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          {headline.includes("exceptional") ? (
            <>
              Let&apos;s build<br />something <span className="text-gray-500">exceptional.</span>
            </>
          ) : (
            headline
          )}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-base sm:text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
        >
          {description}
        </motion.p>
        
        {/* Spatial Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5"
        >
          {email && (
            <a
              href={`mailto:${email}`}
              className="bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
            >
              {email}
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              className="border border-white/10 bg-white/[0.03] text-gray-300 hover:text-white hover:bg-white/[0.08] px-6 py-3.5 rounded-full font-medium text-sm transition-all"
            >
              LinkedIn
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              className="border border-white/10 bg-white/[0.03] text-gray-300 hover:text-white hover:bg-white/[0.08] px-6 py-3.5 rounded-full font-medium text-sm transition-all"
            >
              GitHub
            </a>
          )}
          {twitter && (
            <a
              href={twitter}
              target="_blank"
              rel="noreferrer"
              className="border border-white/10 bg-white/[0.03] text-gray-300 hover:text-white hover:bg-white/[0.08] px-6 py-3.5 rounded-full font-medium text-sm transition-all"
            >
              X / Twitter
            </a>
          )}
          {calendly && (
            <a
              href={calendly}
              target="_blank"
              rel="noreferrer"
              className="border border-emerald-400/20 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 px-6 py-3.5 rounded-full font-medium text-sm transition-all"
            >
              Book Call
            </a>
          )}
        </motion.div>
      </div>
      
      <div className="mt-28 text-center text-gray-600 text-xs">
        <p>© {new Date().getFullYear()} Zakaria Bin Moti. All rights reserved.</p>
        <a href="/admin/login" className="hover:text-gray-400 transition-colors mt-2 inline-block">
          Admin Studio
        </a>
      </div>
    </section>
  );
}
