import { getExperiences } from "./actions";
import ExperienceManager from "./ExperienceManager";

export const metadata = { title: "Experience Manager" };
export const dynamic = "force-dynamic";

export default async function ExperiencePage() {
  const experiences = await getExperiences();
  return <ExperienceManager initialExperiences={experiences} />;
}
