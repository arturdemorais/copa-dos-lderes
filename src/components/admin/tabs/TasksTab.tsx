import { useState, memo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Task } from "@/lib/types";

interface TasksTabProps {
  tasks: Task[];
  onCreateTask: (task: Omit<Task, "id" | "leaderId" | "completed">) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksTab = memo(function TasksTab({ tasks, onCreateTask, onDeleteTask }: TasksTabProps) {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    points: 0,
  });

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || newTask.points <= 0) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    onCreateTask(newTask);
    setNewTask({ title: "", description: "", points: 0 });
    toast.success("Task criada com sucesso!");
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Create Task Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={20} />
            Criar Nova Task
          </CardTitle>
          <CardDescription>Defina uma nova tarefa para os líderes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="task-description">Descrição</Label>
            <Textarea
              id="task-description"
              placeholder="Descreva a tarefa..."
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
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

          <Button onClick={handleCreateTask} className="w-full gap-2">
            <Plus size={18} />
            Criar Task
          </Button>
        </CardContent>
      </Card>

      {/* Active Tasks Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks Ativas da Semana</CardTitle>
          <CardDescription>Tarefas disponíveis para os líderes</CardDescription>
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
                    <Badge variant="secondary">+{task.points} pontos</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTask(task.id)}
                    aria-label="Deletar task"
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
  );
});
