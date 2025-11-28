import { supabase } from "../supabaseClient";

// =====================================================
// TYPES
// =====================================================

export interface AnonymousFeedback {
  id: string;
  toLeaderId: string;
  feedbackText: string;
  feedbackType: "positive" | "improvement";
  pointsToSender: number;
  isApproved: boolean;
  createdAt: string;
}

// =====================================================
// ANONYMOUS FEEDBACK SERVICE
// =====================================================

export const anonymousFeedbackService = {
  /**
   * Send anonymous feedback to a leader
   * Uses hash to track sender (for preventing duplicates) without revealing identity
   */
  async sendFeedback(
    fromLeaderId: string,
    toLeaderId: string,
    feedbackText: string,
    feedbackType: "positive" | "improvement"
  ): Promise<{ success: boolean; pointsEarned: number }> {
    // Create hash from fromLeaderId + toLeaderId + current date
    // This prevents same person from giving multiple feedbacks on same day
    const today = new Date().toISOString().split("T")[0];
    const hashString = `${fromLeaderId}-${toLeaderId}-${today}`;
    const feedbackHash = await this.createHash(hashString);
    
    // Get config
    const config = await import("./configService").then(m => m.configService.getConfig());
    const pointsSender = config.anonymous_feedback_points_sender;
    const coinsSender = config.anonymous_feedback_coins_sender;

    try {
      // 1. Insert anonymous feedback
      const { data: feedback, error: feedbackError } = await supabase
        .from("anonymous_feedback")
        .insert({
          to_leader_id: toLeaderId,
          feedback_text: feedbackText,
          feedback_type: feedbackType,
          feedback_hash: feedbackHash,
          points_to_sender: pointsSender,
          is_approved: true,
        })
        .select()
        .single();

      if (feedbackError) {
        // Check if it's a duplicate error
        if (feedbackError.code === "23505") {
          throw new Error("Você já enviou feedback para este líder hoje!");
        }
        throw feedbackError;
      }

      // 2. Award points to SENDER
      const { error: senderError } = await supabase.rpc(
        "add_points_to_leader",
        {
          leader_id: fromLeaderId,
          points_to_add: pointsSender,
          point_type: "assist_points",
        }
      );

      if (senderError) {
        console.error("Error adding points to sender:", senderError);
      }

      // 3. Create Vorp Coins transaction for sender
      await supabase.from("vorp_coin_transactions").insert({
        leader_id: fromLeaderId,
        amount: coinsSender, // Bonus Vorp Coins for giving feedback
        type: "earned",
        reason: `Feedback enviado (anônimo)`,
      });

      // 4. Update leader's vorp_coins
      await supabase.rpc("add_vorp_coins", {
        leader_id: fromLeaderId,
        coins_to_add: coinsSender,
      });

      return {
        success: true,
        pointsEarned: pointsSender, // Points earned by sender
      };
    } catch (error) {
      console.error("Error sending feedback:", error);
      throw error;
    }
  },

  /**
   * Get feedback received by a leader (anonymous - no sender info)
   */
  async getReceivedFeedback(leaderId: string): Promise<AnonymousFeedback[]> {
    const { data, error } = await supabase
      .from("anonymous_feedback")
      .select("*")
      .eq("to_leader_id", leaderId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      toLeaderId: row.to_leader_id,
      feedbackText: row.feedback_text,
      feedbackType: row.feedback_type,
      pointsToSender: row.points_to_sender,
      isApproved: row.is_approved,
      createdAt: row.created_at,
    }));
  },

  /**
   * Get recent feedback (for admin view)
   */
  async getRecentFeedback(limit: number = 20): Promise<AnonymousFeedback[]> {
    const { data, error } = await supabase
      .from("anonymous_feedback")
      .select(
        `
        *,
        to_leader:leaders!to_leader_id(name, team)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      toLeaderId: row.to_leader_id,
      feedbackText: row.feedback_text,
      feedbackType: row.feedback_type,
      pointsToSender: row.points_to_sender,
      isApproved: row.is_approved,
      createdAt: row.created_at,
    }));
  },

  /**
   * Get feedback statistics for a leader
   */
  async getFeedbackStats(leaderId: string): Promise<{
    totalReceived: number;
    positiveCount: number;
    improvementCount: number;
  }> {
    const { data, error } = await supabase
      .from("anonymous_feedback")
      .select("feedback_type")
      .eq("to_leader_id", leaderId)
      .eq("is_approved", true);

    if (error) throw error;

    const stats = {
      totalReceived: data?.length || 0,
      positiveCount:
        data?.filter((f) => f.feedback_type === "positive").length || 0,
      improvementCount:
        data?.filter((f) => f.feedback_type === "improvement").length || 0,
    };

    return stats;
  },

  /**
   * Create hash for anonymous tracking
   */
  async createHash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  },
};
