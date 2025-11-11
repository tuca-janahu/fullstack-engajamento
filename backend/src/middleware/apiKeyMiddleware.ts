import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

// 1. Puxa a chave secreta do seu arquivo .env
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

// 2. Trava o servidor na inicialização se a chave não for definida
if (!INTERNAL_API_KEY) {
  throw new Error('FATAL: INTERNAL_API_KEY não está definida no .env');
}

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 3. Pega a chave enviada pelo outro backend (Loja ou Financiamento)
    const receivedKey = req.headers['x-api-key'];

    // 4. Verifica se a chave foi enviada
    if (!receivedKey) {
      return res.status(401).json({ 
        message: 'Acesso não autorizado: Chave de API ausente.' 
      });
    }

    // 5. Verifica se a chave está correta
    if (receivedKey !== INTERNAL_API_KEY) {
      return res.status(403).json({ 
        message: 'Acesso negado: Chave de API inválida.' 
      });
    }

    // 6. Se tudo estiver certo, permite que a requisição continue
    next();

  } catch (error) {
    res.status(500).json({ message: 'Erro interno no middleware de API Key' });
  }
};