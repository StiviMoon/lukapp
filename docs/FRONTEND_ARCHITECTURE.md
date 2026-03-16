# Arquitectura del Frontend - Lukapp

## 📋 Descripción

Frontend limpio y enfocado en la UI que se comunica exclusivamente con el backend API vía HTTP.

## 🏗️ Estructura

```
Lukapp-f/
├── app/                    # Next.js App Router
│   ├── auth/              # Página de autenticación
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── auth/             # Componentes de autenticación
│   ├── providers/        # Providers (React Query, Theme)
│   └── ui/               # Componentes UI (Shadcn)
├── lib/
│   ├── api/              # Cliente HTTP para backend
│   │   ├── client.ts     # Cliente API con autenticación
│   │   └── index.ts      # Exportaciones
│   ├── hooks/            # Hooks personalizados
│   │   ├── use-auth.ts   # Hook para autenticación (Supabase)
│   │   └── use-api-query.ts # Hooks para React Query + API
│   └── supabase/         # Cliente Supabase (solo para auth)
│       ├── client.ts     # Cliente para componentes cliente
│       └── server.ts     # Cliente para Server Components
└── middleware.ts         # Middleware de autenticación Next.js
```

## 🔐 Autenticación

El frontend usa **Supabase Auth** solo para:
- Login/Signup
- Obtener el token de acceso
- Manejar sesiones del usuario

El token se envía al backend en cada petición HTTP.

## 🌐 Comunicación con el Backend

### Cliente API

El cliente API (`lib/api/client.ts`) maneja:
- Peticiones HTTP al backend
- Autenticación automática (agrega Bearer token)
- Manejo de errores
- TypeScript types

### Uso del Cliente API

```typescript
import { api } from "@/lib/api";

// Obtener todas las cuentas
const response = await api.accounts.getAll();

if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}

// Crear una cuenta
const response = await api.accounts.create({
  name: "Cuenta Corriente",
  type: "CHECKING",
  balance: 1000,
});
```

### Hooks con React Query

```typescript
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api";

// Query para obtener cuentas
const { data: accounts, isLoading } = useApiQuery({
  queryKey: ["accounts"],
  endpoint: "/accounts",
});

// Mutation para crear cuenta
const createAccount = useApiMutation({
  mutationFn: (data) => api.accounts.create(data),
  successMessage: "Cuenta creada exitosamente",
  invalidateQueries: [["accounts"]],
});
```

## 📦 Responsabilidades

### ✅ Frontend (`Lukapp-f`)
- UI/UX (componentes React)
- Autenticación con Supabase (solo para obtener token)
- Peticiones HTTP al backend
- Gestión de estado del cliente (React Query)
- Validación de formularios (Zod + React Hook Form)

### ✅ Backend (`Lukapp-b`)
- Lógica de negocio
- Validación de datos
- Acceso a base de datos (Prisma)
- Autenticación y autorización
- Comunicación con Supabase (Auth + Database)

## 🔄 Flujo de Datos

```
Usuario → Componente React
    ↓
Hook (useApiQuery/useApiMutation)
    ↓
Cliente API (lib/api/client.ts)
    ↓
Fetch HTTP + Bearer Token
    ↓
Backend API (Lukapp-b)
    ↓
Servicio → Repositorio → Prisma → Database
    ↓
Response JSON
    ↓
Cliente API → Hook → Componente
```

## 🚀 Ejemplos de Uso

### Ejemplo 1: Lista de Cuentas

```typescript
"use client";

import { useApiQuery } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api";

export const AccountsList = () => {
  const { data: accounts, isLoading, error } = useApiQuery({
    queryKey: ["accounts"],
    endpoint: "/accounts",
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {accounts?.map((account) => (
        <div key={account.id}>{account.name}</div>
      ))}
    </div>
  );
};
```

### Ejemplo 2: Crear Transacción

```typescript
"use client";

import { useApiMutation } from "@/lib/hooks/use-api-query";
import { api } from "@/lib/api";

export const CreateTransactionForm = () => {
  const createTransaction = useApiMutation({
    mutationFn: (data) => api.transactions.create(data),
    successMessage: "Transacción creada exitosamente",
    invalidateQueries: [["transactions"], ["accounts"]],
  });

  const handleSubmit = (data: any) => {
    createTransaction.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Ejemplo 3: Usar el Cliente API Directamente

```typescript
"use client";

import { api } from "@/lib/api";

const handleCreateAccount = async () => {
  const response = await api.accounts.create({
    name: "Cuenta Corriente",
    type: "CHECKING",
    balance: 1000,
  });

  if (response.success) {
    console.log("Cuenta creada:", response.data);
  } else {
    console.error("Error:", response.error);
  }
};
```

## 🔧 Configuración

### Variables de Entorno

```env
# Supabase (solo para autenticación)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📚 Ventajas de Esta Arquitectura

1. **Separación de responsabilidades**: Frontend solo maneja UI, backend maneja lógica
2. **Escalabilidad**: Fácil escalar frontend y backend independientemente
3. **Mantenibilidad**: Código más limpio y organizado
4. **Testabilidad**: Más fácil testear cada capa por separado
5. **Flexibilidad**: Puedes cambiar el backend sin afectar el frontend

## 🎯 Próximos Pasos

1. ✅ Cliente API creado
2. ✅ Hooks con React Query implementados
3. ⏭️ Integrar componentes existentes con el nuevo cliente API
4. ⏭️ Agregar manejo de errores global
5. ⏭️ Implementar refresh automático de tokens

