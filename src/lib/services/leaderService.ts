import { supabase } from "../supabaseClient";
import type { Leader } from "../types";

/**
 * Optimize and resize image before upload
 */
async function optimizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Target size: 512x512 for profile photos (high quality but optimized)
        const maxSize = 512;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        // Create canvas for resizing
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with high quality (0.92 = 92% quality)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/webp", // WebP format for better compression
          0.92 // High quality (92%)
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload profile photo to Supabase Storage
 */
export async function uploadProfilePhoto(
  file: File,
  leaderId: string
): Promise<string> {
  // Optimize image before upload
  const optimizedBlob = await optimizeImage(file);

  const fileName = `${leaderId}-${Date.now()}.webp`;
  const filePath = `profile-photos/${fileName}`;

  // Upload optimized file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("leader-photos")
    .upload(filePath, optimizedBlob, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/webp",
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data } = supabase.storage
    .from("leader-photos")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Delete profile photo from Supabase Storage
 */
export async function deleteProfilePhoto(photoUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split("/leader-photos/");
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];

    await supabase.storage.from("leader-photos").remove([filePath]);
  } catch (error) {
    console.error("Error deleting photo:", error);
  }
}

export const leaderService = {
  /**
   * Buscar todos os líderes (EXCETO admins)
   */
  async getAll(): Promise<Leader[]> {
    const { data, error } = await supabase
      .from("leaders")
      .select("*")
      .eq("is_admin", false) // Apenas líderes que participam da gamificação
      .order("overall", { ascending: false });

    if (error) throw error;

    return data.map(this.mapToLeader);
  },

  /**
   * Buscar TODOS os líderes incluindo admins (apenas para admin dashboard)
   */
  async getAllIncludingAdmins(): Promise<Leader[]> {
    const { data, error } = await supabase
      .from("leaders")
      .select("*")
      .order("overall", { ascending: false });

    if (error) throw error;

    return data.map(this.mapToLeader);
  },

  /**
   * Buscar líder por ID
   */
  async getById(id: string): Promise<Leader | null> {
    const { data, error } = await supabase
      .from("leaders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return this.mapToLeader(data);
  },

  /**
   * Buscar líder por email
   */
  async getByEmail(email: string): Promise<Leader | null> {
    try {
      const { data, error } = await supabase
        .from("leaders")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      return this.mapToLeader(data);
    } catch (err) {
      throw err;
    }
  },

  /**
   * Criar novo líder
   */
  async create(leader: Omit<Leader, "id">): Promise<Leader> {
    const insertData = {
      name: leader.name,
      email: leader.email,
      photo: leader.photo,
      team: leader.team,
      position: leader.position,
      overall: leader.overall || 0,
      weekly_points: leader.weeklyPoints || 0,
      task_points: leader.taskPoints || 0,
      assist_points: leader.assistPoints || 0,
      ritual_points: leader.ritualPoints || 0,
      consistency_score: leader.consistencyScore || 0,
      momentum: leader.momentum || 0,
      trend: leader.trend || "stable",
      rank_change: leader.rankChange || 0,
      attr_communication: leader.attributes?.communication || 50,
      attr_technique: leader.attributes?.technique || 50,
      attr_management: leader.attributes?.management || 50,
      attr_pace: leader.attributes?.pace || 50,
      attr_leadership: leader.attributes?.leadership || 50,
      attr_development: leader.attributes?.development || 50,
      strengths: leader.strengths || [],
      improvements: leader.improvements || [],
    };

    const { data, error } = await supabase
      .from("leaders")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return this.mapToLeader(data);
  },

  /**
   * Atualizar líder
   */
  async update(id: string, updates: Partial<Leader>): Promise<Leader> {
    const updateData: Record<string, any> = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.photo !== undefined) updateData.photo = updates.photo;
    if (updates.team) updateData.team = updates.team;
    if (updates.position) updateData.position = updates.position;
    if (updates.overall !== undefined) updateData.overall = updates.overall;
    if (updates.weeklyPoints !== undefined)
      updateData.weekly_points = updates.weeklyPoints;
    if (updates.taskPoints !== undefined)
      updateData.task_points = updates.taskPoints;
    if (updates.assistPoints !== undefined)
      updateData.assist_points = updates.assistPoints;
    if (updates.ritualPoints !== undefined)
      updateData.ritual_points = updates.ritualPoints;
    if (updates.consistencyScore !== undefined)
      updateData.consistency_score = updates.consistencyScore;
    if (updates.momentum !== undefined) updateData.momentum = updates.momentum;
    if (updates.trend) updateData.trend = updates.trend;
    if (updates.rankChange !== undefined)
      updateData.rank_change = updates.rankChange;
    if (updates.strengths) updateData.strengths = updates.strengths;
    if (updates.improvements) updateData.improvements = updates.improvements;

    if (updates.attributes) {
      if (updates.attributes.communication !== undefined)
        updateData.attr_communication = updates.attributes.communication;
      if (updates.attributes.technique !== undefined)
        updateData.attr_technique = updates.attributes.technique;
      if (updates.attributes.management !== undefined)
        updateData.attr_management = updates.attributes.management;
      if (updates.attributes.pace !== undefined)
        updateData.attr_pace = updates.attributes.pace;
      if (updates.attributes.leadership !== undefined)
        updateData.attr_leadership = updates.attributes.leadership;
      if (updates.attributes.development !== undefined)
        updateData.attr_development = updates.attributes.development;
    }

    console.log("Updating leader with ID:", id);
    console.log("Update data:", updateData);

    // Verificar sessão atual para debug de RLS
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("Current session user_id:", session?.user?.id);
    console.log("Current session user email:", session?.user?.email);

    const { data, error } = await supabase
      .from("leaders")
      .update(updateData)
      .eq("id", id)
      .select("*");

    console.log("Update response:", { data, error });

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("No leader found with ID:", id);
      console.error(
        "This is likely a Row Level Security (RLS) issue. The current user does not have permission to update this leader."
      );
      console.error(
        "To fix this, you need to add RLS policies in Supabase that allow admins to update any leader."
      );
      throw new Error(
        `Leader not found with ID: ${id}. This is a Row Level Security (RLS) issue. Check the console for details.`
      );
    }

    return this.mapToLeader(data[0]);
  },

  /**
   * Deletar líder
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("leaders").delete().eq("id", id);

    // Ignore error if no rows found
    if (error && error.code !== "PGRST116") {
      throw error;
    }
  },

  /**
   * Mapear row do banco para tipo Leader
   */
  mapToLeader(row: any): Leader {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      photo: row.photo || undefined,
      team: row.team,
      position: row.position,
      overall: row.overall,
      weeklyPoints: row.weekly_points,
      taskPoints: row.task_points,
      assistPoints: row.assist_points,
      ritualPoints: row.ritual_points,
      consistencyScore: row.consistency_score,
      momentum: row.momentum,
      trend: row.trend,
      rankChange: row.rank_change,
      vorpCoins: row.vorp_coins || 0,
      attributes: {
        communication: row.attr_communication,
        technique: row.attr_technique,
        management: row.attr_management,
        pace: row.attr_pace,
        leadership: row.attr_leadership,
        development: row.attr_development,
      },
      strengths: row.strengths || [],
      improvements: row.improvements || [],
      trophies: [],
      badges: [],
      history: [],
      monthlyChampionships: [],
      isAdmin: row.is_admin || false, // Mapear is_admin do banco
    };
  },

  /**
   * Subscribe to real-time changes
   */
  subscribeToChanges(callback: (leaders: Leader[]) => void) {
    const channel = supabase
      .channel("leaders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaders",
        },
        async () => {
          const leaders = await this.getAll();
          callback(leaders);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
