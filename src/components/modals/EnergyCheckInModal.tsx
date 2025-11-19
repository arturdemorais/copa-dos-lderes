import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FirstAid,
  Heartbeat,
  Heart,
  Fire,
  Lightning,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { energyService } from "@/lib/services";

interface EnergyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderId: string;
  onSuccess?: () => void;
}

const energyLevels = [
  {
    level: 1,
    emoji: "😴",
    label: "Exausto",
    icon: Heartbeat,
    color: "text-red-500",
  },
  {
    level: 2,
    emoji: "😐",
    label: "Cansado",
    icon: Heartbeat,
    color: "text-orange-500",
  },
  {
    level: 3,
    emoji: "😊",
    label: "Normal",
    icon: Heart,
    color: "text-yellow-500",
  },
  {
    level: 4,
    emoji: "🚀",
    label: "Energizado",
    icon: Fire,
    color: "text-green-500",
  },
  {
    level: 5,
    emoji: "⚡",
    label: "Invencível",
    icon: Lightning,
    color: "text-blue-500",
  },
];

export function EnergyCheckInModal({
  isOpen,
  onClose,
  leaderId,
  onSuccess,
}: EnergyCheckInModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedLevel) {
      toast.error("Selecione seu nível de energia!");
      return;
    }

    setLoading(true);
    try {
      await energyService.create(leaderId, selectedLevel, note || undefined);

      toast.success(`Check-in realizado! +2 pontos ⚡`, {
        description: `Você está ${energyLevels[
          selectedLevel - 1
        ].label.toLowerCase()} hoje`,
      });

      onSuccess?.();
      onClose();
      setSelectedLevel(null);
      setNote("");
    } catch (error) {
      console.error("Error saving energy check-in:", error);
      toast.error("Erro ao salvar check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FirstAid size={28} weight="fill" className="text-primary" />
            Departamento Médico
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Como está sua energia hoje, técnico?
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Energy Level Selector */}
          <div className="grid grid-cols-5 gap-2">
            {energyLevels.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedLevel === item.level;

              return (
                <motion.button
                  key={item.level}
                  onClick={() => setSelectedLevel(item.level)}
                  className={`
                    relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                    ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="absolute -inset-1 bg-primary/20 rounded-xl"
                        layoutId="selectedEnergy"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="relative text-3xl"
                    animate={{
                      scale: isSelected ? [1, 1.2, 1] : 1,
                      rotate: isSelected ? [0, -10, 10, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.emoji}
                  </motion.div>

                  <Icon
                    size={20}
                    weight={isSelected ? "fill" : "regular"}
                    className={
                      isSelected ? item.color : "text-muted-foreground"
                    }
                  />

                  <span className="text-xs font-medium text-center">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Selected Level Display */}
          <AnimatePresence>
            {selectedLevel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center p-4 bg-accent/50 rounded-lg"
              >
                <p className="text-sm text-muted-foreground">Você está</p>
                <p className="text-2xl font-bold">
                  {energyLevels[selectedLevel - 1].emoji}{" "}
                  {energyLevels[selectedLevel - 1].label}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Optional Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comentário (opcional)</label>
            <Textarea
              placeholder="Como você está se sentindo? O que está afetando sua energia?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {note.length}/200
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!selectedLevel || loading}
            >
              {loading ? "Salvando..." : "Confirmar Check-in"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            💡 Check-ins diários te dão insights sobre sua energia e ajudam a
            identificar padrões
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
