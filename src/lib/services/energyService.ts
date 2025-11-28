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
   * Regras de pontuação:
   * - 1 ponto base por check-in
   * - +2 pontos de bônus a cada 5 dias consecutivos (streak de 5, 10, 15, etc.)
   */
  async create(
    leaderId: string,
    energyLevel: number,
    note?: string
  ): Promise<{ checkIn: EnergyCheckIn; pointsEarned: number; bonusAwarded: boolean }> {
    const today = new Date().toISOString().split("T")[0];

    // 1. Save check-in to database
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

    // 2. Calculate streak after saving check-in
    const currentStreak = await this.getStreak(leaderId);

    // 3. Calculate points
    const basePoints = 1;
    const bonusAwarded = currentStreak > 0 && currentStreak % 5 === 0;
    const bonusPoints = bonusAwarded ? 2 : 0;
    const totalPoints = basePoints + bonusPoints;

    // 4. Add points to leader using RPC (similar to anonymousFeedbackService)
    const { error: pointsError } = await supabase.rpc("add_points_to_leader", {
      leader_id: leaderId,
      points_to_add: totalPoints,
      point_type: "ritual_points", // Energy check-ins count as ritual points
    });

    if (pointsError) {
      console.error("Error adding energy check-in points:", pointsError);
      throw pointsError;
    }

    return {
      checkIn: {
        id: data.id,
        leaderId: data.leader_id,
        energyLevel: data.energy_level,
        note: data.note,
        date: data.date,
        createdAt: data.created_at,
      },
      pointsEarned: totalPoints,
      bonusAwarded,
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
