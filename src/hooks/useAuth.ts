import { useState, useEffect } from "react";
import { authService } from "@/lib/services";
import type { User } from "@/lib/types";

export function useAuth() {
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
        console.error("[useAuth] Error checking session:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { user: newUser } = await authService.signIn(email, password);
    console.log("[useAuth] Setting user state:", newUser);
    setUser(newUser);
    console.log("[useAuth] User state updated, should trigger re-render");
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

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
