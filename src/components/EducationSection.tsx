"use client";

import { motion } from "framer-motion";

const education = [
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

export default function EducationSection() {
  return (
    <section className="bg-[#121212] py-24 px-8 md:px-24 border-t border-white/5 relative z-20">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12">
        <motion.div 
          className="md:col-span-4"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
            Academic<br/><span className="text-gray-500">Background.</span>
          </h2>
        </motion.div>
        
        <div className="md:col-span-8 flex flex-col gap-8">
          {education.map((edu, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, delay: idx * 0.15 }}
               className="border-l-2 border-white/10 pl-6"
             >
               <h3 className="text-2xl font-bold text-white mb-2">{edu.degree}</h3>
               <p className="text-xl text-gray-400 mb-1">{edu.school}</p>
               <div className="flex gap-4 text-sm text-gray-500 font-medium tracking-wide">
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
