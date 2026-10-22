import { NextRequest, NextResponse } from "next/server";
import { getLivePortfolioKnowledge } from "@/lib/ai-knowledge";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function findRelatedProjects(text: string, projects: any[]): any[] {
  if (!projects || projects.length === 0) return [];
  const lower = text.toLowerCase();

  const matched = projects.filter((p) => {
    const titleLower = (p.title || "").toLowerCase();
    const slugLower = (p.caseStudySlug || "").toLowerCase();
    return lower.includes(titleLower) || (slugLower && lower.includes(slugLower));
  });

  if (matched.length > 0) {
    return matched.slice(0, 2).map((p) => ({
      title: p.title,
      description: p.description,
      techStack: p.techStack || [],
      liveLink: p.liveLink || "",
      caseStudySlug: p.caseStudySlug || "",
      imageUrl: p.imageUrl || "",
    }));
  }

  if (
    lower.includes("project") ||
    lower.includes("store") ||
    lower.includes("work") ||
    lower.includes("case study") ||
    lower.includes("portfolio") ||
    lower.includes("ecommerce")
  ) {
    return projects.slice(0, 2).map((p) => ({
      title: p.title,
      description: p.description,
      techStack: p.techStack || [],
      liveLink: p.liveLink || "",
      caseStudySlug: p.caseStudySlug || "",
      imageUrl: p.imageUrl || "",
    }));
  }

  return [];
}

