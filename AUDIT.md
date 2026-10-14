# COSYevents Comprehensive Repository Audit

**Audit Date:** October 2026
**Repository Scope:** `COSYevents` (`cosylanguages/COSYevents`)
**Ecosystem Alignment:** COSYlanguages (public site), COSYdata (vocabulary data), COSYtools (verb/grammar reference tools), COSYmanuals (manuals), COSYplatform (paid courses), COSYevents (events), COSYgames (games). *Note: COSYworld is being discontinued.*

---

## 1. Branches and Open Pull Requests

Below is an exhaustive inventory of all remote branches and open pull requests, detailing their branch name, open PR status, last commit date, and what each adds or modifies relative to `main`.

### Open Pull Requests & Ahead Branches

1. **`add-karaoke-club-event-11050779797932378381`**
   - **Open PR:** PR #4 (*Add Karaoke Club event, data, and session template*)
   - **Last Commit Date:** 2026-09-06 10:37:00 +0000
   - **Commits Ahead of Main:** 1 (`433a5fa Add Karaoke Club event, data, and session template`)
   - **What it adds:** Early draft adding Karaoke Club event configuration, session JSON data, and `templates/karaoke-session-template.html`.

2. **`audit/map-public-vs-gated-boundary-9115760594983140027`**
   - **Open PR:** PR #48 (*audit: map public vs gated content boundary*)
   - **Last Commit Date:** 2026-09-28 20:21:11 +0000
   - **Commits Ahead of Main:** 2 (`5bc7c33`, `0e863da`)
   - **What it adds:** Initial audit report `reports/access-boundary-audit.md` mapping public vs gated session boundaries across Speaking Clubs.

3. **`cosylanguages-ecosystem-alignment-500101437617365072`**
   - **Open PR:** PR #30 (*Align COSYlanguages portal structure, remove deprecated references, and stage COSYevents migration*)
   - **Last Commit Date:** 2026-09-25 13:03:21 +0000
   - **Commits Ahead of Main:** 1 (`737384e Align COSYlanguages portal, remove teacher/COSYworld, add blog & event migration`)
   - **What it adds:** Early migration staging, portal navigation alignment, and removal of deprecated COSYworld references.

4. **`design/foundations`**
   - **Open PR:** PR #17 (*Add design audit checklist and shared design tokens*)
   - **Last Commit Date:** 2026-09-07 15:05:27 +0200
   - **Commits Ahead of Main:** 1 (`caf74bf Add design audit checklist and shared design tokens`)
   - **What it adds:** Design checklist documentation and initial CSS variables proposal in `css/cosy-tokens.css`.

5. **`docs/manuals-migration-plan-1341789491726014192`**
   - **Open PR:** PR #15 (*Add manuals migration plan proposal*)
   - **Last Commit Date:** 2026-09-07 07:06:50 +0000
   - **Commits Ahead of Main:** 2 (`36f2f6e`, `f7809af`)
   - **What it adds:** Migration proposal for moving teacher manuals and guides into COSYmanuals (`manuals/MIGRATION_PLAN.md`).

6. **`feat/ecosystem-sso-cms-editor-17516272259486617394`**
   - **Open PR:** PR #78 (*feat: enhance cross-domain SSO token transfer and founder role resolution*)
   - **Last Commit Date:** 2026-10-06 13:28:50 +0000
   - **Commits Ahead of Main:** 1 (`621e3b9 feat: enhance cross-domain SSO token transfer and founder role resolution`)
   - **What it adds:** Token transfer helpers across ecosystem subdomains and founder role RPC resolution in `shared/js/auth-sso.js` and `shared/js/cms-editor.js`.

7. **`feat/science-session-template-enhancements-10722759451960490484`**
   - **Open PR:** PR #82 (*Enhance Keeping Up with Science session template and vocabulary specs*)
   - **Last Commit Date:** 2026-10-07 21:11:04 +0000
   - **Commits Ahead of Main:** 4 (`301f9f3`, `587ed30`, `b391398`, `f1b437e`)
   - **What it adds:** Updated 6-part session structure, standardized 3-tier level metadata (Elementary, Intermediate, Advanced), and media alternative cards across Keeping Up with Science sessions.

8. **`feature/speaking-clubs-sessions-and-audio-migration-9763516308666518902`**
   - **Open PR:** No open PR
   - **Last Commit Date:** 2026-09-07 09:40:59 +0000
   - **Commits Ahead of Main:** 1 (`a95cc55 Add session catalog, background music, voiceover narration, and fix assets`)
   - **What it adds:** Background music player (`shared/js/bgm-player.js`), voiceover narrator scripts (`shared/js/wonder-voiceover.js`), and session audio assets.

