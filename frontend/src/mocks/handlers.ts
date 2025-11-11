import { http, HttpResponse } from 'msw';

// Mock database
const mockUsers = {
  admin: {
    id: '1',
    email: 'admin@fintech.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
  },
  client: {
    id: '2',
    email: 'cliente@fintech.com',
    password: 'cliente123',
    name: 'João Silva',
    role: 'cliente',
    pontos: 2450,
    pontosConsumidos: 500,
  },
};

const mockHistory = [
  {
    id: '1',
    tipo: 'ganho',
    descricao: 'Compra de produto',
    pontos: 150,
    data: '2025-11-08T10:30:00Z',
  },
  {
    id: '2',
    tipo: 'ganho',
    descricao: 'Financiamento aprovado',
    pontos: 500,
    data: '2025-11-05T14:20:00Z',
  },
  {
    id: '3',
    tipo: 'consumo',
    descricao: 'Desconto aplicado',
    pontos: -200,
    data: '2025-11-03T09:15:00Z',
  },
  {
    id: '4',
    tipo: 'ganho',
    descricao: 'Indicação de amigo',
    pontos: 300,
    data: '2025-11-01T16:45:00Z',
  },
  {
    id: '5',
    tipo: 'ganho',
    descricao: 'Compra de produto',
    pontos: 200,
    data: '2025-10-28T11:00:00Z',
  },
  {
    id: '6',
    tipo: 'consumo',
    descricao: 'Desconto em taxa',
    pontos: -300,
    data: '2025-10-25T13:30:00Z',
  },
];

const mockDashboard = {
  totalPontosEmitidos: 12500,
  totalPontosConsumidos: 4200,
  clientesAtivos: 156,
  ranking: [
    { id: '2', nome: 'João Silva', pontos: 2450 },
    { id: '3', nome: 'Maria Santos', pontos: 2100 },
    { id: '4', nome: 'Pedro Costa', pontos: 1850 },
    { id: '5', nome: 'Ana Oliveira', pontos: 1650 },
    { id: '6', nome: 'Carlos Ferreira', pontos: 1420 },
  ],
  pontosGanhosPorMes: [
    { mes: 'Jul', pontos: 1800 },
    { mes: 'Ago', pontos: 2300 },
    { mes: 'Set', pontos: 2100 },
    { mes: 'Out', pontos: 3200 },
    { mes: 'Nov', pontos: 3100 },
  ],
};

export const handlers = [
  // Login
  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const user = Object.values(mockUsers).find(
      (u) => u.email === body.email && u.password === body.password
    );

    if (user) {
      const token = `mock-jwt-token-${user.id}`;
      return HttpResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    return HttpResponse.json(
      { message: 'Email ou senha inválidos' },
      { status: 401 }
    );
  }),

  // Get pontos (cliente)
  http.get('/api/pontos', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      pontos: mockUsers.client.pontos,
      pontosConsumidos: mockUsers.client.pontosConsumidos,
      historico: mockHistory,
      mensagem: 'Você ganhou 150 pontos na última compra! 🎉',
    });
  }),

  // Consumir pontos
  http.post('/api/consumir', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const body = await request.json() as { pontos: number };

    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    if (body.pontos > mockUsers.client.pontos) {
      return HttpResponse.json(
        { message: 'Pontos insuficientes' },
        { status: 400 }
      );
    }

    mockUsers.client.pontos -= body.pontos;
    mockUsers.client.pontosConsumidos += body.pontos;

    const novoHistorico = {
      id: String(mockHistory.length + 1),
      tipo: 'consumo',
      descricao: 'Desconto aplicado',
      pontos: -body.pontos,
      data: new Date().toISOString(),
    };

    mockHistory.unshift(novoHistorico);

    return HttpResponse.json({
      message: 'Pontos consumidos com sucesso!',
      pontosRestantes: mockUsers.client.pontos,
      historico: novoHistorico,
    });
  }),

  // Dashboard (admin)
  http.get('/api/dashboard', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    return HttpResponse.json(mockDashboard);
  }),
];
