import { Request, Response } from 'express';
import { RecentActivity } from '../models/RecentActivity';
import { UserPoints } from '../models/UserPoints';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const userPoints = await UserPoints.findOne({ userId: userId });

    const activities = await RecentActivity
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(10); 

    res.status(200).json({
      balance: userPoints ? userPoints.balance : 0,
      recentActivities: activities 
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
  }
};