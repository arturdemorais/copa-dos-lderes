import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartLine } from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import type { Leader } from '@/lib/types'

interface PerformanceChartProps {
  leader: Leader
}

export function PerformanceChart({ leader }: PerformanceChartProps) {
  const chartData = leader.history?.map(h => ({
    week: h.week,
    Overall: h.overall,
    Tarefas: h.taskPoints,
    Assistências: h.assistPoints,
    Rituais: h.ritualPoints
  })) || []
  
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine weight="bold" size={24} />
            Evolução de Performance
          </CardTitle>
          <CardDescription>
            Histórico ainda não disponível
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Complete mais semanas para ver seu progresso
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const maxScore = Math.max(...chartData.map(d => d.Overall))
  const minScore = Math.min(...chartData.map(d => d.Overall))
  const improvement = chartData.length > 1 
    ? chartData[chartData.length - 1].Overall - chartData[0].Overall 
    : 0
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChartLine weight="bold" size={24} />
              Evolução de Performance
            </CardTitle>
            <CardDescription>
              Acompanhe seu progresso ao longo das semanas
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {improvement > 0 ? '+' : ''}{improvement}
            </div>
            <div className="text-xs text-muted-foreground">
              desde início
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/5">
              <div className="text-2xl font-bold text-primary">{maxScore}</div>
              <div className="text-xs text-muted-foreground">Pico</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/5">
              <div className="text-2xl font-bold text-accent">
                {chartData[chartData.length - 1].Overall}
              </div>
              <div className="text-xs text-muted-foreground">Atual</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/5">
              <div className="text-2xl font-bold text-secondary">{minScore}</div>
              <div className="text-xs text-muted-foreground">Mínimo</div>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.52 0.15 155)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.52 0.15 155)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0 0)" />
                <XAxis 
                  dataKey="week" 
                  stroke="oklch(0.50 0 0)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="oklch(0.50 0 0)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.90 0 0)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Overall"
                  stroke="oklch(0.52 0.15 155)"
                  strokeWidth={3}
                  fill="url(#overallGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Overall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xs text-muted-foreground">Tarefas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/50" />
              <span className="text-xs text-muted-foreground">Colaboração</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
