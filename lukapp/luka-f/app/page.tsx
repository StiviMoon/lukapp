import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/navbar/Navbar";
import HeroSection from "@/components/landing/hero/HeroSection";
import FeaturesSection from "@/components/landing/features/FeaturesSection";
import PricingSection from "@/components/landing/pricing/PricingSection";
import TestimonialsSection from "@/components/landing/testimonials/TestimonialsSection";
import FaqSection from "@/components/landing/faq/FaqSection";
import WaitlistSection from "@/components/landing/waitlist/WaitlistSection";
import Footer from "@/components/landing/footer/Footer";

export const metadata: Metadata = {
  title: "lukapp — Maneja tus lukas. Control, claridad, crecimiento.",
  description:
    "Tus gastos, inversiones y tu plata en una app. Control total y crecimiento financiero — solo o con tu pareja.",
  openGraph: {
    title: "lukapp — Maneja tus lukas. Control, claridad, crecimiento.",
    description:
      "Tus gastos, inversiones y tu plata en una app. Control total y crecimiento financiero — solo o con tu pareja.",
    url: "https://www.myluka.app",
    siteName: "lukapp",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "lukapp — Maneja tus lukas con IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "lukapp — Maneja tus lukas. Control, claridad, crecimiento.",
    description:
      "Tus gastos, inversiones y tu plata en una app. Control total y crecimiento financiero — solo o con tu pareja.",
    images: ["/opengraph-image"],
  },
};

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden relative">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <WaitlistSection />
      <Footer />
    </main>
  );
}
