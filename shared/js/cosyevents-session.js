/* COSYevents session nav — lightweight, replaces the heavy COSYlanguages ui.js shell.
   Builds a clean header matching the hub aesthetic, and provides an interactive
   Slide Deck Presentation system for all session pages. */
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
    ['Basic Speaking Club', 'basic-speaking-club.html']
  ];

  var switcher = '';
  if (lang === 'en') {
    switcher = '<a class="ce-nav-lang" href="' + root.replace(/(sessions\/[^/]+\/)?$/, '') + 'fr/' + '">FR</a>';
  } else {
    switcher = '<a class="ce-nav-lang" href="' + root + '">EN</a>';
  }

  var nav = document.getElementById('cosy-nav');
  if (nav) {
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
    var applyTheme = function() {
      root_.setAttribute('data-theme', dark ? 'dark' : 'light');
      if (btn) btn.textContent = dark ? '☀' : '☾';
    };
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
      nav.querySelectorAll('.ce-nav-links a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.querySelector('.ce-session-nav').classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
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
      .catch(function () {});
  }

  /* ──────────────────────────────────────────────────────────────
     INTERACTIVE SLIDE DECK PRESENTATION SYSTEM
     Converts session sections/rounds into step-by-step slides.
     ────────────────────────────────────────────────────────────── */
  function initSlideDeck() {
    var container = document.querySelector('.session-container') ||
                    document.querySelector('.content-container') ||
                    document.querySelector('.session-grid') ||
                    document.querySelector('main');
    if (!container) return;

    var slides = [];

    // Check Strategy A: explicit .session-section elements (e.g. Basic Speaking Club)
    var explicitSections = container.querySelectorAll('.session-section');
    if (explicitSections.length > 1) {
      explicitSections.forEach(function (el, idx) {
        var h = el.querySelector('h1, h2, h3, h4');
        var title = h ? h.textContent.trim() : ('Slide ' + (idx + 1));
        slides.push({
          element: el,
          title: title
        });
      });
    } else {
      // Check Strategy B: standard COSYevents sessions with rounds / vocabulary / meta
      var roundBlocks = Array.from(container.querySelectorAll('.round-block, .mistake-block'));
      var vocabSection = container.querySelector('#vocabulary, .vocab-grid-10');

      // Group 0: Overview (meta grid, debate duel box, snapshot, intro text)
      var metaGrid = container.querySelector('.session-meta-grid, .debate-duel-box, .theme-box, .perspective-mirror-box, .science-journal-box, .life-ledger-box, .mind-profile-box, .wonder-column-box');
      if (metaGrid) {
        var overviewChildren = [];
        var overviewWrapper = document.createElement('div');
        overviewWrapper.className = 'ce-slide-overview-wrapper';

        var stopsAt = vocabSection || (roundBlocks.length > 0 ? roundBlocks[0] : null);
        var current = container.firstElementChild;
        while (current && current !== stopsAt) {
          var next = current.nextElementSibling;
          if (!current.classList.contains('cosy-breadcrumbs') &&
              !current.classList.contains('back-link') &&
              !current.classList.contains('section-title') &&
              current.tagName !== 'NAV') {
            overviewChildren.push(current);
          }
          current = next;
        }

        if (overviewChildren.length > 0) {
          overviewChildren[0].parentNode.insertBefore(overviewWrapper, overviewChildren[0]);
          overviewChildren.forEach(function (child) {
            overviewWrapper.appendChild(child);
          });
          slides.push({
            element: overviewWrapper,
            title: 'Overview'
          });
        }
      }

      // Group 1: Vocabulary
      if (vocabSection) {
        var vocabTitle = 'Vocabulary';
        var parentSection = vocabSection.closest('section');
        var vocabSlideElem = parentSection || vocabSection;
        slides.push({
          element: vocabSlideElem,
          title: vocabTitle
        });
      }

      // Group 2..N: Round blocks and mistake blocks
      if (roundBlocks.length > 0) {
        roundBlocks.forEach(function (rb) {
          var headerSpan = rb.querySelector('.round-header span, .mistake-header span');
          var titleText = headerSpan ? headerSpan.textContent.trim() : 'Round';
          slides.push({
            element: rb,
            title: titleText
          });
        });
      }
    }

    if (slides.length <= 1) return; // Not enough content to warrant a slide deck

    // Tag slides with classes
    slides.forEach(function (item, idx) {
      item.element.classList.add('ce-slide-item');
      item.element.setAttribute('data-slide-index', idx);
    });

    // Create Slide Navigation Controls Container
    var deckControls = document.createElement('div');
    deckControls.className = 'ce-slide-deck-bar';

    var currentSlideIndex = 0;
    var isSlideMode = true; // Default view mode: Slide presentation mode

    var tabPillsHtml = slides.map(function (s, idx) {
      // Clean up title for pill display (remove leading numbers, dots, spaces)
      var shortTitle = s.title.replace(/^[0-9\.\s:]+/, '').trim();
      if (!shortTitle) shortTitle = s.title.trim();
      if (shortTitle.length > 25) shortTitle = shortTitle.substring(0, 22) + '...';
      return '<button type="button" class="ce-slide-tab ' + (idx === 0 ? 'active' : '') + '" data-slide-goto="' + idx + '">' +
               '<span class="ce-tab-num">' + (idx + 1) + '</span> ' + shortTitle +
             '</button>';
    }).join('');

    deckControls.innerHTML =
      '<div class="ce-slide-deck-header">' +
        '<div class="ce-slide-tabs-scroll">' +
          '<div class="ce-slide-tabs">' + tabPillsHtml + '</div>' +
        '</div>' +
        '<div class="ce-slide-mode-toggle">' +
          '<button type="button" class="ce-view-btn ce-btn-slides active" title="Slide Presentation Mode">📺 Slides</button>' +
          '<button type="button" class="ce-view-btn ce-btn-scroll" title="Scroll View Mode">📜 Scroll</button>' +
        '</div>' +
      '</div>' +
      '<div class="ce-slide-progress-track">' +
        '<div class="ce-slide-progress-fill" style="width: ' + Math.round(1 / slides.length * 100) + '%;"></div>' +
      '</div>' +
      '<div class="ce-slide-deck-footer">' +
        '<button type="button" class="ce-slide-nav-btn ce-prev-btn" disabled>← Previous</button>' +
        '<span class="ce-slide-counter">Slide <strong class="ce-curr-num">1</strong> of ' + slides.length + '</span>' +
        '<button type="button" class="ce-slide-nav-btn ce-next-btn">Next →</button>' +
        '<button type="button" class="ce-slide-fs-btn" title="Fullscreen Mode">⛶ Fullscreen</button>' +
      '</div>';

    // Insert controls above the container (or right below hero)
    var insertTarget = document.querySelector('.session-hero') || container;
    if (insertTarget.classList.contains('session-hero') && insertTarget.nextSibling) {
      insertTarget.parentNode.insertBefore(deckControls, insertTarget.nextSibling);
    } else {
      container.parentNode.insertBefore(deckControls, container);
    }

    var bodyElem = document.body;
    bodyElem.classList.add('ce-slide-deck-present');

    var tabs = deckControls.querySelectorAll('.ce-slide-tab');
    var prevBtn = deckControls.querySelector('.ce-prev-btn');
    var nextBtn = deckControls.querySelector('.ce-next-btn');
    var counterNum = deckControls.querySelector('.ce-curr-num');
    var progressFill = deckControls.querySelector('.ce-slide-progress-fill');
    var slidesBtn = deckControls.querySelector('.ce-btn-slides');
    var scrollBtn = deckControls.querySelector('.ce-btn-scroll');
    var fsBtn = deckControls.querySelector('.ce-slide-fs-btn');

    function updateSlideDisplay() {
      if (!isSlideMode) {
        bodyElem.classList.remove('ce-slide-mode-active');
        slides.forEach(function (s) {
          s.element.classList.remove('ce-slide-active', 'ce-slide-hidden');
        });
        return;
      }

      bodyElem.classList.add('ce-slide-mode-active');

      slides.forEach(function (s, idx) {
        if (idx === currentSlideIndex) {
          s.element.classList.add('ce-slide-active');
          s.element.classList.remove('ce-slide-hidden');
          if (s.element.classList.contains('round-block') || s.element.classList.contains('mistake-block')) {
            s.element.classList.add('open');
            var body = s.element.querySelector('.round-body, .mistake-body');
            if (body) body.style.display = 'block';
          }
        } else {
          s.element.classList.remove('ce-slide-active');
          s.element.classList.add('ce-slide-hidden');
        }
      });

      // Update Tabs
      tabs.forEach(function (tab, idx) {
        if (idx === currentSlideIndex) {
          tab.classList.add('active');
          tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          tab.classList.remove('active');
        }
      });

      // Update Navigation Buttons & Counter
      prevBtn.disabled = currentSlideIndex === 0;
      nextBtn.disabled = currentSlideIndex === slides.length - 1;
      counterNum.textContent = currentSlideIndex + 1;
      progressFill.style.width = Math.round((currentSlideIndex + 1) / slides.length * 100) + '%';
    }

    function goToSlide(idx) {
      if (idx < 0 || idx >= slides.length) return;
      currentSlideIndex = idx;
      updateSlideDisplay();

      deckControls.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Event Listeners for Slide Deck
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var idx = parseInt(tab.getAttribute('data-slide-goto'), 10);
        goToSlide(idx);
      });
    });

    prevBtn.addEventListener('click', function () {
      if (currentSlideIndex > 0) goToSlide(currentSlideIndex - 1);
    });

    nextBtn.addEventListener('click', function () {
      if (currentSlideIndex < slides.length - 1) goToSlide(currentSlideIndex + 1);
    });

    slidesBtn.addEventListener('click', function () {
      isSlideMode = true;
      slidesBtn.classList.add('active');
      scrollBtn.classList.remove('active');
      updateSlideDisplay();
    });

    scrollBtn.addEventListener('click', function () {
      isSlideMode = false;
      scrollBtn.classList.add('active');
      slidesBtn.classList.remove('active');
      updateSlideDisplay();
    });

    fsBtn.addEventListener('click', function () {
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });

    // Keyboard Arrow Navigation
    document.addEventListener('keydown', function (e) {
      if (!isSlideMode) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName) !== -1) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentSlideIndex < slides.length - 1) {
          e.preventDefault();
          goToSlide(currentSlideIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentSlideIndex > 0) {
          e.preventDefault();
          goToSlide(currentSlideIndex - 1);
        }
      }
    });

    // Initialize display state
    updateSlideDisplay();
  }

  // Lighter Footer Note for Gated Session Pages
  function renderGatedFooterNote() {
    if (document.querySelector('.cosy-gated-ecosystem-note')) return;
    var footer = document.querySelector('footer');
    if (!footer) return;

    var note = document.createElement('div');
    note.className = 'cosy-gated-ecosystem-note';
    note.innerHTML = 'Part of the <a href="https://cosylanguages.github.io/COSYlanguages/" target="_blank" rel="noopener">COSYlanguages</a> ecosystem &bull; Explore <a href="https://cosylanguages.github.io/COSYtools/" target="_blank" rel="noopener">COSYtools 🔎</a> &bull; <a href="https://cosylanguages.github.io/COSYgames/" target="_blank" rel="noopener">COSYgames 🎮</a>';

    footer.appendChild(note);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      checkEventConversion();
      initSlideDeck();
      renderGatedFooterNote();
    });
  } else {
    checkEventConversion();
    initSlideDeck();
    renderGatedFooterNote();
  }
})();
