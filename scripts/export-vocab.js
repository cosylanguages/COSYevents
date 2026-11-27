const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..');
const TAXONOMY_PATH = path.join(ROOT, 'taxonomy/themes.json');
const OUTPUT_FILE = path.join(ROOT, 'data/vocab-export.json');
const PUBLIC_OUTPUT_FILE = path.join(ROOT, 'public-events-vocab.json');

const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf8'));

const LANG_MAP = {
  english: 'en',
  en: 'en',
  french: 'fr',
  fr: 'fr',
  italian: 'it',
  it: 'it',
  russian: 'ru',
  ru: 'ru',
  greek: 'el',
  el: 'el',
  spanish: 'es',
  es: 'es',
  german: 'de',
  de: 'de'
};

function parseLangCode(langStr) {
  if (!langStr) return 'en';
  const clean = String(langStr).toLowerCase();
  for (const [key, code] of Object.entries(LANG_MAP)) {
    if (clean.includes(key)) return code;
  }
  return 'en';
}

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'term';
}

function normalizeForm(posStr, term) {
  if (!posStr) {
    return term.trim().includes(' ') ? 'expression' : 'noun';
  }
  const clean = String(posStr).toLowerCase().trim();
  if (/^n(oun)?$/i.test(clean)) return 'noun';
  if (/^v(erb)?$/i.test(clean)) return 'verb';
  if (/^adj(ective)?$/i.test(clean)) return 'adjective';
  if (/^adv(erb)?$/i.test(clean)) return 'adverb';
  if (/^idiom$/i.test(clean)) return 'idiom';
  if (/^phrase|expression$/i.test(clean)) return 'expression';
  return slugify(clean) || 'noun';
}

function resolveThemes(clubSlug, rawTheme, explicitPrimary, explicitSub) {
  if (explicitPrimary && explicitSub && taxonomy.themes[explicitPrimary]?.sub_themes[explicitSub]) {
    return { primary_theme: explicitPrimary, sub_theme: explicitSub };
  }

  const slug = (clubSlug || '').toLowerCase();
  const themeText = (rawTheme || '').toLowerCase();

  if (slug.includes('mind') || themeText.includes('psycholog') || themeText.includes('bias')) {
    return { primary_theme: 'psychology-mind', sub_theme: 'cognitive-biases' };
  }
  if (slug.includes('quote') || themeText.includes('quote') || themeText.includes('philosoph')) {
    return { primary_theme: 'philosophy-ethics', sub_theme: 'quotes-wisdom' };
  }
  if (slug.includes('debate') || themeText.includes('debate') || themeText.includes('social')) {
    return { primary_theme: 'culture-society', sub_theme: 'social-issues' };
  }
  if (slug.includes('celebrate') || themeText.includes('celebrat') || themeText.includes('holiday')) {
    return { primary_theme: 'culture-society', sub_theme: 'traditions-celebrations' };
  }
  if (slug.includes('science') || themeText.includes('scien') || themeText.includes('tech')) {
    return { primary_theme: 'nature-science', sub_theme: 'scientific-discoveries' };
  }
  if (slug.includes('wonder') || themeText.includes('existential')) {
    return { primary_theme: 'philosophy-ethics', sub_theme: 'existentialism' };
  }
  if (slug.includes('cinema') || themeText.includes('movie') || themeText.includes('film')) {
    return { primary_theme: 'arts-entertainment', sub_theme: 'cinema-film' };
  }
  if (slug.includes('karaoke') || themeText.includes('music') || themeText.includes('song')) {
    return { primary_theme: 'arts-entertainment', sub_theme: 'music-lyrics' };
  }
  if (slug.includes('read') || themeText.includes('book') || themeText.includes('literature')) {
    return { primary_theme: 'arts-entertainment', sub_theme: 'literature' };
  }
  if (slug.includes('food') || themeText.includes('dining') || themeText.includes('meal')) {
    return { primary_theme: 'everyday-life', sub_theme: 'dining-food' };
  }
  if (slug.includes('if-you-were')) {
    return { primary_theme: 'philosophy-ethics', sub_theme: 'perspectives' };
  }
  if (slug.includes('life') || themeText.includes('everyday') || themeText.includes('routine')) {
    return { primary_theme: 'everyday-life', sub_theme: 'routines' };
  }

  return { primary_theme: 'everyday-life', sub_theme: 'routines' };
}

