# LukappPP Landing Page — Prompt para Claude Opus 4.6 Pro

**Objetivo:** Crear un documento detallado que sirva de prompt para que Claude Opus 4.6 Pro construya la landing page de Lukapppp.

---

## 🎯 VISIÓN GENERAL

### Propósito
Landing page moderna, atractiva, mobile-first para Lukapppp (app de finanzas personales + IA coach).
Objetivo principal: **Convertir visitantes en usuarios de lista de espera**.

### Stack Requerido
- **Next.js 15** (últimas versión)
- **TypeScript**
- **Tailwind CSS v4** (últimas versión)
- **Framer Motion** para animaciones
- **Shadcn/ui** para componentes (opcional, si aplica)
- **React Hook Form + Zod** para formulario waitlist
- **Supabase** para guardar emails (tabla: waitlist con fields: email, createdAt, referralCode)

### Dispositivos Objetivo
- Mobile first (375px-480px)
- Tablet (768px-1024px)
- Desktop (1440px+)
- Todas las secciones deben ser responsive

---

## 📐 ESTRUCTURA DE CARPETAS

```
landing/                          # Nueva app Next.js
├── app/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Página landing (main)
│   ├── globals.css              # Tailwind + CSS vars
│   ├── manifest.ts              # SEO metadata
│   └── opengraph-image.tsx      # OG image
├── components/
│   ├── hero/
│   │   └── hero-section.tsx
│   ├── features/
│   │   ├── features-section.tsx
│   │   └── feature-card.tsx
│   ├── pricing/
│   │   ├── pricing-section.tsx
│   │   └── pricing-card.tsx
│   ├── waitlist/
│   │   ├── waitlist-form.tsx
│   │   └── success-modal.tsx
│   ├── testimonials/
│   │   ├── testimonials-section.tsx
│   │   └── testimonial-card.tsx
│   ├── faq/
│   │   ├── faq-section.tsx
│   │   └── faq-item.tsx
│   ├── footer/
│   │   └── footer.tsx
│   ├── navbar/
│   │   └── navbar.tsx
│   └── ui/                      # Shadcn (si uses)
│       └── ...
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── validations.ts           # Zod schemas
│   └── utils.ts                 # Utilidades
├── public/
│   ├── images/                  # Imágenes, icons, logos
│   ├── videos/                  # Videos (opcional)
│   └── animations/              # JSON Lottie (opcional)
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 DISEÑO VISUAL

### Colores (Usar CSS Variables)
```css
:root {
  /* Brand */
  --brand-primary: #8B5CF6;      /* Purple */
  --brand-primary-dark: #6D28D9;
  --brand-primary-light: #A78BFA;

  /* Neutral */
  --text-primary: #0F172A;       /* Slate 900 */
  --text-secondary: #64748B;     /* Slate 500 */
  --bg-light: #FFFFFF;
  --bg-dark: #0F172A;
  --border: #E2E8F0;             /* Slate 200 */

  /* Accent */
  --accent-green: #10B981;       /* Green success */
  --accent-blue: #3B82F6;        /* Blue info */
  --accent-yellow: #F59E0B;      /* Yellow warning */
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #F1F5F9;
    --text-secondary: #CBD5E1;
    --bg-light: #1E293B;
    --bg-dark: #0F172A;
    --border: #334155;
  }
}
```

### Tipografía
- **Font:** Inter (default Tailwind) o Geist (Next.js)
- **Heading 1:** 48px (desktop), 32px (mobile), bold, line-height 1.2
- **Heading 2:** 36px (desktop), 24px (mobile), semibold
- **Heading 3:** 24px (desktop), 18px (mobile), semibold
- **Body:** 16px, line-height 1.6
- **Small:** 14px, line-height 1.5

### Espaciado
- Secciones: 80px (desktop), 40px (mobile) gap vertical
- Padding interior: 20px (mobile), 40px (tablet), 60px (desktop)
- Gap componentes: 16px (small), 24px (medium), 32px (large)

---

## 📄 SECCIONES DE LA LANDING

### 1. **NAVBAR** (sticky, animado)
**Altura:** 64px
**Contenido:**
- Logo izquierda (clickable → #hero)
- Links centro: "Features", "Pricing", "FAQ", "Blog" (links a #sections)
- CTA derecha: "Join Waitlist" (button, color purple)

**Animaciones Framer Motion:**
- Fade in desde arriba al scroll
- Blur background cuando scroll > 50px
- Links tienen hover con subrayado animado
- CTA button tiene hover scale + shadow

**Responsive:**
- Desktop: Logo + links + CTA
- Mobile: Logo + hamburger menu (sheet component)

---

### 2. **HERO SECTION** (full viewport height)
**Background:** Gradiente purple → transparent
- `background: linear-gradient(135deg, #8B5CF6 0%, transparent 100%)`

**Contenido:**
```
Título (H1):
"Tu Coach de Finanzas Personal"

Subtítulo:
"Entiende dónde va tu dinero. Aprende a gastar inteligente.
Controla tu futuro con IA que te entiende."

CTA Button: "Únete a la Lista de Espera" (purple, size lg)

Elemento visual:
- Mockup de app (imagen PNG + animación lottie)
- O video loop (3-5 seg) mostrando app en acción
- O SVG animado con Framer Motion

Stat Cards (3 columnas):
- "💰 +50k+ Usuarios en Espera"
- "🚀 MVP en Abril 2026"
- "🤖 IA Coach Personalizada"
```

**Animaciones:**
- Fade in + slide up (título, subtítulo, botón) al montar
- Mokup/video: parallax scroll o zoom leve
- Stat cards: stagger animation, fade in al scroll
- Botón CTA: bounce animation, hover glow effect

**Responsive:**
- Desktop: 2 columnas (texto + mockup)
- Mobile: 1 columna stacked, mockup 100% width

---

### 3. **FEATURES SECTION** (¿Por Lukapppp?)
**Background:** White (light mode) o slate-900 (dark)
**Contenido:**

6 Feature Cards en grid 3x2 (desktop), 2x3 (tablet), 1x6 (mobile):

```
Card 1: Gestión Personal
Icon: 💳 (o Lucide icon)
Title: "Finanzas 100% Tuyas"
Description: "Registra ingresos, egresos, metas y presupuestos.
             Tu dinero, tus reglas."

Card 2: Coach IA
Icon: 🤖
Title: "Coach de IA Personalizado"
Description: "Análisis inteligente de tus gastos. Recomendaciones
             que se adaptan a tu perfil y metas."

Card 3: Entrada por Voz
Icon: 🎙️
Title: "Habla, Nosotros Registramos"
Description: "Dí 'Gasté 50k en comida' y listo. Cero fricción,
             máxima velocidad."

Card 4: Parejas & Familias
Icon: 👥
Title: "Finanzas Compartidas sin Secretos"
Description: "Gestiona dinero en pareja o familia. Privacidad total,
             transparencia real."

Card 5: Gamificación (Fase 2)
Icon: 🎮
Title: "Mascota que Evoluciona"
Description: "Tu compañero financiero crece contigo. Badges, metas,
             progreso visible."

Card 6: PWA - Funciona Offline
Icon: 📱
Title: "App sin Instalación"
Description: "Funciona en cualquier celular. No ocupa almacenamiento.
             Offline first."
```

**Card Component (Framer Motion):**
- Hover: scale 1.05, shadow expand
- Tap animation (mobile)
- Fade in + stagger al scroll (cada card con delay)

**Responsive:**
- Desktop: 3 columnas
- Tablet: 2 columnas
- Mobile: 1 columna

---

### 4. **PRICING SECTION**
**Título:** "Plan Perfecto para Ti"
**Subtítulo:** "Comienza gratis. Actualiza si quieres más."

**2 Pricing Cards:**

```
PLAN GRATUITO
Price: $0/mes
Badge: "Para Siempre Gratis"

Features:
✓ Gestión personal ilimitada
✓ Entrada por voz
✓ 1 relación compartida
✓ Predicciones básicas
✗ Coach IA avanzado
✗ Unlimited relaciones
✗ Reportes personalizados

Button: "Empezar Ahora" (outlined)

---

PLAN PREMIUM
Price: $9.990/mes
Badge: "Más Popular" (highlight badge)

Features:
✓ Todo lo del plan gratis
✓ Coach IA avanzado
✓ Unlimited relaciones compartidas
✓ Reportes detallados
✓ Análisis de tendencias
✓ Prioridad en soporte
✓ Nuevas features primero

Button: "Únete a la Espera" (purple, filled)
```

**Card Styling:**
- Plan gratuito: border gris, fondo blanco
- Plan premium: border purple, fondo purple gradient (subtle), shadow destacada
- Cards con hover: expand y shadow effect

**Responsive:**
- Desktop: 2 columnas horizontales
- Tablet: 2 columnas
- Mobile: 1 columna stacked

---

### 5. **WAITLIST FORM SECTION** (CTA principal)
**Background:** Purple gradient
**Contenido:**

```
Heading: "Sé de los Primeros en Probar Lukapppp"
Subheading: "Únete a la lista de espera y recibe acceso temprano
            + bonificaciones exclusivas."

Form:
- Email input (placeholder: "tu@email.com")
  ├─ Validation: Zod (email válido, único en DB)
  └─ Error state: "Email ya existe" o "Email inválido"
- Checkbox: "Quiero recibir updates por email"
- Submit button: "Unirme a la Espera" (blanco o accent color)

Referral (bonus):
- "Trae amigos y obtén bonus: 1 mes premium gratis por cada 3 amigos"
- Share input (copy to clipboard) con código único
- Social share buttons (WhatsApp, Twitter, LinkedIn)

Post-submit Success Modal:
- ✅ Check icon animado
- "¡Bienvenido a la lista de espera!"
- "Te enviaremos updates cada 2 semanas"
- "Refiere amigos para obtener 1 mes gratis" + shareable link
- Close button
```

**Form Validations (Zod):**
```typescript
const waitlistSchema = z.object({
  email: z.string().email("Email inválido"),
  subscribe: z.boolean(),
});
```

**Animaciones:**
- Form: fade in + slide up
- Input focus: border color change + subtle glow
- Submit button: loading spinner, disabled state
- Success modal: bounce in, confetti animation (opcional)

**API Integration:**
- POST /api/waitlist
  ├─ Body: { email, referralCode? }
  ├─ Response: { success, referralCode, message }
  └─ Supabase: INSERT into waitlist table

**Responsive:**
- Desktop: 2 columnas (form left, benefit text right)
- Mobile: 1 columna, form full width

---

### 6. **TESTIMONIALS SECTION** (Social Proof)
**Título:** "Lo que Dicen Nuestros Beta Testers"

**3 Testimonial Cards (horizontal scroll en mobile):**

```
Testimonial 1:
Quote: "Gasté 8 horas registrando gastos en Excel. Con Lukapppp lo
        hago en 5 minutos. El coach me ayuda a entender por qué
        gasto tanto en comida."

Avatar: Foto (32x32px círculo)
Name: "Juan García"
Role: "Freelancer, 28"
Rating: ⭐⭐⭐⭐⭐ (5 stars)

---

Testimonial 2:
Quote: "Mi pareja y yo finalmente tenemos claridad en nuestras
        finanzas compartidas. Sin secretos, sin discusiones."

Avatar: Foto pareja (2 avatares pequeños)
Name: "María & Carlos"
Role: "Pareja, Medellín"
Rating: ⭐⭐⭐⭐⭐

---

Testimonial 3:
Quote: "La IA coach entiende mi perfil. No me da consejos genéricos.
        Es como tener un asesor financiero en el bolsillo."

Avatar: Foto
Name: "Sandra López"
Role: "Empleada + emprendedora, 35"
Rating: ⭐⭐⭐⭐⭐
```

**Card Animation:**
- Fade in al scroll
- Hover: shadow expand, scale 1.02

**Responsive:**
- Desktop: 3 columnas
- Tablet: 2 columnas
- Mobile: Horizontal scroll (carousel) or 1 per view

---

### 7. **FAQ SECTION**
**Título:** "Preguntas Frecuentes"

**5-7 FAQs (accordion):**

```
Q: ¿Cuánto cuesta Lukapppp?
A: Gratis siempre para funcionalidades básicas. Plan premium
   cuesta $9.990/mes con IA coach avanzada, unlimited relaciones,
   y reportes detallados.

Q: ¿Mis datos son seguros?
A: Sí. Usamos Supabase con encriptación end-to-end,
   Row Level Security, y cumplimos GDPR/CCPA.

Q: ¿Funciona offline?
A: Sí. Es una PWA. Registra transacciones offline y sincroniza
   cuando hay conexión.

Q: ¿Puedo usarlo con mi pareja?
A: Sí. Crea una relación, invita por username o código,
   y compartan gastos sin perder privacidad.

Q: ¿Cuándo sale?
A: MVP en abril 2026. Beta testers acceso en marzo.

Q: ¿Cómo funciona la IA?
A: Usa Claude API. Analiza tus datos, personaliza recomendaciones
   según tu perfil, y responde preguntas sobre tus finanzas.

Q: ¿Qué pasa con mis datos si cancelo?
A: Tus datos siguen siendo tuyos. Puedes descargarlos o eliminarlos
   en cualquier momento.
```

**Accordion Component:**
- Click/tap para expandir
- Smooth height animation (Framer Motion)
- Icon rotate (chevron) cuando abierto
- Solo 1 FAQ abierto al mismo tiempo (opcional)

**Responsive:**
- Desktop: Ancho completo
- Mobile: Full width con padding

---

### 8. **BLOG PREVIEW** (opcional, si hay contenido)
**Título:** "Blog de Finanzas"
**Contenido:** 3 artículos preview

```
Article 1:
Thumbnail: Imagen
Title: "5 Gastos que No Deberías Hacer"
Excerpt: "Identifica dónde se va tu dinero cada mes..."
Date: "15 Mar 2026"
Link: "/blog/5-gastos"

Article 2:
Title: "Cómo Manejar Dinero en Pareja a Distancia"
Excerpt: "Guía práctica para parejas que viven separadas..."
Date: "12 Mar 2026"

Article 3:
Title: "Inversión Inteligente: Empieza con $100"
Excerpt: "No necesitas mucho para empezar a invertir..."
Date: "10 Mar 2026"
```

**Card Animation:**
- Fade in al scroll
- Hover: image zoom, text color change

**Responsive:**
- Desktop: 3 columnas
- Mobile: 1 columna, horizontal scroll

---

### 9. **FINAL CTA SECTION**
**Background:** Purple gradient (similar a hero)
**Contenido:**

```
Heading: "¿Listo para Cambiar tu Relación con el Dinero?"
Subheading: "Únete a miles esperando el MVP. Acceso early bird gratis
            para los primeros 100."

CTA Button: "Unirme a la Lista de Espera Ahora" (white text, purple bg, lg)
Secondary: "Ver App Demo" (link, outlined)
```

**Animation:**
- Fade in al scroll
- Button: pulse animation, hover glow

---

### 10. **FOOTER**
**Contenido:**

Left column:
- Logo
- "Lukapppp © 2026"
- "Finanzas inteligentes para todos"

Middle columns:
- Product
  - Features
  - Pricing
  - Roadmap
  - Status

- Company
  - Blog
  - About
  - Contact
  - Privacy Policy
  - Terms of Service

- Social
  - Twitter
  - Instagram
  - LinkedIn
  - Email (contact@Lukapppp.co)

Bottom:
- "Made with ❤️ by Steven"
- Newsletter input (opcional)

**Responsive:**
- Desktop: 3-4 columnas
- Mobile: 1 columna stacked

---

## 🎬 ANIMACIONES CLAVE (Framer Motion)

### 1. **Page Load Animations**
```typescript
// Hero title
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
  Tu Coach de Finanzas Personal
</motion.h1>

// Stagger feature cards
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
>
  {features.map((f, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
    />
  ))}
</motion.div>
```

### 2. **Hover Animations**
```typescript
// Card hover
<motion.div
  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.2)" }}
  whileTap={{ scale: 0.98 }}
  className="card"
/>
```

### 3. **Scroll-triggered Animations**
```typescript
// useInView hook
const { ref, inView } = useInView({
  triggerOnce: true,
  threshold: 0.2,
});

<motion.div
  ref={ref}
  initial={{ opacity: 0, x: -50 }}
  animate={inView ? { opacity: 1, x: 0 } : {}}
  transition={{ duration: 0.6 }}
/>
```

### 4. **Button Animations**
```typescript
// CTA button
<motion.button
  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}
  whileTap={{ scale: 0.95 }}
  className="bg-purple-600 text-white"
>
  Únete a la Espera
</motion.button>
```

### 5. **Success Modal**
```typescript
// Confetti + bounce
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 20 }}
  className="modal"
>
  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5 }} />
  {/* Confetti animation optional */}
</motion.div>
```

---

## 📱 RESPONSIVE BREAKPOINTS

Use Tailwind breakpoints estándar:
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Ejemplo estructura:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Features cards */}
</div>
```

---

## 🔍 SEO & METADATA

### Layout Metadata
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "Lukapppp — Tu Coach de Finanzas Personal",
  description: "App de finanzas inteligente con IA personalizada. Gestiona gastos, pareja, finanzas compartidas. MVP en abril 2026.",
  keywords: ["finanzas", "IA", "app", "presupuesto", "pareja"],
  openGraph: {
    title: "Lukapppp — Tu Coach de Finanzas Personal",
    description: "Entiende dónde va tu dinero. Aprende a gastar inteligente.",
    url: "https://Lukapppp.co",
    images: [
      {
        url: "https://Lukapppp.co/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};
```

