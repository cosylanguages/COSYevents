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

  // Inject favicon, apple-touch-icon, manifest, and theme-color into head if missing
  (function injectHeadAssets() {
    if (!document.querySelector('link[rel="icon"]')) {
      var fav = document.createElement('link');
      fav.rel = 'icon';
      fav.type = 'image/png';
      fav.sizes = '32x32';
      fav.href = root + 'shared/assets/favicon-32.png';
      document.head.appendChild(fav);
    }
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      var appleFav = document.createElement('link');
      appleFav.rel = 'apple-touch-icon';
      appleFav.href = root + 'shared/assets/apple-touch-icon.png';
      document.head.appendChild(appleFav);
    }
    if (!document.querySelector('link[rel="manifest"]')) {
      var manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = root + 'manifest.json';
      document.head.appendChild(manifest);
    }
    if (!document.querySelector('meta[name="theme-color"]')) {
      var themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      themeMeta.content = '#416b49';
      document.head.appendChild(themeMeta);
    }
  })();

  // Dynamically ensure cosyevents-lang.js, cosy-auth.js, auth-sso.js, and cms-editor.js are loaded
  if (!window.CosyLang && !document.querySelector('script[src*="cosyevents-lang.js"]')) {
    var langScript = document.createElement('script');
    langScript.src = root + 'shared/js/cosyevents-lang.js';
    langScript.defer = true;
    document.head.appendChild(langScript);
  }
  if (!window.CosyAuth && !document.querySelector('script[src*="cosy-auth.js"]')) {
    var authScript = document.createElement('script');
    authScript.src = root + 'shared/js/cosy-auth.js';
    authScript.defer = true;
    document.head.appendChild(authScript);
  }
  if (!window.AuthSSO && !document.querySelector('script[src*="auth-sso.js"]')) {
    var ssoScript = document.createElement('script');
    ssoScript.src = root + 'shared/js/auth-sso.js';
    ssoScript.defer = true;
    document.head.appendChild(ssoScript);
  }
  if (!window.CMSEditor && !document.querySelector('script[src*="cms-editor.js"]')) {
    var cmsScript = document.createElement('script');
    cmsScript.src = root + 'shared/js/cms-editor.js';
    cmsScript.defer = true;
    document.head.appendChild(cmsScript);
  }

  var DICTIONARY = {
    en: {
      clubs: 'Clubs',
      overview: 'Overview',
      vocabulary: 'Vocabulary',
      slides_btn: '📺 Slides',
      slides_title: 'Slide Presentation Mode',
      scroll_btn: '📜 Scroll',
      scroll_title: 'Scroll View Mode',
      prev_btn: '← Previous',
      next_btn: 'Next →',
      fullscreen_btn: '⛶ Fullscreen',
      fullscreen_title: 'Fullscreen Mode',
      slide_counter_prefix: 'Slide',
      slide_counter_of: 'of',
      gated_notes_title: "Facilitator's Notes",
      gated_rec_title: 'Session Recording',
      gated_default_title: 'Exclusive Session Content',
      gated_desc: 'Access to facilitator notes and session recordings is reserved for enrolled students and teachers.',
      gated_btn: 'Register / Login via COSYlanguages 🔐',
      privacy_text: 'Privacy &amp; legal notice',
      ecosystem_note_part: 'Part of the',
      ecosystem_note_explore: 'Explore',
      lesson_converted: '🎓 This session became a full COSYplatform lesson &rarr;',
      lesson_planned: '⏳ This topic is scheduled to become a lesson soon.'
    },
    fr: {
      clubs: 'Clubs',
      overview: 'Aperçu',
      vocabulary: 'Vocabulaire',
      slides_btn: '📺 Diapositives',
      slides_title: 'Mode présentation par diapositives',
      scroll_btn: '📜 Défilement',
      scroll_title: 'Mode vue défilante',
      prev_btn: '← Précédent',
      next_btn: 'Suivant →',
      fullscreen_btn: '⛶ Plein écran',
      fullscreen_title: 'Mode plein écran',
      slide_counter_prefix: 'Diapositive',
      slide_counter_of: 'sur',
      gated_notes_title: 'Notes de l’animateur',
      gated_rec_title: 'Enregistrement de la session',
      gated_default_title: 'Contenu réservé de la session',
      gated_desc: 'L’accès aux notes de l’animateur et aux enregistrements est réservé aux élèves inscrits et aux enseignants.',
      gated_btn: 'S’inscrire / Se connecter via COSYlanguages 🔐',
      privacy_text: 'Politique de confidentialité &amp; mentions légales',
      ecosystem_note_part: 'Fait partie de l’écosystème',
      ecosystem_note_explore: 'Explorer',
      lesson_converted: '🎓 Cette session est devenue une leçon complète COSYplatform &rarr;',
      lesson_planned: '⏳ Ce sujet sera bientôt transformé en leçon.'
    },
    it: {
      clubs: 'Club',
      overview: 'Panoramica',
      vocabulary: 'Vocabolario',
      slides_btn: '📺 Diapositive',
      slides_title: 'Modalità presentazione diapositive',
      scroll_btn: '📜 Scorrimento',
      scroll_title: 'Modalità vista a scorrimento',
      prev_btn: '← Precedente',
      next_btn: 'Successivo →',
      fullscreen_btn: '⛶ Schermo intero',
      fullscreen_title: 'Modalità schermo intero',
      slide_counter_prefix: 'Diapositiva',
      slide_counter_of: 'di',
      gated_notes_title: 'Note del facilitatore',
      gated_rec_title: 'Registrazione della sessione',
      gated_default_title: 'Contenuto esclusivo della sessione',
      gated_desc: 'L’accesso alle note del facilitatore e alle registrazioni è riservato agli studenti iscritti e agli insegnanti.',
      gated_btn: 'Registrati / Accedi via COSYlanguages 🔐',
      privacy_text: 'Informativa sulla privacy &amp; note legali',
      ecosystem_note_part: 'Parte dell’ecosistema',
      ecosystem_note_explore: 'Esplora',
      lesson_converted: '🎓 Questa sessione è diventata una lezione completa su COSYplatform &rarr;',
      lesson_planned: '⏳ Questo argomento diventerà presto una lezione.'
    },
    ru: {
      clubs: 'Клубы',
      overview: 'Обзор',
      vocabulary: 'Словарь',
      slides_btn: '📺 Слайды',
      slides_title: 'Режим презентации слайдов',
      scroll_btn: '📜 Прокрутка',
      scroll_title: 'Режим непрерывного просмотра',
      prev_btn: '← Назад',
      next_btn: 'Вперед →',
      fullscreen_btn: '⛶ Полноэкранный режим',
      fullscreen_title: 'Полноэкранный режим',
      slide_counter_prefix: 'Слайд',
      slide_counter_of: 'из',
      gated_notes_title: 'Заметки ведущего',
      gated_rec_title: 'Запись сессии',
      gated_default_title: 'Эксклюзивный контент сессии',
      gated_desc: 'Доступ к заметкам ведущего и записям сессий ограничен зачисленными студентами и преподавателями.',
      gated_btn: 'Зарегистрироваться / Войти через COSYlanguages 🔐',
      privacy_text: 'Политика конфиденциальности и правовая информация',
      ecosystem_note_part: 'Часть экосистемы',
      ecosystem_note_explore: 'Исследовать',
      lesson_converted: '🎓 Эта сессия стала полным уроком на COSYplatform &rarr;',
      lesson_planned: '⏳ Скоро эта тема станет полноценным уроком.'
    },
    el: {
      clubs: 'Λέσχες',
      overview: 'Επισκόπηση',
      vocabulary: 'Λεξιλόγιο',
      slides_btn: '📺 Διαφάνειες',
      slides_title: 'Λειτουργία παρουσίασης διαφανειών',
      scroll_btn: '📜 Κύλιση',
      scroll_title: 'Λειτουργία προβολής κύλισης',
      prev_btn: '← Προηγούμενο',
      next_btn: 'Επόμενο →',
      fullscreen_btn: '⛶ Πλήρης οθόνη',
      fullscreen_title: 'Λειτουργία πλήρους οθόνης',
      slide_counter_prefix: 'Διαφάνεια',
      slide_counter_of: 'από',
      gated_notes_title: 'Σημειώσεις συντονιστή',
      gated_rec_title: 'Βιντεοσκόπηση συνεδρίας',
      gated_default_title: 'Αποκλειστικό περιεχόμενο συνεδρίας',
      gated_desc: 'Η πρόσβαση στις σημειώσεις συντονιστή και στις εγγραφές προορίζεται αποκλειστικά για εγγεγραμμένους μαθητές και καθηγητές.',
      gated_btn: 'Εγγραφή / Σύνδεση μέσω COSYlanguages 🔐',
      privacy_text: 'Πολιτική απορρήτου &amp; νομική σημείωση',
      ecosystem_note_part: 'Μέρος του οικοσυστήματος',
      ecosystem_note_explore: 'Εξερευνήστε',
      lesson_converted: '🎓 Αυτή η συνεδρία έγινε πλήρες μάθημα στο COSYplatform &rarr;',
      lesson_planned: '⏳ Αυτό το θέμα προγραμματίζεται να γίνει μάθημα σύντομα.'
    }
  };

  function getPageLang() {
    var htmlLang = document.documentElement.getAttribute('lang') || 'en';
    htmlLang = htmlLang.toLowerCase().substring(0, 2);
    if (['en', 'fr', 'it', 'ru', 'el'].indexOf(htmlLang) !== -1) {
      return htmlLang;
    }
    var currentPath = window.location.pathname;
    if (window.CosyLang && window.CosyLang.detectPageLang) {
      return window.CosyLang.detectPageLang(currentPath);
    }
    if (currentPath.indexOf('/fr/') !== -1) return 'fr';
    if (currentPath.indexOf('/ru/') !== -1) return 'ru';
    if (currentPath.indexOf('/it/') !== -1) return 'it';
    if (currentPath.indexOf('/el/') !== -1) return 'el';
    return 'en';
  }

  function t(key) {
    var lang = getPageLang();
    var dict = DICTIONARY[lang] || DICTIONARY.en;
    return dict[key] || DICTIONARY.en[key] || '';
  }

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
    ['Basic Speaking Club', 'basic-speaking-club.html'],
    ['Intermediate Speaking Club', 'intermediate-speaking-club.html']
  ];

  var nav = document.getElementById('cosy-nav');
  if (nav) {
    var pageLang = getPageLang();
    var clubsLabel = t('clubs');

    var html =
      '<header class="ce-session-nav">' +
        '<a class="ce-nav-brand" href="' + root + 'index.html">' +
          '<img src="' + root + 'shared/images/logo.png" alt="COSYlanguages logo" />' +
          '<span>COSY Events</span>' +
        '</a>' +
        '<div class="ce-clubs-disclosure">' +
          '<button class="ce-clubs-btn" type="button" aria-expanded="false" aria-controls="ce-clubs-panel">' +
            '<span>' + clubsLabel + '</span> <span class="ce-clubs-arrow">▾</span>' +
          '</button>' +
          '<div id="ce-clubs-panel" class="ce-clubs-panel" role="region" aria-label="Event categories" hidden>' +
            '<div class="ce-clubs-grid">' +
              clubs.map(function (c) {
                var targetRel = c[1];
                if (window.CosyLang && window.CosyLang.equivalentPath) {
                  var eq = window.CosyLang.equivalentPath(pageLang, targetRel, window.CosyLang.state ? window.CosyLang.state.manifest : null, window.CosyLang.state ? window.CosyLang.state.aliases : null);
                  if (eq) targetRel = eq;
                }
                return '<a class="ce-club-link" href="' + root + targetRel + '">' + c[0] + '</a>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ce-nav-right">' +
          '<div class="ce-nav-right-account" data-cosy-account></div>' +
          '<div class="ce-nav-right-switcher" data-ce-lang-switcher></div>' +
          '<button class="ce-theme-btn" type="button" aria-label="Toggle dark mode"></button>' +
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

    // Disclosure Panel logic
    var clubsBtn = nav.querySelector('.ce-clubs-btn');
    var clubsPanel = nav.querySelector('#ce-clubs-panel');

    function openClubsPanel() {
      if (!clubsPanel || !clubsBtn) return;
      clubsBtn.setAttribute('aria-expanded', 'true');
      clubsPanel.hidden = false;
      clubsPanel.classList.add('open');
      var firstLink = clubsPanel.querySelector('a');
      if (firstLink) {
        firstLink.focus();
      }
    }

    function closeClubsPanel() {
      if (!clubsPanel || !clubsBtn) return;
      if (clubsBtn.getAttribute('aria-expanded') === 'false') return;
      clubsBtn.setAttribute('aria-expanded', 'false');
      clubsPanel.hidden = true;
      clubsPanel.classList.remove('open');
      clubsBtn.focus();
    }

    if (clubsBtn && clubsPanel) {
      clubsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var expanded = clubsBtn.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          closeClubsPanel();
        } else {
          openClubsPanel();
        }
      });

      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target)) {
          closeClubsPanel();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeClubsPanel();
        }
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
      textSpan.innerHTML = t('lesson_converted') + ' <a href="' + linkUrl + '" target="_blank" rel="noopener" style="color: var(--cosy-color-amber-dark, #7d4d03); text-decoration: underline; font-weight: 700;">' + linkUrl + '</a>';
    } else if (status === 'planned') {
      textSpan.innerHTML = t('lesson_planned');
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
        var title = h ? h.textContent.trim() : (t('slide_counter_prefix') + ' ' + (idx + 1));
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
            title: t('overview')
          });
        }
      }

      // Group 1: Vocabulary
      if (vocabSection) {
        var vocabTitle = t('vocabulary');
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
          '<button type="button" class="ce-view-btn ce-btn-slides active" title="' + t('slides_title') + '">' + t('slides_btn') + '</button>' +
          '<button type="button" class="ce-view-btn ce-btn-scroll" title="' + t('scroll_title') + '">' + t('scroll_btn') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="ce-slide-progress-track">' +
        '<div class="ce-slide-progress-fill" style="width: ' + Math.round(1 / slides.length * 100) + '%;"></div>' +
      '</div>' +
      '<div class="ce-slide-deck-footer">' +
        '<button type="button" class="ce-slide-nav-btn ce-prev-btn" disabled>' + t('prev_btn') + '</button>' +
        '<span class="ce-slide-counter">' + t('slide_counter_prefix') + ' <strong class="ce-curr-num">1</strong> ' + t('slide_counter_of') + ' ' + slides.length + '</span>' +
        '<button type="button" class="ce-slide-nav-btn ce-next-btn">' + t('next_btn') + '</button>' +
        '<button type="button" class="ce-slide-fs-btn" title="' + t('fullscreen_title') + '">' + t('fullscreen_btn') + '</button>' +
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
    var footer = document.querySelector('footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.className = 'hub-footer';
      document.body.appendChild(footer);
    }

    if (!document.querySelector('.cosy-gated-ecosystem-note')) {
      var note = document.createElement('div');
      note.className = 'cosy-gated-ecosystem-note';
      note.innerHTML = t('ecosystem_note_part') + ' <a href="https://cosylanguages.github.io/COSYlanguages/" target="_blank" rel="noopener">COSYlanguages</a> ecosystem &bull; ' + t('ecosystem_note_explore') + ' <a href="https://cosylanguages.github.io/COSYtools/" target="_blank" rel="noopener">COSYtools 🔎</a> &bull; <a href="https://cosylanguages.github.io/COSYgames/" target="_blank" rel="noopener">COSYgames 🎮</a>';
      footer.appendChild(note);
    }

    if (!document.querySelector('.ce-privacy-footer-link')) {
      var pageLang = getPageLang();
      var privacyUrl = (pageLang === 'fr') ? (root + 'fr/privacy.html') : (root + 'privacy.html');
      var privacyText = t('privacy_text');

      var linkContainer = document.createElement('div');
      linkContainer.className = 'ce-privacy-footer-link';
      linkContainer.style.cssText = 'margin-top: 0.5rem; font-size: 0.85rem; text-align: center;';
      linkContainer.innerHTML = '<a href="' + privacyUrl + '">' + privacyText + '</a>';
      footer.appendChild(linkContainer);
    }
  }

  // Auto-load wonder-voiceover.js if wonder audio placeholder is present
  function checkWonderVoiceover() {
    if (document.querySelector('.wonder-audio-player-placeholder') && !document.querySelector('script[src*="wonder-voiceover.js"]')) {
      var script = document.createElement('script');
      script.src = root + 'shared/js/wonder-voiceover.js';
      document.head.appendChild(script);
    }
  }

  /* ──────────────────────────────────────────────────────────────
     SUPABASE AUTH-BASED SESSION CONTENT GATING
     Gates facilitator-notes and recording-url based on public.session_content & RLS
     ────────────────────────────────────────────────────────────── */
  function loadSupabaseConfig(callback) {
    var configUrl = root + 'shared/config/supabase.json';
    fetch(configUrl)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (cfg) { callback(cfg || { enabled: false }); })
      .catch(function () { callback({ enabled: false }); });
  }

  function loadSupabaseSdk(callback) {
    if (window.supabase) {
      callback(window.supabase);
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1';
    script.onload = function () {
      if (window.supabase) {
        callback(window.supabase);
      }
    };
    script.onerror = function () {
      console.warn('COSYevents: Failed to load Supabase SDK');
    };
    document.head.appendChild(script);
  }

  function getSessionId(callback) {
    var notesElem = document.getElementById('facilitator-notes');
    var recElem = document.getElementById('recording-url');
    var datasetId = (notesElem && notesElem.getAttribute('data-session-id')) ||
                    (recElem && recElem.getAttribute('data-session-id'));
    if (datasetId) {
      callback(datasetId);
      return;
    }

    var metaSession = document.querySelector('meta[name="session-id"]');
    if (metaSession && metaSession.getAttribute('content')) {
      callback(metaSession.getAttribute('content'));
      return;
    }

    // Lookup in events.json matching pathname
    var eventsPath = root + 'shared/calendar-data/events.json';
    fetch(eventsPath)
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (events) {
        if (!events || !Array.isArray(events)) {
          callback(null);
          return;
        }
        var currentPath = window.location.pathname;
        var matched = events.find(function (evt) {
          if (!evt.materials) return false;
          try {
            var urlObj = new URL(evt.materials);
            return urlObj.pathname.endsWith(currentPath.split('/').slice(-2).join('/')) ||
                   currentPath.endsWith(urlObj.pathname.split('/').slice(-2).join('/'));
          } catch (e) {
            return evt.materials.indexOf(currentPath) !== -1 || currentPath.indexOf(evt.materials) !== -1;
          }
        });
        callback(matched ? matched.id : null);
      })
      .catch(function () {
        callback(null);
      });
  }

  function renderUnauthorizedPrompt(container, title) {
    if (!container) return;
    container.classList.add('ce-gated-visible');
    container.innerHTML =
      '<div class="ce-gated-prompt">' +
        '<h4>🔒 ' + (title || t('gated_default_title')) + '</h4>' +
        '<p>' + t('gated_desc') + '</p>' +
        '<a class="ce-gated-btn" href="https://cosylanguages.github.io/COSYlanguages/" target="_blank" rel="noopener">' + t('gated_btn') + '</a>' +
      '</div>';
  }

  function renderGatedContent(container, content, isVideo) {
    if (!container || !content) return;
    container.classList.add('ce-gated-visible');
    var targetDiv = container.querySelector('.ce-gated-content') || container;
    if (isVideo) {
      targetDiv.innerHTML =
        '<div class="cosy-video-wrapper">' +
          '<div class="cosy-video-container">' +
            '<iframe src="' + content + '" allowfullscreen title="Session Recording"></iframe>' +
          '</div>' +
        '</div>';
    } else {
      targetDiv.innerHTML = '<div class="ce-notes-body">' + content + '</div>';
    }
  }

  function initGatedContent() {
    var notesElem = document.getElementById('facilitator-notes');
    var recElem = document.getElementById('recording-url');

    // If neither gated section exists on the page, do nothing
    if (!notesElem && !recElem) return;

    loadSupabaseConfig(function (config) {
      if (!config || !config.enabled || !config.url || !config.anonKey) {
        // When enabled is false, do not load SDK and do not render sign-in prompts for gated blocks
        return;
      }

      // Hide gated sections by default before loading content
      if (notesElem) notesElem.style.display = 'none';
      if (recElem) recElem.style.display = 'none';

      getSessionId(function (sessionId) {
        if (!sessionId) {
          if (notesElem) renderUnauthorizedPrompt(notesElem, t('gated_notes_title'));
          if (recElem) renderUnauthorizedPrompt(recElem, t('gated_rec_title'));
          return;
        }

        loadSupabaseSdk(function (supabaseLib) {
          var supabaseClient = supabaseLib.createClient(config.url, config.anonKey);
          supabaseClient.auth.getSession().then(function (sessionRes) {
            var user = sessionRes && sessionRes.data && sessionRes.data.session ? sessionRes.data.session.user : null;

            supabaseClient
              .from('session_content')
              .select('full_notes, recording_url')
              .eq('session_id', sessionId)
              .maybeSingle()
              .then(function (res) {
                var data = res.data;
                var error = res.error;

                if (error || !data) {
                  if (notesElem) renderUnauthorizedPrompt(notesElem, t('gated_notes_title'));
                  if (recElem) renderUnauthorizedPrompt(recElem, t('gated_rec_title'));
                  return;
                }

                if (notesElem) {
                  if (data.full_notes) {
                    renderGatedContent(notesElem, data.full_notes, false);
                  } else {
                    renderUnauthorizedPrompt(notesElem, t('gated_notes_title'));
                  }
                }

                if (recElem) {
                  if (data.recording_url) {
                    renderGatedContent(recElem, data.recording_url, true);
                  } else {
                    renderUnauthorizedPrompt(recElem, t('gated_rec_title'));
                  }
                }
              });
          });
        });
      });
    });
  }

  window.initSlideDeck = initSlideDeck;
  document.addEventListener('cosy:session-rendered', function () {
    initSlideDeck();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      checkEventConversion();
      initSlideDeck();
      renderGatedFooterNote();
      checkWonderVoiceover();
      initGatedContent();
    });
  } else {
    checkEventConversion();
    initSlideDeck();
    renderGatedFooterNote();
    checkWonderVoiceover();
    initGatedContent();
  }
})();
