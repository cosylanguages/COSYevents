const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const TARGET_CLUBS = [
  'the-greatest-quotes',
  'debatable-relatable',
  'lets-celebrate',
  'my-life-with-without',
  'if-you-were'
];

function cleanText(str) {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

function extractMatch(html, regex, group = 1) {
  const m = html.match(regex);
  return m ? m[group].trim() : '';
}

function extractRoundItems(sectionHtml) {
  const items = [];
  if (!sectionHtml) return items;
  const mainMatches = [...sectionHtml.matchAll(/<div class="round-item-main">([\s\S]*?)<\/div>(?:\s*<div class="round-item-personal">([\s\S]*?)<\/div>)?/gi)];
  for (const match of mainMatches) {
    const main = cleanText(match[1]);
    const personal = match[2] ? cleanText(match[2]) : '';
    items.push({ main, ...(personal ? { personal } : {}) });
  }
  return items;
}

function parseSessionHtml(htmlContent) {
  const pageTitle = extractMatch(htmlContent, /<title>([\s\S]*?)<\/title>/i);
  const themeClass = extractMatch(htmlContent, /<body class="([^"]+)">/i);
  const heroStyleMatch = htmlContent.match(/<header class="session-hero"([^>]*)>/i);
  let heroBackground = '';
  if (heroStyleMatch) {
    const bgMatch = heroStyleMatch[1].match(/style="background:\s*([^"]+);?"/i);
    if (bgMatch) heroBackground = bgMatch[1].trim();
  }

  const clubTag = extractMatch(htmlContent, /<div class="club-tag">([\s\S]*?)<\/div>/i);
  const decoratorIcon = extractMatch(htmlContent, /<div class="session-decorator-icon">([\s\S]*?)<\/div>/i);
  const title = extractMatch(htmlContent, /<h1>([\s\S]*?)<\/h1>/i);
  const date = extractMatch(htmlContent, /<p class="session-date">([\s\S]*?)<\/p>/i);
  const breadcrumbsCurrent = extractMatch(htmlContent, /<span class="current">([\s\S]*?)<\/span>/i);

  // Meta grid
  let duration = '60 minutes';
  let languages = '🇬🇧 English';
  let level = 'Intermediate (B1)';
  let topic = '';
  let theme = '';
  let resources = '';
  let targetGrammar = '';

  const metaItems = htmlContent.match(/<div class="meta-item">[\s\S]*?<\/div>/gi) || [];
  for (const item of metaItems) {
    const h4 = extractMatch(item, /<h4>([\s\S]*?)<\/h4>/i);
    const p = extractMatch(item, /<p>([\s\S]*?)<\/p>/i);
    if (/duration/i.test(h4)) duration = p;
    else if (/languages/i.test(h4)) languages = p;
    else if (/level/i.test(h4)) level = p;
    else if (/topic/i.test(h4)) topic = p;
    else if (/theme/i.test(h4)) theme = p;
    else if (/resources/i.test(h4)) resources = p;
    else if (/grammar/i.test(h4)) targetGrammar = p;
  }

  // Description
  let description = '';
  const descMatch = htmlContent.match(/<\/div>\s*<div style="margin-bottom: 2rem;[^">]*">([\s\S]*?)<\/div>/i);
  if (descMatch) {
    description = descMatch[1].trim();
  }

  // Sensitive Topic Warning
  let sensitiveTopicWarning = '';
  const warnMatch = htmlContent.match(/<div class="sensitive-topic-warning">[\s\S]*?<div>[\s\S]*?<strong>Sensitive Topic Note:<\/strong>([\s\S]*?)<\/div>/i);
  if (warnMatch) sensitiveTopicWarning = cleanText(warnMatch[1]);

  // Format Profiles
  let debateDuel = null;
  if (htmlContent.includes('debate-duel-box')) {
    const box = extractMatch(htmlContent, /<div class="debate-duel-box">([\s\S]*?)<\/div>\s*<\/div>/i);
    if (box) {
      debateDuel = {
        core_dilemma: extractMatch(box, /<strong>Core Dilemma<\/strong>\s*<span>([\s\S]*?)<\/span>/i),
        side_a: extractMatch(box, /<strong>Side A[^<]*<\/strong>\s*<span>([\s\S]*?)<\/span>/i),
        side_b: extractMatch(box, /<strong>Side B[^<]*<\/strong>\s*<span>([\s\S]*?)<\/span>/i),
        thematic_symbol: extractMatch(box, /<strong>Thematic Symbol<\/strong>\s*<span>([\s\S]*?)<\/span>/i)
      };
    }
  }

  let celebrateTheme = null;
  if (htmlContent.includes('celebrate-theme-box')) {
    const box = extractMatch(htmlContent, /<div class="celebrate-theme-box">([\s\S]*?)<\/div>\s*<\/div>/i);
    if (box) {
      celebrateTheme = {
        thematic_symbol: extractMatch(box, /<strong>Thematic Symbol<\/strong>\s*<span>([\s\S]*?)<\/span>/i),
        traditional_rituals: extractMatch(box, /<strong>Traditional Rituals<\/strong>\s*<span>([\s\S]*?)<\/span>/i),
        signature_treat: extractMatch(box, /<strong>Signature Treat<\/strong>\s*<span>([\s\S]*?)<\/span>/i),
        linguistic_focus: extractMatch(box, /<strong>Linguistic Focus<\/strong>\s*<span>([\s\S]*?)<\/span>/i)
      };
    }
  }

  let lifeLedger = null;
  if (htmlContent.includes('life-ledger-box')) {
    const boxMatch = htmlContent.match(/<div class="life-ledger-box">([\s\S]*?)<\/div>\s*<\/div>/i);
    if (boxMatch) {
      const box = boxMatch[1];
      lifeLedger = {
        title: extractMatch(box, /<h3 class="life-ledger-title">([\s\S]*?)<\/h3>/i),
        with_title: extractMatch(box, /<div class="life-ledger-column with">\s*<h5>([\s\S]*?)<\/h5>/i),
        with_content: extractMatch(box, /<div class="life-ledger-column with">[\s\S]*?<p>([\s\S]*?)<\/p>/i),
        without_title: extractMatch(box, /<div class="life-ledger-column without">\s*<h5>([\s\S]*?)<\/h5>/i),
        without_content: extractMatch(box, /<div class="life-ledger-column without">[\s\S]*?<p>([\s\S]*?)<\/p>/i)
      };
    }
  }

  let perspectiveMirror = null;
  if (htmlContent.includes('perspective-mirror-box')) {
    const boxMatch = htmlContent.match(/<div class="perspective-mirror-box">([\s\S]*?)<\/div>\s*<\/div>/i);
    if (boxMatch) {
      const box = boxMatch[1];
      const titleMatch = box.match(/<h3[^>]*>[\s\S]*?<\/span>([\s\S]*?)<\/h3>/i);
      const anchorMatch = box.match(/<strong>🗣️ Speculative Syntactic Anchor:<\/strong>\s*([\s\S]*?)(?:<\/div>|$)/i);
      perspectiveMirror = {
        title: titleMatch ? titleMatch[1].trim() : 'Perspective Mirror Box',
        col1_title: extractMatch(box, /<div class="pm-col">\s*<h5>([\s\S]*?)<\/h5>/i),
        col1_content: extractMatch(box, /<div class="pm-col">[\s\S]*?<p>([\s\S]*?)<\/p>/i),
        col2_title: (box.match(/<div class="pm-col">[\s\S]*?<div class="pm-col">\s*<h5>([\s\S]*?)<\/h5>/i) || [])[1] || '',
        col2_content: (box.match(/<div class="pm-col">[\s\S]*?<div class="pm-col">[\s\S]*?<p>([\s\S]*?)<\/p>/i) || [])[1] || '',
        anchor: anchorMatch ? anchorMatch[1].trim() : ''
      };
    }
  }

  let philosophersLedger = null;
  if (htmlContent.includes('philosophers-ledger')) {
    const boxMatch = htmlContent.match(/<div class="philosophers-ledger"[^>]*>([\s\S]*?)<\/div>/i);
    if (boxMatch) {
      const box = boxMatch[1];
      philosophersLedger = {
        stamp: extractMatch(box, /<div class="quotes-theme-stamp">([\s\S]*?)<\/div>/i),
        title: extractMatch(box, /<h4[^>]*>([\s\S]*?)<\/h4>/i),
        quote: extractMatch(box, /<p id="ledger-quote"[^>]*>([\s\S]*?)<\/p>/i),
        button_text: extractMatch(box, /<button[^>]*id="ledger-next-btn"[^>]*>([\s\S]*?)<\/button>/i)
      };
    }
  }

  // Vocabulary
  const vocabulary = [];
  const vocabCards = htmlContent.match(/<div class="vocab-card">[\s\S]*?<\/div>\s*<\/div>/gi) || [];
  for (const card of vocabCards) {
    const word = extractMatch(card, /<div class="vocab-word">([\s\S]*?)<\/div>/i);
    const definition = extractMatch(card, /<div class="vocab-def">([\s\S]*?)<\/div>/i);
    const example = extractMatch(card, /<div class="vocab-example">([\s\S]*?)<\/div>/i);
    if (word) {
      vocabulary.push({ word, definition, example });
    }
  }

  // Warm Up
  let warmUp = null;
  const warmUpBlockMatch = htmlContent.match(/<div class="round-block warm-up[^"]*" id="s-warm">([\s\S]*?)<\/div>\s*<\/div>/i);
  if (warmUpBlockMatch) {
    const warmUpBlock = warmUpBlockMatch[1];
    const instruction = extractMatch(warmUpBlock, /<div class="vim-instruction">([\s\S]*?)<\/div>/i);
    const questions = [];
    const qMatches = warmUpBlock.match(/<li>([\s\S]*?)<\/li>/gi) || [];
    for (const q of qMatches) {
      questions.push(cleanText(q.replace(/<\/?li>/gi, '')));
    }
    warmUp = { instruction, questions };
  }

  // Optional Grammar Practice block
  let grammarHtml = '';
  const grammarBlockMatch = htmlContent.match(/<div class="round-block grammar[^"]*" id="s-grammar">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i) ||
                            htmlContent.match(/<div class="round-block grammar[^"]*" id="s-grammar">[\s\S]*?<\/div>\s*<\/div>/i);
  if (grammarBlockMatch) {
    grammarHtml = grammarBlockMatch[0].trim();
  }

  // Round 1
  let round1 = null;
  const r1BlockMatch = htmlContent.match(/<div class="round-block round-1[^"]*" id="s-r1">([\s\S]*?)(?=<div class="round-block lst|<div class="round-block round-2)/i);
  if (r1BlockMatch) {
    const r1Block = r1BlockMatch[1];
    const headerTitle = extractMatch(r1Block, /<div class="round-header"[^>]*>\s*<span>([\s\S]*?)<\/span>/i);
    const r1Title = headerTitle ? headerTitle.replace(/^🔵\s*/, '').trim() : 'Round 1';
    const badge = extractMatch(r1Block, /<div class="round-type-badge">([\s\S]*?)<\/div>/i);
    const instruction = extractMatch(r1Block, /<div class="vim-instruction">([\s\S]*?)<\/div>/i);
    const items = extractRoundItems(r1Block);
    round1 = { title: r1Title, badge, instruction, items };
  }

  // Let's Speak Together
  let letsSpeakTogether = null;
  const lstBlockMatch = htmlContent.match(/<div class="round-block lst[^"]*" id="s-lst">([\s\S]*?)(?=<div class="round-block round-2)/i);
  if (lstBlockMatch) {
    const lstBlock = lstBlockMatch[1];
    const headerTitle = extractMatch(lstBlock, /<div class="round-header"[^>]*>\s*<span>([\s\S]*?)<\/span>/i);
    const lstTitle = headerTitle ? headerTitle.replace(/^🟣\s*/, '').trim() : "Let's Speak Together";
    const bodyMatch = lstBlock.match(/<div class="round-body"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
    let note = '';
    if (bodyMatch) {
      note = bodyMatch[1].trim();
    } else {
      const fallbackMatch = lstBlock.match(/<div class="round-body"[^>]*>([\s\S]*?)$/i);
      note = fallbackMatch ? fallbackMatch[1].trim() : '';
    }
    // Remove any trailing unclosed div tags or comment markers
    note = note.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/div>\s*$/, '').trim();
    letsSpeakTogether = { title: lstTitle, note };
  }

  // Round 2
  let round2 = null;
  const r2BlockMatch = htmlContent.match(/<div class="round-block round-2[^"]*" id="s-r2">([\s\S]*?)(?=<div class="round-block|<div class="mistake-block)/i);
  if (r2BlockMatch) {
    const r2Block = r2BlockMatch[1];
    const headerTitle = extractMatch(r2Block, /<div class="round-header"[^>]*>\s*<span>([\s\S]*?)<\/span>/i);
    const r2Title = headerTitle ? headerTitle.replace(/^🟢\s*/, '').trim() : 'Round 2';
    const badge = extractMatch(r2Block, /<div class="round-type-badge">([\s\S]*?)<\/div>/i);
    const instruction = extractMatch(r2Block, /<div class="vim-instruction">([\s\S]*?)<\/div>/i);
    const items = extractRoundItems(r2Block);
    round2 = { title: r2Title, badge, instruction, items };
  }

  // Closing
  let closingHtml = '';
  const closingMatch = htmlContent.match(/<div class="round-block (?:closing open|open)" id="s-clos(?:e|ing)">[\s\S]*?<\/div>\s*<\/div>/i);
  if (closingMatch) {
    closingHtml = closingMatch[0].trim();
  }

  // Mistakes
  const mistakes = [];
  const mistakeBlockMatch = htmlContent.match(/<div class="mistake-block[^"]*" id="s-mistakes">([\s\S]*?)<\/div>\s*<\/div>/i);
  if (mistakeBlockMatch) {
    const mistakeBlock = mistakeBlockMatch[1];
    const items = mistakeBlock.match(/<div class="mistake-item">[\s\S]*?<\/div>/gi) || [];
    for (const item of items) {
      const wrong = extractMatch(item, /<span class="mistake-wrong">([\s\S]*?)<\/span>/i);
      const right = extractMatch(item, /<span class="mistake-right">([\s\S]*?)<\/span>/i);
      const note = extractMatch(item, /<span class="mistake-note-text">([\s\S]*?)<\/span>/i);
      mistakes.push({ wrong, right, note });
    }
  }

  // Script
  let scriptHtml = '';
  const scriptMatch = htmlContent.match(/<script>(?![\s\S]*cosyevents-session\.js)[\s\S]*?<\/script>/i);
  if (scriptMatch) {
    scriptHtml = scriptMatch[0].trim();
  }

  return {
    title,
    page_title: pageTitle,
    breadcrumbs_current: breadcrumbsCurrent,
    club_tag: clubTag,
    date,
    theme_class: themeClass,
    decorator_icon: decoratorIcon,
    duration,
    languages,
    level,
    ...(topic ? { topic } : {}),
    ...(theme ? { theme } : {}),
    ...(resources ? { resources } : {}),
    ...(targetGrammar ? { target_grammar: targetGrammar } : {}),
    ...(heroBackground ? { hero_background: heroBackground } : {}),
    description,
    ...(sensitiveTopicWarning ? { sensitive_topic_warning: sensitiveTopicWarning } : {}),
    ...(debateDuel ? { debate_duel: debateDuel } : {}),
    ...(celebrateTheme ? { celebrate_theme: celebrateTheme } : {}),
    ...(lifeLedger ? { life_ledger: lifeLedger } : {}),
    ...(perspectiveMirror ? { perspective_mirror: perspectiveMirror } : {}),
    ...(philosophersLedger ? { philosophers_ledger: philosophersLedger } : {}),
    vocabulary,
    warm_up: warmUp,
    ...(grammarHtml ? { grammar_html: grammarHtml } : {}),
    round_1: round1,
    lets_speak_together: letsSpeakTogether,
    round_2: round2,
    ...(closingHtml ? { closing_html: closingHtml } : {}),
    mistakes,
    ...(scriptHtml ? { script_html: scriptHtml } : {})
  };
}

function convertClub(clubSlug) {
  const dir = path.join(__dirname, `../sessions/${clubSlug}`);
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  console.log(`Converting ${files.length} HTML files in sessions/${clubSlug}/ to Markdown...`);

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    const htmlPath = path.join(dir, file);
    const mdPath = path.join(dir, `${slug}.md`);

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const parsedData = parseSessionHtml(htmlContent);

    const yamlStr = yaml.dump(parsedData, { lineWidth: -1, noRefs: true, forceQuotes: false });
    const mdContent = `---\n${yamlStr}---\n`;

    fs.writeFileSync(mdPath, mdContent, 'utf8');
    console.log(`[Converted] ${mdPath}`);
  }
}

function convertAll() {
  for (const club of TARGET_CLUBS) {
    convertClub(club);
  }
}

if (require.main === module) {
  convertAll();
}

module.exports = { parseSessionHtml, convertClub, convertAll };
