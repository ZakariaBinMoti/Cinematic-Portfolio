"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ProjectsSection({ projects }: { projects: any[] }) {
  return (
    <section id="projects" className="min-h-screen bg-[#121212] py-32 px-8 md:px-24">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-24 text-white tracking-tighter"
        >
          Selected<span className="text-gray-500"> Work.</span>
        </motion.h2>
        
        <div className="flex flex-col gap-32">
          {projects.map((project: any, index: number) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{ duration: 0.8 }}
              className={`relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center group`}
            >
              <div className={`col-span-1 lg:col-span-7 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white/[0.02] border border-white/5">
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-overlay" />
                  {project.imageUrl ? (
                    <Image 
                      src={project.imageUrl} 
                      alt={project.title} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 italic">No Image Provided</div>
                  )}
                </div>
              </div>
              
              <div className={`col-span-1 lg:col-span-5 flex flex-col ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-xl text-gray-400 leading-relaxed mb-8">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-3 mb-10">
                  {project.techStack.map((tech: string) => (
                    <span key={tech} className="text-sm font-medium text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                      {tech}
                    </span>
                  ))}
                </div>

                {project.liveLink && (
                  <a 
                    href={project.liveLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center self-start text-white font-semibold group/link border border-white/20 px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all"
                  >
                    View Live Project
                    <svg className="w-5 h-5 ml-3 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
          {projects.length === 0 && (
              <p className="text-gray-500 text-center py-24 text-2xl">Projects are currently being curated.</p>
          )}
        </div>
      </div>
    </section>
  );
}
