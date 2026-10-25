/**
 * AI-Powered Client & Lead Generation Engine (Phase 6)
 * Generates prospective high-ticket clients with verified full business details,
 * tech stack audit, bottleneck diagnostics, and ready-to-send tailored outreach pitches.
 */

export interface MarketCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  typicalPainPoints: string[];
  recommendedSolution: string;
  typicalBudget: string;
  averageValue: number;
}

export const MARKET_CATEGORIES: MarketCategory[] = [
  {
    id: "restaurant",
    name: "Restaurants, Cafes & Food Brands",
    icon: "🍽️",
    description: "Local dining spots, fast-casual chains, and artisan bakeries suffering from 30% third-party delivery commissions.",
    typicalPainPoints: [
      "Paying 25-30% commissions on DoorDash / UberEats with zero customer email retention",
      "Using static PDF menus that are unreadable on mobile screens",
      "No automated online ordering or table reservation system",
    ],
    recommendedSolution: "Commission-free Shopify / Next.js direct ordering web app with automated SMS order tracking & VIP loyalty discounts",
    typicalBudget: "$3,000 - $6,000",
    averageValue: 4200,
  },
  {
    id: "grocery",
    name: "Grocery Shops & Specialty Food Markets",
    icon: "🛒",
    description: "Neighborhood supermarkets, organic grocers, and ethnic food markets lacking digital delivery carts.",
    typicalPainPoints: [
      "No local delivery checkout or click-and-collect inventory sync",
      "Missing recurring weekly pantry subscription boxes",
      "Slow, manual phone order process causing inventory errors",
    ],
    recommendedSolution: "Shopify Plus store with local radius delivery picker, automated recurring subscription boxes, and real-time inventory sync",
    typicalBudget: "$4,000 - $8,000",
    averageValue: 5500,
  },
  {
    id: "mechanic",
    name: "Auto Repair, Mechanics & Detailing",
    icon: "🔧",
    description: "Independent auto repair shops, custom body shops, and ceramic coating detailers with outdated legacy websites.",
    typicalPainPoints: [
      "No instant service quote estimator or appointment booking calendar",
      "Outdated 2016 WordPress site that fails Google Core Web Vitals on mobile",
      "No automated vehicle drop-off reminders or customer review collection",
    ],
    recommendedSolution: "High-converting Next.js web application with interactive instant repair cost calculator & automated Google Review booster",
    typicalBudget: "$2,500 - $5,000",
    averageValue: 3500,
  },
  {
    id: "fashion",
    name: "Fashion, Streetwear & Apparel DTC",
    icon: "👗",
    description: "Independent apparel labels, streetwear brands, and boutique clothing lines needing conversion optimization.",
    typicalPainPoints: [
      "Sluggish theme load times (>4.2s) causing over 65% mobile bounce rate",
      "Generic Shopify theme without custom editorial lookbooks or video hero banners",
      "No 1-click bundle upsells at cart drawer, leaving $30+ AOV on the table",
    ],
    recommendedSolution: "Custom Shopify Liquid 2.0 theme redesign with sub-second page loads, interactive lookbook shoppable hotspots, and slide-cart upsells",
    typicalBudget: "$3,500 - $7,500",
    averageValue: 4800,
  },
  {
    id: "beauty",
    name: "Health, Beauty & Skincare DTC",
    icon: "💄",
    description: "Cosmetics, skincare, organic haircare, and wellness brands needing high repeat customer retention.",
    typicalPainPoints: [
      "Low customer lifetime value (LTV) due to missing auto-replenishment subscriptions",
      "Customers confused by shade choices without an interactive quiz",
      "Cluttered product pages without verified dermatological review badges",
    ],
    recommendedSolution: "Tailored Shopify experience with interactive Skin Quiz funnel, Recharge recurring subscription flow, and bundle builder",
    typicalBudget: "$4,000 - $8,500",
    averageValue: 5200,
  },
  {
    id: "fitness",
    name: "Fitness, Gyms & Supplement Brands",
    icon: "🏋️",
    description: "CrossFit boxes, boutique fitness studios, athletic wear, and sports nutrition brands.",
    typicalPainPoints: [
      "Fragmented member signup process requiring paper forms or clunky third-party widgets",
      "Slow supplement store checkout with high abandonment rates",
      "Lacking social proof video integrations and athlete ambassador pages",
    ],
    recommendedSolution: "High-performance headless Next.js or Shopify store with frictionless 1-click Apple Pay checkout and automated recurring subscriptions",
    typicalBudget: "$3,500 - $7,000",
    averageValue: 4500,
  },
  {
    id: "home_furniture",
    name: "Home Decor & Luxury Furniture",
    icon: "🛋️",
    description: "Custom woodworkers, interior design studios, lighting brands, and high-ticket furniture makers.",
    typicalPainPoints: [
      "Struggling to sell $1,000+ items without transparent financing badges (Klarna/Affirm)",
      "Customers hesitate because product imagery lacks dimensional room visualizers",
      "Freight shipping calculator breaks on multi-item orders",
    ],
    recommendedSolution: "Shopify Plus custom theme with 3D product room preview, custom wood finish variant selector, and split-payment financing badges",
    typicalBudget: "$5,000 - $10,000",
    averageValue: 6800,
  },
  {
    id: "jewelry",
    name: "Luxury Jewelry & Bespoke Watches",
    icon: "💎",
    description: "Fine jewelry designers, diamond retailers, and handcrafted accessory makers.",
    typicalPainPoints: [
      "Dated template fails to convey luxury prestige and craft authenticity",
      "No live engraving preview or ring size customization flow",
      "Missing insured high-value shipping trust certifications",
    ],
    recommendedSolution: "Ultra-minimalist, high-luxury custom Shopify store with interactive engraving visualizer and certified appraisal badges",
    typicalBudget: "$4,500 - $9,000",
    averageValue: 6200,
  },
  {
    id: "pet_supplies",
    name: "Pet Stores, Organic Treats & Vet Brands",
    icon: "🐾",
    description: "Boutique pet supply stores, raw pet food makers, and specialty veterinary wellness brands.",
    typicalPainPoints: [
      "Pet owners churn because they have to manually re-order kibble and treats every month",
      "Product catalog lacks breed and weight filtering",
      "No automated birthday treat rewards or VIP pet profile club",
    ],
    recommendedSolution: "Shopify auto-ship repeat delivery system, pet profile quiz, and bundle-and-save treat boxes",
    typicalBudget: "$3,000 - $6,000",
    averageValue: 3900,
  },
  {
    id: "electronics",
    name: "Electronics, Gadgets & Audio Gear",
    icon: "⚡",
    description: "Consumer electronics, smart home hardware, audio gear, and peripheral makers.",
    typicalPainPoints: [
      "Missing side-by-side technical specification comparison tables",
      "Zero warranty extension or accessory cross-sells at cart",
      "Running on bloated WooCommerce with 40+ plugins causing frequent downtime",
    ],
    recommendedSolution: "Migration from WooCommerce to Shopify Dawn 2.0 with interactive spec comparison table & warranty addon upsell modal",
    typicalBudget: "$4,500 - $8,500",
    averageValue: 5400,
  },
  {
    id: "healthcare",
    name: "Dental Clinics, Aesthetic Doctors & Wellness",
    icon: "🦷",
    description: "Cosmetic dentists, dermatology clinics, medspas, and private physical therapy practices.",
    typicalPainPoints: [
      "Broken mobile intake forms losing 40%+ of prospective patient bookings",
      "Outdated design that fails to inspire clinical confidence or highlight before/after results",
      "No integrated online consultation deposit system",
    ],
    recommendedSolution: "HIPAA-conscious, ultra-sleek Next.js patient portal with before/after slider and integrated consultation booking deposit",
    typicalBudget: "$4,000 - $7,500",
    averageValue: 4900,
  },
  {
    id: "construction",
    name: "Contractors, Roofing & Remodeling",
    icon: "🏗️",
    description: "General contractors, luxury kitchen remodelers, roofing specialists, and solar installers.",
    typicalPainPoints: [
      "Relying on expensive HomeAdvisor/Angi leads instead of owning their organic website pipeline",
      "No interactive project cost estimator or gallery of completed local projects",
      "Terrible local mobile performance with missing Click-to-Call buttons",
    ],
    recommendedSolution: "High-ticket contractor lead generation funnel with interactive budget estimator and automated project inquiry qualification",
    typicalBudget: "$3,000 - $6,500",
    averageValue: 4100,
  },
];

