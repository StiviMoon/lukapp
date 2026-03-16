import Navbar from "@/components/navbar/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import FeaturesSection from "@/components/features/FeaturesSection";
import PricingSection from "@/components/pricing/PricingSection";
import TestimonialsSection from "@/components/testimonials/TestimonialsSection";
import FaqSection from "@/components/faq/FaqSection";
import WaitlistSection from "@/components/waitlist/WaitlistSection";
import CtaSection from "@/components/ui/CtaSection";
import Footer from "@/components/footer/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg overflow-x-hidden">
      <Navbar />
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
