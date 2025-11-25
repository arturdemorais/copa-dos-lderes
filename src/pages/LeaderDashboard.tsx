import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendUp, ChartLine, Target, Medal } from "@phosphor-icons/react";
import { GoalCelebration } from "@/components/gamification/GoalCelebration";
import { InsightsPanel } from "@/components/analytics/InsightsPanel";
import { ComparativeAnalytics } from "@/components/analytics/ComparativeAnalytics";
import { ScoreBreakdown } from "@/components/analytics/ScoreBreakdown";
import type { Leader, Task } from "@/lib/types";
import { LeaderHeroCard } from "@/components/dashboard/LeaderHeroCard";
import { LeaderStatsRadar } from "@/components/dashboard/LeaderStatsRadar";
import { WeeklyMatches } from "@/components/dashboard/WeeklyMatches";
import { LeaderPodium } from "@/components/dashboard/LeaderPodium";
import { EnergyCard } from "@/components/dashboard/EnergyCard";
import { WeeklyQuestionCard } from "@/components/dashboard/WeeklyQuestionCard";
import { EnergyCheckInModal } from "@/components/modals/EnergyCheckInModal";
import { MoodCheckInModal } from "@/components/modals/MoodCheckInModal";
import { RandomFeedbackModal } from "@/components/modals/RandomFeedbackModal";
import { VorpCoinsCard } from "@/components/dashboard/VorpCoinsCard";
import { AttributeRankings } from "@/components/dashboard/AttributeRankings";
import { MonthlyChampions } from "@/components/dashboard/MonthlyChampions";
import { energyService } from "@/lib/services/energyService";
import { feedbackSuggestionService } from "@/lib/services/feedbackSuggestionService";

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
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    type: "task" | "badge" | "level-up" | "coins" | "champion";
    points: number;
    message?: string;
  }>({ type: "task", points: 0 });
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Check for energy check-in on mount
  useEffect(() => {
    checkEnergyCheckIn();
  }, []);

  // Check for random feedback suggestion
  useEffect(() => {
    const timer = setTimeout(() => {
      checkFeedbackSuggestion();
    }, 3000); // 3 seconds after login

    return () => clearTimeout(timer);
  }, []);

  const checkEnergyCheckIn = async () => {
    try {
      const todayCheckIn = await energyService.getTodayCheckIn(
        currentLeader.id
      );
      if (!todayCheckIn) {
        // Wait a bit before showing modal
        setTimeout(() => setShowEnergyModal(true), 1500);
      }
    } catch (error) {
      console.error("Error checking energy:", error);
    }
  };

  const checkFeedbackSuggestion = async () => {
    try {
      const shouldShow = await feedbackSuggestionService.shouldShowToday(
        currentLeader.id
      );
      if (shouldShow) {
        setShowFeedbackModal(true);
      }
    } catch (error) {
      console.error("Error checking feedback suggestion:", error);
    }
  };

  const handleTaskCheck = (taskId: string) => {
    // Verificar se a task está sendo completada ou desmarcada
    const task = tasks.find((t) => t.id === taskId);
    const isCompleting = task && !task.completed;

    onTaskComplete(taskId);

    // Só mostrar celebração se estiver COMPLETANDO (não desmarcando)
    if (isCompleting) {
      const points = task.points ?? 10;
      setCelebrationData({
        type: "task",
        points,
        message: task.title,
      });
      setShowCelebration(true);
    }
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <GoalCelebration
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
        type={celebrationData.type}
        points={celebrationData.points}
        message={celebrationData.message}
      />

      {/* Hero Section - Card de Jogador Estilo FIFA */}
      <LeaderHeroCard
        currentLeader={currentLeader}
        rankPosition={getRankPosition()}
        taskStreak={taskStreak}
        completionRate={completionRate}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="rankings" className="flex items-center gap-2">
            <Medal size={16} />
            <span className="hidden sm:inline">Rankings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Vorp Coins + Estádio Top 3 */}
          <div className="grid md:grid-cols-2 gap-5 items-stretch">
            <VorpCoinsCard
              leader={currentLeader}
              onShopClick={() => {
                // TODO: Implementar loja de prêmios
                console.log("Abrir loja de prêmios");
              }}
            />
            <LeaderPodium topThreeLeaders={topThreeLeaders} />
          </div>

          {/* Engagement Cards */}
          <div className="grid md:grid-cols-2 gap-5 items-stretch">
            <EnergyCard
              leaderId={currentLeader.id}
              onCheckInClick={() => setShowEnergyModal(true)}
            />
            <WeeklyQuestionCard leaderId={currentLeader.id} />
          </div>

          {/* Partidas da Semana (Tasks como Jogos) */}
          <WeeklyMatches
            tasks={tasks}
            completedTasks={completedTasks}
            onTaskCheck={handleTaskCheck}
          />

          <LeaderStatsRadar currentLeader={currentLeader} />
        </TabsContent>

        <TabsContent value="analytics">
          <ComparativeAnalytics leader={currentLeader} leaders={leaders} />
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-6">
            <InsightsPanel leader={currentLeader} leaders={leaders} />
            
            {/* Monthly Champions */}
            <MonthlyChampions
              champions={currentLeader.monthlyChampionships ?? []}
              currentYear={2026}
            />
          </div>
        </TabsContent>

        <TabsContent value="breakdown">
          <ScoreBreakdown leader={currentLeader} />
        </TabsContent>

        <TabsContent value="rankings">
          <AttributeRankings leaders={leaders} currentLeaderId={currentLeader.id} />
        </TabsContent>
      </Tabs>

      {/* Sprint 2: Modals */}
      <EnergyCheckInModal
        isOpen={showEnergyModal}
        onClose={() => setShowEnergyModal(false)}
        leaderId={currentLeader.id}
        onSuccess={() => {
          // Reload energy data
        }}
      />

      <MoodCheckInModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        leaderId={currentLeader.id}
        onSuccess={() => {
          // Reload mood data
        }}
      />

      <RandomFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        fromLeader={currentLeader}
        leaders={leaders.filter((l) => l.id !== currentLeader.id)}
        onSuccess={() => {
          // Refresh data
        }}
      />
    </div>
  );
}
