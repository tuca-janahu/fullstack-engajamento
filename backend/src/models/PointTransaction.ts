import { Schema, model, Document } from 'mongoose';

export interface IPointTransaction extends Document {
  userId: string;
  type: 'earn' | 'spend';
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
  type: { 
    type: String, 
    enum: ['earn', 'spend'], // 'ganho' ou 'gasto'
    required: true 
  },
  amount: { 
    type: Number, // Sempre armazenar como um valor positivo
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
  // ID da Compra (Loja) ou Contrato (Financiamento)
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