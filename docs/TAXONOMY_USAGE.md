# COSYevents Taxonomy Usage & Alignment Specification

This document details every location in the **COSYevents** repository where taxonomy values (language codes, CEFR level codes, course/track/event IDs, theme/topic IDs, folder names, and URLs) are defined or hardcoded.

It compares all local usages against the canonical upstream specifications in **COSYplatform** (`data/taxonomy.json`) and **COSYdata** (`schemas/themes.json`).

---

## Executive Summary of Upstream Taxonomy Authority

1. **Course Roadmaps & Track Taxonomy (`COSYplatform/data/taxonomy.json`):**
   - **Core Course Types:** `general`, `spoken`, `professional`, `travelling` (canonical spelling; alias `travel`), `relocation`, `exam`.
   - **Extra / Event Types (COSYevents):** `cinema`, `karaoke`, `discussion`, `pronunciation`.
   - **CEFR Level Standards:** Lowercase codes `a0`, `a1`, `a2`, `b1`, `b2`, `c1`, `c2`.
   - **Language Standards:** ISO 639-1 2-letter codes (`en`, `fr`, `ru`, `es`, `de`, `it`, `pt`, `el`, `hy`, `ka`, `tt`, `ba`, `br`).
2. **Vocabulary Themes Taxonomy (`COSYdata/schemas/themes.json`):**
   - 50 primary themes (e.g. `actions`, `activities`, `arts`, `business`, `education`, `emotions`, `housing`, `media`, `philosophy`, `science`, `society`, `technology`, `travel`, `work`).

---

## 1. File-by-File Taxonomy Usages & Mismatches

### 1.1 Data Files

#### `data/sessions.json`
- **Path:** `data/sessions.json`
- **Values Used:**
  - `lang`: `"English"`, `"French"`, `"Russian"`, `"Spanish"`, `"Italian"`, `"Greek"` (full string names).
  - `level`: Uppercase codes (`"A0"`, `"A1"`, `"A2"`, `"B1"`, `"B2"`, `"C1"`, `"C2"`) and composite range strings (`"A0-A1"`, `"B1-B2"`).
  - `club`: `"Debatable & Relatable"`, `"Mind Matters"`, `"Keeping Up with Science"`, `"The Greatest Quotes"`, `"Let's Celebrate"`, `"My Life With & Without"`, `"If You Were"`, `"I Couldn't Help But Wonder"`, `"Basic Speaking Club"`, `"Cinema Club"`, `"Karaoke Club"`.
  - `format`: `"Speaking Club"`, `"Cinema Club"`, `"Karaoke Night"`, `"Game Evening"`, `"Long Reads"`.
- **Mismatches & Required Aliases:**
  - **Language:** Convert full names (`"English"`, `"French"`) to ISO 639-1 codes (`"en"`, `"fr"`, `"ru"`, `"es"`, `"it"`, `"el"`).
  - **Level:** Uppercase -> Lowercase (`"A1"` -> `"a1"`). Composite `"A0-A1"` needs expansion or primary mapping (`"a0"` / `"a1"`).
  - **Format/Club:** Map `"Cinema Club"` -> `cinema`, `"Karaoke Night"` -> `karaoke`, `"Speaking Club"` -> `discussion`.

#### `data/events/speaking-clubs.json`
- **Path:** `data/events/speaking-clubs.json`
- **Values Used:**
  - Club IDs: `basic-speaking-club`, `debatable-and-relatable`, `i-couldnt-help-but-wonder`, `if-you-were`, `keeping-up-with-science`, `lets-celebrate`, `mind-matters`, `my-life-with-without`, `the-greatest-quotes`.
  - `level_range`: `"A0–A1"`, `"A1–A2"`, `"B1–B2"`, `"B2–C1"`.
  - Flag Emojis: `🇬🇧`, `🇫🇷`, `🇷🇺`, `🇪🇸`, `🇮🇹`, `🇬🇷`.
- **Mismatches & Required Aliases:**
  - **ID Mismatch:** `debatable-and-relatable` (JSON ID) vs `debatable-relatable` (folder name under `sessions/`).
  - **Flag Emojis:** Map `🇬🇧` -> `en`, `🇫🇷` -> `fr`, `🇷🇺` -> `ru`, `🇪🇸` -> `es`, `🇮🇹` -> `it`, `🇬🇷` -> `el`.

