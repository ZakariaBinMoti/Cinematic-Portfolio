import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name?: string;
  email: string;
  storeUrl?: string;
  projectBudget?: string;
  message?: string;
  source: string; // "website_ai_companion", "website_contact_form", "linkedin", "google_maps"
  channel: string; // "website", "linkedin", "google_maps", "outreach"
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'archived';
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    storeUrl: { type: String, trim: true },
    projectBudget: { type: String, trim: true },
    message: { type: String, trim: true },
    source: { type: String, default: 'website_ai_companion' }, // Explicitly identifies website AI lead
    channel: { type: String, default: 'website' }, // Multi-channel ready (website, linkedin, maps, etc.)
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'closed', 'archived'],
      default: 'new',
    },
    notes: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Prevent re-compilation of existing model
export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
