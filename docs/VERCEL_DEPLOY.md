# Despliegue en Vercel (Landing + App con un solo dominio)

## Estructura del repo

- **`landing/`** → Landing pública (Next.js).
- **`lukapp/luka-f/`** → Front de la app (Next.js) con **login incluido** (rutas `/`, `/auth`, `/profile`, etc.).

## Dos proyectos en Vercel

1. **Proyecto 1 – Landing**
   - Conectar el repo: `StiviMoon/lukapp`.
   - **Root Directory:** `landing`.
   - Framework: Next.js (auto-detectado).
   - Build: `npm run build` (desde `landing/`).
   - Dominio: por ejemplo `www.tudominio.com` o `tudominio.com` (según lo que quieras para la landing).

2. **Proyecto 2 – App (front + login)**
   - Conectar el mismo repo: `StiviMoon/lukapp`.
   - **Root Directory:** `lukapp/luka-f`.
   - Framework: Next.js (auto-detectado).
   - Build: `npm run build` (desde `lukapp/luka-f/`).
   - Dominio: **tu único dominio principal**, p. ej. `app.tudominio.com` o `tudominio.com` (si quieres que la app sea la raíz).

## Un solo dominio: app + login juntos

Tu front (`luka-f`) ya incluye:
- Página principal de la app
- **Login/registro** en `/auth`
- Perfil y resto de la app

Por tanto **un solo despliegue** de `lukapp/luka-f` en Vercel sirve para “app + login”. No necesitas otro proyecto para el login.

## Cómo repartir el dominio

- **Opción A:**  
  - `www.tudominio.com` o `tudominio.com` → **Landing** (proyecto `landing/`).  
  - `app.tudominio.com` → **App + login** (proyecto `lukapp/luka-f/`).

- **Opción B (solo app en el dominio principal):**  
  - `tudominio.com` → **App + login** (`lukapp/luka-f/`).  
  - `www.tudominio.com` o `landing.tudominio.com` → **Landing** (`landing/`).

En ambos casos usas un solo dominio: repartes subdominios (o raíz vs subdominio) entre los dos proyectos de Vercel.

## Variables de entorno

- **Landing:** en el proyecto de Vercel de `landing/`, añade las que use la landing (Formspree, etc.).
- **App (luka-f):** en el proyecto de Vercel de `lukapp/luka-f/`, añade las de Supabase y API (por ejemplo `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, URL del backend, etc.).

## Resumen

| Qué quieres        | Proyecto Vercel   | Root Directory   |
|--------------------|-------------------|------------------|
| Landing            | Proyecto 1        | `landing`        |
| App + login        | Proyecto 2        | `lukapp/luka-f`  |

Un dominio: lo divides con subdominios (p. ej. `www` vs `app`) o raíz vs subdominio entre estos dos proyectos.
