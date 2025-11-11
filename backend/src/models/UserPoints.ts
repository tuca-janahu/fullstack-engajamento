import { Schema, model } from 'mongoose';

const UserPointsSchema = new Schema({
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
}, { timestamps: true });

export const UserPoints = model('UserPoints', UserPointsSchema);