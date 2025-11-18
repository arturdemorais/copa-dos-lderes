import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { User } from "@/lib/types";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock login ainda funciona para admin e demo
      if (email === "admin@copa.com" && password === "admin") {
        onLogin({
          id: "admin-1",
          name: "Administrador",
          email: "admin@copa.com",
          role: "admin",
        });
        toast.success("Login como Admin realizado!");
        return;
      }

      // Para outros emails, usar mock também (Supabase auth virá depois)
      const mockUser: User = {
        id: `user-${Date.now()}`,
        name: name || email.split("@")[0],
        email,
        role: "leader",
      };

      onLogin(mockUser);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground mb-4">
            <Trophy weight="fill" size={48} />
          </div>
          <h1 className="text-4xl font-bold mb-2">Copa dos Líderes</h1>
          <p className="text-muted-foreground">
            Transforme sua gestão em vitória
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar no Sistema</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar o campeonato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? "Carregando..."
                  : isSignUp
                  ? "Criar Conta"
                  : "Entrar"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-primary hover:underline"
                  disabled={loading}
                >
                  {isSignUp ? "Já tem conta? Entrar" : "Criar nova conta"}
                </button>
              </div>

              <div className="text-xs text-center text-muted-foreground pt-4 space-y-1">
                <p>
                  💡 Dica: Use <strong>admin@copa.com</strong> + senha{" "}
                  <strong>admin</strong>
                </p>
                <p>para acessar como Administrador</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
