import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FirstAid, Fire } from "@phosphor-icons/react";
import { energyService, EnergyCheckIn } from "@/lib/services/energyService";
import { motion } from "framer-motion";

interface EnergyCardProps {
  leaderId: string;
  onCheckInClick: () => void;
}

export function EnergyCard({ leaderId, onCheckInClick }: EnergyCardProps) {
  const [todayCheckIn, setTodayCheckIn] = useState<EnergyCheckIn | null>(null);
  const [streak, setStreak] = useState(0);
  const [average, setAverage] = useState(0);
  const [history, setHistory] = useState<EnergyCheckIn[]>([]);

  useEffect(() => {
    loadEnergyData();
  }, [leaderId]);

  const loadEnergyData = async () => {
    try {
      const today = await energyService.getTodayCheckIn(leaderId);
      setTodayCheckIn(today);

      const streakDays = await energyService.getStreak(leaderId);
      setStreak(streakDays);

      const avg = await energyService.getAverageEnergy(leaderId, 7);
      setAverage(avg);

      const hist = await energyService.getHistory(leaderId, 7);
      setHistory(hist);
    } catch (error) {
      console.error("Error loading energy data:", error);
    }
  };

  const getEnergyEmoji = (level: number) => {
    const emojis = ["😴", "😐", "😊", "🚀", "⚡"];
    return emojis[level - 1] || "😊";
  };

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FirstAid size={20} weight="fill" className="text-primary" />
          <h3 className="font-bold text-sm">Depto. Médico</h3>
        </div>
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold"
          >
            <Fire size={14} weight="fill" />
            {streak} dia{streak > 1 ? "s" : ""}
          </motion.div>
        )}
      </div>

      {!todayCheckIn ? (
        <div className="space-y-2 flex-1 flex flex-col justify-center">
          <p className="text-xs text-muted-foreground">
            Ainda não fez seu check-in hoje
          </p>
          <Button onClick={onCheckInClick} className="w-full" size="sm">
            Fazer Check-in
          </Button>
        </div>
      ) : (
        <div className="space-y-3 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Energia de hoje</p>
              <p className="text-xl font-bold">
                {getEnergyEmoji(todayCheckIn.energyLevel)}{" "}
                {todayCheckIn.energyLevel}/5
              </p>
            </div>
            {average > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Média 7d</p>
                <p className="text-sm font-bold">{average}/5</p>
              </div>
            )}
          </div>

          {history.length > 1 && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">
                Últimos 7 dias
              </p>
              <div className="flex gap-1">
                {history.map((checkIn, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-1.5 rounded-full bg-accent"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${(checkIn.energyLevel / 5) * 120}, 70%, 50%), 
                        hsl(${(checkIn.energyLevel / 5) * 120}, 70%, 40%)
                      )`,
                    }}
                    title={`${checkIn.date}: ${checkIn.energyLevel}/5`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
