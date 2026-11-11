#!/usr/bin/env node

/**
 * scripts/fetch_daily_spotlights.js
 *
 * Fetches and extracts 4 daily elements:
 * 1. Celebration / Holiday of the Day (Curated & culturally adapted blend)
 * 2. Today in Science / Research (from https://todayinsci.com/ focusing on EVENTS – Science events on)
 * 3. Today in Music (from https://www.onthisday.com/ focusing on Today in Music)
 * 4. Today in Film & TV (from https://www.onthisday.com/ focusing on Today in Film & TV)
 *
 * Generates `data/daily-spotlights.json` with a single featured highlight for each,
 * localized and culturally adapted for English (en), French (fr), Italian (it),
 * Russian (ru), and Greek (el).
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'daily-spotlights.json');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (COSYevents/1.0)';

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        ...(options.headers || {})
      }
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Helper to translate/adapt short text chunks via MyMemory with timeout and graceful fallback
 */
async function translateText(text, targetLang) {
  if (!text || targetLang === 'en') return text;
  try {
    const encoded = encodeURIComponent(text.trim());
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|${targetLang}`;
    const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, 4500);
    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        let clean = data.responseData.translatedText.trim();
        // Discard if translation response looks like an error message
        if (!clean.toUpperCase().includes('MYMEMORY') && !clean.toUpperCase().includes('QUERY LENGTH LIMIT')) {
          return clean;
        }
      }
    }
  } catch (err) {
    // Non-fatal, fallback to adapted/original
  }
  return text;
}

/**
 * Curated calendar of notable cultural celebrations across target cultures
 * (key: MM-DD)
 */
const CULTURAL_CALENDAR = {
  '11-11': {
    en: {
      title: 'Armistice & Global Peace Day',
      description: 'Commemorating the cessation of hostilities on November 11, celebrated as a day of remembrance, reflection, and peace across Europe, the Commonwealth, and globally.'
    },
    fr: {
      title: 'Jour de l’Armistice & Fête de la Paix',
      description: 'Commémoration de la signature de l’armistice de 1918. En France et dans toute l’Europe, cette journée honore la paix, la mémoire collective et la concorde entre les peuples.'
    },
    it: {
      title: 'Giorno dell’Armistizio e della Concordia',
      description: 'Celebrazione della pace e della fine dei conflitti in Europa, dedicata al ricordo condiviso, alla riconciliazione e alla fratellanza internazionale.'
    },
    ru: {
      title: 'День окончания Первой мировой войны и мира',
      description: 'День памяти, посвящённый окончанию Первой мировой войны, символизирующий ценность мира, историческое осмысление и международное взаимопонимание.'
    },
    el: {
      title: 'Ημέρα Ανακωχής και Παγκόσμιας Ειρήνης',
      description: 'Επέτειος της ανακωχής του 1918 και ημέρα μνήμης αφιερωμένη στην παγκόσμια ειρήνη, την αλληλεγγύη και τη διεθνή συνεργασία των λαών.'
    }
  }
};

/**
 * 1. Celebration / Holiday of the Day
 * Curated blend using international observances with cultural adaptation for fr, it, ru, el.
 */
async function fetchCelebration(month, day) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const key = `${mm}-${dd}`;

  // If we have a culturally curated entry for this specific date, use it
  if (CULTURAL_CALENDAR[key]) {
    const c = CULTURAL_CALENDAR[key];
    return {
      category: 'celebration',
      categoryTitle: 'Holiday of the Day',
      title: c.en.title,
      badge: 'Celebration',
      description: c.en.description,
      details: c.en.title,
      clubLink: 'lets-celebrate.html',
      clubName: "Let's Celebrate",
      source: 'International & Cultural Observances',
      sourceUrl: 'https://en.wikipedia.org/wiki/Portal:Current_events',
      i18n: {
        en: { title: c.en.title, description: c.en.description },
        fr: { title: c.fr.title, description: c.fr.description },
        it: { title: c.it.title, description: c.it.description },
        ru: { title: c.ru.title, description: c.ru.description },
        el: { title: c.el.title, description: c.el.description }
      }
    };
  }

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/holidays/${mm}/${dd}`;
    const res = await fetchWithTimeout(url, {}, 8000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.holidays) && data.holidays.length > 0) {
        const filtered = data.holidays.filter(h => {
          const t = (h.text || '').toLowerCase();
          return !t.startsWith('christian feast day') && !t.includes('martyrologium');
        });
        const chosen = filtered.length > 0 ? filtered[0] : data.holidays[0];
        let enTitle = (chosen.text || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
        let enDesc = '';
        if (chosen.pages && chosen.pages.length > 0) {
          enDesc = chosen.pages[0].extract || '';
        }
        if (!enDesc) enDesc = chosen.text || enTitle;

        // Fetch translations for fr, it, ru, el
        const [frTitle, itTitle, ruTitle, elTitle] = await Promise.all([
          translateText(enTitle, 'fr'),
          translateText(enTitle, 'it'),
          translateText(enTitle, 'ru'),
          translateText(enTitle, 'el')
        ]);

        const [frDesc, itDesc, ruDesc, elDesc] = await Promise.all([
          translateText(enDesc.slice(0, 260), 'fr'),
          translateText(enDesc.slice(0, 260), 'it'),
          translateText(enDesc.slice(0, 260), 'ru'),
          translateText(enDesc.slice(0, 260), 'el')
        ]);

        return {
          category: 'celebration',
          categoryTitle: 'Holiday of the Day',
          title: enTitle,
          badge: 'Celebration',
          description: enDesc,
          details: chosen.text || enTitle,
          clubLink: 'lets-celebrate.html',
          clubName: "Let's Celebrate",
          source: 'International & Cultural Observances',
          sourceUrl: 'https://en.wikipedia.org/wiki/Portal:Current_events',
          i18n: {
            en: { title: enTitle, description: enDesc },
            fr: { title: frTitle || enTitle, description: frDesc || enDesc },
            it: { title: itTitle || enTitle, description: itDesc || enDesc },
            ru: { title: ruTitle || enTitle, description: ruDesc || enDesc },
            el: { title: elTitle || enTitle, description: elDesc || enDesc }
          }
        };
      }
    }
  } catch (err) {
    console.warn('Notice: Could not fetch Wikipedia holidays feed:', err.message);
  }

  // Fallback celebration
  return {
    category: 'celebration',
    categoryTitle: 'Holiday of the Day',
    title: 'World Kindness & Cultural Exchange Day',
    badge: 'Celebration',
    description: 'A global occasion celebrating unity, cross-cultural appreciation, and community traditions around the world.',
    details: 'International Day of Global Friendship & Cultural Understanding',
    clubLink: 'lets-celebrate.html',
    clubName: "Let's Celebrate",
    source: 'Global Traditions & Festivals',
    sourceUrl: 'https://cosylanguages.github.io/COSYevents/lets-celebrate.html',
    i18n: {
      en: {
        title: 'World Kindness & Cultural Exchange Day',
        description: 'A global occasion celebrating unity, cross-cultural appreciation, and community traditions around the world.'
      },
      fr: {
        title: 'Journée mondiale de la bienveillance et des échanges culturels',
        description: 'Une célébration planétaire dédiée à l’amitié, au dialogue interculturel et à la découverte des traditions de chaque pays.'
      },
      it: {
        title: 'Giornata mondiale della gentilezza e dello scambio culturale',
        description: 'Un momento globale per celebrare l’amicizia tra i popoli, il dialogo interculturale e le tradizioni della comunità.'
      },
      ru: {
        title: 'Всемирный день доброты и культурного обмена',
        description: 'Праздник взаимопонимания, межкультурного общения и уважения к традициям разных народов мира.'
      },
      el: {
        title: 'Παγκόσμια Ημέρα Καλοσύνης και Πολιτιστικής Ανταλλαγής',
        description: 'Μια παγκόσμια γιορτή αφιερωμένη στην αλληλοκατανόηση, τον διαπολιτισμικό διάλογο και τις κοινές παραδόσεις.'
      }
    }
  };
}

