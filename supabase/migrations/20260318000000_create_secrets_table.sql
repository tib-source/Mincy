-- Generic encrypted secrets table for storing provider tokens etc.
CREATE TABLE IF NOT EXISTS public.secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name VARCHAR NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, name)
);

-- Enable RLS
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;

-- Users can only read their own secrets
CREATE POLICY "Users can view own secrets"
  ON public.secrets FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update/delete (edge function uses service role)
CREATE POLICY "Service role can manage secrets"
  ON public.secrets FOR ALL
  USING (auth.role() = 'service_role');
