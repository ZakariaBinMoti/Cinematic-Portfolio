"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ProjectsSection({ projects }: { projects: any[] }) {
  return (
    <section id="projects" className="min-h-screen bg-[#07080b] py-32 px-6 md:px-20 relative z-20">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">
            04 // Selected Works
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Featured<span className="text-gray-500"> Projects.</span>
          </h2>
        </motion.div>
        
        <div className="flex flex-col gap-12 md:gap-16">
          {projects.map((project: any, index: number) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all duration-500 group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Media Column */}
                <div className={`col-span-1 lg:col-span-7 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06] shadow-inner">
                    {project.imageUrl ? (
                      <Image 
                        src={project.imageUrl} 
                        alt={project.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm italic">
                        Media preview unavailable
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Content Column */}
                <div className={`col-span-1 lg:col-span-5 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight group-hover:text-gray-100 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-6 font-light">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.techStack.map((tech: string) => (
                      <span
                        key={tech}
                        className="text-xs font-medium text-gray-300 bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {project.liveLink && (
                    <a 
                      href={project.liveLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center self-start text-white text-xs font-medium tracking-wide border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all group/btn"
                    >
                      <span>View Live Project</span>
                      <svg className="w-3.5 h-3.5 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {projects.length === 0 && (
            <p className="text-gray-500 text-center py-20 text-lg">Projects are currently being curated.</p>
          )}
        </div>
      </div>
    </section>
  );
}
