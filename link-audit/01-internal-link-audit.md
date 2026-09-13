# COSYevents Internal Link & Language/Level Consistency Audit

**Audit Date:** September 2025
**Audit Scope:** Comprehensive link resolution audit across all hub/index/landing pages, detection of orphan content pages, and analysis of language (English, French, Italian, Russian, Greek) and CEFR level (A1–C2) consistency.

---

## 1. Broken Internal Links on Hub, Index, and Parent Pages

Below is the complete list of every broken internal link found across all top-level portals, format catalogs, localized hubs, and category landing pages. A link is flagged as broken if its relative `href` path fails to resolve to an existing file in the repository.

### 1.1 `browse.html` (Global Search & Browse Catalog)
* **Href:** `../practice/index.html` → **Resolved Target:** `../practice/index.html` (File missing)
* **Href:** `../games/index.html` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../privacy.html` → **Resolved Target:** `../privacy.html` (File missing)
* **Href:** `../index.html` → **Resolved Target:** `../index.html` (File missing)

### 1.2 `cinema-club.html` (Cinema Club Primary Catalog)
* **Href:** `../practice/index.html` → **Resolved Target:** `../practice/index.html` (File missing)
* **Href:** `../events/index.html` → **Resolved Target:** `../events/index.html` (File missing)
* **Href:** `../games/index.html` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../privacy.html` → **Resolved Target:** `../privacy.html` (File missing)

### 1.3 `debatable-relatable.html` (Topic Catalog)
* **Href:** `../../../../events/speaking-clubs.html` → **Resolved Target:** `../../../../events/speaking-clubs.html` (File missing)
* **Href:** `../../../../games/index.html?game=opinion` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

### 1.4 `fr/index.html` (French Language Hub)
* **Href:** `../../apps/premium-events/manifest.json` → **Resolved Target:** `../apps/premium-events/manifest.json` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/fr/sessions/i-couldnt-help-but-wonder/does-inclusive-language-make-us-equal.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/fr/sessions/i-couldnt-help-but-wonder/does-inclusive-language-make-us-equal.html` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/sessions/i-couldnt-help-but-wonder/why-do-i-spend-more-when-i-earn-more.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/sessions/i-couldnt-help-but-wonder/why-do-i-spend-more-when-i-earn-more.html` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/fr/sessions/i-couldnt-help-but-wonder/i-have-no-time-for-it.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/fr/sessions/i-couldnt-help-but-wonder/i-have-no-time-for-it.html` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/fr/sessions/i-couldnt-help-but-wonder/collective-guilt-global-crisis.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/fr/sessions/i-couldnt-help-but-wonder/collective-guilt-global-crisis.html` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/fr/sessions/i-couldnt-help-but-wonder/are-traditions-hidden-monogamy.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/fr/sessions/i-couldnt-help-but-wonder/are-traditions-hidden-monogamy.html` (File missing)
* **Href:** `../../apps/premium-events/nights/karaoke/karaoke-club.html` → **Resolved Target:** `../apps/premium-events/nights/karaoke/karaoke-club.html` (File missing)
* **Href:** `../../practice/index.html` → **Resolved Target:** `../practice/index.html` (File missing)
* **Href:** `../../events/index.html` → **Resolved Target:** `../events/index.html` (File missing)
* **Href:** `../../games/index.html` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../../privacy.html` → **Resolved Target:** `../privacy.html` (File missing)

### 1.5 `game-evenings.html` (Game Evenings Catalog)
* **Href:** `../games/index.html?game=action` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../games/index.html?game=battle` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../games/index.html?game=identity` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../games/index.html?game=storychain` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../games/index.html?game=wordlinker` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../games/index.html?game=bingo` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../index.html` → **Resolved Target:** `../index.html` (File missing)
* **Href:** `../practice/index.html` → **Resolved Target:** `../practice/index.html` (File missing)
* **Href:** `../games/index.html` → **Resolved Target:** `../games/index.html` (File missing)

### 1.6 `i-couldnt-help-but-wonder.html` (Topic Catalog)
* **Href:** `../../../../events/speaking-clubs.html` → **Resolved Target:** `../../../../events/speaking-clubs.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

### 1.7 `if-you-were.html` (Topic Catalog)
* **Href:** `../../../../events/speaking-clubs.html` → **Resolved Target:** `../../../../events/speaking-clubs.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

