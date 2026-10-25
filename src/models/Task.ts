import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  leadId: mongoose.Types.ObjectId;
  title: string;
  type: 'follow_up' | 'send_proposal' | 'schedule_call' | 'send_invoice' | 'custom';
  dueAt: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['follow_up', 'send_proposal', 'schedule_call', 'send_invoice', 'custom'],
      default: 'follow_up',
    },
    dueAt: { type: Date, required: true, index: true },
    completedAt: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    notes: { type: String },
    isCompleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
