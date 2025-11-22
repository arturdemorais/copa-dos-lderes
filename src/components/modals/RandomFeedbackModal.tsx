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
import { peerEvaluationService } from "@/lib/services";
import type { Leader } from "@/lib/types";
import { Confetti } from "@/components/gamification/Confetti";

interface RandomFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromLeader: Leader;
  leaders: Leader[];
  onSuccess?: () => void;
}

const suggestedQualities = [
  "Liderança inspiradora",
  "Comunicação clara",
  "Resolução de problemas",
  "Trabalho em equipe",
  "Inovação",
  "Empatia",
];

export function RandomFeedbackModal({
  isOpen,
  onClose,
  fromLeader,
  leaders,
  onSuccess,
}: RandomFeedbackModalProps) {
  const [suggestedLeader, setSuggestedLeader] = useState<Leader | null>(null);
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
        const leader = leaders.find((l) => l.id === leaderId);
        setSuggestedLeader(leader || null);
      }
    } catch (error) {
      console.error("Error loading suggestion:", error);
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

    setLoading(true);
    try {
      await peerEvaluationService.create(
        fromLeader.id,
        suggestedLeader.id,
        comment || `Reconhecimento: ${selectedQualities.join(", ")}`,
        selectedQualities
      );

      await feedbackSuggestionService.recordSuggestion(
        fromLeader.id,
        suggestedLeader.id,
        true
      );

      setShowConfetti(true);
      toast.success(`Feedback enviado! +5 pontos para você ⭐`, {
        description: `${suggestedLeader.name} recebeu +10 pontos`,
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Erro ao enviar feedback");
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
        <DialogContent className="sm:max-w-[500px] overflow-hidden">
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 z-50"
          >
            <X size={20} />
          </button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6 py-4"
          >
            <div className="text-center space-y-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block"
              >
                <Sparkle size={32} weight="fill" className="text-yellow-500" />
              </motion.div>
              <h2 className="text-2xl font-bold">Momento de Reconhecer!</h2>
              <p className="text-sm text-muted-foreground">
                Que tal dar um feedback positivo?
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
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={suggestedLeader.photo}
                      alt={suggestedLeader.name}
                      className="w-16 h-16 rounded-full border-2 border-primary"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {suggestedLeader.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {suggestedLeader.team}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShuffle}
                      disabled={isRevealing}
                    >
                      <ShuffleSimple size={20} />
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

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selecione qualidades (até 3)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQualities.map((quality) => {
                  const isSelected = selectedQualities.includes(quality);
                  return (
                    <motion.button
                      key={quality}
                      onClick={() => handleQualityToggle(quality)}
                      disabled={!isSelected && selectedQualities.length >= 3}
                      className={`
                        p-3 rounded-lg border-2 text-sm font-medium transition-all
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

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Comentário (opcional)
              </label>
              <Textarea
                placeholder="Adicione uma mensagem pessoal..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
                disabled={loading}
              >
                Agora não
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={selectedQualities.length === 0 || loading}
              >
                <PaperPlaneTilt size={16} weight="fill" className="mr-2" />
                {loading ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
