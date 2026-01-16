export enum Tab {
  DASHBOARD = 'dashboard',
  GAMES = 'games',
  WALLET = 'wallet',
  PROFILE = 'profile',
  CONFIGURATION = 'configuration'
}

export interface UserStats {
  balance: number;
  earningsToday: number;
  earningsYesterday: number;
  availableBalance: number;
  totalWithdrawn: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
}

export interface Game {
  id: string;
  name: string;
  category: string;
  reward: number;
  image: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
}

export interface Transaction {
  id: string;
  type: 'withdrawal' | 'earning';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  provider?: string;
}

export interface WeeklyData {
  day: string;
  revenue: number;
  traffic: number;
}

export interface CategoryEarning {
  name: string;
  value: number;
  color: string;
}
