import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkle,
  ShuffleSimple,
  PaperPlaneTilt,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { feedbackSuggestionService } from "@/lib/services/feedbackSuggestionService";
import { anonymousFeedbackService } from "@/lib/services";
import type { Leader } from "@/lib/types";
import { Confetti } from "@/components/gamification/Confetti";

interface RandomFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromLeader: Leader;
  leaders: Leader[];
  onSuccess?: () => void;
}

const FEEDBACK_TYPES = [
  { value: "positive", label: "Ponto Forte 💪", color: "bg-green-500" },
  { value: "improvement", label: "Ponto de Melhoria 📈", color: "bg-blue-500" },
] as const;

const suggestedQualities = {
  positive: [
    "Liderança inspiradora",
    "Comunicação clara",
    "Resolução de problemas",
    "Trabalho em equipe",
    "Inovação",
    "Empatia",
  ],
  improvement: [
    "Gestão de tempo",
    "Delegação de tarefas",
    "Feedback mais frequente",
    "Planejamento estratégico",
    "Escuta ativa",
    "Tomada de decisão",
  ],
};

export function RandomFeedbackModal({
  isOpen,
  onClose,
  fromLeader,
  leaders,
  onSuccess,
}: RandomFeedbackModalProps) {
  const [suggestedLeader, setSuggestedLeader] = useState<Leader | null>(null);
  const [feedbackType, setFeedbackType] = useState<"positive" | "improvement">(
    "positive"
  );
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isRevealing, setIsRevealing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSuggestion();
      setIsRevealing(true);
      setTimeout(() => setIsRevealing(false), 1500);
    }
  }, [isOpen]);

  const loadSuggestion = async () => {
    try {
      const leaderId = await feedbackSuggestionService.suggestLeader(
        fromLeader.id
      );

      if (leaderId) {
        let leader = leaders.find((l) => l.id === leaderId);

        // Se não encontrou, pode ser porque está na lista filtrada
        if (!leader) {
          leader = leaders[Math.floor(Math.random() * leaders.length)];
        }

        setSuggestedLeader(leader || null);
      } else {
        // FALLBACK: Escolher um líder aleatório
        const randomLeader =
          leaders[Math.floor(Math.random() * leaders.length)];
        setSuggestedLeader(randomLeader || null);
      }
    } catch (error) {
      console.error("Erro ao carregar sugestão:", error);
      // FALLBACK: Escolher um líder aleatório
      if (leaders.length > 0) {
        const randomLeader =
          leaders[Math.floor(Math.random() * leaders.length)];
        setSuggestedLeader(randomLeader || null);
      }
    }
  };

  const handleShuffle = async () => {
    setIsRevealing(true);
    await loadSuggestion();
    setTimeout(() => setIsRevealing(false), 1000);
  };

  const handleQualityToggle = (quality: string) => {
    setSelectedQualities((prev) =>
      prev.includes(quality)
        ? prev.filter((q) => q !== quality)
        : [...prev, quality]
    );
  };

  const handleSubmit = async () => {
    if (!suggestedLeader || selectedQualities.length === 0) {
      toast.error("Selecione pelo menos uma qualidade!");
      return;
    }

    if (!comment.trim()) {
      toast.error("Adicione um comentário explicando o feedback!");
      return;
    }

    setLoading(true);
    try {
      // Send anonymous feedback
      const result = await anonymousFeedbackService.sendFeedback(
        fromLeader.id,
        suggestedLeader.id,
        comment,
        feedbackType
      );

      await feedbackSuggestionService.recordSuggestion(
        fromLeader.id,
        suggestedLeader.id,
        true
      );

      setShowConfetti(true);
      toast.success(
        `Feedback enviado! +${result.pointsEarned} pontos + 10 Vorp Coins ⭐`,
        {
          description: `Feedback anônimo enviado com sucesso`,
        }
      );

      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);

      // Se já enviou feedback para este líder hoje, sugerir outro
      if (error.message?.includes("já enviou feedback")) {
        toast.error("Você já deu feedback para este líder hoje!", {
          description: "Vamos sugerir outro líder...",
        });

        // Aguardar 1 segundo e trocar o líder
        setTimeout(() => {
          handleShuffle();
        }, 1000);
      } else {
        toast.error(error.message || "Erro ao enviar feedback");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (suggestedLeader) {
      await feedbackSuggestionService.recordSuggestion(
        fromLeader.id,
        suggestedLeader.id,
        false
      );
    }
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSuggestedLeader(null);
    setFeedbackType("positive");
    setSelectedQualities([]);
    setComment("");
    setShowConfetti(false);
  };

  if (!suggestedLeader) return null;

  return (
    <>
      <Confetti
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[450px]">
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 z-50"
          >
            <X size={16} />
          </button>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-3 py-1"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block mb-1"
              >
                <Sparkle size={24} weight="fill" className="text-yellow-500" />
              </motion.div>
              <h2 className="text-lg font-bold">Momento de Reconhecer!</h2>
              <p className="text-[11px] text-muted-foreground">
                Dê um feedback construtivo
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={suggestedLeader.id}
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={suggestedLeader.photo}
                      alt={suggestedLeader.name}
                      className="w-10 h-10 rounded-full border-2 border-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">
                        {suggestedLeader.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {suggestedLeader.team}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShuffle}
                      disabled={isRevealing}
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      <ShuffleSimple size={14} />
                    </Button>
                  </div>

                  {isRevealing && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                    >
                      <Sparkle
                        size={48}
                        weight="fill"
                        className="text-primary animate-pulse"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[11px] font-medium">
                Tipo de Feedback
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {FEEDBACK_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={
                      feedbackType === type.value ? "default" : "outline"
                    }
                    onClick={() => {
                      setFeedbackType(type.value);
                      setSelectedQualities([]); // Reset qualities when changing type
                    }}
                    className="w-full h-7 text-[11px] px-2"
                    size="sm"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium">
                Selecione qualidades (até 3)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {suggestedQualities[feedbackType].map((quality) => {
                  const isSelected = selectedQualities.includes(quality);
                  return (
                    <motion.button
                      key={quality}
                      onClick={() => handleQualityToggle(quality)}
                      disabled={!isSelected && selectedQualities.length >= 3}
                      className={`
                        p-1.5 rounded-md border text-[11px] font-medium transition-all
                        ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }
                        ${
                          !isSelected && selectedQualities.length >= 3
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      `}
                      whileHover={{
                        scale:
                          isSelected || selectedQualities.length < 3 ? 1.02 : 1,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {quality}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium">
                Comentário (obrigatório)
              </label>
              <Textarea
                placeholder="Explique seu feedback..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                maxLength={300}
                className="text-xs resize-none p-2"
              />
              <p className="text-[10px] text-muted-foreground text-right">
                {comment.length}/300
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1 h-8 text-[11px]"
                disabled={loading}
                size="sm"
              >
                Agora não
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-8 text-[11px]"
                disabled={selectedQualities.length === 0 || loading}
                size="sm"
              >
                <PaperPlaneTilt size={12} weight="fill" className="mr-1" />
                {loading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
