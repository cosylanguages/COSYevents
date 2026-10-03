# COSY Ecosystem Access Control Model

This document outlines the security and access control model for the COSY ecosystem (COSYlanguages, COSYevents, COSYplatform, COSYmanuals, etc.).

All access enforcement happens directly inside PostgreSQL via Row Level Security (RLS) policies.

---

## Roles Overview

Users in `public.profiles` have one of three roles in `profiles.role`:

1. **`student`**: Default role for all newly registered users. Students have zero access to private content by default until granted access via `access_grants` or `session_grants`.
2. **`teacher`**: Granted language permissions in `teacher_languages`. Teachers can view all private session content and teacher notes for sessions in their assigned languages.
3. **`founder`**: Administrative role. Founders can read and write all session content, catalog entries, grants, profiles, revisions, and storage files.

> **Security Rule**: Roles can only be changed by a founder via `set_user_role(target_uuid, new_role)` or by the database `service_role`. Regular users cannot modify their own role.

---

## CEFR Ranks & Level Matching

Levels are represented by ISO CEFR codes and mapped to integer ranks via `level_rank(text)`:
- `A0` = 0
- `A1` = 1
- `A2` = 2
- `B1` = 3
- `B2` = 4
- `C1` = 5
- `C2` = 6

### Access Grant Rule

A student can view a session's private content (`session_content`, `session_sources`, `session-audio` storage) if and only if there exists an active grant (`access_grants`) or single session grant (`session_grants`) for `auth.uid()` meeting all conditions:

1. **Language Match**: `grant.language = session.language`.
2. **Date Validity**: `current_date BETWEEN grant.valid_from AND COALESCE(grant.valid_until, 'infinity'::date)`.
3. **Level Match**:
   - Exact level (`include_lower = false`): `session.level_min <= rank(grant.level) <= session.level_max`.
   - Inclusive level (`include_lower = true`): `session.level_min <= rank(grant.level)`.
   - *Note*: Unlevelled draft sessions (`level_min` or `level_max` is `NULL`) are accessible only to teachers of that language and founders, never to students.
4. **Course Match**: If `session.courses` is specified (not empty), `grant.course` must match one of the required course codes (`grant.course = ANY(session.courses)`).

---

## Who-Sees-What Permissions Matrix

| Content / Table | Anon | Student (No Grant) | Student (Valid Grant) | Teacher (Assigned Lang) | Teacher (Other Lang) | Founder |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Published Catalog** (`session_catalog`) | Read | Read | Read | Read | Read | Read / Write |
| **Unpublished Catalog** | - | - | - | - | - | Read / Write |
| **Session Content** (`session_content`) | - | - | Read (Matching) | Read (Language) | - | Read / Write |
| **Session Sources** (`session_sources`) | - | - | Read (Matching) | Read (Language) | - | Read / Write |
| **Session Teacher Notes** (`session_teacher_notes`) | - | - | - | Read (Language) | - | Read / Write |
| **Session Revisions Log** (`session_revisions`) | - | - | - | - | - | Read |
| **Audio Storage** (`session-audio`) | - | - | Download (Matching) | Download (Language) | - | Download / Upload |
| **Access & Session Grants** | - | Read Own | Read Own | Read Own | Read Own | Read / Write All |

---

## Founder SQL Management Snippets

Founders can execute these SQL queries directly from the Supabase SQL Editor or admin interface.

### 1. Grant a 1-Month English B1 Pass
```sql
INSERT INTO public.access_grants (
  user_id,
  language,
  level,
  include_lower,
  valid_from,
  valid_until,
  source,
  note
) VALUES (
  'target-user-uuid-here',
  'en',
  'B1',
  false,
  current_date,
  current_date + interval '1 month',
  'pass',
  'Monthly English B1 Pass'
);
```

### 2. Extend an Existing Grant by 30 Days
```sql
UPDATE public.access_grants
   SET valid_until = valid_until + interval '30 days'
 WHERE grant_id = 'grant-uuid-here';
```

### 3. Revoke a Grant Immediately
```sql
UPDATE public.access_grants
   SET valid_until = current_date - interval '1 day'
 WHERE grant_id = 'grant-uuid-here';
```

### 4. Enable `include_lower` for a Student
```sql
UPDATE public.access_grants
   SET include_lower = true
 WHERE user_id = 'target-user-uuid-here'
   AND language = 'en';
```

### 5. Assign Single-Session Access
```sql
INSERT INTO public.session_grants (
  user_id,
  session_id,
  valid_until,
  source
) VALUES (
  'target-user-uuid-here',
  'mind-matters-session-slug',
  current_date + interval '14 days',
  'purchase'
);
```

### 6. Promote a User to Teacher and Assign Languages
```sql
-- Step A: Set role to teacher using founder function
SELECT public.set_user_role('target-user-uuid-here', 'teacher');

-- Step B: Assign teacher languages
INSERT INTO public.teacher_languages (user_id, language)
VALUES
  ('target-user-uuid-here', 'en'),
  ('target-user-uuid-here', 'fr')
ON CONFLICT DO NOTHING;
```

### 7. Promote a User to Founder
```sql
SELECT public.set_user_role('target-user-uuid-here', 'founder');
```
