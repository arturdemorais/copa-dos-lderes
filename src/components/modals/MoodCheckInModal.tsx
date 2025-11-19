import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smiley, SmileyMeh, SmileySad, SmileyXEyes, Confetti as ConfettiIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { moodService, MoodType, ContextType } from "@/lib/services/moodService"

interface MoodCheckInModalProps {
  isOpen: boolean
  onClose: () => void
  leaderId: string
  onSuccess?: () => void
}

const moods: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: "excited", emoji: "🥳", label: "Empolgado", color: "bg-purple-500" },
  { type: "happy", emoji: "😁", label: "Feliz", color: "bg-green-500" },
  { type: "neutral", emoji: "😐", label: "Neutro", color: "bg-gray-500" },
  { type: "tired", emoji: "😴", label: "Cansado", color: "bg-orange-500" },
  { type: "stressed", emoji: "😰", label: "Estressado", color: "bg-yellow-500" },
  { type: "sad", emoji: "😢", label: "Triste", color: "bg-red-500" },
]

export function MoodCheckInModal({ isOpen, onClose, leaderId, onSuccess }: MoodCheckInModalProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [comment, setComment] = useState("")
  const [context, setContext] = useState<ContextType | undefined>()
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error("Selecione seu sentimento!")
      return
    }

    setLoading(true)
    try {
      await moodService.create(leaderId, selectedMood, comment || undefined, context, isPublic)
      
      const mood = moods.find(m => m.type === selectedMood)
      toast.success(`Sentimento registrado! ${mood?.emoji}`)
      
      onSuccess?.()
      onClose()
      setSelectedMood(null)
      setComment("")
      setContext(undefined)
      setIsPublic(false)
    } catch (error) {
      console.error("Error saving mood:", error)
      toast.error("Erro ao salvar sentimento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Smiley size={28} weight="fill" className="text-primary" />
            Como você está se sentindo?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.type
              return (
                <motion.button
                  key={mood.type}
                  onClick={() => setSelectedMood(mood.type)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all
                    ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="text-4xl mb-2"
                    animate={{ scale: isSelected ? [1, 1.3, 1] : 1 }}
                  >
                    {mood.emoji}
                  </motion.div>
                  <p className="text-xs font-medium">{mood.label}</p>
                </motion.button>
              )
            })}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contexto</label>
            <Select value={context} onValueChange={(v) => setContext(v as ContextType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o contexto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Trabalho</SelectItem>
                <SelectItem value="personal">Pessoal</SelectItem>
                <SelectItem value="team">Time</SelectItem>
                <SelectItem value="project">Projeto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Comentário (opcional)</label>
            <Textarea
              placeholder="O que está acontecendo?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={280}
            />
            <p className="text-xs text-muted-foreground text-right">{comment.length}/280</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Compartilhar com o time (público)</span>
          </label>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!selectedMood || loading}>
              {loading ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
