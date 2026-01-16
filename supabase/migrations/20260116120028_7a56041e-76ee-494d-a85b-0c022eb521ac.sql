-- Activer l'extension pg_cron (si pas déjà activée)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Accorder les permissions nécessaires
GRANT USAGE ON SCHEMA cron TO postgres;

-- Supprimer le job s'il existe déjà (pour éviter les doublons)
SELECT cron.unschedule('reset-daily-earnings') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'reset-daily-earnings'
);

-- Créer le job cron pour s'exécuter tous les jours à minuit (UTC)
-- '0 0 * * *' = à 00:00 chaque jour
SELECT cron.schedule(
  'reset-daily-earnings',
  '0 0 * * *',
  $$SELECT public.reset_daily_earnings()$$
);