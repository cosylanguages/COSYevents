const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'data/sessions.json');
const OUTPUT_DIR = path.join(ROOT, 'private/session-exports');

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'source';
}

function sessionIdFromHref(href) {
  return `session-${href.replace(/\.html?$/i, '').replace(/[^a-zA-Z0-9]+/g, '-')}`
    .replace(/-+/g, '-').replace(/-$/g, '');
}

function readLabeledMeta($) {
  const meta = {};
  $('.meta-item').each((_, element) => {
    const label = cleanText($(element).find('h4').first().text()).toLowerCase();
    const value = cleanText($(element).find('p').first().text());
    if (label && value) meta[label] = value;
  });
  return meta;
}

function extractVocabulary($) {
  const entries = [];
  const seen = new Set();

  $('.vocab-card').each((_, element) => {
    const card = $(element);
    const word = cleanText(card.find('.vocab-word').first().text());
    if (!word || seen.has(word.toLowerCase())) return;
    seen.add(word.toLowerCase());

    const definition = cleanText(card.find('.vocab-def').first().text());
    const example = cleanText(card.find('.vocab-example').first().text());
    const opposite = cleanText(card.find('.vocab-opp-word').first().text());
    entries.push({
      word,
      definition,
      example,
      ...(opposite && !/^n\/a$/i.test(opposite) ? { opposite } : {})
    });
  });

  if (entries.length === 0) {
    $('.vocab-pill').each((_, element) => {
      const word = cleanText($(element).text());
      if (!word || seen.has(word.toLowerCase())) return;
      seen.add(word.toLowerCase());
      entries.push({ word, definition: '', example: '' });
    });
  }

  return entries;
}

function extractRoundItems($, element) {
  const items = [];
  const seen = new Set();
  const addItem = item => {
    const prompt = cleanText(item.prompt);
    const followUp = cleanText(item.follow_up);
    const key = `${prompt}\n${followUp}`.toLowerCase();
    if ((!prompt && !followUp) || seen.has(key)) return;
    seen.add(key);
    items.push({ prompt, ...(followUp ? { follow_up: followUp } : {}) });
  };

  $(element).find('.round-item').each((_, item) => {
    addItem({
      prompt: $(item).find('.round-item-main').first().text(),
      follow_up: $(item).find('.round-item-personal').first().text()
    });
  });

  $(element).find('.round-questions > li, .question-list > li, .question-card p, .discussion-question, .discussion-prompt').each((_, item) => {
    addItem({ prompt: $(item).text() });
  });

  $(element).find('.lyrics-checkpoint li').each((_, item) => {
    addItem({ prompt: $(item).text() });
  });

  if (/challenge/i.test($(element).attr('id') || '')) {
    $(element).find('.round-body > p, .round-body > div > div > p').each((_, item) => {
      addItem({ prompt: $(item).text() });
    });
  }

  return items;
}

function extractRounds($) {
  const rounds = [];
  const addRound = element => {
    const node = $(element);
    const title = cleanText(node.find('.round-header').first().text()) ||
      cleanText(node.find('h3, h4').first().text()) || 'Session discussion';
    const prompts = extractRoundItems($, element);
    if (prompts.length) rounds.push({ title, prompts });
  };

  $('.round-block').each((_, element) => {
    const node = $(element);
    const subRounds = node.find('.round-1, .round-2').toArray();
    if (subRounds.length > 0) {
      subRounds.forEach(addRound);
    } else {
      addRound(element);
    }
  });

  if (rounds.length === 0) {
    const prompts = extractRoundItems($, $('main').first());
    if (prompts.length) rounds.push({ title: 'Session discussion', prompts });
  }

  return rounds;
}

function extractGrammar($, meta) {
  const grammar = [];
  for (const [label, value] of Object.entries(meta)) {
    if (/grammar|linguistic focus|language focus/i.test(label)) grammar.push({ title: label, content: value });
  }

  const seen = new Set(grammar.map(item => item.content.toLowerCase()));
  $('[class*="grammar"], [id*="grammar"], [id*="lang-focus"]').each((_, element) => {
    const text = cleanText($(element).text());
    if (!text || text.length < 12 || seen.has(text.toLowerCase())) return;
    seen.add(text.toLowerCase());
    grammar.push({ title: cleanText($(element).find('h2, h3, h4').first().text()) || 'Grammar practice', content: text });
  });

  return grammar.length ? grammar : null;
}

function extractSources($, href) {
  const candidates = [];
  $('.meta-item').each((_, element) => {
    const label = cleanText($(element).find('h4').first().text());
    if (!/resource|source|reference/i.test(label)) return;
    $(element).find('a[href]').each((__, link) => {
      candidates.push({ title: cleanText($(link).text()), url: $(link).attr('href') });
    });
  });

  $('.theme-video-link a[href], .cosy-video-wrapper iframe[src]').each((_, element) => {
    const node = $(element);
    candidates.push({
      title: cleanText(node.text()) || cleanText(node.attr('title')) || 'Video source',
      url: node.attr('href') || node.attr('src')
    });
  });

  const byUrl = new Map();
  const nonHttps = [];
  for (const candidate of candidates) {
    let url;
    try {
      url = new URL(candidate.url, `https://cosyevents.invalid/${href}`);
    } catch {
      continue;
    }
    if (url.protocol !== 'https:') {
      nonHttps.push(candidate.url);
      continue;
    }

    const normalizedUrl = url.href;
    if (!byUrl.has(normalizedUrl)) {
      byUrl.set(normalizedUrl, {
        source_title: candidate.title || url.hostname,
        source_url: normalizedUrl
      });
    }
  }

  const sources = [...byUrl.entries()].map(([url, source], index) => {
    const sourceId = slugify(`${source.source_title}-${new URL(url).hostname}`);
    return { source_id: `${sourceId}-${index + 1}`, ...source, position: index };
  });

  return { sources, nonHttps };
}

