import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, storeUrl, projectBudget, message, source, metadata } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create lead record
    const newLead = await Lead.create({
      name: (name || "").trim(),
      email: email.trim().toLowerCase(),
      storeUrl: (storeUrl || "").trim(),
      projectBudget: (projectBudget || "").trim(),
      message: (message || "").trim(),
      source: source || "website_ai_companion", // Identifies origin as website AI
      channel: "website", // Multi-platform channel
      status: "new",
      metadata: {
        ...(metadata || {}),
        userAgent: req.headers.get("user-agent") || undefined,
        referer: req.headers.get("referer") || undefined,
      },
    });

    console.log(`[Lead Captured] New lead from ${newLead.email} via ${newLead.source}`);

    return NextResponse.json({
      success: true,
      message: "Lead recorded successfully! Zakaria has been notified.",
      leadId: newLead._id,
    });
  } catch (error: any) {
    console.error("Lead Capture API Error:", error);
    return NextResponse.json(
      { error: "Failed to record lead", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const leads = await Lead.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ leads, count: leads.length });
  } catch (error: any) {
    console.error("Fetch Leads API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads", details: error.message },
      { status: 500 }
    );
  }
}
