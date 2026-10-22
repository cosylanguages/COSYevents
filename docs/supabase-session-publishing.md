# Session content storage: repository-first

> **Retired workflow:** COSYevents no longer publishes session bodies, vocabulary, discussion prompts, facilitator notes, or session sources to Supabase. Do not restore a session-content publishing workflow.

## Canonical source

The Git repository is the source of truth for complete session materials. Keep the complete, authorized session content in version-controlled files under `sessions/` or `events/<event-slug>/sessions/`, using the existing format and schema for that collection. Website code should load the repository-hosted file or its static-site equivalent.

`public-events.json` is a discovery index only. It is not a session-content database.

## Public repository warning

This repository is public. Anything committed—including session content and Git history—is publicly accessible. Do not commit secrets, access tokens, personal data, or material that you are not authorized to distribute publicly. GitHub-hosted files are not a mechanism for enforcing paid or per-user access.

## Supabase boundary

Supabase may remain in use for unrelated ecosystem features where explicitly needed, but it must not be used as a destination or runtime source for COSYevents session bodies. Do not add service-role credentials, session-body tables, upload scripts, or CI workflows that transfer session content to Supabase.

## Validate changes

Before submitting a change, run:

```sh
npm run validate
npm test
```

If a session page or directory is changed, also run the relevant page-structure, link, and session-directory tests available in `package.json`. Confirm the full session remains available from the repository without a database connection.


## Create a new repository session

For an existing session export, use:

```sh
npm run session:new -- <export.json> --event <event-slug> --club <club-slug> --lang English
```

The event must already exist. The command creates a complete repository JSON session and static HTML page, then validates event data and rebuilds the discovery index. Review generated files before committing because all committed content is public.
