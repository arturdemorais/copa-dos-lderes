import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Fire } from "@phosphor-icons/react";
import type { Leader } from "@/lib/types";

interface LeaderHeroCardProps {
  currentLeader: Leader;
  rankPosition: number;
  taskStreak: number;
  completionRate: number;
}

export function LeaderHeroCard({
  currentLeader,
  rankPosition,
  taskStreak,
  completionRate,
}: LeaderHeroCardProps) {
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
                      <Trophy weight="fill" size={32} className="opacity-80" />
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
                        {getPositionEmoji(rankPosition)}
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
                  Você está na <strong>{rankPosition}ª posição</strong> do
                  campeonato
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
                          {rankPosition}º lugar
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
                          <div className="text-xl font-bold">{taskStreak}x</div>
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
  );
}
