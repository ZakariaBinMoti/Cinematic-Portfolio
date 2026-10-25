"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";
import AiLeadSettings from "@/models/AiLeadSettings";
import {
  generateAiProspectsWithGemini,
  GenerationOptions,
  GeneratedProspect,
} from "@/lib/ai-lead-generator";
import { SerializedLead } from "./actions";

export interface SerializedAiSettings {
  dailyQuota: number;
  autoPilotEnabled: boolean;
  selectedCategories: string[];
  selectedLocations: string[];
  selectedPlatforms: string[];
  customNiches: string[];
  leadsGeneratedToday: number;
  leadsGeneratedTotal: number;
  lastGeneratedDate: string;
}

export async function getAiRadarSettings(): Promise<SerializedAiSettings> {
  try {
    await dbConnect();
    const todayStr = new Date().toISOString().slice(0, 10);

    let settings = await AiLeadSettings.findOne();
    if (!settings) {
      settings = await AiLeadSettings.create({
        dailyQuota: 10,
        autoPilotEnabled: true,
        selectedCategories: [
          "restaurant",
          "grocery",
          "mechanic",
          "fashion",
          "beauty",
          "fitness",
          "home_furniture",
          "jewelry",
        ],
        selectedLocations: ["United States", "United Kingdom", "Canada", "Australia"],
        selectedPlatforms: ["WooCommerce", "Wix", "Squarespace", "No Online Store", "Shopify"],
        customNiches: [],
        leadsGeneratedToday: 0,
        leadsGeneratedTotal: 0,
        lastGeneratedDate: todayStr,
      });
    } else if (settings.lastGeneratedDate !== todayStr) {
      // New day reset
      settings.leadsGeneratedToday = 0;
      settings.lastGeneratedDate = todayStr;
      await settings.save();
    }

    return {
      dailyQuota: settings.dailyQuota ?? 10,
      autoPilotEnabled: Boolean(settings.autoPilotEnabled),
      selectedCategories: settings.selectedCategories || [],
      selectedLocations: settings.selectedLocations || [],
      selectedPlatforms: settings.selectedPlatforms || [],
      customNiches: settings.customNiches || [],
      leadsGeneratedToday: settings.leadsGeneratedToday || 0,
      leadsGeneratedTotal: settings.leadsGeneratedTotal || 0,
      lastGeneratedDate: settings.lastGeneratedDate || todayStr,
    };
  } catch (err: any) {
    console.error("Error fetching AI Radar settings:", err);
    return {
      dailyQuota: 10,
      autoPilotEnabled: true,
      selectedCategories: ["restaurant", "grocery", "mechanic"],
      selectedLocations: ["United States"],
      selectedPlatforms: ["WooCommerce"],
      customNiches: [],
      leadsGeneratedToday: 0,
      leadsGeneratedTotal: 0,
      lastGeneratedDate: new Date().toISOString().slice(0, 10),
    };
  }
}

export async function updateAiRadarSettings(
  data: Partial<SerializedAiSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();
    await AiLeadSettings.findOneAndUpdate(
      {},
      { $set: data },
      { upsert: true, new: true }
    );
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating AI Radar settings:", err);
    return { success: false, error: err.message || "Failed to update settings" };
  }
}

export async function generateAiProspectBatch(
  options: GenerationOptions
): Promise<{ success: boolean; prospects: GeneratedProspect[]; error?: string }> {
  try {
    await dbConnect();
    const prospects = await generateAiProspectsWithGemini(options);

    // Increment today and total counts in settings
    const todayStr = new Date().toISOString().slice(0, 10);
    const settings = await AiLeadSettings.findOne();
    if (settings) {
      if (settings.lastGeneratedDate !== todayStr) {
        settings.leadsGeneratedToday = prospects.length;
        settings.lastGeneratedDate = todayStr;
      } else {
        settings.leadsGeneratedToday = (settings.leadsGeneratedToday || 0) + prospects.length;
      }
      settings.leadsGeneratedTotal = (settings.leadsGeneratedTotal || 0) + prospects.length;
      await settings.save();
    }

    revalidatePath("/admin/leads");
    return { success: true, prospects };
  } catch (err: any) {
    console.error("Error generating AI prospects:", err);
    return { success: false, prospects: [], error: err.message || "Failed to generate prospects" };
  }
}

export async function importProspectsToCrm(
  prospects: GeneratedProspect[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    await dbConnect();

    let importedCount = 0;

    for (const p of prospects) {
      // Check if prospect with same email already exists
      const existing = await Lead.findOne({ email: p.email.toLowerCase() });
      if (existing) {
        // Skip duplicate
        continue;
      }

      const created = await Lead.create({
        name: p.ownerName,
        email: p.email.toLowerCase(),
        phone: p.phone,
        company: p.businessName,
        industry: p.industry,
        location: p.location,
        storeUrl: p.website,
        website: p.website,
        currentPlatform: p.currentPlatform,
        projectType: p.currentPlatform.toLowerCase().includes("woo")
          ? "shopify_migration"
          : "new_shopify_store",
        projectBudget: `$${p.estimatedValue.toLocaleString()}`,
        estimatedValue: p.estimatedValue,
        message: p.pitchEmailBody,
        source: "ai_prospect_radar",
        channel: "cold_outreach",
        status: "new",
        priority: p.priority,
        leadScore: p.leadScore,
        tags: ["AI Radar", p.industry, p.currentPlatform],
        notes: `Owner: ${p.ownerName} (${p.ownerRole})\nIdentified Bottlenecks:\n• ${p.painPoints.join("\n• ")}\n\nProposed Solution:\n${p.proposedSolution}`,
        metadata: {
          pitchEmailSubject: p.pitchEmailSubject,
          pitchEmailBody: p.pitchEmailBody,
          pitchDmMessage: p.pitchDmMessage,
          painPoints: p.painPoints,
          proposedSolution: p.proposedSolution,
          aiGeneratedAt: p.generatedAt,
        },
      });

      // Log CRM activity
      await Activity.create({
        leadId: created._id,
        type: "created",
        description: `Lead auto-discovered via AI Radar (${p.industry} in ${p.location})`,
        newValue: "new",
        performedBy: "ai_radar",
      });

      importedCount++;
    }

    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { success: true, count: importedCount };
  } catch (err: any) {
    console.error("Error importing prospects to CRM:", err);
    return { success: false, count: 0, error: err.message || "Failed to import leads" };
  }
}
