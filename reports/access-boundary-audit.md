# Access Boundary Audit: Map Public vs Gated Content Boundary

## Executive Summary

This audit establishes a clear boundary between **public metadata & accessible session media** (titles, schedules, descriptions, landing pages, vocabulary primers, articles/links, music videos, trailers, and song lyrics) versus **gated session facilitation content** (discussion prompts, host decks, facilitator notes, slide transcripts, downloadable host guides, and recording URLs) within the `COSYevents` repository.

The goal is to prepare for future content gating and migration decisions without altering or deleting any existing files in this pull request.

---

## 1. Component-Level Access Boundary (User Policy Guidelines)

Based on the refined product guidelines, individual session components are categorized into **Public / Accessible** vs **Gated / Host & Paid**:

### A. Public / Accessible Content Components
* **Session Metadata:** Event titles, dates, descriptions, language levels, event formats, duration, host names, landing pages.
* **Vocabulary:** Vocabulary primers, terms, definitions, parts of speech, and vocabulary grids.
* **Reading & Article Content:** Article passages, text excerpts, and external links to source articles.
* **Multimedia & Lyrics:** Music video embeds/links, movie trailers, video streams, and full song lyrics (e.g. Karaoke Club song texts).

### B. Gated Content Components (Host / Paid Members Only)
* **Discussion Prompts & Decks:** Host-led prompt decks, discussion rounds, debate duels, personal reflection prompts, and calibrated speaking questions (e.g. the `prompts` arrays in `data/events/*.json` and HTML session pages).
* **Facilitator Notes & Transcripts:** Detailed host notes, slide transcripts, and exercise breakdowns (`full_notes` in `public.session_content`).
* **Session Recording URLs:** Private video recordings of past sessions (`recording_url` in `public.session_content`).
* **Downloadable Host Guides:** Supplementary guide PDFs (`shared/materials/`).

---

## 2. File & Directory Inventory

### A. Session Content & Prompt Deck Datasets (Gated Components & Hybrid Files)

The following files contain complete session structures. Note that while HTML files and JSON datasets currently bundle accessible components (vocabulary, article links, lyrics) with gated components (prompts, discussion rounds), future migration can decouple them:

1. **HTML and Markdown Session Sources (`sessions/`) — 724 Files**
   All session detail pages and source Markdown files under `sessions/` contain full lesson plans, vocabulary grids, article links, song lyrics, and discussion prompts across 12 event formats:
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

2. **Localized Session Pages (`fr/sessions/` & `ru/sessions/`) — 85 Files**
   Localized HTML session detail pages containing full translated prompts, vocabulary grids, and discussion rounds:
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

3. **Downloadable Host Materials (`shared/materials/`) — 2 Files**
   Full guide documents intended for session participants/hosts:
   * `shared/materials/french-phonetics-guide.pdf`
   * `shared/materials/russian-idioms.pdf`

4. **Event Deck JSON Datasets (`data/events/*.json`) — 5 Files**
   Structured JSON files containing prompt decks, vocabulary primers, song themes, article passages, and game rules:
   * `data/events/cinema-club.json` (Prompts & vocabulary primers for 117 cinema sessions)
   * `data/events/game-evenings.json` (Lineups & game rules)
   * `data/events/karaoke-club.json` (Song themes, vocabulary, & discussion prompts)
   * `data/events/long-reads.json` (Article passages, reading vocabulary, & analysis prompts)
   * `data/events/speaking-clubs.json` (Prompts & vocabulary across all speaking club formats)

5. **Evaluation of `data/sessions.json`**
   * **Finding:** Direct inspection reveals that `data/sessions.json` contains **only high-level index metadata** (`title`, `href`, `level`, `lang`, `club`, `format` across 645 catalog entries). It does **not** contain prompts, materials, or decks.
   * **Classification:** `data/sessions.json` is classified as **Metadata-Only (Public Safe)**, whereas full JSON prompt decks reside in `data/events/*.json`.

---

### B. Metadata-Only (Safe to Stay Public) Candidates

