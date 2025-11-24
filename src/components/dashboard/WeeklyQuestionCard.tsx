import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatCircleDots, Heart, PaperPlaneTilt } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  weeklyQuestionService,
  WeeklyQuestion,
  QuestionAnswer,
} from "@/lib/services/weeklyQuestionService";
import { motion, AnimatePresence } from "framer-motion";

interface WeeklyQuestionCardProps {
  leaderId: string;
}

export function WeeklyQuestionCard({ leaderId }: WeeklyQuestionCardProps) {
  const [question, setQuestion] = useState<WeeklyQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    try {
      const q = await weeklyQuestionService.getCurrentQuestion();
      setQuestion(q);

      if (q) {
        const answered = await weeklyQuestionService.hasAnswered(
          q.id,
          leaderId
        );
        setHasAnswered(answered);

        const ans = await weeklyQuestionService.getAnswers(q.id);
        setAnswers(ans);
      }
    } catch (error) {
      console.error("Error loading question:", error);
    }
  };

  const handleSubmit = async () => {
    if (!question || !answer.trim()) return;

    setLoading(true);
    try {
      await weeklyQuestionService.answerQuestion(
        question.id,
        leaderId,
        answer,
        undefined,
        false
      );
      toast.success("Resposta enviada! +5 pontos 💡");
      setHasAnswered(true);
      setAnswer("");
      await loadQuestion();
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Erro ao enviar resposta");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (answerId: string) => {
    try {
      await weeklyQuestionService.likeAnswer(answerId, leaderId);
      await loadQuestion();
    } catch (error) {
      console.error("Error liking answer:", error);
    }
  };

  if (!question) return null;

  return (
    <Card className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-start gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <ChatCircleDots size={24} weight="fill" className="text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">Pergunta da Semana</h3>
          <p className="text-sm text-muted-foreground">
            Semana {question.weekNumber} • {question.year}
          </p>
        </div>
      </div>

      <div className="p-4 bg-accent/50 rounded-lg">
        <p className="text-lg font-medium">{question.question}</p>
      </div>

      {!hasAnswered ? (
        <div className="space-y-3 flex-1 flex flex-col justify-end">
          <Textarea
            placeholder="Sua resposta... (máx 500 caracteres)"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{answer.length}/500</p>
            <Button onClick={handleSubmit} disabled={!answer.trim() || loading}>
              <PaperPlaneTilt size={16} weight="fill" className="mr-2" />
              {loading ? "Enviando..." : "Enviar Resposta"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 flex-1 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Heart size={20} weight="fill" />
            <span className="text-sm font-medium">
              Você já respondeu esta pergunta!
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full"
          >
            {showAnswers ? "Ocultar" : "Ver"} Respostas ({answers.length})
          </Button>
        </div>
      )}

      <AnimatePresence>
        {showAnswers && answers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-3 border-t"
          >
            {answers.slice(0, 5).map((ans) => (
              <div key={ans.id} className="p-3 bg-card border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium">{ans.leaderName}</p>
                  <button
                    onClick={() => handleLike(ans.id)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Heart size={16} weight="fill" />
                    <span className="text-xs">{ans.likesCount}</span>
                  </button>
                </div>
                <p className="text-sm">{ans.answer}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
