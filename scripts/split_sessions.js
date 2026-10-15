const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'data/sessions.json');

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function parseMarkdownFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  const frontmatter = yaml.load(match[1]);
  const markdownBody = match[2].trim();
  return { ...frontmatter, markdownBody };
}

function mapLanguageCode(langStr) {
  if (!langStr) return 'en';
  const str = String(langStr).toLowerCase();
  if (str.includes('french') || str.includes('🇫🇷') || str === 'fr') return 'fr';
  if (str.includes('russian') || str.includes('🇷🇺') || str === 'ru') return 'ru';
  if (str.includes('greek') || str.includes('🇬🇷') || str === 'el') return 'el';
  if (str.includes('italian') || str.includes('🇮🇹') || str === 'it') return 'it';
  if (str.includes('spanish') || str.includes('🇪🇸') || str === 'es') return 'es';
  return 'en';
}

function extractFromMarkdown(filepath, relPath) {
  const data = parseMarkdownFile(filepath);
  if (!data) return null;

  const slug = path.basename(filepath, '.md');
  const clubDir = path.basename(path.dirname(filepath));
  const sessionId = `session-${clubDir}-${slug}`;
  const lang = mapLanguageCode(data.languages || data.lang || 'en');
  const cefr = (data.level || 'B1').match(/A0|A1|A2|B1|B2|C1|C2/i)?.[0]?.toLowerCase() || 'b1';

  const vocab = (data.vocabulary || []).map(v => ({
    word: cleanText(v.word),
    translation: cleanText(v.translation || ''),
    definition: cleanText(v.definition || ''),
    example: cleanText(v.example || '')
  }));

  const stub = {
    id: sessionId,
    slug,
    title: cleanText(data.title),
    club: cleanText(data.club_tag || clubDir),
    club_id: clubDir,
    language: lang,
    cefr,
    date: cleanText(data.date || ''),
    duration: cleanText(data.duration || '60 minutes'),
    decorator_icon: data.decorator_icon || '🎙️',
    theme_class: data.theme_class || '',
    resources: cleanText(data.resources || ''),
    description: cleanText((data.description || '').replace(/<[^>]+>/g, '')),
    vocabulary: vocab,
    source_file: relPath
  };

  const protectedBody = {
    id: sessionId,
    kind: 'session-body',
    slug,
    language: lang,
    cefr,
    title: stub.title,
    summary: stub.description,
    body: {
      perspective_mirror: data.perspective_mirror || null,
      mind_profile: data.mind_profile || null,
      debate_duel: data.debate_duel || null,
      life_ledger: data.life_ledger || null,
      celebrate_theme: data.celebrate_theme || null,
      philosophers_ledger: data.philosophers_ledger || null,
      science_takeaway: data.science_takeaway || null,
      film_metadata: data.film_metadata || null,
      song_metadata: data.song_metadata || null,
      warm_up: data.warm_up || null,
      round_1: data.round_1 || null,
      lets_speak_together: data.lets_speak_together || null,
      round_2: data.round_2 || null,
      closing_html: data.closing_html || null,
      mistakes: data.mistakes || null,
      facilitator_notes: data.facilitator_notes || null,
      teacher_notes: data.teacher_notes || null,
      markdown_body: data.markdownBody || null
    }
  };

  return { stub, protectedRecord: protectedBody };
}

