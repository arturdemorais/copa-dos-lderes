import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
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
  const [sessionReady, setSessionReady] = useState(false);

  // Monitorar quando a sessão estiver pronta
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSessionReady(!!session);
    };

    checkSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionReady(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchLeaders = useCallback(async () => {
    try {
      setLoading(true);
      console.log(
        "[useLeaders] Fetching leaders, includeAdmins:",
        includeAdmins,
        "sessionReady:",
        sessionReady
      );

      // IMPORTANTE: Só buscar se a sessão estiver pronta
      if (!sessionReady) {
        console.log("[useLeaders] Session not ready yet, skipping fetch");
        setLeaders([]);
        setLoading(false);
        return;
      }

      // Se includeAdmins = true, busca todos (admin dashboard)
      // Senão, busca apenas líderes (gamificação)
      const data = includeAdmins
        ? await leaderService.getAllIncludingAdmins()
        : await leaderService.getAll();

      console.log("[useLeaders] Raw data from service:", data);

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
        emails: updated.map((l) => ({ email: l.email, isAdmin: l.isAdmin })),
      });

      setLeaders(updated);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching leaders:", err);
    } finally {
      setLoading(false);
    }
  }, [includeAdmins, sessionReady]); // IMPORTANTE: Adicionar sessionReady como dependência

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
