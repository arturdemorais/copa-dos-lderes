import { supabase } from "../supabaseClient";

// =====================================================
// TYPES
// =====================================================

export interface VorpCoinTransaction {
  id: string;
  leaderId: string;
  amount: number;
  type: "earned" | "spent";
  reason: string;
  relatedBadgeId?: string | null;
  relatedTaskId?: string | null;
  relatedPurchaseId?: string | null;
  createdAt: string;
}

// =====================================================
// VORP COINS SERVICE
// =====================================================

export const vorpCoinsService = {
  /**
   * Adicionar Vorp Coins ao saldo do líder
   */
  async addCoins(
    leaderId: string,
    amount: number,
    reason: string,
    metadata?: {
      relatedBadgeId?: string;
      relatedTaskId?: string;
    }
  ): Promise<{ newBalance: number; transaction: VorpCoinTransaction }> {
    // 1. Criar transação
    const { data: transactionData, error: transactionError } = await supabase
      .from("vorp_coin_transactions")
      .insert({
        leader_id: leaderId,
        amount,
        type: "earned",
        reason,
        related_badge_id: metadata?.relatedBadgeId || null,
        related_task_id: metadata?.relatedTaskId || null,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // 2. Atualizar saldo do líder
    const { data: leader, error: leaderFetchError } = await supabase
      .from("leaders")
      .select("vorp_coins")
      .eq("id", leaderId)
      .single();

    if (leaderFetchError) throw leaderFetchError;

    const newBalance = (leader.vorp_coins || 0) + amount;

    const { error: updateError } = await supabase
      .from("leaders")
      .update({ vorp_coins: newBalance })
      .eq("id", leaderId);

    if (updateError) throw updateError;

    return {
      newBalance,
      transaction: this.mapToTransaction(transactionData),
    };
  },

  /**
   * Gastar Vorp Coins do saldo do líder
   */
  async spendCoins(
    leaderId: string,
    amount: number,
    reason: string,
    relatedPurchaseId?: string
  ): Promise<{ newBalance: number; transaction: VorpCoinTransaction }> {
    // 1. Verificar saldo
    const { data: leader, error: leaderFetchError } = await supabase
      .from("leaders")
      .select("vorp_coins")
      .eq("id", leaderId)
      .single();

    if (leaderFetchError) throw leaderFetchError;

    const currentBalance = leader.vorp_coins || 0;

    if (currentBalance < amount) {
      throw new Error(
        `Saldo insuficiente. Você tem ${currentBalance} Vorp Coins e precisa de ${amount}.`
      );
    }

    // 2. Criar transação
    const { data: transactionData, error: transactionError } = await supabase
      .from("vorp_coin_transactions")
      .insert({
        leader_id: leaderId,
        amount,
        type: "spent",
        reason,
        related_purchase_id: relatedPurchaseId || null,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // 3. Atualizar saldo
    const newBalance = currentBalance - amount;

    const { error: updateError } = await supabase
      .from("leaders")
      .update({ vorp_coins: newBalance })
      .eq("id", leaderId);

    if (updateError) throw updateError;

    return {
      newBalance,
      transaction: this.mapToTransaction(transactionData),
    };
  },

  /**
   * Buscar histórico de transações do líder
   */
  async getTransactions(
    leaderId: string,
    limit: number = 50
  ): Promise<VorpCoinTransaction[]> {
    const { data, error } = await supabase
      .from("vorp_coin_transactions")
      .select("*")
      .eq("leader_id", leaderId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(this.mapToTransaction);
  },

  /**
   * Buscar saldo atual do líder
   */
  async getBalance(leaderId: string): Promise<number> {
    const { data, error } = await supabase
      .from("leaders")
      .select("vorp_coins")
      .eq("id", leaderId)
      .single();

    if (error) throw error;

    return data.vorp_coins || 0;
  },

  /**
   * Calcular resumo de transações
   */
  async getTransactionSummary(leaderId: string): Promise<{
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    transactionCount: number;
  }> {
    const { data: transactions, error } = await supabase
      .from("vorp_coin_transactions")
      .select("amount, type")
      .eq("leader_id", leaderId);

    if (error) throw error;

    const totalEarned = transactions
      .filter((t) => t.type === "earned")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = transactions
      .filter((t) => t.type === "spent")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = await this.getBalance(leaderId);

    return {
      totalEarned,
      totalSpent,
      currentBalance,
      transactionCount: transactions.length,
    };
  },

  /**
   * Mapear row do banco para tipo VorpCoinTransaction
   */
  mapToTransaction(row: any): VorpCoinTransaction {
    return {
      id: row.id,
      leaderId: row.leader_id,
      amount: row.amount,
      type: row.type,
      reason: row.reason,
      relatedBadgeId: row.related_badge_id,
      relatedTaskId: row.related_task_id,
      relatedPurchaseId: row.related_purchase_id,
      createdAt: row.created_at,
    };
  },
};
