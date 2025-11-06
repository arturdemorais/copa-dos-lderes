import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendUp, TrendDown, Minus, Lightbulb, Target, Fire, ShieldCheck } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Leader, Insight } from '@/lib/types'
import { generateInsights, getPerformanceCategory, predictNextWeekScore } from '@/lib/scoring'

interface InsightsPanelProps {
  leader: Leader
  leaders: Leader[]
}

export function InsightsPanel({ leader, leaders }: InsightsPanelProps) {
  const insights = generateInsights(leader, leaders)
  const category = getPerformanceCategory(leader.overall)
  const prediction = predictNextWeekScore(leader)
  
  const getMomentumIcon = () => {
    if (leader.trend === 'rising') return <TrendUp weight="bold" className="text-primary" />
    if (leader.trend === 'falling') return <TrendDown weight="bold" className="text-destructive" />
    return <Minus weight="bold" className="text-muted-foreground" />
  }
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <Fire weight="fill" className="text-primary" size={20} />
      case 'warning': return <Target weight="fill" className="text-accent" size={20} />
      default: return <Lightbulb weight="fill" className="text-secondary" size={20} />
    }
  }
  
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck weight="fill" className={category.color} size={24} />
            Status: {category.label}
          </CardTitle>
          <CardDescription>{category.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Momentum</div>
              <div className="flex items-center gap-2">
                {getMomentumIcon()}
                <span className="font-bold text-lg">
                  {(leader.momentum ?? 0) > 0 ? '+' : ''}{Math.round(leader.momentum ?? 0)}/sem
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-1">Consistência</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(leader.consistencyScore ?? 0) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className="font-bold text-sm whitespace-nowrap">
                  {Math.round((leader.consistencyScore ?? 0) * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          {prediction.confidence > 0.5 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Projeção próxima semana</div>
                  <div className="text-2xl font-bold text-primary">{prediction.predicted}</div>
                </div>
                <Badge variant="secondary">
                  {Math.round(prediction.confidence * 100)}% confiança
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb weight="fill" className="text-accent" size={24} />
            Insights Personalizados
          </CardTitle>
          <CardDescription>
            Análise inteligente da sua performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="popLayout">
            {insights.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Continue trabalhando para desbloquear insights
              </p>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{insight.message}</p>
                        {insight.actionable && (
                          <p className="text-xs text-muted-foreground">
                            💡 {insight.actionable}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
