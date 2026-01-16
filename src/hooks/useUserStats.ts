import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  balance: number;
  earningsToday: number;
  earningsYesterday: number;
  availableBalance: number;
  totalWithdrawn: number;
  totalGamesPlayed: number;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>({
    balance: 0,
    earningsToday: 0,
    earningsYesterday: 0,
    availableBalance: 0,
    totalWithdrawn: 0,
    totalGamesPlayed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Charger les stats depuis la base de données
  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      if (data) {
        setStats({
          balance: Number(data.balance) || 0,
          earningsToday: Number(data.earnings_today) || 0,
          earningsYesterday: Number(data.earnings_yesterday) || 0,
          availableBalance: Number(data.available_balance) || 0,
          totalWithdrawn: Number(data.total_withdrawn) || 0,
          totalGamesPlayed: Number(data.total_games_played) || 0,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Ajouter des gains au solde et sauvegarder en base
  const addEarnings = useCallback(async (amount: number, gameId: string, gameTitle: string, durationPlayed: number) => {
    if (!userId || amount <= 0) return;

    try {
      // Mettre à jour le state local immédiatement
      setStats(prev => ({
        ...prev,
        balance: prev.balance + amount,
        earningsToday: prev.earningsToday + amount,
        availableBalance: prev.availableBalance + amount,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
      }));

      // Sauvegarder les gains de la partie
      await supabase
        .from('game_earnings')
        .insert({
          user_id: userId,
          game_id: gameId,
          game_title: gameTitle,
          amount: amount,
          duration_played: durationPlayed,
        });

      // Mettre à jour les stats utilisateur
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('balance, earnings_today, available_balance, total_games_played')
        .eq('user_id', userId)
        .single();

      if (currentStats) {
        await supabase
          .from('user_stats')
          .update({
            balance: Number(currentStats.balance) + amount,
            earnings_today: Number(currentStats.earnings_today) + amount,
            available_balance: Number(currentStats.available_balance) + amount,
            total_games_played: Number(currentStats.total_games_played) + 1,
          })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Error saving earnings:', error);
    }
  }, [userId]);

  // Mettre à jour le solde en temps réel (pour le jeu)
  const updateBalanceLocal = useCallback((amount: number) => {
    setStats(prev => ({
      ...prev,
      balance: prev.balance + amount,
      earningsToday: prev.earningsToday + amount,
    }));
  }, []);

  return {
    stats,
    loading,
    userId,
    addEarnings,
    updateBalanceLocal,
    refreshStats: fetchStats,
  };
};
