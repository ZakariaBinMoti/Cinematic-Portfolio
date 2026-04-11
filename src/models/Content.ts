import mongoose, { Schema, Document } from 'mongoose';

// Flexible schema designed to store various singletons like Hero, About, Contact
export interface IContent extends Document {
  section: string; // e.g., 'hero', 'about', 'contact', 'education', 'achievements'
  data: Record<string, any>;
}

const ContentSchema: Schema = new Schema({
  section: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);
