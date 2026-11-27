# COSYevents 🎭 Calendar & Event Hub

**COSYevents** is the public calendar, event directory, and complete session-material repository for the **COSYlanguages** ecosystem. It hosts speaking-club prompt decks, cinema immersion guides, karaoke and long-read material, multimedia nights, and event archives.

## Source of truth: this repository

**All session materials belong in GitHub. Supabase is not used to store, publish, or serve sessions.**

- Full session content is version-controlled in this repository, including activities, instructions, prompts, vocabulary, and supporting materials.
- The repository is the canonical source of truth. Changes should be reviewed and committed here.
- `public-events.json` is a generated, lightweight discovery index for the calendar and event listings. It is not the authoritative store for session content.
- Website pages and tools should load session materials from repository-hosted files or the deployed static site, not from Supabase session tables or a database publishing pipeline.
- Do not put credentials, personal data, or content that is not authorized for public distribution in this public repository. Treat all committed files and Git history as public.

## Repository structure

```text
COSYevents/
├── *.html                            # Event pages: one hub per club/format
│                                     #   (cinema-club, karaoke-club, mind-matters, …)
├── index.html                        # Main landing page
├── fr/ it/ ru/ el/                   # Localized hub pages
├── events/
│   ├── index.html                    # Events portal
│   └── <event-slug>/
│       ├── event.json                # Event definition and metadata
│       └── sessions/
│           └── <session-slug>.json   # Complete session content
├── sessions/                         # Session pages, one folder per club,
│                                     #   with per-language subfolders
├── data/                             # Hand-maintained and generated datasets
│                                     #   (sessions.json, club-reviews.json, …)
├── shared/                           # Everything shared: css/, js/, images/,
│                                     #   assets/, i18n/, audio/ — the only
│                                     #   folder a page may reach outside its own
├── schemas/                          # JSON Schemas for validation
├── supabase/                         # Migrations and DB tests
├── scripts/                          # Build, check, test and ops tooling
├── docs/                             # Specifications, guides and their index
├── reports/                          # Audit write-ups and findings
├── public-events.json                # Generated event/session discovery index
└── package.json                      # NPM scripts and dependencies
```

