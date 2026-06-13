import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import TunnelSection from "@/components/sections/TunnelSection";
import ServicesSection from "@/components/sections/ServicesSection";
import DestinationsSection from "@/components/sections/DestinationsSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import CtaSection from "@/components/sections/CtaSection";
import FaqSection from "@/components/sections/FaqSection";
import Footer from "@/components/layout/Footer";

// 1. On s'assure que le type attend bien une Promise pour params
interface Props {
  params: Promise<{ locale: string }>;
}

// 2. CORRECTION : On ne destructure plus "locale" dans les arguments
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 3. On attend la résolution de la promesse ici
  const { locale } = await params;

  return {
    title:
      locale === "fr"
        ? "VoyageElite — Agence de voyage Europe & Monde depuis l'Afrique"
        : "VoyageElite — Travel Agency Europe & Worldwide from Africa",
    description:
      locale === "fr"
        ? "Voyages organisés, tourisme sur mesure et accompagnement visa Schengen. Votre partenaire de confiance depuis Bruxelles, Belgique."
        : "Organised tours, tailor-made travel and Schengen visa assistance. Your trusted partner from Bruxelles, Belgique.",
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TunnelSection />
      <ServicesSection />
      <DestinationsSection />
      <WhyUsSection />
      <CtaSection />
      <FaqSection />
      <Footer />
    </>
  );
}
