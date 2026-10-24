import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getPostBySlug, getAllPostSlugs, getPosts } from "@/lib/posts";
import { getOptimizedImageUrl } from "@/lib/media";
import ThemeToggle from "@/components/ThemeToggle";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hellozakaria.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs("case-study");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "case-study");

  if (!post) {
    return {
      title: "Case Study Not Found",
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
    title: `${post.clientName || "Client"} Case Study: ${post.title}`,
    description: post.summary,
    alternates: {
      canonical: `/case-studies/${post.slug}`,
    },
    openGraph: {
      type: "article",
      url: `${siteUrl}/case-studies/${post.slug}`,
      title: `${post.clientName || "Client"} Case Study | Zakaria Bin Moti`,
      description: post.summary,
      publishedTime: new Date(post.publishedAt).toISOString(),
      authors: [post.authorName || "Zakaria Bin Moti"],
      tags: post.tags,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.clientName} Case Study: ${post.title}`,
      description: post.summary,
      images: post.coverImage ? [post.coverImage] : [`${siteUrl}/og-image.png`],
    },
  };
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const study = await getPostBySlug(slug, "case-study");

  if (!study) {
    notFound();
  }

  // Fetch other case studies for recommendations
  const allStudies = await getPosts({ type: "case-study", limit: 4 });
  const otherStudies = allStudies.filter((s) => s.slug !== study.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.title,
    description: study.summary,
    image: study.coverImage || `${siteUrl}/og-image.png`,
    datePublished: new Date(study.publishedAt).toISOString(),
    author: {
      "@type": "Person",
      name: study.authorName || "Zakaria Bin Moti",
      url: siteUrl,
      jobTitle: study.authorRole || "Lead Software Engineer & Shopify Architect",
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
    about: {
      "@type": "Organization",
      name: study.clientName,
      url: study.clientUrl || undefined,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/case-studies/${study.slug}`,
    },
    keywords: study.tags.join(", "),
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
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#3594bd]/12 via-[#f6602d]/08 to-transparent blur-[140px] pointer-events-none"
      />

      {/* Main Container */}
      <div className="pt-36 sm:pt-44 pb-32 px-4 sm:px-8 md:px-16 max-w-5xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all case studies</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <span>/</span>
            <Link href="/case-studies" className="hover:text-gray-300">Case Studies</Link>
            <span>/</span>
            <span className="text-[#3594bd]">{study.clientName}</span>
          </div>
        </div>

        {/* Case Study Header */}
        <header className="mb-12">
          {/* Client & Category Badge */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono mb-4">
            <span className="text-[#3594bd] bg-[#3594bd]/10 px-3 py-1 rounded-full border border-[#3594bd]/25 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {study.category}
            </span>

            {study.clientName && (
              <span className="text-white bg-white/[0.06] px-3 py-1 rounded-full border border-white/10 font-medium">
                Client: {study.clientName}
              </span>
            )}

            {study.projectYear && (
              <span className="text-gray-400 font-mono">
                Year: {study.projectYear}
              </span>
            )}

            <span className="text-gray-600">•</span>
            <span className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {study.readingTime || "6 min read"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
            {study.title}
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed border-l-2 border-[#3594bd]/60 pl-5 py-1 mb-8 bg-white/[0.015] rounded-r-xl">
            {study.summary}
          </p>

          {/* Client Quick Bar & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3594bd] to-[#f6602d] p-[1.5px] shadow-lg">
                <div className="w-full h-full rounded-xl bg-[#0b0e17] flex items-center justify-center font-bold font-mono text-sm text-white">
                  {study.clientName?.slice(0, 2).toUpperCase() || "CS"}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {study.clientName}
                </h4>
                <p className="text-xs text-gray-400 font-mono">
                  {study.category} • Delivered by Zakaria Bin Moti
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {study.clientUrl && (
                <a
                  href={study.clientUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-medium text-xs hover:bg-gray-100 transition-all shadow-md hover:scale-105 active:scale-95"
                  title="Visit Live Client Storefront"
                >
                  <span>Visit Live Store</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Commercial Impact Metrics Grid */}
        {study.metrics && study.metrics.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-[#3594bd]" />
              <span>Key Business & Architectural Metrics</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {study.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/[0.025] border border-white/[0.09] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-[#3594bd]/40 transition-colors"
                >
                  <div
                    aria-hidden="true"
                    className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#3594bd] to-transparent opacity-60"
                  />
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white mb-1.5 tracking-tight group-hover:text-[#3594bd] transition-colors">
                    {metric.value}
                  </div>
                  <div className="text-xs text-gray-400 font-light leading-snug">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hero Showcase Image (16:10 Multi-Device Mockup) */}
        {study.coverImage && (
          <div className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-black/60 border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.8)] mb-14 group">
            <Image
              src={getOptimizedImageUrl(study.coverImage, 1200)}
              alt={`${study.title} multi-device showcase`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[11px] font-mono text-gray-300">
              Multi-Device Showcase Architecture
            </div>
          </div>
        )}

        {/* Services Delivered Grid */}
        {study.services && study.services.length > 0 && (
          <div className="mb-14 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.07]">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#3594bd] font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              Scope of Engineering & Services Delivered
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {study.services.map((service, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#3594bd] shrink-0 mt-0.5" />
                  <span className="leading-snug">{service}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In-Depth Case Study Body */}
        <div className="prose prose-invert max-w-none">
          <MarkdownRenderer content={study.content} />
        </div>

        {/* Tags Section */}
        {study.tags && study.tags.length > 0 && (
          <div className="mt-14 pt-8 border-t border-white/[0.08]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-3">
              Technical Stack & Domain Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {study.tags.map((tag) => (
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

        {/* Bottom Consultation CTA */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] border border-white/10 p-8 sm:p-12 text-center relative overflow-hidden backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-[#3594bd]/60 to-transparent"
          />
          <span className="text-xs font-mono uppercase tracking-widest text-[#3594bd] font-semibold mb-3 block">
            06 // Commercial Partnership
          </span>
          <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Have a similar eCommerce challenge?
          </h3>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-8 font-light">
            Whether you need a custom Shopify OS 2.0 theme, a Core Web Vitals speed overhaul, or a bespoke headless application, let&apos;s build something exceptional.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:zakaria.binmoti@gmail.com"
              className="bg-white text-black px-7 py-3 rounded-full font-medium text-sm hover:bg-gray-100 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              Start a Conversation
            </a>
            <a
              href="/Zakaria_Bin_Moti_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white px-7 py-3 rounded-full font-medium text-sm transition-all"
            >
              Download Resume (PDF)
            </a>
          </div>
        </div>

        {/* Other Case Studies */}
        {otherStudies.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">
                More Case Studies
              </h3>
              <Link
                href="/case-studies"
                className="text-xs font-mono text-[#3594bd] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherStudies.map((other) => (
                <Link
                  key={other.slug}
                  href={`/case-studies/${other.slug}`}
                  className="group rounded-2xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.08] hover:border-white/20 p-5 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 mb-2">
                    <span className="text-[#3594bd]">{other.clientName}</span>
                    <span>•</span>
                    <span>{other.category}</span>
                  </div>
                  <h4 className="text-base font-semibold text-white tracking-tight leading-snug group-hover:text-[#3594bd] transition-colors mb-2 line-clamp-2">
                    {other.title}
                  </h4>
                  <p className="text-xs text-gray-400 font-light line-clamp-2 leading-relaxed">
                    {other.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

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
    </article>
  );
}
