import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { trackPixelEvent, FacebookPixelEvents } from "@/lib/facebook-pixel";

interface PricingSectionProps {
  onCTAClick: () => void;
}

export const PricingSection = ({ onCTAClick }: PricingSectionProps) => {
  return (
    <section id="oferta" className="py-16 sm:py-24 bg-black">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Clean Pricing Card */}
          <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl p-6 sm:p-12 shadow-lg relative max-w-3xl mx-auto">
            {/* Limited Badge */}
            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm">
                OFERTA LIMITADA
              </div>
            </div>

            {/* Coming Soon Announcement */}
            <div className="text-center mb-8 sm:mb-12 mt-4">
              <div className="py-8 sm:py-12">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4">
                  Aguarde dia 09/02
                </h3>
                <p className="text-xl sm:text-2xl text-white font-semibold mb-3">
                  Oferta Especial 2026
                </p>
                <p className="text-base sm:text-lg text-gray-300 mb-6">
                  Por tempo limitado
                </p>
                <Button
                  onClick={() => {
                    window.open('https://chat.whatsapp.com/Bn98MhxKpGt9zb5g4XZ821', '_blank');
                  }}
                  className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all"
                >
                  Entre para o grupo VIP
                </Button>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8 sm:mb-12">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-white">
                O que está incluído:
              </h3>

              <div className="space-y-3 sm:space-y-4 text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-300">Plataforma com trilhas completas sobre imigração, moradia, escolas e adaptação</span>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-300">Lives mensais com especialistas em cada área da vida nos EUA</span>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-300">Comunidade exclusiva para trocar experiências reais</span>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-300">Descontos em serviços de visto, consultorias e parceiros oficiais</span>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-300">Apoio completo para um processo organizado e seguro</span>
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="text-center">
              <p className="text-gray-300 text-sm sm:text-base">
                Fique atento às novidades que estão por vir
              </p>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">Mais de 5.000 famílias já realizaram o sonho americano</p>
            <div className="flex items-center justify-center gap-1">
              <div className="flex text-yellow-400 text-sm sm:text-base">
                ★★★★★
              </div>
              <span className="ml-2 text-sm sm:text-base text-gray-300 font-medium">4.9/5 (2.847 avaliações)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};