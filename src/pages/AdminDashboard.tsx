import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  SoccerBall,
  CalendarCheck,
  Database,
  VideoCamera,
  ClockClockwise,
  Gear,
} from "@phosphor-icons/react";
import { CreateLeaderModal } from "@/components/modals/CreateLeaderModal";
import { VarAdminPanel } from "@/components/admin/VarAdminPanel";
import { ScoringConfigPanel } from "@/components/admin/ScoringConfigPanel";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import { AdminStats } from "@/components/admin/AdminStats";
import { RitualAttendanceModal } from "@/components/admin/RitualAttendanceModal";
import { RitualAttendanceSummary } from "@/components/admin/RitualAttendanceSummary";
import { LeadersTab } from "@/components/admin/tabs";
import { TasksTab } from "@/components/admin/tabs";
import type { Leader, Task, Ritual } from "@/lib/types";
import { toast } from "sonner";
import { leaderService, ritualService } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminDashboardProps {
  leaders: Leader[];
  tasks: Task[];
  onUpdateLeader: (leader: Leader) => void;
  onCreateTask: (task: Omit<Task, "id" | "leaderId" | "completed">) => void;
  onDeleteTask: (taskId: string) => void;
  onInitializeSampleData?: () => void;
  adminId: string; // ID do admin para painel VAR
}

export function AdminDashboard({
  leaders,
  tasks,
  onUpdateLeader,
  onCreateTask,
  onDeleteTask,
  onInitializeSampleData,
  adminId,
}: AdminDashboardProps) {
  const [showCreateLeaderModal, setShowCreateLeaderModal] = useState(false);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [showRitualAttendanceModal, setShowRitualAttendanceModal] =
    useState(false);

  // Load active rituals on mount
  useEffect(() => {
    loadActiveRituals();
  }, []);

  const loadActiveRituals = async () => {
    try {
      const activeRituals = await ritualService.getActiveRituals();
      setRituals(activeRituals);
    } catch (error) {
      console.error("Error loading rituals:", error);
      toast.error("Erro ao carregar rituais");
    }
  };

  const handleInitializeData = () => {
    if (onInitializeSampleData) {
      onInitializeSampleData();
      toast.success("Dados de exemplo carregados com sucesso!");
    }
  };

  const handleDeleteLeader = async (leaderId: string) => {
    try {
      await leaderService.delete(leaderId);
      toast.success("Líder removido com sucesso!");
      // Trigger parent refetch instead of reload
      window.location.reload();
    } catch (error) {
      console.error("Error deleting leader:", error);
      toast.error("Erro ao deletar líder");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Painel do Administrador</h1>
          <p className="text-muted-foreground">
            Controle total: líderes, tarefas, VARs e auditoria
          </p>
        </div>

        {leaders.length === 0 && onInitializeSampleData && (
          <Button
            onClick={handleInitializeData}
            variant="outline"
            className="gap-2"
          >
            <Database size={20} />
            Carregar Dados de Exemplo
          </Button>
        )}
      </div>

      {/* Estatísticas Gerais */}
      <AdminStats leaders={leaders} />

      <Tabs defaultValue="leaders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaders" className="flex items-center gap-2">
            <Users size={18} />
            Gerenciar Líderes
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <SoccerBall size={18} />
            Gerenciar Tasks
          </TabsTrigger>
          <TabsTrigger value="rituals" className="flex items-center gap-2">
            <CalendarCheck size={18} />
            Registrar Rituais
          </TabsTrigger>
          <TabsTrigger value="var" className="flex items-center gap-2">
            <VideoCamera size={18} />
            Sistema VAR
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ClockClockwise size={18} />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Gear size={18} />
            Regras de Pontuação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaders">
          <LeadersTab
            leaders={leaders}
            onCreateLeader={() => setShowCreateLeaderModal(true)}
            onUpdateLeader={onUpdateLeader}
            onDeleteLeader={handleDeleteLeader}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab
            tasks={tasks}
            onCreateTask={onCreateTask}
            onDeleteTask={onDeleteTask}
          />
        </TabsContent>

        <TabsContent value="rituals">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registro de Presença nos Rituais</CardTitle>
                    <CardDescription>
                      Registre a presença dos líderes nos rituais de forma
                      rápida e prática
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowRitualAttendanceModal(true)}
                    className="gap-2"
                  >
                    <CalendarCheck size={18} weight="bold" />
                    Registrar Presença
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Sistema de Pontuação:</strong> Presente = 1.0 ponto
                    | Atrasado = 0.5 ponto | Ausente = 0 pontos
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Os pontos de rituais são calculados com base na taxa de
                    presença dos últimos 30 dias.
                  </p>
                </div>
              </CardContent>
            </Card>

            <RitualAttendanceSummary leaders={leaders} />
          </div>
        </TabsContent>

        <TabsContent value="var">
          <VarAdminPanel adminId={adminId} />
        </TabsContent>

        <TabsContent value="audit">
          <ActivityTimeline limit={200} />
        </TabsContent>

        <TabsContent value="config">
          <ScoringConfigPanel />
        </TabsContent>
      </Tabs>

      {/* Modal de Cadastro de Líder */}
      <CreateLeaderModal
        isOpen={showCreateLeaderModal}
        onClose={() => setShowCreateLeaderModal(false)}
        onSuccess={() => {
          // Recarregar lista de líderes (será atualizado via real-time)
          toast.success("Líder cadastrado! Atualize a página para ver.");
        }}
      />

      {/* Modal de Registro de Presença em Rituais */}
      <RitualAttendanceModal
        isOpen={showRitualAttendanceModal}
        onClose={() => setShowRitualAttendanceModal(false)}
        leaders={leaders}
        rituals={rituals}
        onSuccess={() => {
          toast.success("Presenças registradas com sucesso!");
        }}
      />
    </div>
  );
}
