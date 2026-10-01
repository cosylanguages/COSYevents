const fs = require('fs');
const path = require('path');

const cssFiles = [
  'shared/css/hub.css',
  'shared/css/cosy-icons.css',
  'styles/calendar.css',
  'shared/css/lang.css',
  'shared/css/tokens.css'
];

let allCssText = '';
for (const f of cssFiles) {
  if (fs.existsSync(f)) {
    allCssText += ' ' + fs.readFileSync(f, 'utf8');
  }
}

const cssClassRegex = /\.([a-zA-Z0-9_-]+)/g;
const definedClasses = new Set();
let match;
while ((match = cssClassRegex.exec(allCssText)) !== null) {
  definedClasses.add(match[1]);
}

const jsIgnoredClasses = new Set([
  'today', 'other-month', 'converted', 'planned', 'active', 'open',
  'seat-pill-ok', 'seat-pill-low', 'seat-pill-medium', 'badge-speaking-club',
  'badge-cinema-night', 'badge-special-event', 'badge-teacher-session', 'is-current',
  'view-details-btn', 'cosy-strip-link'
]);

const pages = ['fr/index.html', 'ru/index.html', 'it/index.html', 'el/index.html'];

let totalOrphans = 0;

for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');

  let pageCss = allCssText;
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sMatch;
  while ((sMatch = styleRegex.exec(html)) !== null) {
    pageCss += ' ' + sMatch[1];
  }

  const pageDefined = new Set(definedClasses);
  let match2;
  const re = /\.([a-zA-Z0-9_-]+)/g;
  while ((match2 = re.exec(pageCss)) !== null) {
    pageDefined.add(match2[1]);
  }

  const classAttrRegex = /class=["']([^"']+)["']/g;
  const usedClasses = new Set();
  let cMatch;
  while ((cMatch = classAttrRegex.exec(html)) !== null) {
    const list = cMatch[1].split(/\s+/);
    for (const cls of list) {
      if (cls && cls.trim()) usedClasses.add(cls.trim());
    }
  }

  const orphans = [];
  for (const cls of usedClasses) {
    if (!pageDefined.has(cls) && !jsIgnoredClasses.has(cls)) {
      orphans.push(cls);
    }
  }

  console.log(`Page ${p} orphan classes count: ${orphans.length}`, orphans);
  totalOrphans += orphans.length;
}

if (totalOrphans > 0) {
  console.error(`Orphan CSS class check failed: ${totalOrphans} orphan classes found.`);
  process.exit(1);
} else {
  console.log('SUCCESS: 0 orphan CSS classes found on all rebuilt hub pages!');
  process.exit(0);
}
