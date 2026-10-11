"use client";

import { motion } from "framer-motion";

export interface MetricItem {
  id?: string;
  value: string;
  label: string;
}

const defaultMetrics: MetricItem[] = [
  { value: "120+", label: "Websites Delivered" },
  { value: "20k+", label: "USD Revenue Contribution" },
  { value: "Global", label: "International Client Projects" },
  { value: "Lead", label: "Shopify Team Lead" },
];

export default function AchievementsSection({ achievementsData }: { achievementsData?: any }) {
  const metrics: MetricItem[] =
    achievementsData?.metrics && Array.isArray(achievementsData.metrics) && achievementsData.metrics.length > 0
      ? achievementsData.metrics
      : defaultMetrics;

  return (
    <section className="bg-[#07080b] py-20 px-6 md:px-20 relative z-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.4)] group"
            >
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight group-hover:scale-105 transition-transform duration-300">
                {metric.value}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 font-medium tracking-wide uppercase text-center">
                {metric.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
