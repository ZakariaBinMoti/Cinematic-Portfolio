import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hellozakaria.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zakaria Bin Moti | Lead Software Engineer & Shopify Architect",
    template: "%s | Zakaria Bin Moti",
  },
  description:
    "Zakaria Bin Moti — Lead Software Engineer and Shopify Architect crafting high-converting eCommerce stores, custom Next.js web applications, and scalable frontend architectures. Over 250+ production stores delivered globally.",
  applicationName: "Zakaria Bin Moti Portfolio",
  authors: [{ name: "Zakaria Bin Moti", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "Zakaria Bin Moti",
    "Shopify Developer",
    "Shopify Architect",
    "Shopify Expert",
    "eCommerce Architect",
    "Full Stack Engineer",
    "Next.js Developer",
    "React Engineer",
    "Headless Shopify",
    "Liquid Developer",
    "Custom Shopify Theme Development",
    "Web Performance Optimization",
    "Conversion Rate Optimization",
    "Frontend Engineer Portfolio",
  ],
  creator: "Zakaria Bin Moti",
  publisher: "Zakaria Bin Moti",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Zakaria Bin Moti | Lead Software Engineer & Shopify Architect",
    description:
      "Crafting high-converting eCommerce stores, custom Next.js web applications, and scalable frontend architectures. 250+ production stores delivered globally.",
    siteName: "Zakaria Bin Moti Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Zakaria Bin Moti — Lead Software Engineer & Shopify Architect",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zakaria Bin Moti | Lead Software Engineer & Shopify Architect",
    description:
      "Crafting high-converting eCommerce stores, custom Next.js web applications, and scalable frontend architectures. 250+ production stores delivered globally.",
    images: ["/og-image.png"],
    creator: "@zakariabinmoti",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: "Zakaria Bin Moti",
        jobTitle: "Lead Software Engineer & Shopify Architect",
        url: siteUrl,
        image: `${siteUrl}/icon.png`,
        email: "mailto:zakaria.binmoti@gmail.com",
        sameAs: [
          "https://www.linkedin.com/in/zakariabinmoti",
          "https://github.com/ZakariaBinMoti",
        ],
        description:
          "Lead Software Engineer and Shopify Architect specializing in high-performance eCommerce development, modern frontend systems, and scalable digital architectures with 250+ delivered stores.",
        knowsAbout: [
          "Shopify Development",
          "Liquid",
          "eCommerce Architecture",
          "Next.js",
          "React",
          "TypeScript",
          "Headless Commerce",
          "Tailwind CSS",
          "Full-Stack Development",
          "Conversion Rate Optimization",
          "Web Performance Optimization",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Zakaria Bin Moti Portfolio",
        description:
          "The official engineering portfolio and project showcase of Zakaria Bin Moti, Lead Software Engineer and Shopify Architect.",
        publisher: {
          "@id": `${siteUrl}/#person`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: "Zakaria Bin Moti | Lead Software Engineer & Shopify Architect",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: {
          "@id": `${siteUrl}/#person`,
        },
        mainEntity: {
          "@id": `${siteUrl}/#person`,
        },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-[#121212] text-white`}>
        {children}
      </body>
    </html>
  );
}
