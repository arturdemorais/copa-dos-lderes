export type UserRole = "leader" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
}

export interface Leader {
  id: string;
  name: string;
  email: string;
  photo?: string;
  team: string;
  position: string;
  overall: number;
  weeklyPoints: number;
  taskPoints: number;
  fanScore: number;
  assistPoints: number;
  ritualPoints: number;
  attributes: {
    communication: number;
    technique: number;
    management: number;
    pace: number;
    leadership: number;
    development: number;
  };
  strengths: string[];
  improvements: string[];
  trophies: Trophy[];
  badges: Badge[];
  history: ScoreHistory[];
  momentum: number;
  trend: "rising" | "falling" | "stable";
  rankChange: number;
  consistencyScore: number;
  isAdmin?: boolean; // Flag para identificar admins
}

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  leaderId: string;
}

export interface Trophy {
  id: string;
  name: string;
  type: "golden-boot" | "golden-ball" | "fair-play";
  season: string;
  earnedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  type: "hat-trick" | "invincible" | "shirt-10" | "wall";
  count: number;
  description: string;
}

export interface Ritual {
  id: string;
  name: string;
  type: "daily" | "weekly" | "rmr";
}

export interface RitualAttendance {
  leaderId: string;
  ritualId: string;
  date: string;
  present: boolean;
}

export interface TeamEvaluation {
  id: string;
  leaderId: string;
  hasSupport: boolean;
  knowsExpectations: boolean;
  feedback?: string;
  timestamp: string;
}

export interface PeerEvaluation {
  id: string;
  fromLeaderId: string;
  toLeaderId: string;
  description: string;
  qualities: string[];
  timestamp: string;
}

export interface Activity {
  id: string;
  type: "kudos" | "trophy" | "badge" | "task";
  leaderId: string;
  leaderName: string;
  description: string;
  timestamp: string;
}

export interface ScoreHistory {
  week: string;
  overall: number;
  taskPoints: number;
  fanScore: number;
  assistPoints: number;
  ritualPoints: number;
  timestamp: string;
}

export interface ScoreWeights {
  tasks: number;
  fanScore: number;
  assists: number;
  rituals: number;
  consistency: number;
}

export interface Insight {
  type: "positive" | "warning" | "neutral";
  category: string;
  message: string;
  actionable?: string;
}
