import { NextRequest, NextResponse } from "next/server";
import { getLivePortfolioKnowledge } from "@/lib/ai-knowledge";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface ExtractedLead {
  email: string | null;
  name: string | null;
  storeUrl: string | null;
}

function extractLeadInfo(message: string, history: ChatMessage[]): ExtractedLead {
  const combined = [...history.map((m) => m.text), message].join(" ");

  // 1. Extract email (checks current message first, then conversation history)
  const currentEmailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const historyEmailMatch = combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = currentEmailMatch
    ? currentEmailMatch[0].toLowerCase()
    : historyEmailMatch
    ? historyEmailMatch[0].toLowerCase()
    : null;

  // 2. Extract client name (e.g. "I'm David", "My name is John Miller", "David, david@brand.com")
  let name: string | null = null;
  const namePatterns = [
    /(?:my name is|i am|i'm|name is|this is)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i,
    /(?:call me)\s+([A-Z][a-zA-Z]+)/i,
    /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)[,\s]+.*@[a-zA-Z0-9.-]+/i,
  ];
  for (const pat of namePatterns) {
    const match = message.match(pat);
    if (match && match[1]) {
      let candidate = match[1].trim();
      // Remove trailing prepositions like "from ...", "at ...", "with ..."
      candidate = candidate.replace(/\s+(?:from|at|with|of)\b.*$/i, "").trim();
      const lowerCandidate = candidate.toLowerCase();
      const stopWords = ["shopify", "liquid", "zakaria", "zaki", "developer", "engineer", "looking", "interested", "sure", "hello", "hi", "hey"];
      if (!stopWords.includes(lowerCandidate) && candidate.length > 1) {
        name = candidate;
        break;
      }
    }
  }

  // 3. Extract store / website URL
  let storeUrl: string | null = null;
  const urlMatch = message.match(/(?:https?:\/\/)?([a-zA-Z0-9-]+\.(?:myshopify\.com|[a-zA-Z]{2,}))(?:\/[^\s]*)?/i);
  if (urlMatch && urlMatch[1]) {
    const domain = urlMatch[1].toLowerCase();
    const commonMailHosts = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com",
      "proton.me",
      "protonmail.com",
      "google.com",
    ];
    if (!commonMailHosts.includes(domain)) {
      storeUrl = urlMatch[0];
    }
  }

  return { email, name, storeUrl };
}

