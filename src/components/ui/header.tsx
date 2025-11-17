import { Button } from "@/components/ui/button";
import logoWhite from "@/assets/Asset 1 - White.png";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoWhite}
              alt="Viva Academy Logo"
              className="h-16 w-auto"
            />
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://acesso.vivaacademy.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
              >
                Acessar Plataforma
              </Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};