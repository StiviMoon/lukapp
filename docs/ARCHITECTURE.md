# LukappPP — Arquitectura Completa
**Fecha:** 15 de marzo 2026
**Versión:** 1.0 — MVP
**Equipo:** Steven (dev) + Novia (diseño)
**Status:** Blueprint para desarrollo MVP (semanas 1-4)

---

## 📋 TABLA DE CONTENIDOS
1. Stack Tecnológico
2. Arquitectura General
3. Schema de Base de Datos
4. Estructura de Carpetas
5. Patrones de Código
6. Rutas API Completas
7. Flujos de Features
8. Configuraciones Pendientes
9. Guía de Desarrollo

---

## 1. STACK TECNOLÓGICO

### Frontend (Lukapp-f)
```
Next.js 16 (App Router)
  ├── React 19 + TypeScript
  ├── Tailwind CSS v4 (CSS variables)
  ├── Shadcn/UI + Radix UI + Lucide React (iconos)
  ├── TanStack Query v5 (server state)
  ├── Zustand v5 (client state)
  ├── Supabase SSR (auth solo)
  ├── React Hook Form + Zod (validación)
  ├── next-pwa (Progressive Web App)
  ├── Web Speech API (voz nativa, gratis)
  └── recharts (gráficos)
```

**¿Por qué esta combinación?**
- **Next.js:** App Router = mejor para SSR auth, PWA nativa
- **Tailwind v4:** Variables CSS = tema oscuro perfecto, diseño consistente
- **Shadcn/UI:** Headless, sin lock-in, copiar-pegar código
- **React Query:** Caching inteligente, invalidation, sincronización sin Redux
- **Zustand:** Minimal state, sin boilerplate, mejor que Context para UI state
- **Web Speech API:** Cero costo, funciona offline en PWA

### Backend (Lukapp-b)
```
Express.js + TypeScript
  ├── Prisma 6.19.2 (ORM)
  ├── PostgreSQL via Supabase
  ├── Supabase Auth (JWT validation)
  ├── Zod (validación de entrada)
  ├── Anthropic SDK (Claude LLM)
  └── tsx (TypeScript runner, dev)
```

**¿Por qué?**
- **Express:** Ligero, sin magia, perfecto para clean architecture
- **Prisma:** Migraciones automáticas, type-safe, migrations versionadas
- **Supabase:** PostgreSQL managed + auth nativa, RLS built-in
- **Anthropic SDK:** Claude API para IA coach + voice parsing
- **Zod:** Validación compartible con frontend (types inferidos)

### Base de Datos
```
PostgreSQL (vía Supabase)
  ├── Row Level Security (RLS) para tablas compartidas
  ├── Triggers para timestamps (created_at, updated_at)
  └── Índices en userId, relationId, createdAt
```

---

## 2. ARQUITECTURA GENERAL

### Diagrama de flujo (usuario → API → BD)
```
┌────────────────────────────────────────────────────────────┐
│                    USUARIO (Mobile/Desktop)                 │
└────────────┬─────────────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────────┐
│              FRONTEND (Next.js + React)                    │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Components (UI) → Hooks → API Client → Supabase Auth│ │
│  │         ↓                                            │ │
│  │   TanStack Query (cache + invalidation)             │ │
│  │   Zustand (UI state: modal open, loading)           │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────┬──────────────────────────────────────────────┘
             │
             │ HTTP + Bearer Token (Supabase JWT)
             │
┌────────────▼──────────────────────────────────────────────┐
│              BACKEND (Express + TypeScript)                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Route (validate + auth) → Service → Repository       │ │
│  └──────────────────────────────────────────────────────┘ │
│         ↓                                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Prisma (type-safe ORM) → PostgreSQL (Supabase)       │ │
│  └──────────────────────────────────────────────────────┘ │
│         ↓                                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ IA: Anthropic SDK (Claude API)                       │ │
│  │ - Voice parsing: "Gasté 50k en comida"               │ │
│  │ - Coach advice: recomendaciones personalizadas       │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────┬──────────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────────┐
│         POSTGRESQL (Supabase)                             │
│  ├── Profiles (auth)                                       │
│  ├── CoachProfiles (personalidad IA)                       │
│  ├── Accounts, Transactions, Categories, Budgets          │
│  ├── Relations (parejas/familias)                          │
│  ├── SharedExpenses (gastos compartidos)                   │
│  └── Friendships (red social)                              │
└────────────────────────────────────────────────────────────┘
```

