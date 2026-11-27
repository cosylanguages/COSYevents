const fs = require('fs');
const path = require('path');
const { checkLinks } = require('./check_links');

// Let's modify check_links to return detailed objects or write a helper here
const ROOT_DIR = path.resolve(__dirname, '..');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'verification'].includes(entry.name)) continue;
      results = results.concat(getHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractAttrValues(html) {
  const matches = [];
  const regex = /(?:href|src|poster|data-src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const val = match[1] || match[2] || match[3] || '';
    const fullMatch = match[0];
    const tagNameMatch = fullMatch.match(/^([a-z0-9-]+)/i);
    const attrName = tagNameMatch ? tagNameMatch[1] : 'attr';
    matches.push({ attr: attrName, val });
  }
  return matches;
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

const htmlFiles = getHtmlFiles(ROOT_DIR);
const broken = [];

for (const filePath of htmlFiles) {
  const relFile = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const attrs = extractAttrValues(content);

  for (const { attr, val } of attrs) {
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
      broken.push({ file: relFile, attr, val, cleanUrl });
    }
  }
}

console.log('Total broken refs:', broken.length);
const categories = {};
for (const b of broken) {
  let cat = 'other';
  if (b.val.includes('images/')) cat = 'images';
  else if (b.val.includes('#languages')) cat = '#languages';
  else if (b.val.includes('practice/index.html') || b.val.includes('games/index.html')) cat = 'practice/games';
  else if (b.val.includes('index.html') || b.val.endsWith('/')) cat = 'index/home/events';
  else if (b.val.includes('.html')) cat = 'other_html';

  if (!categories[cat]) categories[cat] = [];
  categories[cat].push(b);
}

for (const cat in categories) {
  console.log(`\nCategory [${cat}]: ${categories[cat].length} broken items`);
  // sample
  categories[cat].slice(0, 10).forEach(item => {
    console.log(`  File: ${item.file} | Tag: ${item.attr} | URL: ${item.val}`);
  });
}