9. **`import-remaining-reference-docs-5203188771245457902`**
   - **Open PR:** No open PR
   - **Last Commit Date:** 2026-09-06 16:43:30 +0000
   - **Commits Ahead of Main:** 1 (`8ce2b2c Populate pinned session batch data for Speaking Clubs`)
   - **What it adds:** Historical session batch population script in `scripts/archive/` and JSON metadata updates.

10. **`jules-17017570330769947113-5df482bd`**
    - **Open PR:** PR #16 (*Align session HTML markup with COSYevents standards*)
    - **Last Commit Date:** 2026-09-07 12:11:22 +0000
    - **Commits Ahead of Main:** 1 (`6bdb811 fix: align do-bisexuals-have-to-choose session HTML with COSYevents standards`)
    - **What it adds:** Replaced hardcoded hero markup with standardized session component structure in `sessions/i-couldnt-help-but-wonder/do-bisexuals-have-to-choose.html`.

11. **`jules-4281347256222539130-f4320ca5`**
    - **Open PR:** PR #41 (*feat: wire Supabase auth-based gating for facilitator notes and recordings*)
    - **Last Commit Date:** 2026-09-27 17:27:50 +0000
    - **Commits Ahead of Main:** 1 (`fa8a335 feat: wire Supabase auth-based gating for facilitator notes and recordings`)
    - **What it adds:** Direct Supabase Auth gating logic inside `shared/js/cosyevents-session.js` to dynamically show/hide `#facilitator-notes` and `#recording-url`.

12. **`jules-6542562321526012769-5d4098b0`**
    - **Open PR:** PR #24 (*Jules 6542562321526012769 5d4098b0*)
    - **Last Commit Date:** 2026-09-13 22:55:04 +0000
    - **Commits Ahead of Main:** 2 (`edea946`, `a5a1b3d`)
    - **What it adds:** Master link audit reports (`link-audit/`), asset images (`assets/prada-poster.jpg`, `assets/ratatouille-poster.jpg`), and relative URL fixes across static hub pages.

13. **`jules-participant-magic-links-12660084959728913583`**
    - **Open PR:** No open PR
    - **Last Commit Date:** 2026-10-06 09:39:25 +0000
    - **Commits Ahead of Main:** 1 (`8fd0e20 feat: implement participant magic links and session recording sharing`)
    - **What it adds:** SQL migration `supabase/migrations/20261010000000_magic_links.sql` and `docs/MAGIC_LINK_PILOT.md` for participant magic links.

14. **`jules/extract-cosy-design-tokens-5493772850687233379`**
    - **Open PR:** PR #5 (*Extract design tokens into css/cosy-tokens.css and document pinning policy*)
    - **Last Commit Date:** 2026-09-06 10:49:15 +0000
    - **Commits Ahead of Main:** 3 (`3f90daf`, `9adecf8`, `7b8486d`)
    - **What it adds:** Shared design tokens (`css/cosy-tokens.css`), design documentation (`docs/design-tokens.md`), and passport module (`shared/js/passport.js`).

15. **`main-14150879232559639312`**
    - **Open PR:** No open PR
    - **Last Commit Date:** 2026-10-02 09:07:18 +0000
    - **Commits Ahead of Main:** 1 (`eba2a65 Fix invisible session hero titles and wrapping session nav`)
    - **What it adds:** CSS contrast fixes for session hero titles and flex wrapping fixes in `.ce-session-nav`.

16. **`refactor/separate-public-session-content-17285723110419326555`**
    - **Open PR:** PR #49 (*refactor: separate public session content from gated prompts/facilitator notes*)
    - **Last Commit Date:** 2026-09-29 10:36:31 +0000
    - **Commits Ahead of Main:** 2 (`b4366a0`, `b172a6c`)
    - **What it adds:** Python script `scripts/separate_gated_content.py` to extract gated facilitator prompts out of public Markdown files into Supabase database tables.

### Fully Merged / Identical Branches (0 Commits Ahead of Main)