function processVocabularyItem(item, langCode, defaultThemes) {
  const rawTerm = item.word || item.term || '';
  const term = rawTerm.replace(/≠.*/, '').trim();
  const pos = item.pos || (rawTerm.includes('≠') ? 'adjective' : null);
  const form = normalizeForm(pos, term);
  const termSlug = slugify(term);

  const id = item.id || `${langCode}:${termSlug}:${form}`;

  const primary_theme = item.primary_theme || defaultThemes.primary_theme || 'everyday-life';
  const sub_theme = item.sub_theme || defaultThemes.sub_theme || 'routines';

  return {
    id,
    term,
    pos: form,
    definition: item.definition || '',
    translation: item.translation || '',
    example: item.example || '',
    primary_theme,
    sub_theme,
    tags: item.tags || [primary_theme, sub_theme],
    level: item.level || 'B1'
  };
}

function collectFromEventsJson() {
  const eventsDir = path.join(ROOT, 'events');
  const sessionExports = [];

  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'event.json') {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          if (data.vocabulary && Array.isArray(data.vocabulary) && data.vocabulary.length > 0) {
            const langCode = parseLangCode(data.language);
            const defaultThemes = resolveThemes(data.event, data.theme);
            const vocabulary = data.vocabulary.map(v => processVocabularyItem(v, langCode, defaultThemes));

            sessionExports.push({
              sessionId: data.slug || path.basename(entry.name, '.json'),
              sessionTitle: data.title,
              eventType: 'speaking-club',
              language: data.language || 'English',
              level: data.level || 'A2',
              exportDate: data.date || new Date().toISOString().split('T')[0],
              vocabulary
            });
          }
        } catch (e) {
          console.warn(`[export-vocab] Error reading JSON file ${fullPath}: ${e.message}`);
        }
      }
    }
  }

  scan(eventsDir);
  return sessionExports;
}

function collectFromMarkdownSessions() {
  const sessionsDir = path.join(ROOT, 'sessions');
  const sessionExports = [];

  function scan(dir, clubSlug = '') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath, entry.name);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
          if (match) {
            const data = yaml.load(match[1]);
            if (data.vocabulary && Array.isArray(data.vocabulary) && data.vocabulary.length > 0) {
              const langCode = parseLangCode(data.languages || 'English');
              const defaultThemes = resolveThemes(clubSlug, data.topic || data.theme || data.club_tag);
              const vocabulary = data.vocabulary.map(v => processVocabularyItem(v, langCode, defaultThemes));

              sessionExports.push({
                sessionId: `${clubSlug}-${entry.name.replace(/\.md$/, '')}`,
                sessionTitle: data.title || entry.name.replace(/\.md$/, ''),
                eventType: 'speaking-club',
                language: data.languages || 'English',
                level: data.level || 'B1',
                exportDate: data.date || new Date().toISOString().split('T')[0],
                vocabulary
              });
            }
          }
        } catch (e) {
          console.warn(`[export-vocab] Error reading MD file ${fullPath}: ${e.message}`);
        }
      }
    }
  }

  scan(sessionsDir);
  return sessionExports;
}

function exportVocab() {
  console.log('[export-vocab] Extracting session vocabularies...');
  const jsonExports = collectFromEventsJson();
  const mdExports = collectFromMarkdownSessions();
  const allExports = [...jsonExports, ...mdExports];

  let totalTerms = 0;
  for (const s of allExports) {
    totalTerms += s.vocabulary.length;
  }

  console.log(`[export-vocab] Extracted ${allExports.length} session export packages with ${totalTerms} vocabulary terms.`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allExports, null, 2) + '\n', 'utf8');
  fs.writeFileSync(PUBLIC_OUTPUT_FILE, JSON.stringify({ sessionsCount: allExports.length, totalTerms, sessions: allExports }, null, 2) + '\n', 'utf8');

  console.log(`[export-vocab] Exported vocabulary data to ${OUTPUT_FILE} and ${PUBLIC_OUTPUT_FILE}`);
  return { sessionsCount: allExports.length, totalTerms };
}

if (require.main === module) {
  try {
    exportVocab();
  } catch (e) {
    console.error('[export-vocab] Failed:', e);
    process.exitCode = 1;
  }
}

module.exports = { exportVocab, resolveThemes, processVocabularyItem, parseLangCode, normalizeForm, slugify };
