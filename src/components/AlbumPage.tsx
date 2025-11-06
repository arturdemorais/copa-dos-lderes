import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TradingCard } from '@/components/TradingCard'
import { Books, MagnifyingGlass } from '@phosphor-icons/react'
import { useState } from 'react'
import type { Leader } from '@/lib/types'

interface AlbumPageProps {
  leaders: Leader[]
  onLeaderClick: (leader: Leader) => void
}

export function AlbumPage({ leaders, onLeaderClick }: AlbumPageProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLeaders = leaders.filter(
    leader =>
      leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Books weight="fill" className="text-primary" size={36} />
          Seleção de Líderes
        </h1>
        <p className="text-muted-foreground">
          Explore as figurinhas dos técnicos da Copa dos Líderes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Álbum Completo</CardTitle>
          <CardDescription>
            Clique em qualquer figurinha para ver detalhes e avaliar o líder
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
          {filteredLeaders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma figurinha encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredLeaders.map((leader) => (
                <TradingCard
                  key={leader.id}
                  leader={leader}
                  onClick={() => onLeaderClick(leader)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
