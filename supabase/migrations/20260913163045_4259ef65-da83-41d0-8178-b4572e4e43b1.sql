CREATE TABLE public.contact_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  replied_at timestamp with time zone,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT INSERT ON public.contact_inquiries TO anon;
GRANT INSERT ON public.contact_inquiries TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_inquiries TO service_role;
GRANT ALL ON public.contact_inquiries TO service_role;

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact inquiry" ON public.contact_inquiries FOR INSERT TO anon, authenticated WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
);
CREATE POLICY "Only service role can read inquiries" ON public.contact_inquiries FOR SELECT TO service_role USING (true);
CREATE POLICY "Only service role can update inquiries" ON public.contact_inquiries FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Only service role can delete inquiries" ON public.contact_inquiries FOR DELETE TO service_role USING (true);