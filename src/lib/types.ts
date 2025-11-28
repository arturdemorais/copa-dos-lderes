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
  assistPoints: number;
  ritualPoints: number;
  vorpCoins: number; // Moeda acumulativa para loja de prêmios
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
  monthlyChampionships: MonthlyChampion[]; // Histórico de campeões mensais
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
  type:
    | "hat-trick"
    | "invincible"
    | "shirt-10"
    | "wall"
    | "artilheiro"
    | "assistencia-rei"
    | "muro"
    | "fair-play"
    | "consistente"
    | "subida-relampago";
  count: number;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedAt: string;
  vorpCoinsReward: number; // Quantidade de Vorp Coins ganhas ao conquistar
}

export interface Ritual {
  id: string;
  name: string;
  type: "daily" | "weekly" | "rmr";
  date?: string; // Optional: for specific date instances
  isActive?: boolean;
}

export type AttendanceStatus = "present" | "late" | "absent";

export interface RitualAttendance {
  id?: string;
  leaderId: string;
  ritualId: string;
  date: string;
  status: AttendanceStatus;
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
  assistPoints: number;
  ritualPoints: number;
  timestamp: string;
}

export interface ScoreWeights {
  tasks: number;
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

// Sistema de Temporada 2026
export interface Season {
  id: string;
  name: string; // "Vorp League 2026"
  year: number;
  startDate: string;
  endDate: string;
  currentMonth: number;
  status: "active" | "completed";
}

// Campeões Mensais
export interface MonthlyChampion {
  month: number; // 1-12
  year: number;
  leaderId: string;
  leaderName: string;
  finalScore: number;
  vorpCoinsEarned: number;
  badgeEarned?: string;
}

// Rankings por Atributo
export interface AttributeRanking {
  category:
    | "tasks"
    | "assists"
    | "rituals"
    | "energy"
    | "weeklyQuestions";
  leaderId: string;
  leaderName: string;
  value: number;
  position: number;
}

// Sistema de Vorp Coins
export interface VorpCoinTransaction {
  id: string;
  leaderId: string;
  amount: number;
  type: "earned" | "spent";
  reason: string; // "Completou task", "Comprou prêmio X"
  timestamp: string;
}

// Loja de Prêmios
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number; // Custo em Vorp Coins
  category: "experience" | "physical" | "digital" | "benefit";
  stock: number;
  imageUrl?: string;
  isAvailable: boolean;
}

// Compras da Loja
export interface StorePurchase {
  id: string;
  leaderId: string;
  storeItemId?: string | null;
  itemName: string;
  pricePaid: number;
  status: "pending" | "approved" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// Histórico de Momentum (para gráfico)
export interface MomentumHistory {
  week: string;
  value: number;
  trend: "up" | "down" | "stable";
}
