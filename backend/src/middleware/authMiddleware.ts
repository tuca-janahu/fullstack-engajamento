import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios';
import 'dotenv/config';

// Pega a URL do .env
const AUTH_SERVICE_URL = process.env.URL_BACKEND_CADASTRO;

if (!AUTH_SERVICE_URL) {
  throw new Error('Missing environment variable URL_BACKEND_CADASTRO');
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

    const { data: payload } = await axios.post(AUTH_SERVICE_URL, { token });

    console.log('--- RESPOSTA DO /introspect (CADASTRO) ---');
    console.log(JSON.stringify(payload, null, 2)); // formatado
    console.log('-------------------------------------------');

    if (!payload || !payload.active) {
      return res.status(401).json({ message: 'Token inválido ou inativo' });
    }

    if (!payload.user) {
      return res.status(401).json({ message: 'Token inválido (Formato inesperado)' });
    }

    const { id, role } = payload.user;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: 'Acesso negado (Role inválida ou ausente)' });
    }

    if (!id) {
      return res.status(403).json({ message: 'Acesso negado (ID do usuário ausente no token)' });
    }
    
    req.user = { id: id, role: role };
    next();
    
  } catch (error) {
    console.error('--- ERRO AO VALIDAR TOKEN NO BACKEND DE CADASTRO ---');
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Status:', axiosError.response?.status);
      console.error('Data:', axiosError.response?.data);
      console.error('URL:', axiosError.config?.url);
    } else {
      console.error('Erro desconhecido:', error);
    }
    console.error('--------------------------------------------------');
    
    return res.status(401).json({ message: 'Token inválido ou falha na autenticação' });
  }
};