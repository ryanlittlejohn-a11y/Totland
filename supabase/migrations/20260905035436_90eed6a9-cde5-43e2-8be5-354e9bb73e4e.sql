-- Explicitly remove write privileges from client roles on subscriptions.
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.subscriptions FROM anon;

-- Ensure the payment webhook (service role) retains full access.
GRANT ALL ON public.subscriptions TO service_role;
GRANT SELECT ON public.subscriptions TO authenticated;

-- Explicit deny policies so future grants cannot accidentally open writes.
DROP POLICY IF EXISTS "No client inserts on subscriptions" ON public.subscriptions;
CREATE POLICY "No client inserts on subscriptions"
  ON public.subscriptions FOR INSERT TO authenticated, anon
  WITH CHECK (false);

DROP POLICY IF EXISTS "No client updates on subscriptions" ON public.subscriptions;
CREATE POLICY "No client updates on subscriptions"
  ON public.subscriptions FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No client deletes on subscriptions" ON public.subscriptions;
CREATE POLICY "No client deletes on subscriptions"
  ON public.subscriptions FOR DELETE TO authenticated, anon
  USING (false);