### Principios de Arquitectura
1. **Separación clara:** Frontend pide datos, backend los entrega
2. **Validación en 2 capas:** Zod en frontend (UX) + backend (seguridad)
3. **Tenant isolation:** Todos los queries filtrados por `userId`
4. **Type safety:** TypeScript end-to-end, Zod schemas compartibles
5. **Clean layers:** Routes → Services → Repositories → Prisma

---

## 3. SCHEMA DE BASE DE DATOS (Prisma)

### Enums
```prisma
enum AccountType {
  CASH
  CHECKING
  SAVINGS
  CREDIT_CARD
  INVESTMENT
  OTHER
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

enum BudgetPeriod {
  WEEKLY
  MONTHLY
  YEARLY
}

enum RelationType {
  COUPLE
  FAMILY
  FRIENDS
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

### Modelos

#### **Profile** (usuario, base)
```prisma
model Profile {
  id                String   @id @default(cuid())
  userId            String   @unique  // FK a Supabase Auth
  email             String   @unique
  fullName          String?
  avatarUrl         String?
  currency          String   @default("COP")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  coachProfile      CoachProfile?
  accounts          Account[]
  categories        Category[]
  transactions      Transaction[]
  budgets           Budget[]
  relationsA        Relation[] @relation("UserA")
  relationsB        Relation[] @relation("UserB")
  friendshipsReq    Friendship[] @relation("Requester")
  friendshipsInv    Friendship[] @relation("Requested")

  @@index([userId])
  @@index([email])
}
```

#### **CoachProfile** (personalidad del coach IA)
```prisma
model CoachProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  profile           Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Configuración de personalidad
  tone              String   @default("casual")  // formal | casual | motivador
  approach          String   @default("balanceado") // conservador | balanceado | agresivo
  primaryGoal       String   @default("balance")  // ahorrar | invertir | balance
  riskTolerance     String   @default("medio") // bajo | medio | alto
  values            String[] @default([]) // ["ahorro", "independencia", "educacion"]

  // Contexto para IA
  insights          String? // JSON serializado
  lastAdviceDate    DateTime?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
}
```

#### **Account** (cuenta financiera)
```prisma
model Account {
  id                String   @id @default(cuid())
  userId            String
  profile           Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  name              String
  type              AccountType
  balance           Decimal  @default(0) @db.Decimal(12, 2)
  color             String   @default("#8B5CF6") // hex
  icon              String   @default("wallet")
  isActive          Boolean  @default(true)

  transactions      Transaction[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([userId, name])
  @@index([userId])
  @@index([isActive])
}
```

#### **Category** (categoría de gasto)
```prisma
model Category {
  id                String   @id @default(cuid())
  userId            String
  profile           Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  name              String
  type              TransactionType
  color             String   @default("#3B82F6")
  icon              String   @default("tag")
  isDefault         Boolean  @default(false)

  transactions      Transaction[]
  budgets           Budget[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([userId, name, type])
  @@index([userId])
  @@index([type])
}
```

#### **Transaction** (ingreso/egreso personal)
```prisma
model Transaction {
  id                String   @id @default(cuid())
  userId            String
  profile           Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  accountId         String
  account           Account  @relation(fields: [accountId], references: [id], onDelete: Restrict)

  categoryId        String?
  category          Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  type              TransactionType
  amount            Decimal  @db.Decimal(12, 2)
  description       String?
  date              DateTime @default(now())

  // Voz
  voiceInput        String?  // Transcripción original

  // Compartido
  isShared          Boolean  @default(false)
  relationId        String?
  relation          Relation? @relation(fields: [relationId], references: [id], onDelete: SetNull)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@index([accountId])
  @@index([categoryId])
  @@index([date])
  @@index([relationId])
}
```

#### **Budget** (presupuesto)
```prisma
model Budget {
  id                String   @id @default(cuid())
  userId            String
  profile           Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)

  categoryId        String?
  category          Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  amount            Decimal  @db.Decimal(12, 2)
  period            BudgetPeriod
  startDate         DateTime
  endDate           DateTime

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([userId, categoryId, period, startDate])
  @@index([userId])
  @@index([categoryId])
}
```

#### **Relation** (relación pareja/familia)
```prisma
model Relation {
  id                String   @id @default(cuid())

  type              RelationType
  name              String?

  userAId           String
  userA             Profile  @relation("UserA", fields: [userAId], references: [id], onDelete: Cascade)

  userBId           String
  userB             Profile  @relation("UserB", fields: [userBId], references: [id], onDelete: Cascade)

  sharedExpenses    Transaction[] // isShared = true y relationId = this.id

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([userAId, userBId])
  @@index([userAId])
  @@index([userBId])
}
```

#### **SharedExpense** (gasto compartido - en Transaction con isShared=true)
```
En lugar de tabla separada, usamos Transaction con:
- isShared: true
- relationId: FK a Relation
- paidByUserId: (derivar de Transaction.userId)
- splitType: "equal" | "custom" (en campo description o metadata)
```

#### **Friendship** (amistad/seguir)
```prisma
model Friendship {
  id                String   @id @default(cuid())

  requesterId       String
  requester         Profile  @relation("Requester", fields: [requesterId], references: [id], onDelete: Cascade)

  requestedId       String
  requested         Profile  @relation("Requested", fields: [requestedId], references: [id], onDelete: Cascade)

  status            FriendshipStatus @default(PENDING)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([requesterId, requestedId])
  @@index([requesterId])
  @@index([requestedId])
}
```

---

## 4. ESTRUCTURA DE CARPETAS

### Backend (Lukapp-b)
```
Lukapp-b/
├── src/
│   ├── index.ts                    # Entry point, Express setup
│   ├── auth/
│   │   ├── middleware.ts           # authenticate, optionalAuthenticate
│   │   └── supabase.ts             # createSupabaseClient(token?)
│   ├── db/
│   │   ├── client.ts               # Prisma singleton
│   │   └── utils.ts                # checkDatabaseConnection()
│   ├── errors/
│   │   ├── app-error.ts            # AppError, subclasses (Unauthorized, NotFound, etc)
│   │   ├── error-handler.ts        # formatError(), handleError()
│   │   └── index.ts                # Re-exports
│   ├── middleware/
│   │   ├── error-handler.ts        # Express error handler (4-arg)
│   │   └── validation.ts           # validateBody, validateQuery, validateParams
│   ├── repositories/
│   │   ├── profile.repository.ts   # CRUD Profile
│   │   ├── account.repository.ts   # CRUD Account
│   │   ├── category.repository.ts  # CRUD Category
│   │   ├── transaction.repository.ts # CRUD Transaction
│   │   ├── budget.repository.ts    # CRUD Budget
│   │   ├── coach.repository.ts     # CRUD CoachProfile (nueva)
│   │   ├── relation.repository.ts  # CRUD Relation (nueva)
│   │   ├── friendship.repository.ts # CRUD Friendship (nueva)
│   │   └── index.ts                # Re-exports
│   ├── routes/
│   │   ├── index.ts                # Mount all routers
│   │   ├── profile.routes.ts       # /api/profile (nueva)
│   │   ├── accounts.routes.ts      # /api/accounts
│   │   ├── categories.routes.ts    # /api/categories
│   │   ├── transactions.routes.ts  # /api/transactions + /voice (nueva)
│   │   ├── budgets.routes.ts       # /api/budgets
│   │   ├── coach.routes.ts         # /api/coach (nueva)
│   │   ├── relations.routes.ts     # /api/relations (nueva)
│   │   ├── friends.routes.ts       # /api/friends (nueva)
│   │   └── users.routes.ts         # /api/users/search (nueva)
│   ├── services/
│   │   ├── profile.service.ts      # ProfileService (nueva)
│   │   ├── account.service.ts      # AccountService
│   │   ├── category.service.ts     # CategoryService
│   │   ├── transaction.service.ts  # TransactionService + voice parsing
│   │   ├── budget.service.ts       # BudgetService
│   │   ├── coach.service.ts        # CoachService (nueva, LLM integration)
│   │   ├── relation.service.ts     # RelationService (nueva)
│   │   ├── friendship.service.ts   # FriendshipService (nueva)
│   │   └── index.ts                # Re-exports
│   ├── validations/
│   │   ├── profile.schema.ts       # Zod schemas (nueva)
│   │   ├── account.schema.ts       # Zod schemas
│   │   ├── category.schema.ts      # Zod schemas
│   │   ├── transaction.schema.ts   # Zod schemas
│   │   ├── budget.schema.ts        # Zod schemas
│   │   ├── coach.schema.ts         # Zod schemas (nueva)
│   │   ├── relation.schema.ts      # Zod schemas (nueva)
│   │   └── index.ts                # Re-exports
│   └── utils/
│       ├── request.ts              # getParamAsString(), getQueryAsString()
│       └── ai.ts                   # LLM helpers: parseVoiceTransaction(), getCoachAdvice() (nueva)
├── prisma/
│   ├── schema.prisma               # Updated with new models
│   └── migrations/                 # Auto-generated by Prisma
├── .env                            # DB_URL, ANTHROPIC_API_KEY, etc
├── tsconfig.json
├── package.json
└── README.md
```

### Frontend (Lukapp-f)
```
Lukapp-f/
├── app/
│   ├── (auth)/                     # Route group, sin layout
│   │   ├── auth/
│   │   │   └── page.tsx            # Login/Signup form (existente)
│   │   └── layout.tsx              # Minimal layout, sin nav
│   │
│   ├── (app)/                      # Route group, con layout protegido
│   │   ├── layout.tsx              # Sidebar + TopNav + BottomNav (mobile)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard principal
│   │   ├── finances/
│   │   │   ├── page.tsx            # Mis finanzas personales
│   │   │   ├── [transactionId]/    # Detalle transacción
│   │   │   └── add/                # Añadir transacción (con voz)
│   │   ├── relations/
│   │   │   ├── page.tsx            # Mis relaciones
│   │   │   ├── [relationId]/       # Detalle relación + gastos compartidos
│   │   │   └── new/                # Crear/invitar relación
│   │   ├── friends/
│   │   │   ├── page.tsx            # Mis amigos
│   │   │   └── search/             # Buscar por username
│   │   ├── coach/
│   │   │   └── page.tsx            # Chat con coach IA
│   │   └── profile/
│   │       └── page.tsx            # Mi perfil + coach setup
│   │
│   ├── globals.css                 # Tailwind v4 + design tokens
│   ├── layout.tsx                  # Root layout: Providers
│   ├── page.tsx                    # Redirect a /dashboard (existente)
│   ├── middleware.ts               # Supabase session refresh (existente)
│   ├── favicon.ico
│   └── next-env.d.ts
│
├── components/
│   ├── ui/                         # Shadcn/UI (existente)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── sheet.tsx
│   │   └── ... (25+ componentes)
│   ├── auth/                       # Auth specific (existente)
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── providers/                  # App providers (existente)
│   │   ├── query-provider.tsx
│   │   └── theme-provider.tsx
│   ├── layout/                     # Layout components (nueva)
│   │   ├── sidebar.tsx             # Navigation menu
│   │   ├── top-nav.tsx             # Top bar (mobile)
│   │   └── bottom-nav.tsx          # Bottom tabs (mobile)
│   ├── finance/                    # Feature: finanzas personales (nueva)
│   │   ├── transaction-form.tsx    # Crear/editar transacción
│   │   ├── transaction-list.tsx    # Listado
│   │   ├── transaction-card.tsx    # Tarjeta
│   │   ├── budget-card.tsx         # Presupuesto
│   │   ├── voice-input.tsx         # Speech-to-text + LLM parse
│   │   ├── expense-chart.tsx       # Recharts pie/bar
│   │   └── balance-summary.tsx     # Resumen ingresos/egresos
│   ├── relation/                   # Feature: relaciones (nueva)
│   │   ├── relation-card.tsx       # Tarjeta de relación
│   │   ├── relation-list.tsx       # Listado relaciones
│   │   ├── invite-partner-form.tsx # Crear relación
│   │   ├── shared-expense-form.tsx # Registrar gasto compartido
│   │   └── split-calculator.tsx    # Calcular división
│   ├── coach/                      # Feature: coach IA (nueva)
│   │   ├── coach-chat.tsx          # Chat container
│   │   ├── coach-message.tsx       # Burbuja mensaje IA
│   │   ├── user-message.tsx        # Burbuja mensaje usuario
│   │   ├── coach-advice.tsx        # Card con recomendación
│   │   ├── coach-setup.tsx         # Personality form
│   │   └── send-message-form.tsx   # Input + voz
│   ├── friend/                     # Feature: amigos (nueva)
│   │   ├── friend-card.tsx
│   │   ├── friend-list.tsx
│   │   ├── friend-search.tsx
│   │   └── friend-request-badge.tsx
│   └── shared/                     # Componentes reutilizables (nueva)
│       ├── avatar.tsx
│       ├── empty-state.tsx
│       ├── loading-spinner.tsx
│       ├── error-card.tsx
│       └── confirm-dialog.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts               # ApiClient class (existente, extendido)
│   │   └── index.ts                # Re-exports
│   ├── hooks/
│   │   ├── use-auth.ts             # useAuth (existente)
│   │   ├── use-api-query.ts        # useApiQuery, useApiMutation (existente)
│   │   ├── use-transactions.ts     # useTransactions, useCreateTransaction (nueva)
│   │   ├── use-relations.ts        # useRelations, useCreateRelation (nueva)
│   │   ├── use-coach.ts            # useCoachAdvice (nueva)
│   │   ├── use-friends.ts          # useFriends, useAddFriend (nueva)
│   │   ├── use-voice.ts            # useVoiceRecording, useVoiceTranscript (nueva)
│   │   └── index.ts                # Re-exports
│   ├── stores/
│   │   ├── ui.store.ts             # Zustand: modal state, notifications (nueva)
│   │   ├── coach.store.ts          # Zustand: coach chat state (nueva)
│   │   └── index.ts                # Re-exports
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient (existente)
│   │   └── server.ts               # createServerClient (existente)
│   ├── utils.ts                    # cn(), helpers (existente)
│   └── constants/
│       ├── categories.ts           # Category presets
│       └── routes.ts               # Navigation routes
│
├── public/
│   └── manifest.json               # PWA manifest (nueva)
│
├── components.json                 # Shadcn config
├── next.config.ts                  # PWA config (actualizar)
├── tsconfig.json
├── tailwind.config.ts              # Tailwind v4 config (si existe)
├── postcss.config.mjs
├── package.json
├── .env.local                      # NEXT_PUBLIC_* vars
└── README.md
```

---

## 5. PATRONES DE CÓDIGO

### Backend: Servicio (example)
```typescript
// src/services/transaction.service.ts
export class TransactionService {
  constructor(
    private transactionRepo: TransactionRepository,
    private accountRepo: AccountRepository,
    private categoryRepo: CategoryRepository,
  ) {}

  async createTransaction(
    userId: string,
    input: CreateTransactionInput,
  ): Promise<Transaction> {
    // Validar propiedad
    const account = await this.accountRepo.findById(userId, input.accountId);
    if (!account) throw new NotFoundError("Account not found");

    // Actualizar balance
    await this.accountRepo.updateBalance(
      input.accountId,
      input.type === "INCOME"
        ? input.amount
        : -input.amount,
    );

    // Crear transacción
    return this.transactionRepo.create(userId, {
      ...input,
      accountId: input.accountId,
    });
  }

  // ... otros métodos
}
```

### Backend: Route (example)
```typescript
// src/routes/transactions.routes.ts
const router = Router();

router.post(
  "/",
  authenticate,
  validateBody(createTransactionSchema),
  async (req, res) => {
    const transaction = await transactionService.createTransaction(
      req.userId,
      req.body,
    );
    res.json({ success: true, data: transaction });
  },
);

export default router;
```

### Frontend: Hook (example)
```typescript
// lib/hooks/use-transactions.ts
export function useTransactions() {
  const { data, isLoading, error } = useApiQuery({
    queryKey: ["transactions"],
    endpoint: "/transactions",
  });

  return { transactions: data, isLoading, error };
}

export function useCreateTransaction() {
  return useApiMutation({
    mutationFn: (data) => api.transactions.create(data),
    successMessage: "Transacción creada",
    invalidateQueries: [["transactions"]],
  });
}
```

### Frontend: Component (example)
```typescript
// components/finance/transaction-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema } from "@/lib/api/schemas";
import { useCreateTransaction } from "@/lib/hooks/use-transactions";

export function TransactionForm() {
  const form = useForm({
    resolver: zodResolver(createTransactionSchema),
  });

  const createTransaction = useCreateTransaction();

  const onSubmit = (data) => {
    createTransaction.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* RHF fields */}
    </form>
  );
}
```

### Frontend: Zustand Store (example)
```typescript
// lib/stores/ui.store.ts
import { create } from "zustand";

