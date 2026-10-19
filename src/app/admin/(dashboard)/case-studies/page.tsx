import { getAdminCaseStudies } from "./actions";
import { getProjects } from "../projects/actions";
import CaseStudiesManager from "./CaseStudiesManager";

export const metadata = { title: "Case Studies Manager | Admin Studio" };
export const dynamic = "force-dynamic";

export default async function CaseStudiesPage() {
  const [caseStudies, projects] = await Promise.all([
    getAdminCaseStudies(),
    getProjects(),
  ]);

  return <CaseStudiesManager initialCaseStudies={caseStudies} availableProjects={projects} />;
}
