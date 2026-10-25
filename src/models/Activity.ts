import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  leadId: mongoose.Types.ObjectId;
  type:
    | 'status_change'
    | 'note_added'
    | 'email_sent'
    | 'call'
    | 'meeting'
    | 'follow_up_set'
    | 'created'
    | 'updated'
    | 'tag_added'
    | 'score_changed';
  description: string;
  previousValue?: string;
  newValue?: string;
  performedBy: string; // "system" | "zakaria" | "ai"
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    previousValue: { type: String },
    newValue: { type: String },
    performedBy: { type: String, default: 'zakaria' },
  },
  { timestamps: true }
);

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
