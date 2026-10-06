# Step-by-Step Supabase Session Publishing Guide

This guide details how authors and maintainers publish live speaking club sessions and gated event content to Supabase using the local publishing tooling.

---

## 🔒 Security Principles

1. **Git Protection:** Private session JSON files, facilitator notes, and raw token strings MUST reside in local, gitignored directories (e.g. `private/`). The publishing script refuses execution if run on git-tracked files.
2. **Service Role Key:** Publishing requires `SUPABASE_SERVICE_ROLE_KEY` defined in a local, gitignored `.env` file. Never commit `.env` or service role keys to source control.
3. **Public Teaser Shells:** Public HTML pages in `sessions/**/*.html` contain only static teaser metadata (title, club, level, summary) and zero private prompt decks or notes.

---

## 🛠️ Step-by-Step Publishing Workflow

### Step 1: Prepare Private Session Payload
Create a private JSON payload file in `private/session-exports/<session_id>.json` using the standard structure:

```json
{
  "session_id": "session-mind-matters-example",
  "public": {
    "title": "Example Session",
    "format": "Mind Matters",
    "language": "English",
    "level": "B1-B2",
    "summary": "Short public teaser summary.",
    "is_published": true
  },
  "content": {
    "vocabulary": [
      { "word": "Resilience", "definition": "Capacity to recover quickly.", "example": "Her resilience was inspiring." }
    ],
    "rounds": [
      { "title": "Round 1", "items": [{ "main": "Discussion prompt question?" }] }
    ],
    "grammar": null,
    "discussion": [],
    "full_notes": "Facilitator private notes and timing guidance."
  },
  "teacher_notes": "Specific notes for language teachers."
}
```

### Step 2: Validate Payload Format
Run `--validate-only` to ensure schema compliance before publishing:

```bash
node scripts/publish_to_supabase.js --validate-only private/session-exports/<session_id>.json
```

### Step 3: Publish to Supabase and Build Public Shell
Use the master helper command to publish content to Supabase database tables (`session_catalog`, `session_content`, `session_sources`, `session_teacher_notes`), generate the public teaser HTML shell page, and register the catalog item in `data/sessions.json`:

```bash
npm run session:new -- private/session-exports/<session_id>.json --club mind-matters --lang English
```

---

## 🔑 Key Rotation & Security Procedures

If `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY` is accidentally exposed or compromised:

1. Log into the **Supabase Dashboard** -> Project Settings -> API.
2. Click **Roll Key** / **Generate New Secret** for the service-role or anon key.
3. Immediately update the new service-role key in your local gitignored `.env` file (`SUPABASE_SERVICE_ROLE_KEY=...`).
4. Update `shared/config/supabase.json` with the new `anonKey`.
5. Run `npm run verify:anon` to ensure anonymous REST API queries on private tables remain completely blocked.
