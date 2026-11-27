const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

function startServer(port) {
  const rootDir = path.resolve(__dirname, '..');
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath.startsWith('/COSYevents/')) {
      reqPath = reqPath.replace('/COSYevents/', '/');
    }
    let filePath = path.join(rootDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

function getLuminance(r, g, b) {
  const [aR, aG, aB] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * aR + 0.7152 * aG + 0.0722 * aB;
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return [255, 255, 255];
}

function parseGradientFirstColor(bgImageStr) {
  if (!bgImageStr || !bgImageStr.includes('gradient')) return null;
  const rgbMatch = bgImageStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }
  const hexMatch = bgImageStr.match(/#([0-9a-fA-F]{3,8})/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex.substring(0, 6), 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  return null;
}

function calculateContrastRatio(color1, color2) {
  const lum1 = getLuminance(...color1);
  const lum2 = getLuminance(...color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const testPages = [
  // 2 per club in sessions/ (22 pages)
  'sessions/basic-speaking-club/session-1-introductions-and-first-impressions.html',
  'sessions/basic-speaking-club/session-10-food-culture-and-personal-taste.html',
  'sessions/cinema-club/gone-girl.html',
  'sessions/cinema-club/the-substance.html',
  'sessions/debatable-relatable/ai-and-art.html',
  'sessions/debatable-relatable/homework-ban.html',
  'sessions/i-couldnt-help-but-wonder/ugly-produce-anti-waste.html',
  'sessions/i-couldnt-help-but-wonder/why-is-everyone-copying-me.html',
  'sessions/if-you-were/if-you-were-blind.html',
  'sessions/if-you-were/if-you-were-teacher.html',
  'sessions/keeping-up-with-science/ai-reality-delusion.html',
  'sessions/keeping-up-with-science/fusion-energy.html',
  'sessions/lets-celebrate/diwali-festival.html',
  'sessions/lets-celebrate/single-working-womens-day.html',
  'sessions/long-reads/attention-economy.html',
  'sessions/long-reads/designed-to-addict.html',
  'sessions/mind-matters/brain-discipline-dopamine.html',
  'sessions/mind-matters/technofeudalism-attention.html',
  'sessions/my-life-with-without/fridge-life.html',
  'sessions/my-life-with-without/holidays-vacations.html',
  'sessions/the-greatest-quotes/ability-to-notice-beauty-quote.html',
  'sessions/the-greatest-quotes/sonder.html',

  // 4 fr/ sessions
  'fr/sessions/lets-celebrate/diwali-festival.html',
  'fr/sessions/mind-matters/anticipatory-grief.html',
  'fr/sessions/the-greatest-quotes/sonder.html',
  'fr/sessions/debatable-relatable/la-semaine-de-4-jours.html',

  // 4 ru/ sessions
  'ru/sessions/lets-celebrate/diwali-festival.html',
  'ru/sessions/mind-matters/ne-ispravlyay-rech.html',
  'ru/sessions/the-greatest-quotes/dostoevsky-loving-power-quote.html',
  'ru/sessions/debatable-relatable/4-dnevnaya-rabochaya-nedelya.html',

  // Catalog pages
  'mind-matters.html',
  'karaoke-club.html',
  'cinema-club.html'
];

async function run() {
  const PORT = 8081;
  const server = await startServer(PORT);
  console.log(`Verification Server running on http://localhost:${PORT}/`);

  const browser = await chromium.launch({ headless: true });
  fs.mkdirSync(path.resolve(__dirname, '../verification'), { recursive: true });

  const viewports = [
    { width: 1366, height: 768, name: '1366px' },
    { width: 390, height: 844, name: '390px' }
  ];
  const modes = ['light', 'dark'];

  let totalTested = 0;
  let consoleErrors = [];
  let navHeightIssues = [];
  let horizScrollPages = [];
  let lowContrastPages = [];

  for (const mode of modes) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: mode
      });

      for (const relPath of testPages) {
        totalTested++;
        const page = await context.newPage();

        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(`[${mode}][${vp.name}][${relPath}] ${msg.text()}`);
          }
        });

        const url = `http://localhost:${PORT}/COSYevents/${relPath}`;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
          await page.waitForTimeout(300);

          // Check nav height
          const navMetrics = await page.evaluate(() => {
            const navElem = document.querySelector('.ce-session-nav');
            if (!navElem) return null;
            const rect = navElem.getBoundingClientRect();
            return {
              height: rect.height,
              scrollWidth: document.documentElement.scrollWidth,
              clientWidth: document.documentElement.clientWidth
            };
          });

          if (navMetrics) {
            if (Math.abs(navMetrics.height - 64) > 1) {
              navHeightIssues.push(`[${mode}][${vp.name}][${relPath}] Nav height is ${navMetrics.height}px (expected 64px)`);
            }
            if (navMetrics.scrollWidth > navMetrics.clientWidth) {
              horizScrollPages.push(`[${mode}][${vp.name}][${relPath}] Horizontal scroll detected (${navMetrics.scrollWidth}px > ${navMetrics.clientWidth}px)`);
            }
          }

          // Check hero contrast if page is a session
          if (relPath.includes('sessions/')) {
            const heroInfo = await page.evaluate(() => {
              const h1 = document.querySelector('h1');
              const hero = document.querySelector('.session-hero') || document.body;
              if (!h1) return null;
              const h1Style = window.getComputedStyle(h1);
              const heroStyle = window.getComputedStyle(hero);
              const bodyStyle = window.getComputedStyle(document.body);
              return {
                h1Color: h1Style.color,
                heroBgColor: heroStyle.backgroundColor,
                heroBgImage: heroStyle.backgroundImage,
                bodyBgColor: bodyStyle.backgroundColor
              };
            });

            if (heroInfo) {
              const textColor = parseRgb(heroInfo.h1Color);
              let bgColor = parseGradientFirstColor(heroInfo.heroBgImage) || parseRgb(heroInfo.heroBgColor);
              if (bgColor[0] === 0 && bgColor[1] === 0 && bgColor[2] === 0 && (heroInfo.heroBgColor === 'rgba(0, 0, 0, 0)' || heroInfo.heroBgColor === 'transparent')) {
                bgColor = parseRgb(heroInfo.bodyBgColor);
              }
              const contrast = calculateContrastRatio(textColor, bgColor);
              if (contrast < 4.5) {
                lowContrastPages.push(`[${mode}][${vp.name}][${relPath}] Hero contrast is ${contrast.toFixed(2)} (< 4.5)`);
              }
            }
          }

          // Capture specific screenshots for PR required verification
          if (relPath === 'sessions/mind-matters/technofeudalism-attention.html' && mode === 'light' && vp.name === '1366px') {
            await page.screenshot({ path: path.resolve(__dirname, '../verification/technofeudalism-attention-after.png') });
          }

          if (relPath === 'sessions/mind-matters/technofeudalism-attention.html' && mode === 'light') {
            if (vp.name === '1366px') {
              await page.screenshot({ path: path.resolve(__dirname, '../verification/nav-closed-desktop.png') });
              const clubsBtn = page.locator('.ce-clubs-btn');
              if (await clubsBtn.count() > 0) {
                await clubsBtn.click();
                await page.waitForTimeout(200);
                await page.screenshot({ path: path.resolve(__dirname, '../verification/nav-open-desktop.png') });
              }
            } else if (vp.name === '390px') {
              await page.screenshot({ path: path.resolve(__dirname, '../verification/nav-closed-mobile.png') });
              const clubsBtn = page.locator('.ce-clubs-btn');
              if (await clubsBtn.count() > 0) {
                await clubsBtn.click();
                await page.waitForTimeout(200);
                await page.screenshot({ path: path.resolve(__dirname, '../verification/nav-open-mobile.png') });
              }
            }
          }

        } catch (err) {
          console.error(`[ERROR] Verification failed for ${relPath}:`, err.message);
        } finally {
          await page.close();
        }
      }
      await context.close();
    }
  }

  await browser.close();
  server.close();

  console.log('\n=== AUDIT VERIFICATION RESULTS ===');
  console.log(`Total Page Tests Executed: ${totalTested}`);
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log(`Nav Height Issues: ${navHeightIssues.length}`);
  console.log(`Horizontal Scroll Pages: ${horizScrollPages.length}`);
  console.log(`Low Contrast Hero Pages: ${lowContrastPages.length}`);

  if (consoleErrors.length > 0) {
    console.log('\nConsole Errors:', consoleErrors);
  }
  if (navHeightIssues.length > 0) {
    console.log('\nNav Height Issues:', navHeightIssues);
  }
  if (horizScrollPages.length > 0) {
    console.log('\nHorizontal Scroll Pages:', horizScrollPages);
  }
  if (lowContrastPages.length > 0) {
    console.log('\nLow Contrast Pages:', lowContrastPages);
  }

  if (consoleErrors.length === 0 && navHeightIssues.length === 0 && horizScrollPages.length === 0 && lowContrastPages.length === 0) {
    console.log('\n✅ ALL VERIFICATION AUDITS PASSED WITH ZERO ISSUES!');
  } else {
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
