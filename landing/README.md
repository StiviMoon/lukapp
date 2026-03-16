# lukapp Landing Page

Landing page moderna para lukapp — fintech personal con IA coach.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v3**
- **Framer Motion** — animaciones
- **Lucide React** — iconos
- **React Hook Form + Zod** — formulario waitlist
- **Supabase** — almacenamiento waitlist

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local .env.local
# Editar .env.local con tus keys de Supabase

# 3. Crear tabla en Supabase
# Ejecuta en el SQL Editor de Supabase:

CREATE TABLE public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select own" ON public.waitlist
  FOR SELECT USING (true);

# 4. Correr en desarrollo
npm run dev

# 5. Build para producción
npm run build
npm start
```

---

## Estructura

```
src/
├── app/
│   ├── layout.tsx          # Root layout + SEO metadata
│   ├── page.tsx            # Página principal
│   ├── globals.css         # Estilos globales + Tailwind
│   └── api/
│       └── waitlist/
│           └── route.ts    # API endpoint POST /api/waitlist
├── components/
│   ├── navbar/Navbar.tsx           # Navbar flotante iOS
│   ├── hero/HeroSection.tsx        # Hero con phone mockup
│   ├── hero/PhoneMockup.tsx        # Mockup del teléfono
│   ├── features/FeaturesSection.tsx
│   ├── features/FeatureCard.tsx
│   ├── pricing/PricingSection.tsx
│   ├── testimonials/TestimonialsSection.tsx
│   ├── faq/FaqSection.tsx
│   ├── waitlist/WaitlistSection.tsx
│   ├── waitlist/WaitlistForm.tsx
│   ├── waitlist/SuccessModal.tsx
│   ├── footer/Footer.tsx
│   └── ui/
│       ├── SectionHeader.tsx
│       └── CtaSection.tsx
└── lib/
    ├── supabase.ts         # Supabase client
    ├── validations.ts      # Zod schemas
    └── utils.ts            # cn() helper
```

---

## Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--lime` | `#C8D400` | CTA primario |
| `--purple-brand` | `#6600CC` | Acento premium |
| `--purple-bright` | `#7A00F5` | Glow / gradiente |
| `--bg` | `#0A0A0A` | Fondo principal |
| `--bg-card` | `#111111` | Cards |

---

## Deploy en Vercel

```bash
# Push a GitHub y conectar en vercel.com
# Configurar variables de entorno en Vercel:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# NEXT_PUBLIC_APP_URL
```
