# FinTech Startup - Módulo de Engajamento

Sistema moderno de gestão de pontos e engajamento para plataforma FinTech, com autenticação por roles (admin/cliente) e dashboard completo.

## 🚀 Tecnologias Utilizadas

- **React** - Biblioteca UI
- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes UI reutilizáveis
- **React Router DOM** - Navegação entre páginas
- **Axios** - Cliente HTTP
- **Zustand** - Gerenciamento de estado
- **Mock Service Worker (MSW)** - Simulação de APIs
- **Recharts** - Gráficos e visualização de dados
- **date-fns** - Manipulação de datas

## 📋 Funcionalidades

### Cliente
- ✅ Login com autenticação JWT
- ✅ Visualização de pontos disponíveis e consumidos
- ✅ Histórico completo de transações
- ✅ Consumo de pontos para aplicar descontos
- ✅ Notificações de novos pontos ganhos

### Admin
- ✅ Dashboard com estatísticas gerais
- ✅ Gráfico de evolução de pontos por mês
- ✅ Ranking dos 5 clientes mais engajados
- ✅ Visão consolidada de pontos emitidos/consumidos
- ✅ Total de clientes ativos

## 📁 Estrutura de Pastas

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx    # Proteção de rotas
│   ├── layout/
│   │   └── Navbar.tsx             # Barra de navegação
│   └── ui/                        # Componentes Shadcn
├── lib/
│   ├── api.ts                     # Cliente Axios configurado
│   └── utils.ts                   # Utilitários
├── mocks/
│   ├── browser.ts                 # Configuração MSW
│   └── handlers.ts                # Handlers de API mockados
├── pages/
│   ├── Login.tsx                  # Página de login
│   ├── Pontos.tsx                 # Página do cliente
│   ├── Dashboard.tsx              # Página do admin
│   └── NotFound.tsx               # Página 404
├── store/
│   └── authStore.ts               # Estado global de autenticação
├── App.tsx                        # Configuração de rotas
└── main.tsx                       # Entry point
```

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse a aplicação em:
```
http://localhost:8080
```

## 🔐 Credenciais de Teste

### Admin
- **Email:** admin@fintech.com
- **Senha:** admin123
- **Acesso:** Dashboard administrativo

### Cliente
- **Email:** cliente@fintech.com
- **Senha:** cliente123
- **Acesso:** Página de pontos

## 🎯 Endpoints Mockados (MSW)

Todos os endpoints são simulados usando Mock Service Worker:

### `POST /api/login`
Autenticação de usuário
- **Body:** `{ email: string, password: string }`
- **Response:** `{ token: string, user: {...} }`

### `GET /api/pontos`
Retorna pontos e histórico do cliente
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ pontos, pontosConsumidos, historico[], mensagem? }`

### `POST /api/consumir`
Consome pontos do cliente
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ pontos: number }`
- **Response:** `{ message, pontosRestantes, historico }`

### `GET /api/dashboard`
Estatísticas gerais (admin only)
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ totalPontosEmitidos, totalPontosConsumidos, clientesAtivos, ranking[], pontosGanhosPorMes[] }`

## 🎨 Design System

O projeto utiliza um design system completo definido em `src/index.css` e `tailwind.config.ts`:

- **Cores primárias:** Azul corporativo para confiança
- **Cores secundárias:** Verde para crescimento
- **Gradientes:** Aplicados em CTAs principais
- **Sombras:** Cards com elevação sutil
- **Transições:** Animações suaves em 300ms

## 📦 Build e Deploy

### Build para produção:
```bash
npm run build
```

### Preview da build:
```bash
npm run preview
```

### Deploy no Vercel:
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente (se necessário)
3. Deploy automático a cada push na branch principal

## ⚠️ Observações Importantes

### Mock Service Worker (MSW)
- O MSW intercepta as requisições HTTP apenas em **desenvolvimento**
- Para produção, você deve conectar a um backend real
- Configure `VITE_API_BASE_URL` no `.env` para apontar para a API real

### Autenticação
- O token JWT é armazenado no `localStorage` via Zustand
- Em produção, considere usar `httpOnly cookies` para maior segurança
- Implemente refresh token para sessões longas

### Dados Mockados
- Os dados são resetados a cada reload da página
- Para persistência real, conecte a um banco de dados

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Executa linter
```

## 📝 Licença

Este projeto foi desenvolvido como parte do módulo de Engajamento da FinTech Startup.

---

**Desenvolvido com ❤️ usando React + Vite + TailwindCSS**
