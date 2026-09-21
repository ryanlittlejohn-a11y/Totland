CREATE TABLE IF NOT EXISTS public.voice_generation_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS voice_generation_events_caller_idx
  ON public.voice_generation_events (caller_hash, created_at DESC);

GRANT ALL ON public.voice_generation_events TO service_role;

ALTER TABLE public.voice_generation_events ENABLE ROW LEVEL SECURITY;
-- No policies: only privileged server code (service role) may read or write.