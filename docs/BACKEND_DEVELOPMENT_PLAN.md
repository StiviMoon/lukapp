# Plan de desarrollo backend — Lukapp

**Fecha:** 15 de marzo 2026  
**Objetivo:** Alinear el backend (luka-b) con la documentación (TECHNICAL_SPEC, ARCHITECTURE) y definir el orden de implementación.

---

## 1. Resumen de la documentación

### 1.1 Visión del producto (LUKAPP_IDEA_REFINED + TECHNICAL_SPEC)

- **MVP:** PWA de finanzas personales + compartidas + IA coach.
- **Core:** Registro de ingresos/egresos (texto + voz), categorías, presupuestos, relaciones (pareja/familia), gastos compartidos, coach IA conversacional, red social básica (amigos).
- **Stack backend:** Express + TypeScript + Prisma + PostgreSQL (Supabase) + Supabase Auth (JWT) + Anthropic SDK (Claude).

### 1.2 API definida en docs

| Área | Rutas | Estado en luka-b |
|------|--------|-------------------|
| **Auth / Perfil** | `POST /api/auth/profile`, `GET /api/auth/me`, `GET /api/profile`, `PUT /api/profile`, `GET /api/profile/:username` | ❌ No existen rutas de profile/auth |
| **Finanzas** | `/api/accounts`, `/api/transactions`, `/api/categories`, `/api/budgets` + `POST /transactions/voice`, `GET /transactions/stats` | ✅ CRUD existe; ❌ falta `/voice` y `/stats` |
| **Coach** | `POST /api/coach/setup`, `GET /api/coach/profile`, `POST /api/coach/advice` | ❌ No existe |
| **Relaciones** | `POST/GET/DELETE /api/relations`, `GET /api/relations/:id`, + expenses bajo `/relations/:id/expenses` | ❌ No existe |
| **Amigos** | `POST /api/friends`, `GET /api/friends`, `PUT /api/friends/:id/accept`, `DELETE /api/friends/:id` | ❌ No existe |
| **Usuarios** | `GET /api/users/search?u=username` | ❌ No existe |

### 1.3 Schema de datos en docs vs actual

| Modelo | En docs | En Prisma actual | Acción |
|--------|---------|-------------------|--------|
| **Profile** | UserProfile: username, displayName, bio, avatar | Profile: email, fullName, avatarUrl, currency | Añadir `username` (unique), `bio`; opcional displayName |
| **CoachProfile** | tone, approach, primaryGoal, riskTolerance, values, insights | No existe | Crear modelo + migración |
| **Relation** | type, name, userA, userB, sharedExpenses, sharedBudgets | No existe | Crear modelo + migración |
| **SharedExpense** | Doc: tabla; ARCHITECTURE: reutilizar Transaction con isShared + relationId | No existe | Opción A: tabla SharedExpense. Opción B: extender Transaction (isShared, relationId) — doc técnico mezcla ambas; recomendable **extender Transaction** para MVP |
| **SharedBudget** | Doc: tabla separada | No existe | Crear o posponer a Fase 2 (doc permite gastos compartidos primero) |
| **Friendship** | requester, requested, status (pending/accepted/rejected) | No existe | Crear modelo + migración |
| **Transaction** | voiceInput, isShared, sharedWith/relationId | Solo campos básicos | Añadir `voiceInput`, `isShared`, `relationId` (FK a Relation) |

---

## 2. Estado actual del backend (luka-b)

### 2.1 Lo que ya está implementado

- **Auth:** Middleware `authenticate` y `optionalAuthenticate` con Supabase JWT.
- **DB:** Prisma con Profile, Account, Category, Transaction, Budget (sin Coach, Relation, Friendship).
- **Repositories:** profile, account, category, transaction, budget.
- **Services:** account, category, transaction, budget.
- **Routes:** `/api/accounts`, `/api/transactions`, `/api/categories`, `/api/budgets`.
- **Validations:** Zod en account, category, transaction, budget.
- **Errors:** AppError, NotFoundError, UnauthorizedError, error handler Express.
- **Health:** `GET /api/health`.

### 2.2 Lo que falta (según docs)

