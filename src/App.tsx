import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { SignOut, House, Trophy, Books, Gauge } from "@phosphor-icons/react";
import { LoginPage } from "@/components/LoginPage";
import { LeaderDashboard } from "@/components/LeaderDashboard";
import { RankingPage } from "@/components/RankingPage";
import { AlbumPage } from "@/components/AlbumPage";
import { AdminDashboard } from "@/components/AdminDashboard";
import { LeaderProfileModal } from "@/components/LeaderProfileModal";
import { PeerEvaluationModal } from "@/components/PeerEvaluationModal";
import { useLeaders } from "@/hooks/useLeaders";
import {
  taskService,
  activityService,
  peerEvaluationService,
} from "@/lib/services";
import type { User, Leader, Task, Activity } from "@/lib/types";
import { calculateOverallScore } from "@/lib/scoring";
import { toast } from "sonner";

type Page = "dashboard" | "ranking" | "album" | "admin";

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Recuperar sessão do localStorage
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });
  const {
    leaders,
    loading: leadersLoading,
    updateLeader,
    refetch: refetchLeaders,
  } = useLeaders();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [evaluatingLeader, setEvaluatingLeader] = useState<Leader | null>(null);

  // Carregar tasks e activities do Supabase
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

    // Subscribe to real-time
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
  }, [currentUser]);

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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Salvar no localStorage
    localStorage.setItem("currentUser", JSON.stringify(user));
    if (user.role === "admin") {
      setCurrentPage("admin");
    } else {
      setCurrentPage("dashboard");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Remover do localStorage
    localStorage.removeItem("currentUser");
    setCurrentPage("dashboard");
  };

  const getCurrentLeader = (): Leader | undefined => {
    if (!currentUser || currentUser.role === "admin") return undefined;
    return leaders?.find((l) => l.email === currentUser.email);
  };

  const updateLeaderScores = async () => {
    await refetchLeaders();
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks?.find((t) => t.id === taskId);
    const leader = getCurrentLeader();

    if (!task || !leader) return;

    try {
      // Marcar task como completada no Supabase
      await taskService.complete(taskId, leader.id);

      // Atualizar UI localmente
      setTasks((currentTasks) =>
        currentTasks.map((t) =>
          t.id === taskId ? { ...t, completed: true } : t
        )
      );

      // Atualizar pontos do líder
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

      // Criar atividade no Supabase
      await activityService.create({
        type: "task",
        leaderId: leader.id,
        leaderName: leader.name,
        description: `Concluiu: ${task.title}`,
        timestamp: new Date().toISOString(),
      });

      await updateLeaderScores();
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
      // Salvar avaliação no Supabase
      await peerEvaluationService.create(
        fromLeader.id,
        toLeader.id,
        description,
        qualities
      );

      // Atualizar pontos
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

      // Criar atividade no Supabase
      await activityService.create({
        type: "kudos",
        leaderId: toLeader.id,
        leaderName: toLeader.name,
        description: `Recebeu assistência de ${
          fromLeader.name
        }: ${qualities.join(", ")}`,
        timestamp: new Date().toISOString(),
      });

      await updateLeaderScores();
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
    try {
      toast.info(
        "Dados já estão no Supabase! Use o SQL Editor para adicionar mais."
      );
      await refetchLeaders();
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const openLeaderProfile = (leader: Leader) => {
    setSelectedLeader(leader);
  };

  const openEvaluationModal = (leader: Leader) => {
    setSelectedLeader(null);
    setEvaluatingLeader(leader);
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const currentLeader = getCurrentLeader();
  const leaderTasks = currentLeader
    ? (tasks || []).filter((t) => t.leaderId === currentLeader.id)
    : [];

  const NavButton = ({
    page,
    icon: Icon,
    label,
  }: {
    page: Page;
    icon: any;
    label: string;
  }) => (
    <Button
      variant={currentPage === page ? "default" : "ghost"}
      onClick={() => setCurrentPage(page)}
      className="flex items-center gap-2"
    >
      <Icon size={20} weight={currentPage === page ? "fill" : "regular"} />
      <span className="hidden md:inline">{label}</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                <Trophy weight="fill" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg">Copa dos Líderes</h1>
                <p className="text-xs text-muted-foreground">
                  {currentUser.role === "admin"
                    ? "Administrador"
                    : `Técnico ${currentUser.name}`}
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              {currentUser.role === "leader" ? (
                <>
                  <NavButton page="dashboard" icon={House} label="Vestiário" />
                  <NavButton page="ranking" icon={Trophy} label="Ranking" />
                  <NavButton page="album" icon={Books} label="Álbum" />
                </>
              ) : (
                <NavButton page="admin" icon={Gauge} label="Painel" />
              )}

              <Button variant="ghost" onClick={handleLogout} className="ml-2">
                <SignOut size={20} />
                <span className="hidden md:inline ml-2">Sair</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentUser.role === "leader" && currentLeader ? (
          <>
            {currentPage === "dashboard" && (
              <LeaderDashboard
                currentLeader={currentLeader}
                tasks={leaderTasks}
                leaders={leaders || []}
                onTaskComplete={handleTaskComplete}
              />
            )}
            {currentPage === "ranking" && (
              <RankingPage
                leaders={leaders || []}
                activities={activities || []}
                onLeaderClick={openLeaderProfile}
              />
            )}
            {currentPage === "album" && (
              <AlbumPage
                leaders={leaders || []}
                onLeaderClick={openLeaderProfile}
              />
            )}
          </>
        ) : currentUser.role === "admin" ? (
          <AdminDashboard
            leaders={leaders || []}
            tasks={tasks || []}
            onUpdateLeader={handleUpdateLeader}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
            onInitializeSampleData={handleInitializeSampleData}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Perfil de líder não encontrado. Entre em contato com o
              administrador.
            </p>
          </div>
        )}
      </main>

      <LeaderProfileModal
        leader={selectedLeader}
        open={!!selectedLeader}
        onOpenChange={(open) => !open && setSelectedLeader(null)}
        onEvaluate={openEvaluationModal}
      />

      <PeerEvaluationModal
        leader={evaluatingLeader}
        open={!!evaluatingLeader}
        onOpenChange={(open) => !open && setEvaluatingLeader(null)}
        onSubmit={handlePeerEvaluation}
      />

      <Toaster />
    </div>
  );
}

export default App;
