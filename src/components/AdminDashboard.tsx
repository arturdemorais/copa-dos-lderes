import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Users, SoccerBall, CalendarCheck, Plus, Pencil, Trash } from '@phosphor-icons/react'
import type { Leader, Task, Ritual } from '@/lib/types'
import { toast } from 'sonner'

interface AdminDashboardProps {
  leaders: Leader[]
  tasks: Task[]
  onUpdateLeader: (leader: Leader) => void
  onCreateTask: (task: Omit<Task, 'id' | 'leaderId' | 'completed'>) => void
  onDeleteTask: (taskId: string) => void
}

export function AdminDashboard({ leaders, tasks, onUpdateLeader, onCreateTask, onDeleteTask }: AdminDashboardProps) {
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null)
  const [newTask, setNewTask] = useState({ title: '', description: '', points: 0 })

  const rituals: Ritual[] = [
    { id: 'r1', name: 'Daily Seg', type: 'daily' },
    { id: 'r2', name: 'Daily Ter', type: 'daily' },
    { id: 'r3', name: 'Daily Qua', type: 'daily' },
    { id: 'r4', name: 'Daily Qui', type: 'daily' },
    { id: 'r5', name: 'Daily Sex', type: 'daily' },
    { id: 'r6', name: 'Weekly', type: 'weekly' },
    { id: 'r7', name: 'RMR', type: 'rmr' }
  ]

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || newTask.points <= 0) {
      toast.error('Preencha todos os campos corretamente')
      return
    }

    onCreateTask(newTask)
    setNewTask({ title: '', description: '', points: 0 })
    toast.success('Task criada com sucesso!')
  }

  const handleUpdateLeader = () => {
    if (!editingLeader) return
    onUpdateLeader(editingLeader)
    setEditingLeader(null)
    toast.success('Líder atualizado com sucesso!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Painel do Administrador</h1>
        <p className="text-muted-foreground">
          Gerencie líderes, tarefas e registre os rituais
        </p>
      </div>

      <Tabs defaultValue="leaders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaders" className="flex items-center gap-2">
            <Users size={18} />
            Gerenciar Líderes
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <SoccerBall size={18} />
            Gerenciar Tasks
          </TabsTrigger>
          <TabsTrigger value="rituals" className="flex items-center gap-2">
            <CalendarCheck size={18} />
            Registrar Rituais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaders">
          <Card>
            <CardHeader>
              <CardTitle>Líderes Cadastrados</CardTitle>
              <CardDescription>
                Visualize e edite os perfis dos líderes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Posição</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaders.map((leader) => (
                      <TableRow key={leader.id}>
                        <TableCell className="font-medium">{leader.name}</TableCell>
                        <TableCell>{leader.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{leader.team}</Badge>
                        </TableCell>
                        <TableCell>{leader.position}</TableCell>
                        <TableCell>
                          <span className="font-bold">{leader.overall}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingLeader(leader)}
                              >
                                <Pencil size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Editar Perfil do Líder</DialogTitle>
                              </DialogHeader>
                              {editingLeader && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Nome</Label>
                                      <Input
                                        value={editingLeader.name}
                                        onChange={(e) =>
                                          setEditingLeader({ ...editingLeader, name: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <Input
                                        value={editingLeader.email}
                                        onChange={(e) =>
                                          setEditingLeader({ ...editingLeader, email: e.target.value })
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Time</Label>
                                      <Input
                                        value={editingLeader.team}
                                        onChange={(e) =>
                                          setEditingLeader({ ...editingLeader, team: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Posição</Label>
                                      <Input
                                        value={editingLeader.position}
                                        onChange={(e) =>
                                          setEditingLeader({ ...editingLeader, position: e.target.value })
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Pontos Fortes (separados por vírgula)</Label>
                                    <Textarea
                                      value={editingLeader.strengths.join(', ')}
                                      onChange={(e) =>
                                        setEditingLeader({
                                          ...editingLeader,
                                          strengths: e.target.value.split(',').map(s => s.trim())
                                        })
                                      }
                                    />
                                  </div>

                                  <div>
                                    <Label>Pontos a Desenvolver (separados por vírgula)</Label>
                                    <Textarea
                                      value={editingLeader.improvements.join(', ')}
                                      onChange={(e) =>
                                        setEditingLeader({
                                          ...editingLeader,
                                          improvements: e.target.value.split(',').map(s => s.trim())
                                        })
                                      }
                                    />
                                  </div>

                                  <Button onClick={handleUpdateLeader} className="w-full">
                                    Salvar Alterações
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} />
                  Criar Nova Task
                </CardTitle>
                <CardDescription>
                  Defina uma nova tarefa para os líderes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Título da Task</Label>
                  <Input
                    id="task-title"
                    placeholder="Ex: Realizar 1-on-1 com o time"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="task-description">Descrição</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Descreva a tarefa..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="task-points">Pontos de Overall</Label>
                  <Input
                    id="task-points"
                    type="number"
                    placeholder="Ex: 50"
                    value={newTask.points || ''}
                    onChange={(e) => setNewTask({ ...newTask, points: Number(e.target.value) })}
                  />
                </div>

                <Button onClick={handleCreateTask} className="w-full">
                  <Plus size={18} />
                  Criar Task
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks Ativas da Semana</CardTitle>
                <CardDescription>
                  Tarefas disponíveis para os líderes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma task cadastrada ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 border rounded-lg flex items-start justify-between gap-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{task.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                          <Badge variant="secondary">+{task.points} pontos</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rituals">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Presença nos Rituais</CardTitle>
              <CardDescription>
                Marque a presença dos líderes nos rituais da semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Líder</TableHead>
                      {rituals.map((ritual) => (
                        <TableHead key={ritual.id} className="text-center">
                          {ritual.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaders.map((leader) => (
                      <TableRow key={leader.id}>
                        <TableCell className="font-medium">{leader.name}</TableCell>
                        {rituals.map((ritual) => (
                          <TableCell key={ritual.id} className="text-center">
                            <Checkbox />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
