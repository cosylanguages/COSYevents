'use strict';
/**
 * Stamps a stable data-cms-id onto every editable text block of an event page.
 *
 * Why: the shared founder editor (shared/js/cms-editor.js) only edits elements that carry an explicit,
 * stable key. Random or positional keys computed at edit time cannot be re-applied on the next load.
 * The key is written into the committed HTML, so it never changes unless the page source changes:
 *
 *     <tag>-<n>-<hash>   n = ordinal among stamped elements of that tag; hash = sha1(text)[0..6]
 *
 * If a rebuild changes an element's text or position, its key changes and an old saved edit simply stops
 * applying (it is never attached to a different element).
 *
 * Only bytes are inserted (` data-cms-id="..."` after the tag name); the rest of the file is untouched.
 */
const crypto = require('crypto');
const parse5 = require('parse5');

const BLOCK_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'th', 'dt', 'dd', 'blockquote', 'figcaption']);
// Inline tags the editor's sanitizer keeps (see COSYstudio packages/cms-editor). A block is editable only if
// everything inside it survives the sanitizer unchanged, so saving never silently strips content.
const INLINE_OK = new Set(['a', 'b', 'strong', 'i', 'em', 'u', 's', 'del', 'ins', 'mark', 'kbd', 'abbr', 'br', 'span', 'code', 'small', 'sup', 'sub']);
const ATTR_OK = new Set(['class', 'lang', 'title', 'aria-label', 'dir']);
const SKIP_ANCESTORS = new Set(['script', 'style', 'template', 'noscript', 'svg', 'math', 'form', 'button', 'select', 'textarea', 'nav', 'head', 'title']);
const SKIP_CLASS = /\b(ce-session-nav|cosy-nav|cosy-account|ce-lang)\b/;

function attrs(node) { const o = {}; (node.attrs || []).forEach(a => { o[a.name] = a.value; }); return o; }

function safeHref(v) {
  const x = String(v).replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (!x) return false;
  try { return ['http:', 'https:', 'mailto:'].includes(new URL(x, 'https://relative.invalid/').protocol); } catch (e) { return false; }
}

function innerIsClean(node) {
  return (node.childNodes || []).every(c => {
    if (c.nodeName === '#text') return true;
    if (c.nodeName === '#comment') return false;
    if (!c.tagName || !INLINE_OK.has(c.tagName)) return false;
    const a = attrs(c);
    for (const k of Object.keys(a)) {
      if (ATTR_OK.has(k)) continue;
      if (c.tagName === 'a' && k === 'href' && safeHref(a[k])) continue;
      if (c.tagName === 'a' && k === 'rel') continue;
      if (c.tagName === 'a' && k === 'target' && a[k].toLowerCase() === '_blank') continue;
      return false;
    }
    if (c.tagName === 'a' && !('href' in a)) return false; // anchor without a safe href would lose meaning
    return innerIsClean(c);
  });
}

function textOf(node) {
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes || []).map(textOf).join('');
}

function hashOf(node) {
  const t = textOf(node).replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha1').update(t).digest('hex').slice(0, 6);
}

function walk(node, ctx, out) {
  if (node.tagName) {
    const a = attrs(node);
    if (SKIP_ANCESTORS.has(node.tagName) || 'data-cms-ignore' in a || SKIP_CLASS.test(a.class || '') || a.id === 'cosy-nav') return;
    if (BLOCK_TAGS.has(node.tagName)) {
      const hasI18n = Object.keys(a).some(k => k.startsWith('data-i18n'));
      const text = textOf(node).replace(/\s+/g, ' ').trim();
      const eligible = !hasI18n && !('id' in a) && text.length > 0 && innerIsClean(node) && !('contenteditable' in a);
      if (eligible) out.push(node);
      return; // never descend into a block: nested blocks are not separately editable
    }
  }
  const kids = node.tagName === 'template' && node.content ? node.content.childNodes : node.childNodes;
  (kids || []).forEach(c => walk(c, ctx, out));
}

/** Returns { html, added, existing }. Idempotent: elements that already have data-cms-id are left alone. */
function stampHtml(html) {
  const doc = parse5.parse(html, { sourceCodeLocationInfo: true });
  const found = [];
  walk(doc, {}, found);
  const counters = {};
  const inserts = [];
  let existing = 0;
  const used = new Set();
  // collect existing keys so new ones never collide
  (function collect(n) { if (n.attrs) { const a = attrs(n); if (a['data-cms-id']) used.add(a['data-cms-id']); } (n.childNodes || []).forEach(collect); })(doc);
  found.forEach(node => {
    const tag = node.tagName;
    counters[tag] = (counters[tag] || 0) + 1;
    const a = attrs(node);
    if ('data-cms-id' in a) { existing++; return; }
    let key = `${tag}-${counters[tag]}-${hashOf(node)}`;
    while (used.has(key)) key += 'x';
    used.add(key);
    const loc = node.sourceCodeLocation && node.sourceCodeLocation.startTag;
    if (!loc) return;
    inserts.push({ at: loc.startOffset + 1 + tag.length, text: ` data-cms-id="${key}"` });
  });
  let out = html;
  inserts.sort((x, y) => y.at - x.at).forEach(i => { out = out.slice(0, i.at) + i.text + out.slice(i.at); });
  return { html: out, added: inserts.length, existing };
}

module.exports = { stampHtml, BLOCK_TAGS };
