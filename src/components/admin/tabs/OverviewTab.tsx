import { memo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendUp,
  TrendDown,
  Users,
  CheckCircle,
  Warning,
  Clock,
  Trophy,
  Target,
} from "@phosphor-icons/react";
import type { Leader } from "@/lib/types";
import { PerformanceChart } from "@/components/admin/PerformanceChart";
import { DashboardOverviewSkeleton } from "../SkeletonLoaders";

interface OverviewTabProps {
  leaders: Leader[];
  pendingVarsCount?: number;
  onNavigateToVar?: () => void;
  onNavigateToLeaders?: () => void;
  isLoading?: boolean;
}

export const OverviewTab = memo(function OverviewTab({
  leaders,
  pendingVarsCount = 0,
  onNavigateToVar,
  onNavigateToLeaders,
  isLoading = false,
}: OverviewTabProps) {
  // Show skeleton while loading
  if (isLoading) {
    return <DashboardOverviewSkeleton />;
  }
  // Filtrar apenas líderes que participam da gamificação
  const gamificationLeaders = leaders.filter(
    (l) => !l.email?.includes("@admin") && l.team !== "Admin"
  );

  // Estatísticas rápidas
  const topPerformers = [...gamificationLeaders]
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
    .slice(0, 5);

  const risingStars = gamificationLeaders.filter((l) => l.trend === "rising");
  const needsAttention = gamificationLeaders.filter(
    (l) => l.trend === "falling" || (l.overall ?? 0) < 50
  );

  const avgOverall =
    gamificationLeaders.length > 0
      ? gamificationLeaders.reduce((sum, l) => sum + (l.overall ?? 0), 0) /
        gamificationLeaders.length
      : 0;

  const quickStats = [
    {
      label: "Líderes Ativos",
      value: gamificationLeaders.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      label: "Em Ascensão",
      value: risingStars.length,
      icon: TrendUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      label: "Precisam Atenção",
      value: needsAttention.length,
      icon: Warning,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      alert: needsAttention.length > 0,
    },
    {
      label: "VARs Pendentes",
      value: pendingVarsCount,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      alert: pendingVarsCount > 0,
      action: onNavigateToVar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={`relative ${stat.action ? "cursor-pointer hover:border-primary transition-colors" : ""}`}
              onClick={stat.action}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                    <stat.icon size={20} weight="fill" />
                  </div>
                  {stat.alert && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                      !
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart - Moved here from LeadersTab */}
      <PerformanceChart leaders={leaders} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={20} weight="fill" className="text-yellow-600" />
                  Top 5 Líderes
                </CardTitle>
                <CardDescription>
                  Os líderes com melhor desempenho geral
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onNavigateToLeaders}>
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((leader, idx) => (
                <motion.div
                  key={leader.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{leader.name}</p>
                    <p className="text-xs text-muted-foreground">{leader.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{leader.overall}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {leader.trend === "rising" && (
                        <>
                          <TrendUp size={12} className="text-green-600" />
                          <span className="text-green-600">
                            +{leader.rankChange}
                          </span>
                        </>
                      )}
                      {leader.trend === "falling" && (
                        <>
                          <TrendDown size={12} className="text-red-600" />
                          <span className="text-red-600">
                            {leader.rankChange}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Actions */}
        <div className="space-y-4">
          {/* Pending VARs Alert */}
          {pendingVarsCount > 0 && (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Warning size={20} weight="fill" className="text-orange-600" />
                  Ação Necessária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">
                  Você tem <strong>{pendingVarsCount} solicitações VAR</strong>{" "}
                  aguardando revisão. Líderes estão esperando sua decisão.
                </p>
                <Button
                  onClick={onNavigateToVar}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  Revisar VARs Pendentes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Leaders Needing Attention */}
          {needsAttention.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target size={20} weight="fill" className="text-blue-600" />
                  Líderes que Precisam de Atenção
                </CardTitle>
                <CardDescription className="text-xs">
                  {needsAttention.length} líder(es) com desempenho em queda ou
                  baixo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {needsAttention.slice(0, 3).map((leader) => (
                    <div
                      key={leader.id}
                      className="flex items-center justify-between p-2 rounded border text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {leader.team}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          {leader.overall} pts
                        </span>
                        {leader.trend === "falling" && (
                          <TrendDown size={14} className="text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                  {needsAttention.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={onNavigateToLeaders}
                    >
                      Ver mais {needsAttention.length - 3} líder(es)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle size={20} weight="fill" className="text-green-600" />
                Saúde do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Médio</span>
                  <span className="font-bold">{avgOverall.toFixed(0)} pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Engajamento</span>
                  <Badge variant="secondary">
                    {gamificationLeaders.length > 0
                      ? Math.round(
                          (risingStars.length / gamificationLeaders.length) * 100
                        )
                      : 0}
                    %
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status Geral</span>
                  <Badge className="bg-green-500">
                    <CheckCircle size={12} weight="fill" className="mr-1" />
                    Saudável
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});
