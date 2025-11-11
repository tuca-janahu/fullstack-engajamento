import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import { UserPoints } from '../models/UserPoints';
import { PointTransaction } from '../models/PointTransaction';
import { RecentActivity } from '../models/RecentActivity';

// --- MUDANÇA AQUI ---
// pointsEarned agora é opcional. Vamos ignorar o que o outro time enviar
// e vamos calcular com base no 'value'.
const recordActivitySchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  type: z.enum(['shop', 'financing'] as const, {
    message: "Tipo deve ser 'shop' ou 'financing'"
  }),
  description: z.string().min(1, 'description é obrigatória'),
  value: z.number().positive('value (R$) deve ser positivo'),
  pointsEarned: z.number().min(0).optional(), // <-- MUDANÇA: Tornou-se opcional
  pointsSpent: z.number().min(0, 'pointsSpent não pode ser negativo'),
  referenceId: z.string().min(1, 'referenceId é obrigatório')
});

// --- MUDANÇA AQUI ---
// Definimos sua regra de negócio fora da função
const PONTOS_POR_REAL = 2;


export const recordActivity = async (req: Request, res: Response) => {
  let validatedData;
  try {
    validatedData = recordActivitySchema.parse(req.body);
  } catch (error) {
    return res.status(400).json({ 
      message: 'Dados da requisição inválidos', 
      errors: (error as z.ZodError).issues 
    });
  }

  // --- MUDANÇA AQUI ---
  // Pegamos o 'value' e o 'pointsSpent' da requisição...
  const {
    userId,
    type,
    description,
    value, // R$ 120000 no seu teste
    pointsSpent,
    referenceId
  } = validatedData;
  
  // ...E AGORA CALCULAMOS OS PONTOS GANHOS AQUI!
  // Math.floor() garante que não teremos pontos quebrados (ex: 2.5 pontos)
  const calculatedPointsEarned = Math.floor(value * PONTOS_POR_REAL);
  // No seu teste: 120000 * 2 = 240000 pontos
  // --- FIM DA MUDANÇA ---


  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const userPoints = await UserPoints.findOneAndUpdate(
      { userId: userId },
      { $setOnInsert: { userId: userId, balance: 0 } },
      { upsert: true, new: true, session: session }
    );

    let totalPointsChange = 0;
    
    // Processar gastos (continua igual)
    if (pointsSpent > 0) {
      if (userPoints.balance < pointsSpent) {
        throw new Error('Saldo de pontos insuficiente');
      }
      await PointTransaction.create([{
        userId: userId,
        type: 'spend',
        amount: pointsSpent,
        source: type === 'shop' ? 'shop_discount' : 'financing_discount',
        referenceId: referenceId,
        description: `Desconto em: ${description}`
      }], { session: session });

      userPoints.balance -= pointsSpent;
      totalPointsChange -= pointsSpent;
    }

    // --- MUDANÇA AQUI ---
    // Processar ganhos (agora usa a nossa variável calculada)
    if (calculatedPointsEarned > 0) { // <-- MUDANÇA
      await PointTransaction.create([{
        userId: userId,
        type: 'earn',
        amount: calculatedPointsEarned, // <-- MUDANÇA
        source: type === 'shop' ? 'shop_purchase' : 'financing_contract',
        referenceId: referenceId,
        description: `Pontos por: ${description}`
      }], { session: session });

      userPoints.balance += calculatedPointsEarned; // <-- MUDANÇA
      totalPointsChange += calculatedPointsEarned; // <-- MUDANÇA
    }

    // Criar a Atividade Recente (pega o 'totalPointsChange' atualizado)
    await RecentActivity.create([{
      userId: userId,
      type: type,
      description: description,
      value: value,
      pointsChange: totalPointsChange, // <-- Esta variável já está correta
      referenceId: referenceId
    }], { session: session });

    // Salvar o saldo final
    await userPoints.save({ session: session });

    await session.commitTransaction();

    res.status(201).json({ 
      message: 'Atividade registrada com sucesso (Regra 2x aplicada)',
      newBalance: userPoints.balance,
      pointsEarned: calculatedPointsEarned // Retorna quanto foi calculado
    });

  } catch (error: any) {
    await session.abortTransaction();
    
    if (error.message === 'Saldo de pontos insuficiente') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ 
      message: 'Erro interno ao processar transação', 
      error: error.message 
    });
  } finally {
    await session.endSession();
  }
};