Some old paths survive as redirect stubs — see [Legacy URLs and redirect stubs](#legacy-urls-and-redirect-stubs). Tooling is indexed in [`scripts/README.md`](scripts/README.md) and specifications in [`docs/README.md`](docs/README.md).

## Add an event or session

### 1. Add an event

Create `events/<event-slug>/event.json` matching `schemas/event.schema.json`. The `slug` must match the directory name and `status` must be `upcoming`, `current`, or `past`.

Example:

```json
{
  "slug": "english-a2-foundations",
  "title": "English A2 Foundations",
  "description": "Interactive everyday English conversation practice.",
  "languages": ["English"],
  "status": "current"
}
```

### 2. Add the full session

Create `events/<event-slug>/sessions/<session-slug>.json` matching `schemas/session.schema.json`. Commit the complete material, not just a title or pointer to a database record.

If you have an existing session export JSON, you can create the repository JSON and a static page with:

```bash
npm run session:new -- private/session-exports/<session-export>.json --event <event-slug> --club <club-slug> --lang English
```

The event must already exist under `events/<event-slug>/event.json`. The command writes the full session JSON, a static page, updates `data/sessions.json`, and rebuilds `public-events.json`. Review all generated files before committing; they will be public.

Example:

```json
{
  "slug": "daily-routines-and-habits",
  "event": "english-a2-foundations",
  "title": "Daily Routines and Habits",
  "theme": "Everyday Life",
  "language": "English",
  "level": "A2",
  "date": "2025-05-10",
  "activities": [
    {
      "type": "icebreaker",
      "title": "Morning Routine Check-in",
      "instructions": "Describe three things you do every morning."
    }
  ],
  "vocabulary": [
    {
      "word": "commute",
      "definition": "The regular journey to and from work or school.",
      "example": "My daily commute takes 30 minutes.",
      "level": "A2"
    }
  ]
}
```

The `slug` must match the filename without its extension, `event` must reference an existing event slug, and CEFR levels must be one of `A1`, `A2`, `B1`, `B2`, `C1`, or `C2`.

## Local validation

Validate schemas and slugs:

```bash
npm run validate
```

Regenerate the calendar discovery index:

```bash
npm run build-public
```

Run the repository's tests:

```bash
npm test
```

The generated index is only for discovery. Full session content remains in the repository and should be available through repository-hosted session files. Session publishing and retrieval must not depend on Supabase.

## Daily spotlights

`index.html` shows the daily spotlights (holiday of the day, today in science, today in music, today
in film & TV). This repository owns those spotlights; the other daily elements live where they belong
and the page links out to them.

| Element | Owner |
|---|---|
| Cultural spotlights (holiday, science, music, film & TV) | COSYevents (`shared/js/daily-spotlights.js`, date-keyed spotlight data) |
| Word, verb, verb + preposition, phrasal verb and idiom of the day | [COSYdata](https://github.com/cosylanguages/COSYdata) |
| Speaking and writing prompts, Daily Challenge | [COSYpractice](https://github.com/cosylanguages/COSYpractice) |
| Fun fact and the hub daily strip | [COSYlanguages](https://github.com/cosylanguages/COSYlanguages) |

`scripts/fetch_daily_spotlights.js` (run by the `daily-spotlights` workflow) rotates the spotlight
data daily. Its translations are machine-generated; `data/spotlight-overrides.json` holds curated
replacements that win over the machine output. Key by ISO date (or `month-day`), then category,
language and the fields to replace:

```json
{
  "2026-11-24": {
    "science": {
      "fr": { "title": "Le premier brevet…", "description": "Une phrase complète et vérifiée." }
    }
  }
}
```

As on the COSYlanguages hub strip, the main page ends the daily container with a compact
"🌐 Daily across the COSY ecosystem" line of chips linking to the other daily surfaces. It comes from
the shared directory component mounted from COSYlanguages; COSYevents only marks its own card as
"You are here". The main page opts in by putting `data-directory="true"` on the mount:

```html
<div id="daily-spotlights-root" data-directory="true"></div>
```

The line appears on `index.html` only; the localized hub pages (`fr/`, `it/`, `ru/`, `el/`) render
the spotlights without it.

## Club reviews

Learner reviews of the speaking clubs live in `data/club-reviews.json` and render through
`shared/js/club-reviews.js` + `shared/css/club-reviews.css`. As on COSYlanguages, they show in a
single carousel on the main `index.html`. Reviews are written by hand; the share button opens a
public Google Form. See [docs/club-reviews.md](docs/club-reviews.md) to add one.

## Legacy URLs and redirect stubs

GitHub Pages cannot serve 301s, so pages that moved keep a small client-side redirect stub at their
old path — for example `cinema-club/index.html` redirects to `cinema-club.html`, and
`events/speaking-clubs/<club>/index.html` redirects to `../../../<club>.html`. These stubs look
unused from inside the repo, because their job is to catch links arriving from outside it. Do not
delete one just because nothing internal points at it.

`npm run check-redirects` verifies that every stub's target still resolves and that the inventory
matches `data/redirect-stubs.json`. After intentionally adding or retiring a stub, refresh the
baseline with:

```bash
npm run check-redirects -- --update
```

## COSYlanguages ecosystem

- [COSYlanguages](https://cosylanguages.github.io/COSYlanguages/) — Main portal and core curriculum.
- [COSYplatform](https://cosylanguages.github.io/COSYplatform/) — Speaking-club sessions and structured lessons.
- [COSYtools](https://cosylanguages.github.io/COSYtools/) — Offline reference engines.
- [COSYgames](https://cosylanguages.github.io/COSYgames/) — Interactive language-learning games.
