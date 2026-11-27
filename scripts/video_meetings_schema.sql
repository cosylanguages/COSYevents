-- Apply after schema.sql.
-- Provider room references remain private; this migration does not issue video tokens.
-- Capacity is enforced transactionally by a meeting-row lock, not by client counters.

CREATE TABLE IF NOT EXISTS public.video_meetings (
  meeting_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES public.session_catalog(session_id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('jitsi', 'livekit', 'other')),
  provider_room_ref text NOT NULL,
  host_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'closed', 'cancelled')),
  capacity smallint NOT NULL DEFAULT 10 CHECK (capacity BETWEEN 1 AND 10),
  breakout_room_capacity smallint NOT NULL DEFAULT 5 CHECK (breakout_room_capacity BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, session_id)
);

CREATE TABLE IF NOT EXISTS public.video_meeting_seats (
  seat_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL,
  session_id text NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_role text NOT NULL CHECK (participant_role IN ('student', 'host')),
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'joined', 'left', 'cancelled')),
  reservation_expires_at timestamptz,
  joined_at timestamptz,
  left_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (meeting_id, session_id)
    REFERENCES public.video_meetings(meeting_id, session_id) ON DELETE CASCADE,
  UNIQUE (meeting_id, profile_id),
  UNIQUE (meeting_id, session_id, seat_id, profile_id),
  CHECK (status <> 'reserved' OR reservation_expires_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS video_meeting_seats_active_idx
  ON public.video_meeting_seats (meeting_id, status, reservation_expires_at);

CREATE TABLE IF NOT EXISTS public.video_breakout_rooms (
  breakout_room_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL,
  session_id text NOT NULL,
  label text NOT NULL,
  provider_room_ref text NOT NULL,
  capacity smallint NOT NULL DEFAULT 5 CHECK (capacity BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (meeting_id, session_id)
    REFERENCES public.video_meetings(meeting_id, session_id) ON DELETE CASCADE,
  UNIQUE (meeting_id, label),
  UNIQUE (meeting_id, session_id, breakout_room_id)
);

CREATE TABLE IF NOT EXISTS public.video_breakout_assignments (
  assignment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL,
  session_id text NOT NULL,
  breakout_room_id uuid NOT NULL,
  seat_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES public.profiles(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  FOREIGN KEY (meeting_id, session_id, breakout_room_id)
    REFERENCES public.video_breakout_rooms(meeting_id, session_id, breakout_room_id) ON DELETE CASCADE,
  FOREIGN KEY (meeting_id, session_id, seat_id, profile_id)
    REFERENCES public.video_meeting_seats(meeting_id, session_id, seat_id, profile_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS video_breakout_one_active_assignment_idx
  ON public.video_breakout_assignments (meeting_id, profile_id)
  WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS video_breakout_room_roster_idx
  ON public.video_breakout_assignments (meeting_id, breakout_room_id)
  WHERE ended_at IS NULL;

CREATE OR REPLACE FUNCTION public.is_video_meeting_host(p_meeting_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.video_meetings meeting
    WHERE meeting.meeting_id = p_meeting_id
      AND meeting.host_profile_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.enforce_video_meeting_capacity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_capacity smallint;
  v_active_count integer;
BEGIN
  IF NEW.status NOT IN ('reserved', 'joined') THEN
    RETURN NEW;
  END IF;
  IF NEW.status = 'reserved' AND NEW.reservation_expires_at <= pg_catalog.now() THEN
    RETURN NEW;
  END IF;

  SELECT meeting.capacity
    INTO v_capacity
    FROM public.video_meetings meeting
    WHERE meeting.meeting_id = NEW.meeting_id
    FOR UPDATE;

  IF v_capacity IS NULL THEN
    RAISE EXCEPTION 'Video meeting does not exist.' USING ERRCODE = '23503';
  END IF;

  SELECT pg_catalog.count(*)
    INTO v_active_count
    FROM public.video_meeting_seats seat
    WHERE seat.meeting_id = NEW.meeting_id
      AND seat.seat_id <> NEW.seat_id
      AND (
        seat.status = 'joined'
        OR (seat.status = 'reserved' AND seat.reservation_expires_at > pg_catalog.now())
      );

  IF v_active_count >= v_capacity THEN
    RAISE EXCEPTION 'This speaking club meeting is full.' USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS video_meeting_seat_capacity_guard ON public.video_meeting_seats;
CREATE TRIGGER video_meeting_seat_capacity_guard
  BEFORE INSERT OR UPDATE OF status, reservation_expires_at, meeting_id
  ON public.video_meeting_seats
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_video_meeting_capacity();

CREATE OR REPLACE FUNCTION public.enforce_video_breakout_capacity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_room_capacity smallint;
  v_room_status text;
  v_seat_status text;
  v_reservation_expires_at timestamptz;
  v_active_count integer;
BEGIN
  IF NEW.ended_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT room.capacity, room.status
    INTO v_room_capacity, v_room_status
    FROM public.video_breakout_rooms room
    WHERE room.meeting_id = NEW.meeting_id
      AND room.session_id = NEW.session_id
      AND room.breakout_room_id = NEW.breakout_room_id
    FOR UPDATE;

  IF v_room_capacity IS NULL OR v_room_status <> 'open' THEN
    RAISE EXCEPTION 'Breakout room is unavailable.' USING ERRCODE = '23514';
  END IF;

  SELECT seat.status, seat.reservation_expires_at
    INTO v_seat_status, v_reservation_expires_at
    FROM public.video_meeting_seats seat
    WHERE seat.meeting_id = NEW.meeting_id
      AND seat.session_id = NEW.session_id
      AND seat.seat_id = NEW.seat_id
      AND seat.profile_id = NEW.profile_id
    FOR UPDATE;

  IF v_seat_status IS NULL OR (
    v_seat_status <> 'joined'
    AND NOT (v_seat_status = 'reserved' AND v_reservation_expires_at > pg_catalog.now())
  ) THEN
    RAISE EXCEPTION 'An active meeting seat is required for a breakout assignment.' USING ERRCODE = '23514';
  END IF;

  SELECT pg_catalog.count(*)
    INTO v_active_count
    FROM public.video_breakout_assignments assignment
    WHERE assignment.meeting_id = NEW.meeting_id
      AND assignment.breakout_room_id = NEW.breakout_room_id
      AND assignment.ended_at IS NULL
      AND assignment.assignment_id <> NEW.assignment_id;

  IF v_active_count >= v_room_capacity THEN
    RAISE EXCEPTION 'This breakout room is full.' USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS video_breakout_capacity_guard ON public.video_breakout_assignments;
CREATE TRIGGER video_breakout_capacity_guard
  BEFORE INSERT OR UPDATE OF breakout_room_id, seat_id, profile_id, ended_at
  ON public.video_breakout_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_video_breakout_capacity();

CREATE OR REPLACE FUNCTION public.reserve_speaking_club_seat(p_meeting_id uuid)
RETURNS TABLE (seat_id uuid, reservation_expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_meeting public.video_meetings%ROWTYPE;
  v_participant_role text;
  v_existing public.video_meeting_seats%ROWTYPE;
  v_active_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING ERRCODE = '28000';
  END IF;

  SELECT meeting.*
    INTO v_meeting
    FROM public.video_meetings meeting
    WHERE meeting.meeting_id = p_meeting_id
    FOR UPDATE;

  IF NOT FOUND OR v_meeting.status NOT IN ('scheduled', 'live') THEN
    RAISE EXCEPTION 'This meeting is not available.' USING ERRCODE = '22023';
  END IF;
  IF pg_catalog.now() < v_meeting.starts_at - interval '15 minutes' OR pg_catalog.now() >= v_meeting.ends_at THEN
    RAISE EXCEPTION 'This meeting is outside its join window.' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.session_catalog catalog
    WHERE catalog.session_id = v_meeting.session_id
      AND catalog.format = 'Speaking Club'
      AND catalog.is_published
  ) THEN
    RAISE EXCEPTION 'This is not a published speaking club session.' USING ERRCODE = '22023';
  END IF;

  IF v_user_id = v_meeting.host_profile_id THEN
    v_participant_role := 'host';
  ELSIF EXISTS (
    SELECT 1 FROM public.session_entitlements entitlement
    WHERE entitlement.user_id = v_user_id
      AND entitlement.session_id = v_meeting.session_id
      AND entitlement.access_starts_at <= pg_catalog.now()
      AND (entitlement.access_expires_at IS NULL OR entitlement.access_expires_at > pg_catalog.now())
      AND entitlement.revoked_at IS NULL
  ) THEN
    v_participant_role := 'student';
  ELSE
    RAISE EXCEPTION 'An active session entitlement or host assignment is required.' USING ERRCODE = '42501';
  END IF;

  SELECT seat.*
    INTO v_existing
    FROM public.video_meeting_seats seat
    WHERE seat.meeting_id = p_meeting_id
      AND seat.profile_id = v_user_id
    FOR UPDATE;

  IF FOUND AND (
    v_existing.status = 'joined'
    OR (v_existing.status = 'reserved' AND v_existing.reservation_expires_at > pg_catalog.now())
  ) THEN
    RETURN QUERY SELECT v_existing.seat_id, v_existing.reservation_expires_at;
    RETURN;
  END IF;

  SELECT pg_catalog.count(*)
    INTO v_active_count
    FROM public.video_meeting_seats seat
    WHERE seat.meeting_id = p_meeting_id
      AND (
        seat.status = 'joined'
        OR (seat.status = 'reserved' AND seat.reservation_expires_at > pg_catalog.now())
      );

  IF v_active_count >= v_meeting.capacity THEN
    RAISE EXCEPTION 'This speaking club meeting is full.' USING ERRCODE = '23514';
  END IF;

  INSERT INTO public.video_meeting_seats AS existing_seat (
    meeting_id, session_id, profile_id, participant_role, status, reservation_expires_at, joined_at, left_at
  ) VALUES (
    p_meeting_id, v_meeting.session_id, v_user_id, v_participant_role, 'reserved', pg_catalog.now() + interval '5 minutes', NULL, NULL
  )
  ON CONFLICT (meeting_id, profile_id) DO UPDATE SET
    participant_role = EXCLUDED.participant_role,
    status = 'reserved',
    reservation_expires_at = EXCLUDED.reservation_expires_at,
    joined_at = NULL,
    left_at = NULL
  RETURNING existing_seat.seat_id, existing_seat.reservation_expires_at
  INTO v_existing.seat_id, v_existing.reservation_expires_at;

  RETURN QUERY SELECT v_existing.seat_id, v_existing.reservation_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_speaking_club_seat(p_meeting_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_updated integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING ERRCODE = '28000';
  END IF;

  UPDATE public.video_meeting_seats seat
    SET status = 'left', reservation_expires_at = NULL, left_at = pg_catalog.now()
    WHERE seat.meeting_id = p_meeting_id
      AND seat.profile_id = v_user_id
      AND seat.status IN ('reserved', 'joined');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 1 THEN
    UPDATE public.video_breakout_assignments assignment
      SET ended_at = pg_catalog.now()
      WHERE assignment.meeting_id = p_meeting_id
        AND assignment.profile_id = v_user_id
        AND assignment.ended_at IS NULL;
  END IF;
  RETURN v_updated = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_speaking_club_seat_join(p_seat_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.video_meeting_seats seat
    SET status = 'joined', reservation_expires_at = NULL, joined_at = pg_catalog.now(), left_at = NULL
    WHERE seat.seat_id = p_seat_id
      AND seat.status = 'reserved'
      AND seat.reservation_expires_at > pg_catalog.now();

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_video_breakout_participant(
  p_meeting_id uuid,
  p_breakout_room_id uuid,
  p_profile_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_session_id text;
  v_seat_id uuid;
  v_assignment_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING ERRCODE = '28000';
  END IF;
  IF NOT public.is_video_meeting_host(p_meeting_id) THEN
    RAISE EXCEPTION 'Only the assigned meeting host can move participants.' USING ERRCODE = '42501';
  END IF;

  SELECT meeting.session_id INTO v_session_id
    FROM public.video_meetings meeting
    WHERE meeting.meeting_id = p_meeting_id
    FOR UPDATE;
  IF v_session_id IS NULL THEN
    RAISE EXCEPTION 'Video meeting does not exist.' USING ERRCODE = '23503';
  END IF;

  SELECT seat.seat_id INTO v_seat_id
    FROM public.video_meeting_seats seat
    WHERE seat.meeting_id = p_meeting_id
      AND seat.session_id = v_session_id
      AND seat.profile_id = p_profile_id
      AND (
        seat.status = 'joined'
        OR (seat.status = 'reserved' AND seat.reservation_expires_at > pg_catalog.now())
      )
    FOR UPDATE;
  IF v_seat_id IS NULL THEN
    RAISE EXCEPTION 'Participant has no active meeting seat.' USING ERRCODE = '23514';
  END IF;

  UPDATE public.video_breakout_assignments assignment
    SET ended_at = pg_catalog.now()
    WHERE assignment.meeting_id = p_meeting_id
      AND assignment.profile_id = p_profile_id
      AND assignment.ended_at IS NULL;

  INSERT INTO public.video_breakout_assignments (
    meeting_id, session_id, breakout_room_id, seat_id, profile_id, assigned_by
  ) VALUES (
    p_meeting_id, v_session_id, p_breakout_room_id, v_seat_id, p_profile_id, v_user_id
  )
  RETURNING assignment_id INTO v_assignment_id;

  RETURN v_assignment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_video_breakout_room(
  p_meeting_id uuid,
  p_profile_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_target_profile_id uuid := coalesce(p_profile_id, auth.uid());
  v_updated integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING ERRCODE = '28000';
  END IF;
  IF v_target_profile_id <> v_user_id AND NOT public.is_video_meeting_host(p_meeting_id) THEN
    RAISE EXCEPTION 'Only the assigned meeting host can recall another participant.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.video_breakout_assignments assignment
    SET ended_at = pg_catalog.now()
    WHERE assignment.meeting_id = p_meeting_id
      AND assignment.profile_id = v_target_profile_id
      AND assignment.ended_at IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

ALTER TABLE public.video_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_meeting_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_breakout_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_breakout_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own video meeting seats" ON public.video_meeting_seats;
DROP POLICY IF EXISTS "Hosts can view seats for hosted video meetings" ON public.video_meeting_seats;
DROP POLICY IF EXISTS "Users can view their own breakout assignments" ON public.video_breakout_assignments;
DROP POLICY IF EXISTS "Hosts can view assignments for hosted video meetings" ON public.video_breakout_assignments;
DROP POLICY IF EXISTS "Users can view assigned breakout room details" ON public.video_breakout_rooms;

CREATE POLICY "Users can view their own video meeting seats"
  ON public.video_meeting_seats
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Hosts can view seats for hosted video meetings"
  ON public.video_meeting_seats
  FOR SELECT
  TO authenticated
  USING (
    public.is_video_meeting_host(video_meeting_seats.meeting_id)
  );

CREATE POLICY "Users can view their own breakout assignments"
  ON public.video_breakout_assignments
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Hosts can view assignments for hosted video meetings"
  ON public.video_breakout_assignments
  FOR SELECT
  TO authenticated
  USING (
    public.is_video_meeting_host(video_breakout_assignments.meeting_id)
  );

CREATE POLICY "Users can view assigned breakout room details"
  ON public.video_breakout_rooms
  FOR SELECT
  TO authenticated
  USING (
    public.is_video_meeting_host(video_breakout_rooms.meeting_id)
    OR EXISTS (
      SELECT 1 FROM public.video_breakout_assignments assignment
      WHERE assignment.meeting_id = video_breakout_rooms.meeting_id
        AND assignment.breakout_room_id = video_breakout_rooms.breakout_room_id
        AND assignment.profile_id = auth.uid()
        AND assignment.ended_at IS NULL
    )
  );

REVOKE ALL ON TABLE public.video_meetings FROM anon, authenticated;
REVOKE ALL ON TABLE public.video_meeting_seats FROM anon, authenticated;
GRANT SELECT ON TABLE public.video_meeting_seats TO authenticated;
REVOKE ALL ON TABLE public.video_breakout_rooms FROM anon, authenticated;
GRANT SELECT (breakout_room_id, meeting_id, session_id, label, capacity, status)
  ON TABLE public.video_breakout_rooms TO authenticated;
REVOKE ALL ON TABLE public.video_breakout_assignments FROM anon, authenticated;
GRANT SELECT ON TABLE public.video_breakout_assignments TO authenticated;

GRANT ALL ON TABLE public.video_meetings TO service_role;
GRANT ALL ON TABLE public.video_meeting_seats TO service_role;
GRANT ALL ON TABLE public.video_breakout_rooms TO service_role;
GRANT ALL ON TABLE public.video_breakout_assignments TO service_role;

REVOKE ALL ON FUNCTION public.reserve_speaking_club_seat(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_speaking_club_seat(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.release_speaking_club_seat(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.release_speaking_club_seat(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.confirm_speaking_club_seat_join(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_speaking_club_seat_join(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.is_video_meeting_host(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_video_meeting_host(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.assign_video_breakout_participant(uuid, uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_video_breakout_participant(uuid, uuid, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.leave_video_breakout_room(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_video_breakout_room(uuid, uuid) TO authenticated, service_role;
