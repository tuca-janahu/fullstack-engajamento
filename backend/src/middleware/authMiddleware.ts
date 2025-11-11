import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import 'dotenv/config';

// Pega a URL do .env
const AUTH_SERVICE_URL = process.env.URL_BAKCEND_CADASTRO;

if (!AUTH_SERVICE_URL) {
  throw new Error('Missing environment variable URL_BAKCEND_CADASTRO');
}

export const authMiddleware = (roles: string[]) => 
  async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const { data: userData } = await axios.post(AUTH_SERVICE_URL, { token });

    if (!userData.valid || !roles.includes(userData.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    req.user = { id: userData.userId, role: userData.role };
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou falha na autenticação' });
  }
};