import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  category: string;
  items: string[];
  order: number;
}

const SkillSchema: Schema = new Schema({
  category: { type: String, required: true },
  items: { type: [String], required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);