#### `data/events/cinema-club.json`, `karaoke-club.json`, `long-reads.json`, `game-evenings.json`
- **Paths:** `data/events/*.json`
- **Values Used:**
  - IDs: `cinema-club`, `karaoke-club`, `long-reads`, `game-evenings`.
  - Levels: `"A1"`, `"A2"`, `"B1"`, `"B2"`, `"C1"`, `"C2"`.
- **Mismatches & Required Aliases:**
  - Map `cinema-club` -> `cinema`, `karaoke-club` -> `karaoke`, `long-reads` / `game-evenings` -> event sub-types.

#### `shared/calendar-data/events.json`
- **Path:** `shared/calendar-data/events.json`
- **Values Used:**
  - `language`: ISO codes (`"en"`, `"fr"`, `"ru"`, `"es"`, `"it"`, `"el"`).
  - `level`: Uppercase level codes (`"A0"`, `"A1"`, `"A2"`, `"B1"`, `"B2"`, `"C1"`, `"C2"`) and range strings (`"A0-A1"`, `"B1-B2"`).
  - `category`: `"speaking-club"`, `"cinema-club"`, `"karaoke-club"`, `"game-evening"`, `"long-reads"`.
- **Mismatches & Required Aliases:**
  - Level uppercase -> lowercase.
  - Category mapping to `COSYplatform` `courseTypes`.

---

### 1.2 JSON Schemas

#### `schemas/event.schema.json` & `schemas/session.schema.json`
- **Paths:** `schemas/event.schema.json`, `schemas/session.schema.json`
- **Values Used:**
  - `language` enum: `["en", "fr", "ru", "es", "el", "it"]`.
  - `level` enum: `["A0", "A1", "A2", "B1", "B2", "C1", "C2"]` and range pattern `^[A-C][0-2](-[A-C][0-2])?$`.
  - `eventType` enum: `["speaking-club", "cinema-club", "karaoke-club", "game-evening", "long-reads"]`.
- **Mismatches & Required Aliases:**
  - Uppercase level enum values vs COSYplatform lowercase standard.

---

### 1.3 JavaScript Constants & Functions

#### `shared/calendar/calendar.js` & `shared/calendar/calendar-i18n.js`
- **Paths:** `shared/calendar/calendar.js`, `shared/calendar/calendar-i18n.js`
- **Values Used:**
  - Filter constants: `ALL_LANGUAGES = ['en', 'fr', 'ru', 'es', 'it', 'el']`.
  - Filter levels: `ALL_LEVELS = ['all', 'beginner', 'intermediate', 'advanced']`.
  - Language labels mapping: `{ en: "English", fr: "Français", ru: "Русский", es: "Español", it: "Italiano", el: "Ελληνικά" }`.
- **Mismatches & Required Aliases:**
  - UI filter level aliases:
    - `beginner` -> `a0` / `a1`
    - `intermediate` -> `b1` / `b2`
    - `advanced` -> `c1` / `c2`

#### `scripts/build-sessions.js`
- **Path:** `scripts/build-sessions.js`
- **Values Used:**
  - `CLUB_CONFIGS` keys: `'mind-matters'`, `'the-greatest-quotes'`, `'debatable-relatable'`, `'lets-celebrate'`, `'my-life-with-without'`, `'if-you-were'`.
  - Collection names: `mind_matters_sessions`, `the_greatest_quotes_sessions`, `debatable_relatable_sessions`, `lets_celebrate_sessions`, `my_life_with_without_sessions`, `if_you_were_sessions`.
  - `speakingClubsId` mapping: `'debatable-and-relatable'` (mapped to folder `debatable-relatable`).
- **Mismatches & Required Aliases:**
  - Mismatch between `debatable-and-relatable` (speakingClubsId) and `debatable-relatable` (folder name).

#### `scripts/convert_session.py`
- **Path:** `scripts/convert_session.py`
- **Values Used:**
  - Form enum: `["noun", "verb", "adjective", "adverb", "phrase", "expression", "idiom"]`.
  - COSYdata ID format generator: `f"{language}:{slugify(term)}:{form}"`.
  - COSYplatform schema ref: `https://cosylanguages.github.io/COSYplatform/schemas/lesson.schema.json`.
