"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Layers,
  ExternalLink,
  Search,
  X,
  CheckCircle2,
} from "lucide-react";
import { PostItem } from "@/lib/posts";
import { getOptimizedImageUrl } from "@/lib/media";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";

interface CaseStudiesCatalogProps {
  caseStudies: PostItem[];
}

export default function CaseStudiesCatalog({ caseStudies }: CaseStudiesCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    caseStudies.forEach((cs) => {
      if (cs.category) set.add(cs.category);
    });
    return ["All", ...Array.from(set)];
  }, [caseStudies]);

  const filteredStudies = useMemo(() => {
    return caseStudies.filter((cs) => {
      const matchesCategory =
        selectedCategory === "All" || cs.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = cs.title?.toLowerCase().includes(q);
      const matchClient = cs.clientName?.toLowerCase().includes(q);
      const matchSummary = cs.summary?.toLowerCase().includes(q);
      const matchTags = cs.tags?.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchClient || matchSummary || matchTags;
    });
  }, [caseStudies, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#080a10] text-white selection:bg-[#3594bd]/30 selection:text-white relative">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-36 sm:pt-44 pb-16 px-4 sm:px-8 md:px-16 max-w-7xl mx-auto relative z-10">
        <div className="relative">
          {/* Subtle Ambient Light */}
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-[#3594bd]/15 via-[#f6602d]/10 to-transparent blur-[130px] pointer-events-none"
          />

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#3594bd] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3594bd]/10 border border-[#3594bd]/25">
              <Sparkles className="w-3.5 h-3.5" />
              Commercial Impact & Technical Proof
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Case Studies<span className="text-gray-500">.</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-3xl font-light leading-relaxed">
            Detailed engineering breakdowns and measurable commercial ROI from real 7-figure Shopify stores, luxury retailers, and global consumer brands.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-black font-semibold shadow-lg"
                      : "bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.07] border border-white/[0.07]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px] md:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, tech, or metric..."
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

        {/* Active Filter Counter */}
        {(searchQuery || selectedCategory !== "All") && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 bg-white/[0.02] px-4 py-2 rounded-xl border border-white/[0.06]">
            <span>
              Showing <strong className="text-white">{filteredStudies.length}</strong> case studies
              {searchQuery && (
                <span>
                  {" "}
                  matching &ldquo;<span className="text-[#3594bd]">{searchQuery}</span>&rdquo;
                </span>
              )}
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
      </section>

      {/* Case Studies Cards Stream */}
      <section className="px-4 sm:px-8 md:px-16 max-w-7xl mx-auto pb-32 space-y-12">
        {filteredStudies.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/[0.06] p-8">
            <Layers className="w-10 h-10 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No case studies found</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              No case studies matched your filter criteria. Try clearing the search or choosing another category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-5 py-2 rounded-full text-xs font-mono bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredStudies.map((study, idx) => (
            <div
              key={study.slug}
              className="rounded-3xl bg-white/[0.025] border border-white/[0.09] hover:border-white/20 backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-all duration-300 relative overflow-hidden group"
            >
              {/* Dual Rim Top Highlight */}
              <div
                aria-hidden="true"
                className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#3594bd]/60 via-white/20 to-[#f6602d]/60 opacity-80"
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Widescreen Media Display (16:10 Ratio) */}
                <div className="col-span-1 lg:col-span-7">
                  <Link href={`/case-studies/${study.slug}`} className="block">
                    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-black/60 border border-white/[0.08] shadow-2xl">
                      {study.coverImage ? (
                        <Image
                          src={getOptimizedImageUrl(study.coverImage, 950)}
                          alt={`${study.title} - Case Study by Zakaria Bin Moti`}
                          fill
                          priority={idx === 0}
                          sizes="(max-width: 1024px) 100vw, 58vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-mono text-xs">
                          Showcase Mockup
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                      {/* Floating Client Pill */}
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono text-gray-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3594bd] animate-pulse" />
                        <span className="font-semibold text-white">{study.clientName}</span>
                        {study.projectYear && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{study.projectYear}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Details & Metrics */}
                <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-3">
                    <span className="text-[#3594bd] bg-[#3594bd]/10 px-2.5 py-1 rounded-full border border-[#3594bd]/20 font-medium">
                      {study.category}
                    </span>
                    <span>•</span>
                    <span>{study.readingTime || "6 min read"}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight leading-snug group-hover:text-[#3594bd] transition-colors">
                    <Link href={`/case-studies/${study.slug}`}>{study.title}</Link>
                  </h2>

                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 font-light">
                    {study.summary}
                  </p>

                  {/* High-Impact Metrics Grid */}
                  {study.metrics && study.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      {study.metrics.slice(0, 4).map((metric, mIdx) => (
                        <div key={mIdx} className="space-y-0.5">
                          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight flex items-center gap-1.5">
                            <span className="text-[#3594bd]">{metric.value}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 font-light leading-tight">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      href={`/case-studies/${study.slug}`}
                      className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium text-sm hover:bg-gray-100 transition-all shadow-lg hover:scale-105 active:scale-95 group/btn"
                    >
                      <span>Read Case Study</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>

                    {study.clientUrl && (
                      <a
                        href={study.clientUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-white px-4 py-3 rounded-full hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/10"
                        title="Visit Live Client Storefront"
                      >
                        <span>Live Store</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-12 px-6 text-center text-xs text-gray-500 font-mono">
        <div className="mb-4 flex justify-center">
          <ThemeToggle />
        </div>
        <p>© {new Date().getFullYear()} Zakaria Bin Moti. All rights reserved.</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>•</span>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span>•</span>
          <Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link>
          <span>•</span>
          <Link href="/#projects" className="hover:text-white transition-colors">Projects</Link>
          <span>•</span>
          <Link href="/#contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
