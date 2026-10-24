"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, BookOpen, Clock, Calendar, ArrowRight, Sparkles, Tag } from "lucide-react";
import { PostItem } from "@/lib/posts";
import { getOptimizedImageUrl } from "@/lib/media";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";

interface BlogCatalogProps {
  posts: PostItem[];
}

export default function BlogCatalog({ posts }: BlogCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchSummary = post.summary?.toLowerCase().includes(q);
      const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchSummary || matchTags;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-[#080a10] text-white selection:bg-[#3594bd]/30 selection:text-white relative">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-36 sm:pt-44 pb-16 px-4 sm:px-8 md:px-16 max-w-7xl mx-auto relative z-10">
        <div className="relative">
          {/* Subtle Ambient Glow */}
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#3594bd]/15 via-[#f6602d]/10 to-transparent blur-[120px] pointer-events-none"
          />

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#3594bd] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3594bd]/10 border border-[#3594bd]/25">
              <Sparkles className="w-3.5 h-3.5" />
              Engineering Insights & Architecture
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Technical Writing<span className="text-gray-500">.</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-3xl font-light leading-relaxed">
            In-depth engineering breakdowns on Shopify OS 2.0 theme architecture,
            Liquid performance tuning, Core Web Vitals remediation, headless Next.js, and practical AI in modern eCommerce.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Pills */}
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

          {/* Search Input */}
          <div className="relative min-w-[280px] md:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, topics, or code..."
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

        {/* Filter Notice */}
        {(searchQuery || selectedCategory !== "All") && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 bg-white/[0.02] px-4 py-2 rounded-xl border border-white/[0.06]">
            <span>
              Showing <strong className="text-white">{filteredPosts.length}</strong> articles
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

      {/* Main Articles Stream */}
      <section className="px-4 sm:px-8 md:px-16 max-w-7xl mx-auto pb-32">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-white/[0.06] p-8">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No articles found</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              No technical guides matched your current search filters. Try selecting another category or resetting the search.
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
          <div className="space-y-12">
            {/* Featured Post Hero Card */}
            {featuredPost && (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group block rounded-3xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.09] hover:border-white/20 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-all duration-300 relative overflow-hidden"
              >
                {/* Top Subtle Border Highlight */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-[#3594bd]/60 via-white/20 to-[#f6602d]/60 opacity-80"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Media Display */}
                  <div className="col-span-1 lg:col-span-7">
                    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-black/60 border border-white/[0.08] shadow-2xl">
                      {featuredPost.coverImage ? (
                        <Image
                          src={getOptimizedImageUrl(featuredPost.coverImage, 900)}
                          alt={featuredPost.title}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 58vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/[0.05] to-white/[0.01] text-gray-600 font-mono text-xs">
                          Technical Article
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-mono text-[#3594bd] font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#3594bd]" />
                        <span>FEATURED ESSAY</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Breakdown */}
                  <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs font-mono text-gray-400 mb-3">
                      <span className="text-[#3594bd] bg-[#3594bd]/10 px-2.5 py-1 rounded-full border border-[#3594bd]/20 font-medium">
                        {featuredPost.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredPost.readingTime || "5 min read"}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight leading-snug group-hover:text-[#3594bd] transition-colors">
                      {featuredPost.title}
                    </h2>

                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 font-light line-clamp-3">
                      {featuredPost.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPost.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono text-gray-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(featuredPost.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 text-xs font-medium text-white group-hover:text-[#3594bd] transition-colors font-mono">
                        <span>Read Full Article</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid for Remaining Posts */}
            {regularPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group rounded-2xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.08] hover:border-white/20 p-5 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/50 mb-4 border border-white/[0.06]">
                        {post.coverImage ? (
                          <Image
                            src={getOptimizedImageUrl(post.coverImage, 600)}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/[0.02] text-gray-600 font-mono text-xs">
                            No Cover Image
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-[#3594bd] border border-white/10 font-medium">
                          {post.category}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 mb-2.5">
                        <Clock className="w-3 h-3" />
                        <span>{post.readingTime || "5 min read"}</span>
                        <span>•</span>
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white tracking-tight leading-snug mb-2.5 group-hover:text-[#3594bd] transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-gray-400 font-light leading-relaxed mb-4 line-clamp-3">
                        {post.summary}
                      </p>
                    </div>

                    <div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags?.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono text-gray-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.05]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-gray-400 font-mono">
                        <span className="text-gray-400">By {post.authorName || "Zakaria Bin Moti"}</span>
                        <span className="text-white group-hover:text-[#3594bd] transition-colors flex items-center gap-1">
                          Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Consultation Banner */}
        <div className="mt-24 rounded-3xl bg-gradient-to-r from-white/[0.03] via-white/[0.05] to-white/[0.03] border border-white/10 p-8 sm:p-12 text-center relative overflow-hidden backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-[#3594bd]/60 to-transparent"
          />
          <span className="text-xs font-mono uppercase tracking-widest text-[#3594bd] font-semibold mb-3 block">
            Custom Architecture & Code Audits
          </span>
          <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Need an audit or custom Shopify architecture?
          </h3>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-8 font-light">
            I help high-growth eCommerce brands build custom Liquid OS 2.0 themes, headless storefronts, and achieve sub-second Core Web Vitals.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:zakaria.binmoti@gmail.com"
              className="bg-white text-black px-7 py-3 rounded-full font-medium text-sm hover:bg-gray-100 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Get in Touch
            </a>
            <Link
              href="/case-studies"
              className="border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white px-7 py-3 rounded-full font-medium text-sm transition-all"
            >
              View Case Studies →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-12 px-6 text-center text-xs text-gray-500 font-mono">
        <div className="mb-4 flex justify-center">
          <ThemeToggle />
        </div>
        <p>© {new Date().getFullYear()} Zakaria Bin Moti. All technical articles and architecture patterns reserved.</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
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
