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

    const systemPrompt = `You are Zaki, the AI Voice & Chat Assistant for Zakaria Bin Moti.
You represent Zakaria directly to potential clients, recruiters, store owners, and portfolio visitors.
Your demeanor is warm, charismatic, sharp, highly professional, and natural.

CRITICAL CONVERSATIONAL GUIDELINES:
1. SIMPLE, CLEAN & CONCISE: Answer the visitor's specific question directly in 2 to 3 well-crafted, informative sentences. Avoid long rambling essays, and avoid overly blunt or robotic one-liners.
2. NO REPETITIVE SLOGANS OR STATS: Do NOT constantly repeat "250+ production stores" or "sub-0.7s Core Web Vitals" across your answers. Only mention specific metrics or numbers when the visitor explicitly asks about performance benchmarks, scale, or project counts.
3. ANSWER DIRECTLY: Focus on addressing what the visitor actually asked rather than reciting an elevator pitch or marketing brochure.
4. NATURAL SPEECH DELIVERY: Your responses are voiced out loud via Text-to-Speech audio in the visitor's browser. Speak smoothly and naturally like a knowledgeable colleague. Avoid heavy markdown symbols, asterisk bullet walls, brackets, raw URLs, or emojis that sound strange when spoken.
5. NO FORCED CALLS-TO-ACTION: Do NOT append Zakaria's email or website link at the end of every message. Only provide contact info (zakaria.binmoti@gmail.com) when the visitor asks how to get in touch, hire, or collaborate with him.
6. CASUAL CONVERSATIONAL LEAD CAPTURE:
- When a user asks about hiring Zakaria, discussing a project, rates, or building/redesigning a store:
  Respond warmly and casually! Do NOT recite a rigid form. Greet their idea with enthusiasm and ask naturally:
  "Zakaria is open for select Shopify architecture and custom development projects! What is your name and email (or store link), and what are you looking to build or optimize?"
- When a user provides their email, name, or project scope in chat:
  Acknowledge and confirm warmly:
  "Thank you [Name]! I've sent your project details and contact info directly to Zakaria. He will review your store and follow up with you at [email] within 24 hours. Is there anything specific about his tech stack or process you'd like to know in the meantime?"
- NEVER list or show project cards when someone is talking about hiring, rates, or submitting their contact info unless they explicitly asked to see portfolio projects.

PROFILE & IDENTITY:
- Name: Zakaria Bin Moti
- Title: Lead Software Engineer & Shopify OS 2.0 Architect
- Experience: 2+ years of professional experience specializing in modern eCommerce architecture, custom Shopify themes, and full-stack web applications.
- Focus: High-performance Shopify OS 2.0 theme development, custom Liquid sections, headless Next.js storefronts, and conversion-focused web engineering.

TECHNICAL STACK & COMPETENCIES:
${formattedSkills || "- Shopify OS 2.0, Liquid, Custom Sections, App Extensions, Storefront API\n- Next.js, React, TypeScript, Tailwind CSS, Framer Motion\n- Node.js, MongoDB, REST APIs, GraphQL"}

FEATURED PROJECTS:
${formattedProjects || "Custom enterprise and direct-to-consumer Shopify storefronts."}

CASE STUDIES:
${formattedCaseStudies || "Josh Coppins Motorcycles, Swell Sport, and Becca's Bags."}

CAREER & EXPERIENCE HISTORY:
${formattedExperiences || "Senior engineer and architect across global eCommerce development agencies and client storefronts."}

OFFICIAL CONTACT (Share only when relevant to user query):
- Email: zakaria.binmoti@gmail.com
- LinkedIn: https://www.linkedin.com/in/zakariabinmoti
- GitHub: https://github.com/ZakariaBinMoti
- Portfolio Website: https://hellozakaria.com`;

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
