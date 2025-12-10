import { BookOpen, Home, GraduationCap, FileText, MapPin, Users } from "lucide-react";

export const LearningSection = () => {
  const learningItems = [
    {
      icon: FileText,
      title: "Processos de Visto e Imigração"
    },
    {
      icon: GraduationCap,
      title: "Sistema Educacional Americano"
    },
    {
      icon: Home,
      title: "Mercado Imobiliário e Moradia"
    },
    {
      icon: MapPin,
      title: "Escolha de Cidades e Bairros"
    },
    {
      icon: Users,
      title: "Adaptação Cultural e Social"
    },
    {
      icon: BookOpen,
      title: "Planejamento Financeiro para Imigrar"
    }
  ];

  return (
    <section className="bg-black py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Tudo que você precisa saber para <span className="text-primary">imigrar com segurança:</span>
          </h2>
        </div>

        {/* Learning Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {learningItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 group-hover:bg-primary/20 transition-colors duration-300 rounded-full mx-auto mb-3 sm:mb-6 flex items-center justify-center border-2 border-gray-700 group-hover:border-primary">
                  <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 group-hover:text-primary transition-colors duration-300" />
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>
        
        {/* Additional Learning Points */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                <p className="text-sm sm:text-base text-gray-300">
                  <strong>Guias completos de imigração</strong> com passo a passo detalhado para cada tipo de visto
                </p>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                <p className="text-sm sm:text-base text-gray-300">
                  <strong>Mapas de bairros e escolas</strong> nas melhores cidades americanas para famílias brasileiras
                </p>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                <p className="text-sm sm:text-base text-gray-300">
                  <strong>Planilhas de custos</strong> para planejamento financeiro completo da sua mudança
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                <p className="text-sm sm:text-base text-gray-300">
                  <strong>Comunidade exclusiva</strong> de famílias brasileiras que já vivem nos EUA
                </p>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                <p className="text-sm sm:text-base text-gray-300">
                  <strong>Lives semanais com especialistas</strong> em cada área da vida americana
                </p>
              </div>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                <p className="text-sm sm:text-base text-gray-300">
                  <strong>Suporte personalizado</strong> para todas as etapas do seu processo de imigração
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};