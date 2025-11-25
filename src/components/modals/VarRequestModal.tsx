import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { VideoCamera, Warning, CheckCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { varService } from "@/lib/services";

interface VarRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderId: string;
  requestType: "ritual_absence" | "task_delay";
  ritualId?: string;
  ritualName?: string;
  taskId?: string;
  taskName?: string;
  pointsAtRisk: number;
  onSuccess?: () => void;
}

export function VarRequestModal({
  isOpen,
  onClose,
  leaderId,
  requestType,
  ritualId,
  ritualName,
  taskId,
  taskName,
  pointsAtRisk,
  onSuccess,
}: VarRequestModalProps) {
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Por favor, descreva o motivo da ausência/atraso");
      return;
    }

    setLoading(true);
    try {
      // Verificar se já existe solicitação
      const hasExisting = await varService.hasExistingRequest(
        leaderId,
        ritualId,
        taskId
      );

      if (hasExisting) {
        toast.error("Você já solicitou VAR para este item!");
        return;
      }

      // Criar solicitação
      await varService.createRequest(leaderId, requestType, reason, {
        ritualId,
        taskId,
        evidenceUrl: evidenceUrl.trim() || undefined,
        pointsAtRisk,
      });

      toast.success("VAR solicitado! ⚽", {
        description: "Aguarde a análise do árbitro (admin)",
      });

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error("Error creating VAR request:", error);
      toast.error(error.message || "Erro ao solicitar VAR");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setEvidenceUrl("");
    onClose();
  };

  const getTitle = () => {
    if (requestType === "ritual_absence") {
      return "VAR - Justificar Ausência";
    }
    return "VAR - Justificar Atraso";
  };

  const getDescription = () => {
    if (requestType === "ritual_absence") {
      return `Solicite revisão da ausência em: ${ritualName || "Ritual"}`;
    }
    return `Solicite revisão do atraso em: ${taskName || "Tarefa"}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VideoCamera weight="fill" size={24} className="text-blue-600" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Alert de pontos em risco */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Warning size={20} className="text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Pontos em risco: {pointsAtRisk}
                </p>
                <p className="text-xs text-foreground/80 mt-1">
                  Se o VAR for <strong>aprovado</strong>, você não perde pontos.
                  <br />
                  Se <strong>rejeitado</strong>, os pontos serão descontados.
                </p>
              </div>
            </div>
          </div>

          {/* Tipo da solicitação */}
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {requestType === "ritual_absence" ? "⚽ Ausência em Ritual" : "⏱️ Atraso em Tarefa"}
            </Badge>
            {ritualName && (
              <Badge variant="secondary" className="text-xs">
                {ritualName}
              </Badge>
            )}
            {taskName && (
              <Badge variant="secondary" className="text-xs">
                {taskName}
              </Badge>
            )}
          </div>

          {/* Justificativa */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Justificativa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Ex: Estava em reunião com cliente, atestado médico, problema familiar, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none text-sm"
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {reason.length}/500 caracteres
            </p>
          </div>

          {/* URL de comprovante (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="evidence" className="text-sm font-medium">
              Link de Comprovante <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="evidence"
              type="url"
              placeholder="https://drive.google.com/..."
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Ex: print de tela, atestado, comprovante, etc.
            </p>
          </div>

          {/* Dicas */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-foreground/80">
                <strong>Dica:</strong> Seja claro e objetivo na justificativa. O admin irá revisar e decidir.
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading || !reason.trim()}
            >
              <VideoCamera size={16} weight="fill" className="mr-2" />
              {loading ? "Solicitando..." : "Solicitar VAR"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
