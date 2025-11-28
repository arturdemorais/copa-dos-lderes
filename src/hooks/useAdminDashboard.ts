import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { leaderService, ritualService } from "@/lib/services";
import type { Leader, Ritual } from "@/lib/types";

interface UseAdminDashboardProps {
  onRefetchLeaders?: () => void;
}

export function useAdminDashboard({ onRefetchLeaders }: UseAdminDashboardProps = {}) {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [isLoadingRituals, setIsLoadingRituals] = useState(true);
  const [showCreateLeaderModal, setShowCreateLeaderModal] = useState(false);
  const [showRitualAttendanceModal, setShowRitualAttendanceModal] = useState(false);

  // Load active rituals on mount
  useEffect(() => {
    loadActiveRituals();
  }, []);

  const loadActiveRituals = useCallback(async () => {
    setIsLoadingRituals(true);
    try {
      const activeRituals = await ritualService.getActiveRituals();
      setRituals(activeRituals);
    } catch (error) {
      console.error("Error loading rituals:", error);
      toast.error("Erro ao carregar rituais");
    } finally {
      setIsLoadingRituals(false);
    }
  }, []);

  const handleDeleteLeader = useCallback(
    async (leaderId: string) => {
      try {
        await leaderService.delete(leaderId);
        toast.success("Líder removido com sucesso!");

        // Refetch leaders sem reload da página
        if (onRefetchLeaders) {
          onRefetchLeaders();
        }
      } catch (error) {
        console.error("Error deleting leader:", error);
        toast.error("Erro ao deletar líder");
      }
    },
    [onRefetchLeaders]
  );

  const handleInitializeData = useCallback(
    (onInitializeSampleData?: () => void) => {
      if (onInitializeSampleData) {
        onInitializeSampleData();
        toast.success("Dados de exemplo carregados com sucesso!");
      }
    },
    []
  );

  const openCreateLeaderModal = useCallback(() => {
    setShowCreateLeaderModal(true);
  }, []);

  const closeCreateLeaderModal = useCallback(() => {
    setShowCreateLeaderModal(false);
  }, []);

  const openRitualAttendanceModal = useCallback(() => {
    setShowRitualAttendanceModal(true);
  }, []);

  const closeRitualAttendanceModal = useCallback(() => {
    setShowRitualAttendanceModal(false);
  }, []);

  const handleCreateLeaderSuccess = useCallback(() => {
    toast.success("Líder cadastrado! Atualize a página para ver.");
    closeCreateLeaderModal();
  }, [closeCreateLeaderModal]);

  const handleRitualAttendanceSuccess = useCallback(() => {
    toast.success("Presenças registradas com sucesso!");
    closeRitualAttendanceModal();
  }, [closeRitualAttendanceModal]);

  return {
    // State
    rituals,
    isLoadingRituals,
    showCreateLeaderModal,
    showRitualAttendanceModal,

    // Handlers
    handleDeleteLeader,
    handleInitializeData,
    loadActiveRituals,

    // Modal controls
    openCreateLeaderModal,
    closeCreateLeaderModal,
    openRitualAttendanceModal,
    closeRitualAttendanceModal,
    handleCreateLeaderSuccess,
    handleRitualAttendanceSuccess,
  };
}