### 1.8 `karaoke-club.html` (Karaoke Primary Catalog)
* **Href:** `../../../../events/index.html` → **Resolved Target:** `../../../../events/index.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

### 1.9 `keeping-up-with-science.html` (Topic Catalog)
* **Href:** `../../../../events/speaking-clubs.html` → **Resolved Target:** `../../../../events/speaking-clubs.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

### 1.10 `lets-celebrate.html` (Topic Catalog)
* **Href:** `../../../../events/speaking-clubs.html` → **Resolved Target:** `../../../../events/speaking-clubs.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

### 1.11 `long-reads.html` (Long Reads Primary Catalog)
* **Href:** `../../../../events/speaking-clubs.html` → **Resolved Target:** `../../../../events/speaking-clubs.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

### 1.12 `mind-matters.html` (Topic Catalog)
* **Href:** `../../../../events/speaking-clubs.html` → **Resolved Target:** `../../../../events/speaking-clubs.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

### 1.13 `my-life-with-without.html` (Topic Catalog)
* **Href:** `../../../../events/speaking-clubs.html` → **Resolved Target:** `../../../../events/speaking-clubs.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

### 1.14 `ru/index.html` (Russian Language Hub)
* **Href:** `../../apps/premium-events/manifest.json` → **Resolved Target:** `../apps/premium-events/manifest.json` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/does-inclusive-language-make-us-equal.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/does-inclusive-language-make-us-equal.html` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/why-do-i-spend-more-when-i-earn-more.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/why-do-i-spend-more-when-i-earn-more.html` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/i-have-no-time-for-it.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/i-have-no-time-for-it.html` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/collective-guilt-global-crisis.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/collective-guilt-global-crisis.html` (File missing)
* **Href:** `../../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/are-traditions-hidden-monogamy.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/ru/sessions/i-couldnt-help-but-wonder/are-traditions-hidden-monogamy.html` (File missing)
* **Href:** `../../apps/premium-events/nights/karaoke/karaoke-club.html` → **Resolved Target:** `../apps/premium-events/nights/karaoke/karaoke-club.html` (File missing)
* **Href:** `../../practice/index.html` → **Resolved Target:** `../practice/index.html` (File missing)
* **Href:** `../../events/index.html` → **Resolved Target:** `../events/index.html` (File missing)
* **Href:** `../../games/index.html` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../../privacy.html` → **Resolved Target:** `../privacy.html` (File missing)

### 1.15 `speaking-clubs.html` (Speaking Clubs Primary Catalog)
* **Href:** `../apps/premium-events/manifest.json` → **Resolved Target:** `../apps/premium-events/manifest.json` (File missing)
* **Href:** `../apps/premium-events/clubs/kus/keeping-up-with-science.html` → **Resolved Target:** `../apps/premium-events/clubs/kus/keeping-up-with-science.html` (File missing)
* **Href:** `../apps/premium-events/clubs/celebrate/lets-celebrate.html` → **Resolved Target:** `../apps/premium-events/clubs/celebrate/lets-celebrate.html` (File missing)
* **Href:** `../apps/premium-events/clubs/quotes/the-greatest-quotes.html` → **Resolved Target:** `../apps/premium-events/clubs/quotes/the-greatest-quotes.html` (File missing)
* **Href:** `../apps/premium-events/clubs/life/my-life-with-without.html` → **Resolved Target:** `../apps/premium-events/clubs/life/my-life-with-without.html` (File missing)
* **Href:** `../apps/premium-events/clubs/debate/debatable-relatable.html` → **Resolved Target:** `../apps/premium-events/clubs/debate/debatable-relatable.html` (File missing)
* **Href:** `../apps/premium-events/clubs/wonder/i-couldnt-help-but-wonder.html` → **Resolved Target:** `../apps/premium-events/clubs/wonder/i-couldnt-help-but-wonder.html` (File missing)
* **Href:** `../apps/premium-events/clubs/if-you-were/if-you-were.html` → **Resolved Target:** `../apps/premium-events/clubs/if-you-were/if-you-were.html` (File missing)
* **Href:** `../apps/premium-events/nights/long-reads/long-reads.html` → **Resolved Target:** `../apps/premium-events/nights/long-reads/long-reads.html` (File missing)
* **Href:** `../practice/index.html` → **Resolved Target:** `../practice/index.html` (File missing)
* **Href:** `../events/index.html` → **Resolved Target:** `../events/index.html` (File missing)
* **Href:** `../games/index.html` → **Resolved Target:** `../games/index.html` (File missing)
* **Href:** `../privacy.html` → **Resolved Target:** `../privacy.html` (File missing)

### 1.16 `the-greatest-quotes.html` (Topic Catalog)
* **Href:** `../../../../events/speaking-clubs.html` → **Resolved Target:** `../../../../events/speaking-clubs.html` (File missing)
* **Href:** `../../../../games/index.html?game=critic` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../practice/index.html` → **Resolved Target:** `../../../../practice/index.html` (File missing)
* **Href:** `../../../../games/index.html` → **Resolved Target:** `../../../../games/index.html` (File missing)
* **Href:** `../../../../privacy.html` → **Resolved Target:** `../../../../privacy.html` (File missing)

