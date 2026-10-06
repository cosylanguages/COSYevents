const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const EXPORT_DIR = path.join(ROOT, 'private/session-exports');

// 5 selected session HREFs per club (10 clubs)
const CLUB_SESSIONS = {
  'cinema-club': [
    'sessions/cinema-club/101-and-102-dalmatians.html',
    'sessions/cinema-club/16-wishes.html',
    'sessions/cinema-club/a-quiet-place.html',
    'sessions/cinema-club/about-time.html',
    'sessions/cinema-club/adolescence.html'
  ],
  'debatable-relatable': [
    'sessions/debatable-relatable/ai-and-art.html',
    'sessions/debatable-relatable/assisted-dying.html',
    'sessions/debatable-relatable/chatting-with-ai-vs-human-elementary.html',
    'sessions/debatable-relatable/chatting-with-ai-vs-human-intermediate.html',
    'sessions/debatable-relatable/homework-ban.html'
  ],
  'i-couldnt-help-but-wonder': [
    'sessions/i-couldnt-help-but-wonder/are-traditions-hidden-monogamy-upper-intermediate.html',
    'sessions/i-couldnt-help-but-wonder/are-traditions-hidden-monogamy.html',
    'sessions/i-couldnt-help-but-wonder/do-bisexuals-have-to-choose.html',
    'sessions/i-couldnt-help-but-wonder/do-insects-hide-when-it-rains.html',
    'sessions/i-couldnt-help-but-wonder/whether-raindrops-select-where-to-fall.html'
  ],
  'if-you-were': [
    'sessions/if-you-were/if-you-were-blind.html',
    'sessions/if-you-were/if-you-were-deaf.html',
    'sessions/if-you-were/if-you-were-child-again.html',
    'sessions/if-you-were/if-you-were-parent-to-yourself.html',
    'sessions/if-you-were/if-you-were-teacher.html'
  ],
  'karaoke-club': [
    'sessions/karaoke-club/challenges/crazy-ex-girlfriend-challenge/a-diagnosis.html',
    'sessions/karaoke-club/challenges/crazy-ex-girlfriend-challenge/after-everything-ive-done-for-you.html',
    'sessions/karaoke-club/challenges/crazy-ex-girlfriend-challenge/antidepressants-are-so-not-a-big-deal.html',
    'sessions/karaoke-club/challenges/crazy-ex-girlfriend-challenge/child-star.html',
    'sessions/karaoke-club/challenges/crazy-ex-girlfriend-challenge/diagnosed-with-love.html'
  ],
  'keeping-up-with-science': [
    'sessions/keeping-up-with-science/childhood-obesity-theory-upper-intermediate.html',
    'sessions/keeping-up-with-science/ai-and-the-brain-intermediate.html',
    'sessions/keeping-up-with-science/ai-and-the-brain-upper-intermediate.html',
    'sessions/keeping-up-with-science/ai-reality-delusion.html',
    'sessions/keeping-up-with-science/ape-laughter-speech-origin-elementary.html'
  ],
  'lets-celebrate': [
    'sessions/lets-celebrate/cheap-flight-day.html',
    'sessions/lets-celebrate/diwali-festival.html',
    'sessions/lets-celebrate/international-asteroid-day-intermediate.html',
    'sessions/lets-celebrate/international-asteroid-day-upper-intermediate.html',
    'sessions/lets-celebrate/family-remittances-day.html'
  ],
  'long-reads': [
    'sessions/long-reads/changing-our-brains.html',
    'sessions/long-reads/designed-to-addict.html',
    'sessions/long-reads/the-30-day-breakup.html',
    'sessions/long-reads/attention-economy.html'
  ],
  'mind-matters': [
    'sessions/mind-matters/anticipatory-grief.html',
    'sessions/mind-matters/aspiration-vs-inspiration-intermediate.html',
    'sessions/mind-matters/aspiration-vs-inspiration-upper-intermediate.html',
    'sessions/mind-matters/blue-eyes-brown-eyes-experiment.html',
    'sessions/mind-matters/bluewashing-intermediate.html'
  ],
  'the-greatest-quotes': [
    'sessions/the-greatest-quotes/ai-opposite-of-art-upper-intermediate.html',
    'sessions/the-greatest-quotes/ai-opposite-of-art-intermediate.html',
    'sessions/the-greatest-quotes/ability-to-notice-beauty-quote.html',
    'sessions/the-greatest-quotes/accept-gay-child.html',
    'sessions/the-greatest-quotes/alisa-freindlich-inner-child-elementary.html'
  ]
};

