import { supabase } from "../supabaseClient";
import type { Activity } from "../types";

export const activityService = {
  /**
   * Buscar todas as atividades (feed)
   */
  async getAll(limit: number = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(this.mapToActivity);
  },

  /**
   * Buscar atividades de um líder
   */
  async getByLeader(leaderId: string, limit: number = 20): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("leader_id", leaderId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(this.mapToActivity);
  },

  /**
   * Criar nova atividade
   */
  async create(activity: Omit<Activity, "id">): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .insert({
        type: activity.type,
        leader_id: activity.leaderId,
        leader_name: activity.leaderName,
        description: activity.description,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToActivity(data);
  },

  /**
   * Mapear row do banco para Activity
   */
  mapToActivity(row: any): Activity {
    return {
      id: row.id,
      type: row.type,
      leaderId: row.leader_id,
      leaderName: row.leader_name,
      description: row.description,
      timestamp: row.created_at,
    };
  },

  /**
   * Subscribe to real-time changes
   */
  subscribeToChanges(callback: (activities: Activity[]) => void) {
    const channel = supabase
      .channel("activities-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
        },
        async () => {
          const activities = await this.getAll();
          callback(activities);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
