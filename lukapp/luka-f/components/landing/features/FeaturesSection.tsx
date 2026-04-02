"use client";

import {
  CreditCard,
  Sparkles,
  Mic,
  Users,
  BarChart2,
  Smartphone,
  Target,
  Repeat,
} from "lucide-react";
import FeatureCard from "./FeatureCard";
import SectionHeader from "@/components/landing/ui/SectionHeader";

const features = [
  {
    icon: CreditCard,
    number: "01",
    label: "Control",
    title: "Finanzas 100% tuyas",
    description:
      "Registra ingresos y egresos al instante. Categorización automática y saldo real siempre visible — sin hojas de cálculo.",
    accent: "lime" as const,
  },
  {
    icon: Sparkles,
    number: "02",
    label: "IA Coach",
    title: "Luka te entiende",
    description:
      "Detecta dónde se va tu plata, proyecta tus finanzas a 90 días y responde preguntas en tiempo real. Personalizado a ti, no genérico.",
    accent: "purple" as const,
  },
  {
    icon: Mic,
    number: "03",
    label: "Voz",
    title: "Habla, Luka registra",
    description:
      '"Gasté 50k en comida" y listo. La IA extrae categoría, monto y fecha automáticamente. El registro más rápido que hayas visto.',
    accent: "lime" as const,
  },
  {
    icon: Users,
    number: "04",
    label: "Compartido",
    title: "Finanzas en pareja",
    description:
      "Crea un espacio compartido con tu pareja o familia. Cada uno decide qué compartir — transparencia sin perder privacidad.",
    accent: "purple" as const,
  },
  {
    icon: Target,
    number: "05",
    label: "Metas",
    title: "Ahorra con propósito",
    description:
      "Define metas de ahorro con fecha y monto objetivo. Seguimiento visual con progreso en tiempo real y alertas inteligentes.",
    accent: "lime" as const,
  },
  {
    icon: Repeat,
    number: "06",
    label: "Recurrentes",
    title: "Gastos automáticos",
    description:
      "Netflix, arriendo, servicios — regístralos una vez y lukapp los detecta cada mes. Sin recordar, sin duplicar.",
    accent: "purple" as const,
  },
  {
    icon: BarChart2,
    number: "07",
    label: "Reportes",
    title: "Tendencias que hablan",
    description:
      "Burn rate, runway financiero y comparativas mes a mes. Sabe exactamente a dónde va tu plata antes de que se vaya.",
    accent: "lime" as const,
  },
  {
    icon: Smartphone,
    number: "08",
    label: "PWA",
    title: "App sin App Store",
    description:
      "Instala desde Chrome o Safari en segundos. Sin ocupar almacenamiento. Funciona offline y sincroniza sola.",
    accent: "purple" as const,
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="section-stripe relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6"
      aria-labelledby="features-heading"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeader
          titleId="features-heading"
          badge="Features"
          title={
            <>
              Tu dinero y el de tu pareja,
              <br />
              <span className="text-accent">en un solo lugar</span>
            </>
          }
          subtitle="Personal y compartido. Sin hojas de cálculo, sin estrés."
        />

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          role="list"
        >
          {features.map((f, i) => (
            <div key={f.number} role="listitem" className="min-h-0">
              <FeatureCard {...f} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
