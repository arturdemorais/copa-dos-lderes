import { useState, useEffect, useRef } from "react";
import { authService } from "@/lib/services";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const processingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Verificar sessão existente
    const initAuth = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        const currentUser = await authService.getCurrentUser();
        
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error: any) {
        // Ignorar erro de sessão ausente (normal após logout)
        if (!error?.message?.includes("Auth session missing")) {
          console.error("[useAuth] Error getting current user:", error);
        }
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } finally {
        processingRef.current = false;
      }
    };

    initAuth();

    // Listener de mudanças de auth
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (currentUser) => {
      if (!mounted) return;
      
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user } = await authService.signIn(email, password);
    setUser(user);
    return user;
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

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
