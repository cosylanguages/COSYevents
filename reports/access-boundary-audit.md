# Access Boundary Audit: Map Public vs Gated Content Boundary

## Executive Summary

This audit establishes a clear boundary between **public metadata** (titles, schedules, descriptions, landing pages) and **full session content** (prompts, vocabulary grids, discussion decks, host notes, downloadable materials) within the `COSYevents` repository.

The goal is to prepare for future content gating and migration decisions without altering or deleting any existing files in this pull request.

---

## 1. Full Session Content (Gated Content Candidates)

The following files and folders contain complete session content (prompts, vocabulary tables, discussion rounds, quotes, lyrics, takeaways, host notes, downloadable PDF materials, and JSON prompt decks) intended to be restricted to hosts/paid members:

### A. HTML and Markdown Session Sources (`sessions/`) — 724 Files
All session detail pages and source Markdown files under `sessions/` contain full lesson plans, vocabulary grids, and discussion prompts across 12 event formats:
* `sessions/basic-speaking-club/`
* `sessions/cinema-club/`
* `sessions/debatable-relatable/`
* `sessions/i-couldnt-help-but-wonder/`
* `sessions/if-you-were/`
* `sessions/karaoke-club/` (including subfolders `ru/`, `es/`, `fr/`, `challenges/`)
* `sessions/keeping-up-with-science/`
* `sessions/lets-celebrate/`
* `sessions/long-reads/`
* `sessions/mind-matters/`
* `sessions/my-life-with-without/`
* `sessions/the-greatest-quotes/`

### B. Localized Session Pages (`fr/sessions/` & `ru/sessions/`) — 85 Files
Localized HTML session detail pages containing full translated prompts and vocabulary grids:
* **French (`fr/sessions/`, 44 files):**
  * `fr/sessions/debatable-relatable/`
  * `fr/sessions/i-couldnt-help-but-wonder/`
  * `fr/sessions/keeping-up-with-science/`
  * `fr/sessions/lets-celebrate/`
  * `fr/sessions/mind-matters/`
  * `fr/sessions/the-greatest-quotes/`
* **Russian (`ru/sessions/`, 41 files):**
  * `ru/sessions/debatable-relatable/`
  * `ru/sessions/i-couldnt-help-but-wonder/`
  * `ru/sessions/keeping-up-with-science/`
  * `ru/sessions/lets-celebrate/`
  * `ru/sessions/mind-matters/`
  * `ru/sessions/the-greatest-quotes/`

### C. Downloadable Materials (`shared/materials/`) — 2 Files
Full guide documents intended for session participants/hosts:
* `shared/materials/french-phonetics-guide.pdf`
* `shared/materials/russian-idioms.pdf`

### D. Full Event Deck JSON Datasets (`data/events/*.json`) — 5 Files
Structured JSON files containing complete prompt decks, vocabulary primers, song themes, article passages, and game rules:
* `data/events/cinema-club.json` (Full prompts & vocabulary primers for 117 cinema sessions)
* `data/events/game-evenings.json` (Full lineups & game rules)
* `data/events/karaoke-club.json` (Full song themes, vocabulary, & discussion prompts)
* `data/events/long-reads.json` (Full article passages, reading vocabulary, & analysis prompts)
* `data/events/speaking-clubs.json` (Full prompts & vocabulary across all speaking club formats)

### E. Evaluation of `data/sessions.json`
* **Finding:** While `data/sessions.json` was specified in the initial task scope alongside `sessions/`, direct inspection reveals that `data/sessions.json` contains **only high-level index metadata** (`title`, `href`, `level`, `lang`, `club`, `format` across 645 catalog entries). It does **not** contain full prompts, materials, or decks.
* **Classification:** `data/sessions.json` is classified as **Metadata-Only (Public Safe)**, whereas the actual full JSON prompt decks reside in `data/events/*.json` listed above.

---

## 2. Metadata-Only (Safe to Stay Public) Candidates

The following files and folders contain only public navigation, schedule metadata, format descriptions, media assets, static UI engines, or structural schemas, and are safe to remain public:

### A. Main Catalog & Format Landing Pages (`*.html`)
Top-level HTML pages providing event descriptions, schedules, browse filters, and rules:
* `index.html` (Main hub landing page)
* `browse.html` (Interactive catalog browser)
* `speaking-clubs.html` (Speaking club directory)
* `cinema-club.html`, `cinema-nights/index.html`, `cinema-club/index.html`
* `game-evenings.html`, `game-evening/index.html`, `game-evenings/index.html`
* `karaoke-club.html`, `karaoke-club/index.html`
* `long-reads.html`, `long-reads/index.html`
* Format landing pages: `basic-speaking-club.html`, `debatable-relatable.html`, `i-couldnt-help-but-wonder.html`, `if-you-were.html`, `keeping-up-with-science.html`, `lets-celebrate.html`, `mind-matters.html`, `my-life-with-without.html`, `the-greatest-quotes.html`
* Policy pages: `privacy.html`

