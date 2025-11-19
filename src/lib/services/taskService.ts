import { supabase } from "../supabaseClient";
import type { Task } from "../types";

export const taskService = {
  /**
   * Buscar todas as tasks ativas
   */
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map(this.mapToTask);
  },

  /**
   * Buscar tasks por líder (com status de conclusão)
   */
  async getByLeader(leaderId: string): Promise<Task[]> {
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_active", true);

    if (tasksError) throw tasksError;

    // Buscar conclusões deste líder
    const { data: completions, error: completionsError } = await supabase
      .from("task_completions")
      .select("*")
      .eq("leader_id", leaderId);

    if (completionsError) throw completionsError;

    const completionMap = new Map(
      (completions || []).map((c) => [c.task_id, c.completed])
    );

    return (tasks || []).map((task) => ({
      ...this.mapToTask(task),
      completed: completionMap.get(task.id) || false,
      leaderId,
    }));
  },

  /**
   * Criar nova task
   */
  async create(
    task: Omit<Task, "id" | "completed" | "leaderId">,
    createdBy?: string
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        description: task.description,
        points: task.points,
        week_number: 1, // Pode ser dinâmico
        created_by: createdBy,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToTask(data);
  },

  /**
   * Completar task para um líder
   */
  async complete(taskId: string, leaderId: string): Promise<void> {
    // Primeiro verificar se a task existe
    const { data: taskExists } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", taskId)
      .eq("is_active", true)
      .single();

    if (!taskExists) {
      throw new Error("Task não encontrada ou inativa");
    }

    // Agora fazer o upsert
    const { error } = await supabase.from("task_completions").upsert(
      {
        task_id: taskId,
        leader_id: leaderId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: "task_id,leader_id",
      }
    );

    if (error) throw error;
  },

  /**
   * Desmarcar task (remover completion)
   */
  async uncomplete(taskId: string, leaderId: string): Promise<void> {
    const { error } = await supabase
      .from("task_completions")
      .delete()
      .eq("task_id", taskId)
      .eq("leader_id", leaderId);

    // Ignore error if no rows found (already uncompleted)
    if (error && error.code !== "PGRST116") {
      throw error;
    }
  },

  /**
   * Deletar task (desativa)
   */
  async delete(taskId: string): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .update({ is_active: false })
      .eq("id", taskId);

    if (error) throw error;
  },

  /**
   * Mapear row do banco para Task
   */
  mapToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      points: row.points,
      completed: false,
      leaderId: "",
    };
  },

  /**
   * Subscribe to real-time changes
   */
  subscribeToChanges(callback: (tasks: Task[]) => void) {
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        async () => {
          const tasks = await this.getAll();
          callback(tasks);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
