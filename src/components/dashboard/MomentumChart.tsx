import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendUp,
  TrendDown,
  Fire,
  Snowflake,
  Lightning,
} from "@phosphor-icons/react";
import type { Leader } from "@/lib/types";

interface MomentumChartProps {
  leader: Leader;
}

export function MomentumChart({ leader }: MomentumChartProps) {
  const momentum = leader.momentum ?? 0;
  const trend = leader.trend ?? "stable";

  // Simular histórico de momentum (últimas 5 semanas)
  const momentumHistory = [
    { week: "S-4", value: momentum - 20 + Math.random() * 10 },
    { week: "S-3", value: momentum - 10 + Math.random() * 10 },
    { week: "S-2", value: momentum - 5 + Math.random() * 10 },
    { week: "S-1", value: momentum + Math.random() * 5 },
    { week: "Atual", value: momentum },
  ];

  const maxValue = Math.max(
    ...momentumHistory.map((h) => Math.abs(h.value)),
    50
  );

  const getTrendConfig = () => {
    if (momentum > 20) {
      return {
        status: "🔥 EM CHAMAS",
        color: "from-orange-500 to-red-600",
        textColor: "text-orange-600",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/50",
        icon: <Fire weight="fill" size={24} className="text-orange-600" />,
        description: "Performance excepcional! Continue nesse ritmo.",
      };
    }
    if (momentum > 5) {
      return {
        status: "⚡ EM FORMA",
        color: "from-green-500 to-emerald-600",
        textColor: "text-green-600",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/50",
        icon: <Lightning weight="fill" size={24} className="text-green-600" />,
        description: "Você está crescendo semana a semana!",
      };
    }
    if (momentum < -20) {
      return {
        status: "❄️ PRECISA AQUECER",
        color: "from-blue-400 to-blue-600",
        textColor: "text-blue-600",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/50",
        icon: <Snowflake weight="fill" size={24} className="text-blue-600" />,
        description: "Hora de reagir! Foque nas prioridades.",
      };
    }
    if (momentum < -5) {
      return {
        status: "⚠️ ATENÇÃO",
        color: "from-yellow-500 to-orange-500",
        textColor: "text-yellow-600",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/50",
        icon: <TrendDown weight="bold" size={24} className="text-yellow-600" />,
        description: "Seu ritmo está caindo. Revise suas estratégias.",
      };
    }
    return {
      status: "→ ESTÁVEL",
      color: "from-slate-400 to-slate-600",
      textColor: "text-slate-600",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/50",
      icon: <TrendUp weight="bold" size={24} className="text-slate-600" />,
      description: "Mantendo o ritmo. Busque melhorar!",
    };
  };

  const trendConfig = getTrendConfig();

  return (
    <Card className="glass border-2 border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {trendConfig.icon}
            Forma Atual
          </CardTitle>
          <Badge
            className={`${trendConfig.bgColor} ${trendConfig.borderColor} ${trendConfig.textColor} border font-bold px-2 py-0.5 text-xs`}
          >
            {trendConfig.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {/* Momentum Score Display */}
        <div className={`${trendConfig.bgColor} rounded-xl p-4 mb-4 border ${trendConfig.borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Momentum Semanal</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${trendConfig.textColor}`}>
                  {momentum > 0 ? "+" : ""}
                  {Math.round(momentum)}
                </span>
                <span className="text-sm text-muted-foreground">pts/sem</span>
              </div>
            </div>
            <div className="text-4xl">
              {momentum > 20 ? "🔥" : momentum > 5 ? "⚡" : momentum < -10 ? "❄️" : "📊"}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{trendConfig.description}</p>
        </div>

        {/* Momentum Chart */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-foreground">Evolução (5 semanas)</p>
          
          <div className="relative h-32 flex items-end gap-1">
            {/* Zero line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
            
            {momentumHistory.map((item, idx) => {
              const heightPercent = (Math.abs(item.value) / maxValue) * 100;
              const isPositive = item.value >= 0;
              const isLast = idx === momentumHistory.length - 1;

              return (
                <div key={item.week} className="flex-1 flex flex-col items-center">
                  <div
                    className="relative flex-1 w-full flex items-end justify-center"
                    style={{ minHeight: "64px" }}
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: `${heightPercent}%`,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: idx * 0.1,
                        ease: "easeOut",
                      }}
                      className={`w-full rounded-t-lg ${
                        isPositive
                          ? `bg-gradient-to-t ${isLast ? trendConfig.color : "from-green-400 to-green-600"}`
                          : `bg-gradient-to-b ${isLast ? "from-red-400 to-red-600" : "from-orange-400 to-orange-600"}`
                      } ${isLast ? "shadow-glow-md" : ""}`}
                      style={{
                        transformOrigin: "bottom",
                        position: isPositive ? "relative" : "absolute",
                        bottom: isPositive ? "0" : "auto",
                        top: isPositive ? "auto" : "0",
                      }}
                    >
                      {isLast && (
                        <motion.div
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                        >
                          <Badge className={`${trendConfig.bgColor} ${trendConfig.textColor} font-bold text-[10px] whitespace-nowrap px-1 py-0`}>
                            {item.value > 0 ? "+" : ""}
                            {Math.round(item.value)}
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                  <p className={`text-[10px] mt-1 font-medium ${isLast ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.week}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prediction */}
        {momentum !== 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
              <TrendUp weight="bold" size={14} />
              Projeção
            </p>
            <p className="text-xs text-muted-foreground">
              {momentum > 0
                ? `Pode ganhar ~+${Math.round(momentum * 4)} pts este mês 🚀`
                : `Atenção: risco de perder ~${Math.round(Math.abs(momentum) * 4)} pts 💪`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
