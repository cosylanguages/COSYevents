# Retired: Supabase-backed session magic-link pilot

This pilot checklist belongs to the former gated-session architecture and is retained only as historical context. **Do not use it to create, publish, or serve COSYevents session materials.** The Supabase session publisher and anonymous session-table verification scripts have been removed.

## Current workflow

Create a complete session in the repository using the repository-first authoring command:

```sh
npm run session:new -- <session-export.json> --event <event-slug> --club <club-slug> --lang English
```

The `--event` value must match an existing `events/<event-slug>/event.json`. The script writes a full session JSON file under `events/<event-slug>/sessions/`, generates a static page under `sessions/<club-slug>/`, updates the session catalog, and rebuilds the public discovery index.

All generated files become public when committed because this is a public repository. Never put credentials, personal data, or content that is not authorized for public distribution in the input or output. GitHub-hosted files do not provide paid or per-user access control.

## Legacy magic links

Shared ecosystem authentication or participant-link features may continue to exist in other applications, but they must not be treated as a source of COSYevents session content. Do not restore Supabase reads or writes for session bodies, vocabulary, prompts, facilitator notes, or recording metadata.
