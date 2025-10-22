import { Button } from "@/components/ui/button";
import { VolumeX, Volume2 } from "lucide-react";
import { useState, useRef } from "react";
import { trackPixelEvent, FacebookPixelEvents } from "@/lib/facebook-pixel";

interface HeroSectionProps {
  onCTAClick: () => void;
}

export const HeroSection = ({ onCTAClick }: HeroSectionProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleMute = () => {
    if (iframeRef.current && isMuted) {
      const iframe = iframeRef.current;
      
      // Restart video with sound on
      iframe.src = "https://www.youtube.com/embed/t68Rw8nl-A0?start=0&autoplay=1&mute=0&controls=0&rel=0&modestbranding=1&loop=1&playlist=t68Rw8nl-A0";
      
      setIsMuted(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-black flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
           style={{ backgroundImage: 'url(/Cidade.jpeg)' }}></div>
      
      {/* Professional overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50"></div>
      
      {/* Content Grid */}
      <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Text Content */}
        <div className="text-white">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
            Sua família pronta para viver nos EUA com{" "}
            <span className="text-primary">segurança e qualidade</span>
          </h1>
          
          <p className="text-lg lg:text-xl mb-8 text-gray-300 leading-relaxed max-w-lg font-medium">
            Da escolha da melhor escola e moradia até o passo a passo da imigração: 
            a <strong className="text-white">Viva Academy</strong> é a sua bússola para transformar o sonho americano em um 
            projeto real e estruturado de vida.
          </p>
          
          <Button
            onClick={() => {
              // Track Facebook Pixel event
              trackPixelEvent(FacebookPixelEvents.LEAD, {
                content_name: 'Hero CTA Click',
                source: 'hero_section'
              });

              const ofertaSection = document.getElementById('oferta');
              if (ofertaSection) {
                ofertaSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-primary hover:bg-primary/90 text-white font-semibold text-lg px-10 py-4 rounded-lg shadow-lg transition-all"
          >
            Garantir Vaga com 50% OFF
          </Button>

          {/* Trust Badges */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <span className="text-green-500 text-lg">✓</span>
                Mais de 5.000 famílias
              </span>
              <span className="flex items-center gap-2">
                <span className="text-green-500 text-lg">✓</span>
                Garantia de 30 dias
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400 text-sm">
                ★★★★★
              </div>
              <span className="text-gray-300 text-sm font-medium">4.9/5 (2.847 avaliações)</span>
            </div>
          </div>
        </div>
        
        {/* Right Side - Professional Video */}
        <div className="relative mt-12 lg:mt-0">
          <div className="relative">
            {/* YouTube Video Embed */}
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-700 max-w-lg mx-auto relative group">
              <div className="relative w-full aspect-video">
                <iframe
                  ref={iframeRef}
                  src="https://www.youtube.com/embed/t68Rw8nl-A0?start=0&autoplay=1&mute=1&controls=1&rel=0&modestbranding=1"
                  title="Viva Academy - Como imigrar para os EUA"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0 rounded-xl"
                />
                
                {/* Audio Control Button - Only show when muted */}
                {isMuted && (
                  <button
                    onClick={toggleMute}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                             bg-primary hover:bg-primary/90 text-white p-3 rounded-full 
                             transition-all duration-300 shadow-lg z-20"
                    aria-label="Ativar áudio"
                  >
                    <VolumeX className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Video description */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm font-medium">
                Descubra como transformar seu sonho americano em realidade
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};