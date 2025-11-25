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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SoccerBall,
  HandsClapping,
  Trophy,
  Target,
  HandHeart,
  ChartLine,
  Lightning,
  ChatCircle,
  Fire,
  Medal,
} from "@phosphor-icons/react";
import type { Leader } from "@/lib/types";

interface AttributeRankingsProps {
  leaders: Leader[];
  currentLeaderId?: string;
}

export function AttributeRankings({
  leaders,
  currentLeaderId,
}: AttributeRankingsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Rankings por categoria
  const rankings = {
    tasks: {
      title: "Artilharia",
      icon: <SoccerBall weight="fill" size={20} className="text-primary" />,
      description: "Mais tarefas completadas",
      data: [...leaders]
        .sort((a, b) => (b.taskPoints ?? 0) - (a.taskPoints ?? 0))
        .slice(0, 5)
        .map((l, idx) => ({
          leader: l,
          value: l.taskPoints ?? 0,
          position: idx + 1,
          label: "tarefas",
        })),
      emoji: "⚽",
    },
    assists: {
      title: "Rei das Assistências",
      icon: <HandsClapping weight="fill" size={20} className="text-blue-600" />,
      description: "Mais assistências para outros líderes",
      data: [...leaders]
        .sort((a, b) => (b.assistPoints ?? 0) - (a.assistPoints ?? 0))
        .slice(0, 5)
        .map((l, idx) => ({
          leader: l,
          value: l.assistPoints ?? 0,
          position: idx + 1,
          label: "assists",
        })),
      emoji: "🤝",
    },
    rituals: {
      title: "Disciplina",
      icon: <Target weight="fill" size={20} className="text-green-600" />,
      description: "Maior presença em rituais",
      data: [...leaders]
        .sort((a, b) => (b.ritualPoints ?? 0) - (a.ritualPoints ?? 0))
        .slice(0, 5)
        .map((l, idx) => ({
          leader: l,
          value: l.ritualPoints ?? 0,
          position: idx + 1,
          label: "pontos",
        })),
      emoji: "🎯",
    },
    momentum: {
      title: "Em Chamas",
      icon: <ChartLine weight="fill" size={20} className="text-purple-600" />,
      description: "Maior momentum crescente",
      data: [...leaders]
        .sort((a, b) => (b.momentum ?? 0) - (a.momentum ?? 0))
        .slice(0, 5)
        .map((l, idx) => ({
          leader: l,
          value: Math.round(l.momentum ?? 0),
          position: idx + 1,
          label: "pts/sem",
        })),
      emoji: "📈",
    },
    overall: {
      title: "Overall",
      icon: <Medal weight="fill" size={20} className="text-amber-600" />,
      description: "Classificação geral",
      data: [...leaders]
        .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
        .slice(0, 5)
        .map((l, idx) => ({
          leader: l,
          value: l.overall ?? 0,
          position: idx + 1,
          label: "overall",
        })),
      emoji: "👑",
    },
  };

  const getMedalColor = (position: number) => {
    if (position === 1) return "from-yellow-400 to-amber-600";
    if (position === 2) return "from-gray-300 to-gray-500";
    if (position === 3) return "from-orange-400 to-orange-700";
    return "from-slate-200 to-slate-400";
  };

  const renderRankingList = (category: keyof typeof rankings) => {
    const ranking = rankings[category];

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">{ranking.emoji}</div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              {ranking.icon}
              {ranking.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {ranking.description}
            </p>
          </div>
        </div>

        {ranking.data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum dado ainda</p>
          </div>
        ) : (
          ranking.data.map((item, idx) => {
            const isCurrentLeader = item.leader.id === currentLeaderId;

            return (
              <motion.div
                key={item.leader.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isCurrentLeader
                    ? "bg-primary/10 border-primary/50 shadow-glow-sm"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                {/* Position Badge */}
                <div className="absolute -left-3 -top-3">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMedalColor(
                      item.position
                    )} flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-white font-black text-lg">
                      {item.position}
                    </span>
                  </motion.div>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage
                      src={item.leader.photo}
                      alt={item.leader.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-primary text-white font-bold">
                      {getInitials(item.leader.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">
                        {item.leader.name}
                      </p>
                      {isCurrentLeader && (
                        <Badge variant="default" className="text-xs">
                          Você
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.leader.team}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <motion.div
                      animate={{
                        scale: item.position === 1 ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p
                        className={`text-3xl font-black ${
                          item.position === 1
                            ? "bg-gradient-secondary bg-clip-text text-transparent"
                            : "text-foreground"
                        }`}
                      >
                        {item.value}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {item.label}
                      </p>
                    </motion.div>
                  </div>

                  {/* Trophy for #1 */}
                  {item.position === 1 && (
                    <Trophy
                      weight="fill"
                      size={28}
                      className="text-yellow-600"
                    />
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <Card className="glass border-2 border-border">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Medal weight="fill" size={28} className="text-amber-600" />
          Rankings Especiais
        </CardTitle>
        <CardDescription>
          Conheça os líderes em cada categoria da competição
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-6">
            <TabsTrigger value="tasks" className="text-xs">
              ⚽ Artilharia
            </TabsTrigger>
            <TabsTrigger value="assists" className="text-xs">
              🤝 Assists
            </TabsTrigger>
            <TabsTrigger value="rituals" className="text-xs">
              🎯 Disciplina
            </TabsTrigger>
            <TabsTrigger value="momentum" className="text-xs">
              📈 Momentum
            </TabsTrigger>
            <TabsTrigger value="overall" className="text-xs">
              👑 Overall
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">{renderRankingList("tasks")}</TabsContent>
          <TabsContent value="assists">
            {renderRankingList("assists")}
          </TabsContent>
          <TabsContent value="rituals">
            {renderRankingList("rituals")}
          </TabsContent>
          <TabsContent value="momentum">
            {renderRankingList("momentum")}
          </TabsContent>
          <TabsContent value="overall">
            {renderRankingList("overall")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
