import { notFound } from "next/navigation";
import { getLeadById, getLeadActivities } from "../actions";
import LeadDetailClient from "./LeadDetailClient";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);
  return {
    title: lead ? `${lead.company || lead.name || lead.email} | Lead Profile` : "Lead Profile | Admin Studio",
  };
}

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  const activities = await getLeadActivities(id);

  return <LeadDetailClient initialLead={lead} initialActivities={activities} />;
}
