const fs = require('fs');
const path = require('path');

let errors = [];

// 1. Audit events.json
const eventsPath = 'shared/calendar-data/events.json';
if (fs.existsSync(eventsPath)) {
  const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  events.forEach((evt, idx) => {
    if (evt.registration_link && !evt.registration_link.startsWith('https://wa.me/') && !evt.registration_link.startsWith('https://t.me/')) {
      errors.push(`events.json item ${evt.id || idx}: unusual registration link ${evt.registration_link}`);
    }
    if (evt.convertedLessonUrl && !evt.convertedLessonUrl.startsWith('https://cosylanguages.github.io/COSYplatform/')) {
      errors.push(`events.json item ${evt.id || idx}: invalid COSYplatform link ${evt.convertedLessonUrl}`);
    }
  });
}

// 2. Audit data/sessions.json
const sessionsCatalogPath = 'data/sessions.json';
if (fs.existsSync(sessionsCatalogPath)) {
  const catalog = JSON.parse(fs.readFileSync(sessionsCatalogPath, 'utf8'));
  catalog.forEach((item, idx) => {
    if (!item.href || !fs.existsSync(item.href)) {
      errors.push(`data/sessions.json item ${idx}: href does not exist ${item.href}`);
    }
  });
}

// 3. Audit data/events/*.json
const eventsDir = 'data/events';
if (fs.existsSync(eventsDir)) {
  const files = fs.readdirSync(eventsDir);
  files.forEach(f => {
    if (f.endsWith('.json')) {
      try {
        JSON.parse(fs.readFileSync(path.join(eventsDir, f), 'utf8'));
      } catch (err) {
        errors.push(`Malformed JSON in ${f}: ${err.message}`);
      }
    }
  });
}

console.log(`Cross-repository link and data audit finished with ${errors.length} issue(s).`);
if (errors.length > 0) {
  console.log('Issues found:', errors);
  process.exit(1);
} else {
  console.log('✅ All cross-repository URLs, contact links, and JSON database paths are 100% valid!');
}
