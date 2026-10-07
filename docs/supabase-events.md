# Supabase Events Database Architecture & RLS Specification

This document details the database schema, Row Level Security (RLS) policies, and publishing mechanism for **COSYevents** on Supabase Postgres.

---

## 🏗️ Architecture & Database Tables

COSYevents shares the Supabase project and `profiles` table with **COSYplatform**. User roles are defined on `public.profiles`:
- `founder` — Full system administrative access.
- `teacher` — Event host / facilitator.
- `student` — Enrolled learner.

### 1. `public.events_public`
Stores public metadata for language learning events.
- **`slug`** (`text PRIMARY KEY`): Unique event identifier.
- **`title`** (`text NOT NULL`): Event title.
- **`description`** (`text NOT NULL`): Event summary.
- **`languages`** (`text[] NOT NULL`): Array of target languages.
- **`status`** (`text NOT NULL`): Event status (`upcoming`, `current`, `past`).

### 2. `public.sessions_public`
Stores public metadata for individual sessions within an event.
- **`slug`** (`text PRIMARY KEY`): Unique session identifier.
- **`event_slug`** (`text NOT NULL FK`): References `events_public(slug)`.
- **`title`** (`text NOT NULL`): Session title.
- **`theme`** (`text NOT NULL`): Topic/theme name.
- **`language`** (`text NOT NULL`): Session language.
- **`level`** (`text NOT NULL`): CEFR level (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`).
- **`date`** (`text NOT NULL`): Session date (`YYYY-MM-DD`).

### 3. `public.session_content`
Stores gated interactive session content (activities, instructions, secret prompts, and vocabulary lists).
- **`session_slug`** (`text PRIMARY KEY FK`): References `sessions_public(slug)`.
- **`event_slug`** (`text NOT NULL FK`): References `events_public(slug)`.
- **`content`** (`jsonb NOT NULL`): JSON payload containing activities and vocabulary.
- **`updated_at`** (`timestamptz NOT NULL`): Last update timestamp.

### 4. `public.event_access`
Tracks participant access grants for events (paid or invited students).
- **`user_id`** (`uuid FK`): References `auth.users(id)`.
- **`event_slug`** (`text FK`): References `events_public(slug)`.
- **`granted_by`** (`uuid FK`): References `auth.users(id)` (founder who granted access).
- **`created_at`** (`timestamptz NOT NULL`): Grant timestamp.
- **PRIMARY KEY:** `(user_id, event_slug)`

### 5. `public.event_hosts`
Assigns host teachers/facilitators to specific events.
- **`user_id`** (`uuid FK`): References `auth.users(id)`.
- **`event_slug`** (`text FK`): References `events_public(slug)`.
- **PRIMARY KEY:** `(user_id, event_slug)`

---

## 🔒 Row Level Security (RLS) Rules

All tables have Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

| Table | Role / Actor | Allowed Operations | Condition / Filter |
| :--- | :--- | :--- | :--- |
| **`events_public`** | Everyone (incl. anonymous) | `SELECT` | `true` |
| | Founder | `ALL` | `is_founder()` |
| **`sessions_public`** | Everyone (incl. anonymous) | `SELECT` | `true` |
| | Founder | `ALL` | `is_founder()` |
| **`session_content`** | Founder | `ALL` | `is_founder()` |
| | Event Host | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Assigned in `event_hosts` for `event_slug` |
| | Student (with `event_access`) | `SELECT` | Granted in `event_access` for `event_slug` (current & past) |
| | Unassigned Student / Anonymous | **None** | Denied |
| **`event_access`** | Founder | `SELECT`, `INSERT`, `DELETE` | `is_founder()` |
| | Student | `SELECT` | `user_id = auth.uid()` |
| | Anonymous / Non-founder write | **None** | Denied |
| **`event_hosts`** | Founder | `ALL` | `is_founder()` |
| | Host | `SELECT` | `user_id = auth.uid()` |
| | Anonymous | **None** | Denied |

---

## 🚀 Publishing Script (`scripts/publish-events.js`)

Session content is deployed to Supabase using `scripts/publish-events.js`.

### Security Note
The publisher script uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS during build/deploy operations. **The service key is strictly used server-side, in CI workflows, or during local deployment scripts and must NEVER be exposed in client-side code.**

### Usage
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

npm run publish
```

---

## 🧪 Testing RLS Rules

RLS policies are verified via `scripts/test-rls-rules.js`:
```bash
npm run test:rls
```
The test suite validates:
1. Public select access on `events_public` and `sessions_public`.
2. Gated denial of `session_content` for anonymous and ungranted users.
3. Successful read access of `session_content` for assigned hosts and students with `event_access`.
4. Strict enforcement allowing only founders to insert/delete `event_access`.