---

## 2. Orphan Session Pages (Unlinked Content Pages)

The following 3 session HTML template files exist on disk within the repository but are **not linked from any parent, hub, or catalog page**:

1. `sessions/lets-celebrate/template-celebrate.html`
2. `sessions/mind-matters/template-mind.html`
3. `sessions/the-greatest-quotes/template-quotes.html`

*(Note: These 3 files serve as boilerplate HTML templates for session creators and are intentionally unlinked from student-facing catalogs.)*

---

## 3. Language & CEFR Level (A1–C2) Inconsistencies

An audit of sessions across all 5 target languages (English, French, Italian, Russian, Greek) and CEFR levels (A1–C2) revealed major coverage and linkage discrepancies:

### 3.1 Content & Catalog Discrepancies by Language

| Language | Master Catalog Sessions (`data/sessions.json`) | Calendar Event Schedule (`shared/calendar-data/events.json`) | Language Hub (`<lang>/index.html`) | Audit Status & Inconsistencies |
| :--- | :---: | :---: | :---: | :--- |
| **English** | 532 sessions | 5 events | N/A (Root level) | **Dominant.** 370 sessions lack explicit CEFR level tags in `sessions.json`. |
| **French** | 44 sessions | 2 events | `fr/index.html` | **Partial.** 44 sessions present on disk & linked on `fr/speaking-clubs.html` & `fr/mind-matters.html`. |
| **Russian** | 41 sessions | 1 event | `ru/index.html` | **Partial.** 41 sessions present on disk & linked on `ru/speaking-clubs.html` & `ru/mind-matters.html`. 35 entries lack CEFR level tags. |
| **Italian** | **0 sessions** | 2 events | **Missing** | **CRITICAL INCONSISTENCY.** Calendar schedules Italian sessions (`evt-2025-002` B1, `evt-2025-009` A2), but **0 Italian session HTML pages exist on disk** and no `it/` language hub exists. |
| **Greek** | **0 sessions** | 2 events | **Missing** | **CRITICAL INCONSISTENCY.** Calendar schedules Greek sessions (`evt-2025-004` B1, `evt-2025-010` B2), but **0 Greek session HTML pages exist on disk** and no `el/` language hub exists. |

### 3.2 CEFR Level Inconsistencies by Language

1. **Missing CEFR Subdirectory Taxonomies:**
   - No `<event-type>/<language>/<level>/` folder hierarchies exist on disk for any level (A1, A2, B1, B2, C1, C2).
2. **Unlevelled Master Catalog Entries:**
   - **370 English entries** in `data/sessions.json` have empty `level: ""` metadata.
   - **35 Russian entries** in `data/sessions.json` have empty `level: ""` metadata.
3. **Level Gaps Across Languages:**
   - **English:** Covers A2 (22), B1 (135), B2 (1), C1 (4). Missing explicit A1 & C2 session tagging.
   - **French:** Covers A1 (2), B1 (27), B2 (6), C1 (9). Missing A2 & C2 session content.
   - **Russian:** Covers A2 (1), B1 (5). Missing A1, B2, C1, C2 session content.
   - **Italian & Greek:** Completely missing session pages across all CEFR levels (A1, A2, B1, B2, C1, C2).
