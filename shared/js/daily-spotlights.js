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

  function formatDisplayDate(data, lang) {
    if (data && data.month && data.day) {
      try {
        var year = (data.updated_at ? new Date(data.updated_at).getFullYear() : 2026);
        var dateObj = new Date(year, data.month - 1, data.day);
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

  function initDailySpotlights() {
    var root = document.getElementById('daily-spotlights-root');
    if (!root) return;

    var lang = detectLanguage();
    var pathPrefix = getPathPrefix();
    var dataUrl = pathPrefix + 'data/daily-spotlights.json';
    var i18n = SPOTLIGHT_I18N[lang] || SPOTLIGHT_I18N.en;

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

        var localizedDate = formatDisplayDate(data, lang);
        var subText = (i18n.sub || '').replace('{date}', localizedDate);
        var items = data.items;

        var html = (
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
            '</div>' +
            '<div class="daily-spotlights-grid">' +
              renderCard('celebration', items.celebration, lang, pathPrefix) +
              renderCard('science', items.science, lang, pathPrefix) +
              renderCard('music', items.music, lang, pathPrefix) +
              renderCard('film', items.film, lang, pathPrefix) +
            '</div>' +
          '</div>'
        );

        root.innerHTML = html;
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
      sanitizeHtml: sanitizeHtml,
      initDailySpotlights: initDailySpotlights,
      detectLanguage: detectLanguage,
      formatDisplayDate: formatDisplayDate,
      SPOTLIGHT_I18N: SPOTLIGHT_I18N
    };
  }
})();
