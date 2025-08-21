# Sandbox CAIXA - Ambiente de Experimentação Interna da CEF

Uma aplicação React moderna e responsiva que apresenta o Sandbox Caixa, ambiente de experimentação interna da Caixa Econômica Federal focado em intraempreendedorismo. Lançado em 2 de agosto, o programa captura ideias dos 87.000 empregados, transforma-as em experimentos estruturados e promove mudança cultural para inovação ágil.

## 🚀 Funcionalidades Principais

### 🏠 **Homepage Informativa**
- Design moderno com animações fluidas
- Seções informativas sobre o Sandbox CAIXA
- Estatísticas do primeiro edital (73 experimentos, 4.000 empregados)
- Processo estruturado em 3 fases (Discovery, Delivery, Aceleração)
- Call-to-actions intuitivos

### 📋 **Formulário Inteligente Multi-etapas**
- Interface progressiva com 5 etapas distintas
- Validação em tempo real
- Indicador de progresso visual
- Design responsivo para todos os dispositivos
- Campos baseados nos dados reais do Sandbox CAIXA

### 🤖 **Classificação por IA (Simulada)**
- Análise automática dos dados submetidos
- Categorização inteligente por temas
- Avaliação de complexidade e impacto
- Recomendações personalizadas
- Visualização de projetos similares

### 📊 **Dashboard de Métricas do Sandbox**
- Gráficos interativos com Recharts
- KPIs do primeiro edital
- Análise de tendências por fases
- Comparação de performance
- Projetos de exemplo (Redução de Comprovantes, IA Transform It, etc.)

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **React Router DOM** - Navegação
- **Framer Motion** - Animações avançadas
- **Tailwind CSS** - Estilização moderna
- **React Hook Form** - Gerenciamento de formulários
- **Recharts** - Visualização de dados
- **Lucide React** - Ícones consistentes
- **React Hot Toast** - Notificações elegantes

## 🎨 Design System

### Cores Principais
- **CAIXA Blue**: `#005CA9`
- **CAIXA Light Blue**: `#0078D7`
- **CAIXA Orange**: `#FF7A00`
- **CAIXA Green**: `#10B981`
- **CAIXA Purple**: `#8B5CF6`

### Tipografia
- **Font Family**: Montserrat (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700, 800, 900

## 📱 Responsividade

O projeto foi desenvolvido com abordagem **mobile-first**, garantindo excelente experiência em:
- 📱 **Mobile** (320px+)
- 📱 **Tablet** (768px+)
- 💻 **Desktop** (1024px+)
- 🖥️ **Large Desktop** (1440px+)

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd sandbox-caixa-react
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Execute o projeto**
```bash
npm start
# ou
yarn start
```

4. **Acesse no navegador**
```
http://localhost:3000
```

## 📂 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Navbar.jsx      # Navegação principal
│   ├── Footer.jsx      # Rodapé
│   ├── HeroSection.jsx # Seção hero
│   ├── StatsSection.jsx # Estatísticas
│   ├── FeaturesSection.jsx # Funcionalidades
│   ├── ProcessSection.jsx  # Processo
│   └── TestimonialsSection.jsx # Depoimentos
├── pages/              # Páginas principais
│   ├── HomePage.jsx    # Página inicial
│   ├── FormPage.jsx    # Formulário multi-etapas
│   ├── ClassificationPage.jsx # Classificação IA
│   └── MetricsPage.jsx # Dashboard métricas
├── index.css          # Estilos globais
├── index.js           # Ponto de entrada
└── App.js             # Componente raiz
```

## 🎯 Fluxo da Aplicação

1. **Homepage** → Apresentação do Sandbox CAIXA e estatísticas do primeiro edital
2. **Formulário** → Submissão de experimento (5 etapas)
3. **Classificação** → Análise por IA simulada
4. **Métricas** → Dashboard com visualizações dos resultados

## 🔧 Funcionalidades Técnicas

### Animações
- **Framer Motion** para micro-interações
- Transições suaves entre páginas
- Loading states animados
- Scroll-triggered animations

### Formulários
- Validação em tempo real
- Indicadores visuais de progresso
- Persistência de dados no localStorage
- Experiência multi-etapas fluida

### Dados
- Simulação de API calls
- Estados de loading realistas
- Classificação automática baseada em inputs
- Geração de métricas dinâmicas

## 📊 Tecnologias do Sandbox CAIXA

O projeto reflete as tecnologias reais utilizadas no Sandbox:

- **Transform It (Meet It)** - Plataforma com IA conversacional
- **Dashboard de monitoramento** para acompanhamento de experimentos
- **Testes com 1% da base de clientes** para validação
- **Flexibilização normativa** para agilidade

## 🔒 Segurança

- Validação de formulários no frontend
- Sanitização de inputs
- Preparado para integração com autenticação
- Boas práticas de desenvolvimento

## 🎨 Componentes Principais

### Navbar
- Design responsivo
- Indicador de página ativa
- Menu mobile com animações
- CTA destacado

### FormPage
- 5 etapas bem estruturadas
- Validação robusta
- Indicadores visuais
- Experiência fluida

### ClassificationPage
- Simulação de IA processing
- Resultados visuais
- Recomendações personalizadas
- Design futurista

### MetricsPage
- Dashboard completo
- Gráficos interativos
- KPIs em tempo real
- Tabelas responsivas

## 🚀 Próximos Passos

1. **Expansão do Sandbox**
   - Ampliação para todos os 87.000 empregados
   - Novos editais e ciclos
   - Mais experimentos e soluções escaladas

2. **Ecossistema Externo**
   - Mais chamadas de startups
   - Parcerias com Cesar Recife
   - Hub GovTech em Brasília

3. **Mudança Cultural**
   - Consolidação da cultura de intraempreendedorismo
   - Eliminação do "cemitério de ideias"
   - Inovação ágil em empresa centenária

## 🤝 Contribuição

Este projeto foi desenvolvido para apresentar o Sandbox CAIXA, ambiente de experimentação interna da Caixa Econômica Federal. O código está estruturado para fácil manutenção e extensão.

## 📄 Licença

Projeto desenvolvido para apresentação do Sandbox CAIXA.

---

**Desenvolvido com ❤️ para apresentar a revolução da inovação na Caixa Econômica Federal**

