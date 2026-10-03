-- Migration: 20261003000000_ecosystem_access.sql
-- Description: Core Ecosystem Access Control Design (Supabase Postgres + Auth + Storage)
--
-- Supersedes earlier per-session entitlement schema in scripts/schema.sql.
-- Enforces Row Level Security (RLS) for all private content based on user roles and access grants.

-- ============================================================================
-- 1. CEFR Level Helper Function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.level_rank(p_level text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE upper(trim(p_level))
    WHEN 'A0' THEN 0
    WHEN 'A1' THEN 1
    WHEN 'A2' THEN 2
    WHEN 'B1' THEN 3
    WHEN 'B2' THEN 4
    WHEN 'C1' THEN 5
    WHEN 'C2' THEN 6
    ELSE NULL
  END;
$$;

-- ============================================================================
-- 2. Core Tables
-- ============================================================================

-- Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('founder', 'teacher', 'student')),
  display_name text,
  ui_lang text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Teacher language permissions
CREATE TABLE IF NOT EXISTS public.teacher_languages (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'fr', 'it', 'ru', 'el', 'es')),
  PRIMARY KEY (user_id, language)
);

-- Access grants (subscriptions / level-based grants)
CREATE TABLE IF NOT EXISTS public.access_grants (
  grant_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'fr', 'it', 'ru', 'el', 'es')),
  level text NOT NULL CHECK (public.level_rank(level) IS NOT NULL),
  include_lower boolean NOT NULL DEFAULT false,
  course text,
  valid_from date NOT NULL DEFAULT current_date,
  valid_until date,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'pass', 'purchase', 'scholarship')),
  note text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Single-session grants
CREATE TABLE IF NOT EXISTS public.session_grants (
  grant_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id text NOT NULL, -- references session_catalog(session_id) added below
  valid_until date,
  source text NOT NULL DEFAULT 'purchase',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Public session catalog
CREATE TABLE IF NOT EXISTS public.session_catalog (
  session_id text PRIMARY KEY,
  title text NOT NULL,
  language text NOT NULL CHECK (language IN ('en', 'fr', 'it', 'ru', 'el', 'es')),
  level_min integer CHECK (level_min IS NULL OR (level_min >= 0 AND level_min <= 6)),
  level_max integer CHECK (level_max IS NULL OR (level_max >= 0 AND level_max <= 6)),
  courses text[] NOT NULL DEFAULT '{}',
  summary text,
  format text,
  source_bibliography jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(source_bibliography) = 'array'),
  is_published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_level_range CHECK (
    (level_min IS NULL AND level_max IS NULL) OR
    (level_min IS NOT NULL AND level_max IS NOT NULL AND level_min <= level_max)
  )
);