function sessionIdFromHref(href) {
  return `session-${href.replace(/\.html?$/i, '').replace(/[^a-zA-Z0-9]+/g, '-')}`
    .replace(/-+/g, '-').replace(/-$/g, '');
}

function startStaticServer(port) {
  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0].split('#')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    const filePath = path.join(ROOT, reqUrl);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      let ext = path.extname(filePath);
      let mime = 'text/html';
      if (ext === '.js') mime = 'application/javascript';
      else if (ext === '.css') mime = 'text/css';
      else if (ext === '.json') mime = 'application/json';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

async function verifyRoundTrip() {
  const port = 8089;
  const server = await startStaticServer(port);
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Starting Round-Trip Verification across 10 clubs (50 sessions total)...');

  let totalTested = 0;
  let totalMatched = 0;
  const diffs = [];

  for (const [club, hrefs] of Object.entries(CLUB_SESSIONS)) {
    console.log(`\n--- Club: ${club} ---`);
    for (const href of hrefs) {
      totalTested++;
      const fullPath = path.join(ROOT, href);
      if (!fs.existsSync(fullPath)) {
        console.warn(`[SKIP] File missing: ${href}`);
        continue;
      }

      const sid = sessionIdFromHref(href);
      const jsonPath = path.join(EXPORT_DIR, `${sid}.json`);
      if (!fs.existsSync(jsonPath)) {
        console.warn(`[SKIP] Exported JSON missing: ${jsonPath}`);
        continue;
      }

      const exportedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      // 1. Load Static Original Page
      await page.goto(`http://localhost:${port}/${href}`);
      const staticVocabCards = await page.locator('.vocab-card .vocab-word').allTextContents();
      const staticPrompts = await page.locator('.round-item-main, .round-questions li, .question-card p, .discussion-prompt, .lyrics-checkpoint li').allTextContents();

      // 2. Load Test Page and Render JSON Model via CosySessionRenderer
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <link rel="stylesheet" href="/shared/css/sessions.css">
        </head>
        <body>
          <main id="session-private"></main>
          <script src="/shared/js/session-renderer.js"></script>
        </body>
        </html>
      `, { waitUntil: 'load' });

      await page.evaluate((modelData) => {
        const container = document.getElementById('session-private');
        window.CosySessionRenderer.render(modelData, container);
      }, exportedJson);

      const renderedVocabCards = await page.locator('.vocab-card .vocab-word').allTextContents();
      const renderedPrompts = await page.locator('.round-item-main, .round-questions li, .question-card p, .discussion-prompt, .lyrics-checkpoint li').allTextContents();

      // Normalize texts
      const staticVocabNorm = staticVocabCards.map(normalizeText);
      const renderedVocabNorm = renderedVocabCards.map(normalizeText);

      const staticPromptsNorm = staticPrompts.map(normalizeText);
      const renderedPromptsNorm = renderedPrompts.map(normalizeText);

      const vocabMatch = staticVocabNorm.length === renderedVocabNorm.length;
      const promptsMatch = staticPromptsNorm.length === renderedPromptsNorm.length;

      if (vocabMatch && promptsMatch) {
        console.log(`[PASS] ${href} (Vocab Words: ${staticVocabNorm.length}, Discussion Items: ${staticPromptsNorm.length})`);
        totalMatched++;
      } else {
        console.log(`[DIFF] ${href}`);
        console.log(`  Static: Vocab=${staticVocabNorm.length}, Items=${staticPromptsNorm.length}`);
        console.log(`  Rendered: Vocab=${renderedVocabNorm.length}, Items=${renderedPromptsNorm.length}`);
        diffs.push({
          href,
          staticVocab: staticVocabNorm.length,
          renderedVocab: renderedVocabNorm.length,
          staticPrompts: staticPromptsNorm.length,
          renderedPrompts: renderedPromptsNorm.length
        });
      }
    }
  }

  await browser.close();
  server.close();

  console.log(`\n==========================================`);
  console.log(`Round-Trip Verification Summary: ${totalMatched}/${totalTested} matched.`);
  if (diffs.length > 0) {
    console.log(`Differences observed in ${diffs.length} files:`);
    console.log(JSON.stringify(diffs, null, 2));
  }
  console.log(`==========================================\n`);

  if (diffs.length > 0) {
    process.exitCode = 1;
  }
}

verifyRoundTrip().catch((err) => {
  console.error(err);
  process.exit(1);
});