function extractSession(catalogEntry) {
  const filePath = path.resolve(ROOT, catalogEntry.href);
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);
  const meta = readLabeledMeta($);
  const vocabulary = extractVocabulary($);
  const rounds = extractRounds($);
  const grammar = extractGrammar($, meta);
  const { sources, nonHttps } = extractSources($, catalogEntry.href);
  const discussion = rounds.flatMap(round => round.prompts.map(prompt => ({ round: round.title, ...prompt })));
  const h1Title = cleanText($('h1').first().text());
  const title = h1Title || catalogEntry.title.replace(/\s*:\s*COSYlanguages\s*$/i, '');
  const summary = cleanText($('.session-lead').first().text()) ||
    Object.entries(meta).find(([label]) => /thematic focus|^theme$|^topic$/i.test(label))?.[1] || '';
  const reviewNotes = [];

  if (!h1Title) reviewNotes.push('Session title fell back to the catalog title.');
  if (vocabulary.length === 0) reviewNotes.push('No vocabulary entries were extracted.');
  if (rounds.length === 0) reviewNotes.push('No discussion rounds were extracted.');
  if (!catalogEntry.level) reviewNotes.push('The catalog has no confirmed CEFR level.');
  if (sources.length === 0) reviewNotes.push('No source link was extracted; add bibliography manually if applicable.');
  if (nonHttps.length > 0) reviewNotes.push(`Non-HTTPS source links need manual review (${nonHttps.length}).`);

  const bibliography = sources.map(source => ({
    source_id: source.source_id,
    citation: `${source.source_title} (${new URL(source.source_url).hostname})`
  }));

  return {
    session_id: sessionIdFromHref(catalogEntry.href),
    review_status: 'needs_review',
    review_notes: reviewNotes,
    source_html: catalogEntry.href,
    public: {
      title,
      source_bibliography: bibliography,
      format: catalogEntry.format,
      language: catalogEntry.lang,
      level: catalogEntry.level || null,
      summary: summary || null,
      is_published: false
    },
    content: {
      vocabulary,
      rounds,
      grammar,
      discussion,
      sources
    }
  };
}

function parseArgs(args) {
  const options = { write: false, session: null, limit: Infinity };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--write') options.write = true;
    else if (args[i] === '--session') options.session = args[++i];
    else if (args[i] === '--limit') options.limit = Number(args[++i]);
    else throw new Error(`Unknown option: ${args[i]}`);
  }
  if (!Number.isInteger(options.limit) && options.limit !== Infinity) throw new Error('--limit must be a positive integer.');
  if (options.limit < 1) throw new Error('--limit must be a positive integer.');
  return options;
}

function csvField(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  let entries = catalog;
  if (options.session) entries = entries.filter(entry => entry.href === options.session);
  if (options.session && entries.length === 0) throw new Error(`Session not found in catalog: ${options.session}`);
  entries = entries.slice(0, options.limit);

  const report = {
    total: entries.length,
    exported: 0,
    errors: 0,
    needsReview: 0,
    vocabularyEmpty: 0,
    roundsEmpty: 0,
    discussionEmpty: 0,
    grammarMissing: 0,
    sourcesFound: 0
  };
  const failures = [];
  const reviewRows = [];
  for (const entry of entries) {
    try {
      const payload = extractSession(entry);
      report.exported++;
      report.needsReview++;
      report.sourcesFound += payload.content.sources.length;
      if (payload.content.vocabulary.length === 0) report.vocabularyEmpty++;
      if (payload.content.rounds.length === 0) report.roundsEmpty++;
      if (payload.content.discussion.length === 0) report.discussionEmpty++;
      if (payload.content.grammar === null) report.grammarMissing++;
      reviewRows.push([
        payload.session_id,
        entry.href,
        payload.public.title,
        entry.format,
        payload.public.level || '',
        payload.review_status,
        payload.content.sources.length,
        payload.content.vocabulary.length,
        payload.content.rounds.length,
        payload.content.discussion.length,
        payload.content.grammar ? 'present' : 'not detected',
        payload.review_notes.join(' | ')
      ]);

      if (options.write) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        const outputPath = path.join(OUTPUT_DIR, `${payload.session_id}.json`);
        fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
      }
    } catch (error) {
      report.errors++;
      failures.push({ href: entry.href, error: error.message });
    }
  }

  if (options.write && report.errors === 0) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const columns = ['session_id', 'source_html', 'title', 'format', 'level', 'review_status', 'source_count', 'vocabulary_count', 'round_count', 'discussion_count', 'grammar', 'review_notes'];
    const csv = [columns, ...reviewRows].map(row => row.map(csvField).join(',')).join('\n') + '\n';
    fs.writeFileSync(path.join(OUTPUT_DIR, 'review.csv'), csv, 'utf8');
  }

  console.log(JSON.stringify({ report, failures: failures.slice(0, 20), mode: options.write ? 'write-to-private' : 'report-only' }, null, 2));
  if (report.errors > 0) process.exitCode = 1;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { extractSession, extractVocabulary, extractRounds, extractSources };