function extractFromHtml(filepath, catalogEntry) {
  const html = fs.readFileSync(filepath, 'utf8');
  const $ = cheerio.load(html);

  const relPath = catalogEntry.href;
  const slug = path.basename(relPath, '.html');
  const sessionId = `session-${relPath.replace(/\.html?$/i, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/-$/g, '')}`;

  const lang = mapLanguageCode(catalogEntry.lang || 'en');
  const cefr = (catalogEntry.level || 'B1').match(/A0|A1|A2|B1|B2|C1|C2/i)?.[0]?.toLowerCase() || 'b1';

  const vocab = [];
  $('.vocab-card').each((_, el) => {
    const card = $(el);
    const word = cleanText(card.find('.vocab-word').first().text());
    if (word) {
      vocab.push({
        word,
        translation: '',
        definition: cleanText(card.find('.vocab-def').first().text()),
        example: cleanText(card.find('.vocab-example').first().text())
      });
    }
  });

  const title = cleanText($('h1').first().text()) || cleanText(catalogEntry.title.replace(/\s*:\s*COSYlanguages\s*$/i, ''));
  const description = cleanText($('.session-lead, main > div').first().text());

  const stub = {
    id: sessionId,
    slug,
    title,
    club: cleanText(catalogEntry.club || ''),
    language: lang,
    cefr,
    date: cleanText($('.session-date').first().text()),
    duration: cleanText($('.meta-item:contains("Duration") p').text() || '60 minutes'),
    decorator_icon: cleanText($('.session-decorator-icon').first().text()) || '🎙️',
    description,
    vocabulary: vocab,
    source_file: relPath
  };

  const rounds = [];
  $('.round-block').each((_, el) => {
    const node = $(el);
    const roundTitle = cleanText(node.find('.round-header span').first().text());
    const prompts = [];
    node.find('.round-item-main, .round-questions li').each((__, item) => {
      const text = cleanText($(item).text());
      if (text) prompts.push(text);
    });
    if (prompts.length) rounds.push({ title: roundTitle, prompts });
  });

  const protectedRecord = {
    id: sessionId,
    kind: 'session-body',
    slug,
    language: lang,
    cefr,
    title,
    summary: description,
    body: {
      rounds,
      facilitator_notes: cleanText($('#facilitator-notes .ce-gated-content').text()) || null,
      recording_url: $('#recording-url iframe').attr('src') || null
    }
  };

  return { stub, protectedRecord };
}

function processAllSessions(filterClub = null, dryRun = true) {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

  let entries = catalog;
  if (filterClub) {
    entries = catalog.filter(s => s.href.includes(filterClub) || (s.club && s.club.toLowerCase().includes(filterClub.toLowerCase())));
  }

  let stubsCount = 0;
  let protectedCount = 0;
  let totalVocabCount = 0;
  const results = [];

  for (const entry of entries) {
    const htmlPath = path.resolve(ROOT, entry.href);
    const mdPath = htmlPath.replace(/\.html$/, '.md');

    let result = null;
    if (fs.existsSync(mdPath)) {
      result = extractFromMarkdown(mdPath, entry.href.replace(/\.html$/, '.md'));
    } else if (fs.existsSync(htmlPath)) {
      result = extractFromHtml(htmlPath, entry);
    }

    if (result) {
      stubsCount++;
      protectedCount++;
      totalVocabCount += result.stub.vocabulary.length;
      results.push(result);
    }
  }

  console.log('=== SESSION SPLIT REPORT ===');
  console.log(`Club filter: ${filterClub || 'ALL CLUBS'}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}`);
  console.log(`Catalog entries checked: ${entries.length}`);
  console.log(`Public stubs generated: ${stubsCount}`);
  console.log(`Protected records generated (kind: session-body): ${protectedCount}`);
  console.log(`Total vocabulary items extracted: ${totalVocabCount}`);

  if (!dryRun) {
    const stubsDir = path.join(ROOT, 'private/stubs');
    const protectedDir = path.join(ROOT, 'protected-export');
    fs.mkdirSync(stubsDir, { recursive: true });
    fs.mkdirSync(protectedDir, { recursive: true });

    for (const item of results) {
      fs.writeFileSync(
        path.join(stubsDir, `${item.stub.id}.json`),
        JSON.stringify(item.stub, null, 2),
        'utf8'
      );
      fs.writeFileSync(
        path.join(protectedDir, `${item.protectedRecord.id}.json`),
        JSON.stringify(item.protectedRecord, null, 2),
        'utf8'
      );
    }
    console.log(`Saved public stubs to ${stubsDir} and protected records to ${protectedDir}`);
  }

  return { stubsCount, protectedCount, totalVocabCount };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const isWrite = args.includes('--write');
  let club = null;
  const clubIdx = args.indexOf('--club');
  if (clubIdx !== -1 && args[clubIdx + 1]) {
    club = args[clubIdx + 1];
  }

  processAllSessions(club, !isWrite);
}

module.exports = { processAllSessions, extractFromMarkdown, extractFromHtml };
