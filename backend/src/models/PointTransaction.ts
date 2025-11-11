// src/models/PointTransaction.ts
import { Schema, model }...

const PointTransactionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  type: { 
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
  referenceId: { type: String, required: true },
  description: { type: String }     
}, { timestamps: true });

export const PointTransaction = model('PointTransaction', PointTransactionSchema);