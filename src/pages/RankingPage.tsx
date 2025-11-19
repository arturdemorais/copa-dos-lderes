import { useState } from "react";
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
} from "@phosphor-icons/react";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import type { Leader, Activity } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="space-y-6">
      {/* Header Estilo Placar Eletrônico */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white"
      >
        {/* Efeito de luzes do estádio */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute top-0 left-1/4 w-32 h-32 bg-accent rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-32 h-32 bg-primary rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <motion.h1
                className="text-4xl font-black mb-2 flex items-center gap-3"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
              >
                <motion.span
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  🏟️
                </motion.span>
                TABELA DE CLASSIFICAÇÃO
              </motion.h1>
              <p className="text-slate-300 flex items-center gap-2">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block w-2 h-2 bg-red-500 rounded-full"
                />
                AO VIVO • {leaders.length} técnicos competindo
              </p>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="flex gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]"
              >
                <div className="text-2xl font-bold text-accent">
                  {sortedLeaders[0]?.overall ?? 0}
                </div>
                <div className="text-xs text-slate-300">Maior Overall</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]"
              >
                <div className="text-2xl font-bold text-green-400">
                  {leaders.filter((l) => (l.momentum ?? 0) > 0).length}
                </div>
                <div className="text-xs text-slate-300">Em Ascensão</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pódio 3D Estilo Olimpíadas */}
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5" />
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy weight="fill" className="text-yellow-500" size={28} />
                Pódio da Temporada
              </CardTitle>
              <CardDescription>
                Os artilheiros da Copa dos Líderes
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              🎖️ Top 3
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-end justify-center gap-8 py-8">
            {topThree.length >= 2 && (
              <div className="flex flex-col items-center">
                <Avatar className="h-16 w-16 border-4 border-muted-foreground/30 mb-2">
                  <AvatarImage src={topThree[1].photo} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {getInitials(topThree[1].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mb-2">
                  <p className="font-semibold text-sm">{topThree[1].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {topThree[1].team}
                  </p>
                  <p className="text-lg font-bold">
                    {topThree[1].overall ?? 0}
                  </p>
                </div>
                <div className="bg-muted-foreground/20 h-24 w-24 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-muted-foreground">
                    2
                  </span>
                </div>
              </div>
            )}

            {topThree.length >= 1 && (
              <div className="flex flex-col items-center">
                <Trophy
                  weight="fill"
                  className="text-accent trophy-gleam mb-2"
                  size={32}
                />
                <Avatar className="h-20 w-20 border-4 border-accent mb-2">
                  <AvatarImage src={topThree[0].photo} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(topThree[0].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mb-2">
                  <p className="font-bold">{topThree[0].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {topThree[0].team}
                  </p>
                  <p className="text-2xl font-bold text-accent">
                    {topThree[0].overall ?? 0}
                  </p>
                </div>
                <div className="bg-accent h-32 w-24 rounded-t-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-accent-foreground">
                    1
                  </span>
                </div>
              </div>
            )}

            {topThree.length >= 3 && (
              <div className="flex flex-col items-center">
                <Avatar className="h-16 w-16 border-4 border-primary/30 mb-2">
                  <AvatarImage src={topThree[2].photo} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(topThree[2].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mb-2">
                  <p className="font-semibold text-sm">{topThree[2].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {topThree[2].team}
                  </p>
                  <p className="text-lg font-bold">
                    {topThree[2].overall ?? 0}
                  </p>
                </div>
                <div className="bg-primary/20 h-20 w-24 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">3</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-2xl">
                    Tabela do Campeonato
                  </CardTitle>
                  <CardDescription>
                    Classificação completa de todos os técnicos
                  </CardDescription>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex gap-2 mb-4">
                <Badge
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedFilter("all")}
                >
                  Todos ({leaders.length})
                </Badge>
                <Badge
                  variant={selectedFilter === "top10" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedFilter("top10")}
                >
                  <Star weight="fill" size={14} className="mr-1" />
                  Top 10
                </Badge>
                <Badge
                  variant={selectedFilter === "rising" ? "default" : "outline"}
                  className="cursor-pointer"
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
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Pos.</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Seleção</TableHead>
                      <TableHead className="text-center">Overall</TableHead>
                      <TableHead className="text-center">Variação</TableHead>
                      <TableHead className="text-right">Pts Semana</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
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
                          <TableRow
                            key={leader.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onLeaderClick(leader)}
                            onMouseEnter={() => setHoveredLeader(leader.id)}
                            onMouseLeave={() => setHoveredLeader(null)}
                          >
                            <TableCell className="font-bold">
                              <div
                                className={`
                                ${idx === 0 ? "text-accent" : ""}
                                ${idx === 1 ? "text-muted-foreground" : ""}
                                ${idx === 2 ? "text-primary" : ""}
                              `}
                              >
                                {idx + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={leader.photo} />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    {getInitials(leader.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{leader.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {leader.position}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="font-medium"
                              >
                                {leader.team}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <motion.div
                                animate={
                                  hoveredLeader === leader.id
                                    ? { scale: 1.2 }
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
                                <span className="font-bold text-lg">
                                  {leader.weeklyPoints ?? 0}
                                </span>
                                {leader.weeklyPoints &&
                                  leader.weeklyPoints > 40 && (
                                    <Lightning
                                      weight="fill"
                                      className="text-yellow-500"
                                      size={16}
                                    />
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
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
