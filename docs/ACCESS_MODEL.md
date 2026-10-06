# COSY Ecosystem Access Control Model

This document outlines the security and access control model for the COSY ecosystem (COSYlanguages, COSYevents, COSYplatform, COSYmanuals, etc.).

All access enforcement happens directly inside PostgreSQL via Row Level Security (RLS) policies.

---

## Roles Overview

Users in `public.profiles` have one of three roles in `profiles.role`:

1. **`student`**: Default role for all newly registered users. Students have zero access to private content by default until granted access via `access_grants` or `session_grants`.
2. **`teacher`**: Granted language permissions in `teacher_languages`. Teachers can view all private session content and teacher notes for sessions in their assigned languages.
3. **`founder`**: Administrative role. Founders can read and write all session content, catalog entries, grants, profiles, revisions, and storage files.

> **Security Rule**: Roles can only be changed with set_user_role (founder) or by privileged database roles. Regular users cannot modify their own role.

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
   - *Note*: Students never see unpublished sessions. Unlevelled draft sessions (`level_min` or `level_max` is `NULL`) are accessible only to teachers of that language and founders, never to students.
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

## Participant Magic Links

Participant magic links allow event participants to access specific session materials via tokenized URLs without requiring student user accounts or password sign-ins.

### Storage & Token Security

- **Plain Token Handling**: Plain secret tokens are generated as 24-character URL-safe strings (`gen_random_bytes(18)` encoded in base64url without padding) and returned exactly once to staff upon link creation (`create_session_access_link`). Plain tokens are **never** stored in the database.
- **Hash Storage**: The table `public.session_access_links` stores only the hex-encoded SHA-256 hash (`encode(digest(token, 'sha256'), 'hex')`) along with expiration dates, validity windows (up to 400 days max), revocation status, and usage metrics (`use_count`, `last_used_at`).
- **Table Security**: Direct table queries on `public.session_access_links` are disabled for `anon` and `authenticated` roles (`REVOKE ALL`). Staff interaction occurs exclusively through SECURITY DEFINER database functions.

### Participant vs. Staff Role Views

- **Participant Redemption (`redeem_session_access_link`)**:
  - Accessible by `anon` and `authenticated` roles.
  - Returns `{"status": "ok", "catalog": {...}, "content": {...}, "sources": [...], "valid_until": ...}` or status (`"invalid"`, `"expired"`, `"revoked"`).
  - Includes `recording_url` **only** when `session_content.share_recording` is explicitly set to `true`.
  - **Never** returns `full_notes`, `teacher_notes`, or internal `audio_storage_path` values.
- **Staff Inspection & Management**:
  - `staff_get_session(session_id)`: Allowed for founders and teachers assigned to the session's language. Returns full session content including `full_notes`, `teacher_notes`, and `recording_url`.
  - `list_session_access_links(session_id)`: Allowed for founders and teachers of that language. Returns link IDs, labels, validity windows, usage metrics, and computed statuses (`active`, `expired`, `revoked`). **Never** exposes token hashes.
  - `revoke_session_access_link(link_id)`: Allowed for founders and teachers of that language. Immediately marks a link as revoked (`revoked_at = now()`).

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
