# Despliegue en Vercel — myluka.app (un dominio, una app)

## Cómo queda el dominio

- **Landing (pública):** [https://myluka.app/](https://myluka.app/)
- **App (login, dashboard, etc.):**
  - [https://myluka.app/login](https://myluka.app/login) — Iniciar sesión / registro
  - [https://myluka.app/dashboard](https://myluka.app/dashboard) — Inicio de la app
  - [https://myluka.app/profile](https://myluka.app/profile) — Perfil
  - Otras rutas bajo el mismo dominio (`/app`, etc.)

Todo vive en **un solo dominio** y **un solo proyecto** en Vercel.

## Un solo proyecto en Vercel

1. **Repositorio:** `StiviMoon/lukapp`
2. **Root Directory:** `lukapp/luka-f`
3. **Framework:** Next.js (auto-detectado)
4. **Build:** `npm run build`
5. **Dominio:** `myluka.app` (en Vercel: Settings → Domains → añadir `myluka.app`)

En **Hostinger** (o donde tengas el DNS de myluka.app), apunta el dominio a Vercel según lo que indique Vercel (registros A/CNAME).

## Rutas en la app

| Ruta           | Contenido        | ¿Protegida? |
|----------------|------------------|-------------|
| `/`            | Landing pública  | No          |
| `/login`       | Login / registro | No (redirige a `/dashboard` si ya hay sesión) |
| `/dashboard`   | Inicio de la app | Sí          |
| `/profile`     | Perfil           | Sí          |

La app usa **una sola base de dominio**; la landing y la app se diferencian por el path.

## Variables de entorno (Vercel)

En el proyecto de Vercel (`lukapp/luka-f`) configura:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Backend API** (si aplica): URL y keys que use el front
- **Landing (Formspree, etc.):** las que use la landing si están en el mismo build

## Resumen

- **Un solo proyecto** en Vercel → Root: `lukapp/luka-f`
- **Un solo dominio** → `myluka.app`
- **Landing** → `https://myluka.app/`
- **App** → `https://myluka.app/login`, `/dashboard`, `/profile`, etc.

## Landing como ruta base

La ruta `/` es la **landing completa** (hero, features, pricing, testimonials, FAQ, waitlist, CTA, footer). No hay botón de login en la landing; para probar la app se accede escribiendo la ruta directamente (p. ej. `/auth`, `/dashboard`).
