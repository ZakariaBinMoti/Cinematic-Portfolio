import { getProjects } from "./actions";
import ProjectForm from "./ProjectForm";
import ProjectList from "./ProjectList";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Projects</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
          <ProjectForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Projects ({projects.length})</h2>
          <ProjectList projects={projects} />
        </div>
      </div>
    </div>
  );
}
