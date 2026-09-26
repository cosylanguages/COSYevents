-- SQL Schema for COSYplatform / COSYevents Supabase Database Extension
-- Reuses COSYplatform's Supabase project and profiles table.
--
-- ANALYSIS OF PREVIOUS FAILURE MODE:
-- In the previous implementation, `CREATE TABLE IF NOT EXISTS public.session_content` and
-- `ALTER TABLE public.session_content ENABLE ROW LEVEL SECURITY` executed successfully, creating
-- the table and enabling RLS. However, subsequent `CREATE POLICY` statements referenced non-existent
-- columns (`profiles.paid_sessions` and `profiles.enrolled_sessions`). Because PostgreSQL validates
-- column identifiers when parsing CREATE POLICY statements, policy creation failed with an error.
-- As a result, RLS was enabled on `public.session_content` with ZERO active policies, causing
-- PostgreSQL's default RLS posture: ALL non-super/service-role access (including founders and teachers)
-- was denied.

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

-- 2. Create session_content table
CREATE TABLE IF NOT EXISTS public.session_content (
  session_id text PRIMARY KEY,
  full_notes text,
  recording_url text,
  updated_at timestamptz DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE public.session_content ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing policies for idempotent re-execution
DROP POLICY IF EXISTS "Founder and hosts can view all session content" ON public.session_content;
DROP POLICY IF EXISTS "Founder and teachers can view all session content" ON public.session_content;
DROP POLICY IF EXISTS "Students view paid or enrolled sessions" ON public.session_content;
DROP POLICY IF EXISTS "Founder and hosts can insert and update session content" ON public.session_content;
DROP POLICY IF EXISTS "Founder and teachers can insert and update session content" ON public.session_content;

-- Policy 1: Founder and Teachers can view all session content
CREATE POLICY "Founder and teachers can view all session content"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'teacher')
    )
  );

-- Policy 2: Students can view sessions that their profile lists in enrolled_sessions
CREATE POLICY "Students view paid or enrolled sessions"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.enrolled_sessions @> ARRAY[session_content.session_id]
    )
  );

-- Policy 3: Founder and Teacher insert & update access
CREATE POLICY "Founder and teachers can insert and update session content"
  ON public.session_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'teacher')
    )
  );
