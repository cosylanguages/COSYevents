const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to recursively walk directory for .html files
function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);

    // Ignore skipped directories
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'verification'].includes(entry.name)) {
        continue;
      }
      results = results.concat(getHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Extract href, src, poster, data-src attributes from HTML content
function extractTagAttributes(html) {
  const results = [];
  // Match HTML tags <tagname attr="val" ...>
  const tagRegex = /<([a-z0-9-]+)\s+([^>]+)>/gi;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(html)) !== null) {
    const tagName = tagMatch[1].toLowerCase();
    const attrStr = tagMatch[2];

    // Parse attributes within the tag
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

function shouldIgnore(val, filePath) {
  if (!val || val.trim() === '') return true;
  const trimmed = val.trim();
  if (trimmed.startsWith('#')) return true; // pure anchor
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('data:') || trimmed.startsWith('javascript:')) return true;
  if (trimmed.startsWith('//')) return true; // protocol relative
  if (/\{\{.*?\}\}|\$\{.*?\}|\[\[.*?\]\]/.test(trimmed)) return true; // template placeholders
  if (filePath) {
    const relPath = path.relative(ROOT_DIR, filePath);
    const isTemplate = relPath.startsWith('templates' + path.sep) || relPath.startsWith('templates/');
    if (isTemplate) return true;
  }
  return false;
}

function checkLinks() {
  const htmlFiles = getHtmlFiles(ROOT_DIR);
  const brokenLinks = [];

  for (const filePath of htmlFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const attrEntries = extractTagAttributes(content);

    for (const { tag, attr, val } of attrEntries) {
      if (shouldIgnore(val, filePath)) continue;
      if (tag === 'base') continue;

      // Strip query and hash
      let cleanUrl = val.split('?')[0].split('#')[0];
      if (!cleanUrl) continue; // Was just query/hash or empty after split

      try {
        cleanUrl = decodeURIComponent(cleanUrl);
      } catch (e) {
        // Keep as is if decodeURIComponent fails
      }

      // Resolve relative to the HTML file directory
      const fileDir = path.dirname(filePath);
      let targetPath = path.resolve(fileDir, cleanUrl);

      // Check if target path resolves outside repo root
      const relToRoot = path.relative(ROOT_DIR, targetPath);
      if (relToRoot.startsWith('..') && !path.isAbsolute(relToRoot)) {
        brokenLinks.push({
          file: path.relative(ROOT_DIR, filePath),
          tag: attr,
          url: val,
          resolved: targetPath,
          reason: 'Resolves outside repository root'
        });
        continue;
      }

      // Check existence on disk
      let exists = false;
      if (fs.existsSync(targetPath)) {
        const stat = fs.statSync(targetPath);
        if (stat.isDirectory()) {
          const indexPath = path.join(targetPath, 'index.html');
          if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
            exists = true;
          }
        } else if (stat.isFile()) {
          exists = true;
        }
      }

      if (!exists) {
        brokenLinks.push({
          file: path.relative(ROOT_DIR, filePath),
          tag: attr,
          url: val,
          resolved: targetPath,
          reason: 'Target does not exist on disk'
        });
      }
    }
  }

  // Summary grouped by directory
  const summaryByDir = {};
  for (const item of brokenLinks) {
    const dir = path.dirname(item.file) || '.';
    summaryByDir[dir] = (summaryByDir[dir] || 0) + 1;
  }

  console.log('=== BROKEN LINKS SUMMARY BY DIRECTORY ===');
  for (const [dir, count] of Object.entries(summaryByDir)) {
    console.log(`${dir}: ${count} broken reference(s)`);
  }
  console.log(`\nTotal broken references: ${brokenLinks.length} in ${new Set(brokenLinks.map(b => b.file)).size} files\n`);

  if (brokenLinks.length > 0) {
    console.log('=== FULL LIST OF BROKEN REFERENCES ===');
    for (const item of brokenLinks) {
      console.log(`File: ${item.file} | Tag: ${item.tag} | URL: ${item.url}`);
    }
  }

  return brokenLinks.length;
}

if (require.main === module) {
  const brokenCount = checkLinks();
  if (brokenCount > 0) {
    process.exit(1);
  } else {
    console.log('All links and asset references are valid!');
    process.exit(0);
  }
}

module.exports = { checkLinks, getHtmlFiles };
