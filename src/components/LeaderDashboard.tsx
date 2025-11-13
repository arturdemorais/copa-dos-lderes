import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  SoccerBall,
  Users,
  Lightbulb,
  CheckCircle,
  TrendUp,
  ChartLine,
  Target,
  Star,
  Fire,
} from "@phosphor-icons/react";
import { Confetti } from "@/components/Confetti";
import { InsightsPanel } from "@/components/InsightsPanel";
import { PerformanceChart } from "@/components/PerformanceChart";
import { ComparativeAnalytics } from "@/components/ComparativeAnalytics";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import type { Leader, Task } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderDashboardProps {
  currentLeader: Leader;
  tasks: Task[];
  leaders: Leader[];
  onTaskComplete: (taskId: string) => void;
}

export function LeaderDashboard({
  currentLeader,
  tasks,
  leaders,
  onTaskComplete,
}: LeaderDashboardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const handleTaskCheck = (taskId: string) => {
    onTaskComplete(taskId);
    setShowConfetti(true);
  };

  const topThreeLeaders = leaders
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    .slice(0, 3);

  const getRankPosition = () => {
    const sorted = [...leaders].sort(
      (a, b) => (b.overall ?? 0) - (a.overall ?? 0)
    );
    return sorted.findIndex((l) => l.id === currentLeader.id) + 1;
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskStreak = completedTasks >= 3 ? completedTasks : 0;
  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const icebreaker = {
    question: "Se sua equipe fosse um time de futebol, qual seria o mascote?",
    subtext: "Compartilhe no canal #copa-dos-lideres",
  };

  const getOverallColor = (overall: number) => {
    if (overall >= 90) return "from-yellow-500 to-amber-600";
    if (overall >= 80) return "from-emerald-500 to-green-600";
    if (overall >= 70) return "from-blue-500 to-indigo-600";
    return "from-slate-500 to-gray-600";
  };

  const getPositionEmoji = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    if (position <= 10) return "⭐";
    return "💪";
  };

  return (
    <div className="space-y-6">
      <Confetti
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Hero Section - Card de Jogador Estilo FIFA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl blur-2xl" />

        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-accent to-transparent" />

          <CardContent className="p-6">
            <div className="grid md:grid-cols-[300px_1fr] gap-6">
              {/* Card de Jogador 3D */}
              <motion.div
                whileHover={{ rotateY: 5, scale: 1.02 }}
                style={{ perspective: 1000 }}
                className="relative"
              >
                <div
                  className={`relative bg-gradient-to-br ${getOverallColor(
                    currentLeader.overall ?? 0
                  )} rounded-xl p-6 text-white shadow-2xl`}
                >
                  {/* Efeito holográfico */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%"],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <motion.div
                          className="text-6xl font-black mb-1"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {currentLeader.overall ?? 0}
                        </motion.div>
                        <div className="text-xs uppercase tracking-wider opacity-90">
                          {currentLeader.position}
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Trophy
                          weight="fill"
                          size={32}
                          className="opacity-80"
                        />
                      </motion.div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-2xl font-bold">
                        {currentLeader.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-white/30"
                        >
                          {currentLeader.team}
                        </Badge>
                        <span className="text-2xl">
                          {getPositionEmoji(getRankPosition())}
                        </span>
                      </div>
                    </div>

                    {/* Mini Stats em Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-black/20 rounded p-2">
                        <div className="text-xl font-bold">
                          {currentLeader.taskPoints}
                        </div>
                        <div className="text-xs opacity-80">Tarefas</div>
                      </div>
                      <div className="bg-black/20 rounded p-2">
                        <div className="text-xl font-bold">
                          {(currentLeader.fanScore ?? 0).toFixed(1)}
                        </div>
                        <div className="text-xs opacity-80">Torcida</div>
                      </div>
                      <div className="bg-black/20 rounded p-2">
                        <div className="text-xl font-bold">
                          {currentLeader.assistPoints}
                        </div>
                        <div className="text-xs opacity-80">Assists</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats e Informações Principais */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                    Bem-vindo de volta, {currentLeader.name.split(" ")[0]}!
                    <motion.span
                      animate={{ rotate: [0, 14, -14, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      👋
                    </motion.span>
                  </h1>
                  <p className="text-muted-foreground">
                    Você está na <strong>{getRankPosition()}ª posição</strong>{" "}
                    do campeonato
                  </p>
                </div>

                {/* Campo Tático - Posição Visual */}
                <div className="bg-gradient-to-b from-green-600/10 to-green-800/10 rounded-lg p-4 border border-green-600/20 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
                    <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-2">
                        Sua Posição no Campo
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-4xl"
                        >
                          ⚽
                        </motion.div>
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {getRankPosition()}º lugar
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {currentLeader.rankChange > 0 &&
                              `↗ Subiu ${currentLeader.rankChange} ${
                                currentLeader.rankChange === 1
                                  ? "posição"
                                  : "posições"
                              }`}
                            {currentLeader.rankChange < 0 &&
                              `↘ Caiu ${Math.abs(currentLeader.rankChange)} ${
                                Math.abs(currentLeader.rankChange) === 1
                                  ? "posição"
                                  : "posições"
                              }`}
                            {currentLeader.rankChange === 0 &&
                              "━ Manteve a posição"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {taskStreak > 0 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg p-4 shadow-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Fire weight="fill" size={24} />
                          <div>
                            <div className="text-xl font-bold">
                              {taskStreak}x
                            </div>
                            <div className="text-xs">STREAK</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Progress Bars Modernos */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Conclusão</span>
                      <span className="text-xl font-bold text-primary">
                        {completionRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Momentum</span>
                      <span className="text-xl font-bold text-accent">
                        {currentLeader.momentum > 0 ? "+" : ""}
                        {Math.round(currentLeader.momentum ?? 0)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            100,
                            Math.abs(currentLeader.momentum ?? 0) * 2
                          )}%`,
                        }}
                        transition={{
                          duration: 1,
                          ease: "easeOut",
                          delay: 0.2,
                        }}
                        className={`h-full ${
                          (currentLeader.momentum ?? 0) > 0
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-gradient-to-r from-red-500 to-orange-600"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Trophy size={16} />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <ChartLine size={16} />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendUp size={16} />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <Target size={16} />
            <span className="hidden sm:inline">Pontuação</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Partidas da Semana (Tasks como Jogos) */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <SoccerBall
                    weight="fill"
                    className="text-primary"
                    size={24}
                  />
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
                                onCheckedChange={() => handleTaskCheck(task.id)}
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
                                variant={
                                  task.completed ? "secondary" : "default"
                                }
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

          <div className="grid md:grid-cols-3 gap-6">
            {/* Radar de Atributos Interativo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target weight="fill" className="text-primary" size={24} />
                    Seus Atributos de Liderança
                  </CardTitle>
                  <CardDescription>
                    Clique em um atributo para ver detalhes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {[
                        {
                          key: "communication",
                          label: "Comunicação",
                          value: currentLeader.attributes?.communication ?? 0,
                          icon: "💬",
                        },
                        {
                          key: "technique",
                          label: "Técnica",
                          value: currentLeader.attributes?.technique ?? 0,
                          icon: "⚙️",
                        },
                        {
                          key: "management",
                          label: "Gestão",
                          value: currentLeader.attributes?.management ?? 0,
                          icon: "📊",
                        },
                        {
                          key: "pace",
                          label: "Ritmo",
                          value: currentLeader.attributes?.pace ?? 0,
                          icon: "⚡",
                        },
                      ].map((attr, idx) => (
                        <motion.div
                          key={attr.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          onClick={() => setSelectedStat(attr.key)}
                          className={`cursor-pointer p-3 rounded-lg transition-all ${
                            selectedStat === attr.key
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-muted/30 border-2 border-transparent hover:border-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{attr.icon}</span>
                              <span className="font-medium">{attr.label}</span>
                            </div>
                            <span className="text-2xl font-bold text-primary">
                              {attr.value}
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${attr.value}%` }}
                              transition={{
                                duration: 1,
                                delay: 0.6 + idx * 0.1,
                              }}
                              className="h-full bg-gradient-to-r from-primary to-accent"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 30,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="relative w-48 h-48"
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl" />
                        <div className="absolute inset-4 rounded-full bg-card border-4 border-primary/30 flex items-center justify-center">
                          <div className="text-center">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-5xl mb-2"
                            >
                              🎯
                            </motion.div>
                            <div className="text-sm font-medium text-muted-foreground">
                              Média Geral
                            </div>
                            <div className="text-3xl font-bold text-primary">
                              {Math.round(
                                ((currentLeader.attributes?.communication ??
                                  0) +
                                  (currentLeader.attributes?.technique ?? 0) +
                                  (currentLeader.attributes?.management ?? 0) +
                                  (currentLeader.attributes?.pace ?? 0)) /
                                  4
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pontos Fortes e Melhorias */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star weight="fill" className="text-accent" size={24} />
                    Destaques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                      <span>💪</span> Pontos Fortes
                    </div>
                    <div className="space-y-2">
                      {(currentLeader.strengths ?? [])
                        .slice(0, 3)
                        .map((strength, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-primary mt-0.5">✓</span>
                            <span>{strength}</span>
                          </motion.div>
                        ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                      <span>🎯</span> Em Desenvolvimento
                    </div>
                    <div className="space-y-2">
                      {(currentLeader.improvements ?? [])
                        .slice(0, 3)
                        .map((improvement, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + idx * 0.1 }}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-secondary mt-0.5">→</span>
                            <span>{improvement}</span>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Pódio e Entrevista */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pódio do Estádio */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <Trophy weight="fill" className="text-accent" size={24} />
                  Estádio - Top 3
                </CardTitle>
                <CardDescription>
                  Os melhores técnicos da temporada
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {topThreeLeaders.map((leader, idx) => (
                    <motion.div
                      key={leader.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.03, x: 6 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors group"
                    >
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        className={`
                          text-2xl font-bold w-8 h-8 rounded-full flex items-center justify-center
                          ${
                            idx === 0
                              ? "bg-accent text-accent-foreground shadow-lg shadow-accent/40"
                              : ""
                          }
                          ${
                            idx === 1
                              ? "bg-muted-foreground/20 text-foreground"
                              : ""
                          }
                          ${idx === 2 ? "bg-primary/20 text-primary" : ""}
                        `}
                      >
                        {idx + 1}
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-medium">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {leader.team}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {leader.overall ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">pts</p>
                      </div>
                      {idx === 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Star
                            weight="fill"
                            className="text-accent"
                            size={20}
                          />
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Entrevista Pós-Jogo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 relative overflow-hidden group hover:shadow-lg hover:shadow-accent/20 transition-all h-full">
                <motion.div
                  aria-hidden
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 2,
                  }}
                />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent-foreground">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      <Lightbulb
                        weight="fill"
                        className="text-accent"
                        size={24}
                      />
                    </motion.span>
                    Entrevista Pós-Jogo
                  </CardTitle>
                  <CardDescription>
                    Pergunta da semana para o time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-3xl"
                      >
                        🎤
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          {icebreaker.question}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {icebreaker.subtext}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <PerformanceChart leader={currentLeader} />
            <ComparativeAnalytics leader={currentLeader} leaders={leaders} />
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <InsightsPanel leader={currentLeader} leaders={leaders} />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <ScoreBreakdown leader={currentLeader} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
