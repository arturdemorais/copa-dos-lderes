import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Trophy,
  MagnifyingGlass,
  Medal,
  Crown,
  Fire,
  Lightning,
  Star,
  TrendUp,
  Sparkle,
} from "@phosphor-icons/react";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import type { Leader, Activity } from "@/lib/types";
import { getPerformanceCategory } from "@/lib/scoring";

interface RankingPageProps {
  leaders: Leader[];
  activities: Activity[];
  onLeaderClick: (leader: Leader) => void;
}

export function RankingPage({
  leaders,
  activities,
  onLeaderClick,
}: RankingPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "rising" | "top10"
  >("all");
  const [hoveredLeader, setHoveredLeader] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedLeaders = [...leaders].sort(
    (a, b) => (b.overall ?? 0) - (a.overall ?? 0)
  );

  let filteredLeaders = sortedLeaders.filter(
    (leader) =>
      leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedFilter === "rising") {
    filteredLeaders = filteredLeaders.filter((l) => (l.momentum ?? 0) > 0);
  } else if (selectedFilter === "top10") {
    filteredLeaders = filteredLeaders.slice(0, 10);
  }

  const getVariationIcon = (change: number) => {
    if (change > 0) {
      return (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1 text-green-600"
        >
          <ArrowUp weight="bold" size={16} />
          <span className="text-xs font-bold">+{change}</span>
        </motion.div>
      );
    }
    if (change < 0) {
      return (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1 text-red-600"
        >
          <ArrowDown weight="bold" size={16} />
          <span className="text-xs font-bold">{change}</span>
        </motion.div>
      );
    }
    return <Minus weight="bold" className="text-muted-foreground" size={16} />;
  };

  const getRankBadge = (position: number) => {
    if (position === 1)
      return {
        icon: <Crown weight="fill" className="text-yellow-500" size={20} />,
        label: "Campeão",
        color: "from-yellow-400 to-amber-600",
      };
    if (position === 2)
      return {
        icon: <Medal weight="fill" className="text-slate-400" size={20} />,
        label: "Vice",
        color: "from-slate-300 to-slate-500",
      };
    if (position === 3)
      return {
        icon: <Medal weight="fill" className="text-orange-600" size={20} />,
        label: "Terceiro",
        color: "from-orange-400 to-orange-700",
      };
    if (position <= 10)
      return {
        icon: <Star weight="fill" className="text-blue-500" size={18} />,
        label: "Top 10",
        color: "from-blue-400 to-blue-600",
      };
    return null;
  };

  const topThree = sortedLeaders.slice(0, 3);

  return (
    <div className="space-y-6 min-h-screen max-w-6xl mx-auto">
      {/* Header Estilo Placar Eletrônico */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl glass-strong p-6 text-foreground border-2 border-border"
      >
        {/* Efeito de luzes do estádio - Melhorado */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute top-0 left-1/4 w-40 h-40 bg-blue-500 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 20, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-500 rounded-full blur-3xl"
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.6, 0.3, 0.6],
              x: [0, -20, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-40 h-40 bg-orange-500 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <motion.h1
                className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 flex items-center gap-3 text-foreground"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
              >
                <Trophy weight="fill" size={48} className="text-yellow-600" />
                CLASSIFICAÇÃO
              </motion.h1>
              <p className="text-muted-foreground flex items-center gap-2 text-lg">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block w-3 h-3 bg-red-500 rounded-full shadow-glow-accent"
                />
                AO VIVO • {leaders.length} técnicos competindo
              </p>
            </div>

            {/* Estatísticas Rápidas - Melhorado */}
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass rounded-xl p-3 sm:p-4 text-center min-w-[100px] sm:min-w-[120px] border border-border shadow-glow-sm"
              >
                <div className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">
                  {sortedLeaders[0]?.overall ?? 0}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  Maior Overall
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass rounded-xl p-3 sm:p-4 text-center min-w-[100px] sm:min-w-[120px] border border-border shadow-glow-sm"
              >
                <div className="text-3xl font-black text-green-600">
                  {leaders.filter((l) => (l.momentum ?? 0) > 0).length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  Em Ascensão
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pódio 3D EPIC - Estilo Competição */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <Card className="overflow-hidden relative glass border-2 border-border shadow-2xl">
          {/* Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5" />
          <div className="absolute inset-0 bg-grid opacity-5" />

          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3 font-black text-foreground">
                  <Trophy
                    weight="fill"
                    className="text-yellow-600 drop-shadow-glow-md"
                    size={36}
                  />
                  PÓDIO DA TEMPORADA
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base mt-2">
                  Os campeões da Vorp League
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-lg px-6 py-3 border-yellow-500/50 bg-yellow-500/10 text-yellow-600"
              >
                <Crown weight="fill" size={20} className="mr-2" />
                Top 3
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 pb-8">
            <div className="flex items-end justify-center gap-4 sm:gap-6 md:gap-10 py-8 px-4">
              {/* 2º Lugar - Prata */}
              {topThree.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => onLeaderClick(topThree[1])}
                >
                  {/* Avatar com Moldura Prata */}
                  <motion.div
                    className="relative mb-4"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full blur-xl opacity-60 animate-pulse-glow" />
                    <div className="relative p-1 rounded-full bg-gradient-to-br from-gray-300 to-gray-500">
                      <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white/20">
                        <AvatarImage
                          src={topThree[1].photo}
                          alt={topThree[1].name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gray-400 text-white text-2xl font-bold">
                          {getInitials(topThree[1].name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full p-2 shadow-glow-sm">
                      <Medal weight="fill" className="text-white" size={24} />
                    </div>
                  </motion.div>

                  {/* Info */}
                  <div className="text-center mb-4">
                    <p className="font-bold text-lg md:text-xl text-foreground">
                      {topThree[1].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {topThree[1].team}
                    </p>
                    <motion.p
                      className="text-2xl md:text-3xl font-black text-muted-foreground mt-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {topThree[1].overall ?? 0}
                    </motion.p>
                  </div>

                  {/* Podium Base - Prata */}
                  <motion.div
                    className="relative w-28 md:w-32 h-28 md:h-32 rounded-t-2xl bg-gradient-to-b from-gray-300 to-gray-500 flex items-center justify-center shadow-2xl"
                    whileHover={{ y: -5 }}
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-t-2xl" />
                    <span className="text-5xl md:text-6xl font-black text-white drop-shadow-lg relative z-10">
                      2
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
                  </motion.div>
                </motion.div>
              )}

              {/* 1º Lugar - Ouro (Maior) */}
              {topThree.length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                  whileHover={{ y: -15, scale: 1.08 }}
                  className="flex flex-col items-center cursor-pointer relative"
                  onClick={() => onLeaderClick(topThree[0])}
                >
                  {/* Spotlight Effect */}
                  <motion.div
                    className="absolute -top-20 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  {/* Coroa Animada */}
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mb-2"
                  >
                    <Crown
                      weight="fill"
                      className="text-yellow-400 drop-shadow-glow-lg"
                      size={48}
                    />
                  </motion.div>

                  {/* Avatar com Moldura Ouro */}
                  <motion.div
                    className="relative mb-4"
                    animate={{ rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-70 animate-pulse-glow" />
                    <div className="relative p-1.5 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 shadow-glow-accent">
                      <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-white/30">
                        <AvatarImage
                          src={topThree[0].photo}
                          alt={topThree[0].name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-yellow-600 text-white text-3xl font-bold">
                          {getInitials(topThree[0].name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3 shadow-glow-accent">
                      <Trophy weight="fill" className="text-white" size={28} />
                    </div>
                  </motion.div>

                  {/* Info */}
                  <div className="text-center mb-4">
                    <p className="font-black text-xl md:text-2xl text-foreground">
                      {topThree[0].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {topThree[0].team}
                    </p>
                    <motion.p
                      className="text-3xl md:text-4xl font-black bg-gradient-secondary bg-clip-text text-transparent mt-2"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {topThree[0].overall ?? 0}
                    </motion.p>
                  </div>

                  {/* Podium Base - Ouro (Maior) */}
                  <motion.div
                    className="relative w-32 md:w-36 h-40 md:h-44 rounded-t-2xl bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/50"
                    whileHover={{ y: -8 }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-t-2xl" />
                    <Sparkle
                      weight="fill"
                      className="absolute top-2 left-2 text-white/50"
                      size={20}
                    />
                    <Sparkle
                      weight="fill"
                      className="absolute top-4 right-3 text-white/50"
                      size={16}
                    />
                    <span className="text-6xl md:text-7xl font-black text-white drop-shadow-2xl relative z-10">
                      1
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/40" />
                  </motion.div>
                </motion.div>
              )}

              {/* 3º Lugar - Bronze */}
              {topThree.length >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => onLeaderClick(topThree[2])}
                >
                  {/* Avatar com Moldura Bronze */}
                  <motion.div
                    className="relative mb-4"
                    whileHover={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-700 rounded-full blur-xl opacity-60 animate-pulse-glow" />
                    <div className="relative p-1 rounded-full bg-gradient-to-br from-orange-400 to-orange-700">
                      <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white/20">
                        <AvatarImage
                          src={topThree[2].photo}
                          alt={topThree[2].name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-orange-600 text-white text-2xl font-bold">
                          {getInitials(topThree[2].name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-orange-400 to-orange-700 rounded-full p-2 shadow-glow-sm">
                      <Medal weight="fill" className="text-white" size={24} />
                    </div>
                  </motion.div>

                  {/* Info */}
                  <div className="text-center mb-4">
                    <p className="font-bold text-lg md:text-xl text-foreground">
                      {topThree[2].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {topThree[2].team}
                    </p>
                    <motion.p
                      className="text-2xl md:text-3xl font-black text-orange-400 mt-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {topThree[2].overall ?? 0}
                    </motion.p>
                  </div>

                  {/* Podium Base - Bronze */}
                  <motion.div
                    className="relative w-28 md:w-32 h-24 md:h-28 rounded-t-2xl bg-gradient-to-b from-orange-400 to-orange-700 flex items-center justify-center shadow-2xl"
                    whileHover={{ y: -5 }}
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-t-2xl" />
                    <span className="text-5xl md:text-6xl font-black text-white drop-shadow-lg relative z-10">
                      3
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
                  </motion.div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="glass border-2 border-border">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-3xl font-black text-foreground">
                    Tabela do Campeonato
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Classificação completa de todos os técnicos
                  </CardDescription>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setSelectedFilter("all")}
                >
                  Todos ({leaders.length})
                </Badge>
                <Badge
                  variant={selectedFilter === "top10" ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setSelectedFilter("top10")}
                >
                  <Star weight="fill" size={14} className="mr-1" />
                  Top 10
                </Badge>
                <Badge
                  variant={selectedFilter === "rising" ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setSelectedFilter("rising")}
                >
                  <TrendUp weight="fill" size={14} className="mr-1" />
                  Em Ascensão (
                  {leaders.filter((l) => (l.momentum ?? 0) > 0).length})
                </Badge>
              </div>

              <div className="relative">
                <MagnifyingGlass
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <Input
                  placeholder="Buscar líder ou time..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50 border-input focus:border-blue-500/50"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="w-16 text-muted-foreground">
                        Pos.
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Técnico
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Seleção
                      </TableHead>
                      <TableHead className="text-center text-muted-foreground">
                        Overall
                      </TableHead>
                      <TableHead className="text-center text-muted-foreground">
                        Variação
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground">
                        Pts Semana
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {filteredLeaders.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Nenhum líder encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLeaders.map((leader, idx) => {
                          const position =
                            sortedLeaders.findIndex((l) => l.id === leader.id) +
                            1;
                          const rankBadge = getRankBadge(position);
                          const category = getPerformanceCategory(
                            leader.overall ?? 0
                          );
                          const change = Math.floor(Math.random() * 5) - 2;

                          return (
                            <motion.tr
                              key={leader.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: idx * 0.03 }}
                              className="cursor-pointer hover:bg-muted/50 border-border transition-all group"
                              onClick={() => onLeaderClick(leader)}
                              onMouseEnter={() => setHoveredLeader(leader.id)}
                              onMouseLeave={() => setHoveredLeader(null)}
                            >
                              <TableCell className="font-bold">
                                <div
                                  className={`
                                  text-lg
                                  ${position === 1 ? "text-yellow-600" : ""}
                                  ${position === 2 ? "text-gray-400" : ""}
                                  ${position === 3 ? "text-orange-500" : ""}
                                  ${position > 3 ? "text-muted-foreground" : ""}
                                `}
                                >
                                  {position}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="relative"
                                  >
                                    <Avatar className="h-12 w-12 border-2 border-border">
                                      <AvatarImage
                                        src={leader.photo}
                                        alt={leader.name}
                                        className="object-cover"
                                      />
                                      <AvatarFallback className="bg-gradient-primary text-white text-sm font-bold">
                                        {getInitials(leader.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </motion.div>
                                  <div>
                                    <p className="font-semibold text-foreground">
                                      {leader.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {leader.position}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className="font-medium bg-muted/50 border-border"
                                >
                                  {leader.team}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <motion.div
                                  animate={
                                    hoveredLeader === leader.id
                                      ? { scale: 1.3 }
                                      : { scale: 1 }
                                  }
                                  className="inline-block"
                                >
                                  <span
                                    className={`font-black text-2xl ${category.color}`}
                                  >
                                    {leader.overall ?? 0}
                                  </span>
                                </motion.div>
                              </TableCell>
                              <TableCell className="text-center">
                                {getVariationIcon(change)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-bold text-lg text-foreground">
                                    {leader.weeklyPoints ?? 0}
                                  </span>
                                  {leader.weeklyPoints &&
                                    leader.weeklyPoints > 40 && (
                                      <Lightning
                                        weight="fill"
                                        className="text-yellow-600 animate-pulse"
                                        size={18}
                                      />
                                    )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
