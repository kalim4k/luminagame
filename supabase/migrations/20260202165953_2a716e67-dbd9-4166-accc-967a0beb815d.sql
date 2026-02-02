-- Table pour stocker les player_id OneSignal
CREATE TABLE public.onesignal_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  player_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onesignal_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own subscriptions
CREATE POLICY "Users can view their subscriptions"
  ON public.onesignal_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their subscriptions"
  ON public.onesignal_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subscriptions"
  ON public.onesignal_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their subscriptions"
  ON public.onesignal_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_onesignal_subscriptions_user_id ON public.onesignal_subscriptions(user_id);
CREATE INDEX idx_onesignal_subscriptions_player_id ON public.onesignal_subscriptions(player_id);

-- Trigger for updated_at
CREATE TRIGGER update_onesignal_subscriptions_updated_at
  BEFORE UPDATE ON public.onesignal_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();