
CREATE TABLE public.game_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  reward integer NOT NULL DEFAULT 0,
  label text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.used_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code_id uuid NOT NULL REFERENCES public.game_codes(id) ON DELETE CASCADE,
  used_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, code_id)
);

ALTER TABLE public.game_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.used_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read active codes" ON public.game_codes FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can view their own used codes" ON public.used_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own used codes" ON public.used_codes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
