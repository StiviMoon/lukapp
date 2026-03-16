# Conexión a Supabase y migraciones

Si creaste un **nuevo proyecto** en Supabase (o una base de datos nueva), sigue estos pasos.

## 1. Obtener credenciales del nuevo proyecto

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard) y abre tu **nuevo** proyecto.
2. **Base de datos (Prisma / Lukapp-b):**
   - Ve a **Project Settings** (icono engranaje) → **Database**.
   - En **Connection string** elige:
     - **URI** en modo **Transaction** (puerto 6543) → para `DATABASE_URL`.
     - **URI** en modo **Session** o conexión directa (puerto 5432) → para `DIRECT_URL`.
   - Copia la contraseña si te la pide (o usa la que guardaste al crear el proyecto).
3. **API (frontend y backend):**
   - Ve a **Project Settings** → **API**.
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` (Lukapp-f) y `SUPABASE_URL` (Lukapp-b).
   - **anon public** (clave pública) → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Lukapp-f) y `SUPABASE_ANON_KEY` (Lukapp-b).

## 2. Actualizar variables de entorno

### Lukapp-b (`Lukapp-b/.env`)

```env
# Connection pooling (Transaction mode, puerto 6543)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-XX-XXXX-X.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Conexión directa para migraciones (Session, puerto 5432)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-XX-XXXX-X.pooler.supabase.com:5432/postgres"

SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```

Sustituye `[PROJECT_REF]`, `[PASSWORD]` y la región por los valores que te muestra el Dashboard.

### Lukapp-f (`Lukapp-f/.env`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Usa el mismo **Project URL** y **anon public** que en Lukapp-b.

## 3. Validar conexión

Desde la raíz del backend:

```bash
cd Lukapp-b
npm run db:validate
```

Si todo está bien verás: `✅ Conexión exitosa`.

## 4. Aplicar migraciones (crear tablas)

Con la conexión validada:

```bash
cd Lukapp-b
npm run db:migrate:deploy
```

Eso crea las tablas: `profiles`, `accounts`, `categories`, `transactions`, `budgets` (y los triggers/RLS si los tienes en SQL).

## 5. Arrancar backend y frontend

```bash
# Terminal 1 - backend
cd Lukapp-b && npm run dev

# Terminal 2 - frontend
cd Lukapp-f && npm run dev
```

---

**Error "Tenant or user not found"**  
Indica que `DATABASE_URL` / `DIRECT_URL` (o usuario/contraseña) siguen apuntando al proyecto viejo o son incorrectos. Vuelve al paso 1 y copia de nuevo las URIs y la anon key del **nuevo** proyecto.
