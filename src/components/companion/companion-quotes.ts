export interface CompanionQuote {
  text: string;
  emoji: string;
  actionHint?: string;
  section?: "hero" | "projects" | "skills" | "experience" | "contact" | "casestudies" | "blog";
}

// General Roaming Quotes (Concise, charming, helpful)
export const GENERAL_QUOTES: CompanionQuote[] = [
  {
    text: "Hi! I'm Zaki. Ask me anything",
    emoji: "✨",
    actionHint: "Chat",
  },
  {
    text: "Need a custom Shopify theme?",
    emoji: "🛍️",
    actionHint: "Hire",
  },
  {
    text: "Ask me about Zakaria's tech stack",
    emoji: "⚡",
    actionHint: "Stack",
  },
  {
    text: "Try my real-time voice mode!",
    emoji: "🎙️",
    actionHint: "Voice",
  },
  {
    text: "Drag & drop me anywhere on screen!",
    emoji: "🛸",
    actionHint: "Move",
  },
  {
    text: "Press Ctrl+K anytime to chat with me",
    emoji: "⌨️",
    actionHint: "Shortcut",
  },
  {
    text: "Click me to start a conversation!",
    emoji: "💬",
    actionHint: "Talk",
  },
];

// Section-Specific Quotes
export const SECTION_QUOTES: Record<string, CompanionQuote[]> = {
  projects: [
    {
      text: "Exploring Zakaria's featured stores?",
      emoji: "🚀",
      actionHint: "Projects",
    },
    {
      text: "Want a live tour of these storefronts?",
      emoji: "🛍️",
      actionHint: "Ask Zaki",
    },
    {
      text: "Need a high-converting store like these?",
      emoji: "💡",
      actionHint: "Inquire",
    },
  ],
  skills: [
    {
      text: "Liquid, Next.js, TypeScript & React!",
      emoji: "⚡",
      actionHint: "Skills",
    },
    {
      text: "Modern Shopify OS 2.0 architecture",
      emoji: "🏗️",
      actionHint: "Architecture",
    },
    {
      text: "Ask me how Zakaria structures themes",
      emoji: "🧠",
      actionHint: "Ask Zaki",
    },
  ],
  experience: [
    {
      text: "Lead Software Engineer & Shopify Architect",
      emoji: "💼",
      actionHint: "Background",
    },
    {
      text: "Over 2 years of production eCommerce",
      emoji: "📈",
      actionHint: "Experience",
    },
  ],
  contact: [
    {
      text: "Ready to build something great together?",
      emoji: "🤝",
      actionHint: "Hire",
    },
    {
      text: "Zakaria is open for select contracts!",
      emoji: "✉️",
      actionHint: "Get Quote",
    },
    {
      text: "Click me to send a project inquiry",
      emoji: "🚀",
      actionHint: "Inquire",
    },
  ],
  casestudies: [
    {
      text: "In-depth case studies & benchmarks!",
      emoji: "📊",
      actionHint: "Explore",
    },
    {
      text: "Josh Coppins, Swell & Becca breakdowns",
      emoji: "🏍️",
      actionHint: "Read",
    },
  ],
  blog: [
    {
      text: "Technical guides & architecture notes",
      emoji: "✍️",
      actionHint: "Articles",
    },
  ],
};

// Fallback legacy array export
export const COMPANION_QUOTES: CompanionQuote[] = GENERAL_QUOTES;

/**
 * Returns a contextual quote based on the current page route and in-page section
 */
export function getContextualQuote(
  pathname: string,
  currentSection?: string | null
): CompanionQuote {
  // 1. Check pathname first
  if (pathname.includes("/case-studies")) {
    const list = SECTION_QUOTES.casestudies;
    return list[Math.floor(Math.random() * list.length)];
  }
  if (pathname.includes("/blog")) {
    const list = SECTION_QUOTES.blog;
    return list[Math.floor(Math.random() * list.length)];
  }

  // 2. Check active in-page section on home page
  if (currentSection && SECTION_QUOTES[currentSection]) {
    // 60% chance to show section-specific quote, 40% general
    if (Math.random() < 0.65) {
      const list = SECTION_QUOTES[currentSection];
      return list[Math.floor(Math.random() * list.length)];
    }
  }

  // 3. Fallback to general quotes
  return GENERAL_QUOTES[Math.floor(Math.random() * GENERAL_QUOTES.length)];
}
