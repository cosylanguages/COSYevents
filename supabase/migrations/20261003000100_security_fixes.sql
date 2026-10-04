-- COSYevents security fixes. Apply AFTER 20261003000000_ecosystem_access.sql.
-- Fixes: (1) students could set their own role to founder; (2) students could read unpublished drafts.
-- Tested on PostgreSQL 16 against the repo suite and 7 attack scenarios.

-- 1. Re-assert column-level privileges on profiles: the earlier table-wide GRANT undid them,
--    letting any signed-in user UPDATE their own role.
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (display_name, ui_lang) ON public.profiles TO authenticated;

-- 2. Defence in depth: id and role can only change through privileged roles or set_user_role().
CREATE OR REPLACE FUNCTION public.guard_profile_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'profiles.id is immutable';
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
    RAISE EXCEPTION 'profiles.role can only be changed with set_user_role()';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_guard_columns ON public.profiles;
CREATE TRIGGER profiles_guard_columns BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_columns();

-- 3. Students must not read unpublished (draft) sessions.
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
  v_published boolean;
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
  SELECT language, level_min, level_max, courses, is_published
    INTO v_lang, v_level_min, v_level_max, v_courses, v_published
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

  -- Students never see drafts: only published sessions
  IF NOT coalesce(v_published, false) THEN
    RETURN false;
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
