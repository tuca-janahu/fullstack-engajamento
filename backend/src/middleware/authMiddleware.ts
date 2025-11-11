import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios';
import 'dotenv/config';

// URL_BAKCEND_CADASTRO deve ser ".../auth/token/introspect" no seu .env
const AUTH_SERVICE_URL = process.env.URL_BAKCEND_CADASTRO;

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

    // CHAMA O SERVIÇO DE CADASTRO
    const { data: payload } = await axios.post(AUTH_SERVICE_URL, { token });

    // --- LOG DE DEPURAÇÃO (Para vermos o payload do token) ---
    console.log('--- RESPOSTA DO /introspect (CADASTRO) ---');
    console.log(JSON.stringify(payload, null, 2)); // formatado
    console.log('-------------------------------------------');

    // --- INÍCIO DA LÓGICA DE VALIDAÇÃO CORRIGIDA ---

    // 1. O token está ativo? (Baseado no seu log)
    if (!payload || !payload.active) {
      return res.status(401).json({ message: 'Token inválido ou inativo' });
    }

    // 2. O objeto 'user' existe? (Baseado no seu log)
    if (!payload.user) {
      return res.status(401).json({ message: 'Token inválido (Formato inesperado)' });
    }

    // 3. Pegamos o ID e a ROLE de dentro de 'payload.user'
    const { id, role } = payload.user;

    // 4. A 'role' existe e é permitida?
    // (Lembre-se: 'customer' deve estar em 'roles' na sua rota)
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: 'Acesso negado (Role inválida ou ausente)' });
    }

    // 5. O 'id' existe?
    if (!id) {
      return res.status(403).json({ message: 'Acesso negado (ID do usuário ausente no token)' });
    }
    
    // 6. SUCESSO! Anexamos os dados corretos
    req.user = { id: id, role: role };
    next();
    
    // --- FIM DA LÓGICA DE VALIDAÇÃO CORRIGIDA ---

  } catch (error) {
    // --- LOG DE ERRO DETALHADOf ---
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