"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowUp, 
  LayoutGrid, 
  Film, 
  X, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/media";

interface ProjectItem {
  _id?: string;
  title: string;
  description: string;
  techStack?: string[];
  liveLink?: string;
  imageUrl?: string;
  order?: number;
  isVisible?: boolean;
}

// Categorization helper with word-boundary regex for precision
function getProjectCategory(project: ProjectItem): string {
  const text = `${project.title} ${project.description} ${project.techStack?.join(" ") || ""}`.toLowerCase();
  
  if (/\b(coffee|food|diner|burgers?|restaurants?|snacks?|gourmet|pasta|cinnamon|honey|pantry|bakery|bread|tea|culinary|beverages?|roastery|superfoods?|knives|kitchenware)\b/i.test(text)) {
    return "Food & Dining";
  }
  if (/\b(jewelry|jewels|jewellery|diamonds?|fashion|suits?|suiting|apparel|bags?|couture|watches?|rings?|earrings?|necklace|grillz|consignment|formalwear|streetwear|outfit|clothing|western)\b/i.test(text)) {
    return "Fashion & Luxury";
  }
  if (!/\b(publishing|books?)\b/i.test(text) && /\b(health|skincare|skin|beauty|cosmetics|pets?|dogs?|canine|saunas?|wellness|supplements?|medical|pest|vitamins?|clinic|fitness|nutrition|oils|healthcare)\b/i.test(text)) {
    return "Health & Wellness";
  }
  
  return "Tech & Lifestyle";
}

const CATEGORIES = [
  "All",
  "Fashion & Luxury",
  "Food & Dining",
  "Health & Wellness",
  "Tech & Lifestyle",
] as const;

