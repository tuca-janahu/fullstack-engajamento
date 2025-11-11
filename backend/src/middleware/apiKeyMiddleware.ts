import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

if (!INTERNAL_API_KEY) {
  throw new Error('FATAL: INTERNAL_API_KEY não está definida no .env');
}

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const receivedKey = req.headers['x-api-key'];

    if (!receivedKey) {
      return res.status(401).json({ 
        message: 'Acesso não autorizado: Chave de API ausente.' 
      });
    }

    if (receivedKey !== INTERNAL_API_KEY) {
      return res.status(403).json({ 
        message: 'Acesso negado: Chave de API inválida.' 
      });
    }

    next();

  } catch (error) {
    res.status(500).json({ message: 'Erro interno no middleware de API Key' });
  }
};