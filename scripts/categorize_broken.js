const fs = require('fs');
const path = require('path');
const { getHtmlFiles } = require('./check_links');

const ROOT_DIR = path.resolve(__dirname, '..');
const htmlFiles = getHtmlFiles(ROOT_DIR);

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

const allBroken = [];
for (const filePath of htmlFiles) {
  const relFile = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const attrs = extractTagAttributes(content);

  for (const { tag, attr, val } of attrs) {
    if (shouldIgnore(val)) continue;
    let cleanUrl = val.split('?')[0].split('#')[0];
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
      allBroken.push({ file: relFile, tag, attr, val, cleanUrl, fileDir });
    }
  }
}

console.log('Total broken refs count:', allBroken.length);

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

const inForbidden = allBroken.filter(b => doNotTouch.includes(b.file));
const inAllowed = allBroken.filter(b => !doNotTouch.includes(b.file));

console.log('Broken in forbidden files:', inForbidden.length);
inForbidden.forEach(b => console.log(`  ${b.file}: <${b.tag} ${b.attr}="${b.val}">`));

console.log('Broken in editable files:', inAllowed.length);
