import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import Project from "@/models/Project";
import Experience from "@/models/Experience";
import Skill from "@/models/Skill";

export async function getPortfolioData() {
  try {
    await dbConnect();
    
    const [hero, about, projects, experiences, skills] = await Promise.all([
      Content.findOne({ section: "hero" }).lean(),
      Content.findOne({ section: "about" }).lean(),
      Project.find({}).sort({ order: 1 }).lean(),
      Experience.find({}).sort({ order: 1 }).lean(),
      Skill.find({}).sort({ order: 1 }).lean()
    ]);

    return {
      hero: hero?.data || null,
      about: about?.data || null,
      projects: JSON.parse(JSON.stringify(projects)),
      experiences: JSON.parse(JSON.stringify(experiences)),
      skills: JSON.parse(JSON.stringify(skills)),
    };
  } catch (e) {
    console.error("Failed to fetch portfolio data", e);
    return {
      hero: null,
      about: null,
      projects: [],
      experiences: [],
      skills: [],
    };
  }
}
