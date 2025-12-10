import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQSectionProps {
  onCTAClick: () => void;
}

export const FAQSection = ({ onCTAClick }: FAQSectionProps) => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: "A Viva Academy é para quem ainda não decidiu imigrar?",
      answer: "Sim! Nossa plataforma foi desenvolvida tanto para quem ainda está decidindo quanto para quem já tem certeza. Oferecemos informações completas para você tomar uma decisão consciente e planejar cada etapa da imigração."
    },
    {
      question: "Vocês ajudam com todos os tipos de visto?",
      answer: "Sim! Temos especialistas em diferentes tipos de visto americano: visto de trabalho, investidor, estudantil, reunião familiar e outros. Cada caso recebe orientação personalizada para o melhor caminho."
    },
    {
      question: "Como funciona o suporte para escolha de cidade e escola?",
      answer: "Oferecemos mapas detalhados, análises de custo de vida, qualidade das escolas públicas e privadas, segurança dos bairros e proximidade de comunidades brasileiras. Tudo para você fazer a escolha certa para sua família."
    },
    {
      question: "Qual é a garantia oferecida?",
      answer: "Oferecemos 30 dias de garantia incondicional. Se por qualquer motivo você não ficar satisfeita com a plataforma, devolvemos 100% do seu investimento."
    },
    {
      question: "Preciso falar inglês fluente para começar?",
      answer: "Não é obrigatório! Muitas famílias começam o processo sem falar inglês fluente. Oferecemos orientação sobre cursos de inglês e como se preparar linguisticamente para a mudança."
    }
  ];

  return (
    <section className="bg-black py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Perguntas <span className="text-primary">frequentes</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Tire todas as suas dúvidas sobre o programa
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            {faqItems.map((item, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden transition-all duration-300 hover:border-primary"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between text-white hover:bg-gray-800 transition-colors duration-300"
                >
                  <span className="font-semibold text-sm sm:text-base lg:text-lg pr-2">{item.question}</span>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  )}
                </button>

                {openItems.includes(index) && (
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-sm sm:text-base text-gray-300 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-3 sm:mb-4">
              Ainda tem dúvidas sobre imigração?
            </h3>
            <p className="text-black mb-4 sm:mb-6 text-base sm:text-lg">
              Entre em contato conosco e tire todas as suas dúvidas sobre como planejar sua vida nos EUA com segurança.
            </p>
            <Button
              onClick={() => {
                const phoneNumber = "5511913321718";
                const message = "Olá! Tenho interesse em saber mais sobre a Viva Academy e como começar meu plano de vida nos EUA.";
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="bg-black hover:bg-gray-900 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
            >
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};