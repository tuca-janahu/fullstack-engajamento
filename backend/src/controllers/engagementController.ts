import { Request, Response } from 'express';
import { RecentActivity } from '../models/RecentActivity';
import { UserPoints } from '../models/UserPoints';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    res.status(200).json({
      message: `Acesso permitido!`,
      user: {
        id: userId,
        role: userRole
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
};