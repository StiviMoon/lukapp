# LukappPP — Especificación Técnica MVP
**Fecha:** 15 de marzo 2026
**Estado:** MVP Development
**Stack Actual:** Next.js 16 + Express + Prisma + Supabase

---

## 📋 RESUMEN EJECUTIVO

**MVP:** PWA mobile-first para gestionar finanzas personales + compartidas + IA coach
**Duración estimada:** 4-5 semanas
**Equipo:** Steven (dev) + Claude (IA)
**Repositorio:** `/home/steven/Documentos/Proyectos/Lukapp/`

---

## 🗄️ SCHEMA DE BASE DE DATOS (Prisma)

### Nuevas Tablas para MVP

#### 1. **UserProfile** (complemento a auth)
```prisma
model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique // FK a Supabase Auth
  username        String   @unique // tipo Instagram (único a nivel global)
  displayName     String?
  avatar          String?
  bio             String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  coachProfile    CoachProfile?
  relations       Relation[] @relation("UserA")
  relationsInv    Relation[] @relation("UserB")
  friendships     Friendship[] @relation("Requester")
  friendshipInv   Friendship[] @relation("Requested")
  transactions    Transaction[]
  budgets         Budget[]
  accounts        Account[]
}
```

#### 2. **CoachProfile** (personalidad del coach IA)
```prisma
model CoachProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  userProfile     UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Personalidad (se define en onboarding)
  tone            String   // "formal" | "casual" | "motivador"
  approach        String   // "conservador" | "balanceado" | "agresivo"
  primaryGoal     String   // "ahorrar" | "invertir" | "balance"
  riskTolerance   String   // "bajo" | "medio" | "alto"

  // Datos para IA
  values          String[] // ["ahorro", "independencia", "educacion", etc]
  insights        String? // JSON con historial de insights

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### 3. **Relation** (pareja/familia)
```prisma
model Relation {
  id              String   @id @default(cuid())
  type            String   // "couple" | "family" | "friends"
  name            String   // "Mi relación con Sara" | "Familia García"

  userAId         String
  userA           UserProfile @relation("UserA", fields: [userAId], references: [id], onDelete: Cascade)

  userBId         String
  userB           UserProfile @relation("UserB", fields: [userBId], references: [id], onDelete: Cascade)

  sharedExpenses  SharedExpense[]
  sharedBudgets   SharedBudget[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userAId, userBId])
}
```

#### 4. **SharedExpense** (gasto compartido)
```prisma
model SharedExpense {
  id              String   @id @default(cuid())
  relationId      String
  relation        Relation @relation(fields: [relationId], references: [id], onDelete: Cascade)

  description     String
  amount          Float
  currency        String   @default("COP")
  category        String

  paidByUserId    String   // Quién pagó
  splitType       String   @default("equal") // "equal" | "custom"

  // Split personalizado: { "userId1": 30000, "userId2": 20000 }
  customSplit     String?  // JSON

  status          String   @default("pending") // "pending" | "settled"

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### 5. **SharedBudget** (presupuesto compartido)
```prisma
model SharedBudget {
  id              String   @id @default(cuid())
  relationId      String
  relation        Relation @relation(fields: [relationId], references: [id], onDelete: Cascade)

  category        String
  limit           Float
  spent           Float   @default(0)

  startDate       DateTime
  endDate         DateTime

  @@unique([relationId, category])
}
```

#### 6. **Friendship** (red social)
```prisma
model Friendship {
  id              String   @id @default(cuid())

  requesterId     String
  requester       UserProfile @relation("Requester", fields: [requesterId], references: [id])

  requestedId     String
  requested       UserProfile @relation("Requested", fields: [requestedId], references: [id])

  status          String   @default("pending") // "pending" | "accepted" | "rejected"

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([requesterId, requestedId])
}
```

#### 7. **Transaction** (actualizar existente)
```prisma
model Transaction {
  id              String   @id @default(cuid())

  userId          String
  user            UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Datos básicos
  type            String   // "income" | "expense"
  amount          Float
  currency        String   @default("COP")
  category        String
  description     String

  // Voz
  voiceInput      String?  // Transcripción de voz

  // Compartido
  isShared        Boolean  @default(false)
  sharedWith      String?  // FK a Relation

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 🔌 API ROUTES (EXPRESS BACKEND)

### Autenticación
- `POST /api/auth/profile` - Crear UserProfile después de signup
- `GET /api/auth/me` - Obtener perfil actual

### UserProfile & Friends
- `GET /api/profile` - Mi perfil
- `GET /api/profile/:username` - Perfil público de otro usuario
- `PUT /api/profile` - Actualizar mi perfil
- `POST /api/friends/add` - Enviar solicitud de amistad
- `GET /api/friends` - Lista de amigos
- `PUT /api/friends/:friendshipId/accept` - Aceptar solicitud

### Onboarding & Coach
- `POST /api/coach/setup` - Configurar perfil del coach (primera vez)
- `GET /api/coach/profile` - Mi perfil de coach
- `POST /api/coach/advice` - Obtener recomendación IA (LLM)

### Relations (Parejas/Familias)
- `POST /api/relations` - Crear relación
- `GET /api/relations` - Mis relaciones
- `GET /api/relations/:relationId` - Detalles de relación
- `DELETE /api/relations/:relationId` - Terminar relación

### Shared Expenses
- `POST /api/relations/:relationId/expenses` - Registrar gasto compartido
- `GET /api/relations/:relationId/expenses` - Listar gastos compartidos
- `PUT /api/relations/:relationId/expenses/:expenseId` - Actualizar
- `DELETE /api/relations/:relationId/expenses/:expenseId` - Eliminar
- `PUT /api/relations/:relationId/expenses/:expenseId/settle` - Marcar como resuelto

### Transactions (Personal)
- `POST /api/transactions` - Crear transacción personal
- `GET /api/transactions` - Mis transacciones (con filtros)
- `POST /api/transactions/voice` - Crear desde voz + parsing IA
- `GET /api/transactions/stats` - Estadísticas
- `PUT /api/transactions/:id` - Actualizar
- `DELETE /api/transactions/:id` - Eliminar

### Budgets
- `POST /api/budgets` - Crear presupuesto personal
- `GET /api/budgets` - Mis presupuestos
- `GET /api/budgets/status` - Estado de presupuestos

---

## 🎨 COMPONENTES FRONTEND (REACT/NEXT.JS)

### Páginas Principales

#### 1. **Auth** (`/auth`)
- LoginForm (email + password)
- SignupForm (email + password)
- OnboardingFlow (después de signup)
  - CoachPersonalitySetup (tone, approach, goal, risk)

#### 2. **Dashboard** (`/dashboard`)
- DashboardLayout (navegación)
- FinancesSummary (resumen personal + compartido)
- RecentTransactions (últimas transacciones)
- CoachCard (coach IA)

#### 3. **My Finances** (`/dashboard/finances`)
- FinancesView
  - PersonalExpenses (mis gastos)
  - PersonalIncome (mis ingresos)
  - Goals (metas)
  - Budgets (presupuestos)
- AddTransactionForm (con opción voz)
- TransactionVoiceInput (Speech-to-text + parsing)

#### 4. **Relations** (`/dashboard/relations`)
- RelationsList
  - RelationCard (nombre, tipo, estado)
  - RelationDetail
    - SharedExpenses (tabla de gastos)
    - SharedBudgets
    - Members
- CreateRelationModal
- InvitePartnerForm

#### 5. **Friends** (`/dashboard/friends`)
- FriendsList
- SearchFriendsForm (por username)
- FriendRequestsNotifications
- AddFriendForm

#### 6. **Coach** (`/dashboard/coach`)
- CoachChat (interfaz conversacional)
  - CoachMessage (IA)
  - UserMessage (usuario)
  - SendMessage con opciones (texto + voz)
- CoachAdviceCard (recomendación)
- CoachProfileSetup (editar personalidad)

#### 7. **Profile** (`/dashboard/profile`)
- ProfileForm (username, avatar, bio)
- CoachProfileForm (tone, approach, goal)
- PrivacySettings

### Componentes Compartidos

```
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Card
│   ├── Modal
│   ├── Tabs
│   ├── DatePicker
│   └── ... (Shadcn/ui)
├── Auth/
│   ├── LoginForm
│   ├── SignupForm
│   └── OnboardingFlow
├── Finance/
│   ├── TransactionForm
│   ├── TransactionList
│   ├── BudgetCard
│   ├── ExpenseChart
│   └── VoiceInput
├── Relations/
│   ├── RelationCard
│   ├── SharedExpenseForm
│   ├── SharedExpenseList
│   └── RelationInvite
├── Coach/
│   ├── CoachChat
│   ├── CoachMessage
│   ├── CoachAdvice
│   └── CoachSetup
└── Providers/
    ├── QueryProvider (React Query)
    └── AuthProvider
```

---

## 🎙️ VOZ + IA (PARSING)

### Flujo de Voz

```
1. Usuario presiona "Hablar"
2. Web Speech API captura audio
3. Speech-to-text → "Gasté 50k en almuerzo con Sara"
4. Envía a backend: POST /api/transactions/voice
5. Backend:
   - Usa Claude API para parsear
   - Extrae: amount, category, description, isShared
   - Crea Transaction
6. Frontend muestra: "¿Gasté 50k en comida con Sara? ✓"
```

### System Prompt para LLM (Parsing)

```typescript
const voiceParsingPrompt = `
Eres un asistente que parsea transacciones financieras de audio en español.

Usuario dice: "${transcribedText}"

Extrae:
- amount: número
- currency: "COP" (default)
- category: "food" | "transport" | "entertainment" | "utilities" | "shopping" | "other"
- description: descripción
- isShared: boolean (detecta si menciona "con X" o "nosotros")
- sharedWith: nombre de persona (si isShared = true)

Responde SOLO en JSON:
{
  "amount": 50000,
  "currency": "COP",
  "category": "food",
  "description": "Almuerzo",
  "isShared": true,
  "sharedWith": "Sara"
}
`;
```

### Coach IA Prompt

```typescript
const coachPrompt = `
Eres un coach de finanzas personal y empático.

Personalidad del usuario:
- Tone: ${userCoach.tone}
- Approach: ${userCoach.approach}
- Goal: ${userCoach.primaryGoal}
- Risk: ${userCoach.riskTolerance}

Datos financieros del usuario:
- Ingresos este mes: $${monthlyIncome}
- Gastos este mes: $${monthlyExpense}
- Presupuesto comida: $${foodBudget} (gastado: $${foodSpent})
- Meta: ${userCoach.primaryGoal}

Interactúa de forma natural, dale 1-2 recomendaciones cortas basadas en sus datos.
NO des consejos genéricos. Personaliza todo a su perfil y datos.

Ejemplo respuesta:
"Vi que gastaste 150k en comida este mes, 50k más que tu presupuesto 😅
¿Qué tal si planificamos las salidas? Te recomiendo cocinar 3 días más."
`;
```

---

## 📱 FLUJOS PRINCIPALES (MVP)

### 1. Signup + Onboarding
```
SignupForm
  → Create Supabase Auth
  → Create UserProfile
  → CoachPersonalityForm
  → Create CoachProfile
  → Dashboard (redirect)
```

### 2. Crear Relación
```
User A:
  - Va a Relations → "Add Relation"
  - Busca username de User B o comparte código
  - Crea Relation (status: pending)
  - Envía invitación

User B:
  - Recibe notificación/email
  - Acepta → Relation (status: active)
```

### 3. Registrar Gasto Personal (Voz)
```
User presiona "Hablar"
  → Speech-to-text
  → LLM parsea
  → Muestra preview
  → Confirma
  → POST /transactions
  → Actualiza React Query
  → Toast "Transacción creada"
```

### 4. Registrar Gasto Compartido
```
User A registra gasto:
  - "Gasté 100k en cena con pareja"
  - Sistema detecta "con pareja"
  - Pregunta: "¿Dividir 50/50?"
  - POST /relations/:id/expenses
  - Se notifica a User B (opcional: pedir confirmación)
```

### 5. Ver Recomendación Coach
```
User entra a Coach
  → GET /coach/advice
  → Backend:
    - Obtiene user data + coach profile
    - Crea prompt personalizado
    - Llama Claude API
  → Muestra respuesta en UI
  → User puede responder (chat)
```

---

## 🛠️ TECNOLOGÍAS DETALLE

### Frontend (Lukapp-f)
```
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + Shadcn/ui
- React Hook Form + Zod (validación)
- React Query (estado del servidor)
- Zustand (estado global)
- Supabase JS (solo auth)
- Web Speech API (voz)
- next-pwa (Progressive Web App)
- Lucide React (iconos)
- Recharts (gráficos)
```

### Backend (Lukapp-b)
```
- Express.js
- TypeScript
- Prisma 6.19.2 (ORM)
- PostgreSQL (Supabase)
- Supabase Auth (JWT validation)
- Zod (validación)
- Anthropic SDK (Claude API para IA)
```

### Base de Datos
```
- Supabase (PostgreSQL + Auth)
- Row Level Security (RLS) en tablas compartidas
```

---

## 🎯 MVP (SEMANAS 1-4)

### Semana 1: Infraestructura
- ✅ Schema Prisma completo (7 tablas)
- ✅ Migraciones
- ✅ API routes base (auth, profile, coach, relations, transactions)
- ✅ Supabase RLS policies
- **Hitos:** `npm run dev` en ambos, BD con datos

### Semana 2: Frontend MVP
- ✅ Auth pages (login, signup, onboarding coach)
- ✅ Dashboard (layout, summary)
- ✅ Finances page (add transaction, list)
- ✅ Voice input (Web Speech API)
- ✅ Relations page (create, list)
- **Hitos:** Flujos básicos funcionales

### Semana 3: IA + Integración
- ✅ Anthropic SDK integrado en backend
- ✅ Voice parsing (LLM)
- ✅ Coach chat basic
- ✅ Recomendaciones IA
- **Hitos:** IA funcionando, voz parseando

### Semana 4: QA + Soft Launch
- ✅ Bugs fixes
- ✅ Beta testing (20-30 usuarios)
- ✅ Performance optimization
- ✅ Soft launch (redes sociales)
- **Hitos:** MVP en producción

---

## 🎮 FASE 2 (SEMANAS 5-12)

### Semana 5-6: Mascota
- Mascota evoluciona con comportamiento financiero
- Stats: nivel, exp, mood
- Animaciones simples

### Semana 7-8: Gamificación
- Badges (primeras transacciones, metas)
- Streaks (días consecutivos sin deudas)
- Leaderboards (amigos: quién ahorra más)

### Semana 9-10: IA Avanzada
- Predicciones (si sigues así, dinero se acaba en X días)
- Análisis de patrones
- Recomendaciones automáticas

### Semana 11-12: Integraciones
- Stripe (pagos)
- Transferencias bancarias
- Exportar datos

---

## 📊 MÉTRICAS MVP

| Métrica | Meta | Cómo medir |
|---------|------|-----------|
| **Adopción** | 50+ usuarios mes 1 | Analytics |
| **Engagement** | 50%+ activos semanales | DAU/WAU |
| **Premium Conv.** | 2-5% | Usuarios pagando |
| **Satisfaction** | NPS > 40 | Encuesta |

---

## 🔒 SEGURIDAD

1. **Autenticación:** Supabase Auth (JWT)
2. **Autorización:** Middleware verifica ownership
3. **Privacidad:** RLS en tablas (solo tus datos)
4. **Validación:** Zod en backend
5. **CORS:** Whitelist frontend

### RLS Policies Ejemplo
```sql
-- Usuarios solo ven sus propias transacciones
CREATE POLICY user_transactions ON transactions
  USING (user_id = auth.uid());

-- Relaciones: ambos usuarios pueden ver
CREATE POLICY relation_shared ON shared_expenses
  USING (
    EXISTS (
      SELECT 1 FROM relations
      WHERE id = relation_id
      AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
    )
  );
```

---

## 🚀 DEPLOYMENT

### Frontend (Vercel)
```bash
cd Lukapp-f
vercel deploy
```

### Backend (Render/Railway/Fly.io)
```bash
cd Lukapp-b
# Configurar POSTGRESQL_URL + ANTHROPIC_API_KEY
npm run build
npm start
```

### Database (Supabase)
- Crear proyecto en supabase.com
- Copiar DATABASE_URL
- `npm run db:push`

---

## 📋 CHECKLIST MVP

### Backend
- [ ] Schema Prisma (7 tablas)
- [ ] Auth middleware
- [ ] UserProfile service
- [ ] CoachProfile service
- [ ] Relation service (invite + accept)
- [ ] SharedExpense service
- [ ] Transaction service (con voz)
- [ ] Voice parsing (LLM)
- [ ] Coach advice (LLM)
- [ ] Tests básicos
- [ ] Error handling
- [ ] Logging

### Frontend
- [ ] Layout + Navigation
- [ ] Auth pages (login, signup, onboarding)
- [ ] Dashboard
- [ ] My Finances (add, list, edit, delete)
- [ ] Voice input component
- [ ] Relations (create, invite, list, shared expenses)
- [ ] Friends (search, add, list)
- [ ] Coach (chat, advice)
- [ ] Profile page
- [ ] Mobile responsive (Tailwind)
- [ ] Error handling
- [ ] Loading states
- [ ] PWA (offline basic)

### Deployment
- [ ] Supabase setup (auth, DB, RLS)
- [ ] Backend envs (Render/Railway)
- [ ] Frontend envs (Vercel)
- [ ] Anthropic API key
- [ ] CORS configured
- [ ] Health checks

---

## 🤔 PREGUNTAS ABIERTAS A RESOLVER

1. **Invitar pareja:**
   - Username (como Instagram) ✅
   - + Código único como backup ✅

2. **Personalidad coach:**
   - Tabla `CoachProfile` con tone, approach, goal, risk ✅
   - Onboarding form en signup ✅

3. **Voz:**
   - Web Speech API (gratis, nativo) ✅
   - LLM parsea (Anthropic SDK) ✅

4. **Detalles aún por definir:**
   - ¿Notificaciones push en MVP o Fase 2?
   - ¿Exportar datos en MVP o Fase 2?
   - ¿Transacciones recurrentes en MVP o Fase 2?
   - ¿Multi-currency en MVP o Fase 2? (default COP)

---

## 📚 REFERENCIAS

- **Frontend Doc:** `Lukapp-f/FRONTEND_ARCHITECTURE.md`
- **Backend Doc:** `Lukapp-b/README.md`
- **Idea Doc:** `LukappPP_IDEA_REFINED.md`

---

