import { Button } from "@/components/ui/button";
import logoWhite from "@/assets/Asset 1 - White.png";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoWhite}
              alt="Viva Academy Logo"
              className="h-12 sm:h-16 w-auto"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#oferta">
              <Button
                variant="default"
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 sm:px-6 py-2 text-xs sm:text-sm"
              >
                Assine Agora
              </Button>
            </a>
            <a
              href="https://acesso.vivaacademy.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-6 py-2 text-xs sm:text-sm"
              >
                Acessar
              </Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};