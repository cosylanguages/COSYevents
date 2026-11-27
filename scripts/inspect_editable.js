const fs = require('fs');
const path = require('path');
const { getHtmlFiles } = require('./check_links');

const ROOT_DIR = path.resolve(__dirname, '..');
const htmlFiles = getHtmlFiles(ROOT_DIR);

const doNotTouch = [
  'styles/calendar.css',
  'shared/calendar/calendar.js',
  'shared/calendar-data/events.json',
  'index.html',
  'fr/index.html',
  'ru/index.html',
  'it/index.html',
  'el/index.html'
];

function extractTagAttributes(html) {
  const results = [];
  const tagRegex = /<([a-z0-9-]+)\s+([^>]+)>/gi;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(html)) !== null) {
    const tagName = tagMatch[1].toLowerCase();
    const attrStr = tagMatch[2];
    const attrRegex = /([a-z0-9-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const val = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : attrMatch[4]);
      if (['href', 'src', 'poster', 'data-src'].includes(attrName)) {
        results.push({ tag: tagName, attr: attrName, val: val || '' });
      }
    }
  }
  return results;
}

function shouldIgnore(val) {
  if (!val || val.trim() === '') return true;
  const trimmed = val.trim();
  if (trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('data:') || trimmed.startsWith('javascript:')) return true;
  if (trimmed.startsWith('//')) return true;
  if (/\{\{.*?\}\}|\$\{.*?\}|\[\[.*?\]\]/.test(trimmed)) return true;
  return false;
}

const brokenInEditable = [];
for (const filePath of htmlFiles) {
  const relFile = path.relative(ROOT_DIR, filePath);
  if (doNotTouch.includes(relFile)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const attrs = extractTagAttributes(content);

  for (const item of attrs) {
    if (shouldIgnore(item.val)) continue;
    let cleanUrl = item.val.split('?')[0].split('#')[0];
    if (!cleanUrl) continue;
    try { cleanUrl = decodeURIComponent(cleanUrl); } catch (e) {}

    const fileDir = path.dirname(filePath);
    let targetPath = path.resolve(fileDir, cleanUrl);

    let exists = false;
    if (fs.existsSync(targetPath)) {
      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
        const indexPath = path.join(targetPath, 'index.html');
        if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) exists = true;
      } else if (stat.isFile()) exists = true;
    }

    if (!exists) {
      brokenInEditable.push({ file: relFile, tag: item.tag, attr: item.attr, val: item.val, cleanUrl, fileDir });
    }
  }
}

console.log('Broken in editable files count:', brokenInEditable.length);

// Group by pattern / type
const groups = {};
for (const b of brokenInEditable) {
  let key = 'other';
  if (b.val.includes('images/')) key = 'image';
  else if (b.val.includes('#languages')) key = 'languages_anchor';
  else if (b.val.includes('practice/index.html') || b.val.includes('games/index.html')) key = 'practice_or_games';
  else if (b.val.includes('index.html') || b.val.endsWith('/')) key = 'home_or_events_index';
  else if (b.val.includes('.html')) key = 'other_html_link';

  if (!groups[key]) groups[key] = [];
  groups[key].push(b);
}

for (const key in groups) {
  console.log(`\nGroup [${key}]: ${groups[key].length} items`);
  groups[key].slice(0, 5).forEach(item => console.log(`  File: ${item.file} | Tag: ${item.tag} | Val: ${item.val}`));
}
