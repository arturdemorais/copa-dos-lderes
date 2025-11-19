import { supabase } from "../supabaseClient";

export interface WeeklyQuestion {
  id: string;
  question: string;
  type: "reflective" | "fun" | "technical" | "creative";
  weekNumber: number;
  year: number;
  isActive: boolean;
  createdAt: string;
}

export interface QuestionAnswer {
  id: string;
  questionId: string;
  leaderId: string;
  answer: string;
  gifUrl?: string;
  isAnonymous: boolean;
  likesCount: number;
  createdAt: string;
  leaderName?: string;
}

export const weeklyQuestionService = {
  /**
   * Buscar pergunta ativa da semana
   */
  async getCurrentQuestion(): Promise<WeeklyQuestion | null> {
    const { data, error } = await supabase
      .from("weekly_questions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      question: data.question,
      type: data.type,
      weekNumber: data.week_number,
      year: data.year,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  },

  /**
   * Criar nova pergunta (admin)
   */
  async createQuestion(
    question: string,
    type: "reflective" | "fun" | "technical" | "creative"
  ): Promise<WeeklyQuestion> {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();

    // Desativar pergunta anterior
    await supabase
      .from("weekly_questions")
      .update({ is_active: false })
      .eq("is_active", true);

    const { data, error } = await supabase
      .from("weekly_questions")
      .insert({
        question,
        type,
        week_number: weekNumber,
        year,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      question: data.question,
      type: data.type,
      weekNumber: data.week_number,
      year: data.year,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  },

  /**
   * Responder pergunta
   */
  async answerQuestion(
    questionId: string,
    leaderId: string,
    answer: string,
    gifUrl?: string,
    isAnonymous: boolean = false
  ): Promise<QuestionAnswer> {
    const { data, error } = await supabase
      .from("question_answers")
      .upsert(
        {
          question_id: questionId,
          leader_id: leaderId,
          answer,
          gif_url: gifUrl,
          is_anonymous: isAnonymous,
        },
        {
          onConflict: "question_id,leader_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      questionId: data.question_id,
      leaderId: data.leader_id,
      answer: data.answer,
      gifUrl: data.gif_url,
      isAnonymous: data.is_anonymous,
      likesCount: data.likes_count,
      createdAt: data.created_at,
    };
  },

  /**
   * Buscar respostas de uma pergunta
   */
  async getAnswers(questionId: string): Promise<QuestionAnswer[]> {
    const { data, error } = await supabase
      .from("question_answers")
      .select(
        `
        *,
        leaders (name, team, photo)
      `
      )
      .eq("question_id", questionId)
      .order("likes_count", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      questionId: row.question_id,
      leaderId: row.leader_id,
      answer: row.answer,
      gifUrl: row.gif_url,
      isAnonymous: row.is_anonymous,
      likesCount: row.likes_count,
      createdAt: row.created_at,
      leaderName: row.is_anonymous ? "Anônimo" : row.leaders?.name,
    }));
  },

  /**
   * Curtir resposta
   */
  async likeAnswer(answerId: string, leaderId: string): Promise<void> {
    // Inserir like
    const { error: likeError } = await supabase.from("answer_likes").insert({
      answer_id: answerId,
      leader_id: leaderId,
    });

    if (likeError) {
      // Se já curtiu, descurtir
      if (likeError.code === "23505") {
        await this.unlikeAnswer(answerId, leaderId);
        return;
      }
      throw likeError;
    }

    // Incrementar contador
    const { error: updateError } = await supabase.rpc(
      "increment_answer_likes",
      {
        answer_id: answerId,
      }
    );

    if (updateError) {
      // Se função não existe, fazer manualmente
      const { data: answer } = await supabase
        .from("question_answers")
        .select("likes_count")
        .eq("id", answerId)
        .single();

      await supabase
        .from("question_answers")
        .update({ likes_count: (answer?.likes_count || 0) + 1 })
        .eq("id", answerId);
    }
  },

  /**
   * Descurtir resposta
   */
  async unlikeAnswer(answerId: string, leaderId: string): Promise<void> {
    // Remover like
    await supabase
      .from("answer_likes")
      .delete()
      .eq("answer_id", answerId)
      .eq("leader_id", leaderId);

    // Decrementar contador
    const { data: answer } = await supabase
      .from("question_answers")
      .select("likes_count")
      .eq("id", answerId)
      .single();

    await supabase
      .from("question_answers")
      .update({ likes_count: Math.max(0, (answer?.likes_count || 0) - 1) })
      .eq("id", answerId);
  },

  /**
   * Verificar se líder já respondeu
   */
  async hasAnswered(questionId: string, leaderId: string): Promise<boolean> {
    const { data } = await supabase
      .from("question_answers")
      .select("id")
      .eq("question_id", questionId)
      .eq("leader_id", leaderId)
      .maybeSingle();

    return !!data;
  },

  /**
   * Utility: Calcular número da semana
   */
  getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  },
};
