const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const EVENTS = require('../shared/calendar-data/events.json');
const HUBS = [
  { route: '/speaking-clubs/', type: 'speaking-club' },
  { route: '/cinema-nights/', type: 'cinema-night' },
  { route: '/special-events/', type: 'special-event' },
  { route: '/teacher-led-sessions/', type: 'teacher-session' }
];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 }
];
const SCREENSHOT_DIR = '/tmp/cosyevents-hub-checks';

function createServer() {
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let filePath = path.resolve(ROOT, `.${pathname}`);
    if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (error, contents) => {
      if (error) {
        response.writeHead(404).end('Not found');
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

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const today = new Date().toISOString().slice(0, 10);
  const results = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    for (const hub of HUBS) {
      const expected = EVENTS.filter(event => event.type === hub.type && event.date >= today).length;
      for (const viewport of VIEWPORTS) {
        const page = await browser.newPage({ viewport });
        const pageErrors = [];
        page.on('pageerror', error => pageErrors.push(error.message));
        const response = await page.goto(`${baseUrl}${hub.route}`, { waitUntil: 'networkidle' });
        if (!response || !response.ok()) throw new Error(`${hub.route} failed to load at ${viewport.name}.`);

        const container = page.locator('[data-upcoming-events]');
        await container.waitFor({ state: 'visible' });
        const state = await page.evaluate(() => {
          const grid = document.querySelector('[data-upcoming-events]');
          const cards = [...grid.querySelectorAll('.event-card-item')];
          const noUpcoming = grid.innerText.includes('No upcoming sessions');
          return {
            hidden: grid.hidden,
            count: cards.length,
            noUpcoming,
            horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            headings: cards.map(card => card.querySelector('.event-card-title')?.textContent || card.querySelector('.event-card-desc')?.textContent || '')
          };
        });

        const expectedEmpty = expected === 0;
        if (state.hidden) throw new Error(`${hub.route} stayed hidden at ${viewport.name}.`);
        if (state.horizontalOverflow) throw new Error(`${hub.route} has horizontal overflow at ${viewport.name}.`);
        if (state.noUpcoming !== expectedEmpty) throw new Error(`${hub.route} empty-state mismatch: expected ${expected} events.`);
        if (!expectedEmpty && state.count !== expected) throw new Error(`${hub.route} rendered ${state.count} cards; expected ${expected}.`);
        if (pageErrors.length) throw new Error(`${hub.route} page errors: ${pageErrors.join('; ')}`);

        const screenshotName = `${hub.route.replaceAll('/', '-').replace(/^-|-$/g, '')}-${viewport.name}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, screenshotName), fullPage: true });
        results.push({ route: hub.route, viewport: viewport.name, eventCount: expected, noUpcoming: expectedEmpty, horizontalOverflow: false, pageErrors: pageErrors.length });
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }

  console.log(JSON.stringify({ results, screenshots: SCREENSHOT_DIR }, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
