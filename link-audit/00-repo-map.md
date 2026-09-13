# COSYevents Repository Structure and Linkage Audit

**Audit Date:** September 2025
**Audit Scope:** Full repository analysis across `main` and all 15 open git remote branches:
* `origin/add-karaoke-club-event-11050779797932378381`
* `origin/consolidate-structure-audit-reconciliation-3965281105549673099`
* `origin/design/foundations`
* `origin/docs/manuals-migration-plan-1341789491726014192`
* `origin/feat/cosy-events-skeleton-2540620941304485329`
* `origin/feat/events-calendar-setup-8311991619788579292`
* `origin/feature/lesson-conversion-schema-and-audit-13539039830286937551`
* `origin/feature/speaking-clubs-sessions-and-audio-migration-9763516308666518902`
* `origin/fix/event-types-catalog-count-714123950641138762`
* `origin/import-remaining-reference-docs-5203188771245457902`
* `origin/jules-17017570330769947113-5df482bd`
* `origin/jules-8374129651958968084-63c62a6d`
* `origin/jules/extract-cosy-design-tokens-5493772850687233379`
* `origin/main`
* `origin/migrate-cosylanguages-events-reconciliation-7253627606785249249`
* `origin/populate-speaking-clubs-pinned-batches-15844949905235407213`

---

## 1. Directory Breakdown: Event Type Folders (`speaking-clubs/`, `cinema-nights/`, `teacher-led-sessions/`, `special-events/`, `past-events/`)

### 1.1 Folder Inventory Findings
Across **all** 16 branches (main and 15 remote branches), the folders `speaking-clubs/`, `cinema-nights/`, `teacher-led-sessions/`, `special-events/`, and `past-events/` do **NOT** contain language (English, French, Italian, Russian, Greek) or CEFR level (A1–C2) subdirectories.

Instead, each directory only contains a single `index.html` file that serves as a single-page format catalog / redirect shell:
* `speaking-clubs/index.html` (Redirects to `/speaking-clubs.html`)
* `cinema-nights/index.html` (Redirects to `/cinema-club.html`)
* `teacher-led-sessions/index.html` (Redirects to `/speaking-clubs.html`)
* `special-events/index.html` (Redirects to `/speaking-clubs.html`)
* `past-events/index.html` (Redirects to `/speaking-clubs.html`)

Session HTML content files are stored centrally under `sessions/<topic>/` (e.g., `sessions/debatable-relatable/`, `sessions/cinema-club/`, `sessions/mind-matters/`, `sessions/karaoke-club/`), or localized under `fr/sessions/` and `ru/sessions/`.

### 1.2 Audit Flags (Missing Structure & Gaps)
* **CRITICAL ARCHITECTURAL MISSING:** The per-language / per-CEFR level folder taxonomy (`<event-type>/<language>/<level>/`) under `speaking-clubs/`, `cinema-nights/`, `teacher-led-sessions/`, `special-events/`, and `past-events/` is **100% missing across all branches**.
* **Language Gaps in Event Content:**
  * **English:** Present in dynamic catalog data (`data/sessions.json` and `shared/calendar-data/events.json`) and session HTML pages under `sessions/`.
  * **French:** Present in `fr/` subtree and catalog data.
  * **Russian:** Present in `ru/` subtree and catalog data.
  * **Italian:** **MISSING** on disk as session HTML pages or dedicated hubs. (Only referenced as upcoming calendar events in `shared/calendar-data/events.json` such as `evt-2025-002` and `evt-2025-009`).
  * **Greek:** **MISSING** on disk as session HTML pages or dedicated hubs. (Only referenced as upcoming calendar events in `shared/calendar-data/events.json` such as `evt-2025-004` and `evt-2025-010`).
* **CEFR Level Subdirectory Gaps:** No `A1`, `A2`, `B1`, `B2`, `C1`, or `C2` subdirectories exist within any event-type folder. Level classification is currently handled only via metadata attributes in HTML templates and JSON catalogs.

---

## 2. Hub, Index, and Landing Pages Inventory

The repository utilizes root-level HTML catalog pages as single sources of truth, supplemented by redirect `index.html` files in subdirectories, main portal pages, and localized language hubs.

### 2.1 Top-Level Portals & Global Landing Pages
* `index.html` — Main global landing page / homepage.
* `browse.html` — Cross-format catalog browser with search and filter controls.

### 2.2 Main Format Catalogs (Single Source of Truth Root HTML Pages)
* `speaking-clubs.html` — Primary catalog for Speaking Club events.
* `cinema-club.html` — Primary catalog for Cinema Club / Cinema Nights events.
* `game-evenings.html` — Primary catalog for Game Evening & Special Events.
* `karaoke-club.html` — Primary catalog for Karaoke Club sessions.
* `long-reads.html` — Primary catalog for Long Read sessions.

### 2.3 Subdirectory Index Pages (Redirect Shells to Root Catalogs)
These pages exist to satisfy direct folder navigation and redirect users to the root single-source-of-truth catalogs:
* `speaking-clubs/index.html` — Redirects to `../speaking-clubs.html`
* `cinema-nights/index.html` — Redirects to `../cinema-club.html`
* `cinema-club/index.html` — Redirects to `../cinema-club.html`
* `teacher-led-sessions/index.html` — Redirects to `../speaking-clubs.html`
* `special-events/index.html` — Redirects to `../speaking-clubs.html`
* `past-events/index.html` — Redirects to `../speaking-clubs.html`
* `game-evening/index.html` — Redirects to `../game-evenings.html`
* `game-evenings/index.html` — Redirects to `../game-evenings.html`
* `karaoke-club/index.html` — Redirects to `../karaoke-club.html`
* `long-reads/index.html` — Redirects to `../long-reads.html`