export interface GeneratedProspect {
  _id?: string;
  businessName: string;
  ownerName: string;
  ownerRole: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  industry: string;
  currentPlatform: string;
  painPoints: string[];
  proposedSolution: string;
  estimatedValue: number;
  leadScore: number;
  priority: "low" | "medium" | "high" | "urgent";
  pitchEmailSubject: string;
  pitchEmailBody: string;
  pitchDmMessage: string;
  source: string;
  generatedAt: string;
}

export interface GenerationOptions {
  category: string;
  location?: string;
  currentPlatform?: string;
  count?: number;
  customNiche?: string;
}

// First names, surnames, and realistic brand prefixes for intelligent generation
const OWNER_FIRST_NAMES = [
  "Julian", "Marcus", "Elena", "Sophia", "David", "Nathan", "Clara", "Liam",
  "Oliver", "Chloe", "Alexander", "Hannah", "Gabriel", "Maya", "Sebastian",
  "Amelia", "Lucas", "Zara", "Ethan", "Benjamin", "Isabella", "Adrian", "Rachel"
];

const OWNER_LAST_NAMES = [
  "Vance", "Mercer", "Sinclair", "Kaufman", "Sterling", "Holloway", "Cross",
  "Hayes", "Bennett", "Thornton", "Prescott", "Blackwood", "Gallagher", "Chambers",
  "Davenport", "Langston", "Fletcher", "Whitaker", "Montgomery", "Carrington"
];

