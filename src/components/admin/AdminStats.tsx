import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Trophy,
  VideoCamera,
  Coin,
  ChartLine,
  ClockClockwise,
} from "@phosphor-icons/react";
import { varService, activityLogService } from "@/lib/services";
import type { Leader } from "@/lib/types";

interface AdminStatsProps {
  leaders: Leader[];
}

export function AdminStats({ leaders }: AdminStatsProps) {
  // Filtrar apenas líderes que participam da gamificação (não admins)
  const gamificationLeaders = leaders.filter((l) => !l.email?.includes("@admin") && l.team !== "Admin");
  const [varStats, setVarStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    approvalRate: 0,
  });
  const [activityStats, setActivityStats] = useState({
    totalActions: 0,
    todayActions: 0,
    weekActions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // VAR stats
      const varData = await varService.getStatistics();
      setVarStats(varData);

      // Activity stats
      const activityData = await activityLogService.getStatistics();
      
      // Calcular ações de hoje e da semana
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const todayLogs = activityData.recentActivity.filter((log) =>
        log.createdAt.startsWith(today)
      );
      const weekLogs = activityData.recentActivity.filter(
        (log) => new Date(log.createdAt) >= weekAgo
      );

      setActivityStats({
        totalActions: activityData.totalActions,
        todayActions: todayLogs.length,
        weekActions: weekLogs.length,
      });
    } catch (error) {
      console.error("Error loading admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = gamificationLeaders.reduce((sum, l) => sum + (l.overall ?? 0), 0);
  const avgPoints = gamificationLeaders.length > 0 ? totalPoints / gamificationLeaders.length : 0;
  const topLeader = gamificationLeaders.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0];

  const stats = [
    {
      icon: Users,
      label: "Líderes Ativos",
      value: gamificationLeaders.length,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Trophy,
      label: "Líder do Momento",
      value: topLeader?.name || "N/A",
      subtitle: `${topLeader?.overall || 0} pts`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      icon: VideoCamera,
      label: "VARs Pendentes",
      value: varStats.pending,
      subtitle: `${varStats.approvalRate.toFixed(0)}% aprovação`,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      alert: varStats.pending > 0,
    },
    {
      icon: ChartLine,
      label: "Média de Pontos",
      value: avgPoints.toFixed(0),
      subtitle: `${totalPoints} total`,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: ClockClockwise,
      label: "Atividades Hoje",
      value: activityStats.todayActions,
      subtitle: `${activityStats.weekActions} esta semana`,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}
                >
                  <stat.icon size={24} weight="fill" />
                </div>
                {stat.alert && (
                  <Badge variant="destructive" className="text-xs">
                    !
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
