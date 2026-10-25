import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  location?: string;
  storeUrl?: string;
  website?: string;
  linkedinUrl?: string;
  currentPlatform?: string;
  projectType?: string;
  projectBudget?: string;
  estimatedValue?: number;
  message?: string;
  source: string;
  channel: string;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  leadScore: number;
  tags: string[];
  notes?: string;
  lostReason?: string;
  metadata?: Record<string, any>;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    storeUrl: { type: String, trim: true },
    website: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    currentPlatform: { type: String, trim: true },
    projectType: {
      type: String,
      enum: [
        'new_shopify_store',
        'shopify_redesign',
        'shopify_migration',
        'custom_website',
        'landing_page',
        'maintenance',
        'consultation',
        'other',
        '',
      ],
    },
    projectBudget: { type: String, trim: true },
    estimatedValue: { type: Number },
    message: { type: String, trim: true },
    source: { type: String, default: 'website_ai_companion' }, // Explicitly identifies website AI lead
    channel: { type: String, default: 'website' }, // Multi-channel ready (website, linkedin, maps, etc.)
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'won', 'lost', 'closed', 'archived'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    leadScore: { type: Number, default: 0, min: 0, max: 100 },
    tags: [{ type: String, trim: true }],
    notes: { type: String },
    lostReason: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    lastContactedAt: { type: Date },
    nextFollowUpAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for efficient querying
LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ channel: 1 });
LeadSchema.index({ priority: 1 });
LeadSchema.index({ nextFollowUpAt: 1 });
LeadSchema.index({ tags: 1 });

// Prevent re-compilation of existing model
export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

