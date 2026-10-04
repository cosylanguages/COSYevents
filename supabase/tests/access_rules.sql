-- Test Suite: Access Control and RLS Security Assertion Rules
-- Exercises roles: anon, student, teacher, founder
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
-- 1. Test Setup: Create Users and Data
-- ============================================================================

-- Setup Users in auth.users
INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'founder1@cosy.test'),
  ('11111111-1111-1111-1111-222222222222', 'founder2@cosy.test'),
  ('22222222-2222-2222-2222-111111111111', 'teacher_fr@cosy.test'),
  ('22222222-2222-2222-2222-222222222222', 'teacher_en@cosy.test'),
  ('33333333-3333-3333-3333-111111111111', 'student_exact@cosy.test'),
  ('33333333-3333-3333-3333-222222222222', 'student_lower@cosy.test'),
  ('33333333-3333-3333-3333-333333333333', 'student_course@cosy.test'),
  ('33333333-3333-3333-3333-444444444444', 'student_expired@cosy.test'),
  ('33333333-3333-3333-3333-555555555555', 'student_future@cosy.test'),
  ('33333333-3333-3333-3333-666666666666', 'student_session@cosy.test'),
  ('33333333-3333-3333-3333-777777777777', 'student_no_grants@cosy.test');

-- Profiles are auto-created by trigger handle_new_user as 'student'
-- Promote founders and teachers
UPDATE public.profiles SET role = 'founder', display_name = 'Founder One' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET role = 'founder', display_name = 'Founder Two' WHERE id = '11111111-1111-1111-1111-222222222222';
UPDATE public.profiles SET role = 'teacher', display_name = 'French Teacher' WHERE id = '22222222-2222-2222-2222-111111111111';
UPDATE public.profiles SET role = 'teacher', display_name = 'English Teacher' WHERE id = '22222222-2222-2222-2222-222222222222';

-- Assign languages to Teachers
INSERT INTO public.teacher_languages (user_id, language) VALUES
  ('22222222-2222-2222-2222-111111111111', 'fr'),
  ('22222222-2222-2222-2222-222222222222', 'en');

-- Setup Session Catalog
INSERT INTO public.session_catalog
  (session_id, title, language, level_min, level_max, courses, is_published)
VALUES
  ('s_en_b1', 'English B1 Session', 'en', 3, 3, '{}', true),
  ('s_en_b1_b2', 'English B1-B2 Session', 'en', 3, 4, '{}', true),
  ('s_en_b2', 'English B2 Session', 'en', 4, 4, '{}', true),
  ('s_en_a1_a2', 'English A1-A2 Session', 'en', 1, 2, '{}', true),
  ('s_fr_b1', 'French B1 Session', 'fr', 3, 3, '{}', true),
  ('s_en_unlevelled', 'English Draft Unlevelled', 'en', NULL, NULL, '{}', true),
  ('s_en_medical', 'English Medical B1 Session', 'en', 3, 3, '{"medical"}', true),
  ('s_en_unpublished', 'English Unpublished Session', 'en', 3, 3, '{}', false);

-- Setup Session Content
INSERT INTO public.session_content (session_id, content, schema_version) VALUES
  ('s_en_b1', '{"title": "EN B1 Content"}'::jsonb, 1),
  ('s_en_b1_b2', '{"title": "EN B1-B2 Content"}'::jsonb, 1),
  ('s_en_b2', '{"title": "EN B2 Content"}'::jsonb, 1),
  ('s_en_a1_a2', '{"title": "EN A1-A2 Content"}'::jsonb, 1),
  ('s_fr_b1', '{"title": "FR B1 Content"}'::jsonb, 1),
  ('s_en_unlevelled', '{"title": "EN Draft Content"}'::jsonb, 1),
  ('s_en_medical', '{"title": "EN Medical Content"}'::jsonb, 1),
  ('s_en_unpublished', '{"title": "EN Unpublished Content"}'::jsonb, 1);

-- Setup Teacher Notes
INSERT INTO public.session_teacher_notes (session_id, notes) VALUES
  ('s_fr_b1', 'Teacher notes for French B1'),
  ('s_en_b1', 'Teacher notes for English B1');

-- Setup Access Grants
-- 1. Student Exact (en, B1, exact)
INSERT INTO public.access_grants (user_id, language, level, include_lower, valid_from, valid_until) VALUES
  ('33333333-3333-3333-3333-111111111111', 'en', 'B1', false, current_date - 1, current_date + 30);

-- 2. Student Lower (en, B1, include_lower = true)
INSERT INTO public.access_grants (user_id, language, level, include_lower, valid_from, valid_until) VALUES
  ('33333333-3333-3333-3333-222222222222', 'en', 'B1', true, current_date - 1, current_date + 30);