-- Add foreign key constraint to session_grants after session_catalog exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'session_grants_session_id_fkey' AND table_name = 'session_grants'
  ) THEN
    ALTER TABLE public.session_grants
      ADD CONSTRAINT session_grants_session_id_fkey
      FOREIGN KEY (session_id) REFERENCES public.session_catalog(session_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Private session content
CREATE TABLE IF NOT EXISTS public.session_content (
  session_id text PRIMARY KEY REFERENCES public.session_catalog(session_id) ON DELETE CASCADE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  schema_version integer NOT NULL DEFAULT 1,
  review_status text NOT NULL DEFAULT 'needs_review' CHECK (review_status IN ('needs_review', 'approved', 'rejected')),
  vocabulary jsonb NOT NULL DEFAULT '[]'::jsonb,
  rounds jsonb NOT NULL DEFAULT '[]'::jsonb,
  grammar jsonb,
  discussion jsonb NOT NULL DEFAULT '[]'::jsonb,
  full_notes text,
  recording_url text,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Private session sources
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

-- Teacher-only session notes
CREATE TABLE IF NOT EXISTS public.session_teacher_notes (
  session_id text PRIMARY KEY REFERENCES public.session_catalog(session_id) ON DELETE CASCADE,
  notes text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Revisions log table for session content
CREATE TABLE IF NOT EXISTS public.session_revisions (
  revision_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id text NOT NULL,
  content jsonb NOT NULL,
  schema_version integer NOT NULL,
  review_status text,
  updated_by uuid,
  updated_at timestamptz,
  action text NOT NULL CHECK (action IN ('UPDATE', 'DELETE')),
  archived_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. Triggers & Helper Functions
-- ============================================================================

-- Automatic profile creation on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name, ui_lang)
  VALUES (
    NEW.id,
    'student',
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'ui_lang', 'en')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: Check if current user is founder
CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'founder'
  );
$$;

-- Helper: Check if current user is teacher of a language
CREATE OR REPLACE FUNCTION public.is_teacher_of(p_language text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.teacher_languages tl ON tl.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = 'teacher'
      AND tl.language = p_language
  );
$$;

-- Core Access Evaluation Function: can_read_session(p_session_id)
CREATE OR REPLACE FUNCTION public.can_read_session(p_session_id text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_lang text;
  v_level_min integer;
  v_level_max integer;
  v_courses text[];
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Founder access
  SELECT role INTO v_role FROM public.profiles WHERE id = v_uid;
  IF v_role = 'founder' THEN
    RETURN true;
  END IF;

  -- Get session details
  SELECT language, level_min, level_max, courses
    INTO v_lang, v_level_min, v_level_max, v_courses
    FROM public.session_catalog
   WHERE session_id = p_session_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- 2. Teacher access (teacher of the session's language)
  IF v_role = 'teacher' THEN
    IF EXISTS (
      SELECT 1 FROM public.teacher_languages
      WHERE user_id = v_uid AND language = v_lang
    ) THEN
      RETURN true;
    END IF;
  END IF;

  -- 3. Student access
  -- Note: Sessions with NULL level_min or level_max are readable by founders and teachers only!
  IF v_level_min IS NULL OR v_level_max IS NULL THEN
    RETURN false;
  END IF;

  -- Single-session purchase match
  IF EXISTS (
    SELECT 1 FROM public.session_grants
    WHERE user_id = v_uid
      AND session_id = p_session_id
      AND (valid_until IS NULL OR current_date <= valid_until)
  ) THEN
    RETURN true;
  END IF;

  -- Access grants (subscriptions / level grants) match
  IF EXISTS (
    SELECT 1 FROM public.access_grants g
    WHERE g.user_id = v_uid
      AND g.language = v_lang
      AND current_date >= g.valid_from
      AND (g.valid_until IS NULL OR current_date <= g.valid_until)
      AND (
        (NOT g.include_lower AND v_level_min <= public.level_rank(g.level) AND public.level_rank(g.level) <= v_level_max)
        OR
        (g.include_lower AND v_level_min <= public.level_rank(g.level))
      )
      AND (
        cardinality(v_courses) = 0
        OR g.course = ANY(v_courses)
      )
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- My Access summary function for current user
CREATE OR REPLACE FUNCTION public.my_access()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_display_name text;
  v_teaches jsonb := '[]'::jsonb;
  v_grants jsonb := '[]'::jsonb;
  v_session_grants jsonb := '[]'::jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'Not authenticated');
  END IF;

  SELECT role, display_name INTO v_role, v_display_name
  FROM public.profiles WHERE id = v_uid;

  SELECT COALESCE(jsonb_agg(language), '[]'::jsonb) INTO v_teaches
  FROM public.teacher_languages WHERE user_id = v_uid;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'language', language,
    'level', level,
    'include_lower', include_lower,
    'course', course,
    'valid_until', valid_until
  )), '[]'::jsonb) INTO v_grants
  FROM public.access_grants WHERE user_id = v_uid;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'session_id', session_id,
    'valid_until', valid_until
  )), '[]'::jsonb) INTO v_session_grants
  FROM public.session_grants WHERE user_id = v_uid;

  RETURN jsonb_build_object(
    'role', v_role,
    'display_name', v_display_name,
    'teaches', v_teaches,
    'grants', v_grants,
    'session_grants', v_session_grants
  );
END;
$$;

