import { useState, useEffect, useCallback } from "react";
import { leaderService } from "@/lib/services";
import type { Leader } from "@/lib/types";
import {
  calculateOverallScore,
  calculateConsistencyScore,
  calculateMomentum,
  calculateTrend,
  calculateRankChange,
} from "@/lib/scoring";

export function useLeaders(includeAdmins = false) {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaders = useCallback(async () => {
    try {
      setLoading(true);
      // Se includeAdmins = true, busca todos (admin dashboard)
      // Senão, busca apenas líderes (gamificação)
      const data = includeAdmins
        ? await leaderService.getAllIncludingAdmins()
        : await leaderService.getAll();

      // Recalcular scores
      const updated = data.map((leader) => {
        const consistency = calculateConsistencyScore(leader.history || []);
        const momentum = calculateMomentum(leader.history || []);
        const trend = calculateTrend(momentum);
        const overall = calculateOverallScore({
          ...leader,
          consistencyScore: consistency,
        });
        const rankChange = calculateRankChange(data, leader);

        return {
          ...leader,
          overall,
          consistencyScore: consistency,
          momentum,
          trend,
          rankChange,
        };
      });

      console.log("[useLeaders] Fetched leaders:", {
        includeAdmins,
        count: updated.length,
        emails: updated.map(l => ({ email: l.email, isAdmin: l.isAdmin })),
      });

      setLeaders(updated);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching leaders:", err);
    } finally {
      setLoading(false);
    }
  }, [includeAdmins]);

  useEffect(() => {
    fetchLeaders();

    // Subscribe to real-time changes
    const unsubscribe = leaderService.subscribeToChanges((updatedLeaders) => {
      // Recalcular scores para leaders atualizados via real-time
      const recalculated = updatedLeaders.map((leader) => {
        const consistency = calculateConsistencyScore(leader.history || []);
        const momentum = calculateMomentum(leader.history || []);
        const trend = calculateTrend(momentum);
        const overall = calculateOverallScore({
          ...leader,
          consistencyScore: consistency,
        });
        const rankChange = calculateRankChange(updatedLeaders, leader);

        return {
          ...leader,
          overall,
          consistencyScore: consistency,
          momentum,
          trend,
          rankChange,
        };
      });

      setLeaders(recalculated);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchLeaders]);

  const updateLeader = async (id: string, updates: Partial<Leader>) => {
    try {
      const updated = await leaderService.update(id, updates);

      // Recalcular scores do leader atualizado
      const consistency = calculateConsistencyScore(updated.history || []);
      const momentum = calculateMomentum(updated.history || []);
      const trend = calculateTrend(momentum);
      const overall = calculateOverallScore({
        ...updated,
        consistencyScore: consistency,
      });

      const recalculated = {
        ...updated,
        overall,
        consistencyScore: consistency,
        momentum,
        trend,
      };

      setLeaders((prev) => prev.map((l) => (l.id === id ? recalculated : l)));
      return recalculated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const createLeader = async (leader: Omit<Leader, "id">) => {
    try {
      const created = await leaderService.create(leader);
      setLeaders((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    leaders,
    loading,
    error,
    updateLeader,
    createLeader,
    refetch: fetchLeaders,
  };
}
