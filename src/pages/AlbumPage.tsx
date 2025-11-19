import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TradingCard } from "@/components/gamification/TradingCard";
import {
  Books,
  MagnifyingGlass,
  Sparkle,
  Star,
  Trophy,
  Fire,
  Lightning,
} from "@phosphor-icons/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Leader } from "@/lib/types";
import { getPerformanceCategory } from "@/lib/scoring";

interface AlbumPageProps {
  leaders: Leader[];
  onLeaderClick: (leader: Leader) => void;
}

export function AlbumPage({ leaders, onLeaderClick }: AlbumPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<
    "all" | "legendary" | "elite" | "rare"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  let filteredLeaders = leaders.filter(
    (leader) =>
      leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedRarity !== "all") {
    filteredLeaders = filteredLeaders.filter((leader) => {
      const category = getPerformanceCategory(leader.overall ?? 0);
      if (selectedRarity === "legendary") return category.label === "Lendário";
      if (selectedRarity === "elite") return category.label === "Elite";
      if (selectedRarity === "rare") return category.label === "Starter";
      return true;
    });
  }

  const stats = {
    total: leaders.length,
    legendary: leaders.filter(
      (l) => getPerformanceCategory(l.overall ?? 0).label === "Lendário"
    ).length,
    elite: leaders.filter(
      (l) => getPerformanceCategory(l.overall ?? 0).label === "Elite"
    ).length,
    collected: filteredLeaders.length,
  };

  return (
    <div className="space-y-6">
      {/* Header Estilo Álbum de Figurinhas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950 p-8 border-2 border-amber-200 dark:border-amber-800"
      >
        {/* Efeito de papel texturizado */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="none"/%3E%3Cpath d="M10 0L0 10l10 10 10-10z" fill="%23000" opacity=".05"/%3E%3C/svg%3E")',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <motion.h1
                className="text-4xl font-black mb-2 flex items-center gap-3"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
              >
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  📔
                </motion.span>
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  ÁLBUM DE FIGURINHAS
                </span>
              </motion.h1>
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                Colecione todos os técnicos da Copa dos Líderes 2027
              </p>
            </div>

            {/* Estatísticas de Coleção */}
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 text-center min-w-[90px] border border-amber-200 dark:border-amber-800"
              >
                <div className="text-2xl font-bold text-amber-600">
                  {stats.total}
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  Total
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg p-3 text-center min-w-[90px] shadow-lg"
              >
                <div className="text-2xl font-bold text-white">
                  {stats.legendary}
                </div>
                <div className="text-xs text-yellow-100">Lendárias</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg p-3 text-center min-w-[90px] shadow-lg"
              >
                <div className="text-2xl font-bold text-white">
                  {stats.elite}
                </div>
                <div className="text-xs text-blue-100">Elite</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkle weight="fill" className="text-amber-500" size={24} />
                Coleção Completa
              </CardTitle>
              <CardDescription className="mt-1">
                {filteredLeaders.length} de {leaders.length} figurinhas • Clique
                para ver detalhes
              </CardDescription>
            </div>

            {/* Toggle de Visualização */}
            <div className="flex gap-2">
              <Badge
                variant={viewMode === "grid" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setViewMode("grid")}
              >
                🎴 Grid
              </Badge>
              <Badge
                variant={viewMode === "list" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setViewMode("list")}
              >
                📋 Lista
              </Badge>
            </div>
          </div>

          {/* Filtros por Raridade */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedRarity === "all" ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => setSelectedRarity("all")}
            >
              Todas ({leaders.length})
            </Badge>
            <Badge
              variant={selectedRarity === "legendary" ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-500 hover:to-amber-700 border-0 text-white"
              onClick={() => setSelectedRarity("legendary")}
            >
              <Star weight="fill" size={14} className="mr-1" />
              Lendárias ({stats.legendary})
            </Badge>
            <Badge
              variant={selectedRarity === "elite" ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => setSelectedRarity("elite")}
            >
              <Trophy weight="fill" size={14} className="mr-1" />
              Elite ({stats.elite})
            </Badge>
            <Badge
              variant={selectedRarity === "rare" ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => setSelectedRarity("rare")}
            >
              Starter
            </Badge>
          </div>

          {/* Busca */}
          <div className="relative">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              placeholder="Buscar por nome ou time..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeaders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">📭</div>
              <p className="text-muted-foreground text-lg">
                Nenhuma figurinha encontrada
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar os filtros
              </p>
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredLeaders.map((leader, idx) => {
                  const category = getPerformanceCategory(leader.overall ?? 0);
                  return (
                    <motion.div
                      key={leader.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                      transition={{
                        duration: 0.4,
                        delay: idx * 0.03,
                        type: "spring",
                        stiffness: 200,
                      }}
                      whileHover={{
                        scale: 1.05,
                        rotateY: 5,
                        rotateX: -5,
                        z: 50,
                      }}
                      style={{ perspective: 1000 }}
                      className="relative group"
                    >
                      {/* Badge de Raridade Flutuante */}
                      {category.label === "Lendário" && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: idx * 0.03 + 0.3 }}
                          className="absolute -top-2 -right-2 z-20"
                        >
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full p-2 shadow-lg">
                            <Star
                              weight="fill"
                              className="text-white"
                              size={16}
                            />
                          </div>
                        </motion.div>
                      )}
                      {category.label === "Elite" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.03 + 0.3 }}
                          className="absolute -top-2 -right-2 z-20"
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-2 shadow-lg">
                            <Trophy
                              weight="fill"
                              className="text-white"
                              size={14}
                            />
                          </div>
                        </motion.div>
                      )}
                      {(leader.momentum ?? 0) > 15 && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute -top-2 -left-2 z-20"
                        >
                          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-full p-2 shadow-lg">
                            <Fire
                              weight="fill"
                              className="text-white"
                              size={14}
                            />
                          </div>
                        </motion.div>
                      )}

                      <TradingCard
                        leader={leader}
                        onClick={() => onLeaderClick(leader)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredLeaders.map((leader) => (
                <TradingCard
                  key={leader.id}
                  leader={leader}
                  onClick={() => onLeaderClick(leader)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
