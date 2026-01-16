
-- Fonction pour recalculer les stats utilisateur à partir des données réelles
CREATE OR REPLACE FUNCTION public.recalculate_user_stats(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_earnings BIGINT := 0;
  total_withdrawn_amount BIGINT := 0;
  today_earnings BIGINT := 0;
  yesterday_earnings BIGINT := 0;
  games_count INTEGER := 0;
BEGIN
  -- Calculer le total des gains depuis game_earnings
  SELECT COALESCE(SUM(amount), 0), COALESCE(COUNT(*), 0)
  INTO total_earnings, games_count
  FROM public.game_earnings
  WHERE user_id = target_user_id;

  -- Calculer le total retiré (transactions complétées uniquement)
  SELECT COALESCE(SUM(amount), 0)
  INTO total_withdrawn_amount
  FROM public.transactions
  WHERE user_id = target_user_id 
    AND type = 'withdrawal' 
    AND status = 'completed';

  -- Calculer les gains d'aujourd'hui
  SELECT COALESCE(SUM(amount), 0)
  INTO today_earnings
  FROM public.game_earnings
  WHERE user_id = target_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  -- Calculer les gains d'hier
  SELECT COALESCE(SUM(amount), 0)
  INTO yesterday_earnings
  FROM public.game_earnings
  WHERE user_id = target_user_id
    AND created_at >= CURRENT_DATE - INTERVAL '1 day'
    AND created_at < CURRENT_DATE;

  -- Mettre à jour ou insérer les stats
  INSERT INTO public.user_stats (
    user_id, 
    balance, 
    available_balance, 
    total_withdrawn, 
    earnings_today, 
    earnings_yesterday,
    total_games_played
  )
  VALUES (
    target_user_id,
    total_earnings,
    total_earnings - total_withdrawn_amount,
    total_withdrawn_amount,
    today_earnings,
    yesterday_earnings,
    games_count
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    balance = EXCLUDED.balance,
    available_balance = EXCLUDED.available_balance,
    total_withdrawn = EXCLUDED.total_withdrawn,
    earnings_today = EXCLUDED.earnings_today,
    earnings_yesterday = EXCLUDED.earnings_yesterday,
    total_games_played = EXCLUDED.total_games_played,
    updated_at = now();
END;
$$;
