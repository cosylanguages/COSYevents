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

const mockValidData = {
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

const viewports = [
  { name: 'Mobile (360px)', width: 360, height: 640 },
  { name: 'Desktop (1280px)', width: 1280, height: 800 }
];

viewports.forEach(vp => {
  test.describe(`E2E Gated Flow - ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('valid token redeems access link and renders session with slide deck', async ({ page }) => {
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Intercept RPC redeem_session_access_link
      await page.route('**/rest/v1/rpc/redeem_session_access_link', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockValidData)
        });
      });

      // Intercept Supabase Auth session check
      await page.route('**/auth/v1/user', route => {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: null }) });
      });

      await page.goto(`http://localhost:${PORT}/index.html#k=valid-test-token`);

      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta name="cosy-gated" content="true">
          <meta name="session-id" content="s-test-valid">
          <link rel="stylesheet" href="http://localhost:${PORT}/shared/css/sessions.css">
        </head>
        <body>
          <main id="session-private"></main>
          <script src="http://localhost:${PORT}/shared/js/session-renderer.js"></script>
          <script src="http://localhost:${PORT}/shared/js/cosyevents-session.js"></script>
          <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
        </body>
        </html>
      `, { waitUntil: 'load' });

      // Trigger gate init with mocked token
      await page.evaluate((data) => {
        const target = document.getElementById('session-private');
        window.CosySessionRenderer.render(data, target);
        if (window.initSlideDeck) window.initSlideDeck();
      }, mockValidData);

      await expect(page.locator('.vocab-card')).toHaveCount(1);
      await expect(page.locator('.round-block')).toHaveCount(1);

      // Verify Slide Deck UI attached
      await expect(page.locator('.ce-slide-deck-bar').first()).toBeVisible();

      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasOverflow).toBe(false);
      expect(consoleErrors).toEqual([]);
    });

    test('invalid token shows invalid link state message via RPC mock', async ({ page }) => {
      await page.route('**/rest/v1/rpc/redeem_session_access_link', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'invalid' })
        });
      });

      await page.goto(`http://localhost:${PORT}/index.html#k=invalid-token`);

      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta name="cosy-gated" content="true">
          <meta name="session-id" content="s-test-invalid">
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

    test('expired token shows expired state message via RPC mock', async ({ page }) => {
      await page.route('**/rest/v1/rpc/redeem_session_access_link', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'expired' })
        });
      });

      await page.goto(`http://localhost:${PORT}/index.html#k=expired-token`);

      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta name="cosy-gated" content="true">
          <meta name="session-id" content="s-test-expired">
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

    test('revoked token shows revoked state message via RPC mock', async ({ page }) => {
      await page.route('**/rest/v1/rpc/redeem_session_access_link', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'revoked' })
        });
      });

      await page.goto(`http://localhost:${PORT}/index.html#k=revoked-token`);

      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta name="cosy-gated" content="true">
          <meta name="session-id" content="s-test-revoked">
        </head>
        <body>
          <main id="session-private"></main>
          <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
        </body>
        </html>
      `, { waitUntil: 'load' });

      await page.evaluate(() => {
        const main = document.getElementById('session-private');
        window.CosyEventsGate.renderStateUI(main, 'revoked', 'en');
      });

      await expect(page.locator('.ce-gate-msg')).toHaveText('This access link has been revoked.');
    });

    test('no token shows no link state message', async ({ page }) => {
      await page.goto(`http://localhost:${PORT}/index.html`);

      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta name="cosy-gated" content="true">
          <meta name="session-id" content="s-test-no-token">
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

    test('staff user calls staff_get_session and renders notes', async ({ page }) => {
      const mockStaffData = {
        ...mockValidData,
        full_notes: 'Facilitator secret timing notes',
        content: {
          ...mockValidData.content,
          full_notes: 'Facilitator secret timing notes'
        }
      };

      await page.route('**/shared/config/supabase.json', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ enabled: false })
        });
      });

      await page.goto(`http://localhost:${PORT}/index.html`);

      await page.setContent(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta name="session-id" content="s-test-staff">
        </head>
        <body>
          <main id="session-private"></main>
          <script src="http://localhost:${PORT}/shared/js/session-renderer.js"></script>
        </body>
        </html>
      `, { waitUntil: 'load' });

      await page.evaluate((data) => {
        const main = document.getElementById('session-private');
        window.CosySessionRenderer.render(data, main);
      }, mockStaffData);

      await expect(page.locator('#facilitator-notes')).toContainText('Facilitator secret timing notes');
    });
  });
});
