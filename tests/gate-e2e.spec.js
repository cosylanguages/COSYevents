const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const http = require('http');

let server;
const PORT = 8092;
const ROOT = path.join(__dirname, '..');

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
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

  await new Promise(resolve => server.listen(PORT, resolve));
});

test.afterAll(() => {
  if (server) server.close();
});

const mockModelData = {
  status: 'ok',
  catalog: {
    title: 'E2E Test Session',
    language: 'English',
    level: 'B1-B2',
    summary: 'Testing gated session rendering with Playwright.',
    format: 'Speaking Club'
  },
  content: {
    vocabulary: [
      { word: 'Authentic', definition: 'Genuine and real.', example: 'Her enthusiasm was authentic.' }
    ],
    rounds: [
      {
        title: 'Round 1: Warm Up',
        items: [{ main: 'What is your favorite memory?', personal: 'Share why it matters to you.' }]
      }
    ]
  }
};

test.describe('E2E Gated Flow Mobile (360px)', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('valid redemption renders session without console errors or overflow', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`http://localhost:${PORT}/index.html`);

    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta name="session-id" content="s-mind-matters-anticipatory-grief">
        <link rel="stylesheet" href="http://localhost:${PORT}/shared/css/sessions.css">
      </head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/session-renderer.js"></script>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    await page.evaluate((mockData) => {
      const target = document.getElementById('session-private');
      window.CosySessionRenderer.render(mockData, target);
    }, mockModelData);

    await expect(page.locator('.vocab-card')).toHaveCount(1);
    await expect(page.locator('.round-block')).toHaveCount(1);

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
  });

  test('invalid token shows invalid link state message', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta name="session-id" content="s-test">
      </head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    await page.evaluate(() => {
      const main = document.getElementById('session-private');
      window.CosyEventsGate.renderStateUI(main, 'invalid', 'en');
    });

    await expect(page.locator('.ce-gate-msg')).toHaveText('Invalid access link.');
    await expect(page.locator('.ce-gate-wa-btn')).toBeVisible();
  });

  test('expired token shows expired state message', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta name="session-id" content="s-test">
      </head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    await page.evaluate(() => {
      const main = document.getElementById('session-private');
      window.CosyEventsGate.renderStateUI(main, 'expired', 'en');
    });

    await expect(page.locator('.ce-gate-msg')).toHaveText('This access link has expired.');
  });

  test('no token shows no link state message', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta name="session-id" content="s-test">
      </head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    await page.evaluate(() => {
      const main = document.getElementById('session-private');
      window.CosyEventsGate.renderStateUI(main, 'no_link', 'en');
    });

    await expect(page.locator('.ce-gate-msg')).toHaveText('Open the link your host sent you.');
  });
});

test.describe('E2E Gated Flow Desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('valid redemption renders session without console errors or overflow', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`http://localhost:${PORT}/index.html`);

    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta name="session-id" content="s-mind-matters-anticipatory-grief">
        <link rel="stylesheet" href="http://localhost:${PORT}/shared/css/sessions.css">
      </head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/session-renderer.js"></script>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    await page.evaluate((mockData) => {
      const target = document.getElementById('session-private');
      window.CosySessionRenderer.render(mockData, target);
    }, mockModelData);

    await expect(page.locator('.vocab-card')).toHaveCount(1);
    await expect(page.locator('.round-block')).toHaveCount(1);

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasOverflow).toBe(false);
    expect(consoleErrors).toEqual([]);
  });

  test('invalid token shows invalid link state message', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta name="session-id" content="s-test">
      </head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    await page.evaluate(() => {
      const main = document.getElementById('session-private');
      window.CosyEventsGate.renderStateUI(main, 'invalid', 'en');
    });

    await expect(page.locator('.ce-gate-msg')).toHaveText('Invalid access link.');
    await expect(page.locator('.ce-gate-wa-btn')).toBeVisible();
  });

  test('expired token shows expired state message', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta name="session-id" content="s-test">
      </head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    await page.evaluate(() => {
      const main = document.getElementById('session-private');
      window.CosyEventsGate.renderStateUI(main, 'expired', 'en');
    });

    await expect(page.locator('.ce-gate-msg')).toHaveText('This access link has expired.');
  });

  test('no token shows no link state message', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta name="session-id" content="s-test">
      </head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    await page.evaluate(() => {
      const main = document.getElementById('session-private');
      window.CosyEventsGate.renderStateUI(main, 'no_link', 'en');
    });

    await expect(page.locator('.ce-gate-msg')).toHaveText('Open the link your host sent you.');
  });
});
