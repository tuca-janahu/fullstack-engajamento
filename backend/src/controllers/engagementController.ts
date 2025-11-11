import { Request, Response } from 'express';
import { RecentActivity } from '../models/RecentActivity';
import { UserPoints } from '../models/UserPoints';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userPoints = await UserPoints.findOne({ userId: userId });

    const activities = await RecentActivity
      .find({ userId: userId })
      .sort({ createdAt: -1 }) 
      .limit(5);

    res.status(200).json({
      message: `Acesso permitido!`,
      user: {
        id: userId,
        role: userRole,
        message: "Dashboard carregado com sucesso!",
        balance: userPoints ? userPoints.balance : 0,
        recentActivities: activities
      }
    });

  } catch (error) {
    console.error("Erro no getDashboardData:", error); 
    res.status(500).json({ 
      message: 'Erro interno ao buscar dados do dashboard' 
    });
  }
};