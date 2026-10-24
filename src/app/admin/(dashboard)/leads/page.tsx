import { getLeads } from "./actions";
import LeadsManager from "./LeadsManager";

export const metadata = { title: "Leads & Inquiries | Admin Studio" };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeads();
  return <LeadsManager initialLeads={leads} />;
}
