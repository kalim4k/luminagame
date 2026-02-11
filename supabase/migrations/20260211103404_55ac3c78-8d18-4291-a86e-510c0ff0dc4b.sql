
-- Table pour stocker les subscriptions OneSignal
CREATE TABLE public.onesignal_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  player_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, player_id)
);

-- Enable RLS
ALTER TABLE public.onesignal_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can view their subscriptions"
  ON public.onesignal_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their subscriptions"
  ON public.onesignal_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their subscriptions"
  ON public.onesignal_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_onesignal_subscriptions_user_id ON public.onesignal_subscriptions(user_id);
