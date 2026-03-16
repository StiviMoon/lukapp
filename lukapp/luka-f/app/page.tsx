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
  title: "Luka — Tu plata y la de tu pareja en una app",
  description:
    "Lleva tu dinero al día, solo o con tu pareja. Sin hojas de cálculo ni estrés.",
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