The following 39 branches contain 0 commits ahead of `main` (either fully merged into `main` or created from historical commit points):
`add-access-control-db-design-16441629639332480128`, `add-optional-shared-login-1549687933247419090`, `align-cosyevents-tokens-accent-6029708643960353388`, `batch-2-heavy-components-14969226490440196660`, `cms-sso-hardening-9709473326969595151`, `consolidate-structure-audit-reconciliation-3965281105549673099`, `feat/cosy-events-skeleton-2540620941304485329`, `feat/events-calendar-setup-8311991619788579292`, `feat/events-taxonomy-gating-pipelines-10744791974815811152`, `feat/extend-build-sessions-clubs-11014537925895354326`, `feat/session-pipeline-and-supabase-rls-10718824281827568893`, `feat/supabase-auth-session-gating-15472191564900345003`, `feature/add-basic-speaking-club-a0-a1-2336194347456219909`, `feature/intermediate-club-tariffs-live-ux-12987760628198781339`, `feature/lesson-conversion-schema-and-audit-13539039830286937551`, `feature/multi-language-event-filter-16004967358052984863`, `feature/speaking-clubs-wonder-voiceover-mapping-8618925643649536008`, `fix-broken-links-and-checker-5600013581517273733`, `fix-broken-references-and-check-links-4196544502673673468`, `fix-pages-cms-config-165310828645413664`, `fix/ecosystem-links-and-enhancements-16144056825912345755`, `fix/event-types-catalog-count-714123950641138762`, `fix/unify-host-role-into-teacher-17896464722982721962`, `foundation-setup-1531579449623143439`, `jules-335011175702186856-6638c25b`, `jules-6542562321526012769-5d4098b0-6201657002777475991`, `jules-7402874686834292793-cbbec758`, `jules-8374129651958968084-63c62a6d`, `jules/css-and-visual-cleanup-15162858313370269702`, `jules/gated-session-renderer-1080552803831018565`, `main-12814580768202969515`, `main-16508122855388029283`, `main-651171092425184130`, `main-6580091002308304609`, `migrate-cosylanguages-events-reconciliation-7253627606785249249`, `populate-speaking-clubs-pinned-batches-15844949905235407213`, `read-only-audit-inventory-1156277089854561137`, `security-fixes-profiles-drafts-tests-12983811085263225585`.

---

## 2. Folder Tree (To Depth 3)

Below is the directory tree up to depth 3 with purpose descriptions and file counts (direct files in directory / total files in subtree).

