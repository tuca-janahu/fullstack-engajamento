import { Router, Request, Response } from 'express';
import { getDashboardData } from '../controllers/engagementController';
import { authMiddleware } from '../middleware/authMiddleware';
import { apiKeyMiddleware } from '../middleware/apiKeyMiddleware'; 
import { recordActivity } from '../controllers/internalController';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Protegido: Apenas 'cliente' pode acessar
router.get('/dashboard', authMiddleware(['client']), getDashboardData);

router.post(
  '/internal/record-activity',
  apiKeyMiddleware, 
  recordActivity
);

export default router;