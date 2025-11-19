import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Star } from "@phosphor-icons/react";
import type { Leader } from "@/lib/types";

interface LeaderStatsRadarProps {
  currentLeader: Leader;
}

export function LeaderStatsRadar({ currentLeader }: LeaderStatsRadarProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Radar de Atributos Interativo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="md:col-span-2"
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target weight="fill" className="text-primary" size={24} />
              Seus Atributos de Liderança
            </CardTitle>
            <CardDescription>
              Clique em um atributo para ver detalhes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[
                  {
                    key: "communication",
                    label: "Comunicação",
                    value: currentLeader.attributes?.communication ?? 0,
                    icon: "💬",
                  },
                  {
                    key: "technique",
                    label: "Técnica",
                    value: currentLeader.attributes?.technique ?? 0,
                    icon: "⚙️",
                  },
                  {
                    key: "management",
                    label: "Gestão",
                    value: currentLeader.attributes?.management ?? 0,
                    icon: "📊",
                  },
                  {
                    key: "pace",
                    label: "Ritmo",
                    value: currentLeader.attributes?.pace ?? 0,
                    icon: "⚡",
                  },
                ].map((attr, idx) => (
                  <motion.div
                    key={attr.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    onClick={() => setSelectedStat(attr.key)}
                    className={`cursor-pointer p-3 rounded-lg transition-all ${
                      selectedStat === attr.key
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted/30 border-2 border-transparent hover:border-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{attr.icon}</span>
                        <span className="font-medium">{attr.label}</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {attr.value}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${attr.value}%` }}
                        transition={{
                          duration: 1,
                          delay: 0.6 + idx * 0.1,
                        }}
                        className="h-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="relative w-48 h-48"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl" />
                  <div className="absolute inset-4 rounded-full bg-card border-4 border-primary/30 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-5xl mb-2"
                      >
                        🎯
                      </motion.div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Média Geral
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        {Math.round(
                          ((currentLeader.attributes?.communication ?? 0) +
                            (currentLeader.attributes?.technique ?? 0) +
                            (currentLeader.attributes?.management ?? 0) +
                            (currentLeader.attributes?.pace ?? 0)) /
                            4
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pontos Fortes e Melhorias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star weight="fill" className="text-accent" size={24} />
              Destaques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <span>💪</span> Pontos Fortes
              </div>
              <div className="space-y-2">
                {(currentLeader.strengths ?? [])
                  .slice(0, 3)
                  .map((strength, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{strength}</span>
                    </motion.div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                <span>🎯</span> Em Desenvolvimento
              </div>
              <div className="space-y-2">
                {(currentLeader.improvements ?? [])
                  .slice(0, 3)
                  .map((improvement, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-secondary mt-0.5">→</span>
                      <span>{improvement}</span>
                    </motion.div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