```
. (34 direct files, 1155 total) — COSYevents repository root containing hub pages, config files, and build specs.
├── .github/ (0 direct, 10 total) — GitHub repository configuration and CI workflows.
│   └── workflows/ (10 direct, 10 total) — GitHub Actions CI workflows for link checking, i18n, DB tests, and deployment.
├── admin/ (1 direct, 1 total) — Administrative interface pages for link generation and management.
├── assets/ (4 direct, 6 total) — Shared visual assets and static media resources.
│   ├── css/ (1 direct, 1 total) — Auxiliary CSS stylesheets.
│   └── js/ (1 direct, 1 total) — Auxiliary JavaScript helper scripts.
├── cinema-club/ (1 direct, 1 total) — Cinema Club event category landing page redirect stub.
├── cinema-nights/ (1 direct, 1 total) — Cinema Nights event category hub.
├── data/ (2 direct, 8 total) — Master JSON catalogs and datasets for events and sessions.
│   └── events/ (6 direct, 6 total) — Event collection JSON data files per club category.
├── docs/ (14 direct, 14 total) — Technical documentation, specs, access models, and database migration guides.
├── el/ (1 direct, 1 total) — Greek localized hub landing page.
├── events/ (1 direct, 16 total) — Structured event schemas and per-event JSON data hierarchy.
│   ├── english-a2-foundations/ (1 direct, 3 total) — Structured course event folder.
│   │   └── sessions/ (2 direct, 2 total) — JSON session definitions for English A2 Foundations.
│   ├── multimedia-nights/ (0 direct, 4 total) — Multimedia event collections.
│   │   ├── cinema-club/ (1 direct, 1 total) — Cinema Club event JSON folder.
│   │   ├── game-evening/ (1 direct, 1 total) — Game Evening event JSON folder.
│   │   ├── karaoke-club/ (1 direct, 1 total) — Karaoke Club event JSON folder.
│   │   └── long-reads/ (1 direct, 1 total) — Long Reads event JSON folder.
│   └── speaking-clubs/ (0 direct, 8 total) — Speaking club event collections.
│       ├── debatable-relatable/ (1 direct, 1 total) — Debatable & Relatable event JSON folder.
│       ├── i-couldnt-help-but-wonder/ (1 direct, 1 total) — I Couldn't Help But Wonder event JSON folder.
│       ├── if-you-were/ (1 direct, 1 total) — If You Were event JSON folder.
│       ├── keeping-up-with-science/ (1 direct, 1 total) — Keeping Up with Science event JSON folder.
│       ├── lets-celebrate/ (1 direct, 1 total) — Let's Celebrate event JSON folder.
│       ├── mind-matters/ (1 direct, 1 total) — Mind Matters event JSON folder.
│       ├── my-life-with-without/ (1 direct, 1 total) — My Life With & Without event JSON folder.
│       └── the-greatest-quotes/ (1 direct, 1 total) — The Greatest Quotes event JSON folder.
├── fr/ (4 direct, 48 total) — French localized site root and session pages.
│   └── sessions/ (0 direct, 44 total) — French localized HTML session pages by club.
│       ├── debatable-relatable/ (2 direct, 2 total) — French Debatable & Relatable session pages.
│       ├── i-couldnt-help-but-wonder/ (11 direct, 11 total) — French I Couldn't Help But Wonder session pages.
│       ├── keeping-up-with-science/ (1 direct, 1 total) — French Keeping Up with Science session pages.
│       ├── lets-celebrate/ (5 direct, 5 total) — French Let's Celebrate session pages.
│       ├── mind-matters/ (12 direct, 12 total) — French Mind Matters session pages.
│       └── the-greatest-quotes/ (13 direct, 13 total) — French The Greatest Quotes session pages.
├── game-evening/ (1 direct, 1 total) — Game Evening event category redirect stub.
├── game-evenings/ (1 direct, 1 total) — Game Evenings landing page hub.
├── games/ (1 direct, 1 total) — Client-side redirect page for COSYgames ecosystem hub.
├── images/ (11 direct, 37 total) — Event cover images and media banners.
│   └── wonder/ (26 direct, 26 total) — Cover images for 'I Couldn't Help But Wonder' sessions.
├── it/ (1 direct, 1 total) — Italian localized hub landing page.
├── karaoke-club/ (1 direct, 1 total) — Karaoke Club landing page hub.
├── long-reads/ (1 direct, 1 total) — Long Reads landing page hub.
├── past-events/ (1 direct, 1 total) — Historical past events archive hub.
├── practice/ (1 direct, 1 total) — Client-side redirect page for COSYlanguages practice hub.
├── ru/ (3 direct, 44 total) — Russian localized site root and session pages.
│   └── sessions/ (0 direct, 41 total) — Russian localized HTML session pages by club.
│       ├── debatable-relatable/ (1 direct, 1 total) — Russian Debatable & Relatable session pages.
│       ├── i-couldnt-help-but-wonder/ (22 direct, 22 total) — Russian I Couldn't Help But Wonder session pages.
│       ├── keeping-up-with-science/ (1 direct, 1 total) — Russian Keeping Up with Science session pages.
│       ├── lets-celebrate/ (5 direct, 5 total) — Russian Let's Celebrate session pages.
│       ├── mind-matters/ (2 direct, 2 total) — Russian Mind Matters session pages.
│       └── the-greatest-quotes/ (10 direct, 10 total) — Russian The Greatest Quotes session pages.
├── schedule/ (1 direct, 1 total) — Global upcoming events schedule page.
├── schemas/ (2 direct, 2 total) — JSON Schema definitions for event and session validation.
├── scripts/ (49 direct, 49 total) — Build scripts, link checkers, validation utilities, and archive scripts.
├── sessions/ (0 direct, 724 total) — Canonical Markdown (.md) and HTML session pages grouped by club slug.
│   ├── basic-speaking-club/ (60 direct, 60 total) — Basic Speaking Club (A0-A1) sessions.
│   ├── cinema-club/ (113 direct, 113 total) — Cinema Club sessions.
│   ├── debatable-relatable/ (52 direct, 52 total) — Debatable & Relatable sessions.
│   ├── i-couldnt-help-but-wonder/ (27 direct, 27 total) — I Couldn't Help But Wonder sessions.
│   ├── if-you-were/ (10 direct, 10 total) — If You Were sessions.
│   ├── karaoke-club/ (13 direct, 142 total) — Karaoke Club sessions and multi-language subfolders.
│   │   ├── challenges/ (0 direct, 107 total) — Karaoke challenge exercise files.
│   │   ├── el/ (3 direct, 3 total) — Greek Karaoke sessions.
│   │   ├── es/ (1 direct, 1 total) — Spanish Karaoke sessions.
│   │   ├── fr/ (11 direct, 11 total) — French Karaoke sessions.
│   │   ├── it/ (4 direct, 4 total) — Italian Karaoke sessions.
│   │   └── ru/ (3 direct, 3 total) — Russian Karaoke sessions.
│   ├── keeping-up-with-science/ (57 direct, 57 total) — Keeping Up with Science sessions.
│   ├── lets-celebrate/ (48 direct, 48 total) — Let's Celebrate sessions.
│   ├── long-reads/ (4 direct, 4 total) — Long Reads sessions.
│   ├── mind-matters/ (61 direct, 61 total) — Mind Matters sessions.
│   ├── my-life-with-without/ (38 direct, 38 total) — My Life With & Without sessions.
│   └── the-greatest-quotes/ (112 direct, 112 total) — The Greatest Quotes sessions.
├── shared/ (0 direct, 51 total) — Core shared ecosystem assets, stylesheets, scripts, and i18n configs.
│   ├── assets/ (5 direct, 5 total) — Standard site icons, favicons, and social cards.
│   ├── calendar/ (2 direct, 2 total) — Event calendar rendering engine and i18n engine.
│   ├── calendar-data/ (1 direct, 1 total) — Master calendar events dataset (`events.json`).
│   ├── config/ (3 direct, 3 total) — Shared configuration for contact info and Supabase auth.
│   ├── css/ (6 direct, 18 total) — Global styles and club theme stylesheets.
│   │   └── clubs/ (12 direct, 12 total) — Per-club CSS style overrides.
│   ├── i18n/ (2 direct, 2 total) — Language aliases and localized page manifests.
│   ├── images/ (1 direct, 1 total) — Shared site logos and graphics.
│   ├── js/ (13 direct, 13 total) — Auth, SSO, gate, CMS editor, and session JS engines.
│   ├── materials/ (2 direct, 2 total) — Shared session prompt templates and decks.
│   └── vendor/ (4 direct, 4 total) — Vendor libraries (DOMPurify, Supabase SDK, licenses).
├── speaking-clubs/ (1 direct, 1 total) — Speaking Clubs category hub page.
├── special-events/ (1 direct, 1 total) — Special Events category hub page.
├── styles/ (3 direct, 3 total) — Site layout and calendar CSS files.
├── supabase/ (0 direct, 11 total) — Supabase Edge Functions, SQL migrations, and RLS test suites.
│   ├── functions/ (0 direct, 1 total) — Supabase Edge Functions.
│   │   └── video-meeting-token/ (1 direct, 1 total) — Daily.co video meeting token Edge Function.
│   ├── migrations/ (7 direct, 7 total) — SQL database schema migrations and RLS policies.
│   └── tests/ (3 direct, 3 total) — SQL database test assertions and stubs.
├── teacher-led-sessions/ (1 direct, 1 total) — Teacher-Led Sessions category hub page.
├── templates/ (17 direct, 17 total) — HTML session templates, export schemas, and sample JSON payloads.
├── test-results/ (1 direct, 1 total) — Playwright test execution results log (`.last-run.json`).
├── tests/ (2 direct, 2 total) — End-to-end and unit test spec files for Playwright.
├── topics-archive/ (1 direct, 1 total) — Archive list of historical discussion topics.
├── upcoming/ (1 direct, 1 total) — Client-side redirect stub for global event schedule.
└── verification/ (22 direct, 60 total) — Frontend verification screenshots and visual test artifacts.
    ├── filter-screenshots/ (4 direct, 4 total) — Language filter UI screenshots.
    └── screenshots/ (34 direct, 34 total) — Page layout verification screenshots.
```

