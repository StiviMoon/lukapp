# LukappPP — Idea Refinada

**Fecha:** 15 de marzo 2026
**Estado:** MVP definido, listo para validación
**Equipo:** Steven (Dev) + Novia (Diseño/Marketing)

---

## 🎯 EL PROBLEMA

### Situación actual

- Millones de personas (14-40 años) **no saben qué pasa con su dinero**
- Usan **Excel, notas, o nada** para gestionar finanzas
- Parejas/familias a distancia **no tienen forma integrada** de ver gastos compartidos
- Apps existentes son complejas, frías, enfocadas en bancos, no en personas

### El insight

**Lukapppp no es un banco. Es un coach de finanzas que te ayuda a entender y controlar tu dinero.**

---

## 💡 LA SOLUCIÓN: LukappPP

### Visión (completa)

App de finanzas **personales + compartidas + social + IA coach** que:

- Te ayuda a registrar, analizar y optimizar tus gastos
- Funciona para parejas/familias sin perder privacidad
- Interactúa contigo como coach (no como máquina)
- Gamifica tu progreso financiero

### MVP (Lanzamiento inicial)

#### **Core Features**

1. **Gestión personal de finanzas**
  - Registrar ingresos y egresos (texto + voz)
  - Categorizar automáticamente
  - Crear presupuestos por categoría
  - Definir metas financieras
2. **Relaciones/Familias compartidas**
  - Crear una relación (pareja, familia, amigos)
  - Invitar a otros usuarios
  - **Privacidad:** Solo ves gastos compartidos, no personales
  - Ingresos personales = siempre privados
3. **IA Coach (Plan Premium)**
  - Coach con personalidad única por usuario
  - Datos guardados en BD: perfil del usuario, valores, preferencias
  - Recomendaciones personalizadas basadas en datos
  - Interacción conversacional sobre finanzas
  - Predicciones matemáticas presentadas conversacionalmente
4. **Entrada por voz**
  - Habla: "Gasté 50k en almuerzo" o "Gasté 50k en almuerzo con Sara"
  - Speech-to-text → LLM parsea + categoriza
  - Auto-detecta si es compartido
  - Opción: texto para quienes prefieran
5. **Red social (MVP básica)**
  - Ver amigos en la app
  - Enviar invitación para crear relación
  - Notar cuando alguien del grupo logra meta
  - (Gamificación completa = Fase 2)

#### **Tech Stack**

- **Frontend:** Next.js 16, React Query, Supabase Auth
- **Backend:** Express, Prisma, PostgreSQL (Supabase)
- **IA:** Claude API (LLM para coach + parsing voz)
- **Voz:** Web Speech API (transcripción nativa) + API externa si necesita

---

## 🔥 EL DIFERENCIADOR


| Feature                 | Excel | Nubank | Wallet | Lukapppp MVP |
| ----------------------- | ----- | ------ | ------ | ------------ |
| Gestión personal        | ✅     | ✅      | ✅      | ✅            |
| Finanzas compartidas    | ❌     | ❌      | ❌      | ✅            |
| Entrada por voz         | ❌     | ❌      | ❌      | ✅            |
| IA Coach conversacional | ❌     | ❌      | ❌      | ✅            |
| Privacidad clara        | N/A   | ❌      | ❌      | ✅            |
| UX mobile-first (iOS)   | ❌     | ✅      | ✅      | ✅            |
| Social/Relaciones       | ❌     | ❌      | ❌      | ✅ (básico)   |


**Por qué gana:**

1. **IA conversacional** (no solo números)
2. **Voz** (más fácil que escribir)
3. **Finanzas compartidas sin perder privacidad**
4. **Social** (especialmente para parejas a distancia)

---

## 👥 MERCADO OBJETIVO

### Primary (MVP 1.0)

- **Rango etario:** 14-40 años
- **Ocupación:** Cualquiera (estudiantes, freelancers, empleados, PyMEs)
- **Características:**
  - Usan smartphone principalmente
  - Tienen pareja o familia
  - Buscan controlar gastos
  - Están acostumbrados a apps

### Secondary (Fase 2+)

- Autónomos/freelancers (modelo B2B2C)
- Pequeños negocios (control de caja)
- Personas con hijos (presupuesto familiar complejo)

### Por qué adoptan

- **Reemplaza Excel:** gratis + mejor experiencia
- **Relaciones a distancia:** necesidad real
- **Redes sociales:** se propaga por referrals (amigos invitan amigos)
- **Bajo riesgo:** pruebas plan gratis primero

---

## 💰 MODELO DE NEGOCIO

### Plan Freemium

**Plan Gratis (Siempre gratis)**

- Gestión personal ilimitada
- Finanzas compartidas (1 relación)
- Predicciones matemáticas básicas
- Entrada por voz/texto
- Red social básica

**Plan Premium ($9.990/mes Colombia)**

- IA Coach avanzada (recomendaciones personalizadas)
- Unlimited relaciones compartidas
- Reportes avanzados
- Análisis de tendencias
- Prioridad en soporte
- **Futuro:** Exportar datos, integraciones

### Monetización adicional (Fase 2+)

