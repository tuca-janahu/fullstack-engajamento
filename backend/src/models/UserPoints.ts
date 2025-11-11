import { Schema, model, Document } from 'mongoose';

export interface IUserPoints extends Document {
  userId: string;
  balance: number;
}

const UserPointsSchema = new Schema<IUserPoints>({
  userId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  balance: { 
    type: Number, 
    required: true, 
    default: 0 
  }
}, { 
  timestamps: true 
});

UserPointsSchema.index({ userId: 1 }, { unique: true });

export const UserPoints = model<IUserPoints>('UserPoints', UserPointsSchema);