/**
 * 2. Today in Science / Research
 * URL: https://todayinsci.com/{MM}/{MM}_{DD}.htm
 * Target Section: EVENTS – Science events on
 */
async function fetchScienceEvent(month, day) {
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  const url = `https://todayinsci.com/${month}/${month}_${paddedDay}.htm`;

  let enTitle = 'Oldest insect fossils';
  let enYear = '1988';
  let enDesc = 'In 1988, the oldest known insect fossils (390 million yrs) were reported in Science.';

  try {
    const res = await fetchWithTimeout(url, {}, 10000);
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      const eventAnchor = $('a[name=event], a[NAME=event]');
      let subHeading = null;
      if (eventAnchor.length) {
        subHeading = eventAnchor.parent();
      } else {
        $('div.daysubheading').each((_, el) => {
          if (/EVENTS\s+[–-]\s+Science\s+events/i.test($(el).text())) {
            subHeading = $(el);
          }
        });
      }

      if (subHeading && subHeading.length) {
        let curr = subHeading.next();
        while (curr.length && !curr.hasClass('daysubheading')) {
          if (curr.hasClass('daynameheading')) {
            const headline = curr.text().replace(/\s+/g, ' ').trim();
            const bodyDiv = curr.next();
            let bodyText = bodyDiv.text().replace(/\s+/g, ' ').trim();
            bodyText = bodyText.replace(/«|»/g, '').trim();

            const yearMatch = bodyText.match(/^In\s+(\d{4}),?/i) || headline.match(/\b(\d{4})\b/);
            const year = yearMatch ? yearMatch[1] : '';

            if (headline && bodyText) {
              enTitle = headline;
              enYear = year;
              enDesc = bodyText;
              break;
            }
          }
          curr = curr.next();
        }
      }
    }
  } catch (err) {
    console.warn('Notice: Could not fetch Today in Science:', err.message);
  }

  // Multilingual adaptation
  const [frTitle, itTitle, ruTitle, elTitle] = await Promise.all([
    translateText(enTitle, 'fr'),
    translateText(enTitle, 'it'),
    translateText(enTitle, 'ru'),
    translateText(enTitle, 'el')
  ]);

  const [frDesc, itDesc, ruDesc, elDesc] = await Promise.all([
    translateText(enDesc.slice(0, 280), 'fr'),
    translateText(enDesc.slice(0, 280), 'it'),
    translateText(enDesc.slice(0, 280), 'ru'),
    translateText(enDesc.slice(0, 280), 'el')
  ]);

  return {
    category: 'science',
    categoryTitle: 'Today in Science',
    title: enTitle,
    year: enYear,
    badge: 'Research & Discovery',
    description: enDesc,
    clubLink: 'keeping-up-with-science.html',
    clubName: 'Keeping Up with Science',
    source: 'Today in Science History',
    sourceUrl: url,
    i18n: {
      en: { title: enTitle, description: enDesc },
      fr: { title: frTitle || enTitle, description: frDesc || enDesc },
      it: { title: itTitle || enTitle, description: itDesc || enDesc },
      ru: { title: ruTitle || enTitle, description: ruDesc || enDesc },
      el: { title: elTitle || enTitle, description: elDesc || enDesc }
    }
  };
}

