-- Test Suite: Participant Magic Links, Recording Sharing, and Staff Functions
-- Asserts expected behavior using RAISE EXCEPTION on assertion failure.

BEGIN;

-- Helper function in pg_temp to assert statement denial
CREATE OR REPLACE FUNCTION pg_temp.assert_denied(p_stmt text, p_label text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_succeeded boolean := false;
BEGIN
  BEGIN
    EXECUTE p_stmt;
    v_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_succeeded := false;
  END;

  IF v_succeeded THEN
    RAISE EXCEPTION 'Assertion failed [%]: statement should have been denied but succeeded', p_label;
  END IF;
END;
$$;

-- ============================================================================
-- 1. Test Setup: Users and Test Data
-- ============================================================================

INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'founder_ml@cosy.test'),
  ('22222222-2222-2222-2222-111111111111', 'teacher_fr_ml@cosy.test'),
  ('22222222-2222-2222-2222-222222222222', 'teacher_en_ml@cosy.test'),
  ('33333333-3333-3333-3333-111111111111', 'student_ml@cosy.test');

UPDATE public.profiles SET role = 'founder', display_name = 'Founder ML' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET role = 'teacher', display_name = 'French Teacher ML' WHERE id = '22222222-2222-2222-2222-111111111111';
UPDATE public.profiles SET role = 'teacher', display_name = 'English Teacher ML' WHERE id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.teacher_languages (user_id, language) VALUES
  ('22222222-2222-2222-2222-111111111111', 'fr'),
  ('22222222-2222-2222-2222-222222222222', 'en');

INSERT INTO public.session_catalog (session_id, title, language, level_min, level_max, summary, format, is_published) VALUES
  ('s_en_ml', 'English ML Session', 'en', 3, 4, 'Summary EN ML', 'Speaking Club', true),
  ('s_fr_ml', 'French ML Session', 'fr', 3, 3, 'Summary FR ML', 'Speaking Club', true);

INSERT INTO public.session_content (session_id, vocabulary, rounds, grammar, discussion, full_notes, recording_url, share_recording) VALUES
  ('s_en_ml', '[{"word": "hello"}]'::jsonb, '[{"round": 1}]'::jsonb, '{"topic": "tenses"}'::jsonb, '["Q1"]'::jsonb, 'SECRET FULL NOTES EN', 'https://rec.test/en.mp3', false),
  ('s_fr_ml', '[{"word": "bonjour"}]'::jsonb, '[{"round": 1}]'::jsonb, NULL, '["Q1 FR"]'::jsonb, 'SECRET FULL NOTES FR', 'https://rec.test/fr.mp3', true);

INSERT INTO public.session_teacher_notes (session_id, notes) VALUES
  ('s_en_ml', 'SECRET TEACHER NOTES EN'),
  ('s_fr_ml', 'SECRET TEACHER NOTES FR');

INSERT INTO public.session_sources (session_id, source_id, source_title, source_url, audio_storage_path, position) VALUES
  ('s_en_ml', 'src1', 'Source One', 'https://source1.test', 's_en_ml/src1/audio.mp3', 1);

-- ============================================================================
-- 2. Test Direct Table Privileges (Anon Restrictions)
-- ============================================================================
SET ROLE anon;
SET LOCAL request.jwt.claim.sub = '';

DO $$
BEGIN
  PERFORM pg_temp.assert_denied('SELECT count(*) FROM public.session_access_links', 'Anon select session_access_links');
  PERFORM pg_temp.assert_denied('SELECT count(*) FROM public.session_content', 'Anon select session_content');
  PERFORM pg_temp.assert_denied('SELECT count(*) FROM public.session_teacher_notes', 'Anon select session_teacher_notes');
  PERFORM pg_temp.assert_denied('SELECT count(*) FROM public.session_sources', 'Anon select session_sources');
END $$;

-- ============================================================================
-- 3. Staff Magic Link Creation & Language Permission Rules
-- ============================================================================

-- Teacher of French cannot create link for English session
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-111111111111'; -- French teacher

DO $$
BEGIN
  PERFORM pg_temp.assert_denied(
    'SELECT public.create_session_access_link(''s_en_ml'', now() + interval ''7 days'')',
    'French teacher creating link for English session'
  );
END $$;

-- Teacher of English can create link for English session
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222'; -- English teacher

DO $$
DECLARE
  v_link_id uuid;
  v_token text;
  v_valid_until timestamptz;
BEGIN
  SELECT link_id, token, valid_until
    INTO v_link_id, v_token, v_valid_until
    FROM public.create_session_access_link('s_en_ml', now() + interval '7 days', now(), 'Batch EN 1');

  IF v_token IS NULL OR char_length(v_token) <> 24 THEN
    RAISE EXCEPTION 'Link creation failed: expected 24 char token, got length %', char_length(COALESCE(v_token, ''));
  END IF;
END $$;

-- Founder can create link for any session
SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'; -- Founder

