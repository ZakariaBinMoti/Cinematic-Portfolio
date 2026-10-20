import { NextRequest, NextResponse } from "next/server";
import { getLivePortfolioKnowledge } from "@/lib/ai-knowledge";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = (body?.message || "").trim();
    const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Fetch live portfolio knowledge (always synced with MongoDB)
    const { systemPrompt, dataSnapshot } = await getLivePortfolioKnowledge();

    // 2. Check for Gemini API Key in environment
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

        // Try high-speed models in order of latency
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
                    temperature: 0.7,
                    maxOutputTokens: 300, // kept concise for voice narration
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply) {
                return NextResponse.json({
                  reply: reply.trim(),
                  provider: model,
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

    // 3. Smart Dynamic Knowledge Engine (100% Free, Zero Key Required Fallback)
    // Matches queries directly against live MongoDB data snapshot
    const lower = message.toLowerCase();
    const { projects, caseStudies, skills, contact } = dataSnapshot;

    let fallbackReply = "";

    if (lower.includes("project") || lower.includes("store") || lower.includes("work") || lower.includes("portfolio") || lower.includes("built")) {
      const topProjects = (projects || []).slice(0, 3);
      if (topProjects.length > 0) {
        const list = topProjects
          .map((p: any) => `• ${p.title}: ${p.description || "eCommerce project"} (${(p.techStack || []).join(", ")})`)
          .join("\n");
        fallbackReply = `Zakaria has delivered over 250+ production stores globally. Some of his standout live projects include:\n\n${list}\n\nYou can explore all of them in the Projects section or ask me about a specific case study!`;
      } else {
        fallbackReply = `Zakaria has delivered 250+ production Shopify and headless stores globally with sub-0.7s Core Web Vitals. You can view all featured work in the Projects section!`;
      }
    } else if (lower.includes("case study") || lower.includes("case studies") || lower.includes("josh coppins") || lower.includes("swell") || lower.includes("becca")) {
      if (caseStudies && caseStudies.length > 0) {
        const csList = caseStudies
          .slice(0, 3)
          .map((cs: any) => `• ${cs.title} (https://hellozakaria.com/case-studies/${cs.slug}): ${cs.summary}`)
          .join("\n\n");
        fallbackReply = `Here are Zakaria's featured production case studies detailing architectural solutions and CRO metrics:\n\n${csList}\n\nFeel free to click through to inspect the full metrics and technical breakdowns!`;
      } else {
        fallbackReply = `You can explore detailed case studies for Josh Coppins Motorcycles, Swell Sport, and Becca's Bags directly in the Case Studies section!`;
      }
    } else if (lower.includes("contact") || lower.includes("email") || lower.includes("hire") || lower.includes("call") || lower.includes("rate") || lower.includes("reach") || lower.includes("touch")) {
      const email = contact?.email || "zakaria.binmoti@gmail.com";
      const linkedin = contact?.linkedin || "https://www.linkedin.com/in/zakariabinmoti";
      fallbackReply = `You can reach Zakaria directly via email at ${email} or connect on LinkedIn at ${linkedin}. He is currently taking on select high-impact Shopify architecture, custom themes, and full-stack contracts!`;
    } else if (lower.includes("skill") || lower.includes("stack") || lower.includes("tech") || lower.includes("liquid") || lower.includes("next") || lower.includes("react") || lower.includes("shopify")) {
      fallbackReply = `Zakaria specializes in the entire modern eCommerce ecosystem: Shopify OS 2.0 & Liquid architecture, Next.js & React headless storefronts, TypeScript, high-ticket CRO, and sub-0.7s Core Web Vitals optimization. Backend proficiencies include Node.js, MongoDB, and GraphQL APIs.`;
    } else if (lower.includes("rate") || lower.includes("pricing") || lower.includes("cost") || lower.includes("available") || lower.includes("availability")) {
      fallbackReply = `Zakaria is available for high-tier Shopify theme development, enterprise speed optimization, headless builds, and architectural consulting. For exact project scoping and rates, send him a message at ${contact?.email || "zakaria.binmoti@gmail.com"}.`;
    } else if (lower.includes("who are you") || lower.includes("who is zakaria") || lower.includes("about") || lower.includes("background")) {
      fallbackReply = `Zakaria Bin Moti is a Lead Software Engineer and Shopify OS 2.0 Architect with over 6 years of experience delivering 250+ production stores globally. He blends elite engineering with conversion-focused design to create blisteringly fast, high-converting digital storefronts.`;
    } else {
      fallbackReply = `Hi there! I am Zakaria's AI Assistant. You can ask me anything about his 250+ delivered Shopify stores, live case studies, technical stack, or how to get in touch with him for a project. What would you like to know?`;
    }

    return NextResponse.json({
      reply: fallbackReply,
      provider: "dynamic-knowledge-engine",
    });
  } catch (error: any) {
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
