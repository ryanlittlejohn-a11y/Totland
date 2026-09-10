CREATE TABLE public.child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Friend',
  age integer NOT NULL DEFAULT 4,
  outfit text NOT NULL DEFAULT '🎒',
  avatar_bg text NOT NULL DEFAULT 'moss',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX child_profiles_user_id_idx ON public.child_profiles (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_profiles TO authenticated;
GRANT ALL ON public.child_profiles TO service_role;

ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children" ON public.child_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Parents can add own children" ON public.child_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Parents can update own children" ON public.child_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Parents can delete own children" ON public.child_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER child_profiles_set_updated_at
  BEFORE UPDATE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();