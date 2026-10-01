-- SQL Schema for COSYplatform / COSYevents Supabase Database Extension
-- Reuses COSYplatform's Supabase project and profiles table.
--
-- Public metadata is separate from paid lesson content and source URLs.
-- `session_entitlements` is the authority for paid student access; profile arrays
-- are retained only for compatibility and must not grant paid access.
--
-- ANALYSIS OF PREVIOUS FAILURE MODE:
-- In the original implementation, `CREATE TABLE IF NOT EXISTS public.session_content` and
-- `ALTER TABLE public.session_content ENABLE ROW LEVEL SECURITY` executed successfully, creating
-- the table and enabling RLS. However, policy creation referenced non-existent columns (`paid_sessions`),
-- causing policy creation to error out. RLS remained enabled on `public.session_content` with ZERO active policies,
-- which under PostgreSQL default posture denied ALL non-super/service-role access.

-- 1. Ensure `enrolled_sessions` column exists on `public.profiles`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'enrolled_sessions'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN enrolled_sessions text[] DEFAULT '{}';
  END IF;
END $$;

-- 2. Ensure `hosted_sessions` column exists on `public.profiles`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'hosted_sessions'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN hosted_sessions text[] DEFAULT '{}';
  END IF;
END $$;

-- 3. Public session metadata. Keep source citations here, never direct source URLs.
CREATE TABLE IF NOT EXISTS public.session_catalog (
  session_id text PRIMARY KEY,
  title text NOT NULL,
  source_bibliography jsonb NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(source_bibliography) = 'array'),
  format text NOT NULL,
  language text NOT NULL,
  level text,
  summary text,
  is_published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create session_content table
CREATE TABLE IF NOT EXISTS public.session_content (
  session_id text PRIMARY KEY,
  vocabulary jsonb NOT NULL DEFAULT '[]'::jsonb,
  rounds jsonb NOT NULL DEFAULT '[]'::jsonb,
  grammar jsonb,
  discussion jsonb NOT NULL DEFAULT '[]'::jsonb,
  full_notes text,
  recording_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.session_content
  ADD COLUMN IF NOT EXISTS vocabulary jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rounds jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS grammar jsonb,
  ADD COLUMN IF NOT EXISTS discussion jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.session_entitlements (
  entitlement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id text NOT NULL REFERENCES public.session_catalog(session_id) ON DELETE CASCADE,
  access_starts_at timestamptz NOT NULL DEFAULT now(),
  access_expires_at timestamptz,
  revoked_at timestamptz,
  grant_source text NOT NULL DEFAULT 'manual'
    CHECK (grant_source IN ('purchase', 'plan', 'manual', 'scholarship')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_entitlements_user_session_idx
  ON public.session_entitlements (user_id, session_id);

CREATE TABLE IF NOT EXISTS public.session_sources (
  session_id text NOT NULL REFERENCES public.session_catalog(session_id) ON DELETE CASCADE,
  source_id text NOT NULL,
  source_title text NOT NULL,
  source_url text NOT NULL,
  audio_storage_path text,
  audio_content_type text,
  position integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, source_id)
);

-- 4. Enable Row Level Security
ALTER TABLE public.session_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_sources ENABLE ROW LEVEL SECURITY;

-- 5. Clean up existing policies for idempotent re-execution
DROP POLICY IF EXISTS "Founder and hosts can view all session content" ON public.session_content;
DROP POLICY IF EXISTS "Founder and teachers can view all session content" ON public.session_content;
DROP POLICY IF EXISTS "Founders can view all session content" ON public.session_content;
DROP POLICY IF EXISTS "Hosts can view their own hosted sessions" ON public.session_content;
DROP POLICY IF EXISTS "Teachers can view their own hosted sessions" ON public.session_content;
DROP POLICY IF EXISTS "Students view paid or enrolled sessions" ON public.session_content;
DROP POLICY IF EXISTS "Students can view their enrolled sessions" ON public.session_content;
DROP POLICY IF EXISTS "Students can view entitled session content" ON public.session_content;
DROP POLICY IF EXISTS "Public can view published session catalog" ON public.session_catalog;
DROP POLICY IF EXISTS "Users can view their own session entitlements" ON public.session_entitlements;
DROP POLICY IF EXISTS "Students can view entitled session sources" ON public.session_sources;
DROP POLICY IF EXISTS "Founders and teachers can view session sources" ON public.session_sources;
DROP POLICY IF EXISTS "Founder and hosts can insert and update session content" ON public.session_content;
DROP POLICY IF EXISTS "Founder and teachers can insert and update session content" ON public.session_content;
DROP POLICY IF EXISTS "Founders and hosts can insert and update their own session cont" ON public.session_content;
DROP POLICY IF EXISTS "Founders and teachers can insert and update their own session c" ON public.session_content;
DROP POLICY IF EXISTS "Hosts can manage session content" ON public.session_content;

-- Policy 1: Founders can view all session content
CREATE POLICY "Founders can view all session content"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'founder'
    )
  );

