import { supabase } from "../supabaseClient";

export interface EnergyCheckIn {
  id: string;
  leaderId: string;
  energyLevel: number;
  note?: string;
  date: string;
  createdAt: string;
}

export const energyService = {
  /**
   * Criar check-in de energia
   */
  async create(
    leaderId: string,
    energyLevel: number,
    note?: string
  ): Promise<EnergyCheckIn> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("energy_check_ins")
      .upsert(
        {
          leader_id: leaderId,
          energy_level: energyLevel,
          note,
          date: today,
        },
        {
          onConflict: "leader_id,date",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      leaderId: data.leader_id,
      energyLevel: data.energy_level,
      note: data.note,
      date: data.date,
      createdAt: data.created_at,
    };
  },

  /**
   * Buscar check-in de hoje
   */
  async getTodayCheckIn(leaderId: string): Promise<EnergyCheckIn | null> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("energy_check_ins")
      .select("*")
      .eq("leader_id", leaderId)
      .eq("date", today)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      leaderId: data.leader_id,
      energyLevel: data.energy_level,
      note: data.note,
      date: data.date,
      createdAt: data.created_at,
    };
  },

  /**
   * Buscar histórico (últimos N dias)
   */
  async getHistory(
    leaderId: string,
    days: number = 7
  ): Promise<EnergyCheckIn[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("energy_check_ins")
      .select("*")
      .eq("leader_id", leaderId)
      .gte("date", startDateStr)
      .order("date", { ascending: true });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      leaderId: row.leader_id,
      energyLevel: row.energy_level,
      note: row.note,
      date: row.date,
      createdAt: row.created_at,
    }));
  },

  /**
   * Calcular média de energia
   */
  async getAverageEnergy(leaderId: string, days: number = 7): Promise<number> {
    const history = await this.getHistory(leaderId, days);
    if (history.length === 0) return 0;

    const sum = history.reduce((acc, curr) => acc + curr.energyLevel, 0);
    return Math.round((sum / history.length) * 10) / 10;
  },

  /**
   * Calcular streak (dias consecutivos)
   */
  async getStreak(leaderId: string): Promise<number> {
    const { data, error } = await supabase
      .from("energy_check_ins")
      .select("date")
      .eq("leader_id", leaderId)
      .order("date", { ascending: false })
      .limit(30);

    if (error) throw error;
    if (!data || data.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const checkInDate = new Date(data[i].date);
      checkInDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (checkInDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
};
