import { Schema, model, Document } from 'mongoose';

export interface IRecentActivity extends Document {
  userId: string;
  type_RA: 'shop' | 'financing';
  description: string;
  value: number;
  pointsChange: number;
  referenceId: string;
}

const RecentActivitySchema = new Schema<IRecentActivity>({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  type_RA: { 
    type: String, 
    enum: ['shop', 'financing'], 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  value: { 
    type: Number, 
    required: true
  },
  pointsChange: { 
    type: Number, 
    required: true 
  },
  referenceId: { 
    type: String, 
    required: true 
  },
}, { 
  timestamps: true 
});

export const RecentActivity = model<IRecentActivity>('RecentActivity', RecentActivitySchema);