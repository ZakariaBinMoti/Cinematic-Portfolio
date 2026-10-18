import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Experience from "@/models/Experience";
import Skill from "@/models/Skill";
import Content from "@/models/Content";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const [projects, experiences, skills, contents] = await Promise.all([
      Project.find().sort({ order: 1 }).lean(),
      Experience.find().sort({ order: 1 }).lean(),
      Skill.find().sort({ order: 1 }).lean(),
      Content.find().lean(),
    ]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dateFormatted = new Date().toISOString().split("T")[0];

    const backupPayload = {
      meta: {
        portfolio: "Zakaria Bin Moti - Cinematic Portfolio",
        exportDate: new Date().toISOString(),
        version: "1.0",
        summary: {
          projectsCount: projects.length,
          experiencesCount: experiences.length,
          skillCategoriesCount: skills.length,
          contentSectionsCount: contents.length,
        },
      },
      collections: {
        projects,
        experiences,
        skills,
        contents,
      },
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const filename = `zakaria_portfolio_backup_${dateFormatted}_${timestamp.slice(11, 19)}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Backup Export Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate database backup" },
      { status: 500 }
    );
  }
}
