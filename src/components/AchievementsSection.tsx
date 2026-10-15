"use client";

import { motion } from "framer-motion";

export interface MetricItem {
  id?: string;
  value: string;
  label: string;
}

const defaultMetrics: MetricItem[] = [
  { value: "250+", label: "Websites Delivered" },
  { value: "$30k+", label: "USD Revenue Contribution" },
  { value: "6+", label: "Engineers Led as Team Lead" },
  { value: "Global", label: "International Client Projects" },
];

export default function AchievementsSection({ achievementsData }: { achievementsData?: any }) {
  const rawMetrics: MetricItem[] =
    achievementsData?.metrics && Array.isArray(achievementsData.metrics) && achievementsData.metrics.length > 0
      ? achievementsData.metrics
      : defaultMetrics;

  const metrics = rawMetrics.filter((m: any) => m.isVisible !== false);

  return (
    <section className="bg-[#080a10] py-20 px-6 md:px-20 relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((metric, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;

            return (
              <motion.div
                key={metric.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="relative flex flex-col items-center justify-center p-8 rounded-3xl bg-[#0b0f1a]/50 border border-white/[0.08] backdrop-blur-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-[0_15px_35px_rgba(0,0,0,0.5)] group overflow-hidden"
              >
                {/* Subtle soft ambient aura behind number */}
                <div 
                  aria-hidden="true" 
                  className={`absolute -top-12 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${
                    isFirst ? "bg-[#f6602d]" : isSecond ? "bg-[#3594bd]" : "bg-white/20"
                  }`} 
                />

                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight group-hover:scale-105 transition-transform duration-300 relative z-10">
                  {metric.value}
                </span>
                <span className="text-xs sm:text-sm text-gray-400 font-medium tracking-wider uppercase text-center relative z-10">
                  {metric.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
