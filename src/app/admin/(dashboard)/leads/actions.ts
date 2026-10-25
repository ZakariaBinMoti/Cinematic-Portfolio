"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";

export interface SerializedLead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  location?: string;
  storeUrl: string;
  website?: string;
  linkedinUrl?: string;
  currentPlatform?: string;
  projectType?: string;
  projectBudget: string;
  estimatedValue?: number;
  message: string;
  source: string;
  channel: string;
  status: "new" | "contacted" | "qualified" | "won" | "lost" | "closed" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  leadScore: number;
  tags: string[];
  notes: string;
  lostReason?: string;
  metadata?: Record<string, any>;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedActivity {
  _id: string;
  leadId: string;
  type: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  performedBy: string;
  createdAt: string;
}

function serializeLeadDoc(lead: any): SerializedLead {
  return {
    _id: lead._id.toString(),
    name: lead.name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    company: lead.company || "",
    industry: lead.industry || "",
    location: lead.location || "",
    storeUrl: lead.storeUrl || "",
    website: lead.website || "",
    linkedinUrl: lead.linkedinUrl || "",
    currentPlatform: lead.currentPlatform || "",
    projectType: lead.projectType || "",
    projectBudget: lead.projectBudget || "",
    estimatedValue: typeof lead.estimatedValue === "number" ? lead.estimatedValue : undefined,
    message: lead.message || "",
    source: lead.source || "website_ai_companion",
    channel: lead.channel || "website",
    status: (lead.status || "new") as SerializedLead["status"],
    priority: (lead.priority || "medium") as SerializedLead["priority"],
    leadScore: typeof lead.leadScore === "number" ? lead.leadScore : 0,
    tags: Array.isArray(lead.tags) ? lead.tags : [],
    notes: lead.notes || "",
    lostReason: lead.lostReason || "",
    metadata: lead.metadata || {},
    lastContactedAt: lead.lastContactedAt ? new Date(lead.lastContactedAt).toISOString() : undefined,
    nextFollowUpAt: lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toISOString() : undefined,
    closedAt: lead.closedAt ? new Date(lead.closedAt).toISOString() : undefined,
    createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: lead.updatedAt ? new Date(lead.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export async function getLeads(): Promise<SerializedLead[]> {
  try {
    await dbConnect();
    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
    return leads.map(serializeLeadDoc);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

export async function createLead(data: Partial<SerializedLead>): Promise<{ success: boolean; lead?: SerializedLead; error?: string }> {
  try {
    await dbConnect();

    if (!data.email || !data.email.trim()) {
      return { success: false, error: "Email is required" };
    }

    const newLead = await Lead.create({
      name: data.name?.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim(),
      company: data.company?.trim(),
      industry: data.industry?.trim(),
      location: data.location?.trim(),
      storeUrl: data.storeUrl?.trim(),
      website: data.website?.trim(),
      linkedinUrl: data.linkedinUrl?.trim(),
      currentPlatform: data.currentPlatform?.trim(),
      projectType: data.projectType || "other",
      projectBudget: data.projectBudget?.trim(),
      estimatedValue: data.estimatedValue,
      message: data.message?.trim(),
      source: data.source || "admin_manual_entry",
      channel: data.channel || "direct",
      status: data.status || "new",
      priority: data.priority || "medium",
      leadScore: data.leadScore ?? 15,
      tags: data.tags || [],
      notes: data.notes?.trim(),
    });

    // Automatically log activity
    await Activity.create({
      leadId: newLead._id,
      type: "created",
      description: `Lead created via ${data.channel || "manual entry"}`,
      newValue: newLead.status,
      performedBy: "zakaria",
    });

    revalidatePath("/admin/leads");
    revalidatePath("/admin");

    return {
      success: true,
      lead: serializeLeadDoc(newLead),
    };
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return { success: false, error: error.message || "Failed to create lead" };
  }
}

export async function updateLead(
  leadId: string,
  data: Partial<SerializedLead>
): Promise<{ success: boolean; lead?: SerializedLead; error?: string }> {
  try {
    await dbConnect();

    const currentLead = await Lead.findById(leadId);
    if (!currentLead) {
      return { success: false, error: "Lead not found" };
    }

    // Detect status change to log activity
    const isStatusChanged = data.status && data.status !== currentLead.status;
    const oldStatus = currentLead.status;

    // Detect note addition
    const isNoteChanged = typeof data.notes === "string" && data.notes !== currentLead.notes;

    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date(),
    };

    // If status changed to won or closed, set closedAt
    if ((data.status === "won" || data.status === "closed") && currentLead.status !== "won" && currentLead.status !== "closed") {
      updatePayload.closedAt = new Date();
    }

    const updated = await Lead.findByIdAndUpdate(leadId, { $set: updatePayload }, { new: true });

    if (!updated) {
      return { success: false, error: "Lead not found" };
    }

    if (isStatusChanged) {
      await Activity.create({
        leadId: updated._id,
        type: "status_change",
        description: `Status changed from ${oldStatus} to ${data.status}`,
        previousValue: oldStatus,
        newValue: data.status,
        performedBy: "zakaria",
      });
    }

    if (isNoteChanged) {
      await Activity.create({
        leadId: updated._id,
        type: "note_added",
        description: "Admin notes updated",
        performedBy: "zakaria",
      });
    }

    revalidatePath("/admin/leads");
    revalidatePath("/admin");

    return {
      success: true,
      lead: serializeLeadDoc(updated),
    };
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return { success: false, error: error.message || "Failed to update lead" };
  }
}

export async function updateLeadStatus(
  leadId: string,
  status: SerializedLead["status"]
) {
  try {
    await dbConnect();
    const validStatuses = ["new", "contacted", "qualified", "won", "lost", "closed", "archived"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error("Lead not found");
    }

    const previousStatus = lead.status;
    lead.status = status;
    lead.updatedAt = new Date();
    if (status === "won" || status === "closed") {
      lead.closedAt = new Date();
    }
    await lead.save();

    // Log activity
    await Activity.create({
      leadId: lead._id,
      type: "status_change",
      description: `Status updated from "${previousStatus}" to "${status}"`,
      previousValue: previousStatus,
      newValue: status,
      performedBy: "zakaria",
    });

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

    // Log activity
    await Activity.create({
      leadId: updated._id,
      type: "note_added",
      description: "Note updated by admin",
      performedBy: "zakaria",
    });

    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating lead notes:", error);
    throw new Error(error.message || "Failed to update notes");
  }
}

export async function logActivity(
  leadId: string,
  activity: {
    type: string;
    description: string;
    previousValue?: string;
    newValue?: string;
    performedBy?: string;
  }
): Promise<{ success: boolean; activity?: SerializedActivity; error?: string }> {
  try {
    await dbConnect();
    const created = await Activity.create({
      leadId,
      type: activity.type,
      description: activity.description,
      previousValue: activity.previousValue,
      newValue: activity.newValue,
      performedBy: activity.performedBy || "zakaria",
    });

    return {
      success: true,
      activity: {
        _id: created._id.toString(),
        leadId: created.leadId.toString(),
        type: created.type,
        description: created.description,
        previousValue: created.previousValue,
        newValue: created.newValue,
        performedBy: created.performedBy,
        createdAt: created.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error logging activity:", error);
    return { success: false, error: error.message || "Failed to log activity" };
  }
}

export async function getLeadActivities(leadId: string): Promise<SerializedActivity[]> {
  try {
    await dbConnect();
    const activities = await Activity.find({ leadId }).sort({ createdAt: -1 }).lean();
    return activities.map((act: any) => ({
      _id: act._id.toString(),
      leadId: act.leadId.toString(),
      type: act.type,
      description: act.description,
      previousValue: act.previousValue,
      newValue: act.newValue,
      performedBy: act.performedBy || "zakaria",
      createdAt: act.createdAt ? new Date(act.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}

export async function bulkUpdateLeadStatus(
  leadIds: string[],
  status: SerializedLead["status"]
): Promise<{ success: boolean; count: number }> {
  try {
    await dbConnect();
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { status, updatedAt: new Date() } }
    );

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true, count: result.modifiedCount };
  } catch (error: any) {
    console.error("Error in bulk update status:", error);
    throw new Error(error.message || "Failed to bulk update status");
  }
}

export async function bulkUpdateLeadPriority(
  leadIds: string[],
  priority: SerializedLead["priority"]
): Promise<{ success: boolean; count: number }> {
  try {
    await dbConnect();
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { priority, updatedAt: new Date() } }
    );

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true, count: result.modifiedCount };
  } catch (error: any) {
    console.error("Error in bulk update priority:", error);
    throw new Error(error.message || "Failed to bulk update priority");
  }
}

export async function bulkDeleteLeads(leadIds: string[]): Promise<{ success: boolean; count: number }> {
  try {
    await dbConnect();
    const result = await Lead.deleteMany({ _id: { $in: leadIds } });
    await Activity.deleteMany({ leadId: { $in: leadIds } });

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true, count: result.deletedCount };
  } catch (error: any) {
    console.error("Error in bulk delete leads:", error);
    throw new Error(error.message || "Failed to bulk delete leads");
  }
}

export async function deleteLead(leadId: string) {
  try {
    await dbConnect();
    const deleted = await Lead.findByIdAndDelete(leadId);

    if (!deleted) {
      throw new Error("Lead not found");
    }

    // Clean up activities
    await Activity.deleteMany({ leadId });

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    throw new Error(error.message || "Failed to delete lead");
  }
}

export async function getLeadById(leadId: string): Promise<SerializedLead | null> {
  try {
    await dbConnect();
    const lead = await Lead.findById(leadId).lean();
    if (!lead) return null;
    return serializeLeadDoc(lead);
  } catch (error) {
    console.error("Error fetching lead by id:", error);
    return null;
  }
}

export async function logCallOrMeeting(
  leadId: string,
  data: {
    type: "call" | "meeting";
    title: string;
    outcome: string;
    notes?: string;
    durationMinutes?: number;
  }
): Promise<{ success: boolean; activity?: SerializedActivity; error?: string }> {
  try {
    await dbConnect();
    const durationText = data.durationMinutes ? ` (${data.durationMinutes} min)` : "";
    const description = `${data.type === "call" ? "Phone Call" : "Meeting"} logged: "${data.title}"${durationText} · Outcome: ${data.outcome}${data.notes ? ` — ${data.notes}` : ""}`;

    const activity = await Activity.create({
      leadId,
      type: data.type,
      description,
      newValue: data.outcome,
      performedBy: "zakaria",
    });

    // Update lead's lastContactedAt and status if currently new
    const lead = await Lead.findById(leadId);
    if (lead) {
      lead.lastContactedAt = new Date();
      if (lead.status === "new") {
        lead.status = "contacted";
      }
      await lead.save();
    }

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");
    return {
      success: true,
      activity: {
        _id: activity._id.toString(),
        leadId: activity.leadId.toString(),
        type: activity.type,
        description: activity.description,
        previousValue: activity.previousValue,
        newValue: activity.newValue,
        performedBy: activity.performedBy,
        createdAt: activity.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error logging call/meeting:", error);
    return { success: false, error: error.message || "Failed to log interaction" };
  }
}

export async function scheduleFollowUp(
  leadId: string,
  followUpDate: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();
    const dateObj = new Date(followUpDate);
    if (isNaN(dateObj.getTime())) {
      return { success: false, error: "Invalid date" };
    }

    await Lead.findByIdAndUpdate(leadId, {
      $set: {
        nextFollowUpAt: dateObj,
        updatedAt: new Date(),
      },
    });

    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

    await Activity.create({
      leadId,
      type: "follow_up_set",
      description: `Follow-up scheduled for ${formattedDate}${notes ? ` (Note: ${notes})` : ""}`,
      newValue: followUpDate,
      performedBy: "zakaria",
    });

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Error scheduling follow-up:", error);
    return { success: false, error: error.message || "Failed to schedule follow-up" };
  }
}

