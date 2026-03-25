"use client";

import {
  CreditCard,
  Sparkles,
  Mic,
  Users,
  BarChart2,
  Smartphone,
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
      "Registra ingresos y egresos al instante. Categorización automática, metas de ahorro y saldo real siempre visible — sin hojas de cálculo.",
    accent: "lime" as const,
  },
  {
    icon: Sparkles,
    number: "02",
    label: "IA",
    title: "Coach que te entiende",
    description:
      "Detecta dónde se va tu plata, personaliza consejos según tu situación real y responde preguntas sobre tus finanzas en tiempo real. No es genérico.",
    accent: "purple" as const,
  },
  {
    icon: Mic,
    number: "03",
    label: "Voz",
    title: "Habla, nosotros registramos",
    description:
      '"Gasté 50k en comida" y listo. Cero fricción, máxima velocidad. El registro más rápido que hayas usado.',
    accent: "lime" as const,
  },
  {
    icon: Users,
    number: "04",
    label: "Compartido",
    title: "Finanzas en pareja",
    description:
      "Crea un espacio compartido con tu pareja o familia. Cada uno decide qué compartir — transparencia sin perder privacidad individual.",
    accent: "purple" as const,
  },
  {
    icon: BarChart2,
    number: "05",
    label: "Reportes",
    title: "Tendencias que hablan",
    description:
      "Visualiza tus patrones mes a mes. Proyecciones a 90 días, burn rate y runway financiero para saber exactamente a dónde vas.",
    accent: "lime" as const,
  },
  {
    icon: Smartphone,
    number: "06",
    label: "PWA",
    title: "App sin instalación",
    description:
      "Instala desde Chrome o Safari en segundos. Sin App Store, sin ocupar almacenamiento. Funciona offline y sincroniza sola.",
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
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
