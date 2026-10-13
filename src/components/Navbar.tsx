"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ["contact", "projects", "experience", "skills", "about"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(section);
            return;
          }
        }
      }
      setActiveSection("hero");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "hero", label: "Overview", href: "#" },
    { id: "about", label: "About", href: "#about" },
    { id: "skills", label: "Stack", href: "#skills" },
    { id: "experience", label: "Experience", href: "#experience" },
    { id: "projects", label: "Projects", href: "#projects" },
    { id: "contact", label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav
          className={`pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-300 ${
            scrolled
              ? "bg-[#080a10]/85 backdrop-blur-2xl border border-white/[0.12] shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
              : "bg-[#080a10]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          }`}
        >
          {/* Brand Avatar */}
          <a
            href="#"
            className="relative flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-white/40 transition-all ml-1 hover:scale-105 shadow-[0_0_12px_rgba(53,148,189,0.3)] shrink-0"
            aria-label="Home"
          >
            <Image
              src="/favicon.png"
              alt="Zakaria Bin Moti"
              width={32}
              height={32}
              priority
              className="w-full h-full object-cover rounded-full"
            />
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1 px-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.12] text-white shadow-[0_0_15px_rgba(255,255,255,0.08)] border border-white/15"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Availability Pill */}
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-gray-300 transition-colors mr-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3594bd] shadow-[0_0_8px_rgba(53,148,189,0.8)]" />
            <span>Available</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 text-white mr-1"
            aria-label="Toggle menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 inset-x-4 z-40 md:hidden bg-[#080a10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
