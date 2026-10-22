import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import Project from "@/models/Project";
import Post from "@/models/Post";
import Experience from "@/models/Experience";
import Skill from "@/models/Skill";

interface CachedKnowledge {
  timestamp: number;
  systemPrompt: string;
  dataSnapshot: {
    projects: any[];
    caseStudies: any[];
    skills: any[];
    contact: any;
  };
}

let cachedKnowledge: CachedKnowledge | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function getLivePortfolioKnowledge(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedKnowledge && (now - cachedKnowledge.timestamp < CACHE_TTL_MS)) {
    return cachedKnowledge;
  }

  try {
    await dbConnect();

    const [
      heroContent,
      aboutContent,
      achievementsContent,
      contactContent,
      projects,
      posts,
      experiences,
      skills,
    ] = await Promise.all([
      Content.findOne({ section: "hero" }).lean(),
      Content.findOne({ section: "about" }).lean(),
      Content.findOne({ section: "achievements" }).lean(),
      Content.findOne({ section: "contact" }).lean(),
      Project.find({ isVisible: { $ne: false } }).sort({ order: 1 }).lean(),
      Post.find({ isPublished: { $ne: false } }).sort({ publishedAt: -1 }).lean(),
      Experience.find({ isVisible: { $ne: false } }).sort({ order: 1 }).lean(),
      Skill.find({ isVisible: { $ne: false } }).sort({ order: 1 }).lean(),
    ]);

    const about = (aboutContent as any)?.data || {};
    const hero = (heroContent as any)?.data || {};
    const contact = (contactContent as any)?.data || {};
    const achievements = (achievementsContent as any)?.data || {};

    // Group posts into case studies and blogs
    const caseStudies = posts.filter((p: any) => p.type === "case-study");
    const blogs = posts.filter((p: any) => p.type === "blog");

    // Format knowledge text for LLM system prompt
    const formattedProjects = projects.map((p: any, idx: number) => {
      const caseStudyLink = p.caseStudySlug ? ` | Case Study: https://hellozakaria.com/case-studies/${p.caseStudySlug}` : "";
      const liveLink = p.liveLink ? ` | Live: ${p.liveLink}` : "";
      const tech = (p.techStack && p.techStack.length) ? ` | Stack: ${p.techStack.join(", ")}` : "";
      return `${idx + 1}. **${p.title}**: ${p.description || "Production eCommerce project"}${tech}${liveLink}${caseStudyLink}`;
    }).join("\n");

    const formattedCaseStudies = caseStudies.map((cs: any) => {
      const client = cs.clientName ? ` for ${cs.clientName}` : "";
      const metrics = (cs.metrics && cs.metrics.length) 
        ? ` | Key Results: ${cs.metrics.map((m: any) => `${m.label}: ${m.value}`).join(", ")}` 
        : "";
      return `- **${cs.title}**${client} (Link: https://hellozakaria.com/case-studies/${cs.slug}): ${cs.summary}${metrics}`;
    }).join("\n");

    const formattedExperiences = experiences.map((exp: any) => {
      const period = exp.period || exp.duration || "";
      const company = exp.company || "";
      const role = exp.role || exp.title || "";
      const desc = exp.description ? ` - ${exp.description}` : "";
      return `- **${role}** at ${company} (${period})${desc}`;
    }).join("\n");

    const formattedSkills = skills.map((s: any) => {
      const items = Array.isArray(s.skills) ? s.skills.join(", ") : (s.items ? s.items.join(", ") : "");
      return `- **${s.category || s.title || "Skills"}**: ${items || s.name || ""}`;
    }).join("\n");

    const systemPrompt = `You are the AI Voice & Chatbot Assistant for Zakaria Bin Moti.
You represent Zakaria directly to potential clients, recruiters, store owners, and portfolio visitors.
Your demeanor is warm, charismatic, sharp, highly professional, and articulate.

CRITICAL VOICE/SPEECH RULE:
Your responses will often be read aloud via Text-to-Speech audio in the visitor's browser.
- Keep your answers concise, engaging, and conversational (typically 2-4 punchy sentences or a short bulleted list).
- Do not use dense markdown formatting or unpronounceable characters (avoid brackets, table markup, or long code blocks unless explicitly requested).
- Pronounce website links naturally (e.g. "You can visit hellozakaria.com or check the case study page").

=== LIVE PORTFOLIO KNOWLEDGE BASE (AUTOMATICALLY SYNCED WITH DATABASE) ===

PROFILE & IDENTITY:
- Name: Zakaria Bin Moti
- Title: Lead Software Engineer & Shopify OS 2.0 Architect
- Tagline: ${hero.headline || "Architecting high-converting eCommerce platforms, custom Next.js web applications, and scalable frontend architectures."}
- Bio/Background: ${about.bio || "Full-stack software engineer and Shopify architect with a proven track record delivering over 250+ production storefronts globally with sub-0.7s Core Web Vitals and high-ticket CRO."}
- Years of Experience: 2+ years specializing in modern eCommerce and full-stack software development.

OFFICIAL CONTACT & LIVE LINKS:
- Portfolio Website: https://hellozakaria.com
- Email Address: zakaria.binmoti@gmail.com (always state zakaria.binmoti@gmail.com with @gmail.com)
- LinkedIn: https://www.linkedin.com/in/zakariabinmoti
- GitHub: https://github.com/ZakariaBinMoti
- Resume (PDF): https://hellozakaria.com/Zakaria_Bin_Moti_Resume.pdf
${contact.calendly ? `- Book a Call: ${contact.calendly}` : ""}

NOTABLE ACHIEVEMENTS & METRICS:
- Over 250+ production Shopify storefronts and headless web apps delivered globally.
- Sub-0.7s Core Web Vitals (LCP) performance benchmarks.
- Proven double-digit CRO (Conversion Rate Optimization) gains on high-ticket stores.
- 100% Job Success Rate with top client recommendations.

LIVE FEATURED PROJECTS (CURRENT DATABASE SNAPSHOT):
${formattedProjects || "Multiple enterprise and direct-to-consumer stores delivered."}

DEEP-DIVE CASE STUDIES:
${formattedCaseStudies || "Josh Coppins Motorcycles, Swell Sport, and Becca's Bags case studies are featured live."}

CAREER & EXPERIENCE HISTORY:
${formattedExperiences || "Senior engineer and architect across global eCommerce development agencies and client storefronts."}

TECHNICAL STACK & CORE COMPETENCIES:
${formattedSkills || "- Shopify OS 2.0, Liquid, Custom Sections, App Extensions, Storefront API\n- Next.js, React, TypeScript, Tailwind CSS, Framer Motion\n- Node.js, MongoDB, REST APIs, GraphQL, Cloudinary\n- Performance Audits, CRO, SEO, Core Web Vitals Optimization"}

COMMON VISITOR SCENARIOS:
1. Hiring / Collaboration: Encourage them to email zakaria.binmoti@gmail.com, connect on LinkedIn, or download the resume.
2. Store Audits / Speed Optimization: Highlight Zakaria's sub-0.7s LCP record and offer a review of their current store.
3. Case Studies: Direct them to specific studies like Josh Coppins Motorcycles (performance & inventory scale) or Swell Sport.
4. If asked about rates or availability: Mention that Zakaria is available for select high-impact client projects and architectural consulting, and invite them to reach out for an estimate.`;

    cachedKnowledge = {
      timestamp: now,
      systemPrompt,
      dataSnapshot: {
        projects,
        caseStudies,
        skills,
        contact,
      },
    };

    return cachedKnowledge;
  } catch (error) {
    console.error("Error generating live portfolio knowledge:", error);
    // Return baseline if DB has temporary issue
    return {
      timestamp: now,
      systemPrompt: `You are the AI Assistant for Zakaria Bin Moti, Lead Software Engineer & Shopify OS 2.0 Architect. Email: zakaria.binmoti@gmail.com, Website: hellozakaria.com. Keep answers concise, friendly, and helpful.`,
      dataSnapshot: {
        projects: [],
        caseStudies: [],
        skills: [],
        contact: {},
      },
    };
  }
}
