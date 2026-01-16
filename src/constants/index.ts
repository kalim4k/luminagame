import { Game, Transaction, WeeklyData, CategoryEarning, UserProfile } from '@/types';

export const MOCK_USER: UserProfile = {
  name: 'Kouamé',
  email: 'kouame@example.com',
  phone: '07 88 92 45 00',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  joinDate: '15 Mars 2024'
};

export const GAMES: Game[] = [
  { id: '1', name: 'Quiz Culture', category: 'Quiz', reward: 500, image: '🧠', difficulty: 'easy', duration: '3 min' },
  { id: '2', name: 'Memory Master', category: 'Mémoire', reward: 750, image: '🎯', difficulty: 'medium', duration: '5 min' },
  { id: '3', name: 'Speed Math', category: 'Mathématiques', reward: 1000, image: '🔢', difficulty: 'hard', duration: '4 min' },
  { id: '4', name: 'Word Puzzle', category: 'Mots', reward: 600, image: '📝', difficulty: 'easy', duration: '3 min' },
  { id: '5', name: 'Color Match', category: 'Réflexes', reward: 450, image: '🎨', difficulty: 'easy', duration: '2 min' },
  { id: '6', name: 'Logic Quest', category: 'Logique', reward: 850, image: '🧩', difficulty: 'medium', duration: '6 min' },
  { id: '7', name: 'Geo Master', category: 'Quiz', reward: 700, image: '🌍', difficulty: 'medium', duration: '4 min' },
  { id: '8', name: 'Pattern Pro', category: 'Logique', reward: 900, image: '🔷', difficulty: 'hard', duration: '5 min' },
];

export const WEEKLY_DATA: WeeklyData[] = [
  { day: 'Lun', revenue: 12000, traffic: 45 },
  { day: 'Mar', revenue: 18500, traffic: 62 },
  { day: 'Mer', revenue: 15000, traffic: 51 },
  { day: 'Jeu', revenue: 22000, traffic: 78 },
  { day: 'Ven', revenue: 28000, traffic: 92 },
  { day: 'Sam', revenue: 35000, traffic: 120 },
  { day: 'Dim', revenue: 30000, traffic: 105 },
];

export const CATEGORY_EARNINGS_DATA: CategoryEarning[] = [
  { name: 'Quiz', value: 35, color: '#6366f1' },
  { name: 'Mémoire', value: 25, color: '#10b981' },
  { name: 'Logique', value: 20, color: '#f59e0b' },
  { name: 'Autres', value: 20, color: '#8b5cf6' },
];

export const TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'withdrawal', amount: 15000, status: 'completed', date: 'Aujourd\'hui, 14:30', provider: 'Orange' },
  { id: '2', type: 'earning', amount: 2500, status: 'completed', date: 'Aujourd\'hui, 12:15' },
  { id: '3', type: 'withdrawal', amount: 10000, status: 'pending', date: 'Hier, 18:45', provider: 'MTN' },
  { id: '4', type: 'earning', amount: 1800, status: 'completed', date: 'Hier, 16:20' },
  { id: '5', type: 'earning', amount: 3200, status: 'completed', date: 'Hier, 11:00' },
  { id: '6', type: 'withdrawal', amount: 20000, status: 'failed', date: '14 Jan, 09:30', provider: 'Wave' },
  { id: '7', type: 'earning', amount: 950, status: 'completed', date: '13 Jan, 20:15' },
];
