import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQSectionProps {
  onCTAClick: () => void;
}

export const FAQSection = ({ onCTAClick }: FAQSectionProps) => {

  return (
    <section className="bg-black py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-8 sm:p-12">
            <MessageCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Ainda tem dúvidas sobre <span className="text-primary">imigração?</span>
            </h3>
            <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              Use nosso chat inteligente no canto da tela para tirar suas dúvidas em tempo real com nosso consultor de IA, disponível 24/7
            </p>
            <Button
              onClick={onCTAClick}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 text-lg"
            >
              Quero Garantir Minha Vaga
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};