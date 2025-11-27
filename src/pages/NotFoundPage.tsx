import { Button } from "@/components/ui/button";
import { House, WarningCircle } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
      <div className="bg-destructive/10 p-6 rounded-full mb-6">
        <WarningCircle size={64} className="text-destructive" weight="duotone" />
      </div>
      
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        404 - Impedimento!
      </h1>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Opa! Parece que você tentou fazer uma jogada para uma área que não existe no campo.
      </p>

      <Link to="/">
        <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <House size={20} weight="bold" />
          Voltar para o Campo
        </Button>
      </Link>
    </div>
  );
}