1. Rutas de **perfil** y **auth** (crear/obtener perfil tras signup).
2. **Profile:** campo `username` (unique) y `bio` en BD.
3. **CoachProfile** (modelo + repo + service + rutas).
4. **Relation** (modelo + repo + service + rutas + gastos compartidos).
5. **Friendship** (modelo + repo + service + rutas).
6. **Transaction:** `voiceInput`, `isShared`, `relationId`; endpoint `POST /transactions/voice` (parsing con Claude).
7. **Transaction:** `GET /transactions/stats` (estadísticas por mes).
8. **Usuarios:** `GET /api/users/search?u=username` (para invitar a relaciones/amigos).
9. **IA:** Integración Anthropic (parsing voz + coach advice).
10. **SharedBudget** (opcional para MVP; doc lo menciona pero se puede dejar para después).

---

## 3. Plan de desarrollo priorizado

### Fase 1 — Perfil y auth (base para el resto)

Objetivo: que cada usuario tenga un perfil en BD tras el signup y que el frontend pueda leer/actualizar perfil y buscar por username.

| # | Tarea | Detalle |
|---|--------|--------|
| 1.1 | Schema Profile | Añadir en Prisma: `username String? @unique`, `bio String?`. Migración. |
| 1.2 | Rutas profile | `GET /api/profile` (mi perfil), `PUT /api/profile` (actualizar), `GET /api/profile/:username` (perfil público). Servicio + validaciones Zod. |
| 1.3 | Crear perfil tras signup | `POST /api/auth/profile` (body: email, fullName?, username?) — crear Profile si no existe. Llamado desde frontend después de `signUp`. |
| 1.4 | Búsqueda por username | `GET /api/users/search?u=xxx` (optionalAuthenticate), devolver id, username, displayName, avatarUrl para invitar. |

**Entregable:** Signup → crear perfil → ver/editar perfil y buscar usuarios por username.

---

### Fase 2 — Coach (personalidad + recomendaciones IA)

Objetivo: onboarding del coach y recomendaciones con Claude.

| # | Tarea | Detalle |
|---|--------|--------|
| 2.1 | Modelo CoachProfile | Prisma: userId (FK Profile), tone, approach, primaryGoal, riskTolerance, values (String[] o JSON), insights (String?), lastAdviceDate. Migración. |
| 2.2 | Coach repository + service | CRUD por userId; método `getOrCreate` para onboarding. |
| 2.3 | Rutas coach | `POST /api/coach/setup` (crear/actualizar personalidad), `GET /api/coach/profile`, `POST /api/coach/advice` (llamar Claude con contexto usuario + personalidad). |
| 2.4 | Integración Anthropic | Variable `ANTHROPIC_API_KEY` en .env. Utilidad `utils/ai.ts`: `getCoachAdvice(userId)` (lee Profile + CoachProfile + transacciones/presupuestos recientes, arma prompt, llama API). |
| 2.5 | Validaciones | Zod para coach/setup y coach/advice (si aplica body). |

**Entregable:** Usuario configura coach en onboarding; puede pedir recomendaciones y el backend responde con texto generado por Claude.

---

### Fase 3 — Transacciones por voz y estadísticas

Objetivo: crear transacción desde texto de voz y exponer estadísticas.

| # | Tarea | Detalle |
|---|--------|--------|
| 3.1 | Transaction: voiceInput | Añadir campo `voiceInput String?` en Prisma. Migración. |
| 3.2 | POST /transactions/voice | Body: `{ voiceInput: string }`. Servicio llama a Claude para parsear (amount, category, description, etc.) y luego crea Transaction. Schema Zod. |
| 3.3 | GET /transactions/stats | Query: mes/año o rango. Respuesta: ingresos totales, gastos totales, por categoría (opcional). Servicio + repo (agregaciones Prisma). |

**Entregable:** Frontend puede enviar transcripción de voz y recibir transacción creada; puede pedir stats del mes.

---

### Fase 4 — Relaciones y gastos compartidos

Objetivo: relaciones entre dos usuarios (pareja/familia) y gastos compartidos.

