import { supabase } from "../supabaseClient";

interface PeerEvaluation {
  id: string;
  fromLeaderId: string;
  toLeaderId: string;
  description: string;
  qualities: string[];
  pointsAwarded: number;
  timestamp: string;
}

export const peerEvaluationService = {
  /**
   * Criar avaliação de par
   */
  async create(
    fromLeaderId: string,
    toLeaderId: string,
    description: string,
    qualities: string[]
  ): Promise<PeerEvaluation> {
    const { data, error } = await supabase
      .from("peer_evaluations")
      .insert({
        from_leader_id: fromLeaderId,
        to_leader_id: toLeaderId,
        description,
        qualities,
        points_awarded: 10,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      fromLeaderId: data.from_leader_id,
      toLeaderId: data.to_leader_id,
      description: data.description,
      qualities: data.qualities,
      pointsAwarded: data.points_awarded,
      timestamp: data.created_at,
    };
  },

  /**
   * Buscar avaliações recebidas por um líder
   */
  async getReceivedByLeader(leaderId: string): Promise<PeerEvaluation[]> {
    const { data, error } = await supabase
      .from("peer_evaluations")
      .select("*")
      .eq("to_leader_id", leaderId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      fromLeaderId: row.from_leader_id,
      toLeaderId: row.to_leader_id,
      description: row.description,
      qualities: row.qualities,
      pointsAwarded: row.points_awarded,
      timestamp: row.created_at,
    }));
  },

  /**
   * Buscar avaliações enviadas por um líder
   */
  async getSentByLeader(leaderId: string): Promise<PeerEvaluation[]> {
    const { data, error } = await supabase
      .from("peer_evaluations")
      .select("*")
      .eq("from_leader_id", leaderId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      fromLeaderId: row.from_leader_id,
      toLeaderId: row.to_leader_id,
      description: row.description,
      qualities: row.qualities,
      pointsAwarded: row.points_awarded,
      timestamp: row.created_at,
    }));
  },
};
