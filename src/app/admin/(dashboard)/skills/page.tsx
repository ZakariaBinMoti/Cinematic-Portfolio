import { getSkills } from "./actions";
import SkillForm from "./SkillForm";
import SkillList from "./SkillList";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await getSkills();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Skills</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Skill Category</h2>
          <SkillForm />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Skills ({skills.length})</h2>
          <SkillList skills={skills} />
        </div>
      </div>
    </div>
  );
}
