"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowUpRight, ChevronDown, Layers, BookOpen } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ScrollSpy for in-page anchors on home page
  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ["about", "projects", "skills", "experience", "contact"];
      let currentSection = "hero";

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250) {
            currentSection = section;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Click outside to close desktop dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Primary smooth in-page anchors (keeps user on landing page without jarring redirects)
  const navLinks = isHome
    ? [
        { id: "about", label: "About", href: "#about" },
        { id: "projects", label: "Projects", href: "#projects" },
        { id: "skills", label: "Stack", href: "#skills" },
        { id: "experience", label: "Experience", href: "#experience" },
        { id: "contact", label: "Contact", href: "#contact" },
      ]
    : [
        { id: "home", label: "Home", href: "/" },
        { id: "projects", label: "Projects", href: "/#projects" },
        { id: "skills", label: "Stack", href: "/#skills" },
        { id: "experience", label: "Experience", href: "/#experience" },
        { id: "contact", label: "Contact", href: "/#contact" },
      ];

  // Secondary pages grouped into the luxury "More" dropdown
  const exploreLinks = [
    {
      id: "case-studies",
      label: "Case Studies",
      description: "Architecture & CRO deep-dives",
      href: "/case-studies",
      icon: Layers,
      badge: "Deep-Dives",
    },
    {
      id: "blog",
      label: "Blog & Insights",
      description: "Engineering & Shopify guides",
      href: "/blog",
      icon: BookOpen,
      badge: "Articles",
    },
    {
      id: "resume",
      label: "Resume / CV",
      description: "View or download verified PDF",
      href: "/Zakaria_Bin_Moti_Resume.pdf",
      icon: FileText,
      isExternal: true,
      badge: "PDF",
    },
  ];

  const isExploreActive =
    pathname.startsWith("/case-studies") || pathname.startsWith("/blog");

  const handleMouseEnter = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setMoreDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setMoreDropdownOpen(false);
    }, 180);
  };

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
            href={isHome ? "#" : "/"}
            onClick={() => {
              if (isHome) setActiveSection("hero");
            }}
            className="relative flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:border-white/40 transition-all ml-1 hover:scale-105 shadow-[0_0_12px_rgba(53,148,189,0.3)] shrink-0 outline-none"
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

          {/* Desktop Nav Items (100% in-page anchors on home page) */}
          <div className="hidden md:flex items-center gap-1 px-1">
            {navLinks.map((link) => {
              const isActive = isHome
                ? activeSection === link.id
                : link.href === pathname || (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => {
                    if (isHome) setActiveSection(link.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200 outline-none focus:outline-none ${
                    isActive
                      ? "bg-white/[0.12] text-white shadow-[0_0_15px_rgba(255,255,255,0.08)] border-white/15"
                      : "border-white/0 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}

            {/* "More" Dropdown Trigger for Case Studies, Blog & Resume */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 outline-none focus:outline-none cursor-pointer ${
                  isExploreActive || moreDropdownOpen
                    ? "bg-white/[0.12] text-white shadow-[0_0_15px_rgba(255,255,255,0.08)] border-white/15"
                    : "border-white/0 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                }`}
                aria-expanded={moreDropdownOpen}
                aria-label="More navigation links"
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    moreDropdownOpen ? "rotate-180 text-[#fe743d]" : "text-gray-400"
                  }`}
                />
              </button>

              {/* Floating Luxury Obsidian Glass Dropdown Menu */}
              <AnimatePresence>
                {moreDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl bg-[#090b12]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(246,96,45,0.18)] flex flex-col gap-1 z-50 pointer-events-auto"
                  >
                    {/* Top Rim Gradient Ambient Glow */}
                    <div className="absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#f6602d]/60 to-transparent" />

                    {exploreLinks.map((item) => {
                      const Icon = item.icon;
                      const isItemActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          target={item.isExternal ? "_blank" : undefined}
                          rel={item.isExternal ? "noreferrer" : undefined}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                            isItemActive
                              ? "bg-[#f6602d]/15 border border-[#f6602d]/30 text-white"
                              : "hover:bg-white/[0.06] text-zinc-300 hover:text-white"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg shrink-0 transition-colors ${
                              isItemActive
                                ? "bg-[#f6602d] text-white shadow-[0_0_12px_rgba(246,96,45,0.4)]"
                                : "bg-white/[0.06] text-zinc-400 group-hover:text-white group-hover:bg-white/[0.1]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-white group-hover:text-[#fe743d] transition-colors">
                                {item.label}
                              </span>
                              {item.isExternal ? (
                                <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                              ) : item.badge ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-zinc-400 font-mono">
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-zinc-400 font-light truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 text-white mr-1 outline-none pointer-events-auto cursor-pointer"
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
            className="fixed top-20 inset-x-4 z-50 md:hidden bg-[#080a10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto"
          >
            {/* Primary Section Anchors */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = isHome
                  ? activeSection === link.id
                  : link.href === pathname || (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={() => {
                      if (isHome) setActiveSection(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            {/* Explore Pages & Case Studies */}
            <div className="pt-3 mt-3 border-t border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 px-4 mb-2 block">
                Explore More
              </span>
              <div className="flex flex-col gap-1">
                {exploreLinks.map((item) => {
                  const Icon = item.icon;
                  const isItemActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noreferrer" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isItemActive
                          ? "bg-[#f6602d]/15 text-white border border-[#f6602d]/30"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#fe743d]" />
                        <span>{item.label}</span>
                      </span>
                      {item.isExternal ? (
                        <ArrowUpRight className="w-4 h-4 text-gray-500" />
                      ) : (
                        <span className="text-[10px] text-gray-500 font-mono">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