-- 3. Student Course (en, B1, course = 'medical')
INSERT INTO public.access_grants (user_id, language, level, include_lower, course, valid_from, valid_until) VALUES
  ('33333333-3333-3333-3333-333333333333', 'en', 'B1', false, 'medical', current_date - 1, current_date + 30);

-- 4. Student Expired grant
INSERT INTO public.access_grants (user_id, language, level, include_lower, valid_from, valid_until) VALUES
  ('33333333-3333-3333-3333-444444444444', 'en', 'B1', false, current_date - 30, current_date - 1);

-- 5. Student Future grant
INSERT INTO public.access_grants (user_id, language, level, include_lower, valid_from, valid_until) VALUES
  ('33333333-3333-3333-3333-555555555555', 'en', 'B1', false, current_date + 5, current_date + 30);

-- 6. Student Session Grant for s_en_b2
INSERT INTO public.session_grants (user_id, session_id, valid_until) VALUES
  ('33333333-3333-3333-3333-666666666666', 's_en_b2', current_date + 10);

-- ============================================================================
-- 2. Security & RLS Test Assertions
-- ============================================================================

-- Test 1: Anonymous User Checks
SET ROLE anon;
SET LOCAL request.jwt.claim.sub = '';

DO $$
DECLARE
  v_cat_count integer;
BEGIN
  -- Anon sees published catalog rows
  SELECT count(*) INTO v_cat_count FROM public.session_catalog;
  IF v_cat_count <> 7 THEN -- 7 published sessions (s_en_unpublished is hidden)
    RAISE EXCEPTION 'Anon test failed: expected 7 published catalog rows, got %', v_cat_count;
  END IF;

  -- Anon sees NO session content (table SELECT permission is revoked from anon)
  PERFORM pg_temp.assert_denied('SELECT count(*) FROM public.session_content', 'Anon select session_content');
END $$;

-- Test 2: Student Exact Grant (en, B1, exact)
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-111111111111';

DO $$
BEGIN
  -- Can read s_en_b1 (B1 exact)
  IF NOT public.can_read_session('s_en_b1') THEN
    RAISE EXCEPTION 'Student exact failed: should read s_en_b1';
  END IF;

  -- Can read s_en_b1_b2 (range 3..4 contains B1=3)
  IF NOT public.can_read_session('s_en_b1_b2') THEN
    RAISE EXCEPTION 'Student exact failed: should read s_en_b1_b2';
  END IF;

  -- Cannot read s_en_b2 (B2-only range 4..4)
  IF public.can_read_session('s_en_b2') THEN
    RAISE EXCEPTION 'Student exact failed: should NOT read s_en_b2';
  END IF;

  -- Cannot read s_fr_b1 (different language)
  IF public.can_read_session('s_fr_b1') THEN
    RAISE EXCEPTION 'Student exact failed: should NOT read s_fr_b1';
  END IF;

  -- Cannot read s_en_unlevelled (NULL level range)
  IF public.can_read_session('s_en_unlevelled') THEN
    RAISE EXCEPTION 'Student exact failed: should NOT read s_en_unlevelled';
  END IF;
END $$;

-- Test 3: Student Lower Grant (en, B1, include_lower=true)
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-222222222222';

DO $$
BEGIN
  -- Can read s_en_b1
  IF NOT public.can_read_session('s_en_b1') THEN
    RAISE EXCEPTION 'Student lower failed: should read s_en_b1';
  END IF;

  -- Can read s_en_a1_a2 (lower level range 1..2)
  IF NOT public.can_read_session('s_en_a1_a2') THEN
    RAISE EXCEPTION 'Student lower failed: should read s_en_a1_a2';
  END IF;

  -- Cannot read s_en_b2 (higher level range 4..4)
  IF public.can_read_session('s_en_b2') THEN
    RAISE EXCEPTION 'Student lower failed: should NOT read s_en_b2';
  END IF;
END $$;

-- Test 4: Course Restrictions
SET ROLE authenticated;

-- Student without medical course grant (student_exact) checking s_en_medical
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-111111111111';
DO $$
BEGIN
  IF public.can_read_session('s_en_medical') THEN
    RAISE EXCEPTION 'Course restriction failed: student without medical course grant read medical session';
  END IF;
END $$;

-- Student with medical course grant checking s_en_medical
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-333333333333';
DO $$
BEGIN
  IF NOT public.can_read_session('s_en_medical') THEN
    RAISE EXCEPTION 'Course restriction failed: student with medical course grant denied medical session';
  END IF;
END $$;

-- Test 5: Expired and Future Grants
SET ROLE authenticated;

