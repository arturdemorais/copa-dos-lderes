import type { Leader, ScoreHistory } from './types'

export function createSampleLeaders(): Leader[] {
  const generateHistory = (weeks: number, baseScore: number): ScoreHistory[] => {
    const history: ScoreHistory[] = []
    let currentScore = baseScore
    
    for (let i = 1; i <= weeks; i++) {
      const variation = Math.floor(Math.random() * 30) - 15
      currentScore = Math.max(0, currentScore + variation)
      
      history.push({
        week: `Semana ${i}`,
        overall: currentScore,
        taskPoints: Math.floor(currentScore * 0.4),
        fanScore: Math.min(10, (currentScore * 0.25) / 10),
        assistPoints: Math.floor(currentScore * 0.15),
        ritualPoints: Math.floor(currentScore * 0.15),
        timestamp: new Date(Date.now() - (weeks - i) * 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
    
    return history
  }
  
  return [
    {
      id: 'leader-1',
      name: 'Ana Silva',
      email: 'ana.silva@copa.com',
      team: 'Engenharia',
      position: 'Tech Lead',
      overall: 285,
      weeklyPoints: 45,
      taskPoints: 120,
      fanScore: 8.5,
      assistPoints: 35,
      ritualPoints: 45,
      momentum: 12,
      trend: 'rising',
      rankChange: 2,
      consistencyScore: 0.85,
      attributes: {
        communication: 85,
        technique: 90,
        management: 88,
        pace: 82,
        leadership: 87,
        development: 84
      },
      strengths: ['Comunicação clara', 'Visão técnica', 'Empatia com o time'],
      improvements: ['Delegação de tarefas', 'Gestão de conflitos'],
      trophies: [],
      badges: [],
      history: generateHistory(4, 250)
    },
    {
      id: 'leader-2',
      name: 'Carlos Mendes',
      email: 'carlos.mendes@copa.com',
      team: 'Produto',
      position: 'Product Manager',
      overall: 270,
      weeklyPoints: 38,
      taskPoints: 110,
      fanScore: 7.8,
      assistPoints: 42,
      ritualPoints: 38,
      momentum: -5,
      trend: 'stable',
      rankChange: -1,
      consistencyScore: 0.78,
      attributes: {
        communication: 88,
        technique: 75,
        management: 85,
        pace: 90,
        leadership: 82,
        development: 80
      },
      strengths: ['Visão estratégica', 'Relacionamento com stakeholders', 'Priorização'],
      improvements: ['Conhecimento técnico', 'Feedback construtivo'],
      trophies: [],
      badges: [],
      history: generateHistory(4, 275)
    },
    {
      id: 'leader-3',
      name: 'Beatriz Costa',
      email: 'beatriz.costa@copa.com',
      team: 'Engenharia',
      position: 'Engineering Manager',
      overall: 310,
      weeklyPoints: 52,
      taskPoints: 135,
      fanScore: 9.2,
      assistPoints: 48,
      ritualPoints: 52,
      momentum: 18,
      trend: 'rising',
      rankChange: 3,
      consistencyScore: 0.92,
      attributes: {
        communication: 92,
        technique: 88,
        management: 94,
        pace: 85,
        leadership: 93,
        development: 91
      },
      strengths: ['Desenvolvimento de pessoas', 'Criação de cultura', 'Execução impecável'],
      improvements: ['Work-life balance', 'Delegar mais'],
      trophies: [],
      badges: [],
      history: generateHistory(4, 280)
    },
    {
      id: 'leader-4',
      name: 'Daniel Oliveira',
      email: 'daniel.oliveira@copa.com',
      team: 'Design',
      position: 'Design Lead',
      overall: 245,
      weeklyPoints: 35,
      taskPoints: 95,
      fanScore: 7.2,
      assistPoints: 28,
      ritualPoints: 42,
      momentum: -8,
      trend: 'falling',
      rankChange: -2,
      consistencyScore: 0.65,
      attributes: {
        communication: 78,
        technique: 92,
        management: 72,
        pace: 88,
        leadership: 75,
        development: 82
      },
      strengths: ['Excelência técnica', 'Criatividade', 'Atenção aos detalhes'],
      improvements: ['Gestão de tempo', 'Comunicação com stakeholders', 'Liderança de equipe'],
      trophies: [],
      badges: [],
      history: generateHistory(4, 260)
    },
    {
      id: 'leader-5',
      name: 'Elena Santos',
      email: 'elena.santos@copa.com',
      team: 'Produto',
      position: 'Head of Product',
      overall: 295,
      weeklyPoints: 48,
      taskPoints: 125,
      fanScore: 8.8,
      assistPoints: 45,
      ritualPoints: 48,
      momentum: 10,
      trend: 'rising',
      rankChange: 1,
      consistencyScore: 0.88,
      attributes: {
        communication: 90,
        technique: 82,
        management: 91,
        pace: 87,
        leadership: 89,
        development: 88
      },
      strengths: ['Visão de produto', 'Colaboração cross-functional', 'Tomada de decisão'],
      improvements: ['Profundidade técnica', 'Gestão de prioridades'],
      trophies: [],
      badges: [],
      history: generateHistory(4, 270)
    },
    {
      id: 'leader-6',
      name: 'Fernando Lima',
      email: 'fernando.lima@copa.com',
      team: 'Design',
      position: 'UX Manager',
      overall: 225,
      weeklyPoints: 32,
      taskPoints: 88,
      fanScore: 6.5,
      assistPoints: 25,
      ritualPoints: 35,
      momentum: 5,
      trend: 'stable',
      rankChange: 0,
      consistencyScore: 0.72,
      attributes: {
        communication: 75,
        technique: 85,
        management: 70,
        pace: 80,
        leadership: 72,
        development: 78
      },
      strengths: ['Research skills', 'Análise de dados', 'Foco no usuário'],
      improvements: ['Liderança de equipe', 'Comunicação executiva', 'Agilidade'],
      trophies: [],
      badges: [],
      history: generateHistory(4, 220)
    }
  ]
}
