-- Migration: 20261003000200_profile_input_limits.sql
-- Description: Input length and language constraints on profiles table, and sanitisation in handle_new_user.

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_len
  CHECK (display_name IS NULL OR char_length(display_name) <= 60);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_ui_lang_valid
  CHECK (ui_lang IS NULL OR ui_lang IN ('en','fr','it','ru','el','es'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw_name text;
  v_clean_name text;
  v_ui_lang text;
BEGIN
  v_raw_name := COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email);

  IF v_raw_name IS NOT NULL THEN
    v_clean_name := translate(v_raw_name, '<>&"', '');
    v_clean_name := trim(v_clean_name);
    IF char_length(v_clean_name) = 0 THEN
      v_clean_name := NULL;
    ELSE
      v_clean_name := substring(v_clean_name from 1 for 60);
    END IF;
  ELSE
    v_clean_name := NULL;
  END IF;

  v_ui_lang := NEW.raw_user_meta_data->>'ui_lang';
  IF v_ui_lang IS NOT NULL AND v_ui_lang NOT IN ('en','fr','it','ru','el','es') THEN
    v_ui_lang := 'en';
  END IF;

  INSERT INTO public.profiles (id, role, display_name, ui_lang)
  VALUES (
    NEW.id,
    'student',
    v_clean_name,
    COALESCE(v_ui_lang, 'en')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
