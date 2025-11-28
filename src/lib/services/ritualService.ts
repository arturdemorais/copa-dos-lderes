import { supabase } from "../supabaseClient";
import type { Ritual, RitualAttendance, AttendanceStatus } from "../types";

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
   * Marcar presença em ritual com status (presente/atrasado/ausente)
   */
  async markAttendance(
    ritualId: string,
    leaderId: string,
    status: AttendanceStatus
  ): Promise<void> {
    const { error } = await supabase
      .from("ritual_attendance")
      .upsert(
        {
          ritual_id: ritualId,
          leader_id: leaderId,
          status,
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
        status,
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

    return (data || []).map((row: any) => ({
      id: row.id,
      ritualId: row.ritual_id,
      leaderId: row.leader_id,
      date: row.rituals?.date || "",
      status: row.status || "absent",
    }));
  },

  /**
   * Calcular taxa de presença em rituais (considerando atrasos como meio ponto)
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
      .select("status")
      .eq("leader_id", leaderId)
      .in(
        "ritual_id",
        (rituals || []).map((r) => r.id)
      );

    if (attendanceError) throw attendanceError;

    // Calculate weighted score: present = 1.0, late = 0.5, absent = 0
    const score = (attendance || []).reduce((total, att: any) => {
      if (att.status === "present") return total + 1.0;
      if (att.status === "late") return total + 0.5;
      return total; // absent = 0
    }, 0);

    return Math.round((score / totalRituals) * 100);
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

  /**
   * Buscar presença de um ritual específico
   */
  async getRitualAttendance(ritualId: string): Promise<RitualAttendance[]> {
    const { data, error } = await supabase
      .from("ritual_attendance")
      .select("*")
      .eq("ritual_id", ritualId);

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      ritualId: row.ritual_id,
      leaderId: row.leader_id,
      date: "",
      status: row.status || "absent",
    }));
  },

  /**
   * Buscar todos os rituais ativos (configuráveis no futuro)
   */
  async getActiveRituals(): Promise<Ritual[]> {
    // Por enquanto, retorna os rituais padrão
    // No futuro, isso virá do banco de dados
    return [
      { id: "weekly-leaders", name: "Weekly de Líderes", type: "weekly" },
      { id: "cumbuca", name: "Cumbuca", type: "weekly" },
      { id: "rmr", name: "RMR", type: "rmr" },
    ];
  },
};
