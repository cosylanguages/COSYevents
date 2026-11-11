#!/usr/bin/env node

/**
 * scripts/fetch_daily_spotlights.js
 *
 * Fetches and extracts 4 daily elements:
 * 1. Celebration / Holiday of the Day (Curated blend)
 * 2. Today in Science / Research (from https://todayinsci.com/ focusing on EVENTS – Science events on)
 * 3. Today in Music (from https://www.onthisday.com/ focusing on Today in Music)
 * 4. Today in Film & TV (from https://www.onthisday.com/ focusing on Today in Film & TV)
 *
 * Generates `data/daily-spotlights.json` with a single featured highlight for each.
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
 * 1. Celebration / Holiday of the Day
 * Curated blend using international observances from Wikipedia API with fallback to curated cultural days.
 */
async function fetchCelebration(month, day) {
  try {
    const paddedMonth = String(month).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/holidays/${paddedMonth}/${paddedDay}`;
    const res = await fetchWithTimeout(url, {}, 8000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.holidays) && data.holidays.length > 0) {
        // Find an appealing, secular/cultural or international holiday
        const filtered = data.holidays.filter(h => {
          const t = (h.text || '').toLowerCase();
          return !t.startsWith('christian feast day') && !t.includes('martyrologium');
        });
        const chosen = filtered.length > 0 ? filtered[0] : data.holidays[0];
        let title = chosen.text || '';
        let desc = '';
        if (chosen.pages && chosen.pages.length > 0) {
          desc = chosen.pages[0].extract || '';
        }
        return {
          category: 'celebration',
          categoryTitle: 'Holiday of the Day',
          title: title.replace(/\s*\([^)]*\)\s*$/, '').trim(),
          badge: 'Celebration',
          description: desc || title,
          details: title,
          clubLink: 'lets-celebrate.html',
          clubName: "Let's Celebrate",
          source: 'International & Cultural Observances',
          sourceUrl: 'https://en.wikipedia.org/wiki/Portal:Current_events'
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
    description: 'A global occasion celebrating unity, cross-cultural appreciation, and community traditions.',
    details: 'International Day of Global Friendship & Cultural Understanding',
    clubLink: 'lets-celebrate.html',
    clubName: "Let's Celebrate",
    source: 'Global Traditions & Festivals',
    sourceUrl: 'https://cosylanguages.github.io/COSYevents/lets-celebrate.html'
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

  try {
    const res = await fetchWithTimeout(url, {}, 10000);
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      // Locate anchor name="event" or text matching "EVENTS – Science events on"
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
            // Clean up text
            let bodyText = bodyDiv.text().replace(/\s+/g, ' ').trim();
            // Strip trailing quotes or formatting markers
            bodyText = bodyText.replace(/«|»/g, '').trim();

            // Extract year if present
            const yearMatch = bodyText.match(/^In\s+(\d{4}),?/i) || headline.match(/\b(\d{4})\b/);
            const year = yearMatch ? yearMatch[1] : '';

            if (headline && bodyText) {
              return {
                category: 'science',
                categoryTitle: 'Today in Science',
                title: headline,
                year: year,
                badge: 'Research & Discovery',
                description: bodyText,
                clubLink: 'keeping-up-with-science.html',
                clubName: 'Keeping Up with Science',
                source: 'Today in Science History',
                sourceUrl: url
              };
            }
          }
          curr = curr.next();
        }
      }
    }
  } catch (err) {
    console.warn('Notice: Could not fetch Today in Science:', err.message);
  }

  return {
    category: 'science',
    categoryTitle: 'Today in Science',
    title: 'Breakthrough in Substratosphere Exploration',
    year: '1935',
    badge: 'Research & Discovery',
    description: 'Explorer II sealed gondola reaches record altitude in the stratosphere to analyze ozone atmospheric composition and cosmic radiation.',
    clubLink: 'keeping-up-with-science.html',
    clubName: 'Keeping Up with Science',
    source: 'Today in Science History',
    sourceUrl: 'https://todayinsci.com/'
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

  for (const url of candidateUrls) {
    try {
      const res = await fetchWithTimeout(url, {}, 10000);
      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);

        let eventText = '';
        let year = '';

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
            year = yearMatch[1];
            desc = yearMatch[2];
          }

          // Try to extract a clean title from quotes or before the verb, or use short headline
          let title = '';
          const quoteMatch = desc.match(/"([^"]+)"/);
          if (quoteMatch) {
            title = quoteMatch[1];
          } else {
            const words = desc.split(' ');
            title = words.slice(0, 6).join(' ');
            if (words.length > 6) title += '...';
          }

          return {
            category: 'music',
            categoryTitle: 'Today in Music',
            title: title,
            year: year,
            badge: 'Music History',
            description: desc,
            clubLink: 'karaoke-club.html',
            clubName: 'Karaoke Club',
            source: 'On This Day - Today in Music',
            sourceUrl: url
          };
        }
      }
    } catch (err) {
      console.warn(`Notice: Failed fetching music from ${url}:`, err.message);
    }
  }

  return {
    category: 'music',
    categoryTitle: 'Today in Music',
    title: 'Louis Armstrong & His Hot Five Recording Session',
    year: '1925',
    badge: 'Music History',
    description: 'Louis Armstrong and his Hot Five begin their legendary first recording sessions at Okeh Records in Chicago, defining modern jazz improvisation.',
    clubLink: 'karaoke-club.html',
    clubName: 'Karaoke Club',
    source: 'On This Day - Today in Music',
    sourceUrl: 'https://www.onthisday.com/music/'
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

  for (const url of candidateUrls) {
    try {
      const res = await fetchWithTimeout(url, {}, 10000);
      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);

        let eventText = '';
        let year = '';

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
            year = yearMatch[1];
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

          return {
            category: 'film',
            categoryTitle: 'Today in Film & TV',
            title: title,
            year: year,
            badge: 'Cinema & Screen',
            description: desc,
            clubLink: 'cinema-nights/index.html',
            clubName: 'Cinema Nights',
            source: 'On This Day - Today in Film & TV',
            sourceUrl: url
          };
        }
      }
    } catch (err) {
      console.warn(`Notice: Failed fetching film from ${url}:`, err.message);
    }
  }

  return {
    category: 'film',
    categoryTitle: 'Today in Film & TV',
    title: 'Gentlemen\'s Agreement Premieres in New York',
    year: '1947',
    badge: 'Cinema & Screen',
    description: 'Elia Kazan\'s acclaimed drama "Gentlemen\'s Agreement" starring Gregory Peck premieres, later winning the 1948 Academy Award for Best Picture.',
    clubLink: 'cinema-nights/index.html',
    clubName: 'Cinema Nights',
    source: 'On This Day - Today in Film & TV',
    sourceUrl: 'https://www.onthisday.com/film-tv/'
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
  console.log(JSON.stringify(output, null, 2));
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
  fetchFilmTvEvent
};