DO $$
DECLARE
  v_link_id uuid;
  v_token text;
  v_valid_until timestamptz;
BEGIN
  SELECT link_id, token, valid_until
    INTO v_link_id, v_token, v_valid_until
    FROM public.create_session_access_link('s_fr_ml', now() + interval '7 days', now(), 'Batch FR 1');

  IF v_token IS NULL OR char_length(v_token) <> 24 THEN
    RAISE EXCEPTION 'Founder link creation failed: token length %', char_length(COALESCE(v_token, ''));
  END IF;
END $$;

-- ============================================================================
-- 4. Magic Link Token Redemption Tests
-- ============================================================================

-- Setup test links as Founder
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

DO $$
DECLARE
  v_tok_valid text;
  v_tok_expired text;
  v_tok_future text;
  v_tok_revoked text;
  v_link_revoked_id uuid;
  v_res jsonb;
  v_tok_fr text;
BEGIN
  -- 1. Valid EN link
  SELECT token INTO v_tok_valid FROM public.create_session_access_link('s_en_ml', now() + interval '1 day');

  -- 2. Expired EN link
  SELECT token INTO v_tok_expired FROM public.create_session_access_link('s_en_ml', now() - interval '1 hour', now() - interval '2 days');

  -- 3. Future (not yet valid) EN link
  SELECT token INTO v_tok_future FROM public.create_session_access_link('s_en_ml', now() + interval '2 days', now() + interval '1 hour');

  -- 4. Revoked EN link
  SELECT link_id, token INTO v_link_revoked_id, v_tok_revoked FROM public.create_session_access_link('s_en_ml', now() + interval '1 day');
  PERFORM public.revoke_session_access_link(v_link_revoked_id);

  -- 5. Valid FR link with share_recording = true
  SELECT token INTO v_tok_fr FROM public.create_session_access_link('s_fr_ml', now() + interval '1 day');

  -- --- TEST AS ANONYMOUS USER ---
  SET ROLE anon;
  SET LOCAL request.jwt.claim.sub = '';

  -- A. Wrong token -> status 'invalid'
  v_res := public.redeem_session_access_link('s_en_ml', 'invalidtoken123456789012');
  IF (v_res->>'status') <> 'invalid' THEN
    RAISE EXCEPTION 'Redeem wrong token expected invalid, got %', v_res->>'status';
  END IF;

  -- B. Wrong session_id -> status 'invalid'
  v_res := public.redeem_session_access_link('s_fr_ml', v_tok_valid);
  IF (v_res->>'status') <> 'invalid' THEN
    RAISE EXCEPTION 'Redeem wrong session_id expected invalid, got %', v_res->>'status';
  END IF;

  -- C. Expired token -> status 'expired'
  v_res := public.redeem_session_access_link('s_en_ml', v_tok_expired);
  IF (v_res->>'status') <> 'expired' THEN
    RAISE EXCEPTION 'Redeem expired token expected expired, got %', v_res->>'status';
  END IF;

  -- D. Future token -> status 'expired'
  v_res := public.redeem_session_access_link('s_en_ml', v_tok_future);
  IF (v_res->>'status') <> 'expired' THEN
    RAISE EXCEPTION 'Redeem future token expected expired, got %', v_res->>'status';
  END IF;

  -- E. Revoked token -> status 'revoked'
  v_res := public.redeem_session_access_link('s_en_ml', v_tok_revoked);
  IF (v_res->>'status') <> 'revoked' THEN
    RAISE EXCEPTION 'Redeem revoked token expected revoked, got %', v_res->>'status';
  END IF;

  -- F. Valid EN token redeem -> status 'ok', check fields
  v_res := public.redeem_session_access_link('s_en_ml', v_tok_valid);
  IF (v_res->>'status') <> 'ok' THEN
    RAISE EXCEPTION 'Redeem valid token expected ok, got %', v_res->>'status';
  END IF;

  IF (v_res->'catalog'->>'title') <> 'English ML Session' THEN
    RAISE EXCEPTION 'Redeem catalog title mismatch: %', v_res->'catalog'->>'title';
  END IF;

  IF (v_res->'catalog'->>'level') <> 'B1-B2' THEN
    RAISE EXCEPTION 'Redeem catalog level mismatch: expected B1-B2, got %', v_res->'catalog'->>'level';
  END IF;

  -- Check secrecy: full_notes, teacher_notes, audio_storage_path must NEVER be in participant response
  IF v_res ? 'full_notes' OR (v_res->'content') ? 'full_notes' THEN
    RAISE EXCEPTION 'Redeem SECURITY LEAK: full_notes returned in participant payload!';
  END IF;

  IF v_res ? 'teacher_notes' THEN
    RAISE EXCEPTION 'Redeem SECURITY LEAK: teacher_notes returned in participant payload!';
  END IF;

  IF (v_res->'sources'->0) ? 'audio_storage_path' THEN
    RAISE EXCEPTION 'Redeem SECURITY LEAK: audio_storage_path returned in sources payload!';
  END IF;

  -- EN session has share_recording = false, so recording_url must NOT be included
  IF v_res ? 'recording_url' THEN
    RAISE EXCEPTION 'Redeem SECURITY LEAK: recording_url returned when share_recording is false!';
  END IF;

  -- G. Valid FR token redeem with share_recording = true -> includes recording_url
  v_res := public.redeem_session_access_link('s_fr_ml', v_tok_fr);
  IF (v_res->>'status') <> 'ok' THEN
    RAISE EXCEPTION 'Redeem FR token expected ok, got %', v_res->>'status';
  END IF;

  IF (v_res->>'recording_url') <> 'https://rec.test/fr.mp3' THEN
    RAISE EXCEPTION 'Redeem expected recording_url when share_recording is true, got %', v_res->>'recording_url';
  END IF;
