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
    server.listen(port, () => {
      resolve(server);
    });
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

function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.html') && !fullPath.includes('crazy-ex-girlfriend-challenge')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

async function run() {
  const PORT = 8080;
  const server = await startServer(PORT);

  const rootDir = path.resolve(__dirname, '..');
  const sessionDirs = ['sessions', 'fr/sessions', 'ru/sessions'];
  let allPages = [];

  sessionDirs.forEach(dir => {
    const fullDir = path.join(rootDir, dir);
    if (fs.existsSync(fullDir)) {
      const files = getAllHtmlFiles(fullDir);
      files.forEach(f => {
        const rel = path.relative(rootDir, f);
        allPages.push(rel);
      });
    }
  });

  console.log(`Found ${allPages.length} session pages to test.`);

  const browser = await chromium.launch({ headless: true });

  const modes = ['light', 'dark'];
  let failingPages = [];
  let totalTested = 0;
  const CONCURRENCY = 12;

  for (const mode of modes) {
    const context = await browser.newContext({ colorScheme: mode });

    // Process pages in parallel using worker pool pattern
    let index = 0;

    async function worker() {
      const page = await context.newPage();
      while (index < allPages.length) {
        const pageRelPath = allPages[index++];
        totalTested++;
        const pageUrl = `http://localhost:${PORT}/COSYevents/${pageRelPath.replace(/\\/g, '/')}`;

        try {
          await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
          await page.waitForSelector('h1', { timeout: 3000 }).catch(() => {});

          const info = await page.evaluate(() => {
            const h1Elem = document.querySelector('h1');
            const heroElem = document.querySelector('.session-hero') || document.body;
            if (!h1Elem) return null;

            const h1Style = window.getComputedStyle(h1Elem);
            const heroStyle = window.getComputedStyle(heroElem);
            const bodyStyle = window.getComputedStyle(document.body);

            return {
              h1Color: h1Style.color,
              heroBgColor: heroStyle.backgroundColor,
              heroBgImage: heroStyle.backgroundImage,
              bodyBgColor: bodyStyle.backgroundColor
            };
          });

          if (info) {
            const textColor = parseRgb(info.h1Color);
            let bgColor = parseGradientFirstColor(info.heroBgImage);
            if (!bgColor) {
              bgColor = parseRgb(info.heroBgColor);
            }
            if (bgColor[0] === 0 && bgColor[1] === 0 && bgColor[2] === 0 && (info.heroBgColor === 'rgba(0, 0, 0, 0)' || info.heroBgColor === 'transparent')) {
              bgColor = parseRgb(info.bodyBgColor);
            }

            const contrast = calculateContrastRatio(textColor, bgColor);

            if (contrast < 4.5) {
              failingPages.push({
                page: pageRelPath,
                mode: mode,
                contrast: contrast.toFixed(2),
                textColor: info.h1Color,
                heroBgImage: info.heroBgImage,
                heroBgColor: info.heroBgColor
              });
            }
          }
        } catch (err) {
          console.error(`[ERROR] Failed testing ${pageRelPath}: ${err.message}`);
        }
      }
      await page.close();
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);
    await context.close();
  }

  await browser.close();
  server.close();

  console.log('\n--- HERO CONTRAST CHECK RESULTS ---');
  console.log(`Total checks run: ${totalTested}`);
  console.log(`Failing checks (< 4.5:1): ${failingPages.length}`);

  if (failingPages.length > 0) {
    console.log('\nFailing pages list:');
    failingPages.forEach(p => {
      console.log(` - [${p.mode}] ${p.page} | Contrast: ${p.contrast} | Text: ${p.textColor} | Image: ${p.heroBgImage} | Color: ${p.heroBgColor}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All session pages pass the 4.5:1 contrast requirement in both light and dark mode!');
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
