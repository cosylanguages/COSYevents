/* COSYevents session nav — lightweight, replaces the heavy COSYlanguages ui.js shell.
   Builds a clean header matching the hub aesthetic. No dictionary/calendar/embedded-reader. */
(function () {
  'use strict';

  function rootPrefix() {
    var me = document.currentScript;
    var src = me && me.getAttribute('src');
    if (!src) {
      var scripts = document.scripts;
      for (var i = scripts.length - 1; i >= 0; i--) {
        var s = scripts[i].getAttribute('src') || '';
        if (s.indexOf('cosyevents-session.js') !== -1) { src = s; break; }
      }
    }
    if (!src) return '../../';
    return src.replace('shared/js/cosyevents-session.js', '');
  }

  var root = rootPrefix();
  var path = location.pathname;
  var lang = /\/(fr|ru)\//.test(path) ? (path.match(/\/(fr|ru)\//)[1]) : 'en';

  var clubs = [
    ['Mind Matters', 'mind-matters.html'],
    ['The Greatest Quotes', 'the-greatest-quotes.html'],
    ["I Couldn't Help But Wonder", 'i-couldnt-help-but-wonder.html'],
    ['Debatable & Relatable', 'debatable-relatable.html'],
    ['Keeping Up with Science', 'keeping-up-with-science.html'],
    ["Let's Celebrate", 'lets-celebrate.html'],
    ['My Life With & Without', 'my-life-with-without.html'],
    ['If You Were', 'if-you-were.html'],
    ['Cinema Club', 'cinema-club.html'],
    ['Karaoke Club', 'karaoke-club.html'],
    ['Long Reads', 'long-reads.html'],
  ];

  var langLinks = {
    en: [['FR', root.replace(/(sessions\/[^/]+\/)?$/, '') + 'fr/' + (location.pathname.split('/sessions/')[1] || 'index.html').replace(/^.*?sessions\//, 'sessions/')]],
    fr: [['EN', root.replace(/\/fr\//, '/')]],
    ru: [['EN', root.replace(/\/ru\//, '/')]]
  };
  // simpler language switcher: toggle to EN from fr/ru, or to fr from en
  var switcher = '';
  if (lang === 'en') {
    switcher = '<a class="ce-nav-lang" href="' + root.replace(/(sessions\/[^/]+\/)?$/, '') + 'fr/' + '">FR</a>';
  } else {
    switcher = '<a class="ce-nav-lang" href="' + root + '">EN</a>';
  }

  var nav = document.getElementById('cosy-nav');
  if (!nav) return;

  var html =
    '<header class="ce-session-nav">' +
      '<a class="ce-nav-brand" href="' + root + 'index.html">' +
        '<img src="' + root + 'shared/images/logo.png" alt="COSYlanguages logo" />' +
        '<span>COSY Events</span>' +
      '</a>' +
      '<nav class="ce-nav-links" aria-label="Event categories">' +
        clubs.map(function (c) {
          return '<a href="' + root + c[1] + '">' + c[0] + '</a>';
        }).join('') +
      '</nav>' +
      '<div class="ce-nav-right">' +
        switcher +
        '<button class="ce-theme-btn" type="button" aria-label="Toggle dark mode"></button>' +
        '<button class="ce-nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">☰</button>' +
      '</div>' +
    '</header>';

  nav.innerHTML = html;

  // Theme toggle
  var btn = nav.querySelector('.ce-theme-btn');
  var root_ = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem('ce-theme'); } catch (e) {}
  var dark = stored === 'dark';
  function applyTheme() {
    root_.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (btn) btn.textContent = dark ? '☀' : '☾';
  }
  applyTheme();
  if (btn) {
    btn.addEventListener('click', function () {
      dark = !dark;
      try { localStorage.setItem('ce-theme', dark ? 'dark' : 'light'); } catch (e) {}
      applyTheme();
    });
  }

  // Mobile hamburger toggle
  var toggle = nav.querySelector('.ce-nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.querySelector('.ce-session-nav').classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close menu when a link is tapped
    nav.querySelectorAll('.ce-nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.querySelector('.ce-session-nav').classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
