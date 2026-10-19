import dbConnect from "@/lib/mongodb";
import Post, { IPost } from "@/models/Post";

export interface PostItem {
  _id?: string;
  title: string;
  slug: string;
  type: "blog" | "case-study";
  summary: string;
  content: string;
  coverImage?: string;
  tags: string[];
  category: string;
  publishedAt: string | Date;
  isPublished: boolean;
  readingTime?: string;
  authorName?: string;
  authorRole?: string;
  clientName?: string;
  clientUrl?: string;
  projectYear?: string;
  services?: string[];
  metrics?: { label: string; value: string }[];
  order?: number;
}

// Built-in curated initial case studies & blog articles
export const FALLBACK_POSTS: PostItem[] = [
  // ==================== CASE STUDIES ====================
  {
    title: "Beccas Bags: Engineering a Custom Luxury Consignment & Rental Engine on Shopify OS 2.0",
    slug: "beccas-bags-luxury-consignment-rental-shopify",
    type: "case-study",
    summary:
      "How we built a bespoke luxury product leasing and rental infrastructure directly into Shopify OS 2.0 without expensive app bloat, lifting mobile conversions by 42%.",
    coverImage:
      "https://res.cloudinary.com/daysiptql/image/upload/v1791886933/portfolio/beccasbags_multidevice_showcase_1791886923922.png",
    category: "Fashion & Luxury",
    tags: ["Shopify OS 2.0", "Liquid", "Custom Metafields", "CRO", "Luxury eCommerce"],
    publishedAt: "2025-08-15T00:00:00.000Z",
    isPublished: true,
    readingTime: "6 min read",
    authorName: "Zakaria Bin Moti",
    authorRole: "Lead Software Engineer & Shopify Architect",
    clientName: "Beccas Bags",
    clientUrl: "https://beccasbags.ca",
    projectYear: "2025",
    services: [
      "Custom Shopify OS 2.0 Theme Architecture",
      "Dynamic Rental & Consignment Booking Flow",
      "Shopify Metafields & Metaobject Schema Design",
      "Mobile Core Web Vitals Optimization",
    ],
    metrics: [
      { label: "Mobile Conversion Lift", value: "+42%" },
      { label: "Largest Contentful Paint (LCP)", value: "0.74s" },
      { label: "App Subscription Overhead Reduced", value: "$180/mo" },
      { label: "Lighthouse Performance Score", value: "98/100" },
    ],
    content: `
## Executive Summary

**Beccas Bags** is one of Canada's premier authentic luxury consignment retailers, dealing with high-ticket designer handbags and accessories (Chanel, Hermès, Louis Vuitton). 

The brand faced a critical business hurdle: their existing Shopify theme could only handle traditional one-time retail sales. To launch their high-margin **luxury rental program**, third-party apps were quoting hefty recurring subscriptions, slowing down store load times with heavy JavaScript payloads, and breaking the boutique brand aesthetic.

We engineered a **native, lightweight rental and consignment inquiry engine** directly inside Shopify OS 2.0 using modular Liquid schemas and native Shopify Metafields.

---

## The Challenge

1. **Third-Party App Bloat:** Pre-existing rental applications injected 400KB+ of uncompressed client-side scripts, tanking mobile Lighthouse scores to 41/100.
2. **Dynamic Product State:** Bags required flexible toggles between *Buy Now*, *Reserve for Rental*, or *Submit Consignment Inquiry* based on availability.
3. **High-Ticket Trust:** Customers spending upwards of $3,000+ require an immaculate, Apple-grade interface with zero layout shift (CLS).

---

## Technical Architecture & Implementation

\`\`\`
Client Browser
      │
      ▼
Shopify CDN (Edge Cached)
      │
      ├── Liquid Theme Engine (Zero Client-Side JS Execution for Rendering)
      │      ├── Custom Product Template (templates/product.luxury-rental.json)
      │      ├── Dynamic Availability Schema (snippets/rental-calendar.liquid)
      │      └── Custom Drawer Metafields (metafields.custom.rental_terms)
      │
      ▼
Shopify Storefront Ajax API (Instant Cart Mutation & Dynamic Price Allocation)
\`\`\`

### 1. Custom Liquid Schemas & Zero-Dependency Logic
Instead of external widgets, we coded bespoke Liquid schemas that compute rental security deposits, rental terms, and dynamic availability directly during server-side Liquid execution:

\`\`\`liquid
{% comment %} Native Rental Toggle Architecture {% endcomment %}
{% assign is_rental_available = product.metafields.custom.rental_enabled.value %}
{% assign security_deposit = product.metafields.custom.security_deposit.value | default: 50000 %}

{% if is_rental_available %}
  <div class="luxury-rental-selector" data-product-id="{{ product.id }}">
    <div class="rental-pricing-row">
      <span class="label">Rental Period:</span>
      <span class="rate">{{ product.price | money }} / 7 Days</span>
    </div>
    <p class="deposit-notice">Refundable security deposit: {{ security_deposit | money }}</p>
  </div>
{% endif %}
\`\`\`

### 2. Eliminating Layout Shift (CLS)
By enforcing fixed aspect-ratio image containers in Tailwind CSS and pre-allocating dimension boxes for high-resolution product photography, we reduced Cumulative Layout Shift (CLS) to a pristine **0.002**.

---

## Results & Commercial Impact

* **+42% Surge in Mobile Conversions:** Eliminating friction on mobile checkout generated an immediate lift in checkout completions.
* **0.74s LCP:** Achieved sub-second paint on 4G cellular connections across North America.
* **$0 Third-Party App Subscriptions:** Saved the client over $2,000 annually in SaaS app fees by keeping functionality 100% native.
    `,
  },
  {
    title: "Organic Wonders UK: High-Performance Superfood Storefront & Core Web Vitals Overhaul",
    slug: "organic-wonders-uk-superfood-cro-optimization",
    type: "case-study",
    summary:
      "Transforming an organic superfood brand into a blistering 96/100 performance powerhouse with custom subscription funnels and nutritional breakdown components.",
    coverImage:
      "https://res.cloudinary.com/daysiptql/image/upload/v1791888348/portfolio/organicwonders_multidevice_showcase_1791888345076.png",
    category: "Health & Wellness",
    tags: ["Shopify OS 2.0", "Core Web Vitals", "Liquid Optimization", "CRO", "Subscription Architecture"],
    publishedAt: "2025-07-20T00:00:00.000Z",
    isPublished: true,
    readingTime: "5 min read",
    authorName: "Zakaria Bin Moti",
    authorRole: "Lead Software Engineer & Shopify Architect",
    clientName: "Organic Wonders",
    clientUrl: "https://organicwonders.co.uk",
    projectYear: "2025",
    services: [
      "Core Web Vitals Remediation & Asset Purging",
      "Custom Modular Product Detail Page (PDP)",
      "High-Converting Nutritional Fact Accordions",
      "ReCharge / Native Subscription UI Integration",
    ],
    metrics: [
      { label: "Checkout Completion", value: "+35%" },
      { label: "Mobile Speed Score", value: "96 / 100" },
      { label: "JavaScript Payload Reduced", value: "-58%" },
      { label: "Bounce Rate", value: "-24%" },
    ],
    content: `
## Background

**Organic Wonders UK** sells certified organic superfoods, medicinal mushroom powders, and wellness supplements. In health and wellness eCommerce, trust and technical transparency are paramount.

The existing store suffered from severe script fatigue: previous developers had installed 14 conflicting apps for reviews, tabs, trust badges, and popups. The page weighed over 4.8MB on initial load, taking over 4.2 seconds to become interactive.

---

## Engineering Strategy

1. **Asset Purge & Native Consolidation:** Removed 8 redundant apps. Re-architected tabbed nutritional accordions, verified lab certifications, and bundle selectors as pure Liquid + Vanilla CSS.
2. **Next-Gen Asset Pipeline:** Re-routed imagery through responsive \`srcset\` pipelines, ensuring mobile devices never download 2000px desktop assets.
3. **Zero-Render-Blocking Execution:** Deferred all non-essential third-party analytics behind user interaction triggers.

---

## Architectural Results

* **Lighthouse Mobile Score surged from 38 to 96.**
* **First Input Delay (FID) dropped to < 18ms**, delivering native app-like responsiveness.
* **35% increase in completed checkouts** driven by instant add-to-cart feedback and seamless slide-out drawer mechanics.
    `,
  },
  {
    title: "K-Zone Studio: Scalable Global Lifestyle eCommerce from Figma to Production",
    slug: "k-zone-studio-global-lifestyle-ecommerce",
    type: "case-study",
    summary:
      "Turning precision Figma designs into 25+ reusable Liquid sections with multi-currency checkout, dynamic mega-menus, and global localized shipping rules.",
    coverImage:
      "https://res.cloudinary.com/daysiptql/image/upload/v1791715009/portfolio/fmpk3tlnv5ncrpf92obn.jpg",
    category: "Tech & Lifestyle",
    tags: ["Figma to Shopify", "Custom Liquid Sections", "Multi-Currency", "Responsive UI", "Global CDN"],
    publishedAt: "2025-06-10T00:00:00.000Z",
    isPublished: true,
    readingTime: "5 min read",
    authorName: "Zakaria Bin Moti",
    authorRole: "Lead Software Engineer & Shopify Architect",
    clientName: "K-Zone Studio",
    clientUrl: "https://kzonestudio.com",
    projectYear: "2025",
    services: [
      "Full Figma to Custom Liquid Implementation",
      "25+ Custom Drag-and-Drop Theme Customizer Sections",
      "Shopify Markets Multi-Currency Architecture",
      "Interactive Product Filtering Engine",
    ],
    metrics: [
      { label: "Custom Theme Sections", value: "25+" },
      { label: "Global Speed Index", value: "0.9s" },
      { label: "International Orders Lift", value: "+28%" },
    ],
    content: `
## The Vision

K-Zone Studio needed an editorial, boutique eCommerce storefront that represented their global contemporary lifestyle brand. The design required pixel-perfect translation from complex Figma mockups into fully editable Shopify OS 2.0 sections that non-technical marketers could customize without touching code.

---

## Solution Delivered

* **Modular Section Engine:** Engineered 25+ unique Liquid sections with extensive JSON schema settings for color palettes, typography scaling, image positioning, and layout switches.
* **Shopify Markets Localization:** Seamless automatic currency conversion, localized checkout experiences, and duty calculation across the US, UK, and EU.
* **Instant Filter Engine:** Filter by size, collection, and price bracket using modern URL search parameter hydration with zero page reloads.
    `,
  },

  // ==================== BLOG POSTS ====================
  {
    title: "Why Most Shopify Stores Are Slow: Fixing Liquid Bottlenecks & Asset Bloat in 2026",
    slug: "why-most-shopify-stores-are-slow-fixing-liquid-bottlenecks",
    type: "blog",
    summary:
      "A deep engineering breakdown of how unoptimized Liquid loops, nested queries, and third-party script fatigue destroy store conversion rates—and how to fix them.",
    coverImage:
      "https://res.cloudinary.com/daysiptql/image/upload/v1791885031/portfolio/swellsport_multidevice_showcase_1791885029017.png",
    category: "Shopify & Liquid",
    tags: ["Shopify Performance", "Liquid Optimization", "Core Web Vitals", "Web Architecture"],
    publishedAt: "2026-02-14T00:00:00.000Z",
    isPublished: true,
    readingTime: "6 min read",
    authorName: "Zakaria Bin Moti",
    authorRole: "Lead Software Engineer & Shopify Architect",
    content: `
Every second of delay on an eCommerce checkout causes a **7% drop in conversions**. For a Shopify store doing $100,000 a month, a 1-second slowdown is literally costing $7,000 every single month.

Yet over 85% of Shopify storefronts score below 50 on mobile Google Lighthouse audits. 

Having audited and engineered over 250+ production Shopify storefronts, here are the real architectural causes of slow stores—and how we fix them.

---

## 1. The Deadly "Loop in Loop" Liquid Mistake

Liquid is an interpreted server-side template language running on Shopify's servers. While Liquid is fast, developers frequently write $O(n^2)$ loops without realizing it:

\`\`\`liquid
{% comment %} ❌ BAD: Nested loop over collections inside every product {% endcomment %}
{% for product in collection.products %}
  {% for tag in product.tags %}
    {% for collection in collections %}
      {% if collection.title contains tag %}
        <span>{{ collection.title }}</span>
      {% endif %}
    {% endfor %}
  {% endfor %}
{% endfor %}
\`\`\`

If a collection has 50 products, and each has 10 tags, and the store has 30 collections: that is **15,000 iterations computed on every page render**! This causes the server response time (Time To First Byte / TTFB) to spike over 1.5 seconds.

### The Fix: Linear Key Lookups with Metafields
Pre-index relationships using native **Shopify Metafields** or map them linearly before rendering.

---

## 2. App Script Fatigue: The Silent Conversion Killer

The biggest performance bottleneck on Shopify is almost never theme code—it's **third-party apps**.

Every time a merchant installs an app for reviews, popups, currency exchange, or live chat, that app injects tracking scripts:
* Multiple versions of jQuery
* Massive analytics beacons running before the page is even readable
* Render-blocking CSS files

### How We Fix It: The "Native-First" Philosophy
Before installing an app, ask: *Can this be built in 40 lines of Liquid and Vanilla JavaScript?* 
In 9 out of 10 cases, features like countdown timers, accordions, product recommendations, and free-shipping bars can be built **100% native** into the theme with zero external network requests.

---

## 3. Responsive Images: Don't Serve 4K Desktop Photos to Mobile Phones

Modern mobile screens do not need a 2400px wide banner image. Serving a 3MB JPEG over 4G mobile data destroys the **Largest Contentful Paint (LCP)** metric.

Always use Shopify's native \`image_tag\` helper with descriptive sizes:

\`\`\`liquid
{{ product.featured_image | image_url: width: 800 | image_tag: 
  loading: 'lazy', 
  widths: '360, 540, 720, 900, 1200', 
  sizes: '(max-width: 768px) 100vw, 50vw',
  alt: product.title | escape 
}}
\`\`\`

---

## Conclusion

High-converting eCommerce engineering is about **subtraction, not addition**. By pruning third-party script bloat, optimizing server-side Liquid logic, and serving modern responsive assets, any Shopify store can achieve **sub-second load times** and dramatic conversion gains.
    `,
  },
  {
    title: "The Rise of AI in eCommerce: How Modern Shopify Developers Build Smarter Digital Flagships",
    slug: "rise-of-ai-in-ecommerce-modern-shopify-development",
    type: "blog",
    summary:
      "Beyond generic chatbots: practical ways modern software engineers leverage AI for automated catalog enrichment, real-time visual search, and predictive personalized merchandising.",
    coverImage:
      "https://res.cloudinary.com/daysiptql/image/upload/v1791874100/portfolio/suitshark_multidevice_showcase_1791874098661.png",
    category: "AI & Automation",
    tags: ["AI in Commerce", "Shopify API", "Automation", "Future of Web"],
    publishedAt: "2026-03-01T00:00:00.000Z",
    isPublished: true,
    readingTime: "5 min read",
    authorName: "Zakaria Bin Moti",
    authorRole: "Lead Software Engineer & Shopify Architect",
    content: `
In 2026, artificial intelligence in eCommerce has matured far beyond basic customer support chatbots.

For forward-thinking Shopify merchants and developers, AI is now an integrated infrastructure layer that transforms inventory management, search discovery, and personalized conversion funnels.

Here is how modern software engineers are integrating AI into high-volume Shopify stores.

---

## 1. Automated Semantic Catalog Enrichment

Traditional Shopify search relies on literal keyword matching. If a customer searches for *"warm outfit for winter cocktail party"*, standard keyword search fails unless those exact words appear in the product title.

Using vector embeddings and vector databases (like Pinecone or pgvector) connected via Shopify Webhooks:
1. When a new product is published in Shopify Admin, a webhook triggers a background serverless worker.
2. An LLM analyzes product imagery and descriptions to generate dense semantic vector tags (e.g. style, silhouette, weather suitability, occasion).
3. The store's search interface can now resolve abstract, natural language queries into exact product matches.

---

## 2. Dynamic Merchandising & Predictive Upsells

Static "You May Also Like" grids are obsolete. By integrating lightweight client-side behavior scoring with edge inference:
* Returning shoppers are presented with dynamic hero banners tailored to their previous browsing cadence.
* Cart drawers calculate real-time bundle recommendations based on live stock velocity rather than rigid manual rules.

---

## 3. High-Fidelity Multi-Device Asset Automation

Generating responsive, professional multi-device mockups and marketing assets used to take creative teams weeks in Photoshop. Today, automated rendering pipelines (leveraging headless browser automation and Cloudinary image APIs) allow eCommerce brands to generate hundreds of promotional banners and social collateral programmatically.

---

## Key Takeaway for Merchants

AI shouldn't replace your brand identity—it should eliminate operational friction and make the shopping experience feel effortlessly intuitive for every customer.
    `,
  },
  {
    title: "Headless Commerce vs. Shopify Liquid OS 2.0: An Architect’s Honest Decision Matrix",
    slug: "headless-commerce-vs-shopify-liquid-architect-decision-matrix",
    type: "blog",
    summary:
      "When does a brand actually need a Next.js headless storefront, and when is native Shopify Liquid the faster, more profitable choice? A realistic breakdown without the tech hype.",
    coverImage:
      "https://res.cloudinary.com/daysiptql/image/upload/v1791886933/portfolio/beccasbags_multidevice_showcase_1791886923922.png",
    category: "Full-Stack & Next.js",
    tags: ["Headless Commerce", "Next.js", "Shopify Storefront API", "Architecture"],
    publishedAt: "2026-01-20T00:00:00.000Z",
    isPublished: true,
    readingTime: "7 min read",
    authorName: "Zakaria Bin Moti",
    authorRole: "Lead Software Engineer & Shopify Architect",
    content: `
"Should we go Headless?" is one of the most common questions 7-figure brand founders ask engineering leads.

Many agencies promote headless commerce (Next.js / Hydrogen frontend + Shopify backend) because it represents massive development billings. But as a pragmatic software architect, the honest answer is: **most brands do not need headless commerce.**

Here is the objective engineering decision matrix I use when advising clients.

---

## The Comparison Matrix

| Criteria | Shopify Liquid (OS 2.0) | Headless (Next.js + Shopify Storefront API) |
| :--- | :--- | :--- |
| **Initial Build Cost** | Moderate ($3k – $15k) | High ($20k – $80k+) |
| **Time to Market** | 2 to 4 weeks | 2 to 4 months |
| **Non-Technical Team Control** | High (Visual Theme Customizer) | Low (Requires CMS like Sanity/Contentful) |
| **App Compatibility** | 100% plug-and-play with Shopify App Store | Custom API integrations required for every app |
| **Maximum UI Flexibility** | High (within DOM constraints) | Unlimited (Complete React/WebGL freedom) |
| **Multi-Channel / Native Apps** | Web only | Shared API for iOS, Android, POS, & Web |

---

## When to Choose Native Shopify Liquid OS 2.0

Choose native Liquid if:
1. **Your team relies on the visual theme editor:** Marketers need to drag, drop, and rearrange homepage banners without filing developer tickets.
2. **You rely heavily on Shopify App Store apps:** Customer loyalty, reviews, bundle apps, and subscriptions work out-of-the-box.
3. **Speed to market is essential:** With modern OS 2.0 architecture and clean Liquid coding, you can achieve **95+ Google Lighthouse scores** on native themes without the complexity of a headless stack.

---

## When to Go Headless with Next.js

Choose headless architecture if:
1. **You have complex digital experiences:** You are building 3D product configurators, immersive interactive storytelling, or bespoke SaaS-like subscriber portals that standard Liquid cannot handle.
2. **True Omnichannel Platforms:** You are powering a unified commerce backend across a native iOS app, physical POS kiosks, and web storefront simultaneously.
3. **Dedicated In-House Engineering Team:** You have ongoing engineering resources to maintain hosting infrastructure (Vercel/AWS), CMS schemas, and API versions.

---

## Conclusion

Great software engineering is not about using the newest, most complex stack. It is about **choosing the highest-leverage tool that drives the greatest business profit with the lowest maintenance burden.**
    `,
  },
];

