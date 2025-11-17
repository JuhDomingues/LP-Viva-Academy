import { Header } from "@/components/ui/header";
import { HeroSection } from "@/components/ui/hero-section";
import { EntrepreneursSection } from "@/components/ui/entrepreneurs-section";
import { PositioningSection } from "@/components/ui/positioning-section";
import { FoundersSection } from "@/components/ui/founders-section";
import { LearningSection } from "@/components/ui/learning-section";
import { MethodologySection } from "@/components/ui/methodology-section";
import { PricingSection } from "@/components/ui/pricing-section";
import { FAQSection } from "@/components/ui/faq-section";
import { MediaSection } from "@/components/ui/media-section";
import { CarouselSection } from "@/components/ui/carousel-section";
import { Footer } from "@/components/ui/footer";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();

  const handleCTAClick = () => {
    toast({
      title: "Interesse confirmado!",
      description: "Em breve você receberá todas as informações para garantir sua vaga na Viva Academy.",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection onCTAClick={handleCTAClick} />
        <EntrepreneursSection />
        <PositioningSection />
        <FoundersSection onCTAClick={handleCTAClick} />
        <LearningSection />
        <CarouselSection />
        <MediaSection />
        <MethodologySection onCTAClick={handleCTAClick} />
        <PricingSection onCTAClick={handleCTAClick} />
        <FAQSection onCTAClick={handleCTAClick} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
