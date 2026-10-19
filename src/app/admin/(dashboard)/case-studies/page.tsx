import { getAdminCaseStudies } from "./actions";
import CaseStudiesManager from "./CaseStudiesManager";

export const metadata = { title: "Case Studies Manager | Admin Studio" };
export const dynamic = "force-dynamic";

export default async function CaseStudiesPage() {
  const caseStudies = await getAdminCaseStudies();
  return <CaseStudiesManager initialCaseStudies={caseStudies} />;
}
