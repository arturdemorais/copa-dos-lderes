import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Star } from '@phosphor-icons/react'
import type { Leader } from '@/lib/types'
import { toast } from 'sonner'

interface PeerEvaluationModalProps {
  leader: Leader | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (leaderId: string, description: string, qualities: string[]) => void
}

const QUALITY_OPTIONS = [
  'Colaborativo',
  'Proativo',
  'Bom ouvinte',
  'Mentor excepcional',
  'Resolutivo',
  'Empático',
  'Inovador',
  'Comunicativo'
]

export function PeerEvaluationModal({ leader, open, onOpenChange, onSubmit }: PeerEvaluationModalProps) {
  const [description, setDescription] = useState('')
  const [selectedQualities, setSelectedQualities] = useState<string[]>([])

  if (!leader) return null

  const toggleQuality = (quality: string) => {
    setSelectedQualities(prev =>
      prev.includes(quality)
        ? prev.filter(q => q !== quality)
        : [...prev, quality]
    )
  }

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Por favor, descreva como o líder te ajudou')
      return
    }

    if (selectedQualities.length === 0) {
      toast.error('Selecione pelo menos uma qualidade')
      return
    }

    onSubmit(leader.id, description, selectedQualities)
    setDescription('')
    setSelectedQualities([])
    onOpenChange(false)
    toast.success('Assistência enviada! ⚽')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star weight="fill" className="text-accent" size={24} />
            Dar uma Assistência
          </DialogTitle>
          <DialogDescription>
            Reconheça {leader.name} pelo apoio dado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Como {leader.name} te ajudou esta semana?
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a situação..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">
              Escolha as qualidades demonstradas:
            </label>
            <div className="flex flex-wrap gap-2">
              {QUALITY_OPTIONS.map(quality => (
                <Badge
                  key={quality}
                  variant={selectedQualities.includes(quality) ? 'default' : 'outline'}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => toggleQuality(quality)}
                >
                  {quality}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
            >
              Enviar Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