export default function ProjectsSection({ projects }: { projects: ProjectItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"dock" | "grid">("grid");
  const [showFloatingDock, setShowFloatingDock] = useState(false);
  const [pageSize, setPageSize] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

  const showcaseRef = useRef<HTMLDivElement>(null);
  const filmstripScrollRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  const total = projects.length;

  // Filter projects by category and search query
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      if (proj.isVisible === false) return false;

      const category = getProjectCategory(proj);
      const matchesCategory = selectedCategory === "All" || category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = proj.title?.toLowerCase().includes(q);
      const matchDesc = proj.description?.toLowerCase().includes(q);
      const matchTech = proj.techStack?.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchDesc || matchTech;
    });
  }, [projects, selectedCategory, searchQuery]);

  // Reset pagination on category or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: projects.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== "All") counts[cat] = 0;
    });
    projects.forEach((p) => {
      const cat = getProjectCategory(p);
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  }, [projects]);

  // Safe active project reference
  const activeProject = projects[activeIndex] || projects[0];

  // Next / Previous navigation with loop
  const nextSlide = () => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  // Smooth scroll into showcase view
  const scrollToShowcase = (smooth = true) => {
    if (showcaseRef.current) {
      const yOffset = -90;
      const element = showcaseRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
    }
  };

  // Select project handler (with auto-scroll if user is below showcase)
  const handleSelectProject = (index: number) => {
    setActiveIndex(index);

    // If the showcase is out of view (e.g. user scrolled down into grid), scroll up smoothly
    if (showcaseRef.current) {
      const rect = showcaseRef.current.getBoundingClientRect();
      const isVisible = rect.top >= -100 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 300;
      if (!isVisible) {
        scrollToShowcase(true);
      }
    }
  };

  // Auto-scroll active card into view in horizontal filmstrip dock
  useEffect(() => {
    if (viewMode === "dock" && activeThumbnailRef.current && filmstripScrollRef.current) {
      const container = filmstripScrollRef.current;
      const card = activeThumbnailRef.current;
      const containerLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const cardLeft = card.offsetLeft;
      const cardWidth = card.clientWidth;

      if (cardLeft < containerLeft || cardLeft + cardWidth > containerLeft + containerWidth) {
        container.scrollTo({
          left: cardLeft - containerWidth / 2 + cardWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex, viewMode]);

  // Track showcase visibility to toggle bottom floating quick-dock
  useEffect(() => {
    const handleScroll = () => {
      if (!showcaseRef.current) return;
      const rect = showcaseRef.current.getBoundingClientRect();
      // If bottom of showcase has scrolled above the viewport, show floating dock
      const isScrolledPast = rect.bottom < 150;
      setShowFloatingDock(isScrolledPast);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (total > 0 ? (prev + 1) % total : 0));
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (total > 0 ? (prev - 1 + total) % total : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [total]);

  if (total === 0) {
    return (
      <section id="projects" className="bg-[#080a10] py-32 px-6 md:px-20 relative z-20">
        <div className="max-w-7xl mx-auto text-center py-20 text-gray-500 font-mono">
          Projects are currently being curated.
        </div>
      </section>
    );
  }

  // Pagination slice for grid view
  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section id="projects" className="min-h-screen bg-[#080a10] py-24 sm:py-32 px-4 sm:px-8 md:px-16 relative z-20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#3594bd] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                04 // Project Showcase
              </span>
              <span className="text-gray-600 font-mono text-xs">•</span>
              <span className="text-xs font-mono text-gray-400">
                {total} Commercial Stores & Web Apps
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Featured<span className="text-gray-500"> Projects.</span>
            </h2>
          </div>

          {/* Navigation Controls & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* View Mode Toggle */}
            <div className="bg-white/[0.04] p-1 rounded-full border border-white/[0.08] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("dock")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === "dock"
                    ? "bg-white text-black shadow-md font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }`}
                title="Compact Filmstrip Dock"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Filmstrip</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-black shadow-md font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }`}
                title="Visual Catalog Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Projects ({total})</span>
              </button>
            </div>

            {/* Filmstrip Index Counter */}
            <div className="bg-white/[0.03] px-3.5 py-2 rounded-full border border-white/[0.08] flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">
                <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, "0")}</span>
                <span className="text-gray-600"> / </span>
                {String(total).padStart(2, "0")}
              </span>
            </div>

            {/* Slide Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevSlide}
                className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                aria-label="Previous project"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                aria-label="Next project"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Widescreen Main Showcase Display */}
        <div ref={showcaseRef} className="relative w-full mb-8 scroll-mt-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProject._id || activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full rounded-3xl bg-white/[0.025] border border-white/[0.09] backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative overflow-hidden"
            >
              {/* Top Accent Light Highlight */}
              <div 
                aria-hidden="true" 
                className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#3594bd]/60 via-white/20 to-[#f6602d]/60 opacity-80" 
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Widescreen Media Display (Exact 16:10 Ratio) */}
                <div className="col-span-1 lg:col-span-7">
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-black/60 border border-white/[0.08] shadow-2xl group">
                    {activeProject.imageUrl ? (
                      <Image
                        src={getOptimizedImageUrl(activeProject.imageUrl)}
                        alt={`${activeProject.title} - eCommerce showcase project by Zakaria Bin Moti`}
                        fill
                        priority
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm italic font-mono">
                        Media preview unavailable
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Quick Badge On Media */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-mono text-gray-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3594bd] animate-pulse" />
                      <span>#{String(activeIndex + 1).padStart(2, "0")}</span>
                      <span className="text-gray-500">•</span>
                      <span>{getProjectCategory(activeProject)}</span>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeProject.techStack?.map((tech: string) => (
                      <span
                        key={tech}
                        className="text-xs font-medium text-gray-300 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight leading-snug">
                    {activeProject.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-8 font-light">
                    {activeProject.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    {activeProject.liveLink && (
                      <a
                        href={activeProject.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-black px-7 py-3 rounded-full font-medium text-sm hover:bg-gray-100 transition-all shadow-lg hover:scale-105 group active:scale-95"
                      >
                        <span>View Live Store</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setViewMode("grid");
                        setTimeout(() => {
                          const catalog = document.getElementById("projects-catalog");
                          catalog?.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                      }}
                      className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white px-4 py-3 rounded-full hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Browse All {total} Projects ↓</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ==================================================================== */}
        {/* VIEW MODE 1: COMPACT HORIZONTAL FILMSTRIP DOCK (ZERO PAGE BLOAT)   */}
        {/* ==================================================================== */}
        {viewMode === "dock" && (
          <div className="relative w-full mt-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#3594bd]" />
                <span className="uppercase tracking-wider">Visual Reel Dock</span>
                <span className="text-gray-600">|</span>
                <span>Click any thumbnail to preview immediately</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    filmstripScrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });
                  }}
                  className="w-7 h-7 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  title="Scroll dock left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    filmstripScrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });
                  }}
                  className="w-7 h-7 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  title="Scroll dock right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Filmstrip Carousel */}
            <div
              ref={filmstripScrollRef}
              className="flex items-center gap-3.5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {projects.map((proj, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={proj._id || idx}
                    ref={isSelected ? activeThumbnailRef : null}
                    type="button"
                    onClick={() => handleSelectProject(idx)}
                    className={`flex-shrink-0 w-64 text-left rounded-2xl border transition-all duration-300 p-2.5 group relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? "bg-white/[0.09] border-[#3594bd]/60 shadow-[0_10px_25px_rgba(0,0,0,0.6)] ring-1 ring-[#3594bd]/40 -translate-y-1"
                        : "bg-white/[0.02] border-white/[0.07] opacity-65 hover:opacity-100 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Top gradient highlight for selected */}
                    {isSelected && (
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#3594bd] via-white to-[#f6602d]" />
                    )}

                    {/* Mini Visual Thumbnail */}
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/40 mb-2 border border-white/[0.06]">
                      {proj.imageUrl ? (
                        <Image
                          src={getOptimizedImageUrl(proj.imageUrl, 550)}
                          alt={`${proj.title} thumbnail - Zakaria Bin Moti portfolio`}
                          fill
                          sizes="256px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">
                          Preview
                        </div>
                      )}
                      <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-mono text-gray-300">
                        #{String(idx + 1).padStart(2, "0")}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3594bd] shadow-[0_0_8px_#3594bd]" />
                      )}
                    </div>

                    {/* Metadata */}
                    <h4 className="text-xs font-semibold text-white truncate mb-0.5 group-hover:text-white transition-colors">
                      {proj.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="truncate text-gray-400">{getProjectCategory(proj)}</span>
                      <span className="font-mono text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {proj.techStack?.[0] || "eCommerce"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW MODE 2: FULL INTERACTIVE CATALOG (SEARCH, FILTERS, AUTO-SCROLL) */}
        {/* ==================================================================== */}
        <div id="projects-catalog" className={`mt-14 pt-8 border-t border-white/[0.08] ${viewMode === "dock" ? "hidden" : "block"}`}>
          {/* Controls Bar: Categories & Search */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isCurrent = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isCurrent
                        ? "bg-white text-black font-semibold shadow-md"
                        : "bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.07]"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isCurrent ? "bg-black/10 text-black" : "bg-white/10 text-gray-400"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instant Live Search Input */}
            <div className="relative min-w-[280px] lg:w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand, tech, or niche..."
                className="w-full bg-white/[0.03] border border-white/[0.09] focus:border-white/30 rounded-full pl-10 pr-9 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Result Count / Reset */}
          {(searchQuery || selectedCategory !== "All") && (
            <div className="flex items-center justify-between text-xs text-gray-400 mb-6 bg-white/[0.02] px-4 py-2 rounded-xl border border-white/[0.06]">
              <span>
                Showing <strong className="text-white">{filteredProjects.length}</strong> of {total} projects
                {searchQuery && <span> matching &ldquo;<span className="text-[#3594bd]">{searchQuery}</span>&rdquo;</span>}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="text-[#3594bd] hover:underline font-mono text-[11px]"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Visual Cards Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/[0.06]">
              <p className="text-gray-400 text-sm mb-3">No projects found matching your search.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="text-xs font-mono text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedProjects.map((proj) => {
                // Find actual global index in original projects array
                const globalIdx = projects.findIndex((p) => p._id === proj._id || p.title === proj.title);
                const isSelected = globalIdx === activeIndex;

                return (
                  <div
                    key={proj._id || proj.title}
                    className={`rounded-2xl border transition-all duration-300 p-4 relative group flex flex-col justify-between ${
                      isSelected
                        ? "bg-white/[0.08] border-[#3594bd]/60 shadow-[0_15px_35px_rgba(0,0,0,0.6)] ring-1 ring-[#3594bd]/40"
                        : "bg-white/[0.025] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Top indicator for selected */}
                    {isSelected && (
                      <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-[#3594bd] via-white to-[#f6602d]" />
                    )}

                    {/* Clickable Area that Selects and Auto-Scrolls to Showcase */}
                    <button
                      type="button"
                      onClick={() => handleSelectProject(globalIdx >= 0 ? globalIdx : 0)}
                      className="w-full text-left cursor-pointer"
                    >
                      {/* Visual 16:10 Thumbnail */}
                      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/50 mb-3.5 border border-white/[0.06]">
                        {proj.imageUrl ? (
                          <Image
                            src={getOptimizedImageUrl(proj.imageUrl, 750)}
                            alt={`${proj.title} - eCommerce website engineered by Zakaria Bin Moti`}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                            No Preview
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-gray-300">
                          #{String((globalIdx >= 0 ? globalIdx : 0) + 1).padStart(2, "0")}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-[#3594bd] text-black text-[10px] font-bold font-mono px-2 py-0.5 rounded-md shadow-md">
                            ACTIVE SHOWCASE
                          </div>
                        )}
                        {proj.liveLink && (
                          <a
                            href={proj.liveLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-black/80 hover:bg-white hover:text-black text-gray-200 text-[10px] font-mono font-medium px-2 py-1 rounded-md backdrop-blur-md flex items-center gap-1 shadow-lg border border-white/10 hover:scale-105 active:scale-95 z-10"
                            title="Open live website in new tab"
                          >
                            <span>Live</span>
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Title & Category */}
                      <div className="mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#3594bd] block mb-1">
                          {getProjectCategory(proj)}
                        </span>
                        <h4 className="text-base font-semibold text-white tracking-tight line-clamp-1 group-hover:text-white transition-colors">
                          {proj.title}
                        </h4>
                      </div>

                      {/* Snippet Description */}
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 font-light">
                        {proj.description}
                      </p>
                    </button>

                    {/* Card Footer: Tech Stack + Direct Link */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {proj.techStack?.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono text-gray-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06] truncate"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {proj.liveLink && (
                          <a
                            href={proj.liveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-white transition-colors p-1"
                            title="Open live website in new tab"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSelectProject(globalIdx >= 0 ? globalIdx : 0)}
                          className={`text-xs font-medium px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                            isSelected
                              ? "bg-white text-black font-semibold"
                              : "bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white"
                          }`}
                        >
                          <span>{isSelected ? "Viewing ↑" : "Preview ↑"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  document.getElementById("projects-catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none border border-white/10 text-white transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }).map((_, pIdx) => {
                  const pNum = pIdx + 1;
                  const isCurrent = pNum === currentPage;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pNum);
                        document.getElementById("projects-catalog")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-7 h-7 rounded-full text-xs font-mono transition-all ${
                        isCurrent
                          ? "bg-white text-black font-bold shadow-md"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  document.getElementById("projects-catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none border border-white/10 text-white transition-colors flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* FLOATING QUICK DOCK (APPEARS WHEN SCROLLED PAST THE MAIN SHOWCASE)    */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {showFloatingDock && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-xl w-full"
          >
            <div className="bg-[#0b0e17]/90 backdrop-blur-2xl border border-white/15 rounded-full p-2 pl-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
              {/* Active Project Thumbnail & Title */}
              <button
                type="button"
                onClick={() => scrollToShowcase(true)}
                className="flex items-center gap-3 overflow-hidden text-left group cursor-pointer"
                title="Scroll back to main showcase"
              >
                <div className="relative w-11 h-7 rounded-lg overflow-hidden bg-black/60 flex-shrink-0 border border-white/10">
                  {activeProject.imageUrl ? (
                    <Image
                      src={getOptimizedImageUrl(activeProject.imageUrl, 200)}
                      alt={`${activeProject.title} preview`}
                      fill
                      sizes="44px"
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : null}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#3594bd] font-bold">
                      #{String(activeIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">•</span>
                    <span className="text-[10px] font-mono text-gray-400 truncate">
                      {getProjectCategory(activeProject)}
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-[220px]">
                    {activeProject.title}
                  </h5>
                </div>
              </button>

              {/* Quick Controls */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Prev / Next Slide */}
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.15] text-white flex items-center justify-center transition-colors"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.15] text-white flex items-center justify-center transition-colors"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Back to Showcase Button */}
                <button
                  type="button"
                  onClick={() => scrollToShowcase(true)}
                  className="bg-white text-black px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-100 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <span>View Details</span>
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