-- Expired grant
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-444444444444';
DO $$
BEGIN
  IF public.can_read_session('s_en_b1') THEN
    RAISE EXCEPTION 'Expired grant test failed: expired grant was allowed access';
  END IF;
END $$;

-- Future grant
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-555555555555';
DO $$
BEGIN
  IF public.can_read_session('s_en_b1') THEN
    RAISE EXCEPTION 'Future grant test failed: future grant was allowed access';
  END IF;
END $$;

-- Test 6: Single-Session Purchases (session_grants)
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-666666666666';

DO $$
BEGIN
  -- Can read s_en_b2 via session_grant
  IF NOT public.can_read_session('s_en_b2') THEN
    RAISE EXCEPTION 'Single session grant failed: should read s_en_b2';
  END IF;

  -- Cannot read s_en_b1 (no grant for s_en_b1)
  IF public.can_read_session('s_en_b1') THEN
    RAISE EXCEPTION 'Single session grant failed: should NOT read s_en_b1';
  END IF;
END $$;

-- Test 7: User with No Grants sees no private content
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-777777777777';

DO $$
DECLARE
  v_cnt_count integer;
BEGIN
  SELECT count(*) INTO v_cnt_count FROM public.session_content;
  IF v_cnt_count <> 0 THEN
    RAISE EXCEPTION 'No grant test failed: student with no grants read % content rows', v_cnt_count;
  END IF;
END $$;

-- Test 8: Teacher Permissions and Notes Protection
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-111111111111'; -- Teacher of French

DO $$
DECLARE
  v_notes_count integer;
BEGIN
  -- Can read all FR sessions (even unlevelled)
  IF NOT public.can_read_session('s_fr_b1') THEN
    RAISE EXCEPTION 'Teacher test failed: French teacher should read s_fr_b1';
  END IF;

  -- Cannot read EN sessions
  IF public.can_read_session('s_en_b1') THEN
    RAISE EXCEPTION 'Teacher test failed: French teacher should NOT read s_en_b1';
  END IF;

  -- Can read French teacher notes
  SELECT count(*) INTO v_notes_count FROM public.session_teacher_notes;
  IF v_notes_count <> 1 THEN
    RAISE EXCEPTION 'Teacher notes failed: expected 1 FR note row, got %', v_notes_count;
  END IF;
END $$;

-- Student cannot read teacher notes
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-111111111111';
DO $$
DECLARE
  v_notes_count integer;
BEGIN
  SELECT count(*) INTO v_notes_count FROM public.session_teacher_notes;
  IF v_notes_count <> 0 THEN
    RAISE EXCEPTION 'Student teacher notes test failed: student read % teacher notes', v_notes_count;
  END IF;
END $$;

-- ============================================================================
-- 3. Security Regression Tests
-- ============================================================================

-- Regression Test (1): Student cannot update own role (verified by state afterwards)
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-111111111111';
DO $$
BEGIN
  BEGIN
    UPDATE public.profiles SET role = 'founder' WHERE id = '33333333-3333-3333-3333-111111111111';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;
RESET ROLE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = '33333333-3333-3333-3333-111111111111' AND role = 'founder') THEN
    RAISE EXCEPTION 'Regression Test (1) Failed: Student was able to change own role to founder!';
  END IF;
END $$;

-- Regression Test (2): Column privilege checks for 'authenticated' on public.profiles
RESET ROLE;
DO $$
BEGIN
  IF has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE') THEN
    RAISE EXCEPTION 'Regression Test (2) Failed: authenticated role should NOT have UPDATE privilege on public.profiles.role!';
  END IF;
  IF NOT has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE') THEN
    RAISE EXCEPTION 'Regression Test (2) Failed: authenticated role MUST have UPDATE privilege on public.profiles.display_name!';
  END IF;
END $$;

-- Regression Test (3): Unpublished session read permissions
-- Student with matching grant cannot read content of UNPUBLISHED session
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-111111111111'; -- student_exact (EN B1 grant)
DO $$
BEGIN
  IF public.can_read_session('s_en_unpublished') THEN
    RAISE EXCEPTION 'Regression Test (3) Failed: Student read unpublished session via can_read_session!';
  END IF;
END $$;

DO $$
DECLARE
  v_cnt integer;
BEGIN
  SELECT count(*) INTO v_cnt FROM public.session_content WHERE session_id = 's_en_unpublished';
  IF v_cnt <> 0 THEN
    RAISE EXCEPTION 'Regression Test (3) Failed: Student read unpublished session content rows!';
  END IF;
END $$;

-- Founder can read unpublished session
SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
DO $$
BEGIN
  IF NOT public.can_read_session('s_en_unpublished') THEN
    RAISE EXCEPTION 'Regression Test (3) Failed: Founder should be able to read unpublished session!';
  END IF;
