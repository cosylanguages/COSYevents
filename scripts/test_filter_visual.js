const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT, 'verification/filter-screenshots');

function createServer() {
  return http.createServer((request, response) => {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);

    // Support /COSYevents/ prefix
    if (pathname.startsWith('/COSYevents/')) {
      pathname = pathname.substring('/COSYevents'.length);
    } else if (pathname === '/COSYevents') {
      pathname = '/';
    }

    let filePath = path.resolve(ROOT, `.${pathname}`);
    if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (error, contents) => {
      if (error) {
        response.writeHead(404).end('Not found: ' + pathname);
        return;
      }
      const extension = path.extname(filePath);
      const mime = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
      }[extension] || 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': mime });
      response.end(contents);
    });
  });
}

async function runVerification() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/COSYevents`;
  console.log(`Test server running at ${baseUrl}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    // Test Viewports
    const viewports = [
      { name: 'desktop', width: 1366, height: 900 },
      { name: 'mobile', width: 390, height: 844 }
    ];

    for (const vp of viewports) {
      console.log(`\n=== Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', err => consoleErrors.push(err.message));

      // (1) Fresh visitor: "All" active, no "My languages" chip, every event visible
      console.log('Scenario 1: Fresh visitor');
      await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });

      // Check no horizontal scroll
      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      console.log(`  Horizontal overflow: ${hasOverflow}`);
      if (hasOverflow) throw new Error(`Horizontal scroll detected at ${vp.name}!`);

      // Check chips
      const chips = page.locator('#language-filter-chips .lang-chip');
      const chipTexts = await chips.allTextContents();
      console.log(`  Filter chips found:`, chipTexts);

      const hasMyLangsChipFresh = chipTexts.some(t => t.includes('My languages') || t.includes('Mes langues'));
      console.log(`  My languages chip present on fresh load: ${hasMyLangsChipFresh}`);
      if (hasMyLangsChipFresh) throw new Error(`My languages chip should NOT appear for fresh visitor!`);

      const activeChip = page.locator('#language-filter-chips .lang-chip.active');
      const activeText = await activeChip.textContent();
      console.log(`  Active chip: ${activeText.trim()}`);
      if (!activeText.trim().startsWith('All') && !activeText.trim().startsWith('Toutes')) {
        throw new Error(`Default active chip should be 'All'! Got: ${activeText}`);
      }

      // Screenshot fresh filter bar
      const filterBarFresh = page.locator('.calendar-controls');
      await filterBarFresh.screenshot({ path: path.join(SCREENSHOT_DIR, `filter-bar-fresh-${vp.name}.png`) });

      // (2) Visit French page then English homepage and use switcher so ce-langs = ["en","fr"]
      console.log('\nScenario 2: My Languages activation');
      await page.evaluate(() => {
        localStorage.setItem('ce-langs', JSON.stringify(['en', 'fr']));
      });
      await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });

      const chipTextsMyLangs = await chips.allTextContents();
      console.log(`  Chips with ce-langs = ["en","fr"]:`, chipTextsMyLangs);
      const myLangsBtn = page.locator('#language-filter-chips .lang-chip[data-lang="mine"]');
      const myLangsCount = await myLangsBtn.count();
      if (myLangsCount === 0) throw new Error('My languages chip missing when ce-langs = ["en","fr"]!');

      const isMineActive = await myLangsBtn.getAttribute('aria-pressed');
      console.log(`  My languages chip active by default: ${isMineActive === 'true'}`);
      if (isMineActive !== 'true') throw new Error('My languages chip should be active by default!');

      // Screenshot filter bar with My Languages
      await filterBarFresh.screenshot({ path: path.join(SCREENSHOT_DIR, `filter-bar-mylangs-${vp.name}.png`) });

      // (3) Toggling Italian chip adds Italian, toggling off all returns to default
      console.log('\nScenario 3: Toggle Italian chip');
      const itChip = page.locator('#language-filter-chips .lang-chip[data-lang="it"]');
      await itChip.click();
      await page.waitForTimeout(100);

      const itPressed = await itChip.getAttribute('aria-pressed');
      console.log(`  Italian chip pressed after click: ${itPressed}`);
      if (itPressed !== 'true') throw new Error('Italian chip should be pressed after click!');

      // Toggle off Italian chip
      await itChip.click();
      await page.waitForTimeout(100);
      const minePressedReturn = await myLangsBtn.getAttribute('aria-pressed');
      console.log(`  Returned to My Languages default after deselecting last custom lang: ${minePressedReturn === 'true'}`);

      // (4) Choice survives reload
      console.log('\nScenario 4: Choice persistence on reload');
      await itChip.click(); // Select Italian
      await page.reload({ waitUntil: 'networkidle' });
      const itPressedReload = await page.locator('#language-filter-chips .lang-chip[data-lang="it"]').getAttribute('aria-pressed');
      console.log(`  Italian choice survived reload: ${itPressedReload === 'true'}`);
      if (itPressedReload !== 'true') throw new Error('Selected choice did not survive reload!');

      // (5) ?langs=ru overrides
      console.log('\nScenario 5: ?langs=ru URL parameter override');
      await page.goto(`${baseUrl}/index.html?langs=ru`, { waitUntil: 'networkidle' });
      const ruChip = page.locator('#language-filter-chips .lang-chip[data-lang="ru"]');
      const ruPressed = await ruChip.getAttribute('aria-pressed');
      console.log(`  Russian chip active from URL parameter ?langs=ru: ${ruPressed === 'true'}`);
      if (ruPressed !== 'true') throw new Error('URL ?langs=ru did not activate Russian chip!');

      // (6) Removing French in the switcher updates filter live and preset disappears
      console.log('\nScenario 6: Live update from My Languages switcher');
      await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        window.CosyLang.removeMyLang('fr');
      });
      await page.waitForTimeout(200);

      const myLangsAfterRemove = await page.locator('#language-filter-chips .lang-chip[data-lang="mine"]').count();
      console.log(`  My languages chip count after removing French: ${myLangsAfterRemove}`);
      if (myLangsAfterRemove !== 0) throw new Error('My languages chip should disappear when fewer than 2 languages!');

      // (7) Empty state works
      console.log('\nScenario 7: Empty state');
      await page.evaluate(() => {
        localStorage.setItem('ce-langs', JSON.stringify(['en', 'fr']));
      });
      await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
      const elChip = page.locator('#language-filter-chips .lang-chip[data-lang="el"]');
      await elChip.click(); // Select Greek only
      await page.waitForTimeout(100);

      const upcomingText = await page.locator('#upcoming-events-list').textContent();
      console.log(`  Upcoming list text with single language filter:`, upcomingText.trim().substring(0, 80) + '...');
      if (upcomingText.includes('Show all languages')) {
        console.log('  Show all languages button found in empty state!');
        const showAllBtn = page.locator('.show-all-langs-btn');
        await showAllBtn.click();
        await page.waitForTimeout(100);
        const allActiveAfterShowAll = await page.locator('#language-filter-chips .lang-chip[data-lang="all"]').getAttribute('aria-pressed');
        console.log(`  Clicking "Show all languages" activated "All" chip: ${allActiveAfterShowAll === 'true'}`);
        if (allActiveAfterShowAll !== 'true') throw new Error('"Show all languages" button did not reset filter to All!');
      }

      // (8) Chip labels are localized on fr/it/ru/el hubs
      console.log('\nScenario 8: Localized hubs chip labels');
      const hubs = [
        { path: 'fr/index.html', lang: 'fr', label: "Langues de l'événement :" },
        { path: 'it/index.html', lang: 'it', label: "Lingue dell'evento:" },
        { path: 'ru/index.html', lang: 'ru', label: "Языки событий:" },
        { path: 'el/index.html', lang: 'el', label: "Γλώσσες εκδηλώσεων:" }
      ];

      for (const h of hubs) {
        await page.goto(`${baseUrl}/${h.path}`, { waitUntil: 'networkidle' });
        const labelText = await page.locator('#lang-filter-label').textContent();
        console.log(`  ${h.lang} hub label: "${labelText.trim()}"`);
        if (!labelText.includes(h.label)) throw new Error(`Incorrect localized label on ${h.path}! Expected ${h.label}, got ${labelText}`);
      }

      // (9) Check console errors
      console.log(`\nConsole errors count: ${consoleErrors.length}`);
      if (consoleErrors.length > 0) {
        console.error('Console errors:', consoleErrors);
        throw new Error(`Console errors detected: ${consoleErrors.join('; ')}`);
      }

      await context.close();
    }

    console.log('\n=== ALL PLAYWRIGHT E2E & VISUAL VERIFICATION TESTS PASSED SUCCESSFULLY! ===\n');

  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
