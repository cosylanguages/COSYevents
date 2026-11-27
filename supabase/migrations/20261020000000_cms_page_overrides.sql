-- Migration: 20261020000000_cms_page_overrides.sql
-- Description: Founder Visual CMS Page Overrides Table and RLS Policies

CREATE TABLE IF NOT EXISTS public.cms_page_overrides (
  page_path text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.cms_page_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CMS page overrides select policy" ON public.cms_page_overrides;
DROP POLICY IF EXISTS "CMS page overrides founder write policy" ON public.cms_page_overrides;

-- Public read access for live page content overrides
CREATE POLICY "CMS page overrides select policy" ON public.cms_page_overrides
  FOR SELECT TO anon, authenticated
  USING (true);

-- Founder / Admin write access for saving live page content overrides
CREATE POLICY "CMS page overrides founder write policy" ON public.cms_page_overrides
  FOR ALL TO authenticated
  USING (public.is_founder())
  WITH CHECK (public.is_founder());

-- Table Grants
REVOKE ALL ON TABLE public.cms_page_overrides FROM anon, authenticated;
GRANT SELECT ON TABLE public.cms_page_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cms_page_overrides TO authenticated;
GRANT ALL ON TABLE public.cms_page_overrides TO service_role;
