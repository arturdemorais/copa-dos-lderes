import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Star } from '@phosphor-icons/react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import type { Leader } from '@/lib/types'

interface LeaderProfileModalProps {
  leader: Leader | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEvaluate?: (leader: Leader) => void
}

export function LeaderProfileModal({ leader, open, onOpenChange, onEvaluate }: LeaderProfileModalProps) {
  if (!leader) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const radarData = [
    { attribute: 'Comunicação', value: leader.attributes?.communication ?? 0 },
    { attribute: 'Técnica', value: leader.attributes?.technique ?? 0 },
    { attribute: 'Gestão', value: leader.attributes?.management ?? 0 },
    { attribute: 'Ritmo', value: leader.attributes?.pace ?? 0 }
  ]

  const getTrophyIcon = (type: string) => {
    return <Trophy weight="fill" className="text-accent trophy-gleam" size={32} />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Perfil do Líder</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="chrome-border">
              <div className="chrome-border-inner p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={leader.photo} alt={leader.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                      {getInitials(leader.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <h3 className="font-bold text-2xl">{leader.name}</h3>
                    <p className="text-muted-foreground">{leader.position}</p>
                    <Badge variant="secondary" className="mt-2">
                      {leader.team}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t w-full">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                        Overall
                      </div>
                      <div className="text-5xl font-bold text-accent">
                        {leader.overall ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy size={20} className="text-accent" />
                  Troféus
                </h4>
                {(leader.trophies ?? []).length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {(leader.trophies ?? []).map(trophy => (
                      <div key={trophy.id} className="flex flex-col items-center gap-1">
                        {getTrophyIcon(trophy.type)}
                        <span className="text-xs text-center">{trophy.name}</span>
                        <span className="text-xs text-muted-foreground">{trophy.season}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum troféu conquistado ainda</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Medal size={20} className="text-secondary" />
                  Figurinhas
                </h4>
                {(leader.badges ?? []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(leader.badges ?? []).map(badge => (
                      <Badge key={badge.id} variant="outline" className="gap-1">
                        <Star weight="fill" size={14} className="text-accent" />
                        {badge.name}
                        {badge.count > 1 && <span className="text-xs">x{badge.count}</span>}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma figurinha conquistada ainda</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4">Atributos</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="attribute" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                  <Radar 
                    name={leader.name} 
                    dataKey="value" 
                    stroke="oklch(0.52 0.15 155)" 
                    fill="oklch(0.52 0.15 155)" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-primary">Pontos Fortes</h4>
              {(leader.strengths ?? []).length > 0 ? (
                <ul className="space-y-2">
                  {(leader.strengths ?? []).map((strength, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum ponto forte cadastrado</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-secondary">Pontos a Desenvolver</h4>
              {(leader.improvements ?? []).length > 0 ? (
                <ul className="space-y-2">
                  {(leader.improvements ?? []).map((improvement, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-secondary mt-1">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum ponto de melhoria cadastrado</p>
              )}
            </div>

            {onEvaluate && (
              <Button 
                onClick={() => onEvaluate(leader)} 
                className="w-full"
                size="lg"
              >
                <Star weight="fill" size={20} />
                Avaliar este Líder
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
