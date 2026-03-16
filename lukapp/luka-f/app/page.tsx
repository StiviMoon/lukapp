import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/navbar/Navbar";
import HeroSection from "@/components/landing/hero/HeroSection";
import FeaturesSection from "@/components/landing/features/FeaturesSection";
import PricingSection from "@/components/landing/pricing/PricingSection";
import TestimonialsSection from "@/components/landing/testimonials/TestimonialsSection";
import FaqSection from "@/components/landing/faq/FaqSection";
import WaitlistSection from "@/components/landing/waitlist/WaitlistSection";
import CtaSection from "@/components/landing/ui/CtaSection";
import Footer from "@/components/landing/footer/Footer";

export const metadata: Metadata = {
  title: "lukapp — Maneja tus lukas. Control, claridad, crecimiento.",
  description:
    "Tus gastos, inversiones y tu plata en una app. Control total y crecimiento financiero — solo o con tu pareja.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <WaitlistSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
