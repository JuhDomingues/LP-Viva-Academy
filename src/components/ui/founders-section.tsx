import { Button } from "@/components/ui/button";
import sandraImage from "@/assets/Sandra.webp";
import rafaelImage from "@/assets/Rafael.webp";
import rodrigoImage from "@/assets/Rodrigo.webp";
import wesleyImage from "@/assets/Wesley.webp";
import isabelaImage from "@/assets/Isabela.webp";

interface FoundersSectionProps {
  onCTAClick: () => void;
}

export const FoundersSection = ({ onCTAClick }: FoundersSectionProps) => {
  return (
    <section className="bg-black py-16 sm:py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
            Especialistas em Imigração à sua disposição
          </h2>
        </div>

        {/* Specialists Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto mb-12 sm:mb-16">
          {/* Sandra Arcanjo */}
          <div className="text-center">
            <div className="relative mb-2 sm:mb-4">
              <img
                src={sandraImage}
                alt="Sandra Arcanjo"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto rounded-lg object-cover"
              />
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-white mb-1">Sandra Arcanjo</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-2">Especialista em revalidação</p>
          </div>

          {/* Rafael Rezende */}
          <div className="text-center">
            <div className="relative mb-2 sm:mb-4">
              <img
                src={rafaelImage}
                alt="Rafael Rezende"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto rounded-lg object-cover"
              />
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-white mb-1">Rafael Rezende</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-2">Especialista em seguros</p>
          </div>

          {/* Dr. Rodrigo Andrade */}
          <div className="text-center">
            <div className="relative mb-2 sm:mb-4">
              <img
                src={rodrigoImage}
                alt="Dr. Rodrigo Andrade"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto rounded-lg object-cover"
              />
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-white mb-1">Dr. Rodrigo Andrade</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-2">Doutor em fisioterapia</p>
          </div>

          {/* Wesley Costa */}
          <div className="text-center">
            <div className="relative mb-2 sm:mb-4">
              <img
                src={wesleyImage}
                alt="Wesley Costa"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto rounded-lg object-cover"
              />
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-white mb-1">Wesley Costa</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-2">School Counselor</p>
          </div>

          {/* Dra. Isabela Freitas */}
          <div className="text-center">
            <div className="relative mb-2 sm:mb-4">
              <img
                src={isabelaImage}
                alt="Dra. Isabela Freitas"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto rounded-lg object-cover"
              />
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-white mb-1">Dra. Isabela Freitas</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-2">Advogada | Paralegal</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center px-4">
          <Button
            onClick={() => {
              const ofertaSection = document.getElementById('oferta');
              if (ofertaSection) {
                ofertaSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-10 lg:px-12 py-3 sm:py-4 rounded-none w-full sm:w-auto"
          >
            Quero começar meu plano de vida nos EUA
          </Button>
        </div>
      </div>
    </section>
  );
};