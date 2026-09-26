-- SQL Schema for COSYplatform / COSYevents Supabase Database Extension
-- Reuses COSYplatform's Supabase project and profiles table.

-- Create session_content table
CREATE TABLE IF NOT EXISTS public.session_content (
  session_id text PRIMARY KEY,
  full_notes text,
  recording_url text,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.session_content ENABLE ROW LEVEL SECURITY;

-- Policy 1: Founder and Hosts can view all session content
CREATE POLICY "Founder and hosts can view all session content"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'host', 'admin', 'teacher')
    )
  );

-- Policy 2: Students can view sessions that their profile marks as paid/enrolled
-- Assumes profiles.paid_sessions or profiles.enrolled_sessions is a text array or jsonb array containing session_ids
CREATE POLICY "Students view paid or enrolled sessions"
  ON public.session_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (
          profiles.paid_sessions @> ARRAY[session_content.session_id]
          OR profiles.enrolled_sessions @> ARRAY[session_content.session_id]
        )
    )
  );

-- Policy 3: Service role / founder / host insert & update access
CREATE POLICY "Founder and hosts can insert and update session content"
  ON public.session_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('founder', 'host', 'admin')
    )
  );
