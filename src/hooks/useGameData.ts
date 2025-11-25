import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  taskService,
  activityService,
  peerEvaluationService,
} from "@/lib/services";
import { useLeaders } from "@/hooks/useLeaders";
import { calculateOverallScore } from "@/lib/scoring";
import type { User, Leader, Task, Activity } from "@/lib/types";

export function useGameData() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const {
    leaders,
    loading: leadersLoading,
    updateLeader,
    refetch: refetchLeaders,
  } = useLeaders(currentUser?.role === "admin"); // Admin vê todos para gerenciar, mas filtra na exibição

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [evaluatingLeader, setEvaluatingLeader] = useState<Leader | null>(null);

  const getCurrentLeader = (): Leader | undefined => {
    if (!currentUser || currentUser.role === "admin") return undefined;
    return leaders?.find((l) => l.email === currentUser.email);
  };

  const loadLeaderTasks = async (leaderId: string) => {
    try {
      const leaderTasks = await taskService.getByLeader(leaderId);
      setTasks(leaderTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const loadAllTasks = async () => {
    try {
      const allTasks = await taskService.getAll();
      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const loadActivities = async () => {
    try {
      const allActivities = await activityService.getAll(50);
      setActivities(allActivities);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === "leader") {
      const leader = getCurrentLeader();
      if (leader) {
        loadLeaderTasks(leader.id);
      }
    } else if (currentUser && currentUser.role === "admin") {
      loadAllTasks();
    }

    loadActivities();

    const unsubscribeTasks = taskService.subscribeToChanges(() => {
      if (currentUser?.role === "admin") loadAllTasks();
      else if (currentUser?.role === "leader") {
        const leader = getCurrentLeader();
        if (leader) loadLeaderTasks(leader.id);
      }
    });

    const unsubscribeActivities = activityService.subscribeToChanges(
      (newActivities) => {
        setActivities(newActivities);
      }
    );

    return () => {
      unsubscribeTasks();
      unsubscribeActivities();
    };
  }, [currentUser, leaders]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks?.find((t) => t.id === taskId);
    const leader = getCurrentLeader();

    if (!task || !leader) return;

    // Se já está completada, desmarcar
    if (task.completed) {
      try {
        await taskService.uncomplete(taskId, leader.id);

        setTasks((currentTasks) =>
          currentTasks.map((t) =>
            t.id === taskId ? { ...t, completed: false } : t
          )
        );

        const newTaskPoints = Math.max(0, leader.taskPoints - task.points);
        const updatedLeader = {
          ...leader,
          taskPoints: newTaskPoints,
        };
        const newOverall = calculateOverallScore(updatedLeader);

        await updateLeader(leader.id, {
          taskPoints: newTaskPoints,
          overall: newOverall,
        });

        // Não precisa refetch - real-time subscription atualiza automaticamente
        toast.info("Task desmarcada! -" + task.points + " pontos");
      } catch (error) {
        console.error("Error uncompleting task:", error);
        toast.error("Erro ao desmarcar task");
      }
      return;
    }

    // Caso contrário, completar
    try {
      await taskService.complete(taskId, leader.id);

      setTasks((currentTasks) =>
        currentTasks.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t
        )
      );

      const newTaskPoints = leader.taskPoints + task.points;
      const updatedLeader = {
        ...leader,
        taskPoints: newTaskPoints,
      };
      const newOverall = calculateOverallScore(updatedLeader);

      await updateLeader(leader.id, {
        taskPoints: newTaskPoints,
        overall: newOverall,
      });

      await activityService.create({
        type: "task",
        leaderId: leader.id,
        leaderName: leader.name,
        description: `Concluiu: ${task.title}`,
        timestamp: new Date().toISOString(),
      });

      // Não precisa refetch - real-time subscription atualiza automaticamente
      toast.success("Task completada! +" + task.points + " pontos ⚽");
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Erro ao completar task");
    }
  };

  const handlePeerEvaluation = async (
    leaderId: string,
    description: string,
    qualities: string[]
  ) => {
    const fromLeader = getCurrentLeader();
    const toLeader = leaders?.find((l) => l.id === leaderId);

    if (!fromLeader || !toLeader) return;

    try {
      await peerEvaluationService.create(
        fromLeader.id,
        toLeader.id,
        description,
        qualities
      );

      const newAssistPoints = toLeader.assistPoints + 10;
      const updatedLeader = {
        ...toLeader,
        assistPoints: newAssistPoints,
      };
      const newOverall = calculateOverallScore(updatedLeader);

      await updateLeader(leaderId, {
        assistPoints: newAssistPoints,
        overall: newOverall,
      });

      await activityService.create({
        type: "kudos",
        leaderId: toLeader.id,
        leaderName: toLeader.name,
        description: `Recebeu assistência de ${
          fromLeader.name
        }: ${qualities.join(", ")}`,
        timestamp: new Date().toISOString(),
      });

      // Não precisa refetch - real-time subscription atualiza automaticamente
      toast.success(
        "Avaliação enviada! +10 pontos para " + toLeader.name + " 🎖️"
      );
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("Erro ao enviar avaliação");
    }

    setEvaluatingLeader(null);
  };

  const handleUpdateLeader = async (updatedLeader: Leader) => {
    try {
      await updateLeader(updatedLeader.id, updatedLeader);
      toast.success("Líder atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating leader:", error);
      toast.error("Erro ao atualizar líder");
    }
  };

  const handleCreateTask = async (
    newTask: Omit<Task, "id" | "leaderId" | "completed">
  ) => {
    try {
      await taskService.create(newTask, currentUser?.id);
      await loadAllTasks();
      toast.success("Task criada com sucesso!");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Erro ao criar task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.delete(taskId);
      setTasks((currentTasks) => currentTasks.filter((t) => t.id !== taskId));
      toast.success("Task removida");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Erro ao deletar task");
    }
  };

  const handleInitializeSampleData = async () => {
    toast.info(
      "Dados já estão no Supabase! Use o SQL Editor para adicionar mais."
    );
  };

  return {
    currentUser,
    leaders,
    tasks,
    activities,
    selectedLeader,
    evaluatingLeader,
    leadersLoading,
    getCurrentLeader,
    handleLogin,
    handleLogout,
    handleTaskComplete,
    handlePeerEvaluation,
    handleUpdateLeader,
    handleCreateTask,
    handleDeleteTask,
    handleInitializeSampleData,
    setSelectedLeader,
    setEvaluatingLeader,
  };
}
