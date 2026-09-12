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

  // Lesson Conversion Banner logic
  function renderConversionBanner(eventData) {
    if (!eventData || !eventData.conversionStatus) return;
    var status = eventData.conversionStatus;
    if (status !== 'converted' && status !== 'planned') return;

    var container = document.querySelector('.content-container') ||
                    document.querySelector('main') ||
                    document.body;
    if (!container) return;

    var banner = document.createElement('div');
    banner.className = 'ce-conversion-banner';
    banner.style.cssText = 'background: var(--cosy-color-honey-pale, #fff8e7); border: 1.5px solid var(--cosy-color-amber, #945e05); border-radius: 12px; padding: 0.9rem 1.25rem; margin: 1rem 0 1.5rem 0; font-size: 0.92rem; color: var(--cosy-color-amber-dark, #7d4d03); display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; box-shadow: 0 2px 8px rgba(0,0,0,0.05); font-family: var(--cosy-font-sans, sans-serif);';

    var textSpan = document.createElement('span');
    textSpan.style.cssText = 'font-weight: 600; flex: 1; min-width: 200px;';

    if (status === 'converted') {
      var linkUrl = eventData.convertedLessonUrl || '#';
      textSpan.innerHTML = '🎓 This session became a full COSYplatform lesson &rarr; <a href="' + linkUrl + '" target="_blank" rel="noopener" style="color: var(--cosy-color-amber-dark, #7d4d03); text-decoration: underline; font-weight: 700;">' + linkUrl + '</a>';
    } else if (status === 'planned') {
      textSpan.innerHTML = '⏳ This topic is scheduled to become a lesson soon.';
    }

    banner.appendChild(textSpan);

    // Insert banner at top of main container or right after hero
    var hero = document.querySelector('.session-hero') || document.querySelector('header');
    if (hero && hero.nextSibling) {
      hero.parentNode.insertBefore(banner, hero.nextSibling);
    } else {
      container.insertBefore(banner, container.firstChild);
    }
  }

  function checkEventConversion() {
    var eventsPath = root + 'shared/calendar-data/events.json';
    fetch(eventsPath)
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (events) {
        if (!events || !Array.isArray(events)) return;
        var currentPath = window.location.pathname;
        var matchedEvent = events.find(function (evt) {
          if (!evt.materials) return false;
          try {
            var urlObj = new URL(evt.materials);
            return urlObj.pathname.endsWith(currentPath.split('/').slice(-2).join('/')) ||
                   currentPath.endsWith(urlObj.pathname.split('/').slice(-2).join('/'));
          } catch (e) {
            return evt.materials.indexOf(currentPath) !== -1 || currentPath.indexOf(evt.materials) !== -1;
          }
        });

        if (matchedEvent) {
          renderConversionBanner(matchedEvent);
        }
      })
      .catch(function (err) {
        // Silently ignore fetch errors if offline or relative path unresolvable
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkEventConversion);
  } else {
    checkEventConversion();
  }
})();