-- Policy 2: Teachers can view their own hosted sessions
CREATE POLICY "Teachers can view their own hosted sessions"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
        AND session_content.session_id = ANY(hosted_sessions)
    )
  );

-- Policy 3: Students can view content with a current, server-granted entitlement
CREATE POLICY "Students can view entitled session content"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.session_entitlements entitlement
      WHERE entitlement.user_id = auth.uid()
        AND entitlement.session_id = session_content.session_id
        AND entitlement.access_starts_at <= now()
        AND (entitlement.access_expires_at IS NULL OR entitlement.access_expires_at > now())
        AND entitlement.revoked_at IS NULL
    )
  );

-- Policy 4: Founders and teachers can insert and update their own session content
CREATE POLICY "Hosts can manage session content"
  ON public.session_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'founder'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'teacher'
        AND session_content.session_id = ANY(hosted_sessions)
    )
  );

CREATE POLICY "Public can view published session catalog"
  ON public.session_catalog
  FOR SELECT
  TO anon, authenticated
  USING (is_published);

CREATE POLICY "Users can view their own session entitlements"
  ON public.session_entitlements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Students can view entitled session sources"
  ON public.session_sources
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_entitlements entitlement
      WHERE entitlement.user_id = auth.uid()
        AND entitlement.session_id = session_sources.session_id
        AND entitlement.access_starts_at <= now()
        AND (entitlement.access_expires_at IS NULL OR entitlement.access_expires_at > now())
        AND entitlement.revoked_at IS NULL
    )
  );

CREATE POLICY "Founders and teachers can view session sources"
  ON public.session_sources
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles profile
      WHERE profile.id = auth.uid()
        AND profile.role = 'founder'
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles profile
      WHERE profile.id = auth.uid()
        AND profile.role = 'teacher'
        AND session_sources.session_id = ANY(profile.hosted_sessions)
    )
  );

REVOKE ALL ON TABLE public.session_catalog FROM anon, authenticated;
GRANT SELECT ON TABLE public.session_catalog TO anon, authenticated;
GRANT ALL ON TABLE public.session_catalog TO service_role;

REVOKE ALL ON TABLE public.session_content FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.session_content TO authenticated;
GRANT ALL ON TABLE public.session_content TO service_role;

REVOKE ALL ON TABLE public.session_entitlements FROM anon, authenticated;
GRANT SELECT ON TABLE public.session_entitlements TO authenticated;
GRANT ALL ON TABLE public.session_entitlements TO service_role;

REVOKE ALL ON TABLE public.session_sources FROM anon, authenticated;
GRANT SELECT ON TABLE public.session_sources TO authenticated;
GRANT ALL ON TABLE public.session_sources TO service_role;

-- Audio presentations are private objects. Only the service role uploads them.
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-source-audio', 'session-source-audio', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Entitled users can read session source audio" ON storage.objects;
CREATE POLICY "Entitled users can read session source audio"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'session-source-audio'
    AND EXISTS (
      SELECT 1
      FROM public.session_sources source_row
      WHERE source_row.audio_storage_path = storage.objects.name
        AND (
          EXISTS (
            SELECT 1 FROM public.session_entitlements entitlement
            WHERE entitlement.user_id = auth.uid()
              AND entitlement.session_id = source_row.session_id
              AND entitlement.access_starts_at <= now()
              AND (entitlement.access_expires_at IS NULL OR entitlement.access_expires_at > now())
              AND entitlement.revoked_at IS NULL
          )
          OR EXISTS (
            SELECT 1 FROM public.profiles profile
            WHERE profile.id = auth.uid()
              AND profile.role = 'founder'
          )
          OR EXISTS (
            SELECT 1 FROM public.profiles profile
            WHERE profile.id = auth.uid()
              AND profile.role = 'teacher'
              AND source_row.session_id = ANY(profile.hosted_sessions)
          )
        )
    )
  );
