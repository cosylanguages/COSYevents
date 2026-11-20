/**
 * shared/js/club-reviews.js
 *
 * Learner reviews of COSYevents speaking clubs. Mirrors the COSYlanguages
 * course-reviews carousel: one carousel that shows every review.
 *
 * Mount it with an empty container and it renders itself:
 *
 *   <div data-club-reviews></div>
 *
 * Reviews are authored by hand in `data/club-reviews.json`. A review may carry
 * an optional `i18n` object with localized `text` (and `author`) for the five
 * supported languages; otherwise the top-level text is used everywhere.
 */

(function () {
  'use strict';

  var REVIEWS_I18N = {
    en: {
      heading: 'What our members say',
      sub: 'Real experiences from learners in our live speaking clubs.',
      share: 'Share your club experience ›',
      prev: 'Previous review',
      next: 'Next review'
    },
    fr: {
      heading: 'Ce que disent nos membres',
      sub: 'Des expériences vécues par les apprenants de nos clubs de conversation.',
      share: 'Partagez votre expérience ›',
      prev: 'Avis précédent',
      next: 'Avis suivant'
    },
    it: {
      heading: 'Cosa dicono i nostri membri',
      sub: 'Esperienze reali degli studenti dei nostri club di conversazione.',
      share: 'Condividi la tua esperienza ›',
      prev: 'Recensione precedente',
      next: 'Recensione successiva'
    },
    ru: {
      heading: 'Что говорят наши участники',
      sub: 'Реальные впечатления учеников наших разговорных клубов.',
      share: 'Поделитесь своим опытом ›',
      prev: 'Предыдущий отзыв',
      next: 'Следующий отзыв'
    },
    el: {
      heading: 'Τι λένε τα μέλη μας',
      sub: 'Πραγματικές εμπειρίες από μαθητές στα κλαμπ συζήτησης.',
      share: 'Μοιραστείτε την εμπειρία σας ›',
      prev: 'Προηγούμενη κριτική',
      next: 'Επόμενη κριτική'
    }
  };

  // Canonical display names, used when a review has no club_name. Speaking clubs are
  // named by language; the level badge on the card carries the learner's level.
  var CLUB_LABELS = {
    'basic-speaking-club': 'English Speaking Club',
    'intermediate-speaking-club': 'English Speaking Club',
    'french-speaking-club': 'French Speaking Club',
    'keeping-up-with-science': 'Keeping Up with Science',
    'lets-celebrate': "Let's Celebrate",
    'the-greatest-quotes': 'The Greatest Quotes',
    'mind-matters': 'Mind Matters',
    'my-life-with-without': 'My Life With & Without',
    'debatable-and-relatable': 'Debatable & Relatable',
    'i-couldnt-help-but-wonder': "I Couldn't Help But Wonder",
    'if-you-were': 'If You Were',
    'long-reads': 'Long Reads',
    'cinema-club': 'Cinema Club',
    'karaoke-club': 'Karaoke Club',
    'game-evenings': 'Game Evenings'
  };

  var CLUB_LABELS_I18N = {
    fr: {
      'basic-speaking-club': 'Club de conversation anglais',
      'intermediate-speaking-club': 'Club de conversation anglais',
      'french-speaking-club': 'Club de conversation français',
      'keeping-up-with-science': 'Keeping Up with Science',
      'lets-celebrate': "Let's Celebrate",
      'the-greatest-quotes': 'The Greatest Quotes',
      'mind-matters': 'Mind Matters',
      'my-life-with-without': 'My Life With & Without',
      'debatable-and-relatable': 'Debatable & Relatable',
      'i-couldnt-help-but-wonder': "I Couldn't Help But Wonder",
      'if-you-were': 'If You Were',
      'long-reads': 'Long Reads',
      'cinema-club': 'Club cinéma',
      'karaoke-club': 'Club karaoké',
      'game-evenings': 'Soirées jeux'
    },
    it: {
      'basic-speaking-club': 'Club di conversazione in inglese',
      'intermediate-speaking-club': 'Club di conversazione in inglese',
      'french-speaking-club': 'Club di conversazione in francese',
      'keeping-up-with-science': 'Keeping Up with Science',
      'lets-celebrate': "Let's Celebrate",
      'the-greatest-quotes': 'The Greatest Quotes',
      'mind-matters': 'Mind Matters',
      'my-life-with-without': 'My Life With & Without',
      'debatable-and-relatable': 'Debatable & Relatable',
      'i-couldnt-help-but-wonder': "I Couldn't Help But Wonder",
      'if-you-were': 'If You Were',
      'long-reads': 'Long Reads',
      'cinema-club': 'Club cinema',
      'karaoke-club': 'Club karaoke',
      'game-evenings': 'Serate giochi'
    },
    ru: {
      'basic-speaking-club': 'Разговорный клуб английского',
      'intermediate-speaking-club': 'Разговорный клуб английского',
      'french-speaking-club': 'Разговорный клуб французского',
      'keeping-up-with-science': 'Keeping Up with Science',
      'lets-celebrate': "Let's Celebrate",
      'the-greatest-quotes': 'The Greatest Quotes',
      'mind-matters': 'Mind Matters',
      'my-life-with-without': 'My Life With & Without',
      'debatable-and-relatable': 'Debatable & Relatable',
      'i-couldnt-help-but-wonder': "I Couldn't Help But Wonder",
      'if-you-were': 'If You Were',
      'long-reads': 'Long Reads',
      'cinema-club': 'Киноклуб',
      'karaoke-club': 'Караоке-клуб',
      'game-evenings': 'Игровые вечера'
    },
    el: {
      'basic-speaking-club': 'Κλαμπ συζήτησης αγγλικών',
      'intermediate-speaking-club': 'Κλαμπ συζήτησης αγγλικών',
      'french-speaking-club': 'Κλαμπ συζήτησης γαλλικών',
      'keeping-up-with-science': 'Keeping Up with Science',
      'lets-celebrate': "Let's Celebrate",
      'the-greatest-quotes': 'The Greatest Quotes',
      'mind-matters': 'Mind Matters',
      'my-life-with-without': 'My Life With & Without',
      'debatable-and-relatable': 'Debatable & Relatable',
      'i-couldnt-help-but-wonder': "I Couldn't Help But Wonder",
      'if-you-were': 'If You Were',
      'long-reads': 'Long Reads',
      'cinema-club': 'Κλαμπ σινεμά',
      'karaoke-club': 'Κλαμπ καραόκε',
      'game-evenings': 'Βραδιές παιχνιδιών'
    }
  };

  // Public Google Form where members share a club experience.
  var SHARE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdvd8pfIbBb08n2JcVkG2ThMU_4MRC3K9zqhOERHWJ0bCxVog/viewform';

  function sanitizeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function detectLanguage() {
    if (typeof window !== 'undefined') {
      // The page language wins: whichever language the visitor picked (or landed
      // on) is the language every review is shown in. The URL is read first
      // because CosyLang may not have initialised yet when this runs.
      if (window.CosyLang && typeof window.CosyLang.detectPageLang === 'function') {
        var pLang = window.CosyLang.detectPageLang(window.location.pathname);
        if (pLang && REVIEWS_I18N[pLang]) return pLang;
      }
      if (window.CosyLang && window.CosyLang.state && window.CosyLang.state.pageLang) {
        var stateLang = window.CosyLang.state.pageLang;
        if (REVIEWS_I18N[stateLang]) return stateLang;
      }
      var htmlLang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
      if (htmlLang && REVIEWS_I18N[htmlLang]) return htmlLang;

      var clean = decodeURIComponent(window.location.pathname.split('?')[0].split('#')[0]);
      if (clean.charAt(0) === '/') clean = clean.substring(1);
      if (clean.indexOf('COSYevents/') === 0) clean = clean.substring('COSYevents/'.length);
      var first = clean.split('/')[0];
      if (REVIEWS_I18N[first]) return first;
    }
    return 'en';
  }

  // Reviews are fetched relative to the page, so a page in any subdirectory
  // (language hubs, /speaking-clubs/, ...) needs one `../` per level.
  function getPathPrefix() {
    if (typeof window === 'undefined') return '';
    var clean = decodeURIComponent(window.location.pathname.split('?')[0].split('#')[0]);
    if (clean.charAt(0) === '/') clean = clean.substring(1);
    if (clean.indexOf('COSYevents/') === 0) clean = clean.substring('COSYevents/'.length);
    var segments = clean.split('/');
    segments.pop();
    var depth = segments.filter(function (s) { return s && s !== '.'; }).length;
    return depth > 0 ? new Array(depth + 1).join('../') : '';
  }

  var INTL_LOCALES = { en: 'en-US', fr: 'fr-FR', it: 'it-IT', ru: 'ru-RU', el: 'el-GR' };

  function formatDate(iso, lang) {
    if (!iso) return '';
    try {
      var match = String(iso).match(/(\d{4})/);
      if (!match) return '';
      var dateObj = new Date(Date.UTC(Number(match[1]), 0, 1));
      if (isNaN(dateObj.getTime())) return '';
      return new Intl.DateTimeFormat(INTL_LOCALES[lang] || 'en-US', {
        year: 'numeric'
      }).format(dateObj);
    } catch (e) {
      return '';
    }
  }

  function clubLabel(review, lang) {
    var dict = CLUB_LABELS_I18N[lang] || {};
    if (dict[review.club]) return dict[review.club];
    if (review.club_name) return review.club_name;
    if (CLUB_LABELS[review.club]) return CLUB_LABELS[review.club];
    if (review.club) {
      return review.club.split('-').map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(' ');
    }
    return '';
  }

  function localized(review, lang) {
    var loc = (review.i18n && (review.i18n[lang] || review.i18n.en)) || {};
    return {
      text: loc.text || review.text || '',
      author: loc.author || review.author || ''
    };
  }

  function stars(rating) {
    var value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    var out = '';
    for (var i = 0; i < 5; i++) {
      out += '<span class="club-review-star' + (i < value ? ' is-on' : '') + '" aria-hidden="true">★</span>';
    }
    return '<span class="club-review-stars" role="img" aria-label="' + value + '/5">' + out + '</span>';
  }

  function renderCard(review, lang, index, total) {
    var loc = localized(review, lang);
    var label = clubLabel(review, lang);
    var dateStr = formatDate(review.date, lang);

    var meta = [];
    if (loc.author) {
      meta.push('<span class="club-review-author">' + sanitizeHtml(loc.author) + '</span>');
    }
    if (label) {
      meta.push('<span class="club-review-club">' + sanitizeHtml(label) + '</span>');
    }
    if (review.level) {
      meta.push('<span class="club-review-level">' + sanitizeHtml(review.level) + '</span>');
    }
    if (dateStr) {
      meta.push('<span class="club-review-date">' + sanitizeHtml(dateStr) + '</span>');
    }

    return (
      '<div class="club-review-slide" data-review-index="' + index + '">' +
        '<div class="club-review-card-inner">' +
          '<span class="club-review-quote club-review-quote-top" aria-hidden="true">❝</span>' +
          stars(review.rating) +
          '<p class="club-review-text">' + sanitizeHtml(loc.text) + '</p>' +
          '<div class="club-review-divider"></div>' +
          '<div class="club-review-meta">' + meta.join('') + '</div>' +
          '<span class="club-review-quote club-review-quote-bottom" aria-hidden="true">❞</span>' +
          (total > 1 ? '<span class="club-review-counter">' + (index + 1) + '/' + total + '</span>' : '') +
        '</div>' +
      '</div>'
    );
  }

  function renderSection(reviews, lang) {
    lang = REVIEWS_I18N[lang] ? lang : 'en';
    var t = REVIEWS_I18N[lang];

    var slides = reviews.map(function (review, i) {
      return renderCard(review, lang, i, reviews.length);
    }).join('');

    var multiple = reviews.length > 1;
    var prevBtn = multiple
      ? '<button type="button" class="club-reviews-nav-btn prev" data-reviews-prev aria-label="' + sanitizeHtml(t.prev) + '">‹</button>'
      : '';
    var nextBtn = multiple
      ? '<button type="button" class="club-reviews-nav-btn next" data-reviews-next aria-label="' + sanitizeHtml(t.next) + '">›</button>'
      : '';

    return (
      '<section class="club-reviews-section">' +
        '<div class="club-reviews-header">' +
          '<h2 class="club-reviews-heading">' + sanitizeHtml(t.heading) + '</h2>' +
          '<p class="club-reviews-sub">' + sanitizeHtml(t.sub) + '</p>' +
          '<a class="club-reviews-share" href="' + SHARE_FORM_URL + '" target="_blank" rel="noopener">' +
            sanitizeHtml(t.share) +
          '</a>' +
        '</div>' +
        '<div class="club-reviews-carousel-wrapper">' +
          prevBtn +
          '<div class="club-reviews-carousel" data-reviews-carousel>' +
            '<div class="club-reviews-track" data-reviews-track>' + slides + '</div>' +
          '</div>' +
          nextBtn +
        '</div>' +
      '</section>'
    );
  }

  function wireCarousel(root) {
    var track = root.querySelector('[data-reviews-track]');
    var carousel = root.querySelector('[data-reviews-carousel]');
    var slides = root.querySelectorAll('.club-review-slide');
    var prevBtn = root.querySelector('[data-reviews-prev]');
    var nextBtn = root.querySelector('[data-reviews-next]');
    if (!track || slides.length === 0) return;

    var currentIndex = 0;
    var total = slides.length;

    function goToSlide(index) {
      currentIndex = (index + total) % total;
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      for (var i = 0; i < slides.length; i++) {
        slides[i].classList.toggle('active', i === currentIndex);
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(currentIndex + 1); });

    var startX = 0;
    var isSwiping = false;
    if (carousel) {
      carousel.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          isSwiping = true;
        }
      }, { passive: true });
      carousel.addEventListener('touchend', function (e) {
        if (!isSwiping || e.changedTouches.length === 0) return;
        var diffX = startX - e.changedTouches[0].clientX;
        if (Math.abs(diffX) > 40) {
          goToSlide(diffX > 0 ? currentIndex + 1 : currentIndex - 1);
        }
        isSwiping = false;
      }, { passive: true });
    }

    goToSlide(0);
  }

  // All reviews live in one carousel. Every mount shows the whole set, so the
  // same reviews appear together wherever the component is placed.
  function reviewsForMount(reviews) {
    return reviews;
  }

  // An optional wrapper marked `data-club-reviews-shell` is hidden along with the mount, so an empty
  // block leaves no padding gap on the page.
  function shellFor(element) {
    return element.closest ? element.closest('[data-club-reviews-shell]') : null;
  }

  function render(element, reviews, lang) {
    var shell = shellFor(element);
    if (!reviews || reviews.length === 0) {
      element.innerHTML = '';
      element.style.display = 'none';
      if (shell) shell.style.display = 'none';
      return;
    }
    element.style.display = '';
    if (shell) shell.style.display = '';
    element.innerHTML = renderSection(reviews, lang);
    wireCarousel(element);
  }

  function initClubReviews() {
    if (typeof document === 'undefined') return;
    var mounts = document.querySelectorAll('[data-club-reviews]');
    if (mounts.length === 0) return;

    var lang = detectLanguage();
    var pathPrefix = getPathPrefix();

    fetch(pathPrefix + 'data/club-reviews.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load club reviews: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var reviews = (data && data.reviews) || [];
        for (var i = 0; i < mounts.length; i++) {
          render(mounts[i], reviewsForMount(reviews), lang);
        }
      })
      .catch(function (err) {
        console.warn('Club reviews failed to render:', err.message);
        for (var i = 0; i < mounts.length; i++) mounts[i].style.display = 'none';
      });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initClubReviews);
    } else {
      initClubReviews();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      renderSection: renderSection,
      renderCard: renderCard,
      sanitizeHtml: sanitizeHtml,
      detectLanguage: detectLanguage,
      getPathPrefix: getPathPrefix,
      formatDate: formatDate,
      stars: stars,
      clubLabel: clubLabel,
      localized: localized,
      reviewsForMount: reviewsForMount,
      initClubReviews: initClubReviews,
      REVIEWS_I18N: REVIEWS_I18N,
      CLUB_LABELS: CLUB_LABELS,
      CLUB_LABELS_I18N: CLUB_LABELS_I18N
    };
  }
})();