// Helper to query posts with MongoDB fallback to static curated data
export async function getPosts(options: {
  type?: "blog" | "case-study";
  category?: string;
  tag?: string;
  limit?: number;
}): Promise<PostItem[]> {
  try {
    await dbConnect();
    const query: any = { isPublished: { $ne: false } };
    if (options.type) query.type = options.type;
    if (options.category && options.category !== "All") query.category = options.category;
    if (options.tag) query.tags = options.tag;

    let dbQuery = Post.find(query).sort({ publishedAt: -1, order: 1 });
    if (options.limit) dbQuery = dbQuery.limit(options.limit);

    const dbPosts = await dbQuery.lean();

    if (dbPosts && dbPosts.length > 0) {
      return JSON.parse(JSON.stringify(dbPosts));
    }
  } catch (error) {
    console.warn("MongoDB fetch for posts failed, using fallback curated posts:", error);
  }

  // Filter fallback posts
  let filtered = FALLBACK_POSTS.filter((p) => p.isPublished !== false);
  if (options.type) filtered = filtered.filter((p) => p.type === options.type);
  if (options.category && options.category !== "All") {
    filtered = filtered.filter((p) => p.category === options.category);
  }
  if (options.tag) {
    filtered = filtered.filter((p) => p.tags.includes(options.tag!));
  }
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getPostBySlug(slug: string, type?: "blog" | "case-study"): Promise<PostItem | null> {
  try {
    await dbConnect();
    const query: any = { slug, isPublished: { $ne: false } };
    if (type) query.type = type;

    const dbPost = await Post.findOne(query).lean();
    if (dbPost) {
      return JSON.parse(JSON.stringify(dbPost));
    }
  } catch (error) {
    console.warn("MongoDB fetch for post by slug failed, checking fallback:", error);
  }

  const fallback = FALLBACK_POSTS.find(
    (p) => p.slug === slug && (!type || p.type === type) && p.isPublished !== false
  );
  return fallback || null;
}

export async function getAllPostSlugs(type?: "blog" | "case-study"): Promise<string[]> {
  try {
    await dbConnect();
    const query: any = { isPublished: { $ne: false } };
    if (type) query.type = type;

    const slugs = await Post.find(query).distinct("slug");
    if (slugs && slugs.length > 0) return slugs;
  } catch {
    // fallback
  }

  return FALLBACK_POSTS.filter((p) => !type || p.type === type).map((p) => p.slug);
}
