import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Sparkles,
  Share2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getPostBySlug, getAllPostSlugs, getPosts } from "@/lib/posts";
import { getOptimizedImageUrl } from "@/lib/media";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hellozakaria.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs("blog");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "blog");

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  const ogImages = post.coverImage
    ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ]
    : [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ];

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      url: `${siteUrl}/blog/${post.slug}`,
      title: `${post.title} | Zakaria Bin Moti`,
      description: post.summary,
      publishedTime: new Date(post.publishedAt).toISOString(),
      authors: [post.authorName || "Zakaria Bin Moti"],
      tags: post.tags,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: post.coverImage ? [post.coverImage] : [`${siteUrl}/og-image.png`],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "blog");

  if (!post) {
    notFound();
  }

  // Fetch 2-3 related posts
  const allPosts = await getPosts({ type: "blog", limit: 4 });
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    image: post.coverImage || `${siteUrl}/og-image.png`,
    datePublished: new Date(post.publishedAt).toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName || "Zakaria Bin Moti",
      url: siteUrl,
      jobTitle: post.authorRole || "Lead Software Engineer & Shopify Architect",
    },
    publisher: {
      "@type": "Organization",
      name: "Zakaria Bin Moti",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
  };

  return (
    <article className="min-h-screen bg-[#080a10] text-white selection:bg-[#3594bd]/30 selection:text-white relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero Backdrop Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#3594bd]/10 via-[#f6602d]/05 to-transparent blur-[140px] pointer-events-none"
      />

      {/* Main Container */}
      <div className="pt-36 sm:pt-44 pb-32 px-4 sm:px-8 md:px-16 max-w-4xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all articles</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gray-300">Blog</Link>
            <span>/</span>
            <span className="text-[#3594bd]">{post.category}</span>
          </div>
        </div>

        {/* Article Metadata Bar */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono mb-4">
            <span className="text-[#3594bd] bg-[#3594bd]/10 px-3 py-1 rounded-full border border-[#3594bd]/25 font-semibold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime || "5 min read"}
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
            {post.title}
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed border-l-2 border-[#3594bd]/60 pl-5 py-1 mb-8 bg-white/[0.015] rounded-r-xl">
            {post.summary}
          </p>

          {/* Author Capsule */}
          <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#3594bd] to-[#f6602d] p-[1.5px] shadow-lg">
                <div className="w-full h-full rounded-full bg-[#0b0e17] flex items-center justify-center font-bold font-mono text-sm text-white">
                  ZM
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {post.authorName || "Zakaria Bin Moti"}
                </h4>
                <p className="text-xs text-gray-400 font-mono">
                  {post.authorRole || "Lead Software Engineer & Shopify Architect"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/in/zakariabinmoti"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-gray-400 hover:text-white px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors flex items-center gap-1"
                title="Connect on LinkedIn"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </header>

        {/* Hero Cover Image Display */}
        {post.coverImage && (
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-black/60 border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.8)] mb-14 group">
            <Image
              src={getOptimizedImageUrl(post.coverImage, 1200)}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Article Body Content */}
        <div className="prose prose-invert max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-14 pt-8 border-t border-white/[0.08]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-3">
              Topics & Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono text-gray-300 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Card */}
        <div className="mt-14 rounded-3xl bg-white/[0.025] border border-white/[0.08] p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#3594bd] to-[#f6602d] p-[2px] shrink-0 shadow-xl">
            <div className="w-full h-full rounded-full bg-[#080a10] flex items-center justify-center font-bold font-mono text-lg text-white">
              ZM
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h3 className="text-base font-bold text-white">Zakaria Bin Moti</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3594bd]/10 text-[#3594bd] border border-[#3594bd]/30">
                Author
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400 mb-3">
              Lead Software Engineer & Shopify Architect • 250+ Production Stores Delivered
            </p>
            <p className="text-sm text-gray-300 font-light leading-relaxed mb-4">
              Zakaria specializes in designing ultra-fast, high-converting digital flagships on Shopify OS 2.0 and headless Next.js platforms. He has audited, refactored, and architected eCommerce stores generating tens of millions in annual revenue.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <a
                href="mailto:zakaria.binmoti@gmail.com"
                className="text-xs font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                Get in Touch
              </a>
              <Link
                href="/case-studies"
                className="text-xs font-mono text-gray-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-colors"
              >
                View Case Studies →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Recommended Articles
              </h3>
              <Link
                href="/blog"
                className="text-xs font-mono text-[#3594bd] hover:underline flex items-center gap-1"
              >
                <span>All articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group rounded-2xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.08] hover:border-white/20 p-5 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 mb-2">
                    <span className="text-[#3594bd]">{rel.category}</span>
                    <span>•</span>
                    <span>{rel.readingTime || "5 min read"}</span>
                  </div>
                  <h4 className="text-base font-semibold text-white tracking-tight leading-snug group-hover:text-[#3594bd] transition-colors mb-2 line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-gray-400 font-light line-clamp-2 leading-relaxed">
                    {rel.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-12 px-6 text-center text-xs text-gray-500 font-mono">
        <p>© {new Date().getFullYear()} Zakaria Bin Moti. All rights reserved.</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>•</span>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span>•</span>
          <Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link>
          <span>•</span>
          <Link href="/#contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>
    </article>
  );
}