interface UIState {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
```

---

## 6. RUTAS API COMPLETAS

### Auth & Profile
```
GET    /api/profile               # Mi perfil (name, avatar, coach status)
PUT    /api/profile               # Actualizar mi perfil
GET    /api/users/search?u=name   # Buscar por username
```

### Finanzas Personales
```
GET    /api/accounts              # Mis cuentas
POST   /api/accounts              # Crear cuenta
GET    /api/accounts/:id          # Detalle cuenta
PUT    /api/accounts/:id          # Actualizar
DELETE /api/accounts/:id          # Eliminar

GET    /api/transactions          # Listar (filtros: date, category, type, account)
POST   /api/transactions          # Crear transacción
POST   /api/transactions/voice    # Crear desde voz (nuevo)
GET    /api/transactions/stats    # Estadísticas mes
GET    /api/transactions/:id      # Detalle
PUT    /api/transactions/:id      # Actualizar
DELETE /api/transactions/:id      # Eliminar

GET    /api/categories            # Mis categorías
POST   /api/categories            # Crear
PUT    /api/categories/:id        # Actualizar
DELETE /api/categories/:id        # Eliminar

GET    /api/budgets               # Mis presupuestos
POST   /api/budgets               # Crear
GET    /api/budgets/status        # Estado (spent, remaining, %)
PUT    /api/budgets/:id           # Actualizar
DELETE /api/budgets/:id           # Eliminar
```

### Coach IA
```
POST   /api/coach/setup           # Primera configuración de personalidad
GET    /api/coach/profile         # Mi perfil de coach
POST   /api/coach/advice          # Obtener recomendación (LLM)
```

### Relaciones (Parejas/Familias)
```
POST   /api/relations             # Crear relación + invitar
GET    /api/relations             # Mis relaciones
GET    /api/relations/:id         # Detalle relación
DELETE /api/relations/:id         # Terminar relación
PUT    /api/relations/:id/accept  # Aceptar invitación (pendiente)

POST   /api/relations/:id/expenses      # Registrar gasto compartido
GET    /api/relations/:id/expenses      # Listar gastos compartidos
PUT    /api/relations/:id/expenses/:eid # Actualizar
DELETE /api/relations/:id/expenses/:eid # Eliminar
PUT    /api/relations/:id/expenses/:eid/settle # Marcar como resuelto
```

### Amigos
```
POST   /api/friends               # Enviar solicitud
GET    /api/friends               # Mis amigos
PUT    /api/friends/:id/accept    # Aceptar solicitud
DELETE /api/friends/:id           # Rechazar/eliminar
```

---

## 7. FLUJOS DE FEATURES

### Flujo: Signup + Onboarding
```
1. Usuario llena form (email, password)
   → RHF + Zod validation en frontend

2. Frontend: supabase.auth.signUp(email, password)
   → Supabase crea usuario en Auth

3. Backend: POST /profile (opcional, con token)
   → Crea Profile en DB

4. Frontend: CoachPersonalityForm (tone, approach, goal, risk)
   → Zod validation

5. Backend: POST /coach/setup
   → Crea CoachProfile en DB

6. Redirect → /dashboard

Archivos:
- Lukapp-f: components/auth/signup-form.tsx, components/coach/coach-setup.tsx
- Lukapp-b: routes/profile.routes.ts, services/profile.service.ts, routes/coach.routes.ts
```

### Flujo: Registrar Gasto por Voz
```
1. Usuario presiona "Hablar"
   → <VoiceInput /> starts recording

2. Web Speech API: reconoce "Gasté 50k en comida"
   → Transcripción en frontend

3. Frontend: POST /api/transactions/voice { voiceInput: "..." }
   → Envía al backend

4. Backend (TransactionService):
   - Llama Anthropic SDK con system prompt
   - LLM parsea: amount=50000, category=food, description=Comida
   - Crea Transaction en DB

5. Frontend: React Query invalida ["transactions"]
   → UI actualiza automáticamente

6. Toast: "Transacción creada ✓"

Archivos:
- Lukapp-f: components/finance/voice-input.tsx, lib/hooks/use-voice.ts
- Lukapp-b: routes/transactions.routes.ts, services/transaction.service.ts, utils/ai.ts
- Anthropic: Claude API voice parsing prompt
```

### Flujo: Crear Relación (Pareja Invitación)
```
1. User A: /relations/new form
   → Busca "username_pareja"
   → RHF form con búsqueda de usuario

2. Frontend: POST /api/relations
   {
     type: "couple",
     userBId: "...",
     name: "Mi relación con Sara"
   }

3. Backend:
   - Valida que User B existe
   - Crea Relation con status: pending
   - (Futuro: envía email notificación)

4. User B:
   - Recibe notificación en app
   - Ver invitación pendiente
   - Acepta: PUT /api/relations/:id/accept

5. Relación activa
   - Ambos pueden:
     - Ver gastos compartidos
     - Registrar gastos con "compartido"
     - Ver resumen pareja

Archivos:
- Lukapp-f: components/relation/invite-partner-form.tsx
- Lukapp-b: routes/relations.routes.ts, services/relation.service.ts
```

### Flujo: Coach Advice (Recomendación IA)
```
1. User entra a /coach
   → <CoachChat />

2. Frontend: GET /api/coach/advice
   → Backend calcula contexto

3. Backend (CoachService):
   - Obtiene TransactionStats (ingresos, egresos, categoría)
   - Obtiene CoachProfile (personalidad)
   - Arma system prompt:
     "Eres un coach de finanzas. Personalidad: ${tone}, Objetivo: ${goal}.
      Usuario gastó 150k en comida, su presupuesto es 100k.
      Personalidad tipo: ${approach}. Dame 1-2 recomendaciones cortas y natural."

