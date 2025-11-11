import { Schema, model, Document } from 'mongoose';

export interface IRecentActivity extends Document {
  userId: string;
  type: 'shop' | 'financing';
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
  type: { 
    type: String, 
    enum: ['shop', 'financing'], // Origem da atividade
    required: true 
  },
  description: { 
    type: String, 
    required: true // Ex: "Compra de 'Produto X'"
  },
  value: { 
    type: Number, 
    required: true // Valor em R$ da operação
  },
  pointsChange: { 
    type: Number, 
    required: true // Ex: +150 (ganho) ou -50 (gasto)
  },
  referenceId: { 
    type: String, 
    required: true // ID para criar o link no frontend
  },
}, { 
  timestamps: true // Usaremos 'createdAt' para ordenar
});

export const RecentActivity = model<IRecentActivity>('RecentActivity', RecentActivitySchema);