---

## 3. Languages and CEFR Levels Covered

Languages are represented using ISO 639-1 language codes (`en`, `fr`, `ru`, `el`, `it`, `es`). CEFR levels cover `A0` through `C2`.

| Content Type / Event Club | ISO Language Codes Covered | CEFR Levels Covered | Total Sessions |
| :--- | :---: | :---: | :---: |
| **Basic Speaking Club** | `en` | A0–A1 | 30 |
| **Cinema Club** | `en` | A2, A2–B1, B1, B2, B2–C1, C1 | 113 |
| **Debatable & Relatable** | `en`, `fr`, `ru` | A2, B1, B1–B2, B2, C1 | 29 |
| **I Couldn't Help But Wonder** | `en`, `fr`, `ru` | B1, B2, B2–C1, C1 | 60 |
| **If You Were** | `en` | B1, B2, C1 | 5 |
| **Karaoke Club** | `en`, `fr`, `ru`, `el`, `it`, `es` | A2, B1, B2, C1 | 142 |
| **Keeping Up with Science** | `en`, `fr`, `ru` | A2, B1, B2, C1 | 59 |
| **Let's Celebrate** | `en`, `fr`, `ru` | A1, A2, B1, B2 | 34 |
| **Long Reads** | `en` | B2 | 4 |
| **Mind Matters** | `en`, `fr`, `ru` | B1, B2, C1, C2 | 71 |
| **My Life With & Without** | `en` | B1, B1–B2, B2, C1 | 19 |
| **The Greatest Quotes** | `en`, `fr`, `ru` | A2, B1, B2, C1 | 79 |
| **English A2 Foundations** | `en` | A2 | 2 |

