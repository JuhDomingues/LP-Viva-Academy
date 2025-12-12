import { InlineChat } from "@/components/chat/inline-chat";

interface FAQSectionProps {
  onCTAClick: () => void;
}

export const FAQSection = ({ onCTAClick }: FAQSectionProps) => {

  return (
    <section className="bg-black py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Chat Section */}
          <div>
            <div className="text-center mb-6">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                Ainda tem dúvidas sobre <span className="text-primary">imigração?</span>
              </h3>
              <p className="text-gray-400 text-base sm:text-lg">
                Converse com nosso consultor de IA e tire suas dúvidas em tempo real
              </p>
            </div>
            <InlineChat />
          </div>
        </div>
      </div>
    </section>
  );
};