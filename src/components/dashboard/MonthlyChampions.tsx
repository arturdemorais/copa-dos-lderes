import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Calendar, Coins } from "@phosphor-icons/react";
import type { MonthlyChampion } from "@/lib/types";

interface MonthlyChampionsProps {
  champions: MonthlyChampion[];
  currentYear?: number;
}

export function MonthlyChampions({
  champions,
  currentYear = 2026,
}: MonthlyChampionsProps) {
  const getMonthName = (month: number) => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return months[month - 1] || "";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filtrar e ordenar por mês
  const championsByYear = champions
    .filter((c) => c.year === currentYear)
    .sort((a, b) => b.month - a.month);

  const currentMonth = new Date().getMonth() + 1;
  const completedMonths = championsByYear.filter((c) => c.month < currentMonth);
  const upcomingMonths = 12 - completedMonths.length;

  return (
    <Card className="glass border-2 border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Crown weight="fill" size={28} className="text-yellow-600" />
              Campeões Mensais {currentYear}
            </CardTitle>
            <CardDescription>
              Hall da Fama - Melhores de cada mês
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg font-bold px-4 py-2">
            {completedMonths.length}/12 meses
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progresso da Temporada 2026
            </span>
            <span className="font-bold text-foreground">
              {Math.round((completedMonths.length / 12) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedMonths.length / 12) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600"
            />
          </div>
        </div>

        {/* Champions List */}
        {championsByYear.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              🏆
            </motion.div>
            <p className="text-muted-foreground">
              O primeiro campeão mensal será coroado em breve!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {championsByYear.map((champion, idx) => {
              const isLatest = idx === 0;

              return (
                <motion.div
                  key={`${champion.year}-${champion.month}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    isLatest
                      ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50 shadow-glow-gold"
                      : "bg-card border-border hover:border-yellow-500/30"
                  }`}
                >
                  {isLatest && (
                    <div className="absolute -top-3 -right-3">
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold px-3 py-1 shadow-glow-gold">
                          <Sparkle weight="fill" size={14} className="mr-1" />
                          ATUAL
                        </Badge>
                      </motion.div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Month Badge */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-14 h-14 rounded-xl ${
                          isLatest
                            ? "bg-gradient-to-br from-yellow-400 to-orange-600"
                            : "bg-gradient-to-br from-slate-300 to-slate-500"
                        } flex flex-col items-center justify-center shadow-lg text-white`}
                      >
                        <Calendar weight="fill" size={16} />
                        <span className="text-xs font-bold mt-0.5">
                          {getMonthName(champion.month)
                            .slice(0, 3)
                            .toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Avatar */}
                    <Avatar
                      className={`h-14 w-14 border-2 ${
                        isLatest ? "border-yellow-500" : "border-border"
                      }`}
                    >
                      <AvatarImage
                        src={`/api/placeholder/100/100`}
                        alt={champion.leaderName}
                      />
                      <AvatarFallback
                        className={
                          isLatest ? "bg-gradient-gold text-white" : "bg-muted"
                        }
                      >
                        {getInitials(champion.leaderName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">
                          {champion.leaderName}
                        </p>
                        {isLatest && (
                          <Trophy
                            weight="fill"
                            size={18}
                            className="text-yellow-600"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {getMonthName(champion.month)} {champion.year}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {champion.finalScore} pts
                        </Badge>
                      </div>
                    </div>

                    {/* Coins Reward */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Coins weight="fill" size={20} />
                        <span className="text-lg font-bold">
                          {champion.vorpCoinsEarned}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vorp Coins
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Upcoming Months Preview */}
        {upcomingMonths > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Calendar weight="bold" size={16} />
              Próximos Campeonatos
            </p>
            <p className="text-sm text-muted-foreground">
              Faltam {upcomingMonths} {upcomingMonths === 1 ? "mês" : "meses"}{" "}
              para completar a temporada 2026. O campeão final será definido em
              Janeiro de 2027! 🏆
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Import necessário
import { Sparkle } from "@phosphor-icons/react";
