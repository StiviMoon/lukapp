"use client";

import {
  CreditCard,
  Sparkles,
  Mic,
  Users,
  Gamepad2,
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
      "Registra ingresos, egresos y metas. Tu dinero, tus reglas, sin complicaciones innecesarias.",
    accent: "lime" as const,
  },
  {
    icon: Sparkles,
    number: "02",
    label: "IA",
    title: "Coach que te entiende",
    description:
      "Análisis personalizado y recomendaciones que evolucionan con tu perfil financiero.",
    accent: "purple" as const,
  },
  {
    icon: Mic,
    number: "03",
    label: "Voz",
    title: "Habla, nosotros registramos",
    description:
      '"Gasté 50k en comida" y listo. Cero fricción, máxima velocidad en cada registro.',
    accent: "lime" as const,
  },
  {
    icon: Users,
    number: "04",
    label: "Compartido",
    title: "Finanzas compartidas",
    description:
      "Gestiona con tu pareja o familia. Transparencia total con privacidad individual.",
    accent: "purple" as const,
  },
  {
    icon: Gamepad2,
    number: "05",
    label: "Gamificación",
    title: "Mascota que evoluciona",
    description:
      "Tu compañero financiero crece contigo. Badges, streaks y progreso siempre visible.",
    accent: "lime" as const,
  },
  {
    icon: Smartphone,
    number: "06",
    label: "PWA",
    title: "App sin instalación",
    description:
      "PWA offline-first. Sin ocupar almacenamiento. Funciona en cualquier celular.",
    accent: "purple" as const,
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6"
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
