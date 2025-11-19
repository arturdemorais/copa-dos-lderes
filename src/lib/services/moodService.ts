import { supabase } from "../supabaseClient";

export type MoodType =
  | "happy"
  | "sad"
  | "neutral"
  | "excited"
  | "tired"
  | "stressed";
export type ContextType = "work" | "personal" | "team" | "project";

export interface MoodLog {
  id: string;
  leaderId: string;
  mood: MoodType;
  comment?: string;
  context?: ContextType;
  isPublic: boolean;
  date: string;
  createdAt: string;
}

export const moodService = {
  /**
   * Criar log de sentimento
   */
  async create(
    leaderId: string,
    mood: MoodType,
    comment?: string,
    context?: ContextType,
    isPublic: boolean = false
  ): Promise<MoodLog> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("mood_logs")
      .insert({
        leader_id: leaderId,
        mood,
        comment,
        context,
        is_public: isPublic,
        date: today,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      leaderId: data.leader_id,
      mood: data.mood,
      comment: data.comment,
      context: data.context,
      isPublic: data.is_public,
      date: data.date,
      createdAt: data.created_at,
    };
  },

  /**
   * Buscar log de hoje
   */
  async getTodayLog(leaderId: string): Promise<MoodLog | null> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("leader_id", leaderId)
      .eq("date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      leaderId: data.leader_id,
      mood: data.mood,
      comment: data.comment,
      context: data.context,
      isPublic: data.is_public,
      date: data.date,
      createdAt: data.created_at,
    };
  },

  /**
   * Buscar histórico pessoal
   */
  async getHistory(leaderId: string, days: number = 30): Promise<MoodLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("leader_id", leaderId)
      .gte("date", startDateStr)
      .order("date", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      leaderId: row.leader_id,
      mood: row.mood,
      comment: row.comment,
      context: row.context,
      isPublic: row.is_public,
      date: row.date,
      createdAt: row.created_at,
    }));
  },

  /**
   * Buscar logs públicos (feed)
   */
  async getPublicLogs(limit: number = 20): Promise<MoodLog[]> {
    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      leaderId: row.leader_id,
      mood: row.mood,
      comment: row.comment,
      context: row.context,
      isPublic: row.is_public,
      date: row.date,
      createdAt: row.created_at,
    }));
  },

  /**
   * Calcular mood predominante
   */
  async getDominantMood(
    leaderId: string,
    days: number = 30
  ): Promise<MoodType | null> {
    const history = await this.getHistory(leaderId, days);
    if (history.length === 0) return null;

    const moodCounts: Record<MoodType, number> = {
      happy: 0,
      sad: 0,
      neutral: 0,
      excited: 0,
      tired: 0,
      stressed: 0,
    };

    history.forEach((log) => {
      moodCounts[log.mood]++;
    });

    const dominant = Object.entries(moodCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as MoodType;

    return dominant;
  },
};