### Structured Data (JSON-LD)
```typescript
// app/opengraph-image.tsx
// Generate dynamic OG image
export default function OpengraphImage() {
  return (
    <div className="flex h-full w-full bg-gradient-to-r from-purple-600 to-purple-800">
      <h1 className="text-6xl font-bold text-white">Lukapppp</h1>
      <p className="text-2xl text-purple-100">Tu Coach de Finanzas Personal</p>
    </div>
  );
}
```

---

## 📊 TRACKING & ANALYTICS

Integrar (opcional, pero recomendado):
- **Google Analytics 4**
- **Segment** para eventos personalizados
- **Hotjar** para heatmaps

Eventos a trackear:
- Página cargada
- Scroll hasta secciones clave
- Click en CTA buttons
- Form view + submit
- Referral share clicks

---

## ✅ CHECKLIST DE COMPONENTES A CREAR

- [ ] Navbar (sticky, responsive, animated)
- [ ] Hero section (con mockup/video, stat cards)
- [ ] Features grid (6 cards, animados)
- [ ] Pricing cards (2 plans, highlight)
- [ ] Waitlist form (input, validation, success modal)
- [ ] Testimonials carousel/grid
- [ ] FAQ accordion
- [ ] Blog preview (3 artículos)
- [ ] Final CTA section
- [ ] Footer (multi-column)
- [ ] Success modal (referral info, share buttons)
- [ ] Mobile menu (hamburger sheet)

