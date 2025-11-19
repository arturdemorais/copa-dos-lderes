import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SoccerBall } from "@phosphor-icons/react";
import type { Task } from "@/lib/types";

interface WeeklyMatchesProps {
  tasks: Task[];
  completedTasks: number;
  onTaskCheck: (taskId: string) => void;
}

export function WeeklyMatches({ tasks, completedTasks, onTaskCheck }: WeeklyMatchesProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <SoccerBall weight="fill" className="text-primary" size={24} />
            Partidas da Semana
          </CardTitle>
          <Badge variant="outline" className="text-lg font-bold">
            {completedTasks}/{tasks.length} vitórias
          </Badge>
        </div>
        <CardDescription>
          Complete as partidas para somar pontos ao overall
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ⚽
            </motion.div>
            <p className="text-muted-foreground">
              Aguardando as partidas da rodada...
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {tasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.9, height: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  layout
                >
                  <motion.div
                    whileHover={{ scale: 1.01, x: 8 }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      task.completed
                        ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    {/* Placar de Jogo */}
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="flex-shrink-0"
                      >
                        <Checkbox
                          id={task.id}
                          checked={task.completed}
                          onCheckedChange={() => onTaskCheck(task.id)}
                          className="h-6 w-6"
                        />
                      </motion.div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <label
                            htmlFor={task.id}
                            className={`font-semibold cursor-pointer ${
                              task.completed
                                ? "line-through text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {task.title}
                          </label>
                          {task.completed && (
                            <motion.span
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 200,
                              }}
                              className="text-xl"
                            >
                              ✅
                            </motion.span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={task.completed ? "secondary" : "default"}
                          className="text-lg font-bold px-3 py-1"
                        >
                          +{task.points}
                        </Badge>
                        <div className="text-3xl">
                          {task.completed ? "🏆" : "⚔️"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