function computeFollowUps(query: string, reply: string): string[] {
  const combined = (query + " " + reply).toLowerCase();

  if (
    combined.includes("hire") ||
    combined.includes("rate") ||
    combined.includes("contact") ||
    combined.includes("quote") ||
    combined.includes("collaborate") ||
    combined.includes("availability")
  ) {
    return [
      "Inquire / Hire Zakaria ✉️",
      "See live case studies 📈",
      "Download Resume (PDF) 📄",
    ];
  }

  if (
    combined.includes("project") ||
    combined.includes("store") ||
    combined.includes("case study") ||
    combined.includes("built")
  ) {
    return [
      "What tech stack was used? ⚡",
      "How to hire Zakaria ✉️",
      "Explore Shopify OS 2.0 🛍️",
    ];
  }

  if (
    combined.includes("skill") ||
    combined.includes("stack") ||
    combined.includes("liquid") ||
    combined.includes("next") ||
    combined.includes("architecture")
  ) {
    return [
      "Show standout projects 🚀",
      "See case studies 📊",
      "Inquire for a project ✉️",
    ];
  }

  return [
    "Top Shopify projects? 🚀",
    "Tech stack & skills ⚡",
    "How to hire Zakaria ✉️",
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = (body?.message || "").trim();
    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Automatic Lead Capture from conversational text (if user provided an email address)
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      const capturedEmail = emailMatch[0].toLowerCase();
      try {
        await dbConnect();
        await Lead.create({
          email: capturedEmail,
          message: message,
          source: "website_ai_companion",
          channel: "website",
          status: "new",
          metadata: {
            detectedInChat: true,
            userAgent: req.headers.get("user-agent") || undefined,
            referer: req.headers.get("referer") || undefined,
          },
        });
        console.log(`[Auto-Lead] Captured email from chat: ${capturedEmail}`);
      } catch (leadErr) {
        console.warn("Auto-lead capture error:", leadErr);
      }
    }

    // 2. Fetch live portfolio knowledge (always synced with MongoDB)
    const { systemPrompt, dataSnapshot } = await getLivePortfolioKnowledge();
    const { projects = [], caseStudies = [], contact = {} } = dataSnapshot;

    // Check if the user is asking about hiring or collaboration
    const lower = message.toLowerCase();
    const isHireIntent =
      lower.includes("hire") ||
      lower.includes("quote") ||
      lower.includes("price") ||
      lower.includes("rate") ||
      lower.includes("meeting") ||
      lower.includes("work with") ||
      lower.includes("collaborate") ||
      lower.includes("inquire");

    // 3. Check for Gemini API Key in environment
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const contents: any[] = [];

        // Include last 6 messages of conversation context for continuity
        const recentHistory = history.slice(-6);
        for (const msg of recentHistory) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.text }],
          });
        }

        // Add current message
        contents.push({
          role: "user",
          parts: [{ text: message }],
        });

        const candidateModels = [
          "gemini-3.5-flash-lite",
          "gemini-3.5-flash",
          "gemini-flash-latest",
          "gemini-2.5-flash",
        ];

        for (const model of candidateModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents,
                  systemInstruction: {
                    parts: [{ text: systemPrompt }],
                  },
                  generationConfig: {
                    temperature: 0.65,
                    maxOutputTokens: 250, // clean, balanced length
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply) {
                const cleanReply = reply.trim();
                const relatedProjects = findRelatedProjects(message + " " + cleanReply, projects);
                const suggestedFollowUps = computeFollowUps(message, cleanReply);

                return NextResponse.json({
                  reply: cleanReply,
                  provider: model,
                  relatedProjects,
                  suggestedFollowUps,
                  showLeadForm: isHireIntent,
                });
              }
            } else {
              const err = await geminiRes.json().catch(() => ({}));
              console.warn(`Model ${model} returned ${geminiRes.status}:`, err?.error?.message);
            }
          } catch (modelErr) {
            console.warn(`Error trying ${model}:`, modelErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini call error, falling back to dynamic engine:", geminiErr);
      }
    }

    // 4. Smart Dynamic Knowledge Fallback Engine
    let fallbackReply = "";

    if (
      lower.includes("project") ||
      lower.includes("store") ||
      lower.includes("work") ||
      lower.includes("portfolio") ||
      lower.includes("built")
    ) {
      const topProjects = (projects || []).slice(0, 3);
      if (topProjects.length > 0) {
        const list = topProjects
          .map((p: any) => `• ${p.title}: ${p.description || "eCommerce project"}`)
          .join("\n");
        fallbackReply = `Zakaria has built a diverse range of modern eCommerce storefronts and web apps. Some featured highlights include:\n\n${list}\n\nYou can explore each project in detail in the Projects section!`;
      } else {
        fallbackReply = `Zakaria has developed a diverse portfolio of custom Shopify themes and full-stack web applications. You can view all featured work in the Projects section!`;
      }
    } else if (
      lower.includes("case study") ||
      lower.includes("case studies") ||
      lower.includes("josh coppins") ||
      lower.includes("swell") ||
      lower.includes("becca")
    ) {
      if (caseStudies && caseStudies.length > 0) {
        const csList = caseStudies
          .slice(0, 3)
          .map((cs: any) => `• ${cs.title}: ${cs.summary}`)
          .join("\n\n");
        fallbackReply = `Here are Zakaria's featured case studies detailing custom architecture and solutions:\n\n${csList}\n\nFeel free to explore the full breakdowns in the Case Studies section!`;
      } else {
        fallbackReply = `You can explore detailed case studies for Josh Coppins Motorcycles, Swell Sport, and Becca's Bags directly in the Case Studies section!`;
      }
    } else if (
      lower.includes("contact") ||
      lower.includes("email") ||
      lower.includes("hire") ||
      lower.includes("call") ||
      lower.includes("reach") ||
      lower.includes("touch")
    ) {
      const email = contact?.email || "zakaria.binmoti@gmail.com";
      const linkedin = contact?.linkedin || "https://www.linkedin.com/in/zakariabinmoti";
      fallbackReply = `You can reach Zakaria directly via email at ${email} or connect on LinkedIn at ${linkedin}. He is open to select Shopify architecture, custom themes, and full-stack contracts!`;
    } else if (
      lower.includes("skill") ||
      lower.includes("stack") ||
      lower.includes("tech") ||
      lower.includes("liquid") ||
      lower.includes("next") ||
      lower.includes("react") ||
      lower.includes("shopify")
    ) {
      fallbackReply = `Zakaria specializes in the modern eCommerce ecosystem: Shopify OS 2.0 & Liquid architecture, Next.js & React storefronts, TypeScript, Tailwind CSS, and performance optimization. Backend proficiencies include Node.js, MongoDB, and REST/GraphQL APIs.`;
    } else if (
      lower.includes("rate") ||
      lower.includes("pricing") ||
      lower.includes("cost") ||
      lower.includes("available") ||
      lower.includes("availability")
    ) {
      fallbackReply = `Zakaria is available for custom Shopify theme development, headless builds, and architectural consulting. For project scoping and rates, feel free to drop him a line at ${contact?.email || "zakaria.binmoti@gmail.com"}.`;
    } else if (
      lower.includes("who are you") ||
      lower.includes("who is zakaria") ||
      lower.includes("about") ||
      lower.includes("background")
    ) {
      fallbackReply = `Zakaria Bin Moti is a Lead Software Engineer and Shopify OS 2.0 Architect with over 2 years of experience creating fast, conversion-optimized eCommerce storefronts and full-stack web applications.`;
    } else {
      fallbackReply = `Hi there! I am Zaki, Zakaria's AI assistant. Ask me anything about his Shopify development work, featured projects, tech stack, or how to get in touch with him!`;
    }

    const relatedProjects = findRelatedProjects(message + " " + fallbackReply, projects);
    const suggestedFollowUps = computeFollowUps(message, fallbackReply);

    return NextResponse.json({
      reply: fallbackReply,
      provider: "dynamic-knowledge-engine",
      relatedProjects,
      suggestedFollowUps,
      showLeadForm: isHireIntent,
    });
  } catch (error: any) {
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
