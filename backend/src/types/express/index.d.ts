import 'express'; 

declare global {
  namespace Express {
    export interface Request {
      // Agora, o 'Request' oficial terá esta propriedade opcional
      user?: {
        id: string;
        role: string; // Baseado no seu middleware de antes
      };
    }
  }
}