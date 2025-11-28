import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  SoccerBall,
  CalendarCheck,
  Plus,
  Pencil,
  Trash,
  Database,
  UserPlus,
  Upload,
  X,
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
import type { Leader, Task, Ritual } from "@/lib/types";
import { createSampleLeaders } from "@/lib/sampleData";
import { toast } from "sonner";
import { leaderService, ritualService } from "@/lib/services";
import type { AttendanceStatus } from "@/lib/types";
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "@/lib/services/leaderService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deletingLeader, setDeletingLeader] = useState<Leader | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    points: 0,
  });
  const [showCreateLeaderModal, setShowCreateLeaderModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ritual attendance state
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [showRitualAttendanceModal, setShowRitualAttendanceModal] = useState(false);

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

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || newTask.points <= 0) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    onCreateTask(newTask);
    setNewTask({ title: "", description: "", points: 0 });
    toast.success("Task criada com sucesso!");
  };

  const handleUpdateLeader = () => {
    if (!editingLeader) return;
    onUpdateLeader(editingLeader);
    setEditModalOpen(false);
    
    // Limpar estados após a animação de fechamento do modal (300ms)
    setTimeout(() => {
      setEditingLeader(null);
      setPhotoPreview(null);
    }, 300);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingLeader) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);

      // Delete old photo if exists
      if (editingLeader.photo) {
        await deleteProfilePhoto(editingLeader.photo);
      }

      // Upload new photo
      const photoUrl = await uploadProfilePhoto(file, editingLeader.id);

      // Update leader with new photo URL
      setEditingLeader({
        ...editingLeader,
        photo: photoUrl,
      });

      setPhotoPreview(photoUrl);
      toast.success("Foto atualizada com sucesso! 📸");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!editingLeader) return;

    try {
      if (editingLeader.photo) {
        await deleteProfilePhoto(editingLeader.photo);
      }

      setEditingLeader({
        ...editingLeader,
        photo: undefined,
      });

      setPhotoPreview(null);
      toast.success("Foto removida com sucesso");
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error("Erro ao remover foto");
    }
  };

  const handleInitializeData = () => {
    if (onInitializeSampleData) {
      onInitializeSampleData();
      toast.success("Dados de exemplo carregados com sucesso!");
    }
  };

  const handleDeleteLeader = async () => {
    if (!deletingLeader) return;

    try {
      await leaderService.delete(deletingLeader.id);
      toast.success(`${deletingLeader.name} foi removido com sucesso!`);
      setDeletingLeader(null);
      // Forçar refresh da página para atualizar lista
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Líderes Cadastrados</CardTitle>
                  <CardDescription>
                    Visualize e edite os perfis dos líderes
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateLeaderModal(true)}
                  className="gap-2"
                >
                  <UserPlus size={18} weight="bold" />
                  Cadastrar Líder
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Foto</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Posição</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaders.map((leader) => (
                      <TableRow key={leader.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={leader.photo} alt={leader.name} />
                            <AvatarFallback>
                              {leader.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          {leader.name}
                        </TableCell>
                        <TableCell>{leader.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{leader.team}</Badge>
                        </TableCell>
                        <TableCell>{leader.position}</TableCell>
                        <TableCell>
                          <span className="font-bold">{leader.overall}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog
                              open={editModalOpen}
                              onOpenChange={setEditModalOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingLeader(leader);
                                    setEditModalOpen(true);
                                  }}
                                >
                                  <Pencil size={16} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Editar Perfil do Líder
                                  </DialogTitle>
                                </DialogHeader>
                                {editingLeader && (
                                  <div className="space-y-4">
                                    {/* Photo Upload Section */}
                                    <div className="flex flex-col items-center gap-4 pb-4 border-b">
                                      <Avatar className="h-24 w-24">
                                        <AvatarImage
                                          src={
                                            photoPreview || editingLeader.photo
                                          }
                                          alt={editingLeader.name}
                                        />
                                        <AvatarFallback className="text-2xl">
                                          {editingLeader.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>

                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            fileInputRef.current?.click()
                                          }
                                          disabled={uploadingPhoto}
                                          className="gap-2"
                                        >
                                          <Upload size={16} />
                                          {uploadingPhoto
                                            ? "Enviando..."
                                            : "Enviar Foto"}
                                        </Button>

                                        {(editingLeader.photo ||
                                          photoPreview) && (
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRemovePhoto}
                                            className="gap-2 text-destructive"
                                          >
                                            <X size={16} />
                                            Remover
                                          </Button>
                                        )}
                                      </div>

                                      <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                      />

                                      <p className="text-xs text-muted-foreground text-center">
                                        JPG, PNG ou GIF. Máximo 5MB.
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Nome</Label>
                                        <Input
                                          value={editingLeader.name}
                                          onChange={(e) =>
                                            setEditingLeader({
                                              ...editingLeader,
                                              name: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div>
                                        <Label>Email</Label>
                                        <Input
                                          value={editingLeader.email}
                                          onChange={(e) =>
                                            setEditingLeader({
                                              ...editingLeader,
                                              email: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Time</Label>
                                        <Input
                                          value={editingLeader.team}
                                          onChange={(e) =>
                                            setEditingLeader({
                                              ...editingLeader,
                                              team: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div>
                                        <Label>Posição</Label>
                                        <Input
                                          value={editingLeader.position}
                                          onChange={(e) =>
                                            setEditingLeader({
                                              ...editingLeader,
                                              position: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label>
                                        Pontos Fortes (separados por vírgula)
                                      </Label>
                                      <Textarea
                                        value={editingLeader.strengths.join(
                                          ", "
                                        )}
                                        onChange={(e) =>
                                          setEditingLeader({
                                            ...editingLeader,
                                            strengths: e.target.value
                                              .split(",")
                                              .map((s) => s.trim()),
                                          })
                                        }
                                      />
                                    </div>

                                    <div>
                                      <Label>
                                        Pontos a Desenvolver (separados por
                                        vírgula)
                                      </Label>
                                      <Textarea
                                        value={editingLeader.improvements.join(
                                          ", "
                                        )}
                                        onChange={(e) =>
                                          setEditingLeader({
                                            ...editingLeader,
                                            improvements: e.target.value
                                              .split(",")
                                              .map((s) => s.trim()),
                                          })
                                        }
                                      />
                                    </div>

                                    <Button
                                      onClick={handleUpdateLeader}
                                      className="w-full"
                                    >
                                      Salvar Alterações
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingLeader(leader)}
                                >
                                  <Trash
                                    size={16}
                                    className="text-destructive"
                                  />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Deletar Líder?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover{" "}
                                    <strong>{leader.name}</strong>? Esta ação
                                    não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setDeletingLeader(null)}
                                  >
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteLeader}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Deletar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} />
                  Criar Nova Task
                </CardTitle>
                <CardDescription>
                  Defina uma nova tarefa para os líderes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Título da Task</Label>
                  <Input
                    id="task-title"
                    placeholder="Ex: Realizar 1-on-1 com o time"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="task-description">Descrição</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Descreva a tarefa..."
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="task-points">Pontos de Overall</Label>
                  <Input
                    id="task-points"
                    type="number"
                    placeholder="Ex: 50"
                    value={newTask.points || ""}
                    onChange={(e) =>
                      setNewTask({ ...newTask, points: Number(e.target.value) })
                    }
                  />
                </div>

                <Button onClick={handleCreateTask} className="w-full">
                  <Plus size={18} />
                  Criar Task
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks Ativas da Semana</CardTitle>
                <CardDescription>
                  Tarefas disponíveis para os líderes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma task cadastrada ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 border rounded-lg flex items-start justify-between gap-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{task.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                          <Badge variant="secondary">
                            +{task.points} pontos
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rituals">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registro de Presença nos Rituais</CardTitle>
                  <CardDescription>
                    Registre a presença dos líderes nos rituais de forma rápida e prática
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
              <div className="text-center py-12">
                <CalendarCheck size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Clique em "Registrar Presença" para começar
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Escolha o ritual e marque rapidamente a presença, atraso ou ausência de cada líder.
                  Os pontos serão calculados automaticamente com base na taxa de presença.
                </p>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Sistema de Pontuação:</strong> Presente = 1.0 ponto |
                  Atrasado = 0.5 ponto | Ausente = 0 pontos
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Os pontos de rituais são calculados com base na taxa de presença dos últimos 30 dias.
                </p>
              </div>
            </CardContent>
          </Card>
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