---

## 4. Publicly Served Paid or Restricted Content

In COSYevents, public session metadata and vocabulary decks are intended to be public, whereas facilitator notes (`#facilitator-notes`), session recordings (`#recording-url`), answer keys, and teacher guides are restricted to authenticated teachers, founders, or enrolled students with active grants.

While client-side JavaScript (`shared/js/cosyevents-session.js`) queries Supabase DB for restricted content at runtime and hides empty placeholders for anonymous users, the following static HTML template files contain embedded restricted/teacher content or placeholders directly in their HTML source code:

1. **`templates/session-template.html`**
   - **Restricted Element:** Static `#facilitator-notes` container with embedded facilitator prompt text and static `#recording-url` link container.
2. **`templates/wonder-private-lesson-template.html`**
   - **Restricted Element:** Teacher notes section ("Teacher Notes") and private lesson structure instructions.
3. **`speaking-clubs.html`**
   - **Restricted Element:** Teacher notes section comment block and facilitator guidelines embedded in landing copy.
4. **`index.html`**
   - **Restricted Element:** Embedded teacher notes comment reference in template preview markup.

*Note on Session Markdown Source Files (`sessions/**/*.md`):* All 645 session Markdown source files in `sessions/` contain public session prompts, vocabulary decks, and discussion decks. Frontmatter fields for `facilitator_notes` and `recording_url` have been stripped from public Markdown files and migrated into private Supabase DB table `public.session_content`.

---

## 5. Content Duplicating or Overlapping Other COSY Repos

Below is an inventory of content that duplicates or overlaps what sibling COSY repositories hold, complete with exact paths and fingerprints (file count and newest commit date).

### 1. Vocabulary & Export Datasets (`COSYdata` Overlap)
- **Paths:**
  - `data/sessions.json` (645 session entries containing full vocabulary arrays)
  - `templates/vocabulary-export.json` (Draft-07 schema for exporting vocabulary into `COSYdata`)
  - `docs/vocabulary-pipeline.md` (Pipeline spec for ingesting `COSYevents` vocabulary into `COSYdata`)
- **Fingerprint:** 3 files | **Newest Commit Date:** 2026-10-07 21:11:04 +0000

### 2. Private Lesson & Course Schemas (`COSYplatform` Overlap)
- **Paths:**
  - `templates/wonder-private-lesson-template.html` (Private 1-on-1 coaching template)
  - `templates/lesson-conversion.json` (Schema for converting live event sessions into `COSYplatform` self-paced course lessons)
  - `docs/session-conversion-spec.md` (Specification for session to course conversion)
  - `events/english-a2-foundations/` (2 course session JSON files)
- **Fingerprint:** 5 files | **Newest Commit Date:** 2026-09-27 17:28:37 +0000

### 3. Grammar & Reference Specs (`COSYtools` Overlap)
- **Paths:**
  - `docs/speaking-clubs-spec.md` (Contains CEFR target grammar rules and verb tense guides per club)
  - `sessions/basic-speaking-club/` (60 sessions containing explicit `target_grammar` rules)
- **Fingerprint:** 61 files | **Newest Commit Date:** 2026-10-07 21:11:04 +0000

### 4. Interactive Games & Redirects (`COSYgames` Overlap)
- **Paths:**
  - `games/index.html` (Client-side redirect to `https://cosylanguages.github.io/COSYgames/`)
  - `sessions/karaoke-club/challenges/` (107 interactive song challenge exercise JSON files)
- **Fingerprint:** 108 files | **Newest Commit Date:** 2026-09-06 10:37:00 +0000

### 5. Teacher Manuals & Guidelines (`COSYmanuals` Overlap)
- **Paths:**
  - `docs/basic-speaking-club-teacher-manual.md` (Teacher manual for basic speaking club)
  - `docs/cinema-content-style-guide.md` (Style guide for cinema moderators)
  - `docs/manuals-migration-plan-1341789491726014192` (Proposal to migrate manuals to `COSYmanuals`)
- **Fingerprint:** 3 files | **Newest Commit Date:** 2026-09-27 17:28:37 +0000

---

## 6. References to COSYworld

`COSYworld` is being discontinued. Below is the audit of `COSYworld` references across the repository:

### Current `main` Branch
- **Result:** **0 references found**. The `main` branch has been completely scrubbed of all `COSYworld` references in code, docs, headers, and comments.

