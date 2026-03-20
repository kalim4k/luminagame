import { Game, WeeklyDataPoint, UserProfile, Transaction, CategoryEarning } from '@/types';

export const GAMES: Game[] = [
  {
    id: '1',
    title: 'Triumph Game',
    category: 'Action',
    description: 'Le défi ultime pour les champions. Prouvez votre valeur.',
    reward: 2500,
    durationSec: 115,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg_MKQcEOlGRKw1zqx34AZvtYaVJpl_GHIPdSD9TSrwcIZYKzPXnPC_4B0mKi0kCuDqJhmXrX2-uK2nVoCHNnpDI7xv2ifjWwhaGlsxr1UVAEHQH0SJF92U11VtV4WRTYMl96vcnb5qzgYDMfEzvybRhX2Ohpzlo_BNy_EGEvDog_5mddd0kGvXWuJk6VI/s1280/WhatsApp%20Image%202026-01-15%20at%209.32.16%20PM.jpeg',
    difficulty: 'Difficile'
  },
  {
    id: '2',
    title: 'Neon Horizon',
    category: 'Arcade',
    description: 'Surfez sur les ondes néon et évitez les obstacles.',
    reward: 450,
    durationSec: 65,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhy8z3v-FypR64d8mu4KLyohM-HpW3jeACanyVgnyl8KR5wYWQZHf4YGWzq_If_jDzmghmLvnAWuRBzLWLRxcIp2aNwEvJMZmAF2W47w7KwjgvZfa6-86sKRflFYnKb1WhktgByFdy0VfDBzXwEcoU5DaPUCVX3tS8GiXego-EWPmYuAITEWrfGcukMZLw/s1024/wall8.png',
    difficulty: 'Moyen'
  },
  {
    id: '3',
    title: 'Cyber City',
    category: 'Aventure',
    description: 'Explorez la ville futuriste et trouvez les trésors cachés.',
    reward: 600,
    durationSec: 75,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjgktsJMl5Jq3ovOkVhFIp0wtkYmsoSF8e0ZDEMZpEOIADiN6vHQtt-0cZM7z1IsQfYMeJj6YrDNxIzzkEuZG42uDRGKUTXZgjp8eBQFdpSPfYjg3D-If0JeSlSF4n6ryXl4ZJZlX0-nnPg-eKlZ54cY_U-11rgqSfsg_laVHqAe5XCvqzImoGshrS_e4s/s1024/wall7.png',
    difficulty: 'Moyen'
  },
  {
    id: '4',
    title: 'Mystic Legends',
    category: 'RPG',
    description: 'Entrez dans la légende et combattez des créatures mythiques.',
    reward: 1200,
    durationSec: 100,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjJppGzL8-Zt9k0SNu4k-DRYUEMXFLsIdxOAtrHLz06XEzal2aqKcEJPuRSCGFsp6HUNhlafqzwsvewpXWF_SPTdVDb8kNOMlh2IcRabaLm9tPSAIcBxvnBrGWEC0xkKFuR-efNZ-oz3A0gPPnPtRqevWHSQoRF4CWNVCyhbY0TxUbQpTrbOcF5WteUYgU/s1024/wall6.png',
    difficulty: 'Difficile'
  },
  {
    id: '5',
    title: 'Space Odyssey',
    category: 'Science-Fiction',
    description: 'Voyagez à travers les galaxies inconnues.',
    reward: 350,
    durationSec: 50,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEggcc3PitPkPKTRuyw67IEMLNv0v3cSbXqA2MaqHEbE82ZjWsxKiz1h92Pp3hTNUmV12DDGYySaOOS4DAui5E4h9hmp9ajelc3afswj9fGymXdt8jSM_v1ek4oXjyorOgd5CxQZtQjjF5AHFJRDdyFwyFGf3eiR7o8Awl7I08aQOJ7Fww5eaGohGlJtSCs/s1024/wall5.png',
    difficulty: 'Facile'
  },
  {
    id: '6',
    title: 'Forest Mystery',
    category: 'Puzzle',
    description: 'Résolvez les énigmes de la forêt enchantée.',
    reward: 500,
    durationSec: 60,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi4grcqfqHEJgoWd4RgvlunzEVu__GZx2XsfwFs4nNwDDk0nNcdSM-gVUD8VHqWBf1Tajrwv-8vVE6ilcJd_DcQI6qpjNkvajj_7d5QUiV0ilRY9cHo1N84W8EhGGoTnYYLAxIrwF5ZVoXY4yYjyqcG96PMZ-uLwGuDLR5z5OiOTS7yT_DqrhjQh-wCgdg/s1024/wall4.png',
    difficulty: 'Moyen'
  },
  {
    id: '7',
    title: 'Urban Drift',
    category: 'Course',
    description: "La course de rue la plus intense de l'année.",
    reward: 800,
    durationSec: 85,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhIMrN5ujWxdjuymi2pHMIhimED4KTDeYvUG_dNxx_v02ALY5c7Mglk8B522pdvxIMpePaxgRnZU6fUXQ7Po9ZmVCuY3vYIbskLzrQYCfJnTLpyQYL4ePSNk6-GNdTbsQKyFWtaqAQtsxIt3QCStgrYSWPK9hXkCwFSn7Q2zk1nj2CB6JvlLHKalDiF1i0/s1024/wall3.png',
    difficulty: 'Moyen'
  },
  {
    id: '8',
    title: 'Sky High',
    category: 'Arcade',
    description: 'Atteignez les sommets sans tomber.',
    reward: 300,
    durationSec: 55,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiME48oDtwBHE4M7R20LrOxBaW7CtNgLw9QGHQ_HgJ6mT7verWWLNo98pX0M4H2OMLsUBFi1eylDq-GYDVyjbi-N0zoPenx_GY16oQUMDwhB3qx_AerUwLVvn7gmHbDUhf6Fu_FOYCSWVKfPP4SvvCHArxweGoB7uRyJX8zj_gn518OGdVibANGnufLZ4w/s1024/wall2.png',
    difficulty: 'Facile'
  },
  {
    id: '9',
    title: 'Desert Storm',
    category: 'Action',
    description: 'Survivez à la tempête dans le désert aride.',
    reward: 900,
    durationSec: 95,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiA3Ydziqt0NeVlTwwQCfP1H2kZO2tp4b8NQ58oT-JPXLq3yZfv4sYOx5h0hXswgY53V0_H5-k8Cl5YjfbRw7r7DW4rSsgq0WuQGZBdxh1w2pxXngAAMzjbfX5Jd6cu20W5lvkDDe-ShfSU5E30SW2QGrdqV3rhhFBZZoPAbstw_inrgOBCExliiPEdIAk/s1024/wall1.png',
    difficulty: 'Difficile'
  },
  {
    id: '10',
    title: 'Ocean Deep',
    category: 'Aventure',
    description: "Plongez dans les profondeurs de l'océan.",
    reward: 400,
    durationSec: 52,
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgFWps77r_JF8zwHrh14tOaTh6AbAJ4BxFhY9THf29g2OLEopjombNX3_uX2v9OpK6WOmwosD2e15-U8Ae6e0VxxWvRKEAgmHaFaRKJDYgO7fvQO_U_sQI2wlGeqIQjVBLYffloy7kPm6CjQTKyaK6-HddRmUPOPGzBbjvHJoiRTwhh3UM0SRIa714i6TY/s1024/wall.png',
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
  'MTN Money': 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/73ceff4e-a60e-46d0-ade3-292133629a7a.jpg',
  'Paypal': 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/8cf1bfef-76e2-4c1b-a57d-74b3a39e6db1.png',
  'Orange Money': 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/7b451d8c-d330-480a-b731-80a611b8d090.png',
  'Moov Money': 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/22d27599-04ae-41da-90da-0037542b9dd4.png',
  'Mix By Yass': 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/b97d7539-370a-42fb-81a4-6171a1c00e95.jpg',
  'Wave': 'https://ysbiedwkakdqadxtuwab.supabase.co/storage/v1/object/public/uploads/a8d55466-5d3f-4390-a52c-5c0183b659f2.png',
};

export const TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'withdrawal', amount: 10000, date: '25 Fév 2024', status: 'completed', provider: 'Moov Money' },
  { id: '2', type: 'withdrawal', amount: 3000, date: '20 Fév 2024', status: 'completed', provider: 'Mix By Yass' },
  { id: '3', type: 'withdrawal', amount: 10000, date: '18 Fév 2024', status: 'completed', provider: 'Moov Money' },
  { id: '4', type: 'withdrawal', amount: 3000, date: '15 Fév 2024', status: 'completed', provider: 'Mix By Yass' },
  { id: '5', type: 'withdrawal', amount: 10000, date: '12 Fév 2024', status: 'pending', provider: 'Moov Money' },
  { id: '6', type: 'withdrawal', amount: 3000, date: '10 Fév 2024', status: 'failed', provider: 'Mix By Yass' },
];
