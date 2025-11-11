import { Router } from 'express';
import { getDashboardData } from '../controllers/engagementController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Protegido: Apenas 'cliente' pode acessar
router.get('/dashboard', authMiddleware(['client']), getDashboardData);

export default router;