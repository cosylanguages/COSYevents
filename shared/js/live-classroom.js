(function () {
  'use strict';

  var config = window.COSY_EVENTS_CONFIG || {};
  var state = {
    client: null,
    user: null,
    profile: null,
    meeting: null,
    seatId: null,
    videoApi: null,
    jaasScriptPromise: null
  };

  var statusEl = document.getElementById('live-status');
  var authPanel = document.getElementById('live-auth-panel');
  var sessionPanel = document.getElementById('live-session-panel');
  var roomPanel = document.getElementById('live-room-panel');
  var loginForm = document.getElementById('live-login-form');
  var loginButton = document.getElementById('live-login-button');
  var emailInput = document.getElementById('live-email');
  var passwordInput = document.getElementById('live-password');
  var meetingList = document.getElementById('live-meeting-list');
  var videoPlaceholder = document.getElementById('live-video-placeholder');

  function setStatus(message, stateName) {
    statusEl.textContent = message;
    statusEl.dataset.state = stateName || 'info';
  }

  function configuredClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('The Supabase browser SDK did not load. Check your network connection and reload.');
    }
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY.startsWith('REPLACE_WITH')) {
      throw new Error('Live calls are not configured yet. An administrator must add the matching Supabase project URL and public anon key.');
    }

    var projectRef;
    var tokenRef;
    try {
      projectRef = new URL(config.SUPABASE_URL).hostname.split('.')[0];
      tokenRef = JSON.parse(atob(config.SUPABASE_ANON_KEY.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).ref;
    } catch (error) {
      throw new Error('The Supabase configuration is invalid. Check the project URL and public anon key.');
    }
    if (projectRef !== tokenRef) {
      throw new Error('The Supabase URL and anon key belong to different projects. Live sign-in is disabled.');
    }

    return window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  function showSignedOut() {
    authPanel.hidden = false;
    sessionPanel.hidden = true;
    roomPanel.hidden = true;
    setStatus('Sign in with your COSYlanguages account to see booked live sessions.', 'info');
  }

  function showSignedIn(user, profile) {
    state.user = user;
    state.profile = profile;
    authPanel.hidden = true;
    sessionPanel.hidden = false;
    roomPanel.hidden = true;
    document.getElementById('live-user-label').textContent = user.email || 'Signed in';
    setStatus('Signed in. Checking your session access…', 'ready');
    loadMeetings();
  }

  async function resolveProfile(user) {
    var result = await state.client
      .from('profiles')
      .select('id, role, hosted_sessions')
      .eq('id', user.id)
      .maybeSingle();
    if (result.error) throw result.error;
    return result.data || { id: user.id, role: 'student', hosted_sessions: [] };
  }

  async function onSession(session) {
    if (!session || !session.user) {
      state.user = null;
      state.profile = null;
      showSignedOut();
      return;
    }
    try {
      var profile = await resolveProfile(session.user);
      showSignedIn(session.user, profile);
    } catch (error) {
      setStatus('Could not load your COSYlanguages profile. ' + error.message, 'error');
    }
  }

  async function loadMeetings() {
    meetingList.replaceChildren();
    var loading = document.createElement('p');
    loading.className = 'live-meeting-empty';
    loading.textContent = 'Loading your speaking club sessions…';
    meetingList.append(loading);

    var result = await state.client.functions.invoke('video-meeting-token', { body: { action: 'list' } });
    if (result.error) {
      meetingList.replaceChildren();
      setStatus('Could not load live sessions. ' + result.error.message, 'error');
      return;
    }

    var meetings = result.data && Array.isArray(result.data.meetings) ? result.data.meetings : [];
    meetingList.replaceChildren();
    if (meetings.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'live-meeting-empty';
      empty.textContent = 'No speaking club live sessions are scheduled for your account right now.';
      meetingList.append(empty);
      setStatus('No joinable live sessions found.', 'info');
      return;
    }

    meetings.forEach(renderMeetingCard);
    setStatus('Your session access is ready.', 'ready');
  }

  function renderMeetingCard(meeting) {
    var card = document.createElement('article');
    card.className = 'live-meeting-card';
    var details = document.createElement('div');
    var title = document.createElement('h3');
    title.textContent = meeting.title || 'Speaking Club';
    var detailText = document.createElement('p');
    var date = meeting.starts_at ? new Date(meeting.starts_at).toLocaleString() : 'Scheduled session';
    var seats = `${meeting.active_seats || 0}/${meeting.capacity || 10} seats`;
    detailText.textContent = `${date} · ${meeting.level || 'Level not specified'} · ${seats}`;
    details.append(title, detailText);

    var join = document.createElement('button');
    join.type = 'button';
    join.textContent = meeting.my_seat_status === 'joined' ? 'Rejoin video' : 'Join video';
    join.addEventListener('click', function () { joinMeeting(meeting); });
    card.append(details, join);
    meetingList.append(card);
  }

  async function ensureJaasApi() {
    if (window.JitsiMeetExternalAPI) return;
    if (!state.jaasScriptPromise) {
      state.jaasScriptPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://8x8.vc/external_api.js';
        script.onload = resolve;
        script.onerror = function () { reject(new Error('Could not load the JaaS video client.')); };
        document.head.append(script);
      });
    }
    await state.jaasScriptPromise;
    if (!window.JitsiMeetExternalAPI) throw new Error('The JaaS video client did not initialize.');
  }

  async function joinMeeting(meeting) {
    setStatus('Reserving your seat and preparing the secure video room…', 'info');
    var result = await state.client.functions.invoke('video-meeting-token', {
      body: { action: 'join', meeting_id: meeting.meeting_id }
    });
    if (result.error || !result.data || !result.data.token) {
      setStatus((result.data && result.data.error) || (result.error && result.error.message) || 'The live room is not ready.', 'error');
      return;
    }

    try {
      await ensureJaasApi();
      state.meeting = meeting;
      state.seatId = result.data.seat_id;
      document.getElementById('live-room-title').textContent = meeting.title || 'Speaking Club';
      document.getElementById('live-room-details').textContent = `${meeting.level || 'All levels'} · Maximum ${meeting.capacity || 10} participants, including the host`;
      sessionPanel.hidden = true;
      roomPanel.hidden = false;
      videoPlaceholder.hidden = true;
      state.videoApi = new window.JitsiMeetExternalAPI(result.data.domain, {
        roomName: `${result.data.app_id}/${result.data.room_name}`,
        parentNode: document.getElementById('jaas-container'),
        jwt: result.data.token,
        userInfo: {
          displayName: result.data.display_name,
          email: state.user.email
        },
        configOverwrite: {
          prejoinPageEnabled: true,
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          disableDeepLinking: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'raisehand', 'tileview', 'hangup']
        }
      });
      state.videoApi.addEventListener('videoConferenceJoined', confirmJoined);
      state.videoApi.addEventListener('readyToClose', leaveMeeting);
      setStatus('Video room opened. Camera and microphone start off; turn them on when ready.', 'ready');
    } catch (error) {
      setStatus(error.message, 'error');
    }
  }

  async function confirmJoined() {
    if (!state.seatId) return;
    var result = await state.client.functions.invoke('video-meeting-token', {
      body: { action: 'confirm-join', seat_id: state.seatId }
    });
    if (result.error) setStatus('Video is connected, but seat confirmation failed. Please leave and retry.', 'error');
  }

  async function leaveMeeting() {
    if (state.videoApi) {
      var api = state.videoApi;
      state.videoApi = null;
      api.dispose();
    }
    if (state.seatId) {
      await state.client.functions.invoke('video-meeting-token', {
        body: { action: 'leave', meeting_id: state.meeting.meeting_id }
      });
    }
    state.seatId = null;
    state.meeting = null;
    roomPanel.hidden = true;
    videoPlaceholder.hidden = false;
    showSignedIn(state.user, state.profile);
  }

  async function init() {
    try {
      state.client = configuredClient();
    } catch (error) {
      loginButton.disabled = true;
      authPanel.hidden = false;
      setStatus(error.message, 'error');
      return;
    }

    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      loginButton.disabled = true;
      loginButton.textContent = 'Signing in…';
      var result = await state.client.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passwordInput.value
      });
      loginButton.disabled = false;
      loginButton.textContent = 'Sign in';
      if (result.error) {
        setStatus(result.error.message, 'error');
        return;
      }
      passwordInput.value = '';
      await onSession(result.data.session);
    });

    document.getElementById('live-refresh-button').addEventListener('click', loadMeetings);
    document.getElementById('live-leave-button').addEventListener('click', leaveMeeting);
    document.getElementById('create-breakouts-button').addEventListener('click', createBreakouts);

    state.client.auth.onAuthStateChange(function (_event, session) {
      onSession(session);
    });
    var sessionResult = await state.client.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    await onSession(sessionResult.data.session);
  }

  async function createBreakouts() {
    if (!state.meeting) return;
    var result = await state.client.functions.invoke('video-meeting-token', {
      body: { action: 'create-breakouts', meeting_id: state.meeting.meeting_id, count: 2 }
    });
    if (result.error || !result.data) {
      setStatus((result.data && result.data.error) || (result.error && result.error.message) || 'Could not create breakout rooms.', 'error');
      return;
    }
    setStatus('Two breakout rooms are open. Participants can now enter their assigned room.', 'ready');
    renderBreakoutRooms(result.data.rooms || []);
  }

  function renderBreakoutRooms(rooms) {
    var container = document.getElementById('breakout-room-list');
    container.replaceChildren();
    rooms.forEach(function (room) {
      var row = document.createElement('div');
      row.className = 'breakout-room-row';
      var label = document.createElement('span');
      label.textContent = `${room.label} · ${room.active_count || 0}/${room.capacity}`;
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = room.assigned ? 'Enter room' : 'Not assigned';
      button.disabled = !room.assigned;
      button.addEventListener('click', function () { joinBreakout(room.breakout_room_id); });
      row.append(label, button);
      container.append(row);
    });
  }

  async function joinBreakout(breakoutRoomId) {
    if (!state.meeting) return;
    var result = await state.client.functions.invoke('video-meeting-token', {
      body: { action: 'join-breakout', meeting_id: state.meeting.meeting_id, breakout_room_id: breakoutRoomId }
    });
    if (result.error || !result.data || !result.data.token) {
      setStatus((result.data && result.data.error) || (result.error && result.error.message) || 'Could not join breakout room.', 'error');
      return;
    }
    if (state.videoApi) state.videoApi.dispose();
    state.videoApi = new window.JitsiMeetExternalAPI(result.data.domain, {
      roomName: `${result.data.app_id}/${result.data.room_name}`,
      parentNode: document.getElementById('jaas-container'),
      jwt: result.data.token,
      userInfo: { displayName: result.data.display_name, email: state.user.email },
      configOverwrite: { prejoinPageEnabled: false, startWithAudioMuted: true, startWithVideoMuted: true, disableDeepLinking: true },
      interfaceConfigOverwrite: { TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'raisehand', 'tileview', 'hangup'] }
    });
    state.videoApi.addEventListener('readyToClose', leaveMeeting);
    setStatus(`Joined ${result.data.room_label}.`, 'ready');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
