import { Request, Response } from 'express';
import mongoose from 'mongoose'; // <-- Importante para transações
import { z } from 'zod'; // Para validação

// Nossos 3 models
import { UserPoints } from '../models/UserPoints';
import { PointTransaction } from '../models/PointTransaction';
import { RecentActivity } from '../models/RecentActivity';

// 1. Definimos o "contrato" de dados que esperamos
// Os outros times DEVEM enviar um body com este formato
const recordActivitySchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  type: z.enum(['shop', 'financing'] as const, "Tipo deve ser 'shop' ou 'financing'"),
  description: z.string().min(1, 'description é obrigatória'),
  value: z.number().positive('value (R$) deve ser positivo'),
  pointsEarned: z.number().min(0, 'pointsEarned não pode ser negativo'),
  pointsSpent: z.number().min(0, 'pointsSpent não pode ser negativo'),
  referenceId: z.string().min(1, 'referenceId é obrigatório')
});

// 2. O Controller
export const recordActivity = async (req: Request, res: Response) => {
  // 3. Validação com Zod
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
    pointsEarned,
    pointsSpent,
    referenceId
  } = validatedData;

  // 4. Iniciar uma Sessão do MongoDB para a transação
  const session = await mongoose.startSession();

  try {
    // 5. Iniciar a transação
    await session.startTransaction();

    // 6. Pegar (ou criar) o documento de saldo do usuário
    // 'upsert: true' = crie se não existir
    // 'new: true' = retorne o documento novo/atualizado
    const userPoints = await UserPoints.findOneAndUpdate(
      { userId: userId },
      { $setOnInsert: { userId: userId, balance: 0 } }, // Só roda na criação
      { upsert: true, new: true, session: session } // <-- session é a chave
    );

    // 7. Processar gastos
    let totalPointsChange = 0;
    if (pointsSpent > 0) {
      // 7a. Verificar se o usuário tem saldo
      if (userPoints.balance < pointsSpent) {
        throw new Error('Saldo de pontos insuficiente');
      }

      // 7b. Criar o histórico de gasto
      await PointTransaction.create([{
        userId: userId,
        type: 'spend',
        amount: pointsSpent,
        source: type === 'shop' ? 'shop_discount' : 'financing_discount',
        referenceId: referenceId,
        description: `Desconto em: ${description}`
      }], { session: session });

      // 7c. Atualizar saldo e mudança total
      userPoints.balance -= pointsSpent;
      totalPointsChange -= pointsSpent;
    }

    // 8. Processar ganhos
    if (pointsEarned > 0) {
      // 8a. Criar o histórico de ganho
      await PointTransaction.create([{
        userId: userId,
        type: 'earn',
        amount: pointsEarned,
        source: type === 'shop' ? 'shop_purchase' : 'financing_contract',
        referenceId: referenceId,
        description: `Pontos por: ${description}`
      }], { session: session });

      // 8b. Atualizar saldo e mudança total
      userPoints.balance += pointsEarned;
      totalPointsChange += pointsEarned;
    }

    // 9. Criar a Atividade Recente para o Dashboard
    await RecentActivity.create([{
      userId: userId,
      type: type,
      description: description,
      value: value,
      pointsChange: totalPointsChange,
      referenceId: referenceId
    }], { session: session });

    // 10. Salvar o saldo final do usuário
    await userPoints.save({ session: session });

    // 11. COMMIT! Se tudo deu certo, salve as mudanças no banco
    await session.commitTransaction();

    res.status(201).json({ 
      message: 'Atividade registrada com sucesso',
      newBalance: userPoints.balance
    });

  } catch (error: any) {
    // 12. ERRO! Desfaz todas as operações
    await session.abortTransaction();
    
    if (error.message === 'Saldo de pontos insuficiente') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ 
      message: 'Erro interno ao processar transação', 
      error: error.message 
    });

  } finally {
    // 13. Feche a sessão, independentemente do resultado
    await session.endSession();
  }
};