---

## 🚀 NEXT STEPS PARA CLAUDE OPUS 4.6

1. Crea la estructura Next.js 15 con `app/` router
2. Configura Tailwind CSS v4 con CSS variables para tema
3. Instala Framer Motion, React Hook Form, Zod, Supabase
4. Crea componentes en orden: Navbar → Hero → Features → ... → Footer
5. Integra Supabase para waitlist (tabla: `waitlist` con campos email, referralCode, createdAt)
6. Implementa validación con Zod en formulario
7. Agrega animaciones Framer Motion a cada sección
8. Optimiza imágenes con `next/image`
9. Deploy a Vercel (production ready)

---

## 📝 INSTRUCCIONES FINALES

Este documento describe EXACTAMENTE qué debe tener la landing page. Usa como referencia:
- Colores: CSS variables definidas
- Tipografía: Tailwind classes estándar
- Animaciones: Framer Motion patterns
- Estructura: Componentes listados con props
- Validación: Zod schemas
- API: Endpoint `/api/waitlist`
- Responsive: Tailwind breakpoints

**TON DE VOZ:** Moderno, motivador, accesible. Para personas 14-40 años que buscan control financiero.

**COLOR PSYCHOLOGY:**
- Purple: Creatividad, IA, modernidad
- Green (accent): Dinero, éxito, crecimiento
- White/Light: Claridad, confianza, simplicidad

**¡Construye una landing que convierte visitantes en usuarios de lista de espera!**
