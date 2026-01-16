import { Game, WeeklyDataPoint, UserProfile, Transaction, CategoryEarning } from '@/types';

export const GAMES: Game[] = [
  {
    id: '1',
    title: 'Triumph Game',
    category: 'Action',
    description: 'Le défi ultime pour les champions. Prouvez votre valeur.',
    reward: 2500,
    durationSec: 115,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-15-at-9.32.16-PM.jpeg',
    difficulty: 'Difficile'
  },
  {
    id: '2',
    title: 'Neon Horizon',
    category: 'Arcade',
    description: 'Surfez sur les ondes néon et évitez les obstacles.',
    reward: 450,
    durationSec: 65,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/wall8.png',
    difficulty: 'Moyen'
  },
  {
    id: '3',
    title: 'Cyber City',
    category: 'Aventure',
    description: 'Explorez la ville futuriste et trouvez les trésors cachés.',
    reward: 600,
    durationSec: 75,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/wall7.png',
    difficulty: 'Moyen'
  },
  {
    id: '4',
    title: 'Mystic Legends',
    category: 'RPG',
    description: 'Entrez dans la légende et combattez des créatures mythiques.',
    reward: 1200,
    durationSec: 100,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/wall6.png',
    difficulty: 'Difficile'
  },
  {
    id: '5',
    title: 'Space Odyssey',
    category: 'Science-Fiction',
    description: 'Voyagez à travers les galaxies inconnues.',
    reward: 350,
    durationSec: 50,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/wall5.png',
    difficulty: 'Facile'
  },
  {
    id: '6',
    title: 'Forest Mystery',
    category: 'Puzzle',
    description: 'Résolvez les énigmes de la forêt enchantée.',
    reward: 500,
    durationSec: 60,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/wall4.png',
    difficulty: 'Moyen'
  },
  {
    id: '7',
    title: 'Urban Drift',
    category: 'Course',
    description: "La course de rue la plus intense de l'année.",
    reward: 800,
    durationSec: 85,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/wall3.png',
    difficulty: 'Moyen'
  },
  {
    id: '8',
    title: 'Sky High',
    category: 'Arcade',
    description: 'Atteignez les sommets sans tomber.',
    reward: 300,
    durationSec: 55,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/wall2.png',
    difficulty: 'Facile'
  },
  {
    id: '9',
    title: 'Desert Storm',
    category: 'Action',
    description: 'Survivez à la tempête dans le désert aride.',
    reward: 900,
    durationSec: 95,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/wall1.png',
    difficulty: 'Difficile'
  },
  {
    id: '10',
    title: 'Ocean Deep',
    category: 'Aventure',
    description: "Plongez dans les profondeurs de l'océan.",
    reward: 400,
    durationSec: 52,
    image: 'https://celinaroom.com/wp-content/uploads/2026/01/wall.png',
    difficulty: 'Facile'
  }
];

export const WEEKLY_DATA: WeeklyDataPoint[] = [
  { day: 'Lun', amount: 8500 },
  { day: 'Mar', amount: 12200 },
  { day: 'Mer', amount: 9800 },
  { day: 'Jeu', amount: 16500 },
  { day: 'Ven', amount: 21000 },
  { day: 'Sam', amount: 29500 },
  { day: 'Dim', amount: 18900 },
];

export const CATEGORY_EARNINGS_DATA: CategoryEarning[] = [
  { name: 'Action', value: 35, color: '#4f46e5' },
  { name: 'Arcade', value: 20, color: '#9333ea' },
  { name: 'Aventure', value: 15, color: '#10b981' },
  { name: 'Puzzle', value: 10, color: '#f43f5e' },
  { name: 'RPG', value: 10, color: '#f59e0b' },
  { name: 'Course', value: 5, color: '#0ea5e9' },
  { name: 'Sci-Fi', value: 5, color: '#06b6d4' },
];

export const MOCK_USER: UserProfile = {
  name: 'Kalim',
  email: 'kalim@example.com',
  phone: '+225 07 07 07 07 07',
  avatar: 'https://ui-avatars.com/api/?name=Kalim&background=4f46e5&color=fff',
  joinDate: '12 Jan 2024'
};

export const PAYMENT_PROVIDERS = {
  'MTN Money': 'https://celinaroom.com/wp-content/uploads/2026/01/mtn-1-Copie-2.jpg',
  'Paypal': 'https://celinaroom.com/wp-content/uploads/2026/01/paypal1.png',
  'Orange Money': 'https://celinaroom.com/wp-content/uploads/2026/01/Orange-Money-recrute-pour-ce-poste-22-Mars-2023-Copie.png',
  'Moov Money': 'https://celinaroom.com/wp-content/uploads/2026/01/Moov_Money_Flooz-Copie.png',
  'Mix By Yass': 'https://celinaroom.com/wp-content/uploads/2026/01/mix-by-yass.jpg',
  'Wave': 'https://celinaroom.com/wp-content/uploads/2026/01/wave-Copie.png',
};

export const TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'withdrawal', amount: 10000, date: '25 Fév 2024', status: 'completed', provider: 'Moov Money' },
  { id: '2', type: 'withdrawal', amount: 3000, date: '20 Fév 2024', status: 'completed', provider: 'Mix By Yass' },
  { id: '3', type: 'withdrawal', amount: 10000, date: '18 Fév 2024', status: 'completed', provider: 'Moov Money' },
  { id: '4', type: 'withdrawal', amount: 3000, date: '15 Fév 2024', status: 'completed', provider: 'Mix By Yass' },
  { id: '5', type: 'withdrawal', amount: 10000, date: '12 Fév 2024', status: 'pending', provider: 'Moov Money' },
  { id: '6', type: 'withdrawal', amount: 3000, date: '10 Fév 2024', status: 'failed', provider: 'Mix By Yass' },
];