### 2.4 Per-Language Index Pages & Hubs
* `fr/index.html` — French language hub landing page.
* `fr/speaking-clubs.html` — French Speaking Clubs catalog hub.
* `fr/mind-matters.html` — French Mind Matters category hub.
* `ru/index.html` — Russian language hub landing page.
* `ru/speaking-clubs.html` — Russian Speaking Clubs catalog hub.
* `ru/mind-matters.html` — Russian Mind Matters category hub.

### 2.5 Karaoke Challenge Index Pages (Sub-hubs)
* `sessions/karaoke-club/challenges/abba-challenge/index.html`
* `sessions/karaoke-club/challenges/crazy-ex-girlfriend-challenge/index.html`
* `sessions/karaoke-club/challenges/kate-bush-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/angele-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/angelina-wismes-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/fabienne-thibeault-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/la-zarra-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/madame-monsieur-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/maelle-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/zazie-challenge/index.html`

---

## 3. Location and Schema of `/shared/calendar-data/events.json`

### 3.1 File Location
`/shared/calendar-data/events.json`

### 3.2 File Description
This file contains the structured JSON schedule dataset for upcoming and recent events. It feeds the interactive calendar widget loaded client-side across the platform.

### 3.3 Data Schema Definition
The dataset is an array of event objects. Each event object strictly follows or extends the schema below:

```json
{
  "id": "string (Required, format: evt-YYYY-XXX)",
  "title": "string (Required)",
  "type": "string (Required: 'speaking-club' | 'cinema-night' | 'teacher-session' | 'special-event')",
  "language": "string (Required: 'English' | 'French' | 'Italian' | 'Russian' | 'Greek')",
  "level": "string (Required: CEFR level 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')",
  "date": "string (Required, format: YYYY-MM-DD)",
  "time": "string (Required, format: HH:MM 24-hour)",
  "timezone": "string (Required, e.g., 'CET')",
  "host": "string (Required)",
  "host_bio": "string (Required)",
  "description": "string (Required)",
  "registration_link": "string (Required, URL format)",
  "materials": "string (Required, URL pointing to session HTML or PDF)",
  "poster": "string | null (Optional, URL pointing to event cover image)",
  "subtitles_info": "string | null (Optional, relevant for cinema-night events)",
  "synopsis": "string | null (Optional, relevant for cinema-night events)",
  "conversionStatus": "string | null (Optional: 'not-planned' | 'planned' | 'converted')",
  "convertedLessonUrl": "string | null (Optional, URL linking to converted lesson on COSYplatform)"
}
```

---

## 4. Navigation and "Parent" Pages Linking Down into Session Pages

The following pages function as parent hubs or topic entry points containing direct hyperlinks down into individual session HTML content pages:

### 4.1 Global Parent Catalogs & Navigation Hubs
* `index.html` — Features curated links to featured sessions and topic series.
* `browse.html` — Global dynamic searchable catalog listing all session HTML pages.
* `speaking-clubs.html` — Parent hub listing all Speaking Club sessions across topics.
* `cinema-club.html` — Parent hub listing all Cinema Club movie sessions.
* `game-evenings.html` — Parent hub listing interactive game night sessions.
* `karaoke-club.html` — Parent hub listing Karaoke song sessions and artist challenges.
* `long-reads.html` — Parent hub listing Long Read deep-dive sessions.

### 4.2 Topic-Specific Parent Pages (Root Level)
Each topic page aggregates sessions belonging to its specific editorial theme:
* `debatable-relatable.html` — Links to all *Debatable & Relatable* sessions.
* `i-couldnt-help-but-wonder.html` — Links to all *I Couldn't Help But Wonder* sessions.
* `if-you-were.html` — Links to all *If You Were...* sessions.
* `keeping-up-with-science.html` — Links to all *Keeping Up with Science* sessions.
* `lets-celebrate.html` — Links to all *Let's Celebrate* holiday/event sessions.
* `mind-matters.html` — Links to all *Mind Matters* psychology & society sessions.
* `my-life-with-without.html` — Links to all *My Life With & Without* lifestyle sessions.
* `the-greatest-quotes.html` — Links to all *The Greatest Quotes* philosophical sessions.

### 4.3 Localized Parent Hubs
* `fr/speaking-clubs.html` — Links directly down into `fr/sessions/...` French sessions.
* `fr/mind-matters.html` — Links directly down into `fr/sessions/mind-matters/...` French sessions.
* `ru/speaking-clubs.html` — Links directly down into `ru/sessions/...` Russian sessions.
* `ru/mind-matters.html` — Links directly down into `ru/sessions/mind-matters/...` Russian sessions.

### 4.4 Challenge Sub-Hub Pages
The Karaoke Club includes artist-specific challenge parent pages linking down to song detail pages:
* `sessions/karaoke-club/challenges/abba-challenge/index.html`
* `sessions/karaoke-club/challenges/crazy-ex-girlfriend-challenge/index.html`
* `sessions/karaoke-club/challenges/kate-bush-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/angele-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/angelina-wismes-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/fabienne-thibeault-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/la-zarra-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/madame-monsieur-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/maelle-challenge/index.html`
* `sessions/karaoke-club/challenges/fr/zazie-challenge/index.html`

### 4.5 Data Catalogs (Client-Side Dynamic Drivers)
* `data/sessions.json` — Master session catalog array (617 entries) that dynamically populates `browse.html` and root catalog pages with direct links (`href`) to all individual session pages.
