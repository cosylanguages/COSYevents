-- Migration: 20261021000000_cms_hardening.sql
-- Description: CMS Page Overrides Constraints and Column-Level Select Grant Hardening

-- Add CHECK constraints on public.cms_page_overrides
ALTER TABLE public.cms_page_overrides
  DROP CONSTRAINT IF EXISTS cms_page_overrides_content_size_check,
  DROP CONSTRAINT IF EXISTS cms_page_overrides_page_path_check;

ALTER TABLE public.cms_page_overrides
  ADD CONSTRAINT cms_page_overrides_content_size_check
    CHECK (octet_length(content::text) <= 200000),
  ADD CONSTRAINT cms_page_overrides_page_path_check
    CHECK (page_path ~ '^[A-Za-z0-9_./-]+$' AND char_length(page_path) <= 200);

-- Revoke full table SELECT from anon and grant column-level SELECT (page_path, content, updated_at) to anon
REVOKE SELECT ON TABLE public.cms_page_overrides FROM anon;
GRANT SELECT (page_path, content, updated_at) ON TABLE public.cms_page_overrides TO anon;