- Afiliados: "Te recomendamos esta tarjeta de crédito" (comisión)
- Cursos: "Cómo invertir inteligentemente"
- B2B: PyMEs necesitan esto para equipos

---

## 🚀 VALIDACIÓN DE MERCADO

### Estrategia realista

No necesita encuesta formal si:

1. **Problema = obvio:** Todos necesitan orden financiero
2. **Solución = gratis:** Baja fricción para probar
3. **Distribución = orgánica:** Redes sociales + referrals

### Plan de validación

1. **Closed Beta:** Ustedes 2 + ~20 amigos cercanos (1-2 semanas)
  - Feedback: UX, features, usabilidad
2. **Soft Launch:** 100-200 usuarios (redes sociales personales)
  - Métrica: Qué % convierte a plan premium
  - NPS score
3. **Public Launch:** Medios + comunidades (si MVP funciona)
  - TikTok, Instagram, comunidades Discord
  - Contenido: "Cómo controlar gastos con voz"

### Métricas MVP mínimas

- **Adoption:** 50+ usuarios en mes 1
- **Engagement:** 50%+ activos semanales
- **Premium conversion:** 2-5% a plan premium
- Si estos números no se cumplen → pivotar o iterar

---

## 🎮 MVP vs FASE 2

### MVP (Semanas 1-4)

- ✅ Gestión personal + compartida
- ✅ IA Coach básica
- ✅ Voz + texto
- ✅ Privacidad clara
- ❌ Mascota (Fase 2)
- ❌ Gamificación completa (Fase 2)
- ❌ Integraciones (Fase 2)

### Fase 2 (Semanas 5-12)

- ✅ Mascota que evoluciona con hábitos
- ✅ Gamificación: badges, streaks, leaderboards
- ✅ IA más inteligente (predicciones, patrones)
- ✅ Integraciones (Stripe, transferencias)

---

## 🎯 GO-TO-MARKET (GTM)

### Mes 1-2: Closed Beta

- Invitar 20-30 personas cercanas
- Feedback directo
- Pulir UX/bugs

### Mes 2-3: Soft Launch

- Post en Instagram/TikTok de la novia (diseño + demo)
- Comunidades: r/finanzas, grupos Discord
- Boca a boca

### Mes 3+: Si traction

- Prensa: "App de finanzas para parejas a distancia"
- Colaboraciones: Influencers fintech
- Ads pagos (si números lo justifican)

### Content Marketing

- TikTok: "5 gastos que no deberías hacer" (con Lukapppp)
- Instagram: Historias de usuarios (con permiso)
- Blog: "Cómo manejar finanzas en pareja a distancia"

---

## 👥 EQUIPO


| Rol                    | Persona     | Responsabilidad                                 |
| ---------------------- | ----------- | ----------------------------------------------- |
| **Dev + CTO**          | Steven      | Backend, frontend, IA integration, architecture |
| **Design + Marketing** | Novia       | Logo, branding, UI/UX, social media, content    |
| **IA/Prompt Eng**      | Claude (IA) | Coach personality, parsing, recomendaciones     |


**Ventajas:**

- Pequeño = ágil + rápido
- Pareja = comunicación directa
- IA copiloto = velocidad x2

---

## ⏱️ TIMELINE ESTIMADO


| Fase                | Duración    | Hitos                              |
| ------------------- | ----------- | ---------------------------------- |
| **Infraestructura** | 3-4 días    | Backend listo, DB schema finalized |
| **MVP Frontend**    | 1 semana    | Pantallas principales, auth, UI    |
| **IA Integration**  | 3-4 días    | Coach personality, parsing voz     |
| **QA + Beta**       | 1 semana    | Bugs, feedback, pulir              |
| **Soft Launch**     | 1 semana    | Marketing, invites, monitoreo      |
| **Fase 2**          | 4-6 semanas | Mascota + gamificación             |


**Total MVP → Producción:** ~4-5 semanas

---

## 🤔 RIESGOS + MITIGACIÓN


| Riesgo                    | Probabilidad | Impacto | Mitigación                     |
| ------------------------- | ------------ | ------- | ------------------------------ |
| Competencia copia idea    | Media        | Bajo    | Diferenciar con UX + comunidad |
| Usuarios no adoptan       | Baja         | Alto    | Validación temprana con beta   |
| IA coach no suena natural | Media        | Medio   | Prompts refinados + iteración  |
| Regulación fintech        | Baja         | Alto    | No manejar dinero, solo datos  |


---

## ✅ RESUMEN EJECUTIVO

**Lukapppp es:**

- Una app de finanzas para personas 14-40 años
- Enfoque: personal + compartida (parejas, familias)
- Diferenciador: IA coach conversacional + voz
- Modelo: Freemium ($9.990/mes premium)
- MVP: 4-5 semanas
- Validación: Redes sociales + referrals

**Por qué funciona:**

- Problema real (control de gastos)
- Solución = gratis + fácil + social
- Equipo pequeño + rápido
- Mercado grande (millones)

**Próximo paso:**
→ Empezar MVP inmediatamente con especificación técnica refinada

---

