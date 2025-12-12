# Dashboard Sandbox CAIXA

Sistema de gestão para administradores do Sandbox CAIXA, permitindo controle de usuários, análise de ideias e classificação de experimentos.

## 🔐 Acesso

O dashboard é restrito para gestores autorizados. Para acessar:

1. Acesse: `http://localhost:3000/dashboard/login`
2. Use as credenciais demo:
   - **Email:** gestor@caixa.gov.br
   - **Senha:** demo123

## 📁 Estrutura

```
src/dashboard/
├── components/          # Componentes reutilizáveis
│   └── ProtectedRoute.jsx   # Proteção de rotas
├── hooks/              # Hooks customizados
│   └── useAuth.js          # Hook de autenticação
├── pages/              # Páginas do dashboard
│   ├── LoginPage.jsx       # Tela de login
│   ├── DashboardPage.jsx   # Dashboard principal
│   └── IdeaDetailsPage.jsx # Detalhes da ideia
├── utils/              # Utilitários
├── DashboardApp.jsx    # App principal do dashboard
└── README.md          # Esta documentação
```

## 🎯 Funcionalidades

### 1. **Sistema de Login**
- Autenticação segura para gestores
- Verificação de permissões
- Sessão persistente

### 2. **Controle de Usuários**
- Visualização de todos os usuários cadastrados
- Informações detalhadas (nome, cargo, departamento, etc.)
- Filtros por departamento
- Busca por nome/email
- Histórico de ideias submetidas

### 3. **Gestão de Ideias**
- Lista de todas as ideias submetidas
- Status de classificação
- Análise detalhada de cada ideia

### 4. **Análise de Ideias**
- **Lado Esquerdo:** Formulário completo do usuário
  - Navegação entre seções (Ideia, Objetivos, Cronograma)
  - Dados do autor
  - Respostas detalhadas
- **Lado Direito:** Análise de IA
  - Análise de sentimento
  - Score de viabilidade
  - Estimativas de impacto
  - Palavras-chave extraídas
  - Recomendações automáticas

### 5. **Sistema de Classificação**
- **Discovery:** Validação inicial (até 90 dias)
- **Delivery:** MVP e testes (até 180 dias) 
- **Scale:** Implementação nacional (até 360 dias)

## 🛠 Tecnologias

- **React 18** - Framework principal
- **React Router** - Roteamento
- **Framer Motion** - Animações
- **React Hook Form** - Formulários
- **React Hot Toast** - Notificações
- **Lucide React** - Ícones
- **Tailwind CSS** - Estilização

## 🔒 Segurança

- Rotas protegidas por autenticação
- Verificação de permissões por funcionalidade
- Dados sensíveis protegidos
- Sessão com expiração automática

## 📊 Análise de IA

O sistema integra análise inteligente das ideias submetidas:

- **Análise de Sentimento:** Avalia o tom e entusiasmo da proposta
- **Viabilidade Técnica:** Score baseado em fatores como complexidade e recursos
- **Impacto Estimado:** Projeções de satisfação, redução de custos e eficiência
- **Fatores de Risco:** Identificação automática de possíveis desafios
- **Recomendações:** Sugestões inteligentes para implementação

## 🚀 Rotas Disponíveis

- `/dashboard/login` - Tela de login
- `/dashboard` - Dashboard principal
- `/dashboard/ideas/:id` - Detalhes da ideia

## 👥 Permissões

- `view_ideas` - Visualizar ideias
- `classify_ideas` - Classificar ideias
- `manage_users` - Gerenciar usuários

## 🎨 Interface

- Design moderno e responsivo
- Tema CAIXA (cores azuis e laranja)
- Animações suaves
- Componentes acessíveis
- Otimizado para desktop e mobile

## 📱 Responsividade

O dashboard é totalmente responsivo, adaptando-se a:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🔄 Dados Demo

O sistema inclui dados de demonstração:
- 3 usuários fictícios
- 3 ideias de exemplo
- Análises de IA simuladas
- Métricas de exemplo
