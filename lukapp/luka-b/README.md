# Lukapp Backend API

Backend REST API para Lukapp - Finanzas Personales

## 📋 Descripción

API REST construida con Express.js, TypeScript, Prisma y Supabase para gestionar finanzas personales. Proporciona endpoints para cuentas, transacciones, categorías y presupuestos.

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20 o superior
- PostgreSQL (o usar Supabase)
- npm o yarn

### Instalación

1. **Clonar e instalar dependencias:**

```bash
cd Lukapp-b
npm install
```

2. **Configurar variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/Lukapp?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/Lukapp?schema=public"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# CORS
FRONTEND_URL="http://localhost:3000"
```

3. **Configurar Prisma:**

```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones (si ya tienes migraciones)
npm run db:migrate

# O aplicar el esquema directamente (desarrollo)
npm run db:push
```

4. **Iniciar servidor:**

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 📚 Estructura del Proyecto

```
Lukapp-b/
├── src/
│   ├── auth/              # Autenticación con Supabase
│   │   ├── middleware.ts  # Middleware de autenticación
│   │   └── supabase.ts    # Cliente Supabase
│   ├── db/                # Cliente Prisma
│   │   ├── client.ts      # Cliente singleton
│   │   └── utils.ts       # Utilidades de DB
│   ├── errors/            # Manejo de errores
│   │   ├── app-error.ts   # Clases de errores
│   │   └── error-handler.ts # Utilidades
│   ├── middleware/        # Middleware Express
│   │   ├── error-handler.ts # Manejo de errores
│   │   └── validation.ts  # Validación con Zod
│   ├── repositories/      # Capa de repositorios
│   │   ├── account.repository.ts
│   │   ├── transaction.repository.ts
│   │   ├── category.repository.ts
│   │   ├── budget.repository.ts
│   │   └── profile.repository.ts
│   ├── routes/            # Rutas REST API
│   │   ├── accounts.routes.ts
│   │   ├── transactions.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── budgets.routes.ts
│   │   └── index.ts
│   ├── services/          # Lógica de negocio
│   │   ├── account.service.ts
│   │   ├── transaction.service.ts
│   │   ├── category.service.ts
│   │   └── budget.service.ts
│   ├── validations/       # Esquemas Zod
│   │   ├── account.schema.ts
│   │   ├── transaction.schema.ts
│   │   ├── category.schema.ts
│   │   ├── budget.schema.ts
│   │   └── index.ts
│   └── index.ts           # Punto de entrada
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── migrations/        # Migraciones
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Autenticación

Todas las rutas requieren autenticación mediante token Bearer en el header `Authorization`:

```
Authorization: Bearer <token>
```

El token debe obtenerse desde Supabase Auth.

### Endpoints Disponibles

#### Cuentas (`/api/accounts`)

- `GET /api/accounts` - Obtiene todas las cuentas del usuario
- `GET /api/accounts/:id` - Obtiene una cuenta por ID
- `POST /api/accounts` - Crea una nueva cuenta
- `PUT /api/accounts/:id` - Actualiza una cuenta
- `DELETE /api/accounts/:id` - Elimina una cuenta
- `GET /api/accounts/balance/total` - Obtiene el balance total

#### Transacciones (`/api/transactions`)

- `GET /api/transactions` - Obtiene todas las transacciones (con filtros)
- `GET /api/transactions/:id` - Obtiene una transacción por ID
- `POST /api/transactions` - Crea una nueva transacción
- `PUT /api/transactions/:id` - Actualiza una transacción
- `DELETE /api/transactions/:id` - Elimina una transacción
- `GET /api/transactions/stats` - Obtiene estadísticas de transacciones

#### Categorías (`/api/categories`)

- `GET /api/categories` - Obtiene todas las categorías
- `GET /api/categories/:id` - Obtiene una categoría por ID
- `POST /api/categories` - Crea una nueva categoría
- `PUT /api/categories/:id` - Actualiza una categoría
- `DELETE /api/categories/:id` - Elimina una categoría

#### Presupuestos (`/api/budgets`)

- `GET /api/budgets` - Obtiene todos los presupuestos
- `GET /api/budgets/:id` - Obtiene un presupuesto por ID
- `POST /api/budgets` - Crea un nuevo presupuesto
- `PUT /api/budgets/:id` - Actualiza un presupuesto
- `DELETE /api/budgets/:id` - Elimina un presupuesto
- `GET /api/budgets/status` - Obtiene el estado de los presupuestos activos

#### Salud

- `GET /api/health` - Verifica el estado de la API

## 📖 Ejemplos de Uso

### Ejemplo con cURL

```bash
# Obtener todas las cuentas
curl -X GET http://localhost:3001/api/accounts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Crear una cuenta
curl -X POST http://localhost:3001/api/accounts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cuenta Corriente",
    "type": "CHECKING",
    "balance": 1000
  }'

# Crear una transacción
curl -X POST http://localhost:3001/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "account-uuid",
    "type": "EXPENSE",
    "amount": 50.99,
    "description": "Compra en supermercado"
  }'
```

### Ejemplo con JavaScript/TypeScript

```typescript
const API_URL = "http://localhost:3001/api";

// Obtener token de Supabase
const token = await supabase.auth.getSession().then(({ data }) => data.session?.access_token);

// Obtener todas las cuentas
const accounts = await fetch(`${API_URL}/accounts`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
}).then((res) => res.json());

// Crear una cuenta
const newAccount = await fetch(`${API_URL}/accounts`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Cuenta Corriente",
    type: "CHECKING",
    balance: 1000,
  }),
}).then((res) => res.json());
```

## 🏗️ Arquitectura

El backend sigue los principios de Clean Architecture:

- **Routes** → Punto de entrada (validación de entrada, autenticación)
- **Services** → Lógica de negocio
- **Repositories** → Acceso a datos (Prisma)
- **Validations** → Esquemas Zod compartidos

### Flujo de Datos

```
Request → Routes → Validation → Authentication → Services → Repositories → Prisma → Database
                                                                                      ↓
Response ← Routes ← Error Handler ← Services ← Repositories ← Prisma ← Database
```

## 🔐 Seguridad

- Autenticación con Supabase Auth (Bearer tokens)
- Validación de entrada con Zod
- Validación de ownership (cada usuario solo accede a sus datos)
- Row Level Security (RLS) en Supabase
- CORS configurado para el frontend

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor en modo desarrollo
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia servidor en modo producción
- `npm run db:generate` - Genera cliente Prisma
- `npm run db:push` - Aplica esquema a la base de datos
- `npm run db:migrate` - Ejecuta migraciones
- `npm run db:studio` - Abre Prisma Studio
- `npm run lint` - Ejecuta linter
- `npm run typecheck` - Verifica tipos TypeScript

## 🚀 Despliegue

1. Configurar variables de entorno en producción
2. Compilar: `npm run build`
3. Iniciar: `npm start`

## 📚 Recursos

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Supabase](https://supabase.com/)
- [Zod](https://zod.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## 📄 Licencia

ISC

