import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
}

const ExperienceSchema: Schema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema);
