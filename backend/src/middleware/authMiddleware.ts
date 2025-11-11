// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const AUTH_SERVICE_URL = 'https://auth.sua-fintech.com/api/v1/auth/validate';

export const authMiddleware = (roles: string[]) => 
  async (req: Request, res: Response, next: NextFunction) => {
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    // 1. CHAMA O SERVIÇO DE CADASTRO
    const { data: userData } = await axios.post(AUTH_SERVICE_URL, { token });

    // 2. VERIFICA SE O TOKEN É VÁLIDO E TEM A PERMISSÃO
    if (!userData.valid || !roles.includes(userData.role)) {
      // O requisito de permissionamento pede redirecionamento no frontend,
      // mas no backend retornamos 403.
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // 3. ANEXA OS DADOS DO USUÁRIO NA REQUISIÇÃO
    req.user = { id: userData.userId, role: userData.role };
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};