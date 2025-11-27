import type { Leader, ScoreWeights, ScoreHistory, Insight } from "./types";
import type { ScoringConfig } from "./services/configService";

export const DEFAULT_WEIGHTS: ScoreWeights = {
  tasks: 0.4,
  assists: 0.15,
  rituals: 0.15,
  consistency: 0.05,
};

export function calculateOverallScore(
  leader: Leader,
  config?: ScoringConfig
): number {
  const multipliers = config?.multipliers || {
    tasks: 1,
    assists: 1,
    rituals: 1,
    consistency: 1,
  };

  // Overall é a soma dos pontos ponderada pelos multiplicadores
  const baseScore =
    (leader.taskPoints ?? 0) * multipliers.tasks +
    (leader.assistPoints ?? 0) * multipliers.assists +
    (leader.ritualPoints ?? 0) * multipliers.rituals +
    (leader.consistencyScore ?? 0) * 100 * multipliers.consistency; // Consistency é 0-1, multiplicamos por 100

  return Math.round(baseScore);
}

export function calculateConsistencyScore(history: ScoreHistory[]): number {
  if (history.length < 2) return 0;

  const recentHistory = history.slice(-4);
  const scores = recentHistory.map((h) => h.overall);

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
    scores.length;
  const stdDev = Math.sqrt(variance);

  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
  const consistencyScore = Math.max(0, 1 - coefficientOfVariation);

  return consistencyScore;
}

export function calculateMomentum(history: ScoreHistory[]): number {
  if (history.length < 2) return 0;

  const recentHistory = history.slice(-3);
  let totalChange = 0;

  for (let i = 1; i < recentHistory.length; i++) {
    totalChange += recentHistory[i].overall - recentHistory[i - 1].overall;
  }

  return totalChange / (recentHistory.length - 1);
}

export function calculateTrend(
  momentum: number
): "rising" | "falling" | "stable" {
  if (momentum > 10) return "rising";
  if (momentum < -10) return "falling";
  return "stable";
}

export function calculateRankChange(
  leaders: Leader[],
  currentLeader: Leader
): number {
  const sortedCurrent = [...leaders].sort(
    (a, b) => (b.overall ?? 0) - (a.overall ?? 0)
  );
  const currentRank = sortedCurrent.findIndex((l) => l.id === currentLeader.id);

  if (!currentLeader.history || currentLeader.history.length < 2) return 0;

  const previousWeekScore =
    currentLeader.history[currentLeader.history.length - 2].overall;
  const leadersWithPreviousScores = leaders.map((l) => ({
    id: l.id,
    score:
      l.history && l.history.length >= 2
        ? l.history[l.history.length - 2].overall
        : l.overall ?? 0,
  }));

  const sortedPrevious = leadersWithPreviousScores.sort(
    (a, b) => b.score - a.score
  );
  const previousRank = sortedPrevious.findIndex(
    (l) => l.id === currentLeader.id
  );

  return previousRank - currentRank;
}

export function generateInsights(leader: Leader, leaders: Leader[]): Insight[] {
  const insights: Insight[] = [];

  const avgTaskPoints =
    leaders.reduce((sum, l) => sum + (l.taskPoints ?? 0), 0) / leaders.length;
  const avgAssistPoints =
    leaders.reduce((sum, l) => sum + (l.assistPoints ?? 0), 0) / leaders.length;

  const leaderTaskPoints = leader.taskPoints ?? 0;
  const leaderAssistPoints = leader.assistPoints ?? 0;

  if (leaderTaskPoints > avgTaskPoints * 1.2) {
    insights.push({
      type: "positive",
      category: "Tarefas",
      message: `Você está ${Math.round(
        (leaderTaskPoints / avgTaskPoints - 1) * 100
      )}% acima da média em tarefas completadas!`,
      actionable: "Continue mantendo esse ritmo de execução",
    });
  } else if (leaderTaskPoints < avgTaskPoints * 0.8) {
    insights.push({
      type: "warning",
      category: "Tarefas",
      message: `Suas tarefas estão ${Math.round(
        (1 - leaderTaskPoints / avgTaskPoints) * 100
      )}% abaixo da média`,
      actionable: "Priorize completar as tarefas pendentes desta semana",
    });
  }

  if (leaderAssistPoints < 10) {
    insights.push({
      type: "neutral",
      category: "Colaboração",
      message: "Oportunidade de aumentar suas assistências",
      actionable: "Avalie colegas que fizeram um bom trabalho esta semana",
    });
  }

  const leaderMomentum = leader.momentum ?? 0;
  if (leaderMomentum > 20) {
    insights.push({
      type: "positive",
      category: "Momentum",
      message:
        "Em alta! Você está ganhando +" +
        Math.round(leaderMomentum) +
        " pontos por semana",
      actionable: "Mantenha o ritmo para subir no ranking",
    });
  } else if (leaderMomentum < -20) {
    insights.push({
      type: "warning",
      category: "Momentum",
      message:
        "Cuidado: você está perdendo -" +
        Math.abs(Math.round(leaderMomentum)) +
        " pontos por semana",
      actionable: "Revise suas prioridades e foque nas áreas principais",
    });
  }

  const leaderConsistencyScore = leader.consistencyScore ?? 0;
  if (leaderConsistencyScore > 0.8) {
    insights.push({
      type: "positive",
      category: "Consistência",
      message: "Performance muito consistente! Isso conta no overall",
      actionable: "Continue mantendo esse padrão estável",
    });
  }

  return insights;
}

export function calculateAttributeImpact(
  currentValue: number,
  change: number,
  weight: number = 1
): number {
  return Math.round((currentValue + change) * weight);
}

export function getPerformanceCategory(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 90)
    return {
      label: "Lendário",
      color: "text-accent",
      description: "Performance excepcional em todas as áreas",
    };
  if (score >= 80)
    return {
      label: "Elite",
      color: "text-primary",
      description: "Consistentemente acima das expectativas",
    };
  if (score >= 70)
    return {
      label: "Starter",
      color: "text-secondary",
      description: "Sólido desempenho com oportunidades de crescimento",
    };
  if (score >= 60)
    return {
      label: "Em Desenvolvimento",
      color: "text-muted-foreground",
      description: "Bom potencial, precisa focar em áreas-chave",
    };
  return {
    label: "Atenção Necessária",
    color: "text-destructive",
    description: "Necessita suporte e ajustes nas prioridades",
  };
}

export function getTeamBenchmarks(leaders: Leader[], team: string) {
  const teamLeaders = leaders.filter((l) => l.team === team);

  if (teamLeaders.length === 0) return null;

  return {
    avgOverall:
      teamLeaders.reduce((sum, l) => sum + (l.overall ?? 0), 0) /
      teamLeaders.length,
    avgTaskPoints:
      teamLeaders.reduce((sum, l) => sum + (l.taskPoints ?? 0), 0) /
      teamLeaders.length,
    topPerformer: teamLeaders.reduce(
      (top, l) => ((l.overall ?? 0) > (top.overall ?? 0) ? l : top),
      teamLeaders[0]
    ),
  };
}

export function predictNextWeekScore(leader: Leader): {
  predicted: number;
  confidence: number;
} {
  if (!leader.history || leader.history.length < 3) {
    return { predicted: leader.overall ?? 0, confidence: 0.3 };
  }

  const trend = leader.momentum ?? 0;
  const predicted = Math.round((leader.overall ?? 0) + trend);

  const confidence = Math.min(0.9, (leader.consistencyScore ?? 0) * 0.8 + 0.2);

  return { predicted, confidence };
}
