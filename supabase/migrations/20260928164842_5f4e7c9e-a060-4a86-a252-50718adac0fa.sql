CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'purge-voice-generation-events',
  '17 * * * *',
  $$DELETE FROM public.voice_generation_events WHERE created_at < now() - interval '24 hours'$$
);