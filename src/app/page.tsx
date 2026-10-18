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

  // Project catalog structured data for search engine rich indexing
  const visibleProjects = (data.projects || [])
    .filter((p: any) => p.isVisible !== false)
    .slice(0, 25);

  const projectsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Production eCommerce Projects by Zakaria Bin Moti",
    description:
      "Curated portfolio of production Shopify stores and custom eCommerce platforms engineered by Zakaria Bin Moti.",
    itemListElement: visibleProjects.map((proj: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "CreativeWork",
        name: proj.title,
        description: proj.description,
        url: proj.liveLink || undefined,
        image: proj.imageUrl || undefined,
        creator: {
          "@type": "Person",
          name: "Zakaria Bin Moti",
        },
      },
    })),
  };

  return (
    <main className="w-full bg-[#080a10] relative selection:bg-white/20 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsJsonLd) }}
      />
      <Navbar />
      <ScrollyContainer heroData={data.hero} />
      
      <div className="bg-[#080a10] relative z-20">
        <AboutSection aboutData={data.about} />
        <AchievementsSection achievementsData={data.achievements} />
        <ProjectsSection projects={data.projects} />
        <SkillsSection skills={data.skills} />
        <ExperienceSection experiences={data.experiences} />
        <EducationSection educationData={data.education} />
        <ContactSection contactData={data.contact} />
      </div>
    </main>
  );
}
