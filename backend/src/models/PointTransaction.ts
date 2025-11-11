import { Schema, model, Document } from 'mongoose';

export interface IPointTransaction extends Document {
  userId: string;
  type_pt: 'earn' | 'spend';
  amount: number;
  source: 'shop_purchase' | 'financing_contract' | 'shop_discount' | 'financing_discount';
  referenceId: string;
  description: string;
}

const PointTransactionSchema = new Schema<IPointTransaction>({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  type_pt: { 
    type: String, 
    enum: ['earn', 'spend'],
    required: true 
  },
  amount: { 
    type: Number,
    required: true 
  },
  source: {
    type: String,
    enum: [
      'shop_purchase', 
      'financing_contract',
      'shop_discount',
      'financing_discount'
    ],
    required: true
  },
  referenceId: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    required: false
  }
}, { timestamps: true });

export const PointTransaction = model<IPointTransaction>('PointTransaction', PointTransactionSchema);