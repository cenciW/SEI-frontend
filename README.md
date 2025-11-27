# 🌿 SEI Frontend - Sistema Especialista de Irrigação

Interface moderna e responsiva para comparação de recomendações de irrigação entre **Sistema Especialista (Prolog)** e **IA Generativa (ChatGPT)**.

## 🚀 Tecnologias Principais

### Core Framework

- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router para aplicações full-stack
- **[React 18](https://react.dev/)** - Biblioteca JavaScript para construção de interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript tipado para maior segurança

### Estilização & UI

- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first para design rápido
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI acessíveis e customizáveis
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones moderna e consistente
- **[tw-animate-css](https://www.npmjs.com/package/tw-animate-css)** - Animações CSS com Tailwind

### Gerenciamento de Estado

- **[React Hooks](https://react.dev/reference/react)** - useState, useEffect, useContext
- **[Context API](https://react.dev/learn/passing-data-deeply-with-context)** - Gerenciamento global de autenticação
- **Custom Hooks** - Lógica reutilizável (useIrrigationSystem, useAuth)

### Autenticação & Segurança

- **JWT Authentication** - Tokens seguros para sessões
- **Protected Routes** - Redirecionamento automático para login
- **Role-Based UI** - Componentes condicionais baseados em papel (Admin/User)

### Design & UX

- **Responsividade Total** - Mobile-first design com breakpoints otimizados
- **Animações Fluidas** - Modais, transições e feedbacks visuais
- **Dark Theme** - Interface escura moderna para reduzir fadiga visual
- **Loading States** - Indicadores de progresso em todas operações assíncronas

## 🎨 Arquitetura & Organização

```
frontend/
├── app/                         # App Router (Next.js 14)
│   ├── page.tsx                 # Página principal (dashboard)
│   ├── login/
│   │   └── page.tsx            # Página de autenticação
│   ├── admin/
│   │   └── page.tsx            # Painel administrativo
│   ├── layout.tsx              # Layout global
│   └── globals.css             # Estilos globais
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   └── select.tsx
│   ├── CropVisualization.tsx   # Visualização de culturas
│   └── IrrigationUI.tsx        # Componentes específicos
├── context/
│   └── AuthContext.tsx         # Context de autenticação
├── hooks/
│   └── useIrrigationSystem.ts  # Hook principal do sistema
├── lib/
│   ├── constants.ts            # Configurações e constantes
│   ├── types.ts                # TypeScript interfaces
│   ├── validation.ts           # Validações de input
│   ├── error-handler.ts        # Tratamento de erros
│   ├── api.ts                  # Camada de comunicação API
│   └── utils.ts                # Utilidades gerais
└── package.json
```

## ✨ Funcionalidades

### 🎯 Dashboard Principal

**Leitura de Sensores (Simulação)**

- 📊 Visualização em tempo real de umidade do solo
- 🌱 Animação SVG da cultura selecionada
- 🎚️ Controles interativos: sliders, inputs numéricos
- 🌡️ Parâmetros: umidade, chuva, temperatura, umidade do ar

**Configurações Avançadas**

- 🪴 Modo vaso com tamanho configurável
- 📈 Estágios de crescimento (Muda, Vegetativo, Floração)
- ⚡ Parâmetros específicos por cultura (EC, sistema de irrigação, metas)
- 🌾 Suporte para 5 culturas: Milho, Tomate, Trigo, Alface, Cannabis

**Recomendações Side-by-Side**

```
┌─────────────────────┬─────────────────────┐
│   Prolog Expert     │   IA Generativa     │
├─────────────────────┼─────────────────────┤
│ • Necessidade: SIM  │ • Necessidade: SIM  │
│ • Score: 75/100     │ • Volume: 3.5L      │
│ • Volume: 3.2L      │ • Cache indicator   │
│ • Conselho técnico  │ • Conselho IA       │
└─────────────────────┴─────────────────────┘
```

### 🔐 Sistema de Autenticação

**Página de Login/Registro**

- 🔄 Toggle suave entre modos
- ✅ Validação em tempo real
- 💪 Indicador de força de senha
- 👁️ Toggle de visibilidade de senha
- 🎭 Modais animados de sucesso

**Segurança**

- 🔒 JWT armazenado em Context API
- 🚪 Protected routes com redirecionamento
- ⏱️ Loading states durante autenticação
- ❌ Mensagens de erro claras e acionáveis

### 🔧 Painel Administrativo

**Editor de Módulos Prolog**

- 📝 Editor de código com syntax highlighting
- 💾 Salvamento com validação automática
- ✅ Feedback de sucesso/erro em tempo real
- 📚 Seletor de módulos (base + culturas)
- ℹ️ Informações contextuais sobre cada módulo

### 📱 Responsividade

**Breakpoints**

- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (sm-lg)
- Desktop: > 1024px (lg+)

**Adaptações Mobile**

```css
/* Exemplos de classes responsivas usadas */
.text-2xl sm:text-3xl lg:text-5xl    /* Tipografia fluida */
.grid-cols-1 lg:grid-cols-3          /* Grid adaptativo */
.p-4 sm:p-6 lg:p-8                   /* Espaçamento progressivo */
.flex-col sm:flex-row                /* Layout responsivo */
```

## 🎭 Sistema de Animações

### Modais de Feedback

1. **Login Successful** 🟢

   - Ícone: Checkmark verde
   - Animação: Zoom + slide from bottom
   - Delay: 1.5s → redirect

2. **Registro Successful** 🟣

   - Ícone: User add roxo
   - Mensagem: "Conta Criada!"
   - Delay: 1.5s → volta para login

3. **Admin Access** 🔵

   - Ícone: Chave balançando (wiggle animation)
   - Mensagem: "Acesso Administrativo"
   - Delay: 1.5s → redirect /admin

4. **Logout** 🔴
   - Ícone: Seta saindo (wave animation)
   - Mensagem: "Até logo!"
   - Delay: 1.5s → logout

### Animações CSS Customizadas

```css
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-12deg);
  }
  50% {
    transform: rotate(12deg);
  }
}

@keyframes wave {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(-5px) rotate(-10deg);
  }
  75% {
    transform: translateX(5px) rotate(10deg);
  }
}
```

### Transições Suaves

- Volume visualization: 1s ease-out
- Modal entrance: 300ms fade + 500ms zoom
- Button hover: 200ms all
- Card animations: fade-in + slide-in

## 🧩 Padrões de Design Implementados

### 1. Component Composition

```typescript
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>{/* Conteúdo */}</CardContent>
</Card>
```

### 2. Custom Hooks

```typescript
const { moisture, setMoisture, recommendation, loading, handleAnalyze } =
  useIrrigationSystem();
```

### 3. Error Boundary Pattern

```typescript
try {
  const response = await apiPost("/endpoint", data);
} catch (error) {
  const parsedError = parseApiError(error);
  handleError(parsedError, setError);
}
```

### 4. Conditional Rendering

```typescript
{
  user?.role === "ADMIN" && <Button onClick={handleAdminClick}>Admin</Button>;
}
```

## 🎨 Heurísticas de UX Aplicadas

1. **Visibilidade do Status do Sistema**

   - API status indicator (online/offline)
   - Loading spinners em operações assíncronas
   - Progress bars em processos longos

2. **Prevenção de Erros**

   - Validação em tempo real
   - Campos desabilitados durante loading
   - Confirmações visuais antes de ações destrutivas

3. **Controle e Liberdade do Usuário**

   - Toggle fácil login/registro
   - Botão "Voltar" em todas páginas
   - Logout acessível

4. **Consistência e Padrões**

   - Design system unificado (shadcn/ui)
   - Cores semânticas (verde=sucesso, vermelho=erro)
   - Tipografia consistente

5. **Reconhecimento ao Invés de Memorização**

   - Indicadores de força de senha
   - Tooltips informativos
   - Labels descritivos

6. **Flexibilidade e Eficiência de Uso**

   - Atalhos de teclado em inputs
   - Sliders + inputs numéricos
   - Modo escuro por padrão

7. **Design Estético e Minimalista**

   - Espaçamento generoso
   - Hierarquia visual clara
   - Animações sutis e propositais

8. **Reconhecimento e Recuperação de Erros**

   - Mensagens de erro claras
   - Sugestões de correção
   - Botão para fechar notificações

9. **Ajuda e Documentação**
   - Tooltips explicativos
   - Placeholders descritivos
   - Info boxes contextuais

## 🔧 Instalação & Execução

### Pré-requisitos

- Node.js 20+
- npm ou yarn

### Variáveis de Ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

### Docker (Produção)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.1",
    "@radix-ui/react-*": "^1.0.0", // shadcn/ui base
    "lucide-react": "^0.292.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## 🎯 Componentes Reutilizáveis

### UI Components (shadcn/ui)

- `Button` - Botões com variantes (default, destructive, outline)
- `Card` - Containers com header e content
- `Input` - Inputs estilizados e acessíveis
- `Label` - Labels semânticos
- `Select` - Dropdowns customizáveis
- `Progress` - Barras de progresso

### Custom Components

- `ApiStatusIndicator` - Indicador de status da API
- `Notification` - Sistema de notificações
- `VolumeVisualization` - Animação de volume líquido
- `VolumeDisplay` - Formatação de valores de volume
- `CropVisualization` - Renderização SVG de culturas

## 🚀 Performance

### Otimizações Implementadas

- ✅ **Code Splitting** - Automático via Next.js
- ✅ **Image Optimization** - next/image com lazy loading
- ✅ **CSS Purging** - Tailwind remove CSS não utilizado
- ✅ **Server Components** - Redução de bundle JavaScript
- ✅ **Memoization** - useMemo em computações pesadas
- ✅ **Debouncing** - Em inputs de busca/filtro

### Métricas Alvo

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.0s
- Cumulative Layout Shift: < 0.1

## 📱 Suporte a Dispositivos

### Testado em:

- ✅ Chrome/Edge 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Mobile Safari (iOS 16+)
- ✅ Chrome Mobile (Android 12+)

### Resoluções Suportadas:

- 📱 Mobile: 320px - 640px
- 📲 Tablet: 640px - 1024px
- 💻 Desktop: 1024px - 1920px
- 🖥️ Wide: 1920px+

## 🎓 Conceitos Aplicados

### Frontend Architecture

- **Separation of Concerns** - Lógica separada de apresentação
- **Atomic Design** - Componentes pequenos e reutilizáveis
- **Container/Presentational** - Hooks encapsulam lógica
- **Composition over Inheritance** - Componentes compostos

### TypeScript Patterns

- **Type Safety** - Interfaces para toda comunicação API
- **Generics** - Funções reutilizáveis tipadas
- **Union Types** - Estados mutuamente exclusivos
- **Type Guards** - Validação runtime com tipos

### React Best Practices

- **Custom Hooks** - Lógica reutilizável
- **Context Optimization** - Memoização de providers
- **Controlled Components** - Estado único da verdade
- **Error Boundaries** - Captura de erros graceful

## 🏆 Diferenciais Técnicos

1. **Comparação Side-by-Side** - Prolog vs IA em tempo real
2. **Animações Profissionais** - Micro-interações polidas
3. **Dark Theme** - Interface moderna e confortável
4. **Responsividade Total** - Mobile-first design
5. **Type Safety** - TypeScript end-to-end
6. **Component Library** - shadcn/ui customizável
7. **Real-time Validation** - Feedback instantâneo
8. **Modularização** - Código organizado e escalável

## 📚 Recursos & Documentação

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 👥 Contribuindo

Este é um projeto acadêmico desenvolvido como parte do curso de Inteligência Artificial.
