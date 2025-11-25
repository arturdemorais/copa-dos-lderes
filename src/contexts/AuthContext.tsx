import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/lib/services";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (
    email: string,
    password: string,
    name: string,
    team: string,
    position: string,
    role?: "leader" | "admin"
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sessão apenas uma vez no mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      if (!error?.message?.includes("Auth session missing")) {
        console.error("[AuthProvider] Error checking session:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { user: newUser, session } = await authService.signIn(
      email,
      password
    );

    // IMPORTANTE: Garantir que a sessão está estabelecida no Supabase
    // Aguardar até que getSession() retorne a sessão ativa
    if (session) {
      let retries = 0;
      const maxRetries = 10;

      while (retries < maxRetries) {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (currentSession?.access_token) {
          break; // Sessão confirmada!
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }
    }

    setUser(newUser);
    return newUser;
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    team: string,
    position: string,
    role: "leader" | "admin" = "leader"
  ) => {
    await authService.signUp(
      email,
      password,
      name,
      team,
      position,
      undefined,
      role === "admin"
    );
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
