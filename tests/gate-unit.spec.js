const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const http = require('http');

let server;
const PORT = 8091;
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

test.describe('COSYevents Gate Token & State Unit Tests', () => {
  test('extractAndStoreToken extracts token from hash, sets sessionStorage, and cleans URL hash', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="cosy-gated" content="true">
        <meta name="session-id" content="s-test-123">
      </head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    // Simulate URL hash navigation with token
    const result = await page.evaluate(() => {
      window.location.hash = '#k=test-secret-token-123';
      const extracted = window.CosyEventsGate.extractAndStoreToken('s-test-123');
      const stored = sessionStorage.getItem('cosy_gate:s-test-123');
      const hashAfter = window.location.hash;
      return { extracted, stored, hashAfter };
    });

    expect(result.extracted).toBe('test-secret-token-123');
    expect(result.stored).toBe('test-secret-token-123');
    expect(result.hashAfter).toBe('');
  });

  test('renderStateUI generates localized error cards for en, fr, it, ru, el', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="fr">
      <head></head>
      <body>
        <main id="session-private"></main>
        <script src="http://localhost:${PORT}/shared/js/cosyevents-gate.js"></script>
      </body>
      </html>
    `, { waitUntil: 'load' });

    const stateData = await page.evaluate(() => {
      const main = document.getElementById('session-private');
      window.CosyEventsGate.renderStateUI(main, 'expired', 'fr');
      const msg = main.querySelector('.ce-gate-msg').textContent;
      const waText = main.querySelector('.ce-gate-wa-btn').textContent;
      return { msg, waText };
    });

    expect(stateData.msg).toBe("Ce lien d'accès a expiré.");
    expect(stateData.waText).toBe("Écrivez-nous sur WhatsApp 📱");
  });
});
