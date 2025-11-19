import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  TrendUp,
  ChartLine,
  Target,
} from "@phosphor-icons/react";
import { Confetti } from "@/components/Confetti";
import { InsightsPanel } from "@/components/InsightsPanel";
import { ComparativeAnalytics } from "@/components/ComparativeAnalytics";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import type { Leader, Task } from "@/lib/types";
import { LeaderHeroCard } from "./dashboard/LeaderHeroCard";
import { LeaderStatsRadar } from "./dashboard/LeaderStatsRadar";
import { WeeklyMatches } from "./dashboard/WeeklyMatches";
import { LeaderPodium } from "./dashboard/LeaderPodium";
import { LeaderInterview } from "./dashboard/LeaderInterview";

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

  return (
    <div className="space-y-6">
      <Confetti
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Hero Section - Card de Jogador Estilo FIFA */}
      <LeaderHeroCard
        currentLeader={currentLeader}
        rankPosition={getRankPosition()}
        taskStreak={taskStreak}
        completionRate={completionRate}
      />

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
          <WeeklyMatches
            tasks={tasks}
            completedTasks={completedTasks}
            onTaskCheck={handleTaskCheck}
          />

          <LeaderStatsRadar currentLeader={currentLeader} />

          {/* Pódio e Entrevista */}
          <div className="grid md:grid-cols-2 gap-6">
            <LeaderPodium topThreeLeaders={topThreeLeaders} />
            <LeaderInterview />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <ComparativeAnalytics
            leader={currentLeader}
            leaders={leaders}
          />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsPanel leader={currentLeader} leaders={leaders} />
        </TabsContent>

        <TabsContent value="breakdown">
          <ScoreBreakdown leader={currentLeader} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
