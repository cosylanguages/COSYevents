const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT, 'verification');

function createServer() {
  return http.createServer((request, response) => {
    const urlObj = new URL(request.url, 'http://localhost');
    let pathname = decodeURIComponent(urlObj.pathname);

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
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/COSYevents`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    // ── Test Case 1: Disabled Mode ──────────────────────────────────────
    console.log('E2E Test 1: Disabled Mode (default config)');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
      page.on('pageerror', err => pageErrors.push(err.message));

      await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
      const chipHtml = await page.$eval('[data-cosy-account]', el => el.innerHTML);
      if (chipHtml.trim() !== '') {
        throw new Error(`Expected [data-cosy-account] to be empty in disabled mode, got: ${chipHtml}`);
      }

      await page.goto(`${baseUrl}/sessions/if-you-were/if-you-were-teacher.html`, { waitUntil: 'networkidle' });
      const sessionChipHtml = await page.$eval('[data-cosy-account]', el => el.innerHTML);
      if (sessionChipHtml.trim() !== '') {
        throw new Error(`Expected [data-cosy-account] to be empty on session page in disabled mode, got: ${sessionChipHtml}`);
      }

      if (consoleErrors.length > 0) {
        throw new Error(`Console errors in disabled mode: ${consoleErrors.join('; ')}`);
      }
      if (pageErrors.length > 0) {
        throw new Error(`Page errors in disabled mode: ${pageErrors.join('; ')}`);
      }
      console.log('✔ Disabled mode verified (no chip, no errors).');
      await context.close();
    }

    // ── Fake Injected Client Setup Helper ──────────────────────────────────
    async function injectFakeClient(page, options = {}) {
      const email = options.hasOwnProperty('email') ? options.email : 'student@example.com';
      const role = options.hasOwnProperty('role') ? options.role : 'student';
      const displayName = options.hasOwnProperty('displayName') ? options.displayName : 'Alex Student';
      const grants = options.hasOwnProperty('grants') ? options.grants : [
        { language: 'en', level: 'B1', course: 'Spoken', valid_until: '2027-01-01', include_lower: true }
      ];
      const teaches = options.hasOwnProperty('teaches') ? options.teaches : [];

      await page.addInitScript(({ email, role, displayName, grants, teaches }) => {
        window.__fakeSession = email ? { user: { id: 'fake-uuid', email: email } } : null;
        window.__fakeAccess = {
          role: role,
          display_name: displayName,
          grants: grants,
          teaches: teaches,
          session_grants: []
        };

        const fakeClient = {
          auth: {
            getSession: () => Promise.resolve({ data: { session: window.__fakeSession }, error: null }),
            onAuthStateChange: (cb) => {
              cb('SIGNED_IN', window.__fakeSession);
              return { data: { subscription: { unsubscribe: () => {} } } };
            },
            signInWithOtp: () => Promise.resolve({ data: {}, error: null }),
            verifyOtp: ({ token }) => {
              if (token === '123456') {
                return Promise.resolve({ data: { session: window.__fakeSession }, error: null });
              } else {
                return Promise.resolve({ data: { session: null }, error: { message: 'Invalid or expired code' } });
              }
            },
            signOut: () => {
              window.__fakeSession = null;
              window.__fakeAccess = null;
              return Promise.resolve({ error: null });
            }
          },
          rpc: (fn) => {
            if (fn === 'my_access') {
              return Promise.resolve({ data: window.__fakeAccess, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          }
        };

        window.supabase = {
          createClient: () => fakeClient
        };

        const origFetch = window.fetch;
        window.fetch = function (url, opts) {
          if (typeof url === 'string' && url.indexOf('supabase.json') !== -1) {
            return Promise.resolve(new Response(JSON.stringify({
              enabled: true,
              url: 'https://fake.supabase.co',
              anonKey: 'fake-anon-key',
              storageKey: 'cosy-auth'
            }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          return origFetch.apply(this, arguments);
        };
      }, { email, role, displayName, grants, teaches });
    }

    // ── Test Case 2: Signed-In Student (en B1) View, Menu & Ecosystem Sync ─
    console.log('E2E Test 2: Signed-In Student (en B1)');
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      await injectFakeClient(page);

      await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.cosy-account-chip-btn');

      const chipName = await page.textContent('.cosy-chip-name');
      if (!chipName.includes('Alex Student')) {
        throw new Error(`Expected chip to display 'Alex Student', got: ${chipName}`);
      }

      // Screenshot 1: Chip Light Mode
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'chip-light.png') });

      // Click Chip to open menu
      await page.click('.cosy-account-chip-btn');
      await page.waitForSelector('.cosy-account-menu:not([hidden])');

      const roleLabel = await page.textContent('.cosy-account-menu div');
      if (!roleLabel.toUpperCase().includes('STUDENT')) {
        throw new Error(`Expected role label 'STUDENT', got: ${roleLabel}`);
      }

      // Screenshot 2: Menu Light Mode
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'chip-menu-light.png') });

      // Verify My Languages gained 'en'
      const myLangs = await page.evaluate(() => window.CosyLang ? window.CosyLang.getMyLangs() : []);
      if (!myLangs.includes('en')) {
        throw new Error(`Expected My Languages to include 'en', got: ${JSON.stringify(myLangs)}`);
      }

      // Visit account.html
      await page.goto(`${baseUrl}/account.html`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#grants-container table');

      const grantsTableText = await page.textContent('#grants-container');
      if (!grantsTableText.includes('B1') || !grantsTableText.includes('Spoken')) {
        throw new Error(`Expected grants table to contain B1 and Spoken, got: ${grantsTableText}`);
      }

      // Screenshot 3: Account Page Light Mode
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'account-light.png') });

      // Dark mode screenshots
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'account-dark.png') });

      await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'chip-dark.png') });
      await page.click('.cosy-account-chip-btn');
      await page.waitForSelector('.cosy-account-menu:not([hidden])');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'chip-menu-dark.png') });

      console.log('✔ Signed-in student view, menu, ecosystem sync, and light/dark screenshots verified.');
      await context.close();
    }

    // ── Test Case 3: Login Page & Expired Code Path ───────────────────────
    console.log('E2E Test 3: Login Page & Expired Code Path');
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();

      await injectFakeClient(page, { email: null, role: null, grants: [] });

      await page.goto(`${baseUrl}/login.html`, { waitUntil: 'networkidle' });
      console.log('Current URL on login.html:', page.url());
      await page.waitForSelector('#login-step-1');

      // Screenshot 4: Login Page Light Mode
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-light.png') });

      // Dark mode screenshot
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-dark.png') });
      await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));

      // Submit email
      await page.fill('#input-email', 'test@example.com');
      await page.click('#btn-send-code');
      await page.waitForSelector('#login-step-2', { state: 'visible' });

      // Submit invalid 6-digit code
      await page.fill('#input-code', '999999');
      await page.click('#btn-verify-code');
      await page.waitForSelector('#login-status-msg', { state: 'visible' });

      const statusText = await page.textContent('#login-status-msg');
      if (!statusText.includes('Invalid or expired code')) {
        throw new Error(`Expected status to report expired code error, got: ${statusText}`);
      }

      console.log('✔ Login page, light/dark screenshots, and expired code error path verified.');
      await context.close();
    }

    // ── Test Case 4: Localized Strings on FR and RU ───────────────────────
    console.log('E2E Test 4: Localized Strings (FR & RU)');
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      await injectFakeClient(page, { displayName: 'Pierre' });

      await page.goto(`${baseUrl}/fr/index.html`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.cosy-account-chip-btn');
      await page.click('.cosy-account-chip-btn');
      const frRole = await page.textContent('.cosy-account-menu div');
      if (!frRole.toUpperCase().includes('ÉLÈVE')) {
        throw new Error(`Expected FR role label 'ÉLÈVE', got: ${frRole}`);
      }

      await page.goto(`${baseUrl}/ru/index.html`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.cosy-account-chip-btn');
      await page.click('.cosy-account-chip-btn');
      const ruRole = await page.textContent('.cosy-account-menu div');
      if (!ruRole.toUpperCase().includes('СТУДЕНТ')) {
        throw new Error(`Expected RU role label 'СТУДЕНТ', got: ${ruRole}`);
      }

      console.log('✔ FR and RU localized strings verified.');
      await context.close();
    }

    // ── Test Case 5: Keyboard Operation & Mobile View (390px) ──────────────
    console.log('E2E Test 5: Keyboard Operation & Mobile View (390px)');
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await injectFakeClient(page);

      await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.cosy-account-chip-btn');

      // Check no horizontal scroll at 390px
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      if (overflow) {
        throw new Error('Page has horizontal scroll at 390px viewport width!');
      }

      // Keyboard operation: focus chip and press Enter
      await page.focus('.cosy-account-chip-btn');
      await page.keyboard.press('Enter');
      await page.waitForSelector('.cosy-account-menu:not([hidden])');

      // Press Escape to close
      await page.keyboard.press('Escape');
      const hidden = await page.getAttribute('.cosy-account-menu', 'hidden');
      if (hidden === null) {
        throw new Error('Expected menu to be hidden after pressing Escape.');
      }

      console.log('✔ Keyboard operation and 390px mobile view verified.');
      await context.close();
    }

  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }

  console.log('\n=== ALL PLAYWRIGHT E2E TESTS PASSED SUCCESSFULLY! ===');
}

main().catch(error => {
  console.error('Playwright E2E Test Error:', error.stack || error.message);
  process.exitCode = 1;
});
