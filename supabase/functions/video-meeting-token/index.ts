import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const JAAS_APP_ID = Deno.env.get('JAAS_APP_ID') || '';
const JAAS_API_KEY_ID = Deno.env.get('JAAS_API_KEY_ID') || '';
const JAAS_PRIVATE_KEY = Deno.env.get('JAAS_PRIVATE_KEY') || '';
const ALLOWED_ORIGINS = new Set([
  'https://cosylanguages.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000'
]);

function responseHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://cosylanguages.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
}

function jsonResponse(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

function base64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function encodeJson(value: unknown) {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToBytes(pem: string) {
  const normalized = pem.replace(/\\n/g, '\n').trim();
  if (!normalized.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('JAAS_PRIVATE_KEY must be a PKCS#8 PEM private key.');
  }
  const encoded = normalized
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const binary = atob(encoded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function createJaasToken(roomName: string, user: { id: string; email?: string }, isHost: boolean) {
  if (!JAAS_APP_ID || !JAAS_API_KEY_ID || !JAAS_PRIVATE_KEY) {
    throw new Error('JaaS is not configured. Set JAAS_APP_ID, JAAS_API_KEY_ID, and JAAS_PRIVATE_KEY as Edge Function secrets.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: 'RS256', typ: 'JWT', kid: `${JAAS_APP_ID}/${JAAS_API_KEY_ID}` });
  const claims = encodeJson({
    aud: 'jitsi',
    iss: 'chat',
    sub: JAAS_APP_ID,
    room: roomName,
    nbf: now - 10,
    exp: now + 180,
    context: {
      user: {
        id: user.id,
        name: user.email || 'COSYevents participant',
        email: user.email || '',
        moderator: isHost ? 'true' : 'false'
      },
      features: {
        livestreaming: false,
        'outbound-call': false,
        transcription: false,
        recording: false
      },
      room: { regex: false }
    }
  });

  const signingInput = `${header}.${claims}`;
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToBytes(JAAS_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = new Uint8Array(await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput)
  ));

  return `${signingInput}.${base64Url(signature)}`;
}

function userClient(authorization: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function serviceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function authenticate(authorization: string | null) {
  if (!authorization || !authorization.startsWith('Bearer ')) throw new Error('Sign in to join a live session.');
  const client = userClient(authorization);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error('Your sign-in session is invalid or expired.');
  return { client, user: data.user };
}

async function getMeeting(admin: ReturnType<typeof serviceClient>, meetingId: string) {
  const { data, error } = await admin
    .from('video_meetings')
    .select('meeting_id, session_id, provider, provider_room_ref, host_profile_id, starts_at, ends_at, status, capacity, breakout_room_capacity, session_catalog(title, level, language, summary)')
    .eq('meeting_id', meetingId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Live session not found.');
  return data;
}

async function hasEntitlement(admin: ReturnType<typeof serviceClient>, userId: string, sessionId: string) {
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from('session_entitlements')
    .select('entitlement_id')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .is('revoked_at', null)
    .lte('access_starts_at', now)
    .or(`access_expires_at.is.null,access_expires_at.gt.${now}`)
    .limit(1);
  if (error) throw error;
  return Boolean(data && data.length);
}

async function getHostStatus(admin: ReturnType<typeof serviceClient>, meeting: { host_profile_id: string }, userId: string) {
  return meeting.host_profile_id === userId;
}

async function listMeetings(admin: ReturnType<typeof serviceClient>, user: { id: string; email?: string }) {
  const now = new Date().toISOString();
  const { data: meetings, error } = await admin
    .from('video_meetings')
    .select('meeting_id, session_id, host_profile_id, starts_at, ends_at, status, capacity, breakout_room_capacity, session_catalog(title, level, language, summary)')
    .in('status', ['scheduled', 'live'])
    .gte('ends_at', now)
    .order('starts_at', { ascending: true });
  if (error) throw error;

  const visible = [];
  for (const meeting of meetings || []) {
    const isHost = await getHostStatus(admin, meeting, user.id);
    const entitled = isHost || await hasEntitlement(admin, user.id, meeting.session_id);
    if (!entitled) continue;

    const { data: seats, error: seatsError } = await admin
      .from('video_meeting_seats')
      .select('profile_id, status, reservation_expires_at')
      .eq('meeting_id', meeting.meeting_id);
    if (seatsError) throw seatsError;

    const activeSeats = (seats || []).filter(seat =>
      seat.status === 'joined' ||
      (seat.status === 'reserved' && seat.reservation_expires_at && seat.reservation_expires_at > now)
    );
    const ownSeat = activeSeats.find(seat => seat.profile_id === user.id);
    const session = meeting.session_catalog || {};
    visible.push({
      meeting_id: meeting.meeting_id,
      session_id: meeting.session_id,
      title: session.title || 'Speaking Club',
      summary: session.summary || null,
      level: session.level || null,
      language: session.language || null,
      starts_at: meeting.starts_at,
      ends_at: meeting.ends_at,
      status: meeting.status,
      capacity: meeting.capacity,
      active_seats: activeSeats.length,
      my_seat_status: ownSeat ? ownSeat.status : null,
      is_host: isHost
    });
  }
  return visible;
}

async function getAuthorizedMeeting(admin: ReturnType<typeof serviceClient>, user: { id: string; email?: string }, meetingId: string) {
  if (!meetingId || typeof meetingId !== 'string') throw new Error('meeting_id is required.');
  const meeting = await getMeeting(admin, meetingId);
  if (!['scheduled', 'live'].includes(meeting.status)) throw new Error('This live session is not open.');
  if (new Date(meeting.ends_at).getTime() <= Date.now()) throw new Error('This live session has ended.');
  const isHost = await getHostStatus(admin, meeting, user.id);
  if (!isHost && !(await hasEntitlement(admin, user.id, meeting.session_id))) {
    throw new Error('An active paid session entitlement is required.');
  }
  if (meeting.provider !== 'jitsi') throw new Error('This meeting provider is not configured in the COSYevents web client.');
  return { meeting, isHost };
}

async function listBreakoutRooms(admin: ReturnType<typeof serviceClient>, meetingId: string, userId: string, isHost: boolean) {
  const { data: rooms, error } = await admin
    .from('video_breakout_rooms')
    .select('breakout_room_id, label, capacity, status')
    .eq('meeting_id', meetingId)
    .eq('status', 'open')
    .order('created_at', { ascending: true });
  if (error) throw error;

  const result = [];
  for (const room of rooms || []) {
    const { data: assignments, error: assignmentsError } = await admin
      .from('video_breakout_assignments')
      .select('profile_id')
      .eq('meeting_id', meetingId)
      .eq('breakout_room_id', room.breakout_room_id)
      .is('ended_at', null);
    if (assignmentsError) throw assignmentsError;
    const members = assignments || [];
    result.push({
      breakout_room_id: room.breakout_room_id,
      label: room.label,
      capacity: room.capacity,
      active_count: members.length,
      assigned: isHost || members.some(member => member.profile_id === userId)
    });
  }
  return result;
}

async function issueMeetingToken(admin: ReturnType<typeof serviceClient>, user: { id: string; email?: string }, meeting: any, isHost: boolean, providerRoomRef: string, roomLabel: string) {
  const token = await createJaasToken(providerRoomRef, user, isHost);
  return {
    token,
    app_id: JAAS_APP_ID,
    domain: '8x8.vc',
    room_name: providerRoomRef,
    room_label: roomLabel,
    seat_id: null
  };
}

async function handleAction(action: string, body: Record<string, unknown>, userClientInstance: ReturnType<typeof userClient>, admin: ReturnType<typeof serviceClient>, user: { id: string; email?: string }) {
  if (action === 'list') {
    const meetings = await listMeetings(admin, user);
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    return { meetings, role: profile?.role || 'student' };
  }

  const meetingId = String(body.meeting_id || '');
  const { meeting, isHost } = await getAuthorizedMeeting(admin, user, meetingId);

  if (action === 'join') {
    const { data: seats, error } = await userClientInstance.rpc('reserve_speaking_club_seat', { p_meeting_id: meetingId });
    if (error) throw new Error(error.message);
    const seat = Array.isArray(seats) ? seats[0] : seats;
    if (!seat || !seat.seat_id) throw new Error('No seat was reserved.');
    const result = await issueMeetingToken(admin, user, meeting, isHost, meeting.provider_room_ref, 'Main Room');
    result.seat_id = seat.seat_id;
    result.display_name = user.email || 'COSYevents participant';
    result.is_host = isHost;
    return result;
  }

  if (action === 'confirm-join') {
    const seatId = String(body.seat_id || '');
    const { data: seat, error: seatError } = await admin
      .from('video_meeting_seats')
      .select('seat_id, meeting_id, profile_id, status, reservation_expires_at')
      .eq('seat_id', seatId)
      .eq('meeting_id', meetingId)
      .eq('profile_id', user.id)
      .maybeSingle();
    if (seatError) throw seatError;
    if (!seat || seat.status !== 'reserved' || new Date(seat.reservation_expires_at).getTime() <= Date.now()) {
      throw new Error('Your seat reservation expired. Join again to reserve a seat.');
    }
    const { data: confirmed, error } = await admin.rpc('confirm_speaking_club_seat_join', { p_seat_id: seatId });
    if (error) throw error;
    return { joined: Boolean(confirmed) };
  }

  if (action === 'leave') {
    const { data, error } = await userClientInstance.rpc('release_speaking_club_seat', { p_meeting_id: meetingId });
    if (error) throw error;
    return { released: Boolean(data) };
  }

  if (action === 'create-breakouts') {
    if (!isHost) throw new Error('Only the assigned host can create breakout rooms.');
    const count = Number(body.count || 2);
    if (!Number.isInteger(count) || count < 2 || count > 2) throw new Error('Speaking clubs use exactly two breakout rooms.');
    const { data: existing, error: existingError } = await admin
      .from('video_breakout_rooms')
      .select('breakout_room_id')
      .eq('meeting_id', meetingId)
      .eq('status', 'open');
    if (existingError) throw existingError;

    if (!existing || existing.length === 0) {
      const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
      const rows = ['Room A', 'Room B'].map((label, index) => ({
        meeting_id: meetingId,
        session_id: meeting.session_id,
        label,
        provider_room_ref: `cosy-${meetingId.replace(/-/g, '').slice(0, 12)}-breakout-${index + 1}-${suffix}`,
        capacity: 5,
        status: 'open'
      }));
      const { error } = await admin.from('video_breakout_rooms').insert(rows);
      if (error) throw error;
    }
    return { rooms: await listBreakoutRooms(admin, meetingId, user.id, true) };
  }

  if (action === 'assign-breakout') {
    if (!isHost) throw new Error('Only the assigned host can assign breakout rooms.');
    const { data, error } = await userClientInstance.rpc('assign_video_breakout_participant', {
      p_meeting_id: meetingId,
      p_breakout_room_id: String(body.breakout_room_id || ''),
      p_profile_id: String(body.profile_id || '')
    });
    if (error) throw error;
    return { assignment_id: data };
  }

  if (action === 'join-breakout') {
    const breakoutRoomId = String(body.breakout_room_id || '');
    const { data: room, error: roomError } = await admin
      .from('video_breakout_rooms')
      .select('breakout_room_id, label, provider_room_ref, status')
      .eq('meeting_id', meetingId)
      .eq('breakout_room_id', breakoutRoomId)
      .eq('status', 'open')
      .maybeSingle();
    if (roomError) throw roomError;
    if (!room) throw new Error('Breakout room not found or closed.');

    if (!isHost) {
      const { data: assignment, error: assignmentError } = await admin
        .from('video_breakout_assignments')
        .select('assignment_id')
        .eq('meeting_id', meetingId)
        .eq('breakout_room_id', breakoutRoomId)
        .eq('profile_id', user.id)
        .is('ended_at', null)
        .maybeSingle();
      if (assignmentError) throw assignmentError;
      if (!assignment) throw new Error('You are not assigned to this breakout room.');
    }

    const result = await issueMeetingToken(admin, user, meeting, isHost, room.provider_room_ref, room.label);
    result.display_name = user.email || 'COSYevents participant';
    result.is_host = isHost;
    return result;
  }

  if (action === 'leave-breakout') {
    const profileId = body.profile_id ? String(body.profile_id) : null;
    const { data, error } = await userClientInstance.rpc('leave_video_breakout_room', {
      p_meeting_id: meetingId,
      ...(profileId ? { p_profile_id: profileId } : {})
    });
    if (error) throw error;
    return { left: Boolean(data) };
  }

  throw new Error('Unsupported video meeting action.');
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin');
  const headers = responseHeaders(origin);
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Use POST.' }, origin);
  if (origin && !ALLOWED_ORIGINS.has(origin)) return jsonResponse(403, { error: 'Origin not allowed.' }, origin);

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(503, { error: 'Live calls are not configured: Supabase Edge Function secrets are missing.' }, origin);
  }

  try {
    const authorization = request.headers.get('authorization');
    const { client, user } = await authenticate(authorization);
    const body = await request.json();
    const result = await handleAction(String(body.action || ''), body, client, serviceClient(), user);
    return jsonResponse(200, result, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected live meeting error.';
    const forbidden = /entitlement|assigned host|not assigned|sign in|invalid or expired/i.test(message);
    return jsonResponse(forbidden ? 403 : 400, { error: message }, origin);
  }
});
