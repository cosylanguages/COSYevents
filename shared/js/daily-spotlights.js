/**
 * shared/js/daily-spotlights.js
 *
 * Fetches and displays the daily spotlights (Celebration of the Day,
 * Today in Science, Today in Music, and Today in Film & TV).
 * Fully multilingual across 5 languages: en, fr, it, ru, el.
 */

(function () {
  'use strict';

  var CATEGORY_ICONS = {
    celebration: '🎊',
    science: '🔬',
    music: '🎵',
    film: '🎬'
  };

  var SPOTLIGHT_I18N = {
    en: {
      tag: '✨ Daily Culture & Science Pulse',
      heading: 'Today in Culture, Science & Arts',
      sub: 'Daily conversation starters for {date}, mapped directly to our live speaking clubs.',
      discuss_prefix: 'Discuss in',
      source: 'Source ↗',
      source_title: 'Source: {src}',
      categories: {
        celebration: 'Holiday of the Day',
        science: 'Today in Science',
        music: 'Today in Music',
        film: 'Today in Film & TV'
      },
      badges: {
        celebration: 'Celebration',
        science: 'Research & Discovery',
        music: 'Music History',
        film: 'Cinema & Screen'
      },
      clubs: {
        celebration: "Let's Celebrate",
        science: 'Keeping Up with Science',
        music: 'Karaoke Club',
        film: 'Cinema Nights'
      }
    },
    fr: {
      tag: '✨ Pulsations Quotidiennes Culture & Sciences',
      heading: 'Aujourd\'hui dans la Culture, les Sciences et les Arts',
      sub: 'Sujets de conversation du jour pour le {date}, reliés directement à nos clubs de conversation.',
      discuss_prefix: 'Discuter dans',
      source: 'Source ↗',
      source_title: 'Source : {src}',
      categories: {
        celebration: 'Fête & Célébration du Jour',
        science: 'Aujourd\'hui dans les Sciences',
        music: 'Aujourd\'hui dans la Musique',
        film: 'Aujourd\'hui au Cinéma & à la TV'
      },
      badges: {
        celebration: 'Célébration',
        science: 'Recherche & Découverte',
        music: 'Histoire de la Musique',
        film: 'Cinéma & Écran'
      },
      clubs: {
        celebration: 'Let\'s Celebrate',
        science: 'Keeping Up with Science',
        music: 'Karaoke Club',
        film: 'Cinema Nights'
      }
    },
    it: {
      tag: '✨ Battito Quotidiano di Cultura e Scienza',
      heading: 'Oggi nella Cultura, Scienza e Spettacolo',
      sub: 'Spunti di conversazione per il {date}, collegati direttamente ai nostri club di conversazione.',
      discuss_prefix: 'Discuti in',
      source: 'Fonte ↗',
      source_title: 'Fonte: {src}',
      categories: {
        celebration: 'Celebrazione del Giorno',
        science: 'Oggi nella Scienza',
        music: 'Oggi nella Musica',
        film: 'Oggi nel Cinema e TV'
      },
      badges: {
        celebration: 'Celebrazione',
        science: 'Ricerca e Scoperte',
        music: 'Storia della Musica',
        film: 'Cinema e Schermo'
      },
      clubs: {
        celebration: 'Let\'s Celebrate',
        science: 'Keeping Up with Science',
        music: 'Karaoke Club',
        film: 'Cinema Nights'
      }
    },
    ru: {
      tag: '✨ Ежедневный пульс культуры и науки',
      heading: 'Сегодня в культуре, науке и искусстве',
      sub: 'Темы для живого обсуждения на {date}, напрямую связанные с нашими разговорными клубами.',
      discuss_prefix: 'Обсудить в',
      source: 'Источник ↗',
      source_title: 'Источник: {src}',
      categories: {
        celebration: 'Праздник дня',
        science: 'Сегодня в науке',
        music: 'Сегодня в музыке',
        film: 'Сегодня в кино и ТВ'
      },
      badges: {
        celebration: 'Праздник',
        science: 'Исследования и наука',
        music: 'Музыкальная история',
        film: 'Кино и экран'
      },
      clubs: {
        celebration: 'Let\'s Celebrate',
        science: 'Keeping Up with Science',
        music: 'Karaoke Club',
        film: 'Cinema Nights'
      }
    },
    el: {
      tag: '✨ Καθημερινός Παλμός Πολιτισμού & Επιστήμης',
      heading: 'Σήμερα στον Πολιτισμό, την Επιστήμη & τις Τέχνες',
      sub: 'Θέματα συζήτησης για {date}, συνδεδεμένα άμεσα με τις λέσχες συνομιλίας μας.',
      discuss_prefix: 'Συζητήστε στο',
      source: 'Πηγή ↗',
      source_title: 'Πηγή: {src}',
      categories: {
        celebration: 'Γιορτή της Ημέρας',
        science: 'Σήμερα στην Επιστήμη',
        music: 'Σήμερα στη Μουσική',
        film: 'Σήμερα στο Σινεμά & την TV'
      },
      badges: {
        celebration: 'Εορτασμός',
        science: 'Έρευνα & Ανακάλυψη',
        music: 'Ιστορία της Μουσικής',
        film: 'Σινεμά & Οθόνη'
      },
      clubs: {
        celebration: 'Let\'s Celebrate',
        science: 'Keeping Up with Science',
        music: 'Karaoke Club',
        film: 'Cinema Nights'
      }
    }
  };

  // A stale payload is better than a blank panel, but it must not claim to be "today".
  var STALE_I18N = {
    en: { updated: 'Updated', stale_sub: 'Latest available spotlights for {date}. The daily update has not run yet.' },
    fr: { updated: 'Mis à jour', stale_sub: 'Derniers sujets disponibles pour le {date}. La mise à jour quotidienne n’a pas encore eu lieu.' },
    it: { updated: 'Aggiornato', stale_sub: 'Ultimi spunti disponibili per il {date}. L’aggiornamento quotidiano non è ancora stato eseguito.' },
    ru: { updated: 'Обновлено', stale_sub: 'Последние доступные темы на {date}. Ежедневное обновление ещё не выполнено.' },
    el: { updated: 'Ενημερώθηκε', stale_sub: 'Τελευταία διαθέσιμα θέματα για {date}. Η καθημερινή ενημέρωση δεν έχει εκτελεστεί ακόμη.' }
  };

  // The reader's own calendar date, YYYY-MM-DD. Every daily comparison uses this, never UTC.
  function getLocalDateKey(d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function payloadDate(data) {
    if (!data) return '';
    if (data.date) return String(data.date);
    if (!data.month || !data.day) return '';
    var year = data.updated_at ? new Date(data.updated_at).getUTCFullYear() : new Date().getFullYear();
    return year + '-' + String(data.month).padStart(2, '0') + '-' + String(data.day).padStart(2, '0');
  }

  // A file may publish a rolling window under `days` keyed by YYYY-MM-DD. Pick the
  // reader's local day. A category the window does not carry for that date falls back
  // to the file's top-level item and is flagged, never silently passed off as today's.
  function pickDay(data, dateKey) {
    dateKey = dateKey || getLocalDateKey();
    if (!data || !data.items) return null;
    var day = data.days && data.days[dateKey];
    if (!day) {
      return { date: payloadDate(data), items: data.items, exact: false };
    }
    var items = {};
    var exact = true;
    Object.keys(data.items).forEach(function (key) {
      if (day.items && day.items[key]) {
        items[key] = day.items[key];
      } else {
        items[key] = Object.assign({}, data.items[key], { latest_available: true });
        exact = false;
      }
    });
    return { date: dateKey, items: items, exact: exact };
  }

  function isStale(data, dateKey) {
    var picked = pickDay(data, dateKey);
    if (!picked || !picked.date) return false;
    return picked.date < (dateKey || getLocalDateKey());
  }

  function sanitizeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function detectLanguage() {
    if (typeof window !== 'undefined') {
      if (window.CosyLang && typeof window.CosyLang.detectPageLang === 'function') {
        var pLang = window.CosyLang.detectPageLang(window.location.pathname);
        if (pLang && SPOTLIGHT_I18N[pLang]) return pLang;
      }
      var htmlLang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
      if (htmlLang && SPOTLIGHT_I18N[htmlLang]) return htmlLang;

      var clean = decodeURIComponent(window.location.pathname.split('?')[0].split('#')[0]);
      if (clean.charAt(0) === '/') clean = clean.substring(1);
      if (clean.indexOf('COSYevents/') === 0) clean = clean.substring('COSYevents/'.length);
      var first = clean.split('/')[0];
      if (SPOTLIGHT_I18N[first]) return first;
    }
    return 'en';
  }

  function getPathPrefix() {
    if (typeof window === 'undefined') return '';
    var clean = decodeURIComponent(window.location.pathname.split('?')[0].split('#')[0]);
    if (clean.charAt(0) === '/') clean = clean.substring(1);
    if (clean.indexOf('COSYevents/') === 0) clean = clean.substring('COSYevents/'.length);
    var first = clean.split('/')[0];
    if (['fr', 'it', 'ru', 'el'].indexOf(first) !== -1) {
      return '../';
    }
    return '';
  }

  function formatDisplayDate(data, lang, dateKey) {
    var key = dateKey || payloadDate(data);
    if (key) {
      try {
        var parts = key.split('-');
        var dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        var intlLocale = lang === 'el' ? 'el-GR' : (lang === 'ru' ? 'ru-RU' : (lang === 'it' ? 'it-IT' : (lang === 'fr' ? 'fr-FR' : 'en-US')));
        return new Intl.DateTimeFormat(intlLocale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).format(dateObj);
      } catch (e) {}
    }
    return (data && data.display_date) || 'Today';
  }

  function renderCard(key, item, lang, pathPrefix) {
    if (!item) return '';

    lang = lang || 'en';
    pathPrefix = pathPrefix || '';

    var i18n = SPOTLIGHT_I18N[lang] || SPOTLIGHT_I18N.en;
    var icon = CATEGORY_ICONS[key] || '✨';
    var catTitle = (i18n.categories && i18n.categories[key]) || item.categoryTitle || 'Daily Highlight';
    var badge = (i18n.badges && i18n.badges[key]) || item.badge || '';
    var clubName = (i18n.clubs && i18n.clubs[key]) || item.clubName || 'Club';

    var yearBadge = item.year ? '<span class="spotlight-year-badge">' + sanitizeHtml(item.year) + '</span>' : '';
    var latestBadge = item.latest_available
      ? '<span class="spotlight-badge spotlight-badge-latest">' + sanitizeHtml((STALE_I18N[lang] || STALE_I18N.en).updated) + '</span>'
      : '';

    // Resolve localized content from i18n field if present, else fallback to top-level
    var locItem = (item.i18n && (item.i18n[lang] || item.i18n.en)) || item;
    var rawTitle = locItem.title || item.title || '';
    var rawDesc = locItem.description || item.description || '';

    var title = sanitizeHtml(rawTitle);
    var desc = sanitizeHtml(rawDesc);

    var rawLink = item.clubLink || '#';
    var clubLink = pathPrefix + rawLink;

    var source = sanitizeHtml(item.source || '');
    var sourceUrl = sanitizeHtml(item.sourceUrl || '#');
    var sourceTitle = sanitizeHtml((i18n.source_title || 'Source: {src}').replace('{src}', item.source || ''));

    return (
      '<article class="daily-spotlight-card spotlight-card-' + sanitizeHtml(key) + '">' +
        '<div class="spotlight-card-header">' +
          '<div class="spotlight-category-wrap">' +
            '<span class="spotlight-icon" aria-hidden="true">' + icon + '</span>' +
            '<span class="spotlight-category-title">' + sanitizeHtml(catTitle) + '</span>' +
          '</div>' +
          '<div class="spotlight-badge-wrap">' +
            yearBadge +
            latestBadge +
            (badge ? '<span class="spotlight-badge">' + sanitizeHtml(badge) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="spotlight-card-body">' +
          '<h3 class="spotlight-title">' + title + '</h3>' +
          '<p class="spotlight-desc">' + desc + '</p>' +
        '</div>' +
        '<div class="spotlight-card-footer">' +
          '<a href="' + sanitizeHtml(clubLink) + '" class="spotlight-club-link">' +
            '<span>' + sanitizeHtml(i18n.discuss_prefix) + ' ' + sanitizeHtml(clubName) + '</span>' +
            '<span class="spotlight-arrow" aria-hidden="true">→</span>' +
          '</a>' +
          (source ? '<a href="' + sourceUrl + '" target="_blank" rel="noopener" class="spotlight-source" title="' + sourceTitle + '">' + sanitizeHtml(i18n.source) + '</a>' : '') +
        '</div>' +
      '</article>'
    );
  }

  function directorySlotHTML(lang) {
    // data-directory="true" on the mount adds one compact line of links to the other COSY daily
    // surfaces under the cards, mirroring the hub strip. data-self="events" marks this repo's card.
    return '<div class="daily-spotlights-directory" data-daily-directory data-compact="true" data-self="events" data-lang="' +
      sanitizeHtml(lang) + '"></div>';
  }

  // Pure builder for the container markup so it can be unit-tested without a DOM.
  // opts.directory adds the compact ecosystem-directory line (main page only).
  function renderContainer(data, lang, pathPrefix, opts) {
    opts = opts || {};
    var i18n = SPOTLIGHT_I18N[lang] || SPOTLIGHT_I18N.en;
    var staleI18n = STALE_I18N[lang] || STALE_I18N.en;
    var picked = pickDay(data) || { date: payloadDate(data), items: (data && data.items) || {}, exact: true };
    var localizedDate = formatDisplayDate(data, lang, picked.date);
    var stale = isStale(data);
    var subText = stale
      ? (staleI18n.stale_sub || '').replace('{date}', localizedDate)
      : (i18n.sub || '').replace('{date}', localizedDate);
    var items = picked.items;

    return (
      '<div class="daily-spotlights-container">' +
        '<div class="daily-spotlights-header">' +
          '<div class="daily-spotlights-header-text">' +
            '<span class="daily-spotlights-tag">' + sanitizeHtml(i18n.tag) + '</span>' +
            '<h2 class="daily-spotlights-heading">' + sanitizeHtml(i18n.heading) + '</h2>' +
            '<p class="daily-spotlights-sub">' +
              sanitizeHtml(subText) +
            '</p>' +
          '</div>' +
          '<span class="daily-spotlights-date-badge">📅 ' + sanitizeHtml(localizedDate) + '</span>' +
          (stale ? '<span class="daily-spotlights-stale-badge">⚠️ ' + sanitizeHtml(staleI18n.updated) + '</span>' : '') +
        '</div>' +
        '<div class="daily-spotlights-grid">' +
          renderCard('celebration', items.celebration, lang, pathPrefix) +
          renderCard('science', items.science, lang, pathPrefix) +
          renderCard('music', items.music, lang, pathPrefix) +
          renderCard('film', items.film, lang, pathPrefix) +
        '</div>' +
        (opts.directory ? directorySlotHTML(lang) : '') +
      '</div>'
    );
  }

  // Renders the compact directory into its slot once the shared daily-directory.js is available.
  // If that script has not run yet, its own initAll() picks the slot up on DOMContentLoaded.
  function mountDirectory(container, lang) {
    if (!container || typeof container.querySelector !== 'function') return;
    var slot = container.querySelector('[data-daily-directory]');
    if (!slot) return;
    var tries = 0;
    (function attempt() {
      var dir = typeof window !== 'undefined' && window.COSY_DailyDirectory;
      if (dir && typeof dir.renderCompact === 'function') {
        slot.setAttribute('data-lang', lang);
        dir.renderCompact(slot);
        return;
      }
      if (++tries < 20 && typeof setTimeout === 'function') setTimeout(attempt, 100);
    })();
  }

  function initDailySpotlights() {
    var root = document.getElementById('daily-spotlights-root');
    if (!root) return;

    var lang = detectLanguage();
    var pathPrefix = getPathPrefix();
    var dataUrl = pathPrefix + 'data/daily-spotlights.json';
    var includeDirectory = root.getAttribute('data-directory') === 'true';

    fetch(dataUrl)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Failed to load daily spotlights: ' + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.items) {
          root.style.display = 'none';
          return;
        }

        root.innerHTML = renderContainer(data, lang, pathPrefix, { directory: includeDirectory });
        if (includeDirectory) mountDirectory(root, lang);
      })
      .catch(function (err) {
        console.warn('Daily spotlights failed to render:', err.message);
        root.style.display = 'none';
      });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDailySpotlights);
    } else {
      initDailySpotlights();
    }
  }

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      renderCard: renderCard,
      renderContainer: renderContainer,
      directorySlotHTML: directorySlotHTML,
      mountDirectory: mountDirectory,
      sanitizeHtml: sanitizeHtml,
      initDailySpotlights: initDailySpotlights,
      detectLanguage: detectLanguage,
      formatDisplayDate: formatDisplayDate,
      isStale: isStale,
      getLocalDateKey: getLocalDateKey,
      pickDay: pickDay,
      SPOTLIGHT_I18N: SPOTLIGHT_I18N,
      STALE_I18N: STALE_I18N
    };
  }
})();
