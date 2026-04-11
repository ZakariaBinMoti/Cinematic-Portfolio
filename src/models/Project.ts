import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  techStack: string[];
  liveLink: string;
  imageUrl: string;
  imagePublicId?: string;
  order: number;
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: { type: [String], default: [] },
  liveLink: { type: String },
  imageUrl: { type: String },
  imagePublicId: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
