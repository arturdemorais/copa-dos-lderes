import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div
        className={`absolute inset-0 bg-gradient-to-br ${tierInfo.color} opacity-5`}
      />

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Coins weight="fill" size={22} className="text-amber-500" />
            </motion.div>
            Vorp Coins
          </CardTitle>
          <Badge
            className={`bg-gradient-to-r ${tierInfo.color} text-white border-0 font-bold px-2 py-0.5 text-xs`}
          >
            {tierInfo.tier}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-3 pb-4">
        {/* Main Coins Display */}
        <div className="relative">
          <motion.div
            className={`bg-gradient-to-br ${tierInfo.color} rounded-xl p-4 ${tierInfo.glow}`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs mb-1">Saldo Disponível</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white drop-shadow-lg">
                    {coins.toLocaleString()}
                  </span>
                  <Sparkle weight="fill" size={18} className="text-white/70" />
                </div>
              </div>
              <div className="text-5xl opacity-30">🪙</div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Earnings */}
        {weeklyEarnings > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendUp weight="bold" size={16} className="text-green-600" />
              <span className="text-xs font-semibold text-foreground">
                Esta semana
              </span>
            </div>
            <span className="text-lg font-bold text-green-600">
              +{weeklyEarnings}
            </span>
          </div>
        )}

        {/* Progress to next tier */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Próximo nível</span>
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
          <div className="h-2 bg-muted rounded-full overflow-hidden">
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

        {/* Shop Button - Coming Soon */}
        <Button
          onClick={onShopClick}
          disabled
          className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold cursor-not-allowed opacity-60"
          size="sm"
        >
          <ShoppingCart weight="fill" size={16} className="mr-2" />
          Loja de Prêmios - Em Breve 🚀
        </Button>
      </CardContent>
    </Card>
  );
}
