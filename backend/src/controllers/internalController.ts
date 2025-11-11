import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import { UserPoints } from '../models/UserPoints';
import { PointTransaction } from '../models/PointTransaction';
import { RecentActivity } from '../models/RecentActivity';

const recordActivitySchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  type: z.enum(['shop', 'financing'] as const, {
    message: "Tipo deve ser 'shop' ou 'financing'"
  }),
  description: z.string().min(1, 'description é obrigatória'),
  value: z.number().positive('value (R$) deve ser positivo'),
  pointsEarned: z.number().min(0).optional(), 
  pointsSpent: z.number().min(0, 'pointsSpent não pode ser negativo'),
  referenceId: z.string().min(1, 'referenceId é obrigatório')
});

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

  const {
    userId,
    type,
    description,
    value, 
    pointsSpent,
    referenceId
  } = validatedData;
  
  const calculatedPointsEarned = Math.floor(value * PONTOS_POR_REAL);

  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const userPoints = await UserPoints.findOneAndUpdate(
      { userId: userId },
      { $setOnInsert: { userId: userId, balance: 0 } },
      { upsert: true, new: true, session: session }
    );

    let totalPointsChange = 0;
    
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

    if (calculatedPointsEarned > 0) { 
      await PointTransaction.create([{
        userId: userId,
        type: 'earn',
        amount: calculatedPointsEarned, 
        source: type === 'shop' ? 'shop_purchase' : 'financing_contract',
        referenceId: referenceId,
        description: `Pontos por: ${description}`
      }], { session: session });

      userPoints.balance += calculatedPointsEarned; 
      totalPointsChange += calculatedPointsEarned; 
    }

    await RecentActivity.create([{
      userId: userId,
      type: type,
      description: description,
      value: value,
      pointsChange: totalPointsChange, 
      referenceId: referenceId
    }], { session: session });

    await userPoints.save({ session: session });

    await session.commitTransaction();

    res.status(201).json({ 
      message: 'Atividade registrada com sucesso (Regra 2x aplicada)',
      newBalance: userPoints.balance,
      pointsEarned: calculatedPointsEarned 
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