### Unmerged Historical Remote Branches
For historical comparison, `COSYworld` references still exist on unmerged legacy branches:
- **`origin/cosylanguages-ecosystem-alignment-500101437617365072`**:
  - `index.html:24`: Navigation header link to `https://cosylanguages.github.io/COSYworld/`
  - `cinema-nights/index.html:23`: Header link to COSYworld
  - `speaking-clubs/index.html:23`: Header link to COSYworld
- **`origin/feature/lesson-conversion-schema-and-audit-13539039830286937551`**:
  - `teacher-led-sessions/index.html:23`: Header link to COSYworld
  - `templates/event-detail.html:23`: Header link to COSYworld
- **`origin/jules-6542562321526012769-5d4098b0`**:
  - `README.md:60`: Section link `- 🗺️ COSYworld`
  - `link-audit/03-external-link-audit.md:19,30,59`: Audit records for COSYworld link status
  - `shared/css/hub.css:13`: Header comment listing consumer repos
- **`origin/jules/extract-cosy-design-tokens-5493772850687233379`**:
  - `docs/passport-schema.md:42`: List entry for COSYworld
  - `shared/js/passport.js:9`: Array item `'COSYworld'`

---

## 7. Dependencies on Other COSY Repositories

Below is an exhaustive list of code and documentation dependencies on sibling COSY repositories (`COSYlanguages`, `COSYplatform`, `COSYtools`, `COSYgames`, `COSYmanuals`).

### 1. Navigation Strip & Hub Header Links (`COSYlanguages`, `COSYtools`, `COSYgames`)
- **`index.html`**:
  - Line 64: `<a href="https://cosylanguages.github.io/COSYlanguages/" class="cosy-strip-link">COSYlanguages</a>`
  - Line 65: `<a href="https://cosylanguages.github.io/COSYtools/" target="_blank" rel="noopener">COSYtools</a>`
  - Line 66: `<a href="https://cosylanguages.github.io/COSYgames/" target="_blank" rel="noopener">COSYgames</a>`
- **`fr/index.html`**:
  - Lines 64–66: Outbound ecosystem strip links to `COSYlanguages`, `COSYtools`, and `COSYgames`.
- **`ru/index.html`**:
  - Lines 64–66: Outbound ecosystem strip links to `COSYlanguages`, `COSYtools`, and `COSYgames`.
- **`speaking-clubs.html`**, **`cinema-nights.html`**, **`game-evenings.html`**, **`karaoke-club.html`**, **`long-reads.html`**, **`mind-matters.html`**, **`privacy.html`**:
  - Top navigation bar links to `COSYlanguages`, `COSYtools`, and `COSYgames`.

### 2. Client-Side Ecosystem Redirects (`COSYlanguages` & `COSYgames`)
- **`practice/index.html`**:
  - Line 4: `<meta http-equiv="refresh" content="0; url=https://cosylanguages.github.io/COSYlanguages/">`
  - Line 5: `<link rel="canonical" href="https://cosylanguages.github.io/COSYlanguages/">`
  - Line 11: `window.location.replace("https://cosylanguages.github.io/COSYlanguages/");`
- **`games/index.html`**:
  - Line 4: `<meta http-equiv="refresh" content="0; url=https://cosylanguages.github.io/COSYgames/">`
  - Line 5: `<link rel="canonical" href="https://cosylanguages.github.io/COSYgames/">`
  - Line 11: `window.location.replace("https://cosylanguages.github.io/COSYgames/");`

### 3. SSO Cross-Domain Link Interception (`COSY` Ecosystem)
- **`shared/js/auth-sso.js`**:
  - Line 118: Intercepts clicks on `a[href*="COSY"]`, `a[href*="cosylanguages"]`, `a[href*="cosy"]`, `.cosy-strip-link` to append session transfer tokens across subdomains.

### 4. Course & Platform Promotion Links (`COSYplatform`)
- **`templates/celebrate-session-template.html`**:
  - Lines 268–272: `<a href="https://cosylanguages.github.io/COSYplatform/">General Course</a>`, `Spoken Course`, `Exam Prep`, `Travelling`, `Professional`.
- **`templates/science-session-template.html`**:
  - Lines 280–284: Promotional course links to `COSYplatform`.
- **`templates/wonder-private-lesson-template.html`**:
  - Line 195: Links to `COSYplatform` private lesson catalog.

### 5. Documentation References (`COSYmanuals` & `COSYdata`)
- **`past-events/index.html`**:
  - Line 103: `📖 Related COSYmanuals`
- **`docs/vocabulary-pipeline.md`**:
  - Lines 1–48: Pipeline spec describing JSON pickup locations by `COSYdata`.
- **`docs/SUPABASE_SETUP.md`**:
  - Lines 3–15: Specs detailing the shared Supabase backend across `COSYlanguages`, `COSYevents`, and `COSYplatform`.

