CREATE TABLE public.store_purchases_pending (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rc_app_user_id text NOT NULL,
  subscription_id text NOT NULL UNIQUE,
  row_data jsonb NOT NULL,
  claimed_by uuid,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX store_purchases_pending_rc_idx ON public.store_purchases_pending (rc_app_user_id);
GRANT ALL ON public.store_purchases_pending TO service_role;
ALTER TABLE public.store_purchases_pending ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only service role manages pending store purchases" ON public.store_purchases_pending FOR ALL TO service_role USING (true) WITH CHECK (true);