| # | Tarea | Detalle |
|---|--------|--------|
| 4.1 | Modelo Relation | Prisma: type (enum: COUPLE, FAMILY, FRIENDS), name?, userAId, userBId (FK Profile). @@unique([userAId, userBId]). Migración. |
| 4.2 | Transaction: isShared, relationId | Añadir `isShared Boolean @default(false)`, `relationId String?` (FK Relation). Migración. |
| 4.3 | Relation repository + service | Crear relación (validar que userB exista), listar por userId (donde userA o userB), aceptar invitación (si se usa status pending en futuro). |
| 4.4 | Rutas relations | `POST /api/relations` (crear/invitar), `GET /api/relations`, `GET /api/relations/:id`, `DELETE /api/relations/:id`. |
| 4.5 | Rutas expenses por relación | `POST /api/relations/:relationId/expenses`, `GET /api/relations/:relationId/expenses`, `PUT/DELETE /api/relations/:relationId/expenses/:expenseId`. Los “expenses” pueden ser registros en Transaction con isShared=true y relationId=:relationId, o una tabla SharedExpense; para MVP usar Transaction compartida es suficiente. |
| 4.6 | Autorización | Solo userA o userB pueden ver/editar la relación y sus gastos. |

**Entregable:** Crear relación, listar relaciones, añadir gastos compartidos a una relación.

---

### Fase 5 — Amigos (red social básica)

Objetivo: solicitudes de amistad y lista de amigos.

| # | Tarea | Detalle |
|---|--------|--------|
| 5.1 | Modelo Friendship | requesterId, requestedId (FK Profile), status (enum: PENDING, ACCEPTED, REJECTED). @@unique([requesterId, requestedId]). Migración. |
| 5.2 | Friendship repository + service | Crear solicitud, listar amigos (status=ACCEPTED), aceptar/rechazar. |
| 5.3 | Rutas friends | `POST /api/friends` (enviar solicitud), `GET /api/friends` (lista + estado pendiente), `PUT /api/friends/:id/accept`, `DELETE /api/friends/:id`. |

**Entregable:** Añadir amigo por username, ver amigos y solicitudes pendientes, aceptar/rechazar.

---

## 4. Orden sugerido de implementación (semanas 1–2)

1. **Fase 1** (Perfil y auth) — Base para onboarding y búsqueda.
2. **Fase 2** (Coach) — Diferenciador MVP; depende de perfil.
3. **Fase 3** (Voz + stats) — Mejora transacciones existentes.
4. **Fase 4** (Relaciones) — Core “finanzas compartidas”.
5. **Fase 5** (Amigos) — Social básico.

---

## 5. Checklist de tareas (para marcar)

### Fase 1 — Perfil y auth
- [ ] Prisma: Profile con username (unique), bio.
- [ ] Migración aplicada.
- [ ] GET /api/profile, PUT /api/profile, GET /api/profile/:username.
- [ ] POST /api/auth/profile (crear perfil).
- [ ] GET /api/users/search?u=.

### Fase 2 — Coach
- [ ] Prisma: CoachProfile.
- [ ] Migración aplicada.
- [ ] Repository + service coach.
- [ ] POST /api/coach/setup, GET /api/coach/profile, POST /api/coach/advice.
- [ ] utils/ai.ts + ANTHROPIC_API_KEY.

### Fase 3 — Voz y stats
- [ ] Prisma: Transaction.voiceInput.
- [ ] POST /api/transactions/voice (parsing con Claude).
- [ ] GET /api/transactions/stats.

### Fase 4 — Relaciones
- [ ] Prisma: Relation; Transaction con isShared, relationId.
- [ ] Migraciones aplicadas.
- [ ] CRUD relations + expenses bajo /relations/:id/expenses.

### Fase 5 — Amigos
- [ ] Prisma: Friendship.
- [ ] Migración aplicada.
- [ ] POST/GET/PUT/DELETE /api/friends.

---

## 6. Referencias rápidas

- **Especificación API y flujos:** `docs/TECHNICAL_SPEC.md`
- **Schema y rutas detalladas:** `docs/ARCHITECTURE.md`
- **Idea y MVP:** `docs/LUKAPP_IDEA_REFINED.md`
- **Resumen arquitectura:** `docs/ARCHITECTURE_SUMMARY.md`
- **Conexión Supabase y migraciones:** `docs/supabase-conexion-y-migraciones.md`

Con este plan puedes empezar el desarrollo backend por **Fase 1 (Perfil y auth)** y seguir en orden hasta completar el MVP de backend descrito en la documentación.