### B. Hub Redirect & Subfolder Index Pages (`events/`, `past-events/`, etc.)
Directory index pages serving as client-side redirects to preserve canonical URLs across the COSY ecosystem:
* `events/index.html`
* `events/speaking-clubs/*/index.html` (`debatable-relatable`, `i-couldnt-help-but-wonder`, `if-you-were`, `keeping-up-with-science`, `lets-celebrate`, `mind-matters`, `my-life-with-without`, `the-greatest-quotes`)
* `events/multimedia-nights/*/index.html` (`cinema-club`, `game-evening`, `karaoke-club`, `long-reads`)
* Subfolder stubs: `past-events/index.html`, `practice/index.html`, `games/index.html`, `special-events/index.html`, `teacher-led-sessions/index.html`

### C. Localized Landing Hubs (`fr/`, `ru/`, `el/`, `it/`)
Public language hub entry pages:
* `fr/index.html`, `fr/speaking-clubs.html`, `fr/mind-matters.html`
* `ru/index.html`, `ru/speaking-clubs.html`, `ru/mind-matters.html`
* `el/index.html`
* `it/index.html`

### D. Public Calendar & Catalog Datasets
* `data/sessions.json` (Search index array mapping 645 session titles to `href`, `level`, `lang`, `club`, `format`)
* `shared/calendar-data/events.json` (Calendar event schedules, dates, titles, and `conversionStatus`)

### E. Media & Design Assets
* `images/` (Club banner images, thumbnails, logos)
* `assets/` (Event posters, cover graphics)
* `shared/images/` (Brand logos and icons)

### F. Frontend Scripts, Styles, & Engines
* `shared/js/` (`cosyevents-session.js`, `prompt-deck-loader.js`, `wonder-voiceover.js`, `bgm-player.js`)
* `shared/css/`, `styles/`, `assets/css/`, `assets/js/`
* `shared/calendar/` (`calendar.js`)

### G. Authoring Templates, Specifications & System Configurations
* `templates/` (`session-template.html`, `sample-session.json`, `vocabulary-export.json`, etc.)
* `docs/` (`speaking-clubs-spec.md`, `session-conversion-spec.md`, `passport-schema.md`, etc.)
* Configuration & Tooling: `package.json`, `manifest.json`, `.pages.yml`, `CONTRIBUTING.md`, `AUDIT.md`, `README.md`

---

## 3. Analysis of `scripts/publish_to_supabase.js` and Database Schema

### A. Target Table Structure
`scripts/publish_to_supabase.js` writes directly to the `public.session_content` table in Supabase via an `upsert` operation keyed on `session_id`.

**Database Schema Definition (`scripts/schema.sql`):**
```sql
CREATE TABLE IF NOT EXISTS public.session_content (
  session_id text PRIMARY KEY,
  full_notes text,
  recording_url text,
  updated_at timestamptz DEFAULT now()
);
```

### B. Row Level Security (RLS) & Access Control
`scripts/schema.sql` enables RLS on `public.session_content` with strict policies:
* **Founders:** Full access to SELECT, INSERT, and UPDATE all records.
* **Hosts:** SELECT, INSERT, and UPDATE access restricted to sessions listed in their `hosted_sessions` array in `public.profiles`.
* **Students:** SELECT access restricted to sessions listed in their `enrolled_sessions` array in `public.profiles`.
* **Unauthenticated / Public:** Denied all access (no public SELECT policy exists).

### C. Metadata Separation Analysis
1. **Schema Separation:** **YES, the schema already separates public metadata from gated content.**
   * `public.session_content` stores strictly host-only / paid content (`full_notes`, `recording_url`).
   * Public metadata (titles, dates, levels, languages, club formats) is managed separately in static feeds (`data/sessions.json`, `shared/calendar-data/events.json`).
2. **Current Workflow Scope:**
   * `publish_to_supabase.js` currently expects a local private JSON payload containing `{ session_id, full_notes, recording_url }`.
   * **Limitation:** The script does **not** currently ingest or migrate full prompt decks, discussion rounds, vocabulary grids, or Markdown sources (`sessions/`, `data/events/*.json`). Those prompt materials remain in plain public files within this git repository until a data migration architecture is selected.

---

## Summary Table

| Category / Path | Item Type | File Count | Access Boundary Recommendation |
|---|---|---|---|
| `sessions/` | Session HTML & MD sources | 724 | **Gated Content** (Move/Restrict) |
| `fr/sessions/` & `ru/sessions/` | Localized session HTML pages | 85 | **Gated Content** (Move/Restrict) |
| `shared/materials/` | Downloadable PDF guides | 2 | **Gated Content** (Move/Restrict) |
| `data/events/*.json` | Full prompt deck datasets | 5 | **Gated Content** (Move/Restrict) |
| `data/sessions.json` | Catalog index (titles/links) | 1 | **Public Safe** (Metadata Only) |
| `shared/calendar-data/events.json` | Event schedule feed | 1 | **Public Safe** (Metadata Only) |
| Root `*.html` & hub pages | Landing pages & browse UI | ~35 | **Public Safe** (Metadata Only) |
| `images/` & `assets/` | Media assets & posters | ~25 | **Public Safe** (Metadata Only) |
| `scripts/publish_to_supabase.js` | Supabase sync script | 1 | Writes to gated `public.session_content` |
