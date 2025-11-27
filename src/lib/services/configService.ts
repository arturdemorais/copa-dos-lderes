import { supabase } from "../supabaseClient";

export interface ScoringConfig {
  assist_points: number;
  ritual_max_points: number;
  task_completion_bonus: number;
  multipliers: {
    tasks: number;
    assists: number;
    rituals: number;
    consistency: number;
  };
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  assist_points: 10,
  ritual_max_points: 50,
  task_completion_bonus: 0,
  multipliers: {
    tasks: 1,
    assists: 1,
    rituals: 1,
    consistency: 1,
  },
};

export const configService = {
  async getConfig(): Promise<ScoringConfig> {
    try {
      const { data, error } = await supabase
        .from("system_config")
        .select("*")
        .eq("key", "scoring_config")
        .single();

      if (error) {
        // If table doesn't exist or row missing, return default
        console.warn("Could not fetch scoring config, using defaults:", error.message);
        return DEFAULT_SCORING_CONFIG;
      }

      return { ...DEFAULT_SCORING_CONFIG, ...data.value };
    } catch (error) {
      console.error("Error in getConfig:", error);
      return DEFAULT_SCORING_CONFIG;
    }
  },

  async updateConfig(newConfig: Partial<ScoringConfig>): Promise<void> {
    // First get current to merge
    const current = await this.getConfig();
    const updated = { ...current, ...newConfig };

    const { error } = await supabase
      .from("system_config")
      .upsert(
        {
          key: "scoring_config",
          value: updated,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) throw error;
  },
};
