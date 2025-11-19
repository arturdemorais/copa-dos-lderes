import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChartBar, Users } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Leader } from '@/lib/types'
import { getTeamBenchmarks } from '@/lib/scoring'

interface ComparativeAnalyticsProps {
  leader: Leader
  leaders: Leader[]
}

export function ComparativeAnalytics({ leader, leaders }: ComparativeAnalyticsProps) {
  const allLeadersAvg = {
    overall: leaders.reduce((sum, l) => sum + (l.overall ?? 0), 0) / leaders.length,
    taskPoints: leaders.reduce((sum, l) => sum + (l.taskPoints ?? 0), 0) / leaders.length,
    fanScore: leaders.reduce((sum, l) => sum + (l.fanScore ?? 0), 0) / leaders.length,
    assistPoints: leaders.reduce((sum, l) => sum + (l.assistPoints ?? 0), 0) / leaders.length,
    ritualPoints: leaders.reduce((sum, l) => sum + (l.ritualPoints ?? 0), 0) / leaders.length
  }
  
  const teamBenchmarks = getTeamBenchmarks(leaders, leader.team)
  
  const sortedLeaders = [...leaders].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
  const currentRank = sortedLeaders.findIndex(l => l.id === leader.id) + 1
  const percentile = Math.round((1 - (currentRank - 1) / leaders.length) * 100)
  
  const categories = [
    {
      name: 'Tarefas',
      value: leader.taskPoints ?? 0,
      avg: allLeadersAvg.taskPoints,
      teamAvg: teamBenchmarks?.avgTaskPoints || 0,
      color: 'bg-primary'
    },
    {
      name: 'Nota da Torcida',
      value: (leader.fanScore ?? 0) * 10,
      avg: allLeadersAvg.fanScore * 10,
      teamAvg: teamBenchmarks ? teamBenchmarks.avgFanScore * 10 : 0,
      color: 'bg-accent'
    },
    {
      name: 'Assistências',
      value: leader.assistPoints ?? 0,
      avg: allLeadersAvg.assistPoints,
      teamAvg: teamBenchmarks?.avgTaskPoints || 0,
      color: 'bg-secondary'
    },
    {
      name: 'Rituais',
      value: leader.ritualPoints ?? 0,
      avg: allLeadersAvg.ritualPoints,
      teamAvg: 0,
      color: 'bg-primary/70'
    }
  ]
  
  const getPerformanceVsAverage = (value: number, avg: number) => {
    const diff = ((value / avg) - 1) * 100
    if (diff > 10) return { label: 'Acima', color: 'text-primary' }
    if (diff < -10) return { label: 'Abaixo', color: 'text-destructive' }
    return { label: 'Na média', color: 'text-muted-foreground' }
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar weight="fill" size={24} />
            Comparativo de Performance
          </CardTitle>
          <CardDescription>
            Veja como você está em relação à média geral
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Seu Percentil</div>
                <div className="text-3xl font-bold text-primary">Top {percentile}%</div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {currentRank}º lugar
              </Badge>
            </div>
            
            <div className="space-y-4">
              {categories.map((cat, idx) => {
                const maxValue = Math.max(cat.value, cat.avg, cat.teamAvg)
                const status = getPerformanceVsAverage(cat.value, cat.avg)
                
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cat.name}</span>
                      <span className={`text-sm font-bold ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">Você</span>
                        <div className="flex-1 relative">
                          <div className="h-8 bg-muted rounded-lg overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(cat.value / maxValue) * 100}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className={`h-full ${cat.color} flex items-center justify-end pr-2`}
                            >
                              <span className="text-xs font-bold text-white">
                                {Math.round(cat.value)}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12">Média</span>
                        <div className="flex-1 relative">
                          <div className="h-6 bg-muted rounded-lg overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(cat.avg / maxValue) * 100}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 + 0.2 }}
                              className="h-full bg-muted-foreground/30 flex items-center justify-end pr-2"
                            >
                              <span className="text-xs font-medium text-muted-foreground">
                                {Math.round(cat.avg)}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {teamBenchmarks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users weight="fill" size={20} />
              Benchmark do Time {leader.team}
            </CardTitle>
            <CardDescription>
              Comparativo com outros técnicos do seu time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Média do Time</div>
                  <div className="text-2xl font-bold">{Math.round(teamBenchmarks.avgOverall)}</div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <div className="text-xs text-muted-foreground mb-1">Melhor do Time</div>
                  <div className="text-2xl font-bold text-primary">
                    {teamBenchmarks.topPerformer.overall}
                  </div>
                </div>
              </div>
              
              {teamBenchmarks.topPerformer.id !== leader.id && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="text-sm">
                    <span className="font-medium">{teamBenchmarks.topPerformer.name}</span>
                    {' '}é o líder do seu time com {teamBenchmarks.topPerformer.overall ?? 0} pontos
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Você está {(teamBenchmarks.topPerformer.overall ?? 0) - (leader.overall ?? 0)} pontos atrás
                  </div>
                </div>
              )}
              
              {teamBenchmarks.topPerformer.id === leader.id && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-sm font-medium text-primary">
                    🏆 Você é o melhor técnico do time {leader.team}!
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Continue inspirando seus colegas
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