/**
 * 3. Today in Music
 * Extracted from https://www.onthisday.com/music/ or homepage "Today in Music"
 */
async function fetchMusicEvent() {
  const candidateUrls = [
    'https://www.onthisday.com/music/',
    'https://www.onthisday.com/'
  ];

  let enTitle = "Jeux d'eau";
  let enYear = '1901';
  let enDesc = "Maurice Ravel's piano composition \"Jeux d'eau\" premieres";
  let foundUrl = 'https://www.onthisday.com/music/';

  for (const url of candidateUrls) {
    try {
      const res = await fetchWithTimeout(url, {}, 10000);
      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);

        let eventText = '';

        if (url.includes('/music/')) {
          const firstUl = $('ul.event-list').first();
          const firstLi = firstUl.find('li').first();
          if (firstLi.length) {
            eventText = firstLi.text().replace(/\s+/g, ' ').trim();
          }
        } else {
          const header = $('header.header-music');
          if (header.length) {
            const nextUl = header.nextAll('ul.event-list').first();
            const firstLi = nextUl.find('li').first();
            if (firstLi.length) {
              eventText = firstLi.text().replace(/\s+/g, ' ').trim();
            }
          }
        }

        if (eventText) {
          const yearMatch = eventText.match(/^(\d{4})\s+(.*)$/);
          let desc = eventText;
          if (yearMatch) {
            enYear = yearMatch[1];
            desc = yearMatch[2];
          }

          let title = '';
          const quoteMatch = desc.match(/"([^"]+)"/);
          if (quoteMatch) {
            title = quoteMatch[1];
          } else {
            const words = desc.split(' ');
            title = words.slice(0, 6).join(' ');
            if (words.length > 6) title += '...';
          }

          enTitle = title;
          enDesc = desc;
          foundUrl = url;
          break;
        }
      }
    } catch (err) {
      console.warn(`Notice: Failed fetching music from ${url}:`, err.message);
    }
  }

  // Multilingual adaptation
  const [frTitle, itTitle, ruTitle, elTitle] = await Promise.all([
    translateText(enTitle, 'fr'),
    translateText(enTitle, 'it'),
    translateText(enTitle, 'ru'),
    translateText(enTitle, 'el')
  ]);

  const [frDesc, itDesc, ruDesc, elDesc] = await Promise.all([
    translateText(enDesc.slice(0, 280), 'fr'),
    translateText(enDesc.slice(0, 280), 'it'),
    translateText(enDesc.slice(0, 280), 'ru'),
    translateText(enDesc.slice(0, 280), 'el')
  ]);

  return {
    category: 'music',
    categoryTitle: 'Today in Music',
    title: enTitle,
    year: enYear,
    badge: 'Music History',
    description: enDesc,
    clubLink: 'karaoke-club.html',
    clubName: 'Karaoke Club',
    source: 'On This Day - Today in Music',
    sourceUrl: foundUrl,
    i18n: {
      en: { title: enTitle, description: enDesc },
      fr: { title: frTitle || enTitle, description: frDesc || enDesc },
      it: { title: itTitle || enTitle, description: itDesc || enDesc },
      ru: { title: ruTitle || enTitle, description: ruDesc || enDesc },
      el: { title: elTitle || enTitle, description: elDesc || enDesc }
    }
  };
}

