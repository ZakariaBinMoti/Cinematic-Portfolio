"use client";

import { motion } from "framer-motion";

export interface EducationItem {
  id?: string;
  degree: string;
  school: string;
  score: string;
  years: string;
}

const defaultEducation: EducationItem[] = [
  {
    degree: "B.Sc. in Computer Science and Engineering",
    school: "East West University",
    score: "CGPA: 3.22 / 4.00",
    years: "2020 - 2024",
  },
  {
    degree: "HSC",
    school: "Govt. Azizul Haque College",
    score: "GPA 5.00",
    years: "Pre-2020",
  },
  {
    degree: "SSC",
    school: "R.D.A Laboratory School and College",
    score: "GPA 5.00",
    years: "Pre-2018",
  }
];

export default function EducationSection({ educationData }: { educationData?: any }) {
  const education: EducationItem[] =
    educationData?.items && Array.isArray(educationData.items) && educationData.items.length > 0
      ? educationData.items
      : defaultEducation;

  const title = educationData?.title || "Academic";
  const subtitle = educationData?.subtitle || "Background.";

  return (
    <section className="bg-[#080a10] py-32 px-6 md:px-20 relative z-20">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Sticky Heading */}
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="lg:sticky lg:top-32">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">
              05 // Education
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              {title}<br /><span className="text-gray-500">{subtitle}</span>
            </h2>
          </div>
        </motion.div>
        
        {/* Spatial Cards Container */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {education.map((edu, idx) => (
            <motion.div
              key={edu.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="p-8 rounded-3xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-[0_15px_35px_rgba(0,0,0,0.5)] group relative overflow-hidden"
            >
              <div 
                aria-hidden="true" 
                className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-[#3594bd]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" 
              />
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-gray-100 transition-colors">
                {edu.degree}
              </h3>
              <p className="text-base text-gray-300 mb-3 font-normal">{edu.school}</p>
              <div className="flex gap-4 text-xs font-mono text-gray-400">
                <span>{edu.score}</span>
                <span>•</span>
                <span>{edu.years}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
