import { getSkills } from "./actions";
import SkillsManager from "./SkillsManager";

export const metadata = { title: "Skills Manager" };
export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await getSkills();
  return <SkillsManager initialSkills={skills} />;
}
