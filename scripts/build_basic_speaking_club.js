#!/usr/bin/env node
'use strict';

/**
 * Builds the A0–A1 Basic Speaking Club session pages from data/basic-speaking-club-sessions.json.
 *
 * Each session is the same six cards: ten core words, one opinion question, three
 * this-or-that choices, one real-life mini-action, one forward-looking frame and a
 * takeaway. The data file holds only the topic content; the structure lives here.
 *
 *   node scripts/build_basic_speaking_club.js          # write pages and markdown
 *   node scripts/build_basic_speaking_club.js --check  # exit 1 if a page is out of date
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { stampHtml } = require('./lib/cms_stamp');

const DATA_PATH = path.join(__dirname, '../data/basic-speaking-club-sessions.json');
const TEMPLATE_PATH = path.join(__dirname, '../templates/basic-speaking-club-session.html');
const OUT_DIR = path.join(__dirname, '../sessions/basic-speaking-club');

const CLUB_TAG = 'Basic Speaking Club';
const LEVEL = 'Beginner (A0–A1)';
const DURATION = '60 minutes';
const LANGUAGES = '🇬🇧 English';
const DECORATOR = '🌱';
const RUN = 'demo with one student (2 min) → pairs (5 min) → swap roles (5 min) → one pair performs for the room (3 min).';
const OPINION_CHUNKS = 'I think… / For me… / It is good. / It is bad.';
const PREFERENCE_CHUNKS = 'I prefer… / I like [A] more than [B]. / [A] is better for me.';
const CARD_6_NOTE = 'write the three best sentences on the board, then three corrections as "we said / we can say". Fluency first — do not interrupt during the cards.';

const CARDS = [
  { n: 1, title: 'Intro + 10 core words', time: '10 min' },
  { n: 2, title: 'Discussion + opinion chunks', time: '10 min' },
  { n: 3, title: 'Which will you choose? + preference chunks', time: '10 min' },
  { n: 4, title: 'Real-life mini-action', time: '15 min' },
  { n: 5, title: 'Looking ahead', time: '8 min' },
  { n: 6, title: 'Outro & takeaway', time: '5 min' }
];

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function attr(str) {
  return esc(str).replace(/"/g, '&quot;');
}

function pageTitle(s) {
  return `Session ${s.number}: ${s.title} — Basic Speaking Club (A0–A1)`;
}

function sessionHeading(s) {
  return `Session ${s.number}: ${s.title}`;
}

function cardHead(card, extra) {
  return `            <div class="card-head">
              <h2>Card ${card.n} — ${esc(card.title)}${extra ? ': ' + esc(extra) : ''}</h2>
              <span class="card-time">${card.time}</span>
            </div>`;
}

function card1(s) {
  const pills = s.words.map(w => `              <span class="vocab-pill">${esc(w[0])}</span>`).join('\n');
  return `          <section class="card">
${cardHead(CARDS[0])}
            <p>Point, repeat, then test your partner. Use pictures or real objects on the table.</p>
            <div class="vocab-grid">
${pills}
            </div>
            <div class="question-card">
              <p><strong>Warm-up:</strong> ${esc(s.warmup)}</p>
            </div>
            <div class="frame-box">
              <strong>Say it:</strong> <code>${esc(s.say)}</code>
            </div>
          </section>`;
}

function card2(s) {
  return `          <section class="card">
${cardHead(CARDS[1])}
            <p>Think alone for 30 seconds, tell your partner, then three people tell the room.</p>
            <div class="frame-box">
              <strong>Opinion chunks:</strong> <code>${esc(OPINION_CHUNKS)}</code>
            </div>
            <div class="question-card">
              <p><strong>Question:</strong> ${esc(s.question)}</p>
              <p><strong>Model:</strong> ${esc(s.model)}</p>
            </div>
          </section>`;
}

function card3(s) {
  const choices = s.choices.map(c => `              <li>${esc(c)}</li>`).join('\n');
  return `          <section class="card">
${cardHead(CARDS[2])}
            <p>Hands up for each side first, then each person says their line.</p>
            <div class="frame-box">
              <strong>Preference chunks:</strong> <code>${esc(PREFERENCE_CHUNKS)}</code>
            </div>
            <ul>
${choices}
            </ul>
            <p><strong>Example:</strong> ${esc(s.pref_example)}</p>
          </section>`;
}

function card4(s) {
  const frames = s.roleplay.frames.map(f => `              <li>${esc(f)}</li>`).join('\n');
  return `          <section class="card">
${cardHead(CARDS[3], s.roleplay.title)}
            <p>${esc(s.roleplay.scenario)}</p>
            <ul>
${frames}
            </ul>
            <p><strong>How to run it:</strong> ${esc(RUN)}</p>
          </section>`;
}

function card5(s) {
  return `          <section class="card">
${cardHead(CARDS[4])}
            <div class="frame-box">
              <strong>Future chunks:</strong> <code>${esc(s.future.chunks)}</code>
            </div>
            <div class="question-card">
              <p><strong>Prompts:</strong> ${esc(s.future.prompts)}</p>
              <p><strong>Model:</strong> ${esc(s.future.model)}</p>
            </div>
          </section>`;
}

function card6(s) {
  return `          <section class="card">
${cardHead(CARDS[5])}
            <p><strong>Wrap-up:</strong> ${esc(s.takeaway)}</p>
            <p><strong>Facilitator note:</strong> ${CARD_6_NOTE}</p>
          </section>`;
}

function ladder(s) {
  return `          <section class="card card-ladder">
            <div class="card-head">
              <h2>Helper sheet — the chunk ladder</h2>
              <span class="card-time">use the rung you are ready for</span>
            </div>
            <table class="ladder">
              <thead>
                <tr><th>Function</th><th>A0</th><th>A0+</th><th>A1</th></tr>
              </thead>
              <tbody>
                <tr><td>Opinion</td><td>Good. Bad.</td><td>I think it is good.</td><td>${esc(s.model)}</td></tr>
                <tr><td>Preference</td><td>This. That.</td><td>I prefer this one.</td><td>${esc(s.pref_example)}</td></tr>
                <tr><td>Future</td><td>Tomorrow — home.</td><td>Tomorrow I will go home.</td><td>${esc(s.future.model)}</td></tr>
              </tbody>
            </table>
            <p><strong>Weaker group:</strong> ${esc(s.weaker)} <strong>Stronger group:</strong> ${esc(s.stronger)}</p>
          </section>`;
}

function contentHtml(s) {
  return `        <p class="session-lead">${esc(s.lead)}</p>

        <div class="card-grid">

${card1(s)}

${card2(s)}

${card3(s)}

${card4(s)}

${card5(s)}

${card6(s)}

${ladder(s)}

        </div>`;
}

function renderHtml(s, template) {
  const html = template
    .replace(/{{PAGE_TITLE}}/g, () => attr(pageTitle(s)))
    .replace(/{{CANONICAL_URL}}/g, () => `https://cosylanguages.github.io/COSYevents/sessions/basic-speaking-club/${s.slug}.html`)
    .replace(/{{DESCRIPTION}}/g, () => attr(`${sessionHeading(s)} — ${s.date}. Basic Speaking Club session with vocabulary, discussion questions and free materials.`))
    .replace(/{{TITLE}}/g, () => esc(sessionHeading(s)))
    .replace(/{{DATE}}/g, () => esc(s.date))
    .replace(/{{BREADCRUMB}}/g, () => esc(sessionHeading(s)))
    .replace(/{{CONTENT}}/g, () => contentHtml(s));
  return stampHtml(html).html;
}

function renderMarkdown(s) {
  const vocabulary = s.words.map(w => ({
    word: w[0],
    pos: w[3],
    definition: w[4],
    example: w[5],
    level: 'A1',
    primary_theme: 'everyday-life',
    sub_theme: s.sub_theme || 'routines'
  }));

  const front = {
    title: sessionHeading(s),
    page_title: pageTitle(s),
    breadcrumbs_current: sessionHeading(s),
    club_tag: CLUB_TAG,
    date: s.date,
    theme_class: 'theme-basic-speaking',
    decorator_icon: DECORATOR,
    duration: DURATION,
    languages: LANGUAGES,
    level: LEVEL,
    topic: s.topic || 'Everyday Life',
    description: s.lead,
    vocabulary,
    cards: [
      { card: 1, title: CARDS[0].title, minutes: 10, goal: 'Recognise and say ten core words.', frame: s.say },
      { card: 2, title: CARDS[1].title, minutes: 10, goal: 'Give one opinion.', frame: OPINION_CHUNKS },
      { card: 3, title: CARDS[2].title, minutes: 10, goal: 'Choose between two options and say why.', frame: PREFERENCE_CHUNKS },
      { card: 4, title: `${CARDS[3].title}: ${s.roleplay.title}`, minutes: 15, goal: s.roleplay.scenario, frame: s.roleplay.frames[0] },
      { card: 5, title: CARDS[4].title, minutes: 8, goal: 'Say one simple plan.', frame: s.future.chunks },
      { card: 6, title: CARDS[5].title, minutes: 5, goal: 'Keep one word and one small goal.', frame: s.takeaway }
    ],
    mistakes: []
  };

  const wordRows = s.words
    .map(w => `| ${w[0]} | ${w[1]} | ${w[2]} |`)
    .join('\n');

  const body = `# ${sessionHeading(s)}

${s.lead}

## Card 1 — ${CARDS[0].title} (10 min)

| Word | Picture cue | Say it |
|---|---|---|
${wordRows}

Warm-up: ${s.warmup}

Say it: ${s.say}

## Card 2 — ${CARDS[1].title} (10 min)

Chunks: ${OPINION_CHUNKS}

Question: ${s.question}

Model: ${s.model}

## Card 3 — ${CARDS[2].title} (10 min)

Chunks: ${PREFERENCE_CHUNKS}

${s.choices.map(c => `- ${c}`).join('\n')}

Example: ${s.pref_example}

## Card 4 — ${CARDS[3].title}: ${s.roleplay.title} (15 min)

${s.roleplay.scenario}

${s.roleplay.frames.map(f => `- ${f}`).join('\n')}

How to run it: ${RUN}

## Card 5 — ${CARDS[4].title} (8 min)

Chunks: ${s.future.chunks}

Prompts: ${s.future.prompts}

Model: ${s.future.model}

## Card 6 — ${CARDS[5].title} (5 min)

${s.takeaway}

Facilitator note: ${CARD_6_NOTE}

## Helper sheet — the chunk ladder

| Function | A0 | A0+ | A1 |
|---|---|---|---|
| Opinion | Good. Bad. | I think it is good. | ${s.model} |
| Preference | This. That. | I prefer this one. | ${s.pref_example} |
| Future | Tomorrow — home. | Tomorrow I will go home. | ${s.future.model} |

Weaker group: ${s.weaker} Stronger group: ${s.stronger}
`;

  return `---\n${yaml.dump(front, { lineWidth: -1, noRefs: true, forceQuotes: false })}---\n\n${body}`;
}

function build({ check = false } = {}) {
  const sessions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const stale = [];

  for (const s of sessions) {
    const htmlPath = path.join(OUT_DIR, `${s.slug}.html`);
    const mdPath = path.join(OUT_DIR, `${s.slug}.md`);
    const html = renderHtml(s, template);
    const md = renderMarkdown(s);

    for (const [file, next] of [[htmlPath, html], [mdPath, md]]) {
      const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
      if (current === next) continue;
      if (check) {
        stale.push(path.relative(path.join(__dirname, '..'), file));
      } else {
        fs.writeFileSync(file, next, 'utf8');
        console.log(`[written] ${path.relative(path.join(__dirname, '..'), file)}`);
      }
    }
  }

  if (check && stale.length) {
    console.error(`Out of date (${stale.length}):`);
    stale.forEach(f => console.error(`  ${f}`));
    process.exit(1);
  }
  if (check) console.log(`All ${sessions.length} basic speaking club sessions are up to date.`);
}

if (require.main === module) {
  build({ check: process.argv.includes('--check') });
}

module.exports = { build, renderHtml, renderMarkdown };