/**
 * 4. Today in Film & TV
 * Extracted from https://www.onthisday.com/film-tv/ or homepage "Today in Film & TV"
 */
async function fetchFilmTvEvent() {
  const candidateUrls = [
    'https://www.onthisday.com/film-tv/',
    'https://www.onthisday.com/'
  ];

  let enTitle = "Gentlemen's Agreement";
  let enYear = '1947';
  let enDesc = '"Gentlemen\'s Agreement" directed by Elia Kazan, and starring Gregory Peck and Dorothy McGuire, premieres in New York City (Best Picture 1948)';
  let foundUrl = 'https://www.onthisday.com/film-tv/';

  for (const url of candidateUrls) {
    try {
      const res = await fetchWithTimeout(url, {}, 10000);
      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);

        let eventText = '';

        if (url.includes('/film-tv/')) {
          const firstUl = $('ul.event-list').first();
          const firstLi = firstUl.find('li').first();
          if (firstLi.length) {
            eventText = firstLi.text().replace(/\s+/g, ' ').trim();
          }
        } else {
          const header = $('header.header-film-tv');
          if (header.length) {
            const nextUl = header.nextAll('ul.event-list').first();
            const firstLi = nextUl.find('li').first();
            if (firstLi.length) {
              eventText = firstLi.text().replace(/\s+/g, ' ').trim();
            }
          }
        }

        if (eventText) {
          const yearMatch = eventText.match(/^(\d{4})\s+(.*)$/);
          let desc = eventText;
          if (yearMatch) {
            enYear = yearMatch[1];
            desc = yearMatch[2];
          }

          let title = '';
          const quoteMatch = desc.match(/"([^"]+)"/);
          if (quoteMatch) {
            title = quoteMatch[1];
          } else {
            const words = desc.split(' ');
            title = words.slice(0, 6).join(' ');
            if (words.length > 6) title += '...';
          }

          enTitle = title;
          enDesc = desc;
          foundUrl = url;
          break;
        }
      }
    } catch (err) {
      console.warn(`Notice: Failed fetching film from ${url}:`, err.message);
    }
  }

  // Multilingual adaptation
  const [frTitle, itTitle, ruTitle, elTitle] = await Promise.all([
    translateText(enTitle, 'fr'),
    translateText(enTitle, 'it'),
    translateText(enTitle, 'ru'),
    translateText(enTitle, 'el')
  ]);

  const [frDesc, itDesc, ruDesc, elDesc] = await Promise.all([
    translateText(enDesc.slice(0, 280), 'fr'),
    translateText(enDesc.slice(0, 280), 'it'),
    translateText(enDesc.slice(0, 280), 'ru'),
    translateText(enDesc.slice(0, 280), 'el')
  ]);

  return {
    category: 'film',
    categoryTitle: 'Today in Film & TV',
    title: enTitle,
    year: enYear,
    badge: 'Cinema & Screen',
    description: enDesc,
    clubLink: 'cinema-nights/index.html',
    clubName: 'Cinema Nights',
    source: 'On This Day - Today in Film & TV',
    sourceUrl: foundUrl,
    i18n: {
      en: { title: enTitle, description: enDesc },
      fr: { title: frTitle || enTitle, description: frDesc || enDesc },
      it: { title: itTitle || enTitle, description: itDesc || enDesc },
      ru: { title: ruTitle || enTitle, description: ruDesc || enDesc },
      el: { title: elTitle || enTitle, description: elDesc || enDesc }
    }
  };
}

async function main() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dateFormatted = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  console.log(`Fetching daily spotlights for ${dateFormatted} (Month: ${month}, Day: ${day})...`);

  const [celebration, science, music, film] = await Promise.all([
    fetchCelebration(month, day),
    fetchScienceEvent(month, day),
    fetchMusicEvent(),
    fetchFilmTvEvent()
  ]);

  const output = {
    updated_at: new Date().toISOString(),
    display_date: dateFormatted,
    day: day,
    month: month,
    items: {
      celebration,
      science,
      music,
      film
    }
  };

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Daily spotlights successfully written to ${OUTPUT_PATH}`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error running fetch_daily_spotlights:', err);
    process.exit(1);
  });
}

module.exports = {
  fetchCelebration,
  fetchScienceEvent,
  fetchMusicEvent,
  fetchFilmTvEvent,
  translateText
};