END $$;

-- Teacher of that language (EN) can read unpublished session
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222'; -- teacher_en
DO $$
BEGIN
  IF NOT public.can_read_session('s_en_unpublished') THEN
    RAISE EXCEPTION 'Regression Test (3) Failed: English teacher should be able to read unpublished EN session!';
  END IF;
END $$;

-- Publish session, now student can read it
RESET ROLE;
UPDATE public.session_catalog SET is_published = true WHERE session_id = 's_en_unpublished';

SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-111111111111';
DO $$
BEGIN
  IF NOT public.can_read_session('s_en_unpublished') THEN
    RAISE EXCEPTION 'Regression Test (3) Failed: Student should read session once published!';
  END IF;
END $$;

-- Restore unpublished status for subsequent assertions
RESET ROLE;
UPDATE public.session_catalog SET is_published = false WHERE session_id = 's_en_unpublished';

-- Regression Test (4): Student profile update/insert/delete restrictions
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-111111111111';

-- Student cannot change display_name of another user
DO $$
BEGIN
  BEGIN
    UPDATE public.profiles SET display_name = 'Hacked Name' WHERE id = '33333333-3333-3333-3333-222222222222';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;
RESET ROLE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = '33333333-3333-3333-3333-222222222222' AND display_name = 'Hacked Name') THEN
    RAISE EXCEPTION 'Regression Test (4) Failed: Student changed display_name of another user!';
  END IF;
END $$;

-- Student cannot INSERT or DELETE profiles
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-111111111111';
DO $$
BEGIN
  PERFORM pg_temp.assert_denied(
    'INSERT INTO public.profiles (id, role, display_name) VALUES (''88888888-8888-8888-8888-888888888888'', ''student'', ''Illegal'')',
    'Student insert into profiles'
  );
  PERFORM pg_temp.assert_denied(
    'DELETE FROM public.profiles WHERE id = ''33333333-3333-3333-3333-222222222222''',
    'Student delete profile'
  );
  PERFORM pg_temp.assert_denied(
    'INSERT INTO public.access_grants (user_id, language, level) VALUES (''33333333-3333-3333-3333-111111111111'', ''en'', ''C2'')',
    'Student insert into access_grants'
  );
END $$;

-- Regression Test (5): User created with raw_user_meta_data = '{"role":"founder"}' becomes 'student'
RESET ROLE;
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'sneaky_founder@cosy.test',
  '{"role": "founder", "display_name": "Sneaky Founder"}'::jsonb
);

DO $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = '44444444-4444-4444-4444-444444444444';
  IF v_role <> 'student' THEN
    RAISE EXCEPTION 'Regression Test (5) Failed: User created with founder metadata got role %, expected student!', v_role;
  END IF;
END $$;

-- Regression Test (6): set_user_role still works for founder, fails for student and last founder demotion
-- Founder promotes student to teacher
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
DO $$
BEGIN
  PERFORM public.set_user_role('33333333-3333-3333-3333-111111111111', 'teacher');
END $$;

RESET ROLE;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '33333333-3333-3333-3333-111111111111' AND role = 'teacher') THEN
    RAISE EXCEPTION 'Regression Test (6) Failed: set_user_role by founder did not update role to teacher!';
  END IF;
END $$;

-- Student calling set_user_role fails
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-222222222222';
DO $$
BEGIN
  PERFORM pg_temp.assert_denied(
    'SELECT public.set_user_role(''33333333-3333-3333-3333-222222222222'', ''founder'')',
    'Student calling set_user_role'
  );
END $$;

-- Demoting second founder (allowed since Founder One remains)
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
DO $$
BEGIN
  PERFORM public.set_user_role('11111111-1111-1111-1111-222222222222', 'teacher');
END $$;

-- Demoting last founder fails
DO $$
BEGIN
  PERFORM pg_temp.assert_denied(
    'SELECT public.set_user_role(''11111111-1111-1111-1111-111111111111'', ''student'')',
    'Demoting last founder'
  );
END $$;

-- Test 11: my_access() Function Output
SET ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '33333333-3333-3333-3333-222222222222';
DO $$
DECLARE
  v_access jsonb;
BEGIN
  v_access := public.my_access();
  IF (v_access->>'role') <> 'student' THEN
    RAISE EXCEPTION 'my_access test failed: role expected student, got %', v_access->>'role';
  END IF;
  IF jsonb_array_length(v_access->'grants') <> 1 THEN
    RAISE EXCEPTION 'my_access test failed: grants length expected 1, got %', jsonb_array_length(v_access->'grants');
  END IF;
END $$;

ROLLBACK;
