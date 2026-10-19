import { Metadata } from "next";
import { getPosts } from "@/lib/posts";
import CaseStudiesCatalog from "@/components/CaseStudiesCatalog";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hellozakaria.com";

export const metadata: Metadata = {
  title: "Commercial Case Studies & Architectural Deep Dives",
  description:
    "Explore real-world case studies of custom Shopify OS 2.0 themes, conversion rate optimizations, and high-performance eCommerce platforms built by Zakaria Bin Moti.",
  alternates: {
    canonical: "/case-studies",
  },
  openGraph: {
    title: "Commercial Case Studies & Technical Proof | Zakaria Bin Moti",
    description:
      "Explore real-world case studies of custom Shopify OS 2.0 themes, CRO, and high-performance eCommerce platforms.",
    url: `${siteUrl}/case-studies`,
    type: "website",
  },
};

export default async function CaseStudiesPage() {
  const caseStudies = await getPosts({ type: "case-study" });

  const caseStudiesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "eCommerce Engineering Case Studies by Zakaria Bin Moti",
    description:
      "Detailed architectural analyses and business impact metrics for commercial Shopify and eCommerce client projects.",
    url: `${siteUrl}/case-studies`,
    itemListElement: caseStudies.map((study, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Article",
        name: study.title,
        headline: study.title,
        description: study.summary,
        url: `${siteUrl}/case-studies/${study.slug}`,
        image: study.coverImage || undefined,
        author: {
          "@type": "Person",
          name: study.authorName || "Zakaria Bin Moti",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudiesJsonLd) }}
      />
      <CaseStudiesCatalog caseStudies={caseStudies} />
    </>
  );
}
