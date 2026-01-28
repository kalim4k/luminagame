export enum Tab {
  DASHBOARD = 'dashboard',
  GAMES = 'games',
  SOCIAL = 'social',
  WALLET = 'wallet',
  PROFILE = 'profile',
  CONFIGURATION = 'configuration'
}

export interface UserStats {
  earningsToday: number;
  earningsYesterday: number;
  availableBalance: number;
  totalWithdrawn: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  avatar?: string;
  joinDate?: string;
}

export interface Game {
  id: string;
  title: string;
  category: string;
  description: string;
  reward: number;
  durationSec: number;
  image: string;
  difficulty: string;
}

export interface Transaction {
  id: string;
  type: 'withdrawal' | 'game_reward';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  provider?: string;
}

export interface WeeklyDataPoint {
  day: string;
  amount: number;
}

export interface CategoryEarning {
  name: string;
  value: number;
  color: string;
}

export interface SocialMessage {
  id: string;
  user_id: string;
  pseudo: string;
  message: string;
  created_at: string;
}
