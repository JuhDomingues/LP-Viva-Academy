import { Button } from "@/components/ui/button";

interface HeaderProps {
  onCTAClick: () => void;
}

export const Header = ({ onCTAClick }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">VIVA ACADEMY</h1>
              <p className="text-sm text-muted-foreground">Do Zero ao Green Card</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://acesso.vivaacademy.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Acessar Plataforma
            </a>

            <Button
              onClick={onCTAClick}
              variant="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};