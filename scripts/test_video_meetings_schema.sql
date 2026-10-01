-- Run only in a disposable PostgreSQL database after schema.sql and
-- video_meetings_schema.sql. The transaction rolls back all fixture data.
BEGIN;

DELETE FROM public.video_meetings WHERE session_id = '__video-capacity-test__';
DELETE FROM public.session_entitlements WHERE session_id = '__video-capacity-test__';
DELETE FROM public.session_catalog WHERE session_id = '__video-capacity-test__';

INSERT INTO public.profiles (id, role, hosted_sessions)
VALUES ('10000000-0000-0000-0000-000000000001', 'teacher', ARRAY['__video-capacity-test__'])
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, hosted_sessions = EXCLUDED.hosted_sessions;

INSERT INTO public.profiles (id, role, hosted_sessions)
SELECT ('10000000-0000-0000-0000-' || pg_catalog.lpad(n::text, 12, '0'))::uuid, 'student', '{}'
FROM pg_catalog.generate_series(2, 12) AS n
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, hosted_sessions = EXCLUDED.hosted_sessions;

INSERT INTO public.session_catalog (session_id, title, source_bibliography, format, language, is_published)
VALUES ('__video-capacity-test__', 'Video capacity test', '[]'::jsonb, 'Speaking Club', 'English', true)
ON CONFLICT (session_id) DO UPDATE SET is_published = true;

INSERT INTO public.session_entitlements (user_id, session_id)
SELECT profile.id, '__video-capacity-test__'
FROM public.profiles profile
WHERE profile.id BETWEEN '10000000-0000-0000-0000-000000000002'::uuid
                     AND '10000000-0000-0000-0000-000000000011'::uuid;

INSERT INTO public.video_meetings (
  meeting_id, session_id, provider, provider_room_ref, host_profile_id, starts_at, ends_at, capacity, breakout_room_capacity
) VALUES (
  '20000000-0000-0000-0000-000000000001', '__video-capacity-test__', 'jitsi', 'private-room-ref',
  '10000000-0000-0000-0000-000000000001',
  pg_catalog.now() - interval '1 minute', pg_catalog.now() + interval '1 hour', 10, 5
);

DO $$
DECLARE
  v_meeting_id uuid;
  v_room_id uuid;
  v_user_id uuid;
  v_seat_id uuid;
  v_released boolean;
  v_count integer;
  i integer;
BEGIN
  SELECT meeting_id INTO v_meeting_id
    FROM public.video_meetings WHERE session_id = '__video-capacity-test__';

  -- One host plus nine entitled students fills exactly ten seats.
  FOR i IN 1..10 LOOP
    IF i = 1 THEN
      v_user_id := '10000000-0000-0000-0000-000000000001';
    ELSE
      v_user_id := ('10000000-0000-0000-0000-' || pg_catalog.lpad(i::text, 12, '0'))::uuid;
    END IF;
    PERFORM pg_catalog.set_config('request.jwt.claim.sub', v_user_id::text, true);
    PERFORM public.reserve_speaking_club_seat(v_meeting_id);
  END LOOP;

  SELECT pg_catalog.count(*) INTO v_count
    FROM public.video_meeting_seats
    WHERE meeting_id = v_meeting_id
      AND (
        status = 'joined'
        OR (status = 'reserved' AND reservation_expires_at > pg_catalog.now())
      );
  IF v_count <> 10 THEN
    RAISE EXCEPTION 'Expected 10 active seats; found %.', v_count;
  END IF;
END $$;

  -- Only the backend service role may confirm a reserved seat after token issuance.
SET LOCAL ROLE service_role;
DO $$
DECLARE
  v_seat_id uuid;
