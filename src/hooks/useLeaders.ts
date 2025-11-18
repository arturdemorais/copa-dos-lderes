import { useState, useEffect } from "react";
import { leaderService } from "@/lib/services";
import type { Leader } from "@/lib/types";
import {
  calculateOverallScore,
  calculateConsistencyScore,
  calculateMomentum,
  calculateTrend,
  calculateRankChange,
} from "@/lib/scoring";

export function useLeaders() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const data = await leaderService.getAll();

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

      setLeaders(updated);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching leaders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();

    // Subscribe to real-time changes
    const unsubscribe = leaderService.subscribeToChanges((updatedLeaders) => {
      setLeaders(updatedLeaders);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateLeader = async (id: string, updates: Partial<Leader>) => {
    try {
      const updated = await leaderService.update(id, updates);
      setLeaders((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return updated;
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