-- Role management function: set_user_role(target, new_role)
CREATE OR REPLACE FUNCTION public.set_user_role(target uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_role text;
  v_founder_count integer;
BEGIN
  -- Callable only by a founder
  IF NOT public.is_founder() THEN
    RAISE EXCEPTION 'Only founders can set user roles';
  END IF;

  IF new_role NOT IN ('founder', 'teacher', 'student') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  SELECT role INTO v_current_role FROM public.profiles WHERE id = target;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found: %', target;
  END IF;

  -- Refuse to demote the last founder
  IF v_current_role = 'founder' AND new_role <> 'founder' THEN
    SELECT count(*) INTO v_founder_count FROM public.profiles WHERE role = 'founder';
    IF v_founder_count <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last founder';
    END IF;
  END IF;

  UPDATE public.profiles
     SET role = new_role
   WHERE id = target;
END;
$$;

-- Trigger to record revisions on session_content UPDATE or DELETE
CREATE OR REPLACE FUNCTION public.log_session_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.session_revisions (
      session_id, content, schema_version, review_status, updated_by, updated_at, action
    ) VALUES (
      OLD.session_id, OLD.content, OLD.schema_version, OLD.review_status, OLD.updated_by, OLD.updated_at, 'UPDATE'
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.session_revisions (
      session_id, content, schema_version, review_status, updated_by, updated_at, action
    ) VALUES (
      OLD.session_id, OLD.content, OLD.schema_version, OLD.review_status, OLD.updated_by, OLD.updated_at, 'DELETE'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_session_content_revisions ON public.session_content;
CREATE TRIGGER trg_session_content_revisions
  BEFORE UPDATE OR DELETE ON public.session_content
  FOR EACH ROW EXECUTE FUNCTION public.log_session_revision();

-- Revoke default public execute on security definer functions and grant appropriately
REVOKE EXECUTE ON FUNCTION public.is_founder() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_teacher_of(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_read_session(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.my_access() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.level_rank(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_founder() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_of(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_session(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text) TO authenticated;

-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_teacher_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_revisions ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles founder all" ON public.profiles;

DROP POLICY IF EXISTS "Teacher languages select" ON public.teacher_languages;
DROP POLICY IF EXISTS "Teacher languages founder all" ON public.teacher_languages;

DROP POLICY IF EXISTS "Access grants select" ON public.access_grants;
DROP POLICY IF EXISTS "Access grants founder all" ON public.access_grants;

DROP POLICY IF EXISTS "Session grants select" ON public.session_grants;
DROP POLICY IF EXISTS "Session grants founder all" ON public.session_grants;

DROP POLICY IF EXISTS "Session catalog select" ON public.session_catalog;
DROP POLICY IF EXISTS "Session catalog founder all" ON public.session_catalog;

DROP POLICY IF EXISTS "Session content select" ON public.session_content;
DROP POLICY IF EXISTS "Session content founder all" ON public.session_content;

DROP POLICY IF EXISTS "Session sources select" ON public.session_sources;
DROP POLICY IF EXISTS "Session sources founder all" ON public.session_sources;

DROP POLICY IF EXISTS "Session teacher notes select" ON public.session_teacher_notes;
DROP POLICY IF EXISTS "Session teacher notes founder all" ON public.session_teacher_notes;

DROP POLICY IF EXISTS "Session revisions select" ON public.session_revisions;

-- --- PROFILES POLICIES ---
-- Users may select their own profile, founders can select all
CREATE POLICY "Profiles select policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_founder());

-- Users may update their own display_name and ui_lang via column level grants below
CREATE POLICY "Profiles update policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_founder())
  WITH CHECK (id = auth.uid() OR public.is_founder());

-- Founders can manage profiles
CREATE POLICY "Profiles founder all" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_founder());

-- Column privileges on profiles:
-- Revoke update on profiles, grant update (display_name, ui_lang) to authenticated
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, ui_lang) ON public.profiles TO authenticated;

-- --- TEACHER_LANGUAGES POLICIES ---
CREATE POLICY "Teacher languages select" ON public.teacher_languages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_founder());

CREATE POLICY "Teacher languages founder all" ON public.teacher_languages
  FOR ALL TO authenticated
  USING (public.is_founder());

-- --- ACCESS_GRANTS POLICIES ---
CREATE POLICY "Access grants select" ON public.access_grants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_founder());

CREATE POLICY "Access grants founder all" ON public.access_grants
  FOR ALL TO authenticated
  USING (public.is_founder());

-- --- SESSION_GRANTS POLICIES ---
CREATE POLICY "Session grants select" ON public.session_grants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_founder());

CREATE POLICY "Session grants founder all" ON public.session_grants
  FOR ALL TO authenticated
  USING (public.is_founder());

-- --- SESSION_CATALOG POLICIES ---
-- Public/anon and authenticated can select published catalog rows
-- Founders can select all catalog rows
CREATE POLICY "Session catalog select" ON public.session_catalog
  FOR SELECT TO anon, authenticated
  USING (is_published OR public.is_founder());

CREATE POLICY "Session catalog founder all" ON public.session_catalog
  FOR ALL TO authenticated
  USING (public.is_founder());

-- --- SESSION_CONTENT POLICIES ---
CREATE POLICY "Session content select" ON public.session_content
  FOR SELECT TO authenticated
  USING (public.can_read_session(session_id));

CREATE POLICY "Session content founder all" ON public.session_content
  FOR ALL TO authenticated
  USING (public.is_founder());

-- --- SESSION_SOURCES POLICIES ---
CREATE POLICY "Session sources select" ON public.session_sources
  FOR SELECT TO authenticated
  USING (public.can_read_session(session_id));

CREATE POLICY "Session sources founder all" ON public.session_sources
  FOR ALL TO authenticated
  USING (public.is_founder());

-- --- SESSION_TEACHER_NOTES POLICIES ---
CREATE POLICY "Session teacher notes select" ON public.session_teacher_notes
  FOR SELECT TO authenticated
  USING (
    public.is_founder() OR
    EXISTS (
      SELECT 1 FROM public.session_catalog s
      WHERE s.session_id = session_teacher_notes.session_id
        AND public.is_teacher_of(s.language)
    )
  );

CREATE POLICY "Session teacher notes founder all" ON public.session_teacher_notes
  FOR ALL TO authenticated
  USING (public.is_founder());

-- --- SESSION_REVISIONS POLICIES ---
CREATE POLICY "Session revisions select" ON public.session_revisions
  FOR SELECT TO authenticated
  USING (public.is_founder());

-- Table Grants
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

REVOKE ALL ON TABLE public.teacher_languages FROM anon, authenticated;
GRANT SELECT ON TABLE public.teacher_languages TO authenticated;
GRANT ALL ON TABLE public.teacher_languages TO service_role;

REVOKE ALL ON TABLE public.access_grants FROM anon, authenticated;
GRANT SELECT ON TABLE public.access_grants TO authenticated;
GRANT ALL ON TABLE public.access_grants TO service_role;

REVOKE ALL ON TABLE public.session_grants FROM anon, authenticated;
GRANT SELECT ON TABLE public.session_grants TO authenticated;
GRANT ALL ON TABLE public.session_grants TO service_role;

REVOKE ALL ON TABLE public.session_catalog FROM anon, authenticated;
GRANT SELECT ON TABLE public.session_catalog TO anon, authenticated;
GRANT ALL ON TABLE public.session_catalog TO service_role;

REVOKE ALL ON TABLE public.session_content FROM anon, authenticated;
GRANT SELECT ON TABLE public.session_content TO authenticated;
GRANT ALL ON TABLE public.session_content TO service_role;

REVOKE ALL ON TABLE public.session_sources FROM anon, authenticated;
GRANT SELECT ON TABLE public.session_sources TO authenticated;
GRANT ALL ON TABLE public.session_sources TO service_role;

REVOKE ALL ON TABLE public.session_teacher_notes FROM anon, authenticated;
GRANT SELECT ON TABLE public.session_teacher_notes TO authenticated;
GRANT ALL ON TABLE public.session_teacher_notes TO service_role;

REVOKE ALL ON TABLE public.session_revisions FROM anon, authenticated;
GRANT SELECT ON TABLE public.session_revisions TO authenticated;
GRANT ALL ON TABLE public.session_revisions TO service_role;

-- ============================================================================
-- 5. Storage Configuration (session-audio)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage'
  ) THEN
    -- Ensure private bucket 'session-audio' exists
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('session-audio', 'session-audio', false)
    ON CONFLICT (id) DO UPDATE SET public = false;

    -- Enable RLS on storage.objects if not already enabled
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Session audio select policy" ON storage.objects;
    DROP POLICY IF EXISTS "Session audio founder write policy" ON storage.objects;

    -- SELECT policy for audio files using object path convention '<session_id>/<file>'
    CREATE POLICY "Session audio select policy" ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'session-audio' AND
        public.can_read_session(split_part(name, '/', 1))
      );

    -- Write policy for founders only
    CREATE POLICY "Session audio founder write policy" ON storage.objects
      FOR ALL TO authenticated
      USING (
        bucket_id = 'session-audio' AND
        public.is_founder()
      );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Guard against environments where storage extension/schema is absent or restricted
  NULL;
END $$;
