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
import { leaderService } from "@/lib/services";
import type { User } from "@/lib/types";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Login como Admin
      if (email === "admin@copa.com" && password === "admin") {
        onLogin({
          id: "admin-1",
          name: "Administrador",
          email: "admin@copa.com",
          role: "admin",
        });
        toast.success("Bem-vindo, Administrador!");
        return;
      }

      // Login como Líder - verificar se existe no banco
      const leader = await leaderService.getByEmail(email);

      if (!leader) {
        toast.error(
          "Email não encontrado. Entre em contato com o administrador."
        );
        setLoading(false);
        return;
      }

      // Mock de validação de senha (futuramente será Supabase Auth real)
      if (!password || password.length < 3) {
        toast.error("Senha inválida");
        setLoading(false);
        return;
      }

      // Login bem-sucedido
      const user: User = {
        id: leader.id,
        name: leader.name,
        email: leader.email,
        role: "leader",
        photo: leader.photo,
      };

      onLogin(user);
      toast.success(`Bem-vindo, ${leader.name}! ⚽`);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login. Tente novamente.");
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
                {loading ? "Verificando..." : "Entrar"}
              </Button>

              <div className="text-xs text-center text-muted-foreground pt-4 space-y-2">
                <p>
                  💡 <strong>Para Admins:</strong>
                </p>
                <p>
                  Email:{" "}
                  <code className="bg-muted px-2 py-1 rounded">
                    admin@copa.com
                  </code>
                </p>
                <p>
                  Senha:{" "}
                  <code className="bg-muted px-2 py-1 rounded">admin</code>
                </p>

                <div className="pt-3 border-t mt-3">
                  <p>
                    ⚽ <strong>Para Líderes:</strong>
                  </p>
                  <p className="text-xs">Use um dos emails cadastrados:</p>
                  <div className="text-xs space-y-1 mt-2">
                    <p>• ana.silva@vorp.com</p>
                    <p>• beatriz.costa@vorp.com</p>
                    <p>• carlos.mendes@vorp.com</p>
                    <p className="text-muted-foreground">
                      (qualquer senha com 3+ caracteres)
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
