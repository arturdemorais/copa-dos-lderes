import { supabase } from "../supabaseClient";

// =====================================================
// TYPES
// =====================================================

export interface VarRequest {
  id: string;
  leaderId: string;
  requestType: "ritual_absence" | "task_delay";
  ritualId?: string | null;
  taskId?: string | null;
  reason: string;
  evidenceUrl?: string | null;
  status: "pending" | "approved" | "rejected";
  adminResponse?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  pointsAtRisk: number;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// VAR SERVICE
// =====================================================

export const varService = {
  /**
   * Criar solicitação de VAR (líder)
   */
  async createRequest(
    leaderId: string,
    requestType: "ritual_absence" | "task_delay",
    reason: string,
    options: {
      ritualId?: string;
      taskId?: string;
      evidenceUrl?: string;
      pointsAtRisk?: number;
    }
  ): Promise<VarRequest> {
    const { data, error } = await supabase
      .from("var_requests")
      .insert({
        leader_id: leaderId,
        request_type: requestType,
        ritual_id: options.ritualId || null,
        task_id: options.taskId || null,
        reason,
        evidence_url: options.evidenceUrl || null,
        points_at_risk: options.pointsAtRisk || 0,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToVarRequest(data);
  },

  /**
   * Buscar solicitações de um líder
   */
  async getLeaderRequests(leaderId: string): Promise<VarRequest[]> {
    const { data, error } = await supabase
      .from("var_requests")
      .select("*")
      .eq("leader_id", leaderId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => this.mapToVarRequest(row));
  },

  /**
   * Buscar todas as solicitações pendentes (admin)
   */
  async getPendingRequests(): Promise<VarRequest[]> {
    const { data, error } = await supabase
      .from("var_requests")
      .select(
        `
        *,
        leader:leaders!leader_id(name, team, photo),
        ritual:rituals(name, type, date),
        task:tasks(title, description)
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data || []).map((row) => this.mapToVarRequest(row));
  },

  /**
   * Buscar todas as solicitações (admin)
   */
  async getAllRequests(status?: "pending" | "approved" | "rejected"): Promise<VarRequest[]> {
    let query = supabase
      .from("var_requests")
      .select(
        `
        *,
        leader:leaders!leader_id(name, team, photo),
        ritual:rituals(name, type, date),
        task:tasks(title, description)
      `
      );

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => this.mapToVarRequest(row));
  },

  /**
   * Aprovar solicitação (admin)
   */
  async approveRequest(
    requestId: string,
    adminId: string,
    adminResponse?: string
  ): Promise<void> {
    const { error } = await supabase.rpc("approve_var_request", {
      request_id: requestId,
      admin_id: adminId,
      admin_comment: adminResponse || null,
    });

    if (error) throw error;
  },

  /**
   * Rejeitar solicitação (admin)
   */
  async rejectRequest(
    requestId: string,
    adminId: string,
    adminResponse: string
  ): Promise<void> {
    const { error } = await supabase.rpc("reject_var_request", {
      request_id: requestId,
      admin_id: adminId,
      admin_comment: adminResponse,
    });

    if (error) throw error;
  },

  /**
   * Atualizar status manualmente (fallback)
   */
  async updateStatus(
    requestId: string,
    status: "approved" | "rejected",
    adminId: string,
    adminResponse?: string
  ): Promise<void> {
    const { error } = await supabase
      .from("var_requests")
      .update({
        status,
        admin_response: adminResponse,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) throw error;
  },

  /**
   * Verificar se líder já solicitou VAR para ritual/task específico
   */
  async hasExistingRequest(
    leaderId: string,
    ritualId?: string,
    taskId?: string
  ): Promise<boolean> {
    let query = supabase
      .from("var_requests")
      .select("id")
      .eq("leader_id", leaderId)
      .in("status", ["pending", "approved"]);

    if (ritualId) {
      query = query.eq("ritual_id", ritualId);
    }

    if (taskId) {
      query = query.eq("task_id", taskId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data?.length || 0) > 0;
  },

  /**
   * Estatísticas de VAR (admin dashboard)
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  }> {
    const { data, error } = await supabase.from("var_requests").select("status");

    if (error) throw error;

    const total = data?.length || 0;
    const pending = data?.filter((r) => r.status === "pending").length || 0;
    const approved = data?.filter((r) => r.status === "approved").length || 0;
    const rejected = data?.filter((r) => r.status === "rejected").length || 0;
    const approvalRate =
      approved + rejected > 0 ? (approved / (approved + rejected)) * 100 : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate,
    };
  },

  /**
   * Mapear dados do banco para o tipo TypeScript
   */
  mapToVarRequest(row: any): VarRequest {
    return {
      id: row.id,
      leaderId: row.leader_id,
      requestType: row.request_type,
      ritualId: row.ritual_id,
      taskId: row.task_id,
      reason: row.reason,
      evidenceUrl: row.evidence_url,
      status: row.status,
      adminResponse: row.admin_response,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      pointsAtRisk: row.points_at_risk,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};
