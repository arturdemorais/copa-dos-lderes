import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from '@phosphor-icons/react'
import type { User } from '@/lib/types'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (email === 'admin@copa.com') {
      onLogin({
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@copa.com',
        role: 'admin'
      })
    } else {
      onLogin({
        id: 'leader-1',
        name: email.split('@')[0],
        email,
        role: 'leader'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground mb-4">
            <Trophy weight="fill" size={48} />
          </div>
          <h1 className="text-4xl font-bold mb-2">Copa dos Líderes</h1>
          <p className="text-muted-foreground">
            Transforme sua gestão em vitória
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar no Sistema</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar o campeonato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Entrar
              </Button>

              <div className="text-xs text-center text-muted-foreground pt-4 space-y-1">
                <p>💡 Dica: Use <strong>admin@copa.com</strong> para acessar como Admin</p>
                <p>ou qualquer outro email para acessar como Líder</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
