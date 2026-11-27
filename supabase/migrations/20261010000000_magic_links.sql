-- Migration: 20261010000000_magic_links.sql
-- Description: Participant Magic Links, Session Recording Sharing, and Staff Functions

-- ============================================================================
-- 1. Enable Extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 2. Create Table: public.session_access_links
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.session_access_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES public.session_catalog(session_id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  label text,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL,
  revoked_at timestamptz,
  use_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_window CHECK (valid_until > valid_from AND valid_until <= valid_from + interval '400 days')
);

ALTER TABLE public.session_access_links ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.session_access_links FROM anon, authenticated;
GRANT ALL ON TABLE public.session_access_links TO service_role;

-- ============================================================================
-- 3. Add Column: session_content.share_recording
-- ============================================================================
ALTER TABLE public.session_content
  ADD COLUMN IF NOT EXISTS share_recording boolean NOT NULL DEFAULT false;

-- ============================================================================
-- 4. Helper Function: level_code(p_rank integer)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.level_code(p_rank integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE p_rank
    WHEN 0 THEN 'A0'
    WHEN 1 THEN 'A1'
    WHEN 2 THEN 'A2'
    WHEN 3 THEN 'B1'
    WHEN 4 THEN 'B2'
    WHEN 5 THEN 'C1'
    WHEN 6 THEN 'C2'
    ELSE NULL
  END;
$$;

-- ============================================================================
-- 5. Staff Function: create_session_access_link
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_session_access_link(
  p_session_id text,
  p_valid_until timestamptz,
  p_valid_from timestamptz DEFAULT now(),
  p_label text DEFAULT NULL
)
RETURNS TABLE(link_id uuid, token text, valid_until timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_lang text;
  v_raw_bytes bytea;
  v_token text;
  v_hash text;
  v_link_id uuid;
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check session existence and language
  SELECT language INTO v_lang
    FROM public.session_catalog
   WHERE session_id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found: %', p_session_id;
  END IF;

  -- Verify staff permissions (founder or teacher of the session language)
  IF NOT (public.is_founder() OR public.is_teacher_of(v_lang)) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Generate 24-character url-safe random string from 18 random bytes (144 bits)
  v_raw_bytes := gen_random_bytes(18);
  v_token := translate(encode(v_raw_bytes, 'base64'), '+/', '-_');

  -- Compute hex sha256 digest
  v_hash := encode(digest(v_token, 'sha256'), 'hex');

  -- Insert magic link row
  INSERT INTO public.session_access_links (
    session_id,
    token_hash,
    label,
    valid_from,
    valid_until,
    created_by
  ) VALUES (
    p_session_id,
    v_hash,
    p_label,
    p_valid_from,
    p_valid_until,
    auth.uid()
  )
  RETURNING id INTO v_link_id;

  RETURN QUERY SELECT v_link_id, v_token, p_valid_until;
END;
$$;

-- ============================================================================
-- 6. Participant Function: redeem_session_access_link
-- ============================================================================
CREATE OR REPLACE FUNCTION public.redeem_session_access_link(
  p_session_id text,
  p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_hash text;
  v_link record;
  v_title text;
  v_lang text;
  v_level_min integer;
  v_level_max integer;
  v_summary text;
  v_format text;
  v_vocab jsonb;
  v_rounds jsonb;
  v_grammar jsonb;
  v_disc jsonb;
  v_recording_url text;
  v_share_recording boolean;
  v_sources jsonb;
  v_res jsonb;
BEGIN
  IF p_token IS NULL OR char_length(p_token) = 0 THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  v_hash := encode(digest(p_token, 'sha256'), 'hex');

  SELECT * INTO v_link
    FROM public.session_access_links
   WHERE session_id = p_session_id
     AND token_hash = v_hash;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  IF v_link.revoked_at IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'revoked');
  END IF;

  IF now() < v_link.valid_from OR now() > v_link.valid_until THEN
    RETURN jsonb_build_object('status', 'expired');
  END IF;

  -- Token is valid: update usage stats
  UPDATE public.session_access_links
     SET use_count = use_count + 1,
         last_used_at = now()
   WHERE id = v_link.id;

  -- Fetch session catalog metadata
  SELECT title, language, level_min, level_max, summary, format
    INTO v_title, v_lang, v_level_min, v_level_max, v_summary, v_format
    FROM public.session_catalog
   WHERE session_id = p_session_id;

  -- Fetch private session content
  SELECT vocabulary, rounds, grammar, discussion, recording_url, share_recording
    INTO v_vocab, v_rounds, v_grammar, v_disc, v_recording_url, v_share_recording
    FROM public.session_content
   WHERE session_id = p_session_id;

  -- Fetch private sources without internal audio storage paths
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'source_id', source_id,
    'source_title', source_title,
    'source_url', source_url
  ) ORDER BY position), '[]'::jsonb)
    INTO v_sources
    FROM public.session_sources
   WHERE session_id = p_session_id;

  v_res := jsonb_build_object(
    'status', 'ok',
    'catalog', jsonb_build_object(
      'title', v_title,
      'language', v_lang,
      'level', CASE
        WHEN v_level_min IS NULL OR v_level_max IS NULL THEN NULL
        WHEN v_level_min = v_level_max THEN public.level_code(v_level_min)
        ELSE public.level_code(v_level_min) || '-' || public.level_code(v_level_max)
      END,
      'summary', v_summary,
      'format', v_format
    ),
    'content', jsonb_build_object(
      'vocabulary', COALESCE(v_vocab, '[]'::jsonb),
      'rounds', COALESCE(v_rounds, '[]'::jsonb),
      'grammar', v_grammar,
      'discussion', COALESCE(v_disc, '[]'::jsonb)
    ),
    'sources', COALESCE(v_sources, '[]'::jsonb),
    'valid_until', v_link.valid_until
  );

  IF coalesce(v_share_recording, false) AND v_recording_url IS NOT NULL THEN
    v_res := jsonb_set(v_res, '{recording_url}', to_jsonb(v_recording_url));
  END IF;

  RETURN v_res;
