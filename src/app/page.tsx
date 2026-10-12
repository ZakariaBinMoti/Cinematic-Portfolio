import Navbar from "@/components/Navbar";
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
    <main className="w-full bg-[#080a10] relative selection:bg-white/20 selection:text-white">
      <Navbar />
      <ScrollyContainer heroData={data.hero} />
      
      <div className="bg-[#080a10] relative z-20">
        <AboutSection aboutData={data.about} />
        <AchievementsSection achievementsData={data.achievements} />
        <SkillsSection skills={data.skills} />
        <ExperienceSection experiences={data.experiences} />
        <ProjectsSection projects={data.projects} />
        <EducationSection educationData={data.education} />
        <ContactSection contactData={data.contact} />
      </div>
    </main>
  );
}
