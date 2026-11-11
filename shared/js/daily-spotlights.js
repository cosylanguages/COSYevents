/**
 * shared/js/daily-spotlights.js
 *
 * Fetches and displays the daily spotlights (Celebration of the Day,
 * Today in Science, Today in Music, and Today in Film & TV) on the homepage.
 */

(function () {
  'use strict';

  var SPOTLIGHTS_URL = 'data/daily-spotlights.json';

  var CATEGORY_ICONS = {
    celebration: '🎊',
    science: '🔬',
    music: '🎵',
    film: '🎬'
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

  function renderCard(key, item) {
    if (!item) return '';

    var icon = CATEGORY_ICONS[key] || '✨';
    var catTitle = item.categoryTitle || 'Daily Highlight';
    var badge = item.badge || '';
    var yearBadge = item.year ? '<span class="spotlight-year-badge">' + sanitizeHtml(item.year) + '</span>' : '';
    var title = sanitizeHtml(item.title || '');
    var desc = sanitizeHtml(item.description || '');
    var clubLink = sanitizeHtml(item.clubLink || '#');
    var clubName = sanitizeHtml(item.clubName || 'Explore Club');
    var source = sanitizeHtml(item.source || '');
    var sourceUrl = sanitizeHtml(item.sourceUrl || '#');

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
          '<a href="' + clubLink + '" class="spotlight-club-link">' +
            '<span>Discuss in ' + clubName + '</span>' +
            '<span class="spotlight-arrow" aria-hidden="true">→</span>' +
          '</a>' +
          (source ? '<a href="' + sourceUrl + '" target="_blank" rel="noopener" class="spotlight-source" title="Source: ' + source + '">Source ↗</a>' : '') +
        '</div>' +
      '</article>'
    );
  }

  function initDailySpotlights() {
    var root = document.getElementById('daily-spotlights-root');
    if (!root) return;

    fetch(SPOTLIGHTS_URL)
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

        var dateLabel = data.display_date || 'Today';
        var items = data.items;

        var html = (
          '<div class="daily-spotlights-container">' +
            '<div class="daily-spotlights-header">' +
              '<div class="daily-spotlights-header-text">' +
                '<span class="daily-spotlights-tag">✨ Daily Culture &amp; Science Pulse</span>' +
                '<h2 class="daily-spotlights-heading">Today in Culture, Science &amp; Arts</h2>' +
                '<p class="daily-spotlights-sub">' +
                  'Daily conversation starters for ' + sanitizeHtml(dateLabel) + ', mapped directly to our live speaking clubs.' +
                '</p>' +
              '</div>' +
              '<span class="daily-spotlights-date-badge">📅 ' + sanitizeHtml(dateLabel) + '</span>' +
            '</div>' +
            '<div class="daily-spotlights-grid">' +
              renderCard('celebration', items.celebration) +
              renderCard('science', items.science) +
              renderCard('music', items.music) +
              renderCard('film', items.film) +
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
      initDailySpotlights: initDailySpotlights
    };
  }
})();
