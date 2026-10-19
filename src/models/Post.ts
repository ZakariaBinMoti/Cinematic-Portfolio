import mongoose, { Schema, Document } from 'mongoose';

export interface IMetric {
  label: string;
  value: string;
}

export interface IPost extends Document {
  title: string;
  slug: string;
  type: 'blog' | 'case-study';
  summary: string;
  content: string;
  coverImage?: string;
  coverImagePublicId?: string;
  tags: string[];
  category: string;
  publishedAt: Date;
  isPublished: boolean;
  readingTime?: string;
  authorName?: string;
  authorRole?: string;
  // Case study specific fields
  projectId?: string;
  clientName?: string;
  clientUrl?: string;
  projectYear?: string;
  services?: string[];
  metrics?: IMetric[];
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, enum: ['blog', 'case-study'], index: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    coverImagePublicId: { type: String },
    tags: { type: [String], default: [] },
    category: { type: String, default: 'General' },
    publishedAt: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: true, index: true },
    readingTime: { type: String, default: '5 min read' },
    authorName: { type: String, default: 'Zakaria Bin Moti' },
    authorRole: { type: String, default: 'Lead Software Engineer & Shopify Architect' },
    // Case study specific
    projectId: { type: String },
    clientName: { type: String },
    clientUrl: { type: String },
    projectYear: { type: String },
    services: { type: [String], default: [] },
    metrics: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
