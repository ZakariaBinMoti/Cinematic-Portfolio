import { MetadataRoute } from "next";
import { FALLBACK_POSTS, getAllPostSlugs } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hellozakaria.com";
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  try {
    const blogSlugs = await getAllPostSlugs("blog");
    const caseStudySlugs = await getAllPostSlugs("case-study");

    const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    const caseStudyRoutes: MetadataRoute.Sitemap = caseStudySlugs.map((slug) => ({
      url: `${baseUrl}/case-studies/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.85,
    }));

    return [...staticRoutes, ...caseStudyRoutes, ...blogRoutes];
  } catch (error) {
    // Safe fallback to static curated slugs
    const fallbackRoutes: MetadataRoute.Sitemap = FALLBACK_POSTS.map((post) => ({
      url: `${baseUrl}/${post.type === "case-study" ? "case-studies" : "blog"}/${post.slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...fallbackRoutes];
  }
}
