"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

export interface SerializedLead {
  _id: string;
  name: string;
  email: string;
  storeUrl: string;
  projectBudget: string;
  message: string;
  source: string;
  channel: string;
  status: "new" | "contacted" | "qualified" | "closed" | "archived";
  notes: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export async function getLeads(): Promise<SerializedLead[]> {
  try {
    await dbConnect();
    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();

    return leads.map((lead: any) => ({
      _id: lead._id.toString(),
      name: lead.name || "",
      email: lead.email || "",
      storeUrl: lead.storeUrl || "",
      projectBudget: lead.projectBudget || "",
      message: lead.message || "",
      source: lead.source || "website_ai_companion",
      channel: lead.channel || "website",
      status: (lead.status || "new") as SerializedLead["status"],
      notes: lead.notes || "",
      metadata: lead.metadata || {},
      createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: lead.updatedAt ? new Date(lead.updatedAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

export async function updateLeadStatus(
  leadId: string,
  status: "new" | "contacted" | "qualified" | "closed" | "archived"
) {
  try {
    await dbConnect();
    const validStatuses = ["new", "contacted", "qualified", "closed", "archived"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const updated = await Lead.findByIdAndUpdate(
      leadId,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      throw new Error("Lead not found");
    }

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating lead status:", error);
    throw new Error(error.message || "Failed to update lead status");
  }
}

export async function updateLeadNotes(leadId: string, notes: string) {
  try {
    await dbConnect();
    const updated = await Lead.findByIdAndUpdate(
      leadId,
      { $set: { notes, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      throw new Error("Lead not found");
    }

    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating lead notes:", error);
    throw new Error(error.message || "Failed to update notes");
  }
}

export async function deleteLead(leadId: string) {
  try {
    await dbConnect();
    const deleted = await Lead.findByIdAndDelete(leadId);

    if (!deleted) {
      throw new Error("Lead not found");
    }

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    throw new Error(error.message || "Failed to delete lead");
  }
}