---

## 8. Dead Weight Inventory

Below is the list of committed test logs, temporary visual verification artifacts, one-off scripts, and generated reports that can be safely pruned in a future cleanup task:

### 1. Visual Verification Artifacts (`verification/`)
- `verification/account-dark.png`
- `verification/account-light.png`
- `verification/account-xss-1366-dark.png`
- `verification/account-xss-1366-light.png`
- `verification/account-xss-390-dark.png`
- `verification/account-xss-390-light.png`
- `verification/chip-dark.png`
- `verification/chip-light.png`
- `verification/chip-menu-dark.png`
- `verification/chip-menu-light.png`
- `verification/fidelity_report.json`
- `verification/homepage_desktop.png`
- `verification/homepage_mobile.png`
- `verification/login-dark.png`
- `verification/login-light.png`
- `verification/nav-closed-desktop.png`
- `verification/nav-closed-mobile.png`
- `verification/nav-open-desktop.png`
- `verification/nav-open-mobile.png`
- `verification/technofeudalism-attention-after.png`
- `verification/technofeudalism-attention-before.png`
- `verification/verify_auth.py`
- `verification/filter-screenshots/filter-bar-fresh-desktop.png`
- `verification/filter-screenshots/filter-bar-fresh-mobile.png`
- `verification/filter-screenshots/filter-bar-mylangs-desktop.png`
- `verification/filter-screenshots/filter-bar-mylangs-mobile.png`
- `verification/screenshots/` (34 PNG layout screenshots)

### 2. Test Execution & Output Logs
- `test-results/.last-run.json`

### 3. Archived & One-Off Scripts (`scripts/archive/`)
- `scripts/archive/MANIFEST.txt`
- `scripts/archive/README.md`
- `scripts/archive/check_cross_repo_links.js`
- `scripts/archive/generate_a0_a1_sessions.js`
- `scripts/archive/generate_basic_speaking_club_sessions.js`
- `scripts/archive/update_basic_speaking_club_page.js`
- `scripts/archive/update_master_metadata.js`
- `scripts/archive/update_sessions_catalog.js`
- `scripts/archive/update_speaking_clubs_json.js`

---

## 9. Deployment Architecture and Access Control

### Deployment Mechanism
- **Hosting Provider:** GitHub Pages (`https://cosylanguages.github.io/COSYevents/`)
- **Static Site Generator / Build Pipeline:**
  - Static HTML, CSS, JavaScript, and JSON assets served directly from the `main` branch root.
  - A `.nojekyll` file at root prevents GitHub Pages from running Jekyll transformations.
  - Build scripts (`scripts/build-sessions.js` and `scripts/build_localized_manifest.js`) convert Markdown source files in `sessions/` into static HTML session pages and update `data/sessions.json` and `shared/i18n/localized-pages.json`.
- **Backend Infrastructure:**
  - Supabase PostgreSQL Database & Storage shared across the COSY ecosystem (`shared/config/supabase.json`).
  - Edge Functions (`supabase/functions/video-meeting-token`) generate Daily.co video room tokens for authenticated live sessions.

### Access Control & Security Model
All security enforcement relies on PostgreSQL **Row Level Security (RLS)** and Supabase Authentication (`shared/js/cosy-auth.js`):

1. **Authentication:**
   - Single Sign-On (SSO) and PKCE flow via Supabase Auth (`shared/js/auth-sso.js`).
   - Sessions are shared across ecosystem origins via `localStorage` key `'cosy-auth'`.
2. **User Roles (`public.profiles.role`):**
   - **`student`**: Default role. Access to public session catalog and public materials. Restricted materials require explicit access grants in `access_grants` or `session_grants`.
   - **`teacher`**: Assigned to specific languages in `teacher_languages`. Full read access to restricted notes and audio for assigned languages.
   - **`founder`**: Administrative role (`is_founder()`). Read and write access across all tables, page overrides (`cms_page_overrides`), and storage buckets.
3. **Restricted Content Gating:**
   - Facilitator notes (`#facilitator-notes`) and session recordings (`#recording-url`) are stored in `public.session_content` protected by RLS.
   - Anonymous/unauthorized users see public discussion decks and vocabulary, while restricted sections remain hidden or display access prompts.
4. **Participant Magic Links:**
   - Tokenized URLs allow event participants temporary access to specific session materials without full user sign-in (`supabase/migrations/20261010000000_magic_links.sql`).
   - Hashes are verified via `redeem_session_access_link` SECURITY DEFINER SQL function, ensuring secret tokens are never stored in plain text.
