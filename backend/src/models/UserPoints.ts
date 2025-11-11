import { Schema, model, Document } from 'mongoose';

// Interface para tipagem (TypeScript)
export interface IUserPoints extends Document {
  userId: string;
  balance: number;
}

// Schema (Estrutura no MongoDB)
const UserPointsSchema = new Schema<IUserPoints>({
  userId: { 
    type: String, 
    required: true, 
    unique: true, // Cada usuário só pode ter um documento de saldo
    index: true // Otimiza a busca por userId
  },
  balance: { 
    type: Number, 
    required: true, 
    default: 0 
  }
}, { 
  timestamps: true // Adiciona createdAt e updatedAt
});

// Criando o índice para garantir unicidade
UserPointsSchema.index({ userId: 1 }, { unique: true });

export const UserPoints = model<IUserPoints>('UserPoints', UserPointsSchema);