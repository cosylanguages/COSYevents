# COSYevents 🎭 Calendar & Event Hub

**COSYevents** is the public calendar, event directory, and complete session-material repository for the **COSYlanguages** ecosystem. It hosts speaking-club prompt decks, cinema immersion guides, teacher-led masterclasses, multimedia nights, and event archives.

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
├── events/
│   └── <event-slug>/
│       ├── event.json                # Event definition and metadata
│       └── sessions/
│           └── <session-slug>.json   # Complete session content
├── sessions/                         # Session materials in web-friendly formats
├── schemas/                          # JSON Schemas for validation
├── scripts/
│   ├── validate-events.js            # Schema and slug consistency checks
│   ├── build-public.js               # Builds the calendar discovery index
│   └── test-no-leak.js               # Checks generated public index shape
├── index.html                        # Main landing page
├── public-events.json                # Generated event/session discovery index
└── package.json                      # NPM scripts and dependencies
```

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

## COSYlanguages ecosystem

- [COSYlanguages](https://cosylanguages.github.io/COSYlanguages/) — Main portal and core curriculum.
- [COSYplatform](https://cosylanguages.github.io/COSYplatform/) — Speaking-club sessions and structured lessons.
- [COSYtools](https://cosylanguages.github.io/COSYtools/) — Offline reference engines.
- [COSYgames](https://cosylanguages.github.io/COSYgames/) — Interactive language-learning games.