function findRelatedProjects(
  query: string,
  projects: any[],
  isHireIntent: boolean
): any[] {
  if (!projects || projects.length === 0) return [];

  const lower = query.toLowerCase();

  // If user is inquiring about hiring, rates, quotes, or contact, NEVER show random projects unless they explicitly asked to view past projects
  const explicitProjectRequest =
    lower.includes("show project") ||
    lower.includes("see project") ||
    lower.includes("view project") ||
    lower.includes("past work") ||
    lower.includes("portfolio") ||
    lower.includes("case stud") ||
    lower.includes("show me your work") ||
    lower.includes("what have you built");

  if (isHireIntent && !explicitProjectRequest) {
    return [];
  }

  // Match if a specific project title or slug was mentioned in user query
  const matched = projects.filter((p) => {
    const titleLower = (p.title || "").toLowerCase();
    const slugLower = (p.caseStudySlug || "").toLowerCase();
    return (
      (titleLower && lower.includes(titleLower)) ||
      (slugLower && lower.includes(slugLower))
    );
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

  // If user explicitly asked for projects/work/case studies
  if (
    lower.includes("what project") ||
    lower.includes("top project") ||
    lower.includes("featured work") ||
    lower.includes("portfolio") ||
    lower.includes("case study") ||
    lower.includes("what have you built")
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

function computeFollowUps(query: string, reply: string, isHireIntent: boolean, leadCaptured: boolean): string[] {
  if (leadCaptured) {
    return [
      "See live case studies 📈",
      "Tech stack & skills ⚡",
      "Download Resume (PDF) 📄",
    ];
  }

  const combined = (query + " " + reply).toLowerCase();

  if (isHireIntent) {
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
      "Top Shopify projects? 🚀",
      "See case studies 📊",
      "Inquire / Hire Zakaria ✉️",
    ];
  }

  return [
    "Top Shopify projects? 🚀",
    "Tech stack & skills ⚡",
    "Inquire / Hire Zakaria ✉️",
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

    const lower = message.toLowerCase();

    // Check hiring or project collaboration intent
    const isHireIntent =
      lower.includes("hire") ||
      lower.includes("quote") ||
      lower.includes("price") ||
      lower.includes("rate") ||
      lower.includes("meeting") ||
      lower.includes("work with") ||
      lower.includes("collaborate") ||
      lower.includes("inquire") ||
      lower.includes("consult") ||
      lower.includes("build a store") ||
      lower.includes("build my store") ||
      lower.includes("rebuild") ||
      lower.includes("redesign") ||
      lower.includes("theme development");

    // 1. Conversational Lead Detection & Extraction
    const leadInfo = extractLeadInfo(message, history);
    let leadCaptured = false;

    if (leadInfo.email) {
      try {
        await dbConnect();
        await Lead.create({
          name: leadInfo.name || undefined,
          email: leadInfo.email,
          storeUrl: leadInfo.storeUrl || undefined,
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
        leadCaptured = true;
        console.log(`[Auto-Lead] Captured lead from chat: ${leadInfo.email} (${leadInfo.name || "Anonymous"})`);
      } catch (leadErr) {
        console.warn("Auto-lead capture error:", leadErr);
      }
    }

    // 2. Fetch live portfolio knowledge (always synced with MongoDB)
    const { systemPrompt, dataSnapshot } = await getLivePortfolioKnowledge();
    const { projects = [], caseStudies = [], contact = {} } = dataSnapshot;

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

        // Add current message with contextual guidance if user gave their contact info
        let augmentedMessage = message;
        if (leadCaptured && leadInfo.email) {
          augmentedMessage += `\n[System Note: The visitor just provided their contact email (${leadInfo.email}${leadInfo.name ? `, Name: ${leadInfo.name}` : ""}). Confirm warmly that you have sent their message and details directly to Zakaria and that he will respond to their email within 24 hours. Do not show project lists.]`;
        }

        contents.push({
          role: "user",
          parts: [{ text: augmentedMessage }],
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
                    maxOutputTokens: 250,
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply) {
                const cleanReply = reply.trim();
                const relatedProjects = findRelatedProjects(message, projects, isHireIntent);
                const suggestedFollowUps = computeFollowUps(message, cleanReply, isHireIntent, leadCaptured);

                return NextResponse.json({
                  reply: cleanReply,
                  provider: model,
                  relatedProjects,
                  suggestedFollowUps,
                  showLeadForm: isHireIntent && !leadCaptured,
                  leadCaptured,
                  leadData: leadCaptured ? leadInfo : undefined,
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

    if (leadCaptured && leadInfo.email) {
      fallbackReply = `Thank you${leadInfo.name ? " " + leadInfo.name : ""}! I've sent your project details and contact information directly to Zakaria. He will review your store scope and get back to you at ${leadInfo.email} within 24 hours. In the meantime, feel free to explore his case studies or technical stack!`;
    } else if (isHireIntent) {
      fallbackReply = `Zakaria is open for select custom Shopify OS 2.0 themes, headless storefronts, and architectural consulting! What's your name, email (or store URL), and what are you looking to build or optimize?`;
    } else if (
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
      lower.includes("call") ||
      lower.includes("reach") ||
      lower.includes("touch")
    ) {
      const email = contact?.email || "zakaria.binmoti@gmail.com";
      const linkedin = contact?.linkedin || "https://www.linkedin.com/in/zakariabinmoti";
      fallbackReply = `You can reach Zakaria directly via email at ${email} or connect on LinkedIn at ${linkedin}. Feel free to drop your email and project overview right here as well!`;
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
      fallbackReply = `Zakaria is available for custom Shopify theme development, headless builds, and architectural consulting. To get a quote for your project, what's your name, email, and store scope?`;
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

    const relatedProjects = findRelatedProjects(message, projects, isHireIntent);
    const suggestedFollowUps = computeFollowUps(message, fallbackReply, isHireIntent, leadCaptured);

    return NextResponse.json({
      reply: fallbackReply,
      provider: "dynamic-knowledge-engine",
      relatedProjects,
      suggestedFollowUps,
      showLeadForm: isHireIntent && !leadCaptured,
      leadCaptured,
      leadData: leadCaptured ? leadInfo : undefined,
    });
  } catch (error: any) {
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
