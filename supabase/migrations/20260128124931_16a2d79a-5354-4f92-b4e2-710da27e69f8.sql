-- Create social_messages table for group chat
CREATE TABLE public.social_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pseudo text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.social_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can view messages
CREATE POLICY "Anyone can view messages"
  ON public.social_messages FOR SELECT
  USING (true);

-- RLS: Only authenticated users can insert their own messages
CREATE POLICY "Authenticated users can insert messages"
  ON public.social_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_messages;