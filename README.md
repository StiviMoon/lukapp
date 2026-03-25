# Lukapp — Finanzas personales con IA

> Tus lukas. Tu control.

PWA de finanzas personales para Colombia y LatAm. Registra gastos por voz, analiza tus finanzas con un coach de IA y gestiona el dinero en pareja — desde el celular, sin complicaciones.

---

## ¿Qué es Lukapp?

Lukapp es una app de finanzas personales diseñada para el contexto latinoamericano. No es una app más de presupuestos: tiene un **coach financiero con IA** que te habla como un parcero, registro de gastos **por voz** para cuando estás en la calle, y un espacio compartido para manejar las finanzas **en pareja o familia**.

**Disponible en:** [myluka.app](https://www.myluka.app)

---

## Features

### Plan Gratuito (siempre gratis)
- Cuentas y transacciones ilimitadas
- Registro rápido por voz
- Categorías y presupuestos
- 1 espacio compartido (pareja / familia)
- Insight diario del Coach IA
- Analítica del mes actual

### Plan Premium
- Chat ilimitado con el Coach IA Luka
- Espacios compartidos ilimitados
- Tendencias y proyecciones a 90 días
- Burn rate y runway financiero
- Alertas financieras inteligentes
- Acceso anticipado a nuevas features

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 · TypeScript · Tailwind CSS 4 · shadcn/ui |
| Backend | Express · TypeScript · Prisma ORM |
| Base de datos | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| IA | Anthropic Claude API · Groq (voz) |
| Pagos | Wompi (Colombia) |
| Notificaciones | Web Push (VAPID) |
| Deploy | Vercel (frontend) · Render (backend) |

---

## Estructura del repositorio

```
lukapp/
├── luka-f/          # Frontend — Next.js PWA
│   ├── app/         # App Router (páginas)
│   ├── components/  # Componentes UI
│   └── lib/         # Hooks, API client, utils
│
└── luka-b/          # Backend — Express API
    ├── src/
    │   ├── routes/      # Endpoints REST
    │   ├── services/    # Lógica de negocio
    │   ├── repositories/# Acceso a datos (Prisma)
    │   └── middleware/  # Auth, validación, errores
    └── prisma/          # Schema y migraciones
```

---

## Desarrollo local

### Requisitos
- Node.js 20+
- Cuenta en Supabase
- API keys: Anthropic, Groq, Wompi (sandbox)

### Backend

```bash
cd lukapp/luka-b
npm install
cp .env.example .env   # Llenar variables
npx prisma migrate dev
npm run dev            # http://localhost:3001
```

### Frontend

```bash
cd lukapp/luka-f
npm install
cp .env.local.example .env.local   # Llenar variables
npm run dev                         # http://localhost:3000
```

---

## Variables de entorno

### Backend (`.env`)

```env
DATABASE_URL=          # Supabase — Transaction pooler (6543)
DIRECT_URL=            # Supabase — Direct (5432)
SUPABASE_URL=
SUPABASE_ANON_KEY=
GROQ_API_KEY=          # Transcripción de voz
ANTHROPIC_API_KEY=     # Coach IA
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_INTEGRITY_KEY=
WOMPI_EVENTS_SECRET=
WOMPI_REDIRECT_URL=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Arquitectura

```
Request → Route → Middleware (auth + validación Zod)
                      ↓
                  Service (lógica de negocio)
                      ↓
               Repository (Prisma queries)
                      ↓
                  PostgreSQL
```

Todos los endpoints protegidos requieren token Bearer de Supabase Auth. Respuestas con forma `{ success, data?, error? }`.

---

## Pagos

Integración con **Wompi** (pasarela colombiana) mediante checkout redirect + webhook:

1. Frontend solicita URL de checkout al backend
2. Usuario paga en Wompi
3. Wompi notifica al backend vía webhook (validado con SHA256)
4. Backend activa plan PREMIUM en el perfil del usuario

---

## Licencia

Código propiedad de Steven — todos los derechos reservados.
