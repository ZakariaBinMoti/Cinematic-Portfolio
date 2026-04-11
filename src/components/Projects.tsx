"use client";

import { motion } from "framer-motion";

const projects = [
  {
    id: 1,
    title: "Project Alpha",
    category: "E-Commerce",
    description: "A high-conversion digital storefront built with Next.js and Shopify.",
    color: "from-blue-500/10 to-purple-500/10"
  },
  {
    id: 2,
    title: "Project Beta",
    category: "Web3",
    description: "Interactive dashboard for decentralized finance operations.",
    color: "from-emerald-500/10 to-teal-500/10"
  },
  {
    id: 3,
    title: "Project Gamma",
    category: "Portfolio",
    description: "Award-winning creative portfolio utilizing WebGL and Canvas.",
    color: "from-orange-500/10 to-red-500/10"
  }
];

export default function Projects() {
  return (
    <section className="min-h-screen bg-[#121212] py-24 px-8 md:px-24">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-3xl md:text-5xl font-bold mb-16 text-white tracking-tighter">
          Selected<span className="text-gray-500"> Work.</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 hover:bg-white/[0.04] transition-colors group cursor-pointer`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <span className="text-sm font-medium text-gray-400 mb-4 tracking-widest uppercase">
                  {project.category}
                </span>
                <h4 className="text-2xl font-semibold text-white mb-4">
                  {project.title}
                </h4>
                <p className="text-gray-400 flex-grow">
                  {project.description}
                </p>
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                  View Case Study
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
