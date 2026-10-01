# Supabase Session Publishing

## Access Model

- `session_catalog` is the public catalogue. Its bibliography contains citations only, never source URLs.
- `session_content` stores private vocabulary, rounds, optional grammar, and discussion prompts.
- `session_sources` stores direct source URLs and optional private audio object paths.
- `session_entitlements` grants access per user and session. The service role manages grants; students cannot grant access to themselves.
- `session-source-audio` is a private Storage bucket. Source audio is readable only by entitled students, founders, and the assigned teachers.

## Export and Review

The exporter reads the existing session HTML and writes only into the ignored `private/` directory. It never publishes to Supabase.

```sh
npm run export:private-sessions
npm run export:private-sessions -- --session sessions/karaoke-club/challenges/abba-challenge/index.html --write
npm run export:private-sessions -- --write
```

The first command is report-only. Each generated payload is marked `review_status: "needs_review"`. Check the vocabulary, discussion prompts, grammar, citations, and source URLs manually. The exporter deliberately does not copy full article text or song lyrics.

With `--write`, the exporter also creates `private/session-exports/review.csv`. It contains one row per session with content counts and review warnings, but no direct source URLs.

## Add Audio

Place an audio file beside the payload or in a subdirectory under its directory, then add `audio_file` and an audio MIME type to the corresponding private source:

```json
{
  "source_id": "article-1",
  "source_title": "Article title",
  "source_url": "https://example.org/article",
  "audio_file": "audio/article-presentation.mp3",
  "audio_content_type": "audio/mpeg"
}
```

The publisher rejects absolute paths, paths escaping the payload directory, and non-audio MIME types. It uploads the file to the private Storage bucket.

## Validate and Publish

Validate a payload without Supabase credentials:

```sh
node scripts/publish_to_supabase.js --validate-only private/session-exports/<session-id>.json
```

Only after manual review, set `review_status` to `approved`. Keep `public.is_published` false until the public metadata is ready. Publishing requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the local ignored `.env` file:

```sh
node scripts/publish_to_supabase.js private/session-exports/<session-id>.json
```

The service-role key must never be placed in browser code or committed. Do not remove the existing public HTML session pages until the authenticated Supabase reader is deployed and verified; those pages currently expose their full contents independently of RLS.
