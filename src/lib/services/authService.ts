import { supabase } from "../supabaseClient";
import { leaderService } from "./leaderService";
import type { User } from "../types";

export const authService = {
  /**
   * Login com email e senha (AUTH REAL)
   */
  async signIn(email: string, password: string) {
    console.log("[authService] signIn starting for:", email);

    // 1. Autenticar no Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[authService] Auth error:", error);
      throw error;
    }

    console.log("[authService] Auth successful, user ID:", data.user.id);

    // 2. Buscar leader associado
    try {
      console.log("[authService] Fetching leader for email:", email);
      const leader = await leaderService.getByEmail(email);

      console.log("[authService] Leader fetch result:", leader);

      if (!leader) {
        console.error(
          `[authService] Leader não encontrado para email: ${email}`
        );
        throw new Error(
          `Perfil de líder não encontrado para ${email}. Execute o SQL de criação do perfil admin.`
        );
      }

      // 3. Verificar se é admin
      const isAdmin = leader.isAdmin || false;

      const user: User = {
        id: data.user.id,
        name: leader.name,
        email: email,
        role: isAdmin ? "admin" : "leader",
        photo: leader.photo,
      };

      console.log(
        `[authService] Login bem-sucedido: ${user.name} (${user.role})`
      );
      return { user, session: data.session };
    } catch (err) {
      console.error("[authService] Error fetching leader:", err);
      // Fazer logout se der erro ao buscar leader
      await supabase.auth.signOut();
      throw err;
    }
  },

  /**
   * Criar nova conta + leader (signup)
   */
  async signUp(
    email: string,
    password: string,
    name: string,
    team: string,
    position: string,
    photo?: string,
    isAdmin?: boolean // Adicionar parâmetro opcional
  ) {
    // 1. Criar user no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          team,
          position,
          photo,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erro ao criar usuário");

    // 2. Criar leader manualmente (não depende do trigger)
    try {
      const { data: leaderData, error: leaderError } = await supabase
        .from("leaders")
        .insert({
          user_id: data.user.id,
          name,
          email,
          team,
          position,
          overall: 0,
          weekly_points: 0,
          task_points: 0,
          fan_score: 0,
          assist_points: 0,
          ritual_points: 0,
          consistency_score: 0,
          photo:
            photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          strengths: [],
          improvements: [],
          attr_communication: 50,
          attr_technique: 50,
          attr_management: 50,
          attr_pace: 50,
          attr_leadership: 50,
          attr_development: 50,
          is_admin: isAdmin || false, // Definir se é admin
        })
        .select()
        .single();

      if (leaderError) {
        // Se falhar ao criar leader, deletar o user criado
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error(`Erro ao criar perfil: ${leaderError.message}`);
      }

      return { ...data, leader: leaderService.mapToLeader(leaderData) };
    } catch (err: any) {
      // Tentar deletar o user se algo deu errado
      try {
        await supabase.auth.admin.deleteUser(data.user.id);
      } catch {}
      throw err;
    }
  },

  /**
   * Update leader photo URL
   */
  async updateLeaderPhoto(leaderId: string, photoUrl: string) {
    const { error } = await supabase
      .from("leaders")
      .update({ photo: photoUrl })
      .eq("id", leaderId);

    if (error) {
      console.error("Error updating leader photo:", error);
      throw error;
    }
  },

  /**
   * Logout
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Obter sessão atual
   */
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Obter usuário atual (vinculado ao leader)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        // AuthSessionMissingError é normal após logout
        if (authError.message?.includes("Auth session missing")) {
          return null;
        }
        throw authError;
      }

      if (!user || !user.email) {
        return null;
      }

      const leader = await leaderService.getByEmail(user.email);

      if (!leader) {
        return null;
      }

      const isAdmin = leader.isAdmin || false;

      return {
        id: user.id,
        name: leader.name,
        email: user.email,
        role: isAdmin ? "admin" : "leader",
        photo: leader.photo,
      };
    } catch (error: any) {
      // AuthSessionMissingError é normal após logout
      if (error?.message?.includes("Auth session missing")) {
        return null;
      }
      console.error("[authService] Error in getCurrentUser:", error);
      throw error;
    }
  },

  /**
   * Listener de mudanças de autenticação (REMOVIDO - causava problemas)
   * Mantido apenas para compatibilidade, mas não faz nada
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    // Retornar um subscription vazio para compatibilidade
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};