- **Mismatches & Required Aliases:**
  - Fully aligned with COSYdata ID scheme `<lang>:<slug>:<form>`.

---

### 1.4 HTML Filters, Links & URLs

#### `index.html` & `speaking-clubs.html`
- **Paths:** `index.html`, `speaking-clubs.html`
- **Values Used:**
  - Language filter options: `<option value="all">`, `<option value="en">`, `<option value="fr">`, `<option value="ru">`, `<option value="es">`, `<option value="it">`, `<option value="el">`.
  - Level filter options: `<option value="all">`, `<option value="beginner">`, `<option value="intermediate">`, `<option value="advanced">`.
  - Footer Premium Course URLs:
    - `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/general/`
    - `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/spoken/`
    - `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/exam/`
    - `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/travelling/`
    - `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/professional/`
    - `https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/relocation/`
- **Mismatches & Required Aliases:**
  - `travelling` URL uses canonical spelling matching COSYplatform `travelling` course ID. COSYdata `travel` theme serves as vocabulary theme alias.

---

### 1.5 Directory Structure, Filenames & Markdown Sources

#### Session Directories & Markdown Files
- **Paths:** `sessions/<club_id>/<slug>.html`, `sessions/<club_id>/<slug>.md`
- **Values Used:**
  - Folder Slugs: `basic-speaking-club`, `cinema-club`, `debatable-relatable`, `i-couldnt-help-but-wonder`, `if-you-were`, `karaoke-club`, `keeping-up-with-science`, `lets-celebrate`, `long-reads`, `mind-matters`, `my-life-with-without`, `the-greatest-quotes`.
  - Filename Level Suffixes:
    - `-elementary.md` / `-elementary.html` (e.g. `inside-the-backrooms-elementary.html`)
    - `-intermediate.md` / `-intermediate.html` (e.g. `free-guy-intermediate.html`)
    - `-upper-intermediate.md` / `-upper-intermediate.html` (e.g. `beautiful-thing-upper-intermediate.html`)
    - `-advanced.md` / `-advanced.html` (e.g. `brain-cells-motivation-advanced.html`)
- **Mismatches & Required Aliases:**
  - Descriptive level suffixes must be mapped to standard CEFR level codes:
    - `-elementary` -> `a1`
    - `-intermediate` -> `b1`
    - `-upper-intermediate` -> `b2`
    - `-advanced` -> `c1`

---

## 2. Summary Table of Taxonomy Aliases & Renames

| Category | Local Value in COSYevents | Canonical Upstream Standard | Action / Alias Required |
| :--- | :--- | :--- | :--- |
| **Language String** | `"English"`, `"French"`, `"Russian"` | `"en"`, `"fr"`, `"ru"` | Normalize to 2-letter ISO 639-1 code |
| **Flag Emojis** | `🇬🇧`, `🇫🇷`, `🇷🇺`, `🇪🇸`, `🇮🇹`, `🇬🇷` | `en`, `fr`, `ru`, `es`, `it`, `el` | Map flags to ISO language codes |
| **CEFR Case** | `"A1"`, `"B2"`, `"C1"` | `"a1"`, `"b2"`, `"c1"` | Lowercase normalization |
| **Descriptive Levels** | `elementary`, `intermediate`, `advanced` | `a1`, `b1`/`b2`, `c1` | Map descriptive words to CEFR codes |
| **Composite Levels** | `A0-A1`, `B1-B2` | `a0`, `a1`, `b1`, `b2` | Map composite ranges to individual CEFR levels |
| **Course Spelling** | `travel` (COSYdata) | `travelling` (COSYplatform) | Treat `travel` as vocabulary theme alias for `travelling` |
| **Club ID Mismatch** | `debatable-and-relatable` | `debatable-relatable` | Normalize ID to `debatable-relatable` |
| **Event Type IDs** | `cinema-club`, `karaoke-club`, `speaking-clubs` | `cinema`, `karaoke`, `discussion` | Map event titles to canonical course type IDs |