END $$;

-- ============================================================================
-- 5. Test Usage Counters & Hash Secrecy in List/Create
-- ============================================================================
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222'; -- English teacher

DO $$
DECLARE
  v_link_id uuid;
  v_tok text;
  v_res jsonb;
  v_use_cnt integer;
  v_last_used timestamptz;
BEGIN
  -- Create link
  SELECT link_id, token INTO v_link_id, v_tok
    FROM public.create_session_access_link('s_en_ml', now() + interval '1 day', now(), 'Usage Counter Test');

  -- Redeem link twice
  SET ROLE anon;
  SET LOCAL request.jwt.claim.sub = '';
  PERFORM public.redeem_session_access_link('s_en_ml', v_tok);
  PERFORM public.redeem_session_access_link('s_en_ml', v_tok);

  -- Check list as English Teacher
  SET ROLE authenticated;
  SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  SELECT use_count, last_used_at INTO v_use_cnt, v_last_used
    FROM public.list_session_access_links('s_en_ml')
   WHERE id = v_link_id;

  IF v_use_cnt <> 2 THEN
    RAISE EXCEPTION 'use_count tracking failed: expected 2, got %', v_use_cnt;
  END IF;

  IF v_last_used IS NULL THEN
    RAISE EXCEPTION 'last_used_at tracking failed: timestamp is NULL';
  END IF;
END $$;

-- ============================================================================
-- 6. Test Staff Function Permissions & Data Shapes
-- ============================================================================

-- Teacher of French cannot list or staff_get English session
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-111111111111'; -- French teacher

DO $$
BEGIN
  PERFORM pg_temp.assert_denied(
    'SELECT count(*) FROM public.list_session_access_links(''s_en_ml'')',
    'French teacher listing links for English session'
  );

  PERFORM pg_temp.assert_denied(
    'SELECT public.staff_get_session(''s_en_ml'')',
    'French teacher staff_get for English session'
  );
END $$;

-- English teacher calling staff_get_session gets full_notes and teacher_notes
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222'; -- English teacher

DO $$
DECLARE
  v_staff_data jsonb;
BEGIN
  v_staff_data := public.staff_get_session('s_en_ml');

  IF (v_staff_data->>'status') <> 'ok' THEN
    RAISE EXCEPTION 'staff_get_session failed: %', v_staff_data;
  END IF;

  IF (v_staff_data->>'full_notes') <> 'SECRET FULL NOTES EN' THEN
    RAISE EXCEPTION 'staff_get_session missing full_notes: %', v_staff_data->>'full_notes';
  END IF;

  IF (v_staff_data->>'teacher_notes') <> 'SECRET TEACHER NOTES EN' THEN
    RAISE EXCEPTION 'staff_get_session missing teacher_notes: %', v_staff_data->>'teacher_notes';
  END IF;

  IF (v_staff_data->>'recording_url') <> 'https://rec.test/en.mp3' THEN
    RAISE EXCEPTION 'staff_get_session missing recording_url: %', v_staff_data->>'recording_url';
  END IF;
END $$;

-- ============================================================================
-- 7. Test Token Generation Uniqueness & Length Across 1000 Iterations
-- ============================================================================
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'; -- Founder

DO $$
DECLARE
  v_tokens text[];
  v_tok text;
  v_i integer;
  v_uniq_count integer;
BEGIN
  v_tokens := '{}';

  FOR v_i IN 1..1000 LOOP
    v_tok := translate(encode(gen_random_bytes(18), 'base64'), '+/', '-_');
    IF char_length(v_tok) <> 24 THEN
      RAISE EXCEPTION 'Token generation produced invalid length % at iteration %', char_length(v_tok), v_i;
    END IF;
    v_tokens := array_append(v_tokens, v_tok);
  END LOOP;

  SELECT count(DISTINCT t) INTO v_uniq_count FROM unnest(v_tokens) AS t;

  IF v_uniq_count <> 1000 THEN
    RAISE EXCEPTION 'Token uniqueness test failed: expected 1000 unique tokens, got %', v_uniq_count;
  END IF;
END $$;

ROLLBACK;
