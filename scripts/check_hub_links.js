const fs = require('fs');
const path = require('path');

function checkPageLinks(pagePath) {
  const content = fs.readFileSync(pagePath, 'utf8');
  const hrefs = [];
  const regex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let href = match[1];
    if (href.includes('#')) href = href.split('#')[0];
    if (href) hrefs.push(href);
  }

  const pageDir = path.dirname(pagePath);
  const broken = [];
  for (const href of hrefs) {
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }
    const resolved = path.join(pageDir, href);
    if (!fs.existsSync(resolved)) {
      broken.push({ href, resolved });
    }
  }
  return broken;
}

console.log('Broken in fr/speaking-clubs.html:', checkPageLinks('fr/speaking-clubs.html'));
console.log('Broken in fr/mind-matters.html:', checkPageLinks('fr/mind-matters.html'));
console.log('Broken in ru/speaking-clubs.html:', checkPageLinks('ru/speaking-clubs.html'));
console.log('Broken in ru/mind-matters.html:', checkPageLinks('ru/mind-matters.html'));
