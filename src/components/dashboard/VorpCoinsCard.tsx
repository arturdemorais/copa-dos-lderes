import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, ShoppingCart, TrendUp, Sparkle } from "@phosphor-icons/react";
import type { Leader } from "@/lib/types";

interface VorpCoinsCardProps {
  leader: Leader;
  onShopClick?: () => void;
}

export function VorpCoinsCard({ leader, onShopClick }: VorpCoinsCardProps) {
  const coins = leader.vorpCoins ?? 0;

  // Calcular ganhos da semana (simulado)
  const weeklyEarnings = Math.floor((leader.weeklyPoints ?? 0) / 2);

  const getCoinTier = (coins: number) => {
    if (coins >= 1000)
      return {
        tier: "💎 DIAMANTE",
        color: "from-cyan-400 to-blue-600",
        glow: "shadow-glow-accent",
      };
    if (coins >= 500)
      return {
        tier: "🥇 OURO",
        color: "from-yellow-400 to-orange-500",
        glow: "shadow-glow-gold",
      };
    if (coins >= 200)
      return {
        tier: "🥈 PRATA",
        color: "from-gray-300 to-gray-500",
        glow: "shadow-glow-sm",
      };
    return {
      tier: "🥉 BRONZE",
      color: "from-orange-400 to-orange-700",
      glow: "shadow-card-sm",
    };
  };

  const tierInfo = getCoinTier(coins);

  return (
    <Card className="glass border-2 border-border overflow-hidden relative">
      {/* Background glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tierInfo.color} opacity-5`} />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Coins weight="fill" size={28} className="text-amber-500" />
              </motion.div>
              Vorp Coins
            </CardTitle>
            <CardDescription>Sua moeda para trocar por prêmios</CardDescription>
          </div>
          <Badge className={`bg-gradient-to-r ${tierInfo.color} text-white border-0 font-bold px-3 py-1`}>
            {tierInfo.tier}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Main Coins Display */}
        <div className="relative">
          <motion.div
            className={`bg-gradient-to-br ${tierInfo.color} rounded-2xl p-6 ${tierInfo.glow}`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Saldo Disponível</p>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-baseline gap-2"
                >
                  <span className="text-6xl font-black text-white drop-shadow-lg">
                    {coins.toLocaleString()}
                  </span>
                  <Sparkle weight="fill" size={24} className="text-white/70" />
                </motion.div>
              </div>
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity },
                }}
                className="text-7xl opacity-30"
              >
                🪙
              </motion.div>
            </div>
          </motion.div>

          {/* Floating particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [-20, -60],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.7,
                repeat: Infinity,
              }}
              className="absolute bottom-4 text-2xl"
              style={{ left: `${30 + i * 25}%` }}
            >
              💰
            </motion.div>
          ))}
        </div>

        {/* Weekly Earnings */}
        {weeklyEarnings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <TrendUp weight="bold" size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-semibold text-foreground">Ganhos esta semana</p>
                <p className="text-xs text-muted-foreground">
                  Continue assim para ganhar mais!
                </p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">
              +{weeklyEarnings}
            </span>
          </motion.div>
        )}

        {/* Progress to next tier */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso para próximo nível</span>
            <span className="font-bold text-foreground">
              {coins < 200
                ? `${coins}/200`
                : coins < 500
                  ? `${coins}/500`
                  : coins < 1000
                    ? `${coins}/1000`
                    : "MAX ⭐"}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${
                  coins < 200
                    ? (coins / 200) * 100
                    : coins < 500
                      ? ((coins - 200) / 300) * 100
                      : coins < 1000
                        ? ((coins - 500) / 500) * 100
                        : 100
                }%`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${tierInfo.color}`}
            />
          </div>
        </div>

        {/* Shop Button */}
        <Button
          onClick={onShopClick}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold"
          size="lg"
        >
          <ShoppingCart weight="fill" size={20} className="mr-2" />
          Ir para Loja de Prêmios
        </Button>

        {/* Info */}
        <div className="text-center text-xs text-muted-foreground pt-2">
          <p>Ganhe Vorp Coins completando tasks, badges e conquistas!</p>
        </div>
      </CardContent>
    </Card>
  );
}
