import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zakaria Bin Moti | Lead Software Engineer & Shopify Architect",
    short_name: "Zakaria",
    description:
      "High-performance Shopify development, custom Next.js web applications, and eCommerce engineering portfolio of Zakaria Bin Moti.",
    start_url: "/",
    display: "standalone",
    background_color: "#080a10",
    theme_color: "#080a10",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
  };
}
