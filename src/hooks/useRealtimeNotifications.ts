import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface NotificationEvent {
  type: "var_created" | "leader_updated" | "task_completed" | "ritual_registered";
  title: string;
  description: string;
  leaderId?: string;
  leaderName?: string;
}

export function useRealtimeNotifications(adminId: string) {
  useEffect(() => {
    // Subscribe to VAR requests
    const varChannel = supabase
      .channel("var_requests_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "var_requests",
        },
        (payload) => {
          const request = payload.new as any;
          toast.info("Nova Solicitação VAR", {
            description: `${request.leader_name || "Um líder"} solicitou revisão`,
            action: {
              label: "Ver",
              onClick: () => {
                // This will be handled by the parent component
                window.dispatchEvent(
                  new CustomEvent("navigate-to-var", { detail: request.id })
                );
              },
            },
            duration: 5000,
          });
        }
      )
      .subscribe();

    // Subscribe to task completions
    const taskChannel = supabase
      .channel("task_completions_notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
          filter: "completed=eq.true",
        },
        (payload) => {
          const task = payload.new as any;
          if (task.completed && !payload.old.completed) {
            toast.success("Task Completada!", {
              description: `${task.title} foi concluída`,
              duration: 3000,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to ritual attendance
    const ritualChannel = supabase
      .channel("ritual_attendance_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ritual_attendance",
        },
        (payload) => {
          const attendance = payload.new as any;
          // Only notify for bulk registrations (admin action)
          // We can add a debounce or batch notifications here if needed
        }
      )
      .subscribe();

    // Subscribe to leader updates (for significant changes)
    const leaderChannel = supabase
      .channel("leader_updates_notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "leaders",
        },
        (payload) => {
          const newLeader = payload.new as any;
          const oldLeader = payload.old as any;

          // Notify on significant overall changes (e.g., +/- 10 points)
          if (Math.abs(newLeader.overall - oldLeader.overall) >= 10) {
            const isIncrease = newLeader.overall > oldLeader.overall;
            toast(
              isIncrease ? "Líder em Destaque! 🚀" : "Atenção Necessária ⚠️",
              {
                description: `${newLeader.name}: ${oldLeader.overall} → ${newLeader.overall} pts`,
                duration: 4000,
              }
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(varChannel);
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(ritualChannel);
      supabase.removeChannel(leaderChannel);
    };
  }, [adminId]);
}