   - Llama Anthropic SDK: client.messages.create({ model: "claude-opus-4-6", ... })

4. Backend responde: { success: true, data: { advice: "...", createdAt: now() } }

5. Frontend: Muestra en <CoachMessage /> con animación

6. User puede responder (futuro: conversación multi-turno)

Archivos:
- Lukapp-f: components/coach/coach-chat.tsx
- Lukapp-b: routes/coach.routes.ts, services/coach.service.ts, utils/ai.ts
```

---

## 8. CONFIGURACIONES PENDIENTES

### Frontend (Lukapp-f)

#### 1. **next.config.ts** — Agregar PWA
```typescript
import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  // ... existing config
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);
```

#### 2. **Middleware** — Proteger rutas (app)
```typescript
// middleware.ts
export const config = {
  matcher: [
    "/((?!auth|api|public).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const session = await getSession(request);

  if (!session && request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return await updateSession(request);
}
```

#### 3. **.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (Lukapp-b)

#### 1. **.env**
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# IA
ANTHROPIC_API_KEY=sk-ant-xxx

# CORS
FRONTEND_URL=http://localhost:3000
```

#### 2. **Prisma Schema** — Agregar nuevas tablas + migrations
```bash
cd Lukapp-b
npm run db:push  # O npm run db:migrate
```

#### 3. **Supabase RLS Policies** (security)
```sql
-- Solo tu perfil
CREATE POLICY user_profiles ON profiles
  USING (auth.uid()::text = user_id);

-- Relaciones: solo si eres parte
CREATE POLICY relation_access ON relations
  USING (user_a_id = auth.uid() OR user_b_id = auth.uid());
```

---

## 9. GUÍA DE DESARROLLO

### Creando una nueva feature (ejemplo: Presupuestos)

#### Paso 1: Schema Prisma
```prisma
model Budget {
  id     String @id @default(cuid())
  userId String
  // ... campos
}
```

#### Paso 2: Repository (Backend)
```typescript
// Lukapp-b/src/repositories/budget.repository.ts
export class BudgetRepository {
  async create(userId: string, data: any) { ... }
  async findById(userId: string, budgetId: string) { ... }
  // ...
}
```

#### Paso 3: Service (Backend)
```typescript
// Lukapp-b/src/services/budget.service.ts
export class BudgetService {
  constructor(private budgetRepo: BudgetRepository) {}

  async createBudget(userId: string, input: any) {
    // Validación de lógica
    return this.budgetRepo.create(userId, input);
  }
  // ...
}
```

#### Paso 4: Routes (Backend)
```typescript
// Lukapp-b/src/routes/budgets.routes.ts
router.post(
  "/",
  authenticate,
  validateBody(createBudgetSchema),
  async (req, res) => {
    const budget = await budgetService.createBudget(req.userId, req.body);
    res.json({ success: true, data: budget });
  },
);
```

#### Paso 5: API Client (Frontend)
```typescript
// Lukapp-f/lib/api/client.ts
api.budgets = {
  create: (data) => post("/budgets", data),
  getAll: () => get("/budgets"),
  // ...
};
```

#### Paso 6: Hook (Frontend)
```typescript
// Lukapp-f/lib/hooks/use-budgets.ts
export function useCreateBudget() {
  return useApiMutation({
    mutationFn: (data) => api.budgets.create(data),
    invalidateQueries: [["budgets"]],
  });
}
```

#### Paso 7: Component (Frontend)
```typescript
// Lukapp-f/components/finance/budget-form.tsx
"use client";

export function BudgetForm() {
  const createBudget = useCreateBudget();
  // ...
  return <form>...</form>;
}
```

---

## Resumen Rápido

| Aspecto | Decisión |
|--------|----------|
| **Frontend** | Next.js 16 + React 19 + Tailwind v4 + TanStack Query + Zustand |
| **Backend** | Express + Prisma + TypeScript |
| **BD** | PostgreSQL (Supabase) con RLS |
| **Auth** | Supabase JWT (frontend + backend) |
| **IA** | Anthropic SDK (Claude API) |
| **Voz** | Web Speech API (nativa) |
| **PWA** | next-pwa (manifest + service worker) |
| **Validación** | Zod (frontend + backend) |
| **State** | React Query (servidor) + Zustand (cliente) |
| **UI** | Shadcn/ui + Radix UI + Lucide React |

---

## Referencias
- `LukappPP_IDEA_REFINED.md` — Idea y modelo de negocio
- `TECHNICAL_SPEC.md` — Especificación técnica del MVP
- `Lukapp-f/FRONTEND_ARCHITECTURE.md` — Detalles frontend
- `Lukapp-b/README.md` — Detalles backend

---

**Estado:** MVP Architecture v1.0 — Listo para empezar desarrollo
