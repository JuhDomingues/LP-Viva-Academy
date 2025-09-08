import { Trophy } from "lucide-react";

export const PositioningSection = () => {
  return (
    <section className="bg-black py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left Side - Text Content */}
          <div className="text-white">
            <div className="text-sm text-gray-400 mb-4 tracking-wider">
              SUA FAMÍLIA, <br />
              SEU FUTURO
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
              <span className="text-primary">Imigração</span> <br />
              <span className="text-primary">Planejada,</span> <br />
              <span className="text-primary">Vida Estruturada</span>
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              A Viva Academy oferece o suporte completo que você precisa para transformar 
              o sonho americano em realidade. Especialistas, comunidade e ferramentas práticas 
              para cada decisão importante da sua jornada.
            </p>
            
            <p className="text-lg text-gray-300 leading-relaxed">
              Da escolha da melhor escola para seus filhos até encontrar o bairro ideal para 
              morar - tudo organizado em um processo seguro e sustentável para sua família.
            </p>
          </div>
          
          {/* Right Side - Trophies */}
          <div className="relative flex justify-center items-center">
            {/* Main Trophy */}
            <div className="relative z-10">
              <div className="w-40 h-40 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl">
                <Trophy className="w-20 h-20 text-yellow-900" />
              </div>
            </div>
            
            {/* Secondary Trophies */}
            <div className="absolute -left-12 top-8">
              <div className="w-24 h-24 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-xl opacity-80">
                <Trophy className="w-12 h-12 text-yellow-900" />
              </div>
            </div>
            
            <div className="absolute -right-8 bottom-4">
              <div className="w-28 h-28 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl opacity-90">
                <Trophy className="w-14 h-14 text-yellow-900" />
              </div>
            </div>
            
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl scale-150"></div>
          </div>
        </div>
      </div>
    </section>
  );
};