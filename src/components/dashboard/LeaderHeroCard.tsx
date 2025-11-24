import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Fire,
  Lightning,
  Star,
  TrendUp,
  Target,
  Flame,
  Crown,
  Medal,
} from "@phosphor-icons/react";
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
    if (overall >= 90)
      return {
        gradient: "from-yellow-400 via-yellow-500 to-orange-500",
        glow: "shadow-glow-gold",
        textColor: "text-yellow-400",
        borderColor: "border-yellow-500/50",
        rarity: "LENDÁRIO",
      };
    if (overall >= 80)
      return {
        gradient: "from-emerald-400 via-green-500 to-teal-500",
        glow: "shadow-glow-success",
        textColor: "text-emerald-400",
        borderColor: "border-emerald-500/50",
        rarity: "ÉPICO",
      };
    if (overall >= 70)
      return {
        gradient: "from-blue-400 via-cyan-500 to-purple-500",
        glow: "shadow-glow-md",
        textColor: "text-cyan-400",
        borderColor: "border-cyan-500/50",
        rarity: "RARO",
      };
    return {
      gradient: "from-slate-400 via-gray-500 to-slate-500",
      glow: "shadow-stadium-md",
      textColor: "text-slate-400",
      borderColor: "border-slate-500/50",
      rarity: "COMUM",
    };
  };

  const getPositionEmoji = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    if (position <= 10) return "⭐";
    return "💪";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const cardStyle = getOverallColor(currentLeader.overall ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      className="relative"
    >
      {/* Background de estádio com textura de gramado */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 rounded-3xl" />
      <div className="absolute inset-0 bg-field opacity-40 rounded-3xl" />

      {/* Brilho sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-stadium-green/5 via-sky-blue/5 to-trophy-gold/5 rounded-3xl blur-2xl" />

      <Card className="relative overflow-hidden border-2 border-stadium-green/20 shadow-card-xl bg-white/95 backdrop-blur-sm">
        {/* Barra superior com gradiente da Copa */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-stadium-green via-sky-blue to-trophy-gold" />

        <CardContent className="p-6">
          <div className="grid lg:grid-cols-[260px_1fr] gap-5">
            {/* Card de Jogador FIFA Ultimate Team Style - COM FOTO */}
            <motion.div
              whileHover={{
                y: -4,
                transition: { duration: 0.3 },
              }}
              className="relative group"
            >
              {/* Borda holográfica rainbow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-stadium-green via-sky-blue via-trophy-gold to-stadium-green rounded-2xl blur opacity-40 group-hover:opacity-70 animate-border-rotate transition duration-500" />

              <div
                className={`relative bg-gradient-to-br ${cardStyle.gradient} rounded-2xl p-4 text-white shadow-card-xl`}
              >
                {/* Textura de fundo sutil */}
                <div className="absolute inset-0 bg-grid opacity-10 rounded-2xl" />

                <div className="relative z-10 space-y-4">
                  {/* Header: Overall + Raridade */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      {/* Overall GIGANTE */}
                      <div className="flex items-center gap-2">
                        <div className="text-5xl font-black drop-shadow-2xl">
                          {currentLeader.overall ?? 0}
                        </div>
                        <Star
                          weight="fill"
                          size={18}
                          className="text-yellow-300 drop-shadow-glow-lg"
                        />
                      </div>
                      <div className="text-xs uppercase tracking-widest opacity-90 font-bold pl-1">
                        {currentLeader.position}
                      </div>
                    </div>

                    {/* Badge de Raridade + Troféu */}
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-black/40 text-white border-white/30 text-xs font-bold backdrop-blur-sm px-2 py-0.5">
                        {cardStyle.rarity}
                      </Badge>
                      <Trophy
                        weight="fill"
                        size={24}
                        className="drop-shadow-glow-md"
                      />
                    </div>
                  </div>

                  {/* FOTO DO LÍDER - DESTAQUE PRINCIPAL */}
                  <div className="flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      {/* Glow ao redor da foto */}
                      <div className="absolute inset-0 bg-white/30 rounded-xl blur-xl" />
                      <Avatar className="relative h-28 w-28 border-4 border-white/40 shadow-2xl">
                        <AvatarImage
                          src={currentLeader.photo}
                          alt={currentLeader.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-white/20 text-white text-4xl font-black backdrop-blur-sm">
                          {getInitials(currentLeader.name)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Badge de posição no ranking */}
                      {rankPosition <= 3 && (
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2 shadow-glow-gold border-2 border-white">
                          <span className="text-xl">
                            {getPositionEmoji(rankPosition)}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Nome e Time */}
                  <div className="space-y-2 text-center">
                    <div className="text-lg font-black leading-tight drop-shadow-lg">
                      {currentLeader.name}
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-black/30 text-white border-white/40 backdrop-blur-sm font-semibold text-sm px-3 py-1"
                    >
                      {currentLeader.team}
                    </Badge>
                  </div>

                  {/* Stats em Grid - Estilo FIFA */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <motion.div
                      className="bg-black/30 rounded-lg p-2 backdrop-blur-sm border border-white/10 text-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <div className="text-2xl font-black mb-0.5">
                        {currentLeader.taskPoints}
                      </div>
                      <div className="text-[9px] uppercase opacity-80 font-bold tracking-wider">
                        Tarefas
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-black/30 rounded-lg p-2 backdrop-blur-sm border border-white/10 text-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <div className="text-2xl font-black mb-0.5">
                        {currentLeader.fanScore ?? 0}
                      </div>
                      <div className="text-[9px] uppercase opacity-80 font-bold tracking-wider">
                        Torcida
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-black/30 rounded-lg p-2 backdrop-blur-sm border border-white/10 text-center"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <div className="text-2xl font-black mb-0.5">
                        {currentLeader.assistPoints}
                      </div>
                      <div className="text-[9px] uppercase opacity-80 font-bold tracking-wider">
                        Assists
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats e Informações Principais - Estilo Copa 2026 */}
            <div className="space-y-4">
              {/* Header com efeito de transmissão */}
              <div className="relative">
                <h1 className="text-2xl font-black mb-2 flex items-center gap-2 text-foreground">
                  Bem-vindo, {currentLeader.name.split(" ")[0]}!
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
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-foreground/70 text-sm font-medium">
                    Você está na{" "}
                    <strong className="text-stadium-green text-base font-black">
                      {rankPosition}ª posição
                    </strong>{" "}
                    do campeonato
                  </p>
                  {rankPosition <= 3 && (
                    <Badge className="bg-gradient-gold text-white border-trophy-gold/40 font-bold px-2 py-0.5 text-xs shadow-glow-gold">
                      <Trophy weight="fill" size={12} className="mr-1" />
                      TOP {rankPosition}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Campo Tático PREMIUM - Posição Visual Light */}
              <motion.div
                className="relative bg-gradient-to-b from-stadium-green/10 to-stadium-green/5 rounded-xl p-5 border-2 border-stadium-green/25 overflow-hidden shadow-card-md"
                whileHover={{ scale: 1.02 }}
              >
                {/* Textura de campo de futebol */}
                <div className="absolute inset-0 opacity-15 bg-field">
                  {/* Linhas do campo */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stadium-green" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-stadium-green" />
                  <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-stadium-green rounded-full -translate-x-1/2 -translate-y-1/2" />
                  {/* Áreas */}
                  <div className="absolute top-1/2 left-0 w-16 h-32 border-2 border-stadium-green -translate-y-1/2" />
                  <div className="absolute top-1/2 right-0 w-16 h-32 border-2 border-stadium-green -translate-y-1/2" />
                </div>

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <Star
                        weight="fill"
                        size={16}
                        className="text-stadium-green"
                      />
                      <span className="font-semibold">
                        Sua Posição no Ranking
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-5xl drop-shadow-glow-success"
                      >
                        ⚽
                      </motion.div>
                      <div>
                        <div className="text-2xl font-black bg-gradient-primary bg-clip-text text-transparent drop-shadow-lg">
                          {rankPosition}º lugar
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          {currentLeader.rankChange > 0 && (
                            <>
                              <TrendUp
                                weight="bold"
                                className="text-green-500"
                                size={16}
                              />
                              <span className="text-green-500 font-bold">
                                Subiu {currentLeader.rankChange}{" "}
                                {currentLeader.rankChange === 1
                                  ? "posição"
                                  : "posições"}
                              </span>
                            </>
                          )}
                          {currentLeader.rankChange < 0 && (
                            <>
                              <TrendUp
                                weight="bold"
                                className="text-red-500 rotate-180"
                                size={16}
                              />
                              <span className="text-red-500 font-bold">
                                Caiu {Math.abs(currentLeader.rankChange)}{" "}
                                {Math.abs(currentLeader.rankChange) === 1
                                  ? "posição"
                                  : "posições"}
                              </span>
                            </>
                          )}
                          {currentLeader.rankChange === 0 && (
                            <span className="text-muted-foreground font-medium">
                              — Manteve a posição
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Streak Badge EPIC - ÚNICO COM PULSAÇÃO */}
                  {taskStreak > 0 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-secondary rounded-xl blur opacity-60 animate-pulse-glow" />
                      <div className="relative bg-gradient-secondary text-white rounded-xl p-3 shadow-glow-accent border-2 border-white/20">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{
                              scale: [1, 1.15, 1],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Fire
                              weight="fill"
                              size={32}
                              className="drop-shadow-lg"
                            />
                          </motion.div>
                          <div>
                            <div className="text-xl font-black drop-shadow-lg">
                              {taskStreak}x
                            </div>
                            <div className="text-xs uppercase font-bold tracking-wider">
                              STREAK
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Progress Bars PREMIUM - Estilo Placar Light */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="relative glass rounded-xl p-4 border-2 border-stadium-green/30 overflow-hidden shadow-card-md"
                  whileHover={{ scale: 1.03, y: -2 }}
                >
                  <div className="absolute inset-0 bg-gradient-stadium opacity-30" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold uppercase tracking-wider text-foreground/70">
                        Conclusão
                      </span>
                      <span className="text-3xl font-black bg-gradient-success bg-clip-text text-transparent">
                        {completionRate}%
                      </span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden border-2 border-stadium-green/20">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-success shadow-glow-success"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="relative glass rounded-xl p-4 border-2 border-sky-blue/30 overflow-hidden shadow-card-md"
                  whileHover={{ scale: 1.03, y: -2 }}
                >
                  <div className="absolute inset-0 bg-gradient-secondary opacity-10" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold uppercase tracking-wider text-foreground/70">
                        Momentum
                      </span>
                      <span
                        className={`text-3xl font-black ${
                          (currentLeader.momentum ?? 0) > 0
                            ? "text-stadium-green"
                            : "text-penalty-red"
                        }`}
                      >
                        {currentLeader.momentum > 0 ? "+" : ""}
                        {Math.round(currentLeader.momentum ?? 0)}
                      </span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden border-2 border-sky-blue/20">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            100,
                            Math.abs(currentLeader.momentum ?? 0) * 2
                          )}%`,
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeOut",
                          delay: 0.3,
                        }}
                        className={`h-full ${
                          (currentLeader.momentum ?? 0) > 0
                            ? "bg-gradient-to-r from-stadium-green to-sky-blue shadow-glow-success"
                            : "bg-gradient-to-r from-penalty-red to-energy-orange shadow-glow-accent"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
