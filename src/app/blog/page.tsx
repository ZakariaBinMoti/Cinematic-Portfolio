import { Metadata } from "next";
import { getPosts } from "@/lib/posts";
import BlogCatalog from "@/components/BlogCatalog";

export const revalidate = 60; // ISR cache revalidation every minute

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hellozakaria.com";

export const metadata: Metadata = {
  title: "Technical Writing & Architecture Insights",
  description:
    "Engineering essays and architectural breakdowns on Shopify OS 2.0, Liquid performance tuning, Core Web Vitals optimization, and headless Next.js by Zakaria Bin Moti.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Technical Writing & Architecture Insights | Zakaria Bin Moti",
    description:
      "Engineering essays and architectural breakdowns on Shopify OS 2.0, Liquid performance, Core Web Vitals, and headless Next.js.",
    url: `${siteUrl}/blog`,
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await getPosts({ type: "blog" });

  const blogListJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Zakaria Bin Moti — Technical Writing & Engineering Blog",
    description:
      "Articles and architectural insights on high-performance eCommerce, Shopify development, and modern web systems.",
    url: `${siteUrl}/blog`,
    author: {
      "@type": "Person",
      name: "Zakaria Bin Moti",
      url: siteUrl,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      image: post.coverImage || undefined,
      author: {
        "@type": "Person",
        name: post.authorName || "Zakaria Bin Moti",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd) }}
      />
      <BlogCatalog posts={posts} />
    </>
  );
}
