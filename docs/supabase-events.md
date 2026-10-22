# Supabase boundary for COSYevents

**Session content is repository-first. This document replaces the retired Supabase session publishing/RLS design.**

COSYevents does not use Supabase as a store or runtime source for event/session bodies. Complete session material belongs in version-controlled files and is deployed with the static site. The generated `public-events.json` file is only a discovery index.

## What remains in Supabase

COSYlanguages ecosystem pages may continue using the shared Supabase project for unrelated features such as authentication, profiles, or access grants. Those features must not be used to fetch or gate COSYevents session activities, discussion prompts, vocabulary, facilitator notes, or session recordings.

## Legacy database objects

Existing Supabase projects may still contain tables or policies from the retired COSYevents session-access design, including `events_public`, `sessions_public`, `session_content`, `event_access`, and `event_hosts`. Their presence does not make them a source of truth. COSYevents code must not publish to or read session bodies from these tables.

Do not drop or alter shared database tables as part of this repository change: other COSY ecosystem applications may still depend on shared objects. Database cleanup should be separately reviewed with the owners of all connected applications.

## Publishing

Run the repository validation and static catalog build:

```sh
npm run publish
```

This validates event/session files and regenerates the static discovery index. It does not connect to Supabase or upload session content. GitHub Pages deployment is responsible for publishing the committed files.

## Public-repository and access note

This repository is public. Committed session files and Git history are publicly accessible. Do not commit credentials, personal data, or material that is not authorized for public distribution. GitHub Pages is not an access-control system for paid or per-user session materials.
