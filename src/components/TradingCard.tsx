import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Leader } from '@/lib/types'

interface TradingCardProps {
  leader: Leader
  onClick?: () => void
}

export function TradingCard({ leader, onClick }: TradingCardProps) {
  const getOverallColor = (overall: number) => {
    if (overall >= 90) return 'text-accent'
    if (overall >= 80) return 'text-secondary'
    return 'text-muted-foreground'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="chrome-border">
        <div className="chrome-border-inner p-4 h-full">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={leader.photo} alt={leader.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {getInitials(leader.name)}
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1 w-full">
              <h3 className="font-bold text-lg leading-tight">{leader.name}</h3>
              <p className="text-sm text-muted-foreground">{leader.team}</p>
            </div>

            <Badge variant="secondary" className="font-mono text-xs">
              {leader.position}
            </Badge>

            <div className="pt-2 border-t w-full">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Overall
                </div>
                <div className={`text-4xl font-bold ${getOverallColor(leader.overall ?? 0)}`}>
                  {leader.overall ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
