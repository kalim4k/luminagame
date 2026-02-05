import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Wallet, 
  User, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Bell,
  Search,
  Settings,
  LogOut,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Server,
  Shield,
  Wifi,
  Activity,
  Cpu,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Smartphone,
  Save,
  MoreHorizontal,
  X,
  MessageCircle
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { SourcesChart } from '@/components/dashboard/SourcesChart';
import { GameCard } from '@/components/games/GameCard';
import { GameSession } from '@/components/games/GameSession';
import { GameBlockedModal } from '@/components/games/GameBlockedModal';
import TriumphGame, { getTriumphPendingEarnings, clearTriumphSession } from '@/components/games/TriumphGame';
import { SocialChat } from '@/components/social/SocialChat';
import { GAMES, PAYMENT_PROVIDERS } from '@/constants';
import { Game, Tab, UserStats, UserProfile, WeeklyDataPoint, CategoryEarning, Transaction } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Constantes de validation pour débloquer les jeux
const VALID_API_KEY = 'sk-test-4f8a9c2d7e1b6a0c9f3e2d1a8b7c6d5e';
const VALID_PROXY_IP = '199:152.7.96';

// Fonction pour déterminer le message de salutation selon l'heure
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Bonjour', emoji: '☀️' };
  if (hour >= 12 && hour < 18) return { text: 'Bon après-midi', emoji: '🌤️' };
  return { text: 'Bonsoir', emoji: '🌙' };
};

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // User Stats State - chargé depuis Supabase
  const [stats, setStats] = useState<UserStats>({
    earningsToday: 0,
    earningsYesterday: 0,
    availableBalance: 0,
    totalWithdrawn: 0
  });
  const [userId, setUserId] = useState<string | null>(null);

  // User Profile State - chargé depuis Supabase
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const refreshStatsFromDb = async (recalculate = false) => {
    if (!userId) return;

    // Optionnellement recalculer les stats depuis les données sources
    if (recalculate) {
      const { error: rpcError } = await supabase.rpc('recalculate_user_stats', {
        target_user_id: userId
      });
      if (rpcError) {
        console.error('Error recalculating stats:', rpcError);
      }
    }

    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (statsError) {
      console.error('Error refreshing stats:', statsError);
      return;
    }

    if (userStats) {
      setStats({
        earningsToday: Number(userStats.earnings_today) || 0,
        earningsYesterday: Number(userStats.earnings_yesterday) || 0,
        availableBalance: Number(userStats.available_balance) || 0,
        totalWithdrawn: Number(userStats.total_withdrawn) || 0,
      });
      setLastRefreshedAt(new Date());
    }
  };

  // Charger les données utilisateur et stats depuis Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          navigate('/auth');
          return;
        }

        setUserId(authUser.id);

        // Charger le profil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone || '',
            avatarUrl: profile.avatar_url || ''
          });
        }

        // Charger les stats
        const { data: userStats, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (statsError) {
          console.error('Error fetching stats:', statsError);
        }

        if (userStats) {
          setStats({
            earningsToday: Number(userStats.earnings_today) || 0,
            earningsYesterday: Number(userStats.earnings_yesterday) || 0,
            availableBalance: Number(userStats.available_balance) || 0,
            totalWithdrawn: Number(userStats.total_withdrawn) || 0,
          });
        }

        // Charger les gains hebdomadaires depuis game_earnings
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: earnings, error: earningsError } = await supabase
          .from('game_earnings')
          .select('amount, created_at')
          .eq('user_id', authUser.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (earningsError) {
          console.error('Error fetching earnings:', earningsError);
        }

        if (earnings && earnings.length > 0) {
          // Grouper les gains par jour de la semaine
          const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
          const dailyTotals: { [key: string]: number } = {};
          
          earnings.forEach((earning) => {
            const date = new Date(earning.created_at);
            const dayName = dayNames[date.getDay()];
            dailyTotals[dayName] = (dailyTotals[dayName] || 0) + Number(earning.amount);
          });

          // Créer les données pour le graphique dans l'ordre correct
          const orderedDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
          const newWeeklyData = orderedDays.map(day => ({
            day,
            amount: dailyTotals[day] || 0
          }));
          
          setWeeklyData(newWeeklyData);
        }

        // Charger les transactions (retraits)
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

        if (txError) {
          console.error('Error fetching transactions:', txError);
        }

        if (txData && txData.length > 0) {
          const formattedTransactions: Transaction[] = txData.map((tx) => ({
            id: tx.id,
            type: tx.type as 'withdrawal',
            amount: Number(tx.amount),
            date: new Date(tx.created_at).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }),
            status: tx.status as 'completed' | 'pending' | 'failed',
            provider: tx.provider || undefined
          }));
          setTransactions(formattedTransactions);
        }

        // Charger les gains par catégorie pour le graphique circulaire
        const categoryColors: { [key: string]: string } = {
          'Action': '#4f46e5',
          'Arcade': '#9333ea',
          'Aventure': '#10b981',
          'Puzzle': '#f43f5e',
          'RPG': '#f59e0b',
          'Course': '#0ea5e9',
          'Sci-Fi': '#06b6d4',
        };

        const gameCategories: { [key: string]: string } = {
          'Triumph Game': 'Action',
          'Desert Storm': 'Action',
          'Neon Horizon': 'Arcade',
          'Sky High': 'Arcade',
          'Cyber City': 'Aventure',
          'Ocean Deep': 'Aventure',
          'Forest Mystery': 'Puzzle',
          'Mystic Legends': 'RPG',
          'Urban Drift': 'Course',
          'Space Odyssey': 'Sci-Fi',
        };

        // Récupérer tous les gains pour calculer les catégories
        const { data: allEarnings, error: allEarningsError } = await supabase
          .from('game_earnings')
          .select('game_title, amount')
          .eq('user_id', authUser.id);

        if (allEarningsError) {
          console.error('Error fetching category earnings:', allEarningsError);
        }

        if (allEarnings && allEarnings.length > 0) {
          const categoryTotals: { [key: string]: number } = {};
          let totalAmount = 0;

          allEarnings.forEach((earning) => {
            const category = gameCategories[earning.game_title] || 'Autre';
            categoryTotals[category] = (categoryTotals[category] || 0) + Number(earning.amount);
            totalAmount += Number(earning.amount);
          });

          // Convertir en pourcentages et créer les données du graphique
          const newCategoryData: CategoryEarning[] = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value: Math.round((value / totalAmount) * 100),
            color: categoryColors[name] || '#6b7280'
          }));

          setCategoryData(newCategoryData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Récupérer les gains en attente du localStorage (en cas de crash précédent)
  useEffect(() => {
    if (!userId) return;

    const pendingSession = getTriumphPendingEarnings();
    if (pendingSession && pendingSession.earnings > 0) {
      // Sauvegarder les gains récupérés en base
      const savePendingEarnings = async () => {
        try {
          const durationPlayed = Math.round((Date.now() - pendingSession.startTime) / 1000);
          
          await supabase.from('game_earnings').insert({
            user_id: userId,
            game_id: '1',
            game_title: 'Triumph Game',
            amount: pendingSession.earnings,
            duration_played: durationPlayed,
          });

          const { data: currentStats } = await supabase
            .from('user_stats')
            .select('earnings_today, total_games_played')
            .eq('user_id', userId)
            .single();

          if (currentStats) {
            await supabase.from('user_stats').update({
              earnings_today: Number(currentStats.earnings_today) + pendingSession.earnings,
              total_games_played: Number(currentStats.total_games_played) + 1,
            }).eq('user_id', userId);
          }

          // Mettre à jour le state local
          setStats(prev => ({
            ...prev,
            earningsToday: prev.earningsToday + pendingSession.earnings,
          }));

          console.log(`Recovered ${pendingSession.earnings} FCFA from previous session`);
        } catch (error) {
          console.error('Error saving pending earnings:', error);
        } finally {
          clearTriumphSession();
        }
      };

      savePendingEarnings();
    }
  }, [userId]);

  // Flag pour bloquer le rafraîchissement automatique pendant le jeu Triumph
  const [isPlayingTriumph, setIsPlayingTriumph] = useState(false);

  // Rafraîchir les stats depuis la base (utile quand des valeurs changent côté backend)
  useEffect(() => {
    if (!userId || isPlayingTriumph) return;

    refreshStatsFromDb();

    const intervalId = window.setInterval(() => {
      if (!isPlayingTriumph) refreshStatsFromDb();
    }, 15000);

    const onFocus = () => {
      if (!isPlayingTriumph) refreshStatsFromDb();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [userId, isPlayingTriumph]);

  const greeting = getGreeting();

  // Données chargées depuis la base de données
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([
    { day: 'Lun', amount: 0 },
    { day: 'Mar', amount: 0 },
    { day: 'Mer', amount: 0 },
    { day: 'Jeu', amount: 0 },
    { day: 'Ven', amount: 0 },
    { day: 'Sam', amount: 0 },
    { day: 'Dim', amount: 0 },
  ]);

  const [categoryData, setCategoryData] = useState<CategoryEarning[]>([
    { name: 'Action', value: 0, color: '#4f46e5' },
    { name: 'Arcade', value: 0, color: '#9333ea' },
    { name: 'Aventure', value: 0, color: '#10b981' },
    { name: 'Puzzle', value: 0, color: '#f43f5e' },
    { name: 'RPG', value: 0, color: '#f59e0b' },
    { name: 'Course', value: 0, color: '#0ea5e9' },
    { name: 'Sci-Fi', value: 0, color: '#06b6d4' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Gameplay State
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  
  // Game Category State
  const [selectedCategory, setSelectedCategory] = useState<string>('Tout');

  // Config State - Charger depuis localStorage au démarrage
  const [showApiKey, setShowApiKey] = useState(false);
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('lumina_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          region: 'Europe (Paris)',
          proxyIP: '',
          secureMode: true,
          apiKey: '',
          twoFactor: true
        };
      }
    }
    return {
      region: 'Europe (Paris)',
      proxyIP: '',
      secureMode: true,
      apiKey: '',
      twoFactor: true
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Calculer si la connexion est valide (clé API ET IP correctes)
  const isConnected = useMemo(() => {
    return config.apiKey === VALID_API_KEY && config.proxyIP === VALID_PROXY_IP;
  }, [config.apiKey, config.proxyIP]);
  
  // État pour le modal de jeu bloqué
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  
  // Les jeux sont débloqués seulement si connecté (les deux valeurs correctes)
  const isGamesUnlocked = isConnected;
  
  // État pour l'erreur de configuration
  const [configError, setConfigError] = useState<string>('');
  
  // Withdrawal State
  const [withdrawalState, setWithdrawalState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalPhone, setWithdrawalPhone] = useState<string>('');
  const [withdrawalError, setWithdrawalError] = useState<string>('');

  const handleWithdrawal = async () => {
    setWithdrawalError('');
    
    // Validation
    const amount = parseInt(withdrawalAmount);
    if (!amount || amount < 2000) {
      setWithdrawalError('Le montant minimum est de 2000 FCFA');
      return;
    }
    if (amount > stats.availableBalance) {
      setWithdrawalError('Solde insuffisant');
      return;
    }
    if (!selectedPaymentMethod) {
      setWithdrawalError('Veuillez sélectionner un moyen de paiement');
      return;
    }
    if (!withdrawalPhone || withdrawalPhone.length < 8) {
      setWithdrawalError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (!userId) return;

    setWithdrawalState('loading');

    try {
      // Enregistrer la transaction dans la base de données
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'withdrawal',
        amount: amount,
        provider: selectedPaymentMethod,
        status: 'completed'
      });

      if (txError) throw txError;

      // Mettre à jour les stats utilisateur
      const { error: statsError } = await supabase
        .from('user_stats')
        .update({
          available_balance: stats.availableBalance - amount,
          total_withdrawn: stats.totalWithdrawn + amount
        })
        .eq('user_id', userId);

      if (statsError) throw statsError;

      // Mettre à jour l'état local
      setStats(prev => ({
        ...prev,
        availableBalance: prev.availableBalance - amount,
        totalWithdrawn: prev.totalWithdrawn + amount
      }));

      // Ajouter la transaction à la liste locale
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'withdrawal',
        amount: amount,
        date: new Date().toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
        status: 'completed',
        provider: selectedPaymentMethod
      };
      setTransactions(prev => [newTransaction, ...prev]);

      setWithdrawalState('success');
    } catch (error) {
      console.error('Withdrawal error:', error);
      setWithdrawalError('Une erreur est survenue. Veuillez réessayer.');
      setWithdrawalState('error');
    }
  };

  const closeWithdrawalPopup = () => {
    setWithdrawalState('idle');
    setSelectedPaymentMethod(null);
    setWithdrawalAmount('');
    setWithdrawalError('');
  };

  // Derived Data
  const categories = useMemo(() => {
    const cats = Array.from(new Set(GAMES.map(g => g.category)));
    return ['Tout', ...cats];
  }, []);

  const filteredGames = useMemo(() => {
    if (selectedCategory === 'Tout') return GAMES;
    return GAMES.filter(game => game.category === selectedCategory);
  }, [selectedCategory]);

  // Handlers
  const handlePlayGame = (game: Game) => {
    if (!isGamesUnlocked) {
      setShowBlockedModal(true);
      return;
    }
    // Activer le flag si c'est le jeu Triumph
    if (game.id === '1') {
      setIsPlayingTriumph(true);
      triumphStartTimeRef.current = Date.now();
      triumphEarningsRef.current = 0;
    }
    setActiveGame(game);
  };
  
  const handleGoToConfig = () => {
    setShowBlockedModal(false);
    setActiveTab(Tab.CONFIGURATION);
  };

  const handleGameComplete = async (reward: number) => {
    // Mise à jour locale immédiate (seul earningsToday augmente)
    setStats(prev => ({
      ...prev,
      earningsToday: prev.earningsToday + reward,
    }));
    setActiveGame(null);

    // Sauvegarder en base de données
    if (userId && activeGame) {
      try {
        // Enregistrer les gains de la partie
        await supabase.from('game_earnings').insert({
          user_id: userId,
          game_id: activeGame.id,
          game_title: activeGame.title,
          amount: reward,
          duration_played: activeGame.durationSec,
        });

        // Mettre à jour les stats utilisateur (seul earnings_today augmente)
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('earnings_today, total_games_played')
          .eq('user_id', userId)
          .single();

        if (currentStats) {
          await supabase.from('user_stats').update({
            earnings_today: Number(currentStats.earnings_today) + reward,
            total_games_played: Number(currentStats.total_games_played) + 1,
          }).eq('user_id', userId);
        }
      } catch (error) {
        console.error('Error saving game earnings:', error);
      }
    }
  };

  const handleCloseGame = () => {
    setActiveGame(null);
  };

  // Référence pour accumuler les gains du jeu Triumph
  const triumphEarningsRef = React.useRef(0);
  const triumphStartTimeRef = React.useRef<number>(Date.now());

  const handleTriumphBalanceUpdate = (amount: number) => {
    // Mise à jour locale immédiate (seul earningsToday augmente)
    setStats(prev => ({
      ...prev,
      earningsToday: prev.earningsToday + amount,
    }));
    // Accumuler les gains pour la sauvegarde finale
    triumphEarningsRef.current += amount;
  };

  // Sauvegarder les gains du jeu Triumph quand le joueur quitte
  const handleTriumphClose = async () => {
    const totalEarnings = triumphEarningsRef.current;
    const durationPlayed = Math.round((Date.now() - triumphStartTimeRef.current) / 1000);

    // Désactiver le flag de jeu en cours
    setIsPlayingTriumph(false);

    if (userId && totalEarnings > 0) {
      try {
        // Enregistrer les gains de la partie
        await supabase.from('game_earnings').insert({
          user_id: userId,
          game_id: '1', // ID du jeu Triumph
          game_title: 'Triumph Game',
          amount: totalEarnings,
          duration_played: durationPlayed,
        });

        // Mettre à jour les stats utilisateur (seul earnings_today augmente)
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('earnings_today, total_games_played')
          .eq('user_id', userId)
          .single();

        if (currentStats) {
          await supabase.from('user_stats').update({
            earnings_today: Number(currentStats.earnings_today) + totalEarnings,
            total_games_played: Number(currentStats.total_games_played) + 1,
          }).eq('user_id', userId);
        }

        // Rafraîchir les stats depuis la base après la sauvegarde
        await refreshStatsFromDb();
      } catch (error) {
        console.error('Error saving Triumph earnings:', error);
      }
    } else {
      // Rafraîchir quand même pour synchroniser
      await refreshStatsFromDb();
    }

    // Effacer la session localStorage après sauvegarde
    clearTriumphSession();

    // Reset des compteurs
    triumphEarningsRef.current = 0;
    triumphStartTimeRef.current = Date.now();
    setActiveGame(null);
  };

  const handleSaveConfig = () => {
    setConfigError('');
    setIsSaving(true);
    
    setTimeout(() => {
      // Sauvegarder la config dans localStorage
      localStorage.setItem('lumina_config', JSON.stringify(config));
      setIsSaving(false);
      
      // Vérifier si les valeurs sont correctes
      const isApiKeyValid = config.apiKey === VALID_API_KEY;
      const isIpValid = config.proxyIP === VALID_PROXY_IP;
      
      if (!config.apiKey && !config.proxyIP) {
        setConfigError('Veuillez entrer la clé API et l\'adresse IP proxy.');
      } else if (!config.apiKey) {
        setConfigError('Veuillez entrer la clé API.');
      } else if (!config.proxyIP) {
        setConfigError('Veuillez entrer l\'adresse IP proxy.');
      } else if (!isApiKeyValid && !isIpValid) {
        setConfigError('La clé API et l\'adresse IP sont incorrectes.');
      } else if (!isApiKeyValid) {
        setConfigError('La clé API est incorrecte.');
      } else if (!isIpValid) {
        setConfigError('L\'adresse IP proxy est incorrecte.');
      }
    }, 1500);
  };

  const handleNavClick = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Render Helpers
  const renderNavButtons = () => (
    <>
      <button 
        onClick={() => handleNavClick(Tab.DASHBOARD)}
        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
          activeTab === Tab.DASHBOARD 
            ? 'bg-accent text-accent-foreground font-semibold shadow-sm' 
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <LayoutDashboard size={20} />
        <span>Tableau de bord</span>
      </button>
      <button 
        onClick={() => handleNavClick(Tab.GAMES)}
        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
          activeTab === Tab.GAMES 
            ? 'bg-accent text-accent-foreground font-semibold shadow-sm' 
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <Gamepad2 size={20} />
        <span>Jeux</span>
      </button>
      <button 
        onClick={() => handleNavClick(Tab.WALLET)}
        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
          activeTab === Tab.WALLET 
            ? 'bg-accent text-accent-foreground font-semibold shadow-sm' 
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <Wallet size={20} />
        <span>Portefeuille</span>
      </button>
      <button 
        onClick={() => handleNavClick(Tab.PROFILE)}
        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
          activeTab === Tab.PROFILE 
            ? 'bg-accent text-accent-foreground font-semibold shadow-sm' 
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <User size={20} />
        <span>Profil</span>
      </button>
      <button 
        onClick={() => handleNavClick(Tab.SOCIAL)}
        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
          activeTab === Tab.SOCIAL 
            ? 'bg-accent text-accent-foreground font-semibold shadow-sm' 
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <MessageCircle size={20} />
        <span>Social</span>
      </button>
      <button 
        onClick={() => handleNavClick(Tab.CONFIGURATION)}
        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
          activeTab === Tab.CONFIGURATION 
            ? 'bg-accent text-accent-foreground font-semibold shadow-sm' 
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <Settings size={20} />
        <span>Configuration</span>
      </button>
    </>
  );

  const renderDashboard = () => (
    <div key="dashboard" className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
            {greeting.text} {user?.name?.split(' ')[0] || 'Utilisateur'} ! <span className="ml-2 text-2xl">{greeting.emoji}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Voici les performances de LUMI GAMES cette semaine.</p>
        </div>
        <button
          type="button"
          onClick={() => refreshStatsFromDb(true)}
          className="hidden md:flex items-center text-sm text-muted-foreground bg-card px-4 py-2 rounded-full border border-border shadow-sm hover:bg-secondary transition-colors"
        >
          Mise à jour : {lastRefreshedAt ? 'À l\'instant' : '—'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          label="Solde" 
          value={`${(stats.availableBalance + stats.earningsToday).toLocaleString()} FCFA`}
          icon={DollarSign}
        />
        <StatCard 
          label="Gains Aujourd'hui" 
          value={`${stats.earningsToday.toLocaleString()} FCFA`}
          icon={TrendingUp}
        />
        <StatCard 
          label="Solde Disponible" 
          value={`${stats.availableBalance.toLocaleString()} FCFA`}
          icon={Wallet}
        />
        <StatCard 
          label="Total Retiré" 
          value={`${stats.totalWithdrawn.toLocaleString()} FCFA`}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-foreground">Revenus</h3>
          </div>
          <RevenueChart data={weeklyData} />
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-2">Gains par Catégorie</h3>
          <div className="flex-1 flex items-center justify-center">
            <SourcesChart data={categoryData} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderGames = () => (
    <div key="games" className="animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        {/* Title hidden on mobile and tablet, visible on large screens */}
        <div className="hidden lg:block">
          <h2 className="text-2xl font-bold text-foreground">Catalogue de Jeux</h2>
          <p className="text-muted-foreground mt-1">Jouez et gagnez des FCFA instantanément.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-card text-muted-foreground border border-border hover:bg-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredGames.length > 0 ? (
          filteredGames.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              onPlay={handlePlayGame} 
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <Gamepad2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucun jeu trouvé dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderWallet = () => (
    <div key="wallet" className="animate-fade-in space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mon Portefeuille</h2>
          <p className="text-muted-foreground mt-1">Gérez vos retraits et consultez votre historique.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-foreground to-foreground/80 rounded-2xl p-6 text-primary-foreground shadow-xl">
            <p className="text-primary-foreground/70 text-sm mb-1 font-medium">Solde Disponible</p>
            <h3 className="text-3xl font-bold mb-6">{stats.availableBalance.toLocaleString()} FCFA</h3>
            
            <div className="flex gap-3">
              <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3 backdrop-blur-sm">
                 <div className="flex items-center text-xs text-primary-foreground/80 mb-1">
                   <TrendingUp size={14} className="mr-1 text-success" /> Gains jour
                 </div>
                 <p className="font-semibold text-lg">{stats.earningsToday.toLocaleString()} FCFA</p>
              </div>
              <div className="flex-1 bg-primary-foreground/10 rounded-xl p-3 backdrop-blur-sm">
                 <div className="flex items-center text-xs text-primary-foreground/80 mb-1">
                   <Clock size={14} className="mr-1 text-warning" /> En attente
                 </div>
                 <p className="font-semibold text-lg">0 FCFA</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">Demander un retrait</h3>
            <div className="space-y-4">
              {withdrawalError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
                  {withdrawalError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Montant à retirer</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Min: 2000 FCFA"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full pl-4 pr-16 py-3 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">FCFA</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Moyen de paiement</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PAYMENT_PROVIDERS).map(([name, logo]) => (
                    <button 
                      key={name}
                      onClick={() => setSelectedPaymentMethod(name)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                        selectedPaymentMethod === name 
                          ? 'border-primary bg-accent text-accent-foreground ring-2 ring-primary/20' 
                          : 'border-border text-muted-foreground hover:bg-accent hover:border-primary/30 hover:text-accent-foreground'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary">
                        <img src={logo} alt={name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-center leading-tight">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Numéro de téléphone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="tel" 
                    placeholder="07 00 00 00 00" 
                    value={withdrawalPhone || user?.phone || ''}
                    onChange={(e) => setWithdrawalPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleWithdrawal}
                disabled={withdrawalState === 'loading'}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawalState === 'loading' ? 'Traitement en cours...' : 'Confirmer le retrait'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Historique des retraits</h3>
            <button className="text-sm text-primary font-medium hover:text-primary/80">Tout voir</button>
          </div>
          
          <div className="overflow-y-auto max-h-[600px]">
            {transactions.filter(tx => tx.type === 'withdrawal').length > 0 ? (
              transactions.filter(tx => tx.type === 'withdrawal').map((tx) => (
                <div key={tx.id} className="p-4 sm:p-6 border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary flex items-center justify-center">
                      {tx.provider && PAYMENT_PROVIDERS[tx.provider as keyof typeof PAYMENT_PROVIDERS] ? (
                        <img 
                          src={PAYMENT_PROVIDERS[tx.provider as keyof typeof PAYMENT_PROVIDERS]} 
                          alt={tx.provider}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Wallet size={24} className="text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">
                        Retrait {tx.provider}
                      </p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">
                      -{tx.amount.toLocaleString()} FCFA
                    </p>
                    <div className="flex items-center justify-end text-xs font-medium mt-1">
                      {tx.status === 'completed' && (
                        <span className="flex items-center text-success">
                          <CheckCircle size={12} className="mr-1" /> Succès
                        </span>
                      )}
                      {tx.status === 'pending' && (
                        <span className="flex items-center text-warning">
                          <Clock size={12} className="mr-1" /> En attente
                        </span>
                      )}
                      {tx.status === 'failed' && (
                        <span className="flex items-center text-destructive">
                          <XCircle size={12} className="mr-1" /> Échec
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Wallet size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">Aucun retrait effectué</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Vos retraits apparaîtront ici</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div key="configuration" className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuration Système</h2>
          <p className="text-muted-foreground mt-1">Gérez les paramètres avancés, les serveurs et la sécurité.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full border border-success/20 text-sm font-medium">
          <Activity size={16} />
          <span>Système Opérationnel</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Server size={20} />
                </div>
                <h3 className="font-bold text-foreground">Serveur & Réseau</h3>
              </div>
              {isConnected ? (
                <span className="flex items-center text-xs font-bold text-success bg-success/10 px-2 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse"></div>
                  CONNECTÉ
                </span>
              ) : (
                <span className="flex items-center text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mr-2"></div>
                  DÉCONNECTÉ
                </span>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex justify-between">
                  <span>Région du Serveur</span>
                  <span className="text-muted-foreground font-normal text-xs">Latence: {isConnected ? '24ms' : '--'}</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Europe (Paris)', 'Afrique (Abidjan)', 'USA (Est)'].map((region) => (
                    <button 
                      key={region}
                      onClick={() => setConfig({...config, region})}
                      className={`text-sm py-2 px-3 rounded-xl border transition-all ${
                        config.region === region 
                        ? 'border-primary bg-accent text-accent-foreground font-semibold' 
                        : 'border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Adresse IP Proxy</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Ex: 192.168.1.45"
                      value={config.proxyIP}
                      onChange={(e) => setConfig({...config, proxyIP: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-foreground font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <button className="p-2.5 border border-border rounded-xl text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
                    <RefreshCw size={18} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground pl-1">Adresse IPv4 du serveur proxy sécurisé.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <Wifi size={20} className="text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Mode Faible Latence</p>
                    <p className="text-xs text-muted-foreground">Optimise les paquets pour le jeu</p>
                  </div>
                </div>
                <div 
                  onClick={() => setConfig({...config, secureMode: !config.secureMode})}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${config.secureMode ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`bg-primary-foreground w-4 h-4 rounded-full shadow-md transform transition-transform ${config.secureMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
             <div className="flex items-center gap-3 mb-4">
                <Cpu size={20} className="text-muted-foreground" />
                <h3 className="font-bold text-foreground">Performances</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Utilisation CPU</span>
                    <span>{isConnected ? '34%' : '0%'}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: isConnected ? '34%' : '0%' }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Mémoire</span>
                    <span>{isConnected ? '1.2 GB / 4 GB' : '0 GB / 4 GB'}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full transition-all duration-1000" style={{ width: isConnected ? '28%' : '0%' }}></div>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/50">
               <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                  <Shield size={20} />
                </div>
                <h3 className="font-bold text-foreground">Sécurité Avancée</h3>
              </div>
              <span className="text-xs font-bold text-primary border border-primary/30 bg-accent px-2 py-1 rounded">
                AES-256
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Clé API Développeur</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type={showApiKey ? "text" : "password"} 
                      placeholder="sk_live_..."
                      value={config.apiKey} 
                      onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                      className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl text-foreground font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button 
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button className="p-2.5 border border-border rounded-xl text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
                    <Copy size={18} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground pl-1">Entrez votre clé API privée pour activer les fonctions serveur.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm text-primary">
                     <Smartphone size={20} />
                   </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Double Authentification</p>
                    <p className="text-xs text-muted-foreground">Sécuriser les retraits via SMS</p>
                  </div>
                </div>
                <div 
                  onClick={() => setConfig({...config, twoFactor: !config.twoFactor})}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${config.twoFactor ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`bg-primary-foreground w-4 h-4 rounded-full shadow-md transform transition-transform ${config.twoFactor ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Appareils Actifs</h4>
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">iPhone 13 Pro</span>
                      </div>
                      <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded border border-success/20">Actuel</span>
                   </div>
                   <div className="flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Chrome / Windows</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Hier</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Message d'erreur */}
      {configError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle size={18} className="text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive">Erreur de connexion</p>
              <p className="text-sm text-destructive/80">{configError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 pb-8">
        <button 
          onClick={handleSaveConfig}
          disabled={isSaving}
          className={`flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg transition-all transform active:scale-95 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSaving ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              <span>Connexion en cours...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>{isConnected ? "Mettre à jour la configuration" : "Enregistrer et Connecter"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div key="profile" className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Mon Profil</h2>
        <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-primary to-primary/60"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-card shadow-md overflow-hidden bg-card flex items-center justify-center">
              {user?.avatarUrl || user?.avatar ? (
                <img src={user.avatarUrl || user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-muted-foreground" />
              )}
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left flex-1">
               <h3 className="text-2xl font-bold text-foreground">{user?.name || 'Utilisateur'}</h3>
               <p className="text-muted-foreground text-sm">Membre depuis le {user?.joinDate || 'récemment'}</p>
            </div>
            <button className="mt-4 sm:mt-0 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:bg-accent/80 transition-colors">
              Modifier l'avatar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Informations Personnelles</h4>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-foreground mb-1">Nom complet</label>
                   <div className="relative">
                     <User size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                     <input 
                       type="text" 
                       defaultValue={user?.name || ''}
                       className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-foreground font-medium"
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                   <div className="relative">
                     <Mail size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                     <input 
                       type="email" 
                       defaultValue={user?.email || ''}
                       className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-foreground font-medium"
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-foreground mb-1">Téléphone</label>
                   <div className="relative">
                     <Phone size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                     <input 
                       type="tel" 
                       defaultValue={user?.phone || ''}
                       className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-foreground font-medium"
                     />
                   </div>
                 </div>

                 <button className="px-6 py-2.5 bg-foreground text-background font-semibold rounded-xl hover:bg-foreground/90 transition-colors text-sm">
                   Enregistrer les modifications
                 </button>
               </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Préférences & Sécurité</h4>
              
              <div className="space-y-3">

                 <button 
                    onClick={() => setActiveTab(Tab.CONFIGURATION)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary transition-colors group"
                 >
                    <div className="flex items-center">
                      <div className="p-2 bg-success/10 text-success rounded-lg mr-3 group-hover:bg-success/20 transition-colors">
                        <Settings size={20} />
                      </div>
                      <span className="font-medium text-foreground">Paramètres de l'application</span>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                 </button>
                 
                 <button 
                   onClick={handleLogout}
                   className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-destructive/5 hover:border-destructive/20 transition-colors group mt-8"
                 >
                    <div className="flex items-center">
                      <div className="p-2 bg-destructive/10 text-destructive rounded-lg mr-3 group-hover:bg-destructive/20 transition-colors">
                        <LogOut size={20} />
                      </div>
                      <span className="font-medium text-destructive">Déconnexion</span>
                    </div>
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0 font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-card border-b border-border p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">LUMI GAMES</span>
        </div>
        <div className="flex items-center space-x-3">
           <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full relative transition-colors">
             <Bell size={20} />
             <span className="absolute top-1.5 right-2 w-2 h-2 bg-destructive rounded-full border border-card"></span>
           </button>
           <button 
             onClick={() => setActiveTab(Tab.PROFILE)}
             className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border border-border bg-secondary"
           >
             {user?.avatarUrl || user?.avatar ? (
               <img src={user.avatarUrl || user.avatar} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <User size={18} className="text-muted-foreground" />
             )}
           </button>
        </div>
      </div>

      <div className="flex max-w-screen-2xl mx-auto">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div 
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            <div className="relative w-72 h-full bg-card shadow-2xl flex flex-col p-6 animate-fade-in">
               <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-primary-foreground font-bold text-xl">L</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">LUMI GAMES</span>
                 </div>
                 <button 
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                 >
                   <X size={24} />
                 </button>
               </div>
               
               <div className="space-y-2 flex-1 overflow-y-auto">
                 {renderNavButtons()}
               </div>

               <div className="mt-8 pt-8 border-t border-border">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-secondary">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border shadow-sm bg-secondary flex items-center justify-center">
                      {user?.avatarUrl || user?.avatar ? (
                        <img src={user.avatarUrl || user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{user?.name || 'Utilisateur'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-card p-6 z-30">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-xl">L</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">LUMI GAMES</span>
          </div>

          <nav className="space-y-2 flex-1">
             {renderNavButtons()}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-full overflow-hidden bg-background">

          {activeTab === Tab.DASHBOARD && renderDashboard()}
          {activeTab === Tab.GAMES && renderGames()}
          {activeTab === Tab.SOCIAL && (
            <SocialChat 
              userId={userId} 
              isConnected={isConnected} 
              onGoToConfig={() => setActiveTab(Tab.CONFIGURATION)}
              onClose={() => setActiveTab(Tab.DASHBOARD)}
            />
          )}
          {activeTab === Tab.WALLET && renderWallet()}
          {activeTab === Tab.PROFILE && renderProfile()}
          {activeTab === Tab.CONFIGURATION && renderConfiguration()}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Hidden when Social tab is active (full screen) */}
      {activeTab !== Tab.SOCIAL && (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab(Tab.DASHBOARD)}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === Tab.DASHBOARD ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <LayoutDashboard size={24} strokeWidth={activeTab === Tab.DASHBOARD ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Accueil</span>
        </button>
        <button 
          onClick={() => setActiveTab(Tab.GAMES)}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === Tab.GAMES ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Gamepad2 size={24} strokeWidth={activeTab === Tab.GAMES ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Jeux</span>
        </button>
        <button 
          onClick={() => setActiveTab(Tab.SOCIAL)}
          className="flex flex-col items-center space-y-1 text-muted-foreground"
        >
          <MessageCircle size={24} strokeWidth={2} />
          <span className="text-[10px] font-medium">Social</span>
        </button>
        <button 
          onClick={() => setActiveTab(Tab.WALLET)}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === Tab.WALLET ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Wallet size={24} strokeWidth={activeTab === Tab.WALLET ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Retraits</span>
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center space-y-1 ${
            isMobileMenuOpen ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <MoreHorizontal size={24} strokeWidth={isMobileMenuOpen ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
      )}

      {/* Game Modal */}
      {activeGame && activeGame.title === 'Triumph Game' ? (
        <TriumphGame
          onBack={handleTriumphClose}
          balance={stats.availableBalance + stats.earningsToday}
          updateBalance={handleTriumphBalanceUpdate}
          initialTime={activeGame.durationSec}
          onTimeUpdate={() => {}}
        />
      ) : activeGame && (
        <GameSession 
          game={activeGame} 
          onClose={handleCloseGame} 
          onComplete={handleGameComplete} 
        />
      )}

      {/* Withdrawal Modal */}
      {withdrawalState !== 'idle' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-border animate-scale-in">
            {withdrawalState === 'loading' ? (
              <div className="flex flex-col items-center py-8">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Traitement en cours</h3>
                <p className="text-muted-foreground text-center text-sm">Veuillez patienter pendant que nous traitons votre demande de retrait...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={48} className="text-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Retrait réussi !</h3>
                <p className="text-muted-foreground text-center text-sm mb-6">Votre demande de retrait a été traitée avec succès. Vous recevrez les fonds sous peu.</p>
                <button 
                  onClick={closeWithdrawalPopup}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Blocked Modal */}
      <GameBlockedModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        onGoToConfig={handleGoToConfig}
      />
    </div>
  );
};

export default Index;