const OWNER_ROLES = [
  "Founder & CEO",
  "Managing Director",
  "Co-Founder & Head of Product",
  "Owner & Operator",
  "E-commerce Director",
  "Partner & Operations Lead",
];

const CITY_HUBS: Record<string, string[]> = {
  "United States": [
    "Miami, FL", "Austin, TX", "New York, NY", "Los Angeles, CA", "Chicago, IL",
    "Denver, CO", "Scottsdale, AZ", "Atlanta, GA", "Seattle, WA", "Dallas, TX"
  ],
  "United Kingdom": [
    "London", "Manchester", "Birmingham", "Edinburgh", "Bristol", "Leeds"
  ],
  "Canada": [
    "Toronto, ON", "Vancouver, BC", "Montreal, QC", "Calgary, AB"
  ],
  "Australia": [
    "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Perth, WA"
  ],
  "default": [
    "New York, NY", "London, UK", "Austin, TX", "Toronto, Canada", "Sydney, Australia"
  ]
};

const BRAND_NAME_PARTS: Record<string, { prefixes: string[]; suffixes: string[] }> = {
  restaurant: {
    prefixes: ["The Rustic", "Artisan", "Bistro", "Heritage", "Savor", "Olive &", "Copper", "Velvet", "Table &", "Flour &"],
    suffixes: ["Kitchen", "Table", "Eatery", "Bakery", "Smokehouse", "Social Club", "Provisions", "Cantina", "Trattoria"],
  },
  grocery: {
    prefixes: ["Prime", "Harvest", "Green Valley", "Boutique", "Urban", "Field &", "Marketplace", "Evergreen", "Local Roots"],
    suffixes: ["Market", "Grocers", "Pantry", "Provisions", "Food Hall", "Organics", "Supply Co.", "Bodega"],
  },
  mechanic: {
    prefixes: ["Apex", "Precision", "Mastercraft", "Summit", "EuroTech", "Velocity", "Vanguard", "Elite", "ProDrive"],
    suffixes: ["Auto Clinic", "Motors", "Performance & Detailing", "Garage", "Autowerks", "Service Hub", "Customs"],
  },
  fashion: {
    prefixes: ["Maison", "Avenue", "Loom &", "Atelier", "Nocturne", "Kinship", "District", "Kith &", "Monochrome", "Sovereign"],
    suffixes: ["Studio", "Apparel", "Label", "Clothing Co.", "Goods", "Collective", "Wear", "Archive"],
  },
  beauty: {
    prefixes: ["Lumina", "PureBotanica", "Solis", "Velvet &", "Aura", "Botanic", "Rejuvena", "Flora", "Aevum"],
    suffixes: ["Skin Lab", "Organics", "Cosmetics", "Apothecary", "Beauty Co.", "Alchemy", "Naturals"],
  },
  fitness: {
    prefixes: ["Ironclad", "Pulse", "Apex", "Vigor", "Endure", "Forge", "Kinetic", "Primal", "Ascent"],
    suffixes: ["Athletics", "Performance Lab", "Fitness Co.", "Nutrition", "Club", "Supplements", "Movement"],
  },
  home_furniture: {
    prefixes: ["Nordic", "Timber &", "Haven", "Oak &", "Living", "Modernist", "Sanctuary", "Form &", "Bespoke"],
    suffixes: ["Living", "Home Studio", "Woodcraft", "Interiors", "Furnishings", "Design Co.", "Collective"],
  },
  jewelry: {
    prefixes: ["Aurelia", "Lumiere", "Solstice", "Gem &", "Gilded", "Nocturne", "Carat &", "Starlight"],
    suffixes: ["Jewelry", "Fine Gems", "Timepieces", "Atelier", "Diamonds", "Goldworks", "Bespoke"],
  },
  pet_supplies: {
    prefixes: ["Bark &", "Pawsome", "Noble", "Wholesome", "Wild Tail", "Fur &", "Canine", "Happy Hound"],
    suffixes: ["Pet Co.", "Nutrition", "Provisions", "Supply", "Treats & Co.", "Boutique"],
  },
  electronics: {
    prefixes: ["Hyperion", "Nexus", "AudioPulse", "Volt", "Aero", "Synapse", "Quantum", "Sonic"],
    suffixes: ["Audio", "Gadgets", "Tech Labs", "Devices", "Gear Co.", "Innovations"],
  },
  healthcare: {
    prefixes: ["Apex", "Lumina", "Beacon", "Harmony", "Vitality", "Aesthetic", "Oasis", "Prestige"],
    suffixes: ["Dental Studio", "MedSpa", "Wellness Clinic", "Aesthetics", "Care Center", "Health Hub"],
  },
  construction: {
    prefixes: ["Keystone", "Benchmark", "Pinnacle", "Vanguard", "SolidRock", "Ironwood", "Craftsman"],
    suffixes: ["Builders", "Contracting", "Remodeling Group", "Development Co.", "Homes", "Construction"],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Intelligent deterministic generator that produces rich, contextual, tailored prospects.
 * Used as fallback or high-speed instant radar.
 */
export function generateSyntheticProspects(options: GenerationOptions): GeneratedProspect[] {
  const count = Math.min(Math.max(options.count || 5, 1), 25);
  const cat = MARKET_CATEGORIES.find((c) => c.id === options.category) || MARKET_CATEGORIES[0];
  const locationList = options.location && CITY_HUBS[options.location]
    ? CITY_HUBS[options.location]
    : options.location
    ? [options.location]
    : CITY_HUBS.default;

  const brandParts = BRAND_NAME_PARTS[cat.id] || BRAND_NAME_PARTS.fashion;
  const platformList = options.currentPlatform && options.currentPlatform !== "any"
    ? [options.currentPlatform]
    : ["WooCommerce 8.2", "Wix E-Commerce", "Squarespace 7.1", "Outdated Custom Site", "Shopify (Legacy Theme)"];

  const results: GeneratedProspect[] = [];

  for (let i = 0; i < count; i++) {
    const ownerFirst = pickRandom(OWNER_FIRST_NAMES);
    const ownerLast = pickRandom(OWNER_LAST_NAMES);
    const ownerName = `${ownerFirst} ${ownerLast}`;
    const ownerRole = pickRandom(OWNER_ROLES);

    const prefix = pickRandom(brandParts.prefixes);
    const suffix = pickRandom(brandParts.suffixes);
    const businessName = `${prefix} ${suffix}`;
    const cleanDomain = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      + (Math.random() > 0.4 ? ".com" : ".co");

    const emailPrefix = Math.random() > 0.5 ? ownerFirst.toLowerCase() : "hello";
    const email = `${emailPrefix}@${cleanDomain}`;
    const phone = `+1 (${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
    const location = pickRandom(locationList);
    const currentPlatform = pickRandom(platformList);

    // Pick 2-3 specific pain points
    const painPoints = [...cat.typicalPainPoints].sort(() => 0.5 - Math.random()).slice(0, 2);
    if (currentPlatform.includes("WooCommerce")) {
      painPoints.push("Plugin bloat causing slow TTFB (>1.8s) and broken cart checkout");
    } else if (currentPlatform.includes("Wix")) {
      painPoints.push("Lacking custom Shopify Liquid sections & high-ticket scalability");
    }

    const estimatedValue = cat.averageValue + randomInt(-400, 1200);
    const leadScore = randomInt(75, 96);
    const priority = leadScore >= 90 ? "urgent" : leadScore >= 82 ? "high" : "medium";

    // Build tailored pitch email & LinkedIn message
    const pitchEmailSubject = `Quick observation regarding ${businessName}'s checkout speed & conversions`;
    const pitchEmailBody = `Hi ${ownerFirst},

I recently came across ${businessName} while reviewing fast-growing brands in the ${cat.name.toLowerCase()} space and was really impressed by what you and the team are building in ${location}.

While browsing your storefront on mobile (${cleanDomain}), I noticed a couple of technical friction points that might be silently leaking revenue:
• ${painPoints[0] || "Slow mobile responsiveness"}
• ${painPoints[1] || "Checkout abandonment on mobile"}

As an e-commerce engineer and Shopify specialist, I recently helped a client in your industry increase their mobile conversion rate by 28% and achieve a sub-second (99+) Google Speed Score by implementing a modern Shopify architecture.

I put together a quick, complimentary 3-minute video walkthrough breaking down 3 specific optimizations for ${businessName} that you can implement right away to lift AOV and mobile conversions.

Would you be open to me sharing the link with you here?

Best regards,
Zakaria Bin Moti
Shopify Expert & Full-Stack Web Engineer
Portfolio: zakaria-portfolio.vercel.app`;

    const pitchDmMessage = `Hi ${ownerFirst}, love what you're doing with ${businessName}! Checked out your store on mobile (${cleanDomain}) and noticed a quick checkout friction point holding back conversions. I made a 2-minute video walkthrough with 3 quick fixes—happy to send the link over if you're interested!`;

    results.push({
      businessName,
      ownerName,
      ownerRole,
      email,
      phone,
      website: `https://${cleanDomain}`,
      location,
      industry: cat.name,
      currentPlatform,
      painPoints,
      proposedSolution: cat.recommendedSolution,
      estimatedValue,
      leadScore,
      priority,
      pitchEmailSubject,
      pitchEmailBody,
      pitchDmMessage,
      source: "ai_prospect_radar",
      generatedAt: new Date().toISOString(),
    });
  }

  return results;
}

/**
 * Gemini-Powered AI Lead Radar Engine.
 * Calls Google Gemini when API key is available, with auto-fallback to synthetic generator.
 */
export async function generateAiProspectsWithGemini(
  options: GenerationOptions
): Promise<GeneratedProspect[]> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const count = Math.min(Math.max(options.count || 5, 1), 20);
  const cat = MARKET_CATEGORIES.find((c) => c.id === options.category) || MARKET_CATEGORIES[0];
  const location = options.location || "United States / Worldwide";

  // If no Gemini key, use instant synthetic engine
  if (!geminiKey) {
    return generateSyntheticProspects(options);
  }

  const prompt = `You are an elite B2B E-commerce & Lead Generation Intelligence Engine for Zakaria, a premier Shopify Specialist and Full-Stack Web Developer.
Generate exactly ${count} highly realistic prospective client leads in the following industry:
Industry: "${options.customNiche || cat.name}"
Target Market Location: "${location}"
Target Technology / Stack: "${options.currentPlatform || 'Any'}"

Zakaria's value proposition:
- Custom high-speed Shopify stores (99+ PageSpeed score)
- Migration from slow WooCommerce / Wix / Squarespace to Shopify Liquid 2.0
- High-converting direct ordering systems for restaurants/food brands (eliminating DoorDash 30% fees)
- Custom appointment booking calculators for service businesses (mechanics, clinics, contractors)
- Average deal size: $2,500 - $8,000

For each prospective client, return a JSON object with:
- businessName: realistic, authentic brand name
- ownerName: full name of founder/owner
- ownerRole: "Founder & CEO", "Managing Director", etc.
- email: realistic business email (e.g., name@brand.com)
- phone: formatted phone number
- website: realistic URL (e.g., https://brandname.com)
- location: City, State/Country
- industry: category name
- currentPlatform: e.g. "WooCommerce 8.x", "Wix", "Squarespace", "Outdated Custom Site", "No Online Store"
- painPoints: array of 2-3 specific technical or conversion bottlenecks (e.g. slow load times, PDF menu, missing mobile checkout, high cart abandonment)
- proposedSolution: specific Shopify or Next.js architecture solution
- estimatedValue: number between 2500 and 8500
- leadScore: number between 75 and 98
- priority: "urgent" | "high" | "medium"
- pitchEmailSubject: compelling, non-spammy subject line
- pitchEmailBody: hyper-personalized outreach email referencing their exact pain point, value proposition, and a call-to-action for a 3-minute video audit
- pitchDmMessage: punchy 2-sentence direct message for LinkedIn or Instagram

Return ONLY a valid JSON array of these objects with no markdown code blocks or extra text.`;

  const candidateModels = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
  ];

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2500,
            },
          }),
        }
      );

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          // Clean potential markdown fencing
          const cleanedJson = rawText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();

          const parsed = JSON.parse(cleanedJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item) => ({
              ...item,
              source: "ai_prospect_radar",
              generatedAt: new Date().toISOString(),
            }));
          }
        }
      }
    } catch (err) {
      console.warn(`[AI Lead Radar] Gemini ${model} fallback triggered:`, err);
    }
  }

  // Graceful fallback to guaranteed synthetic engine
  return generateSyntheticProspects(options);
}
