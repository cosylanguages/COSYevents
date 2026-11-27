-- Migration: 20261025000000_events_schema.sql
-- Description: Core Events Tables and Row Level Security (RLS) Policies
-- Integrates with COSYplatform profiles and role definitions.

-- ============================================================================
-- 1. Ensure `profiles` table and `is_founder` helper exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('founder', 'teacher', 'student')),
  display_name text,
  ui_lang text DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_founder(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND role = 'founder'
  );
$$;

-- ============================================================================
-- 2. Core Event Tables
-- ============================================================================

-- Public event metadata (readable by everyone)
CREATE TABLE IF NOT EXISTS public.events_public (
  slug text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  languages text[] NOT NULL DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('upcoming', 'current', 'past'))
);

-- Public session metadata (readable by everyone)
CREATE TABLE IF NOT EXISTS public.sessions_public (
  slug text PRIMARY KEY,
  event_slug text NOT NULL REFERENCES public.events_public(slug) ON DELETE CASCADE,
  title text NOT NULL,
  theme text NOT NULL,
  language text NOT NULL,
  level text NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  date text NOT NULL
);

-- Gated session content (activities, instructions, vocabulary)
CREATE TABLE IF NOT EXISTS public.session_content (
  session_slug text PRIMARY KEY REFERENCES public.sessions_public(slug) ON DELETE CASCADE,
  event_slug text NOT NULL REFERENCES public.events_public(slug) ON DELETE CASCADE,
  content jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Event access grants for paid or invited students
CREATE TABLE IF NOT EXISTS public.event_access (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_slug text NOT NULL REFERENCES public.events_public(slug) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_slug)
);

-- Event hosts assigned to events
CREATE TABLE IF NOT EXISTS public.event_hosts (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_slug text NOT NULL REFERENCES public.events_public(slug) ON DELETE CASCADE,
  PRIMARY KEY (user_id, event_slug)
);

-- ============================================================================
-- 3. Row Level Security (RLS) Enablement
-- ============================================================================

ALTER TABLE public.events_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_hosts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. RLS Policies
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 events_public Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "events_public_select_all" ON public.events_public;
CREATE POLICY "events_public_select_all" ON public.events_public
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "events_public_write_founder" ON public.events_public;
CREATE POLICY "events_public_write_founder" ON public.events_public
  FOR ALL USING (public.is_founder());

-- ----------------------------------------------------------------------------
-- 4.2 sessions_public Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "sessions_public_select_all" ON public.sessions_public;
CREATE POLICY "sessions_public_select_all" ON public.sessions_public
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "sessions_public_write_founder" ON public.sessions_public;
CREATE POLICY "sessions_public_write_founder" ON public.sessions_public
  FOR ALL USING (public.is_founder());

-- ----------------------------------------------------------------------------
-- 4.3 session_content Policies
-- ----------------------------------------------------------------------------

-- SELECT: Founders, Event Hosts, and Students with Event Access (Current + Past)
DROP POLICY IF EXISTS "session_content_select" ON public.session_content;
CREATE POLICY "session_content_select" ON public.session_content
  FOR SELECT USING (
    public.is_founder()
    OR EXISTS (
      SELECT 1 FROM public.event_hosts
      WHERE event_hosts.user_id = auth.uid()
        AND event_hosts.event_slug = session_content.event_slug
    )
    OR EXISTS (
      SELECT 1 FROM public.event_access
      WHERE event_access.user_id = auth.uid()
        AND event_access.event_slug = session_content.event_slug
    )
  );

-- INSERT / UPDATE / DELETE: Founders, or Hosts for their assigned events
DROP POLICY IF EXISTS "session_content_insert" ON public.session_content;
CREATE POLICY "session_content_insert" ON public.session_content
  FOR INSERT WITH CHECK (
    public.is_founder()
    OR EXISTS (
      SELECT 1 FROM public.event_hosts
      WHERE event_hosts.user_id = auth.uid()
        AND event_hosts.event_slug = session_content.event_slug
    )
  );

DROP POLICY IF EXISTS "session_content_update" ON public.session_content;
CREATE POLICY "session_content_update" ON public.session_content
  FOR UPDATE USING (
    public.is_founder()
    OR EXISTS (
      SELECT 1 FROM public.event_hosts
      WHERE event_hosts.user_id = auth.uid()
        AND event_hosts.event_slug = session_content.event_slug
    )
  );

DROP POLICY IF EXISTS "session_content_delete" ON public.session_content;
CREATE POLICY "session_content_delete" ON public.session_content
  FOR DELETE USING (
    public.is_founder()
    OR EXISTS (
      SELECT 1 FROM public.event_hosts
      WHERE event_hosts.user_id = auth.uid()
        AND event_hosts.event_slug = session_content.event_slug
    )
  );

-- ----------------------------------------------------------------------------
-- 4.4 event_access Policies
-- ----------------------------------------------------------------------------

-- SELECT: Founders and the user themselves
DROP POLICY IF EXISTS "event_access_select" ON public.event_access;
CREATE POLICY "event_access_select" ON public.event_access
  FOR SELECT USING (
    public.is_founder()
    OR user_id = auth.uid()
  );

-- INSERT / DELETE: Strictly Founders
DROP POLICY IF EXISTS "event_access_insert" ON public.event_access;
CREATE POLICY "event_access_insert" ON public.event_access
  FOR INSERT WITH CHECK (public.is_founder());

DROP POLICY IF EXISTS "event_access_delete" ON public.event_access;
CREATE POLICY "event_access_delete" ON public.event_access
  FOR DELETE USING (public.is_founder());

-- ----------------------------------------------------------------------------
-- 4.5 event_hosts Policies
-- ----------------------------------------------------------------------------

-- SELECT: Founders and Hosts
DROP POLICY IF EXISTS "event_hosts_select" ON public.event_hosts;
CREATE POLICY "event_hosts_select" ON public.event_hosts
  FOR SELECT USING (
    public.is_founder()
    OR user_id = auth.uid()
  );

-- ALL WRITE (INSERT, UPDATE, DELETE): Strictly Founders
DROP POLICY IF EXISTS "event_hosts_write_founder" ON public.event_hosts;
CREATE POLICY "event_hosts_write_founder" ON public.event_hosts
  FOR ALL USING (public.is_founder());
