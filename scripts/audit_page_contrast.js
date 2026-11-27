#!/usr/bin/env node
/**
 * Page-level contrast audit.
 *
 * `check-contrast` validates the token pairs in CSS. This walks real rendered
 * pages in both themes and measures the contrast of text against the element's
 * own opaque background, which is how the dark-mode bugs were found: a pale
 * chip whose background darkened while its ink stayed dark, and white text on
 * the light-teal primary.
 *
 * Deliberately not in CI: it needs a browser. Run it by hand after a palette
 * change. The default list is the set that currently passes; pass page paths
 * to sweep further. A wider sweep still reports a backlog of pre-existing
 * issues in some club pages (amber buttons, inline-styled chips) that predate
 * the palette work.
 *
 *   node scripts/audit_page_contrast.js [page.html ...]
 *
 * Needs a Chromium. Playwright's bundled one is used when installed, otherwise
 * point CHROMIUM_PATH at a system binary.
 */

const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.AUDIT_BASE || 'http://127.0.0.1:8000';

const DEFAULT_PAGES = [
  'index.html',
  'karaoke-club.html',
  'speaking-clubs/index.html',
  'today.html',
  'login.html',
  'fr/index.html',
  '404.html',
  'cinema-nights/index.html',
  'game-evenings.html',
  'long-reads.html',
];

const auditFn = () => {
  const parse = c => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const out = [];
  document.querySelectorAll('a,button,[role="button"],span,strong,em,li,td,th,p,h1,h2,h3,h4,label,div').forEach(el => {
    const text = (el.textContent || '').trim();
    if (!text || text.length > 60) return;
    if (el.children.length) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.5) return;
    // .cosy-icon paints its glyph with background-color over a mask, so its
    // colour always equals its fill by design.
    if ((cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none')) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const bg = parse(cs.backgroundColor);
    if (!bg || bg.a < 0.9) return;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.9) return;

    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    const r = ratio(fg, bg);
    if (r < need) {
      out.push({
        text: text.slice(0, 32),
        ratio: +r.toFixed(2),
        need,
        fg: cs.color,
        bg: cs.backgroundColor,
        cls: (el.className || '').toString().slice(0, 40),
        tag: el.tagName,
      });
    }
  });
  return out;
};

(async () => {
  const pages = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PAGES;
  const launchOpts = { args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;

  const browser = await chromium.launch(launchOpts);
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  let total = 0;

  for (const theme of ['light', 'dark']) {
    for (const p of pages) {
      try {
        await page.goto(`${BASE}/${p}`, { waitUntil: 'load', timeout: 30000 });
      } catch (e) {
        console.log(`SKIP ${theme} ${p} (${e.message.split('\n')[0]})`);
        continue;
      }
      await page.evaluate(t => {
        document.documentElement.setAttribute('data-theme', t);
        document.body.classList.toggle('theme-dark', t === 'dark');
      }, theme);
      await page.waitForTimeout(250);

      const seen = new Set();
      const bad = (await page.evaluate(auditFn)).filter(b => {
        const k = `${b.cls}|${b.text}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      if (bad.length) {
        console.log(`\n${theme.toUpperCase()} ${p} — ${bad.length} low-contrast`);
        bad.slice(0, 8).forEach(b =>
          console.log(`   ${b.ratio}:1 (need ${b.need}) ${b.tag}.${b.cls} "${b.text}" fg=${b.fg} bg=${b.bg}`));
        total += bad.length;
      }
    }
  }

  await browser.close();
  console.log(`\n${total === 0 ? 'No low-contrast text found.' : `TOTAL flagged: ${total}`}`);
  process.exit(total === 0 ? 0 : 1);
})();
