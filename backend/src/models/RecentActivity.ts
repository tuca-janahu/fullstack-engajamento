// src/models/RecentActivity.ts
import { Schema, model }...

const RecentActivitySchema = new Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['shop', 'financing'], 
    required: true 
  },
  description: { type: String, required: true }, 
  value: { type: Number, required: true }, 
  pointsChange: { type: Number, required: true },
  referenceId: { type: String, required: true },
}, { timestamps: true });

export const RecentActivity = model('RecentActivity', RecentActivitySchema);