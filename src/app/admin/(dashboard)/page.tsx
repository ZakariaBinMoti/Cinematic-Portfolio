import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Experience from "@/models/Experience";
import Skill from "@/models/Skill";
import Content from "@/models/Content";
import Post from "@/models/Post";
import Lead from "@/models/Lead";
import { FALLBACK_POSTS } from "@/lib/posts";
import DashboardClient from "./DashboardClient";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function formatTimeAgo(dateString?: string | Date) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSecs < 60) return "Just now";
  if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
  if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
  if (diffInSecs < 604800) return `${Math.floor(diffInSecs / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  await dbConnect();

  const [projects, experiences, skills, contents, posts, leads] = await Promise.all([
    Project.find({}).sort({ updatedAt: -1 }).lean(),
    Experience.find({}).sort({ updatedAt: -1 }).lean(),
    Skill.find({}).sort({ updatedAt: -1 }).lean(),
    Content.find({}).sort({ updatedAt: -1 }).lean(),
    Post.find({}).sort({ updatedAt: -1 }).lean(),
    Lead.find({}).sort({ createdAt: -1 }).lean(),
  ]);

  const heroContent = contents.find((c: any) => c.section === "hero");
  const aboutContent = contents.find((c: any) => c.section === "about");
  const achievementsContent = contents.find((c: any) => c.section === "achievements");
  const educationContent = contents.find((c: any) => c.section === "education");
  const contactContent = contents.find((c: any) => c.section === "contact");

  const heroData = heroContent?.data || {};
  const aboutData = aboutContent?.data || {};
  const achievementsData = achievementsContent?.data || {};
  const educationData = educationContent?.data || {};
  const contactData = contactContent?.data || {};

  const heroConfigured = Boolean(heroData.headline && heroData.subheadline);
  const aboutConfigured = Boolean(aboutData.p1 || aboutData.p2);
  const achievementsConfigured = Boolean(achievementsData.metrics && achievementsData.metrics.length > 0);
  const educationConfigured = Boolean(educationData.items && educationData.items.length > 0);
  const contactConfigured = Boolean(contactData.email || contactData.linkedin);

  const projectsCount = projects.length;
  const projectsWithImages = projects.filter((p: any) => Boolean(p.imageUrl)).length;
  const experiencesCount = experiences.length;
  const skillsGroupCount = skills.length;
  const skillsCount = skills.reduce((sum: number, s: any) => sum + (Array.isArray(s.items) ? s.items.length : 0), 0);

  // Case studies and blogs
  const dbCaseStudies = posts.filter((p: any) => p.type === "case-study");
  const dbBlogs = posts.filter((p: any) => p.type === "blog");

  const fallbackCaseStudiesCount = FALLBACK_POSTS.filter((p) => p.type === "case-study").length;
  const fallbackBlogsCount = FALLBACK_POSTS.filter((p) => p.type === "blog").length;

  const caseStudiesCount = dbCaseStudies.length > 0 ? dbCaseStudies.length : fallbackCaseStudiesCount;
  const blogsCount = dbBlogs.length > 0 ? dbBlogs.length : fallbackBlogsCount;

  // Health checklist
  const healthChecks = [
    {
      id: "hero-copy",
      label: "Hero Copy Configured",
      passed: heroConfigured,
      hint: heroConfigured ? "Headline and tagline published" : "Missing headline or subheadline",
      href: "/admin/content?tab=hero",
    },
    {
      id: "about-copy",
      label: "About Narrative Detailed",
      passed: aboutConfigured,
      hint: aboutConfigured ? "Background bio paragraphs filled" : "Add your professional bio paragraphs",
      href: "/admin/content?tab=about",
    },
    {
      id: "case-studies-count",
      label: "Case Studies Published",
      passed: caseStudiesCount >= 3,
      hint: `${caseStudiesCount} verified client case studies live`,
      href: "/admin/case-studies",
    },
    {
      id: "blog-articles-count",
      label: "Technical SEO Blog Guides",
      passed: blogsCount >= 5,
      hint: `${blogsCount} high-ranking SEO articles published`,
      href: "/admin/blog",
    },
    {
      id: "projects-count",
      label: "Showcase Projects Published",
      passed: projectsCount >= 3,
      hint: `${projectsCount} project(s) online (recommended: 3+)`,
      href: "/admin/projects",
    },
    {
      id: "projects-images",
      label: "All Projects Have Cover Media",
      passed: projectsCount > 0 && projectsWithImages === projectsCount,
      hint: `${projectsWithImages}/${projectsCount} projects have Cloudinary media`,
      href: "/admin/projects",
    },
    {
      id: "experiences-count",
      label: "Experience Milestones Populated",
      passed: experiencesCount >= 1,
      hint: `${experiencesCount} role(s) configured in career timeline`,
      href: "/admin/experience",
    },
    {
      id: "skills-arsenal",
      label: "Technical Arsenal Categorized",
      passed: skillsCount >= 6,
      hint: `${skillsCount} skill tags across ${skillsGroupCount} categories`,
      href: "/admin/skills",
    },
  ];

  const passedCount = healthChecks.filter((c) => c.passed).length;
  const healthScore = Math.round((passedCount / healthChecks.length) * 100);

  // Aggregate recent activities
  const recentActivities: any[] = [];

  leads.slice(0, 3).forEach((l: any) => {
    recentActivities.push({
      id: `lead-${l._id}`,
      type: "lead",
      title: l.name ? `${l.name} (${l.email})` : l.email,
      action: "New AI Inbound Lead",
      updatedAt: l.createdAt || new Date(),
    });
  });

  posts.slice(0, 2).forEach((p: any) => {
    recentActivities.push({
      id: `post-${p._id}`,
      type: p.type === "case-study" ? "case-study" : "blog",
      title: p.title,
      action: p.type === "case-study" ? "Case Study updated" : "Blog Article updated",
      updatedAt: p.updatedAt || p.createdAt || new Date(),
    });
  });

  projects.slice(0, 2).forEach((p: any) => {
    recentActivities.push({
      id: `p-${p._id}`,
      type: "project",
      title: p.title,
      action: "Project updated",
      updatedAt: p.updatedAt || p.createdAt || new Date(),
    });
  });

  experiences.slice(0, 1).forEach((e: any) => {
    recentActivities.push({
      id: `e-${e._id}`,
      type: "experience",
      title: `${e.title} at ${e.company}`,
      action: "Experience updated",
      updatedAt: e.updatedAt || e.createdAt || new Date(),
    });
  });

  contents.slice(0, 1).forEach((c: any) => {
    recentActivities.push({
      id: `c-${c._id}`,
      type: "content",
      title: `${c.section.toUpperCase()} Copy Section`,
      action: "Copy updated",
      updatedAt: c.updatedAt || c.createdAt || new Date(),
    });
  });

  recentActivities.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const finalRecentActivity = recentActivities.slice(0, 6).map((item) => ({
    ...item,
    timeAgo: formatTimeAgo(item.updatedAt),
  }));

  const leadsCount = leads.length;
  const newLeadsCount = leads.filter((l: any) => l.status === "new").length;

  return (
    <DashboardClient
      stats={{
        leadsCount,
        newLeadsCount,
        projectsCount,
        projectsWithImages,
        caseStudiesCount,
        blogsCount,
        experiencesCount,
        skillsCount,
        skillsGroupCount,
        heroConfigured,
        aboutConfigured,
      }}
      healthChecks={healthChecks}
      healthScore={healthScore}
      recentActivity={finalRecentActivity}
      userEmail={session?.user?.email || "Admin"}
    />
  );
}
