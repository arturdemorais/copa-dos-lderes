import { supabase } from "../supabaseClient";
import { vorpCoinsService } from "./vorpCoinsService";

// =====================================================
// TYPES
// =====================================================

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "experience" | "physical" | "digital" | "benefit";
  stock: number; // -1 = unlimited
  imageUrl?: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StorePurchase {
  id: string;
  leaderId: string;
  storeItemId?: string | null;
  itemName: string;
  pricePaid: number;
  status: "pending" | "approved" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// STORE SERVICE
// =====================================================

export const storeService = {
  /**
   * Buscar todos os itens da loja disponíveis
   */
  async getItems(category?: string): Promise<StoreItem[]> {
    let query = supabase
      .from("store_items")
      .select("*")
      .eq("is_available", true);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query.order("price", { ascending: true });

    if (error) throw error;

    return data.map(this.mapToStoreItem);
  },

  /**
   * Buscar item por ID
   */
  async getItemById(itemId: string): Promise<StoreItem | null> {
    const { data, error } = await supabase
      .from("store_items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return this.mapToStoreItem(data);
  },

  /**
   * Comprar item da loja
   */
  async purchaseItem(leaderId: string, itemId: string): Promise<StorePurchase> {
    // 1. Buscar item
    const item = await this.getItemById(itemId);

    if (!item) {
      throw new Error("Item não encontrado.");
    }

    if (!item.isAvailable) {
      throw new Error("Este item não está mais disponível.");
    }

    // 2. Verificar estoque
    if (item.stock !== -1 && item.stock <= 0) {
      throw new Error("Este item está esgotado.");
    }

    // 3. Gastar Vorp Coins (isso já valida o saldo)
    const { transaction } = await vorpCoinsService.spendCoins(
      leaderId,
      item.price,
      `Compra: ${item.name}`
    );

    // 4. Criar registro de compra
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("store_purchases")
      .insert({
        leader_id: leaderId,
        store_item_id: itemId,
        item_name: item.name,
        price_paid: item.price,
        status: "pending",
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // 5. Atualizar transação com ID da compra
    await supabase
      .from("vorp_coin_transactions")
      .update({ related_purchase_id: purchaseData.id })
      .eq("id", transaction.id);

    // 6. Diminuir estoque (se não for ilimitado)
    if (item.stock !== -1) {
      await supabase
        .from("store_items")
        .update({ stock: item.stock - 1 })
        .eq("id", itemId);
    }

    return this.mapToStorePurchase(purchaseData);
  },

  /**
   * Buscar compras do líder
   */
  async getLeaderPurchases(leaderId: string): Promise<StorePurchase[]> {
    const { data, error } = await supabase
      .from("store_purchases")
      .select("*")
      .eq("leader_id", leaderId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(this.mapToStorePurchase);
  },

  /**
   * Atualizar status de uma compra (admin)
   */
  async updatePurchaseStatus(
    purchaseId: string,
    status: "pending" | "approved" | "delivered" | "cancelled"
  ): Promise<StorePurchase> {
    const { data, error } = await supabase
      .from("store_purchases")
      .update({ status })
      .eq("id", purchaseId)
      .select()
      .single();

    if (error) throw error;

    return this.mapToStorePurchase(data);
  },

  /**
   * Buscar todas as compras (admin)
   */
  async getAllPurchases(status?: string): Promise<any[]> {
    let query = supabase.from("store_purchases").select(`
        *,
        leaders:leader_id (
          name,
          email,
          photo
        )
      `);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    return data;
  },

  /**
   * Mapear row do banco para tipo StoreItem
   */
  mapToStoreItem(row: any): StoreItem {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      category: row.category,
      stock: row.stock,
      imageUrl: row.image_url,
      isAvailable: row.is_available,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  /**
   * Mapear row do banco para tipo StorePurchase
   */
  mapToStorePurchase(row: any): StorePurchase {
    return {
      id: row.id,
      leaderId: row.leader_id,
      storeItemId: row.store_item_id,
      itemName: row.item_name,
      pricePaid: row.price_paid,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};
