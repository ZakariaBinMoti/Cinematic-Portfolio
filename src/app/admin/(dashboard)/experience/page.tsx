import { getExperiences } from "./actions";
import ExperienceForm from "./ExperienceForm";
import ExperienceList from "./ExperienceList";

export const dynamic = "force-dynamic";

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Experience</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Experience</h2>
          <ExperienceForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Experience ({experiences.length})</h2>
          <ExperienceList experiences={experiences} />
        </div>
      </div>
    </div>
  );
}
