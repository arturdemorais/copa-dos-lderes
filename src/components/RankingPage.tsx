import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Minus, Trophy, MagnifyingGlass } from '@phosphor-icons/react'
import { ActivityFeed } from '@/components/ActivityFeed'
import type { Leader, Activity } from '@/lib/types'

interface RankingPageProps {
  leaders: Leader[]
  activities: Activity[]
  onLeaderClick: (leader: Leader) => void
}

export function RankingPage({ leaders, activities, onLeaderClick }: RankingPageProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const sortedLeaders = [...leaders].sort((a, b) => b.overall - a.overall)

  const filteredLeaders = sortedLeaders.filter(
    leader =>
      leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getVariationIcon = (change: number) => {
    if (change > 0) return <ArrowUp weight="bold" className="text-primary" size={16} />
    if (change < 0) return <ArrowDown weight="bold" className="text-destructive" size={16} />
    return <Minus weight="bold" className="text-muted-foreground" size={16} />
  }

  const topThree = sortedLeaders.slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Trophy weight="fill" className="text-accent" size={36} />
          O Estádio - Ranking da Copa
        </h1>
        <p className="text-muted-foreground">
          Acompanhe a tabela de classificação e veja quem está liderando
        </p>
      </div>

      <Card className="bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10 border-accent/20">
        <CardHeader>
          <CardTitle>Pódio da Temporada</CardTitle>
          <CardDescription>Os artilheiros da Copa dos Líderes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-6">
            {topThree.length >= 2 && (
              <div className="flex flex-col items-center">
                <Avatar className="h-16 w-16 border-4 border-muted-foreground/30 mb-2">
                  <AvatarImage src={topThree[1].photo} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {getInitials(topThree[1].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mb-2">
                  <p className="font-semibold text-sm">{topThree[1].name}</p>
                  <p className="text-xs text-muted-foreground">{topThree[1].team}</p>
                  <p className="text-lg font-bold">{topThree[1].overall}</p>
                </div>
                <div className="bg-muted-foreground/20 h-24 w-24 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-muted-foreground">2</span>
                </div>
              </div>
            )}

            {topThree.length >= 1 && (
              <div className="flex flex-col items-center">
                <Trophy weight="fill" className="text-accent trophy-gleam mb-2" size={32} />
                <Avatar className="h-20 w-20 border-4 border-accent mb-2">
                  <AvatarImage src={topThree[0].photo} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(topThree[0].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mb-2">
                  <p className="font-bold">{topThree[0].name}</p>
                  <p className="text-xs text-muted-foreground">{topThree[0].team}</p>
                  <p className="text-2xl font-bold text-accent">{topThree[0].overall}</p>
                </div>
                <div className="bg-accent h-32 w-24 rounded-t-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-accent-foreground">1</span>
                </div>
              </div>
            )}

            {topThree.length >= 3 && (
              <div className="flex flex-col items-center">
                <Avatar className="h-16 w-16 border-4 border-primary/30 mb-2">
                  <AvatarImage src={topThree[2].photo} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(topThree[2].name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mb-2">
                  <p className="font-semibold text-sm">{topThree[2].name}</p>
                  <p className="text-xs text-muted-foreground">{topThree[2].team}</p>
                  <p className="text-lg font-bold">{topThree[2].overall}</p>
                </div>
                <div className="bg-primary/20 h-20 w-24 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">3</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tabela do Campeonato</CardTitle>
              <CardDescription>
                Classificação completa de todos os técnicos
              </CardDescription>
              <div className="relative pt-2">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Buscar líder ou time..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Pos.</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Seleção</TableHead>
                      <TableHead className="text-center">Overall</TableHead>
                      <TableHead className="text-center">Variação</TableHead>
                      <TableHead className="text-right">Pts Semana</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhum líder encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeaders.map((leader, idx) => {
                        const change = Math.floor(Math.random() * 5) - 2
                        return (
                          <TableRow
                            key={leader.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => onLeaderClick(leader)}
                          >
                            <TableCell className="font-bold">
                              <div className={`
                                ${idx === 0 ? 'text-accent' : ''}
                                ${idx === 1 ? 'text-muted-foreground' : ''}
                                ${idx === 2 ? 'text-primary' : ''}
                              `}>
                                {idx + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={leader.photo} />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    {getInitials(leader.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{leader.name}</p>
                                  <p className="text-xs text-muted-foreground">{leader.position}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{leader.team}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-bold text-lg">{leader.overall}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              {getVariationIcon(change)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-medium">{leader.weeklyPoints}</span>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}