BEGIN
  SELECT seat_id INTO v_seat_id FROM public.video_meeting_seats
    WHERE meeting_id = (SELECT meeting_id FROM public.video_meetings WHERE session_id = '__video-capacity-test__')
      AND profile_id = '10000000-0000-0000-0000-000000000002';
  IF NOT public.confirm_speaking_club_seat_join(v_seat_id) THEN
    RAISE EXCEPTION 'Expected the service role to confirm an active reservation.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.video_meeting_seats
    WHERE seat_id = v_seat_id AND status = 'joined' AND reservation_expires_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Confirmed seat was not transitioned to joined.';
  END IF;
  IF pg_catalog.has_function_privilege('authenticated', 'public.confirm_speaking_club_seat_join(uuid)', 'EXECUTE')
    OR pg_catalog.has_function_privilege('anon', 'public.confirm_speaking_club_seat_join(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Browser roles must not confirm provider joins.';
  END IF;
  RAISE NOTICE 'PASS: only the service role confirms joined seats.';
END $$;
RESET ROLE;

DO $$
DECLARE
  v_meeting_id uuid;
  v_room_id uuid;
  v_user_id uuid;
  v_released boolean;
  i integer;
BEGIN
  SELECT meeting_id INTO v_meeting_id
    FROM public.video_meetings WHERE session_id = '__video-capacity-test__';

  -- The 11th entitled participant must be rejected.
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000011', true);
  BEGIN
    PERFORM public.reserve_speaking_club_seat(v_meeting_id);
    RAISE EXCEPTION 'Expected the 11th participant to be rejected.';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: participant 11 was rejected.';
  END;

  -- A student without a current entitlement cannot reserve a seat.
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000012', true);
  BEGIN
    PERFORM public.reserve_speaking_club_seat(v_meeting_id);
    RAISE EXCEPTION 'Expected an unentitled student to be rejected.';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: unentitled student was rejected.';
  END;

  -- Releasing a seat frees capacity for another entitled participant.
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
  SELECT public.release_speaking_club_seat(v_meeting_id) INTO v_released;
  IF NOT v_released THEN RAISE EXCEPTION 'Expected the seat to be released.'; END IF;
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000011', true);
  PERFORM public.reserve_speaking_club_seat(v_meeting_id);

  INSERT INTO public.video_breakout_rooms (meeting_id, session_id, label, provider_room_ref, capacity)
  VALUES (v_meeting_id, '__video-capacity-test__', 'Room A', 'private-room-a', 5)
  RETURNING breakout_room_id INTO v_room_id;

  -- The assigned host can place five active participants in one breakout room.
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
  FOR i IN 3..7 LOOP
    v_user_id := ('10000000-0000-0000-0000-' || pg_catalog.lpad(i::text, 12, '0'))::uuid;
    PERFORM public.assign_video_breakout_participant(v_meeting_id, v_room_id, v_user_id);
  END LOOP;

  -- A student cannot move another participant.
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
  BEGIN
    PERFORM public.assign_video_breakout_participant(
      v_meeting_id, v_room_id, '10000000-0000-0000-0000-000000000004'
    );
    RAISE EXCEPTION 'Expected a student moving another participant to be rejected.';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS: students cannot move another participant.';
  END;

  -- The sixth active assignment in the five-person room must be rejected.
  PERFORM pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
  v_user_id := '10000000-0000-0000-0000-000000000008';
  BEGIN
    PERFORM public.assign_video_breakout_participant(v_meeting_id, v_room_id, v_user_id);
    RAISE EXCEPTION 'Expected the sixth breakout assignment to be rejected.';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: breakout assignment 6 was rejected.';
  END;

  IF pg_catalog.has_table_privilege('anon', 'public.video_meetings', 'SELECT')
     OR pg_catalog.has_table_privilege('authenticated', 'public.video_meetings', 'SELECT') THEN
    RAISE EXCEPTION 'Video room metadata must not be directly readable by browser roles.';
  END IF;
  RAISE NOTICE 'PASS: browser roles cannot read private provider room references.';
END $$;

SET LOCAL ROLE authenticated;
SELECT pg_catalog.set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
DO $$
DECLARE
  v_room_count integer;
  v_assignment_count integer;
  v_seat_count integer;
BEGIN
  SELECT pg_catalog.count(*) INTO v_room_count FROM public.video_breakout_rooms;
  SELECT pg_catalog.count(*) INTO v_assignment_count FROM public.video_breakout_assignments;
  SELECT pg_catalog.count(*) INTO v_seat_count FROM public.video_meeting_seats;
  IF v_room_count <> 1 OR v_assignment_count <> 1 OR v_seat_count <> 1 THEN
    RAISE EXCEPTION 'Participant RLS leaked or hid unrelated breakout data.';
  END IF;
  IF pg_catalog.has_column_privilege('authenticated', 'public.video_breakout_rooms', 'provider_room_ref', 'SELECT') THEN
    RAISE EXCEPTION 'Authenticated users must not read provider room references.';
  END IF;
  IF NOT public.leave_video_breakout_room(
    '20000000-0000-0000-0000-000000000001'
  ) THEN
    RAISE EXCEPTION 'Expected participant to leave their breakout room.';
  END IF;
  RAISE NOTICE 'PASS: participant RLS shows only their seat, assignment, and room; room references remain private.';
END $$;
RESET ROLE;

ROLLBACK;
