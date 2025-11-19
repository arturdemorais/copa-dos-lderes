import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, SoccerBall, Star } from '@phosphor-icons/react'
import type { Activity } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'kudos':
        return <Star weight="fill" className="text-accent" size={16} />
      case 'trophy':
        return <Trophy weight="fill" className="text-accent" size={16} />
      case 'badge':
        return <Medal weight="fill" className="text-secondary" size={16} />
      case 'task':
        return <SoccerBall weight="fill" className="text-primary" size={16} />
      default:
        return null
    }
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <SoccerBall weight="fill" size={20} className="text-primary" />
        Feed da Torcida
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma atividade recente
            </p>
          ) : (
            activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="mt-1 flex-shrink-0">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {activity.leaderName}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { 
                      addSuffix: true,
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
