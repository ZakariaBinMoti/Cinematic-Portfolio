"use client";

import { motion } from "framer-motion";

const metrics = [
  { value: "120+", label: "Websites Delivered" },
  { value: "20k+", label: "USD Revenue Contribution" },
  { value: "Global", label: "International Client Projects" },
  { value: "Lead", label: "Shopify Team Lead" },
];

export default function AchievementsSection() {
  return (
    <section className="bg-[#0a0a0a] py-24 px-8 md:px-24 relative z-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1, type: "spring", bounce: 0.4 }}
              className="flex flex-col items-center justify-center p-6 border border-white/5 rounded-3xl bg-white/[0.01]"
            >
              <span className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter drop-shadow-lg">
                {metric.value}
              </span>
              <span className="text-sm md:text-base text-gray-400 font-medium tracking-wide uppercase">
                {metric.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
