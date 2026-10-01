# Speaking Club Video Calls

## Status

The draft database migration is in `scripts/video_meetings_schema.sql`. It adds private meeting, seat, breakout, and assignment tables; server-side seat reservation/release functions; and database triggers for the 10-seat meeting limit and five-seat breakout limit. It applies twice and passes the capacity, entitlement, release, and privacy assertions in a disposable PostgreSQL 16 database.

Run the repeatable integration check with `npm run test:video-meetings`. It requires Docker, creates an isolated PostgreSQL 16 container with minimal Supabase stubs, and removes it on exit. It never connects to a configured Supabase project.

The runner applies `scripts/schema.sql`, then `scripts/video_meetings_schema.sql`, and finally `scripts/test_video_meetings_schema.sql`. The SQL test runs in a transaction and rolls its fixtures back. It covers host-plus-student capacity, unentitled access, seat release, breakout capacity, and browser-role access to private provider room references.

Video meetings are not live in COSYevents yet: no provider credentials/tokens, authenticated meeting UI, scheduled meeting provisioning, or real-provider test exists. Do not publish meeting URLs in `events.json`, `data/sessions.json`, or public session pages. Apply the migration to a staging Supabase project only after reviewing the upstream `profiles` and `session_entitlements` policies.

## COSYplatform Comparison

The current COSYplatform `classroom.html` provides useful UI and flow examples:

- It embeds Jitsi Meet and also offers PeerJS direct video.
- The Jitsi path can host a multi-person room. No hard maximum of 10 participants was found in the current client implementation.
- The PeerJS path renders one local and one remote video tile and calls a single peer. It is not a suitable group-video implementation for a 10-person club.
- Breakout controls offer two to four named rooms. They derive separate Jitsi room names and let people move manually; no authoritative server-side room roster or room-cap enforcement was found.
- PeerJS data-channel state and Jitsi media rooms are separate. Do not treat a PeerJS breakout label or chat message as proof that someone entered the corresponding video room.

Reuse the classroom's facilitation ideas and visual patterns, but do not expose the current classroom room-key URL as the COSYevents meeting link or claim its breakout controls enforce the 10-person limit.

## Product Contract

- Only registered attendees with a valid paid entitlement may join a session call. Teachers and founders may join through their assigned host permissions.
- A meeting is tied to one scheduled event/session and has one canonical capacity: **10 people total, including the facilitator**. This is the initial assumption; change it only if the business rule is explicitly 10 students plus facilitator.
- The 11th seat is rejected server-side. When full, show a waitlist or full-session state. A disabled button or client-side counter is not enforcement.
- Breakout rooms are a first-class part of speaking clubs, not an optional afterthought. The facilitator can create/close rooms, assign or shuffle attendees, move them, send the session prompt to each room, and recall everyone to the main room.
- Default breakout layout: split attendees into rooms of at most five people, balancing group sizes. The facilitator remains included in the meeting-wide capacity and can move between rooms.
- Attendees can see their own room assignment and return to the main room. They cannot create rooms, assign other people, or access another event's room.
- If camera permission or bandwidth fails, allow audio-only participation without allocating an extra seat. Show a clear device-permission and reconnect state.

## Architecture Recommendation

1. Keep public schedule and session metadata in the existing public calendar/catalogue. Keep room identifiers, join credentials, attendance roster, and room assignments private.
2. Add a private meeting record linked to the event/session, with provider, scheduled window, capacity, status, and breakout policy.
3. Reserve seats transactionally through a trusted backend/RPC that checks the paid entitlement and serializes concurrent reservations. Expired, cancelled, or revoked entitlements cannot join.
4. Return a short-lived provider credential only after authorization. Never put provider secrets, reusable room keys, or direct join URLs into static public JSON or HTML.
5. Use a group-media provider that supports authenticated room access and a genuinely enforceable participant limit. Jitsi can remain an option only with a controlled deployment/configuration that enforces authorization and capacity; public Jitsi rooms do not satisfy this contract by themselves. PeerJS mesh is not the recommended media plane for 10 video participants.
6. Use a trusted meeting coordinator for presence, seat reservations, and breakout membership. A client-side room label alone is not authoritative. Prefer provider-native breakout APIs when available; otherwise create protected subrooms and let the coordinator authorize membership and transitions.

Candidate providers to compare in a staging spike:

| Option | Reuse | Main trade-off |
|---|---|---|
| Existing public Jitsi setup | Closest to COSYplatform | Current code has no enforced cap or paid-room authorization; manual room-name breakouts need hardening. |
| Controlled Jitsi deployment/JaaS | Reuses Jitsi UI and room model | Requires provider configuration, authentication/token provisioning, and an integration spike for breakout behavior and the exact 10-person limit. |
| Managed group-video SDK with breakout API | Stronger room, participant, and breakout primitives | New vendor, cost, credentials, and front-end integration. |

Do not choose a provider based only on a "free/unlimited" client label. Verify real concurrency limits, recording defaults, retention, geographic availability, privacy terms, and cost for the expected number of simultaneous sessions.

## Draft Database Model

The migration separates these concerns rather than adding a public `meeting_url` column:

- `video_meetings`: meeting ID, session/event ID, provider, provider room reference, starts/ends, status, `capacity` constrained to 1..10, breakout settings.
- `video_meeting_seats`: meeting ID, profile ID, reservation/join status, role, timestamps; unique `(meeting_id, profile_id)`.
- `video_breakout_rooms`: meeting ID, stable room ID, label, room reference, room capacity, active status.
- `video_breakout_assignments`: meeting ID, room ID, seat ID, profile ID, assigned by, timestamp; unique active assignment per participant.

RLS is enabled on all four tables. Students can read only their own seat, assignment, and assigned breakout label; the assigned host can read the roster. Provider room references are not selectable by browser roles. `reserve_speaking_club_seat` checks the session entitlement or server-assigned host, serializes reservations by locking the meeting row, and creates a five-minute seat reservation. After provider-token issuance, only the service role can call `confirm_speaking_club_seat_join` to turn that reservation into a joined seat. `release_speaking_club_seat` releases the caller's seat and ends its breakout assignment. `assign_video_breakout_participant` is host-only; `leave_video_breakout_room` lets a participant return to the main room or the host recall them. Database triggers enforce the meeting and breakout capacities.

The migration does not yet issue provider credentials, expose the private meeting reference, transition a seat to `joined`, or create/manage breakout rooms through trusted APIs. Those operations need server-side provider integration before the web UI can safely join calls. The provider must enforce the same participant ceiling where possible.

## Acceptance Checks

- Capacity accepts exactly 10 total people and rejects the 11th even when two reservations arrive simultaneously.
- Free/non-entitled users cannot obtain a join credential; an authorized attendee can only obtain one for their own scheduled session.
- Direct URLs and room IDs are absent from public network responses.
- Ten simultaneous cameras can join on representative desktop and mobile networks; camera-off/audio-only and reconnect paths work.
- Breakout membership, room capacities, task delivery, teacher movement, and recall are tested across multiple browsers, not just simulated client state.
- Room and source links are not reusable after the meeting window or entitlement revocation.
- Recording is off by default unless the session has explicit consent and retention settings.

## Next Step

Run a staging spike against COSYplatform's current Jitsi integration: one teacher plus nine learners, then split into two breakouts and recall to the main room. Record whether admission, participant cap, and room membership are enforced by the provider or merely represented in the browser. Do not connect public COSYevents pages until that test and the private meeting/seat backend are in place.
