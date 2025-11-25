import { supabase } from "../supabaseClient";

// =====================================================
// TYPES
// =====================================================

export type ActivityCategory =
  | "task"
  | "ritual"
  | "feedback"
  | "var"
  | "energy"
  | "mood"
  | "coins"
  | "store"
  | "evaluation"
  | "admin"
  | "auth";

export interface ActivityLog {
  id: string;
  leaderId: string | null;
  leaderName: string | null;
  actionType: string;
  actionCategory: ActivityCategory;
  description: string;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityLogFilters {
  leaderId?: string;
  category?: ActivityCategory;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface ActivityStats {
  totalActions: number;
  actionsByCategory: Record<string, number>;
  actionsByLeader: Array<{ leaderId: string; leaderName: string; count: number }>;
  recentActivity: ActivityLog[];
}

// =====================================================
// ACTIVITY LOG SERVICE
// =====================================================

export const activityLogService = {
  /**
   * Criar log manualmente (quando não há trigger automático)
   */
  async createLog(
    leaderId: string,
    actionType: string,
    actionCategory: ActivityCategory,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.rpc("create_activity_log", {
      p_leader_id: leaderId,
      p_action_type: actionType,
      p_action_category: actionCategory,
      p_description: description,
      p_metadata: metadata || null,
    });

    if (error) throw error;
  },

  /**
   * Buscar logs com filtros
   */
  async getLogs(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
    let query = supabase.from("activity_logs").select("*");

    if (filters?.leaderId) {
      query = query.eq("leader_id", filters.leaderId);
    }

    if (filters?.category) {
      query = query.eq("action_category", filters.category);
    }

    if (filters?.actionType) {
      query = query.eq("action_type", filters.actionType);
    }

    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    query = query.order("created_at", { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((row) => this.mapToActivityLog(row));
  },

  /**
   * Buscar logs de um líder específico
   */
  async getLeaderLogs(leaderId: string, limit = 50): Promise<ActivityLog[]> {
    return this.getLogs({ leaderId, limit });
  },

  /**
   * Buscar logs recentes (todas as categorias)
   */
  async getRecentLogs(limit = 100): Promise<ActivityLog[]> {
    return this.getLogs({ limit });
  },

  /**
   * Buscar logs por categoria
   */
  async getLogsByCategory(
    category: ActivityCategory,
    limit = 50
  ): Promise<ActivityLog[]> {
    return this.getLogs({ category, limit });
  },

  /**
   * Estatísticas gerais
   */
  async getStatistics(startDate?: string, endDate?: string): Promise<ActivityStats> {
    const logs = await this.getLogs({ startDate, endDate });

    // Total de ações
    const totalActions = logs.length;

    // Ações por categoria
    const actionsByCategory: Record<string, number> = {};
    logs.forEach((log) => {
      actionsByCategory[log.actionCategory] =
        (actionsByCategory[log.actionCategory] || 0) + 1;
    });

    // Ações por líder
    const leaderMap: Record<
      string,
      { leaderId: string; leaderName: string; count: number }
    > = {};
    logs.forEach((log) => {
      if (log.leaderId) {
        if (!leaderMap[log.leaderId]) {
          leaderMap[log.leaderId] = {
            leaderId: log.leaderId,
            leaderName: log.leaderName || "Desconhecido",
            count: 0,
          };
        }
        leaderMap[log.leaderId].count++;
      }
    });
    const actionsByLeader = Object.values(leaderMap).sort(
      (a, b) => b.count - a.count
    );

    // Atividades recentes
    const recentActivity = logs.slice(0, 20);

    return {
      totalActions,
      actionsByCategory,
      actionsByLeader,
      recentActivity,
    };
  },

  /**
   * Buscar timeline de atividades (agrupado por dia)
   */
  async getTimeline(
    leaderId?: string,
    days = 7
  ): Promise<Record<string, ActivityLog[]>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.getLogs({
      leaderId,
      startDate: startDate.toISOString(),
      limit: 500,
    });

    const timeline: Record<string, ActivityLog[]> = {};

    logs.forEach((log) => {
      const date = new Date(log.createdAt).toLocaleDateString("pt-BR");
      if (!timeline[date]) {
        timeline[date] = [];
      }
      timeline[date].push(log);
    });

    return timeline;
  },

  /**
   * Deletar logs antigos (manutenção)
   */
  async deleteOldLogs(olderThanDays = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { data, error } = await supabase
      .from("activity_logs")
      .delete()
      .lt("created_at", cutoffDate.toISOString())
      .select();

    if (error) throw error;

    return data?.length || 0;
  },

  /**
   * Mapear dados do banco para o tipo TypeScript
   */
  mapToActivityLog(row: any): ActivityLog {
    return {
      id: row.id,
      leaderId: row.leader_id,
      leaderName: row.leader_name,
      actionType: row.action_type,
      actionCategory: row.action_category,
      description: row.description,
      metadata: row.metadata,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    };
  },

  /**
   * Helper: traduzir categoria para português
   */
  translateCategory(category: string): string {
    const translations: Record<string, string> = {
      task: "Tarefa",
      ritual: "Ritual",
      feedback: "Feedback",
      var: "VAR",
      energy: "Energia",
      mood: "Humor",
      coins: "Vorp Coins",
      store: "Loja",
      evaluation: "Avaliação",
      admin: "Admin",
      auth: "Autenticação",
    };
    return translations[category] || category;
  },

  /**
   * Helper: ícone por categoria
   */
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      task: "⚽",
      ritual: "🏟️",
      feedback: "💬",
      var: "📹",
      energy: "⚡",
      mood: "😊",
      coins: "🪙",
      store: "🛍️",
      evaluation: "⭐",
      admin: "👑",
      auth: "🔐",
    };
    return icons[category] || "📝";
  },
};
