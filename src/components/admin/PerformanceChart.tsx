import { memo, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { Leader } from "@/lib/types";
import { ChartLine, TrendUp, TrendDown } from "@phosphor-icons/react";

interface PerformanceChartProps {
  leaders: Leader[];
  selectedLeaderId?: string;
}

export const PerformanceChart = memo(function PerformanceChart({
  leaders,
  selectedLeaderId,
}: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const leader = selectedLeaderId
      ? leaders.find((l) => l.id === selectedLeaderId)
      : null;

    if (!leader || !leader.history || leader.history.length === 0) {
      // If no leader selected or no history, show aggregate data
      return generateAggregateData(leaders);
    }

    // Show individual leader history
    return leader.history.map((entry) => ({
      week: entry.week,
      overall: entry.overall,
      taskPoints: entry.taskPoints,
      assistPoints: entry.assistPoints,
      ritualPoints: entry.ritualPoints,
    }));
  }, [leaders, selectedLeaderId]);

  const selectedLeader = selectedLeaderId
    ? leaders.find((l) => l.id === selectedLeaderId)
    : null;

  const trend = selectedLeader?.trend;
  const trendChange = selectedLeader?.rankChange || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChartLine size={20} weight="fill" className="text-primary" />
              {selectedLeader ? `Evolução: ${selectedLeader.name}` : "Evolução Geral"}
            </CardTitle>
            <CardDescription>
              {selectedLeader
                ? "Histórico de pontuação nas últimas semanas"
                : "Média de pontuação de todos os líderes"}
            </CardDescription>
          </div>
          {selectedLeader && trend && (
            <div className="flex items-center gap-2">
              {trend === "rising" && (
                <Badge className="bg-green-500">
                  <TrendUp size={14} weight="fill" className="mr-1" />
                  +{trendChange} posições
                </Badge>
              )}
              {trend === "falling" && (
                <Badge variant="destructive">
                  <TrendDown size={14} weight="fill" className="mr-1" />
                  {trendChange} posições
                </Badge>
              )}
              {trend === "stable" && (
                <Badge variant="secondary">Estável</Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ChartLine size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sem dados de histórico disponíveis</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAssists" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRituals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorOverall)"
                name="Overall"
              />
              {selectedLeader && (
                <>
                  <Area
                    type="monotone"
                    dataKey="taskPoints"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fill="url(#colorTasks)"
                    name="Tasks"
                  />
                  <Area
                    type="monotone"
                    dataKey="assistPoints"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    fill="url(#colorAssists)"
                    name="Assists"
                  />
                  <Area
                    type="monotone"
                    dataKey="ritualPoints"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    fill="url(#colorRituals)"
                    name="Rituais"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
});

// Helper function to generate aggregate data when no leader is selected
function generateAggregateData(leaders: Leader[]) {
  const gamificationLeaders = leaders.filter(
    (l) => !l.email?.includes("@admin") && l.team !== "Admin"
  );

  if (gamificationLeaders.length === 0) return [];

  // Collect all unique weeks from all leaders
  const weeksSet = new Set<string>();
  gamificationLeaders.forEach((leader) => {
    leader.history?.forEach((entry) => {
      weeksSet.add(entry.week);
    });
  });

  const weeks = Array.from(weeksSet).sort();

  // Calculate average for each week
  return weeks.map((week) => {
    let totalOverall = 0;
    let count = 0;

    gamificationLeaders.forEach((leader) => {
      const entry = leader.history?.find((h) => h.week === week);
      if (entry) {
        totalOverall += entry.overall;
        count++;
      }
    });

    return {
      week,
      overall: count > 0 ? Math.round(totalOverall / count) : 0,
    };
  });
}
