import { supabase } from '../supabaseClient'

export interface FeedbackSuggestion {
  id: string
  fromLeaderId: string
  suggestedLeaderId: string
  accepted: boolean | null
  shownAt: string
}

export const feedbackSuggestionService = {
  /**
   * Verificar se deve mostrar modal hoje
   */
  async shouldShowToday(leaderId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]
    
    // Verificar se já mostrou hoje
    const { data } = await supabase
      .from('feedback_suggestions')
      .select('id')
      .eq('from_leader_id', leaderId)
      .gte('shown_at', today)
      .limit(1)
      .maybeSingle()

    if (data) return false // Já mostrou hoje

    // 30% de chance
    return Math.random() < 0.3
  },

  /**
   * Sugerir líder para avaliar
   */
  async suggestLeader(fromLeaderId: string): Promise<string | null> {
    // Buscar todos os líderes exceto o próprio
    const { data: allLeaders } = await supabase
      .from('leaders')
      .select('id, team')
      .neq('id', fromLeaderId)

    if (!allLeaders || allLeaders.length === 0) return null

    // Buscar sugestões recentes (últimos 7 dias)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentSuggestions } = await supabase
      .from('feedback_suggestions')
      .select('suggested_leader_id')
      .eq('from_leader_id', fromLeaderId)
      .gte('shown_at', sevenDaysAgo.toISOString())

    const recentLeaderIds = (recentSuggestions || []).map(s => s.suggested_leader_id)

    // Buscar avaliações recentes
    const { data: recentEvaluations } = await supabase
      .from('peer_evaluations')
      .select('to_leader_id')
      .eq('from_leader_id', fromLeaderId)
      .gte('created_at', sevenDaysAgo.toISOString())

    const recentEvaluationIds = (recentEvaluations || []).map(e => e.to_leader_id)

    // Filtrar líderes não recentemente sugeridos/avaliados
    const availableLeaders = allLeaders.filter(
      l => !recentLeaderIds.includes(l.id) && !recentEvaluationIds.includes(l.id)
    )

    if (availableLeaders.length === 0) {
      // Se todos foram sugeridos, usar todos
      return allLeaders[Math.floor(Math.random() * allLeaders.length)].id
    }

    // Algoritmo de seleção:
    // 1. Buscar líder do próprio usuário
    const { data: fromLeader } = await supabase
      .from('leaders')
      .select('team')
      .eq('id', fromLeaderId)
      .single()

    // Bias: 50% chance de sugerir do mesmo time
    const sameTeamLeaders = availableLeaders.filter(l => l.team === fromLeader?.team)
    
    if (sameTeamLeaders.length > 0 && Math.random() < 0.5) {
      return sameTeamLeaders[Math.floor(Math.random() * sameTeamLeaders.length)].id
    }

    // Caso contrário, escolher aleatório
    return availableLeaders[Math.floor(Math.random() * availableLeaders.length)].id
  },

  /**
   * Registrar sugestão mostrada
   */
  async recordSuggestion(
    fromLeaderId: string,
    suggestedLeaderId: string,
    accepted: boolean
  ): Promise<FeedbackSuggestion> {
    const { data, error } = await supabase
      .from('feedback_suggestions')
      .insert({
        from_leader_id: fromLeaderId,
        suggested_leader_id: suggestedLeaderId,
        accepted
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      fromLeaderId: data.from_leader_id,
      suggestedLeaderId: data.suggested_leader_id,
      accepted: data.accepted,
      shownAt: data.shown_at
    }
  },

  /**
   * Buscar estatísticas de sugestões
   */
  async getStats(leaderId: string): Promise<{
    totalShown: number
    totalAccepted: number
    acceptanceRate: number
  }> {
    const { data } = await supabase
      .from('feedback_suggestions')
      .select('accepted')
      .eq('from_leader_id', leaderId)

    if (!data || data.length === 0) {
      return { totalShown: 0, totalAccepted: 0, acceptanceRate: 0 }
    }

    const totalShown = data.length
    const totalAccepted = data.filter(s => s.accepted === true).length
    const acceptanceRate = Math.round((totalAccepted / totalShown) * 100)

    return { totalShown, totalAccepted, acceptanceRate }
  }
}
