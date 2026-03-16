# Lukapp Frontend - Finanzas Personales

Frontend de Lukapp construido con Next.js, React, TypeScript y TailwindCSS.

## 📋 Descripción

Frontend limpio y enfocado en la UI que se comunica exclusivamente con el backend API vía HTTP.

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20 o superior
- npm o yarn
- Backend API corriendo (ver `Lukapp-b/README.md`)

### Instalación

1. **Instalar dependencias:**

```bash
cd Lukapp-f
npm install
```

2. **Configurar variables de entorno:**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase (solo para autenticación)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. **Iniciar servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Arquitectura

El frontend está completamente separado del backend y se comunica vía HTTP.

### Estructura

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

El token se envía automáticamente al backend en cada petición HTTP.

## 🌐 Comunicación con el Backend

### Cliente API

El cliente API maneja todas las peticiones HTTP al backend:

```typescript
import { api } from "@/lib/api";

// Obtener todas las cuentas
const response = await api.accounts.getAll();

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

// Query
const { data, isLoading } = useApiQuery({
  queryKey: ["accounts"],
  endpoint: "/accounts",
});

// Mutation
const createAccount = useApiMutation({
  mutationFn: (data) => api.accounts.create(data),
  successMessage: "Cuenta creada exitosamente",
  invalidateQueries: [["accounts"]],
});
```

Ver `FRONTEND_ARCHITECTURE.md` para más ejemplos.

## 📦 Scripts

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm start` - Inicia servidor de producción
- `npm run lint` - Ejecuta linter

## 🔧 Tecnologías

- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos
- **React Query** - Gestión de estado del servidor
- **Supabase** - Autenticación
- **Zod** - Validación de esquemas
- **React Hook Form** - Manejo de formularios
- **Shadcn/ui** - Componentes UI

## 📚 Documentación

- `FRONTEND_ARCHITECTURE.md` - Arquitectura y estructura del frontend
- Ver `Lukapp-b/README.md` para documentación del backend

## 🎯 Próximos Pasos

1. Integrar componentes con el cliente API
2. Implementar páginas de dashboard
3. Agregar manejo de errores global
4. Implementar refresh automático de tokens
