import { getProjects } from "./actions";
import ProjectsManager from "./ProjectsManager";

export const metadata = { title: "Projects Manager" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsManager initialProjects={projects} />;
}
