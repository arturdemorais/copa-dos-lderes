import { supabase } from "../supabaseClient";

interface Ritual {
  id: string;
  name: string;
  type: "daily" | "weekly" | "rmr";
  date: string;
}

interface RitualAttendance {
  id: string;
  ritualId: string;
  leaderId: string;
  present: boolean;
}

export const ritualService = {
  /**
   * Criar ritual (para admins)
   */
  async create(
    name: string,
    type: "daily" | "weekly" | "rmr",
    date: string
  ): Promise<Ritual> {
    const { data, error } = await supabase
      .from("rituals")
      .insert({
        name,
        type,
        date,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      date: data.date,
    };
  },

  /**
   * Buscar rituais de uma data
   */
  async getByDate(date: string): Promise<Ritual[]> {
    const { data, error } = await supabase
      .from("rituals")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      date: row.date,
    }));
  },

  /**
   * Marcar presença em ritual
   */
  async markAttendance(
    ritualId: string,
    leaderId: string,
    present: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from("ritual_attendance")
      .upsert(
        {
          ritual_id: ritualId,
          leader_id: leaderId,
          present,
        },
        {
          onConflict: "ritual_id,leader_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw error;
  },

  /**
   * Buscar presença de um líder em rituais
   */
  async getLeaderAttendance(
    leaderId: string,
    startDate?: string
  ): Promise<RitualAttendance[]> {
    let query = supabase
      .from("ritual_attendance")
      .select(
        `
        id,
        ritual_id,
        leader_id,
        present,
        rituals (
          name,
          type,
          date
        )
      `
      )
      .eq("leader_id", leaderId);

    if (startDate) {
      // Filtrar por data se fornecido
      const { data: rituals } = await supabase
        .from("rituals")
        .select("id")
        .gte("date", startDate);

      if (rituals && rituals.length > 0) {
        const ritualIds = rituals.map((r) => r.id);
        query = query.in("ritual_id", ritualIds);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      ritualId: row.ritual_id,
      leaderId: row.leader_id,
      present: row.present,
    }));
  },

  /**
   * Calcular taxa de presença em rituais
   */
  async calculateAttendanceRate(
    leaderId: string,
    days: number = 30
  ): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const { data: rituals, error: ritualsError } = await supabase
      .from("rituals")
      .select("id")
      .gte("date", startDateStr);

    if (ritualsError) throw ritualsError;

    const totalRituals = rituals?.length || 0;
    if (totalRituals === 0) return 0;

    const { data: attendance, error: attendanceError } = await supabase
      .from("ritual_attendance")
      .select("present")
      .eq("leader_id", leaderId)
      .eq("present", true)
      .in(
        "ritual_id",
        (rituals || []).map((r) => r.id)
      );

    if (attendanceError) throw attendanceError;

    const presentCount = attendance?.length || 0;
    return Math.round((presentCount / totalRituals) * 100);
  },

  /**
   * Calcular pontos de ritual baseado em presença
   */
  async calculateRitualPoints(leaderId: string): Promise<number> {
    const attendanceRate = await this.calculateAttendanceRate(leaderId, 30);

    const config = await import("./configService").then(m => m.configService.getConfig());
    const maxPoints = config.ritual_max_points;

    // Fórmula: Taxa de presença convertida em pontos
    return Math.round((attendanceRate / 100) * maxPoints);
  },
};
