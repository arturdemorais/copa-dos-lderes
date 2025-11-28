import { memo, useCallback } from "react";
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
import type { Leader, Task } from "@/lib/types";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
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
  onRefetchLeaders?: () => void; // Callback para refetch sem reload
  adminId: string; // ID do admin para painel VAR
}

export const AdminDashboard = memo(function AdminDashboard({
  leaders,
  tasks,
  onUpdateLeader,
  onCreateTask,
  onDeleteTask,
  onInitializeSampleData,
  onRefetchLeaders,
  adminId,
}: AdminDashboardProps) {
  const {
    rituals,
    isLoadingRituals,
    showCreateLeaderModal,
    showRitualAttendanceModal,
    handleDeleteLeader,
    handleInitializeData,
    openCreateLeaderModal,
    closeCreateLeaderModal,
    openRitualAttendanceModal,
    closeRitualAttendanceModal,
    handleCreateLeaderSuccess,
    handleRitualAttendanceSuccess,
  } = useAdminDashboard({ onRefetchLeaders });

  // Wrap callbacks to ensure stable references
  const handleInitializeDataClick = useCallback(() => {
    handleInitializeData(onInitializeSampleData);
  }, [handleInitializeData, onInitializeSampleData]);

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
            onClick={handleInitializeDataClick}
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
            onCreateLeader={openCreateLeaderModal}
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
                    onClick={openRitualAttendanceModal}
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
        onClose={closeCreateLeaderModal}
        onSuccess={handleCreateLeaderSuccess}
      />

      {/* Modal de Registro de Presença em Rituais */}
      <RitualAttendanceModal
        isOpen={showRitualAttendanceModal}
        onClose={closeRitualAttendanceModal}
        leaders={leaders}
        rituals={rituals}
        onSuccess={handleRitualAttendanceSuccess}
      />
    </div>
  );
});
