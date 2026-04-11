import ScrollyContainer from "@/components/ScrollyContainer";
import AboutSection from "@/components/AboutSection";
import ExperienceSection from "@/components/ExperienceSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import EducationSection from "@/components/EducationSection";
import AchievementsSection from "@/components/AchievementsSection";
import ContactSection from "@/components/ContactSection";
import { getPortfolioData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPortfolioData();

  return (
    <main className="w-full bg-[#121212]">
      <ScrollyContainer heroData={data.hero} />
      
      <div className="bg-[#121212] relative z-20 shadow-[0_-20px_50px_rgba(18,18,18,1)]">
        <AboutSection aboutData={data.about} />
        <AchievementsSection />
        <SkillsSection skills={data.skills} />
        <ExperienceSection experiences={data.experiences} />
        <ProjectsSection projects={data.projects} />
        <EducationSection />
        <ContactSection />
      </div>
    </main>
  );
}
