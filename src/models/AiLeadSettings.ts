import mongoose, { Schema, Document } from "mongoose";

export interface IAiLeadSettings extends Document {
  dailyQuota: number;
  autoPilotEnabled: boolean;
  selectedCategories: string[];
  selectedLocations: string[];
  selectedPlatforms: string[];
  customNiches: string[];
  leadsGeneratedToday: number;
  leadsGeneratedTotal: number;
  lastGeneratedDate: string; // YYYY-MM-DD
  updatedAt: Date;
  createdAt: Date;
}

const AiLeadSettingsSchema: Schema = new Schema(
  {
    dailyQuota: { type: Number, default: 10, min: 1, max: 100 },
    autoPilotEnabled: { type: Boolean, default: true },
    selectedCategories: {
      type: [String],
      default: [
        "restaurant",
        "grocery",
        "mechanic",
        "fashion",
        "beauty",
        "fitness",
        "home_furniture",
        "jewelry",
      ],
    },
    selectedLocations: {
      type: [String],
      default: ["United States", "United Kingdom", "Canada", "Australia"],
    },
    selectedPlatforms: {
      type: [String],
      default: ["WooCommerce", "Wix", "Squarespace", "No Online Store", "Shopify"],
    },
    customNiches: { type: [String], default: [] },
    leadsGeneratedToday: { type: Number, default: 0 },
    leadsGeneratedTotal: { type: Number, default: 0 },
    lastGeneratedDate: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  { timestamps: true }
);

export default mongoose.models.AiLeadSettings ||
  mongoose.model<IAiLeadSettings>("AiLeadSettings", AiLeadSettingsSchema);
