/**
 * COSYevents club background music.
 *
 * Plays a low-volume, shuffled playlist (shared/audio/music/background1-9.mp3) while a visitor is
 * inside a speaking club. Migrated from the legacy COSYlanguagesss ui.js (setupWonderMusic).
 *
 * - Starts automatically on club pages. If the browser blocks autoplay, it starts on the first
 *   click, key press or touch.
 * - Shuffled queue, position and the on/off choice are kept in sessionStorage so the music carries
 *   from page to page inside one visit, and stays off once the visitor turns it off.
 * - Hub pages get a toggle button in their hero; every other club page gets a small floating
 *   toggle so the music can always be paused.
 * - Voiceovers lower the music via COSYClubMusic.duck() / unduck().
 *
 * Loaded by shared/js/cosyevents-session.js on club paths, or directly with a <script> tag.
 */
(function () {
  'use strict';
  if (window.COSYClubMusic) return;

  var CLUB_PATH = /speaking-clubs|i-couldnt-help-but-wonder|keeping-up-with-science|lets-celebrate|the-greatest-quotes|mind-matters|my-life-with-without|debatable-relatable|if-you-were|long-reads|premium-events\/clubs\//;
  var TRACKS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var VOLUME = 0.15;
  var DUCKED_VOLUME = 0.03;
  var K_QUEUE = 'cosy_bg_music_queue';
  var K_INDEX = 'cosy_bg_music_index';
  var K_TIME = 'cosy_wonder_music_time';
  var K_PLAYING = 'cosy_wonder_music_playing';

  var pathname = window.location.pathname;
  if (!CLUB_PATH.test(pathname)) return;

  function ss(method, key, value) {
    try {
      if (method === 'get') return window.sessionStorage.getItem(key);
      if (method === 'set') window.sessionStorage.setItem(key, value);
    } catch (e) {}
    return null;
  }

  function rootPrefix() {
    var me = document.currentScript;
    var src = me && me.getAttribute('src');
    if (!src) {
      var scripts = document.scripts || [];
      for (var i = scripts.length - 1; i >= 0; i--) {
        var s = scripts[i].getAttribute('src') || '';
        if (s.indexOf('club-music.js') !== -1) { src = s; break; }
      }
    }
    if (!src) return '../../';
    return src.replace('shared/js/club-music.js', '');
  }
  var root = rootPrefix();

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function playlist() {
    var queue = null;
    try { queue = JSON.parse(ss('get', K_QUEUE) || 'null'); } catch (e) {}
    if (!Array.isArray(queue) || queue.length !== TRACKS.length) {
      queue = shuffle(TRACKS);
      ss('set', K_QUEUE, JSON.stringify(queue));
    }
    var index = parseInt(ss('get', K_INDEX) || '0', 10);
    if (isNaN(index) || index < 0 || index >= queue.length) {
      index = 0;
      ss('set', K_INDEX, '0');
    }
    return { queue: queue, index: index };
  }

  function trackUrl(n) { return root + 'shared/audio/music/background' + n + '.mp3'; }

  var state = playlist();
  var audio = new Audio(trackUrl(state.queue[state.index] || 1));
  audio.loop = false;
  audio.volume = VOLUME;
  window.cosyWonderAudio = audio; // legacy name, kept for compatibility

  var saved = parseFloat(ss('get', K_TIME) || '');
  if (!isNaN(saved) && saved > 0) {
    try { audio.currentTime = saved; } catch (e) {}
  }

  var ducked = false;
  var failures = 0;

  function muted() { return ss('get', K_PLAYING) === 'false'; }

  function nextTrack() {
    var s = playlist();
    var next = s.index + 1;
    var queue = s.queue;
    if (next >= queue.length) { queue = shuffle(TRACKS); next = 0; }
    ss('set', K_QUEUE, JSON.stringify(queue));
    ss('set', K_INDEX, String(next));
    ss('set', K_TIME, '0');
    audio.src = trackUrl(queue[next]);
    audio.currentTime = 0;
    if (!muted()) audio.play().catch(function () {});
  }

  audio.addEventListener('ended', function () { failures = 0; nextTrack(); });
  audio.addEventListener('error', function () {
    // A missing/broken track should not stall the playlist; give up after one full lap.
    failures++;
    if (failures < TRACKS.length) nextTrack();
  });
  audio.addEventListener('timeupdate', function () {
    if (!audio.paused) ss('set', K_TIME, String(audio.currentTime));
  });
  window.addEventListener('beforeunload', function () {
    if (!audio.paused) ss('set', K_TIME, String(audio.currentTime));
    ss('set', K_PLAYING, String(!audio.paused));
  });

  // Toggle button -------------------------------------------------------------------------------
  var lang = /\/fr\//.test(pathname) ? 'fr' : /\/ru\//.test(pathname) ? 'ru' : 'en';
  var LABELS = {
    en: { play: '\uD83C\uDFB5 Play Background Music', pause: '\uD83C\uDFB5 Pause Background Music' },
    fr: { play: '\uD83C\uDFB5 Jouer la musique d\u2019ambiance', pause: '\uD83C\uDFB5 Suspendre la musique d\u2019ambiance' },
    ru: { play: '\uD83C\uDFB5 \u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0444\u043E\u043D\u043E\u0432\u043E\u0435 \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435', pause: '\uD83C\uDFB5 \u041F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0444\u043E\u043D\u043E\u0432\u043E\u0435 \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435' }
  }[lang];

  var buttons = [];
  function paint() {
    var on = !audio.paused && !muted();
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].textContent = on ? LABELS.pause : LABELS.play;
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function toggle() {
    if (audio.paused) {
      ss('set', K_PLAYING, 'true');
      audio.play().then(paint).catch(function () { paint(); });
    } else {
      audio.pause();
      ss('set', K_PLAYING, 'false');
      paint();
    }
  }

  function addStyles() {
    if (document.getElementById('cosy-club-music-styles')) return;
    var st = document.createElement('style');
    st.id = 'cosy-club-music-styles';
    st.textContent =
      '.cosy-club-music-btn{font:600 0.9rem/1.2 system-ui,sans-serif;padding:.6rem 1.1rem;border-radius:999px;border:1px solid #087A80;background:#087A80;color:#fff;cursor:pointer}' +
      '.cosy-club-music-btn:hover{background:#2e1f70}' +
      '.cosy-club-music-btn:focus-visible{outline:3px solid #FFC857;outline-offset:2px}' +
      '.cosy-club-music-float{position:fixed;right:16px;bottom:16px;z-index:9000;box-shadow:0 4px 14px rgba(0,0,0,.25);font-size:.8rem;padding:.5rem .9rem}';
    document.head.appendChild(st);
  }

  function makeButton(floating) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'cosy-club-music-btn' + (floating ? ' cosy-club-music-float' : '');
    b.addEventListener('click', toggle);
    buttons.push(b);
    return b;
  }

  function mountButton() {
    if (document.getElementById('cosy-club-music-toggle')) return;
    addStyles();
    var isSession = /\/sessions\//.test(pathname);
    var hero = !isSession && (document.querySelector('.club-hero') || document.querySelector('.hero-left') || document.querySelector('.hero'));
    var wrap = document.createElement('div');
    wrap.id = 'cosy-club-music-toggle';
    if (hero) {
      wrap.style.marginTop = '1.5rem';
      wrap.appendChild(makeButton(false));
      hero.appendChild(wrap);
    } else {
      wrap.appendChild(makeButton(true));
      document.body.appendChild(wrap);
    }
    paint();
  }

  // Autoplay -------------------------------------------------------------------------------------
  function start() {
    if (muted()) { audio.pause(); paint(); return; }
    audio.play().then(function () {
      ss('set', K_PLAYING, 'true');
      paint();
    }).catch(function () {
      var kick = function () {
        if (muted()) return release();
        audio.play().then(function () { ss('set', K_PLAYING, 'true'); paint(); release(); }).catch(function () {});
      };
      var release = function () {
        document.removeEventListener('click', kick);
        document.removeEventListener('keydown', kick);
        document.removeEventListener('touchstart', kick);
      };
      document.addEventListener('click', kick);
      document.addEventListener('keydown', kick);
      document.addEventListener('touchstart', kick);
    });
  }

  function init() { mountButton(); start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.COSYClubMusic = {
    duck: function () {
      ducked = true;
      audio.volume = DUCKED_VOLUME;
      if (!muted() && audio.paused) audio.play().catch(function () {});
    },
    unduck: function () { ducked = false; audio.volume = VOLUME; },
    isDucked: function () { return ducked; },
    toggle: toggle,
    audio: audio
  };
})();
