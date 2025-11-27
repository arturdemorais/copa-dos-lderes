export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "leader" | "admin";
          photo: string | null;
          team: string | null;
          position: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: "leader" | "admin";
          photo?: string | null;
          team?: string | null;
          position?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "leader" | "admin";
          photo?: string | null;
          team?: string | null;
          position?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leaders: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          photo: string | null;
          team: string;
          position: string;
          overall: number;
          weekly_points: number;
          task_points: number;
          assist_points: number;
          ritual_points: number;
          consistency_score: number;
          momentum: number;
          trend: "rising" | "falling" | "stable";
          rank_change: number;
          attr_communication: number;
          attr_technique: number;
          attr_management: number;
          attr_pace: number;
          attr_leadership: number;
          attr_development: number;
          strengths: string[];
          improvements: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          photo?: string | null;
          team: string;
          position: string;
          overall?: number;
          weekly_points?: number;
          task_points?: number;
          assist_points?: number;
          ritual_points?: number;
          consistency_score?: number;
          momentum?: number;
          trend?: "rising" | "falling" | "stable";
          rank_change?: number;
          attr_communication?: number;
          attr_technique?: number;
          attr_management?: number;
          attr_pace?: number;
          attr_leadership?: number;
          attr_development?: number;
          strengths?: string[];
          improvements?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          photo?: string | null;
          team?: string;
          position?: string;
          overall?: number;
          weekly_points?: number;
          task_points?: number;
          assist_points?: number;
          ritual_points?: number;
          consistency_score?: number;
          momentum?: number;
          trend?: "rising" | "falling" | "stable";
          rank_change?: number;
          attr_communication?: number;
          attr_technique?: number;
          attr_management?: number;
          attr_pace?: number;
          attr_leadership?: number;
          attr_development?: number;
          strengths?: string[];
          improvements?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          points: number;
          week_number: number | null;
          created_by: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          points?: number;
          week_number?: number | null;
          created_by?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          points?: number;
          week_number?: number | null;
          created_by?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_completions: {
        Row: {
          id: string;
          task_id: string;
          leader_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          leader_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          leader_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      peer_evaluations: {
        Row: {
          id: string;
          from_leader_id: string;
          to_leader_id: string;
          description: string;
          qualities: string[];
          points_awarded: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_leader_id: string;
          to_leader_id: string;
          description: string;
          qualities: string[];
          points_awarded?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_leader_id?: string;
          to_leader_id?: string;
          description?: string;
          qualities?: string[];
          points_awarded?: number;
          created_at?: string;
        };
      };
      team_evaluations: {
        Row: {
          id: string;
          leader_id: string;
          evaluator_email: string;
          has_support: boolean | null;
          knows_expectations: boolean | null;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          leader_id: string;
          evaluator_email: string;
          has_support?: boolean | null;
          knows_expectations?: boolean | null;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          leader_id?: string;
          evaluator_email?: string;
          has_support?: boolean | null;
          knows_expectations?: boolean | null;
          feedback?: string | null;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          type: "kudos" | "trophy" | "badge" | "task";
          leader_id: string;
          leader_name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: "kudos" | "trophy" | "badge" | "task";
          leader_id: string;
          leader_name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: "kudos" | "trophy" | "badge" | "task";
          leader_id?: string;
          leader_name?: string;
          description?: string;
          created_at?: string;
        };
      };
      score_history: {
        Row: {
          id: string;
          leader_id: string;
          week: string;
          overall: number;
          task_points: number;
          assist_points: number;
          ritual_points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          leader_id: string;
          week: string;
          overall: number;
          task_points?: number;
          assist_points?: number;
          ritual_points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          leader_id?: string;
          week?: string;
          overall?: number;
          task_points?: number;
          assist_points?: number;
          ritual_points?: number;
          created_at?: string;
        };
      };
      rituals: {
        Row: {
          id: string;
          name: string;
          type: "daily" | "weekly" | "rmr";
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "daily" | "weekly" | "rmr";
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "daily" | "weekly" | "rmr";
          date?: string;
          created_at?: string;
        };
      };
      ritual_attendance: {
        Row: {
          id: string;
          ritual_id: string;
          leader_id: string;
          present: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ritual_id: string;
          leader_id: string;
          present?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          ritual_id?: string;
          leader_id?: string;
          present?: boolean;
          created_at?: string;
        };
      };
      trophies: {
        Row: {
          id: string;
          leader_id: string;
          name: string;
          type: "golden-boot" | "golden-ball" | "fair-play";
          season: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          leader_id: string;
          name: string;
          type: "golden-boot" | "golden-ball" | "fair-play";
          season: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          leader_id?: string;
          name?: string;
          type?: "golden-boot" | "golden-ball" | "fair-play";
          season?: string;
          earned_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          leader_id: string;
          name: string;
          type: "hat-trick" | "invincible" | "shirt-10" | "wall";
          count: number;
          description: string | null;
          earned_at: string;
        };
        Insert: {
          id?: string;
          leader_id: string;
          name: string;
          type: "hat-trick" | "invincible" | "shirt-10" | "wall";
          count?: number;
          description?: string | null;
          earned_at?: string;
        };
        Update: {
          id?: string;
          leader_id?: string;
          name?: string;
          type?: "hat-trick" | "invincible" | "shirt-10" | "wall";
          count?: number;
          description?: string | null;
          earned_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