The following files and folders contain public navigation, schedule metadata, format descriptions, vocabulary primers, media assets, static UI engines, or structural schemas, and are safe to remain public:

1. **Main Catalog & Format Landing Pages (`*.html`)**
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

2. **Hub Redirect & Subfolder Index Pages (`events/`, `past-events/`, etc.)**
   Directory index pages serving as client-side redirects to preserve canonical URLs across the COSY ecosystem:
   * `events/index.html`
   * `events/speaking-clubs/*/index.html` (`debatable-relatable`, `i-couldnt-help-but-wonder`, `if-you-were`, `keeping-up-with-science`, `lets-celebrate`, `mind-matters`, `my-life-with-without`, `the-greatest-quotes`)
   * `events/multimedia-nights/*/index.html` (`cinema-club`, `game-evening`, `karaoke-club`, `long-reads`)
   * Subfolder stubs: `past-events/index.html`, `practice/index.html`, `games/index.html`, `special-events/index.html`, `teacher-led-sessions/index.html`

3. **Localized Landing Hubs (`fr/`, `ru/`, `el/`, `it/`)**
   Public language hub entry pages:
   * `fr/index.html`, `fr/speaking-clubs.html`, `fr/mind-matters.html`
   * `ru/index.html`, `ru/speaking-clubs.html`, `ru/mind-matters.html`
   * `el/index.html`
   * `it/index.html`

4. **Public Calendar & Catalog Datasets**
   * `data/sessions.json` (Search index array mapping 645 session titles to `href`, `level`, `lang`, `club`, `format`)
   * `shared/calendar-data/events.json` (Calendar event schedules, dates, titles, and `conversionStatus`)

5. **Media & Design Assets**
   * `images/` (Club banner images, thumbnails, logos)
   * `assets/` (Event posters, cover graphics)
   * `shared/images/` (Brand logos and icons)

6. **Frontend Scripts, Styles, & Engines**
   * `shared/js/` (`cosyevents-session.js`, `prompt-deck-loader.js`, `wonder-voiceover.js`, `bgm-player.js`)
   * `shared/css/`, `styles/`, `assets/css/`, `assets/js/`
   * `shared/calendar/` (`calendar.js`)

7. **Authoring Templates, Specifications & System Configurations**
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
2. **Current Workflow Scope & Decoupling Strategy:**
   * `publish_to_supabase.js` currently expects a local private JSON payload containing `{ session_id, full_notes, recording_url }`.
   * **Component Gating Recommendation:** To support making vocabulary, article links, video trailers, and lyrics accessible while gating discussion prompts/decks, future migration can decouple prompt decks from vocabulary/media components or expand `session_content` / Supabase tables to hold prompt decks separately from public vocabulary data.

---

## Summary Matrix

| Content Component | Included Files / Paths | Current Status | Recommended Access Boundary |
|---|---|---|---|
| **Titles, Dates, Levels, Links** | `data/sessions.json`, `shared/calendar-data/events.json` | Public File | **Public / Accessible** |
| **Landing Pages & Catalogs** | Root `*.html`, `events/`, localized hubs | Public File | **Public / Accessible** |
| **Vocabulary Grids & Primers** | `sessions/*`, `data/events/*.json` | Embedded in session files | **Public / Accessible** |
| **Articles, Passages & Resource Links** | `sessions/*`, `data/events/long-reads.json` | Embedded in session files | **Public / Accessible** |
| **Music Videos, Trailers & Song Lyrics** | `sessions/karaoke-club/*`, `data/events/karaoke-club.json` | Embedded in session files | **Public / Accessible** |
| **Discussion Prompts & Question Decks** | `sessions/*`, `data/events/*.json` | Embedded in session files | **Gated** (Host / Paid) |
| **Facilitator Notes & Transcripts** | `public.session_content` (Supabase) | Gated via Supabase RLS | **Gated** (Host / Paid) |
| **Session Recording URLs** | `public.session_content` (Supabase) | Gated via Supabase RLS | **Gated** (Host / Paid) |
| **Downloadable PDF Guides** | `shared/materials/*.pdf` | Public File | **Gated** (Host / Paid) |
