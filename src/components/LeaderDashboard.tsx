import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, SoccerBall, Users, Lightbulb, CheckCircle } from '@phosphor-icons/react'
import { Confetti } from '@/components/Confetti'
import type { Leader, Task } from '@/lib/types'

interface LeaderDashboardProps {
  currentLeader: Leader
  tasks: Task[]
  leaders: Leader[]
  onTaskComplete: (taskId: string) => void
}

export function LeaderDashboard({ currentLeader, tasks, leaders, onTaskComplete }: LeaderDashboardProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  const handleTaskCheck = (taskId: string) => {
    onTaskComplete(taskId)
    setShowConfetti(true)
  }

  const topThreeLeaders = leaders
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 3)

  const getRankPosition = () => {
    const sorted = [...leaders].sort((a, b) => b.overall - a.overall)
    return sorted.findIndex(l => l.id === currentLeader.id) + 1
  }

  const icebreaker = {
    question: "Se sua equipe fosse um time de futebol, qual seria o mascote?",
    subtext: "Compartilhe no canal #copa-dos-lideres"
  }

  return (
    <div className="space-y-6">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div>
        <h1 className="text-3xl font-bold mb-2">Olá, Técnico {currentLeader.name}! 👋</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu vestiário. Veja seu progresso e próximas jogadas.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="chrome-border">
          <div className="chrome-border-inner">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sua Posição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-accent mb-2">
                  {getRankPosition()}º
                </div>
                <p className="text-sm text-muted-foreground">Lugar no Ranking</p>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-3xl font-bold text-primary">
                    {currentLeader.overall}
                  </div>
                  <p className="text-xs text-muted-foreground">Overall</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <SoccerBall weight="fill" className="text-primary" size={20} />
              Gols Marcados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Tarefas</span>
                  <span className="font-medium">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
                </div>
                <Progress value={(tasks.filter(t => t.completed).length / tasks.length) * 100} />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-2xl font-bold text-primary">{currentLeader.taskPoints}</div>
                  <div className="text-xs text-muted-foreground">Pontos de Tarefas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">{currentLeader.assistPoints}</div>
                  <div className="text-xs text-muted-foreground">Assistências</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users weight="fill" className="text-accent" size={20} />
              Nota da Torcida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">
                {currentLeader.fanScore.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground mb-4">de 10.0</p>
              <Progress value={currentLeader.fanScore * 10} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Baseado na avaliação do seu time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle weight="fill" className="text-primary" size={24} />
              Minhas Tasks da Semana
            </CardTitle>
            <CardDescription>
              Complete as tarefas para marcar gols e ganhar pontos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Fique ligado! As tarefas da semana serão publicadas em breve.
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={task.id}
                      checked={task.completed}
                      onCheckedChange={() => handleTaskCheck(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={task.id}
                        className={`text-sm font-medium cursor-pointer ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                    <Badge variant={task.completed ? 'secondary' : 'default'}>
                      +{task.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy weight="fill" className="text-accent" size={24} />
                Pódio da Temporada
              </CardTitle>
              <CardDescription>
                Os 3 líderes no topo do ranking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topThreeLeaders.map((leader, idx) => (
                  <div
                    key={leader.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className={`
                      text-2xl font-bold w-8 h-8 rounded-full flex items-center justify-center
                      ${idx === 0 ? 'bg-accent text-accent-foreground' : ''}
                      ${idx === 1 ? 'bg-muted-foreground/20 text-foreground' : ''}
                      ${idx === 2 ? 'bg-primary/20 text-primary' : ''}
                    `}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{leader.name}</p>
                      <p className="text-xs text-muted-foreground">{leader.team}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{leader.overall}</p>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent-foreground">
                <Lightbulb weight="fill" className="text-accent" size={24} />
                Quebra-Gelo da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{icebreaker.question}</p>
              <p className="text-sm text-muted-foreground">{icebreaker.subtext}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
