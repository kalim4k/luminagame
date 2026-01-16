-- Mettre à jour la fonction recalculate_user_stats avec la nouvelle logique
CREATE OR REPLACE FUNCTION public.recalculate_user_stats(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_earnings_before_today BIGINT := 0;
  total_withdrawn_amount BIGINT := 0;
  today_earnings BIGINT := 0;
  yesterday_earnings BIGINT := 0;
  games_count INTEGER := 0;
  calculated_available_balance BIGINT := 0;
BEGIN
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

  -- Calculer le total des gains AVANT aujourd'hui (= solde disponible de base)
  SELECT COALESCE(SUM(amount), 0)
  INTO total_earnings_before_today
  FROM public.game_earnings
  WHERE user_id = target_user_id
    AND created_at < CURRENT_DATE;

  -- Calculer le total retiré (transactions complétées uniquement)
  SELECT COALESCE(SUM(amount), 0)
  INTO total_withdrawn_amount
  FROM public.transactions
  WHERE user_id = target_user_id 
    AND type = 'withdrawal' 
    AND status = 'completed';

  -- Calculer le nombre total de parties
  SELECT COALESCE(COUNT(*), 0)
  INTO games_count
  FROM public.game_earnings
  WHERE user_id = target_user_id;

  -- Solde disponible = gains avant aujourd'hui - retraits
  calculated_available_balance := total_earnings_before_today - total_withdrawn_amount;
  IF calculated_available_balance < 0 THEN
    calculated_available_balance := 0;
  END IF;

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
    calculated_available_balance + today_earnings, -- balance = available + today pour rétro-compatibilité
    calculated_available_balance,
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
$function$;

-- Créer la fonction reset_daily_earnings pour le reset à minuit
CREATE OR REPLACE FUNCTION public.reset_daily_earnings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Pour tous les utilisateurs:
  -- 1. available_balance = available_balance + earnings_today
  -- 2. earnings_yesterday = earnings_today
  -- 3. earnings_today = 0
  UPDATE public.user_stats
  SET 
    available_balance = available_balance + earnings_today,
    earnings_yesterday = earnings_today,
    earnings_today = 0,
    balance = available_balance + earnings_today, -- Le nouveau available_balance
    updated_at = now();
END;
$function$;