END;
$$;

-- ============================================================================
-- 7. Staff Function: staff_get_session
-- ============================================================================
CREATE OR REPLACE FUNCTION public.staff_get_session(p_session_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_title text;
  v_lang text;
  v_level_min integer;
  v_level_max integer;
  v_summary text;
  v_format text;
  v_vocab jsonb;
  v_rounds jsonb;
  v_grammar jsonb;
  v_disc jsonb;
  v_full_notes text;
  v_recording_url text;
  v_teacher_notes text;
  v_sources jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT title, language, level_min, level_max, summary, format
    INTO v_title, v_lang, v_level_min, v_level_max, v_summary, v_format
    FROM public.session_catalog
   WHERE session_id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found: %', p_session_id;
  END IF;

  IF NOT (public.is_founder() OR public.is_teacher_of(v_lang)) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT vocabulary, rounds, grammar, discussion, full_notes, recording_url
    INTO v_vocab, v_rounds, v_grammar, v_disc, v_full_notes, v_recording_url
    FROM public.session_content
   WHERE session_id = p_session_id;

  SELECT notes INTO v_teacher_notes
    FROM public.session_teacher_notes
   WHERE session_id = p_session_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'source_id', source_id,
    'source_title', source_title,
    'source_url', source_url
  ) ORDER BY position), '[]'::jsonb)
    INTO v_sources
    FROM public.session_sources
   WHERE session_id = p_session_id;

  RETURN jsonb_build_object(
    'status', 'ok',
    'catalog', jsonb_build_object(
      'title', v_title,
      'language', v_lang,
      'level', CASE
        WHEN v_level_min IS NULL OR v_level_max IS NULL THEN NULL
        WHEN v_level_min = v_level_max THEN public.level_code(v_level_min)
        ELSE public.level_code(v_level_min) || '-' || public.level_code(v_level_max)
      END,
      'summary', v_summary,
      'format', v_format
    ),
    'content', jsonb_build_object(
      'vocabulary', COALESCE(v_vocab, '[]'::jsonb),
      'rounds', COALESCE(v_rounds, '[]'::jsonb),
      'grammar', v_grammar,
      'discussion', COALESCE(v_disc, '[]'::jsonb),
      'full_notes', v_full_notes
    ),
    'sources', COALESCE(v_sources, '[]'::jsonb),
    'full_notes', v_full_notes,
    'teacher_notes', v_teacher_notes,
    'recording_url', v_recording_url
  );
END;
$$;

-- ============================================================================
-- 8. Staff Functions: list_session_access_links & revoke_session_access_link
-- ============================================================================
CREATE OR REPLACE FUNCTION public.list_session_access_links(p_session_id text)
RETURNS TABLE(
  id uuid,
  label text,
  valid_from timestamptz,
  valid_until timestamptz,
  use_count integer,
  last_used_at timestamptz,
  revoked_at timestamptz,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_lang text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT language INTO v_lang
    FROM public.session_catalog
   WHERE session_id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found: %', p_session_id;
  END IF;

  IF NOT (public.is_founder() OR public.is_teacher_of(v_lang)) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    l.id,
    l.label,
    l.valid_from,
    l.valid_until,
    l.use_count,
    l.last_used_at,
    l.revoked_at,
    CASE
      WHEN l.revoked_at IS NOT NULL THEN 'revoked'
      WHEN now() > l.valid_until OR now() < l.valid_from THEN 'expired'
      ELSE 'active'
    END AS status
  FROM public.session_access_links l
  WHERE l.session_id = p_session_id
  ORDER BY l.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_session_access_link(p_link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_lang text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT s.language INTO v_lang
    FROM public.session_access_links l
    JOIN public.session_catalog s ON s.session_id = l.session_id
   WHERE l.id = p_link_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Link not found: %', p_link_id;
  END IF;

  IF NOT (public.is_founder() OR public.is_teacher_of(v_lang)) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.session_access_links
     SET revoked_at = now()
   WHERE id = p_link_id;
END;
$$;

-- ============================================================================
-- 9. Grants & Privileges
-- ============================================================================
REVOKE EXECUTE ON FUNCTION public.create_session_access_link(text, timestamptz, timestamptz, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.redeem_session_access_link(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.staff_get_session(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.list_session_access_links(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.revoke_session_access_link(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.level_code(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_session_access_link(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_session_access_link(text, timestamptz, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staff_get_session(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_session_access_links(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_session_access_link(uuid) TO authenticated;
