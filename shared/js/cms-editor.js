/*!
 * @cosy/cms-editor: the one founder inline editor for all COSY sites.
 *
 * Contract (see docs/CMS_EDITOR_COMPARISON.md):
 *  - Table  public.cms_page_overrides: one row per page. page_path (PK) + content jsonb = { key: html }.
 *  - Role   read from profiles.role for the signed-in user. Never from localStorage, window globals or
 *           user_metadata (the user can edit those). The toolbar is a convenience; the database
 *           (row-level security, is_founder()) is the real gate for writes.
 *  - HTML   cleaned with an allow-list on save AND on render (overrides are public, origin is shared).
 *  - Keys   ^[a-z0-9_-]{1,80}$. Elements are addressed by data-cms-id, then id. Keys are never random.
 *
 * Usage:  CosyCms.init({ getClient: () => supabaseClient })   // or rely on window.supabaseClient
 */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CosyCms = api;
  if (typeof root.document !== 'undefined' && !root.COSY_CMS_NO_AUTOINIT) {
    var start = function () { api.init(); };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  var TABLE = 'cms_page_overrides';
  var MAX_CONTENT_CHARS = 200000;
  var FOUNDER_ROLES = ['founder', 'admin', 'owner'];

  // ---------------------------------------------------------------- sanitizer
  var SAFE_TAGS = new Set(['a', 'b', 'strong', 'i', 'em', 'u', 's', 'del', 'ins', 'mark', 'kbd', 'abbr', 'br',
    'p', 'span', 'div', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre',
    'small', 'sup', 'sub', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
    'section', 'article', 'header', 'footer', 'main', 'figure', 'figcaption', 'details', 'summary', 'img']);
  var DROP_TAGS = new Set(['script', 'style', 'svg', 'math', 'iframe', 'frame', 'frameset', 'object', 'embed',
    'applet', 'template', 'noscript', 'noembed', 'noframes', 'textarea', 'title', 'head', 'base', 'link', 'meta',
    'form', 'select', 'option', 'button', 'input', 'video', 'audio', 'source', 'canvas', 'xmp', 'plaintext']);
  var LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
  var IMG_PROTOCOLS = new Set(['http:', 'https:']);
  var XHTML_NS = 'http://www.w3.org/1999/xhtml';

  function safeUrl(value, protocols) {
    var v = String(value).replace(/[\u0000-\u001f\u007f]/g, '').trim();
    if (!v) return null;
    try {
      var u = new root.URL(v, 'https://relative.invalid/');
      return protocols.has(u.protocol) ? v : null;
    } catch (e) { return null; }
  }

  function sanitizeHTML(html) {
    if (!html || typeof html !== 'string') return '';
    var source = new root.DOMParser().parseFromString(html, 'text/html');
    var outDoc = root.document.implementation.createHTMLDocument('');
    var out = outDoc.createElement('div');
    (function copy(from, to) {
      Array.from(from.childNodes).forEach(function (node) {
        if (node.nodeType === 3) { to.appendChild(outDoc.createTextNode(node.nodeValue)); return; }
        if (node.nodeType !== 1) return;
        var tag = node.localName;
        if (node.namespaceURI !== XHTML_NS || DROP_TAGS.has(tag)) return;
        if (!SAFE_TAGS.has(tag)) { copy(node, to); return; }
        var el = outDoc.createElement(tag);
        ['class', 'lang', 'title', 'aria-label'].forEach(function (n) {
          if (node.hasAttribute(n)) el.setAttribute(n, node.getAttribute(n));
        });
        if (node.hasAttribute('dir') && /^(ltr|rtl|auto)$/i.test(node.getAttribute('dir'))) {
          el.setAttribute('dir', node.getAttribute('dir').toLowerCase());
        }
        if (tag === 'td' || tag === 'th') {
          ['colspan', 'rowspan'].forEach(function (n) {
            if (/^\d{1,2}$/.test(node.getAttribute(n) || '')) el.setAttribute(n, node.getAttribute(n));
          });
        }
        if (tag === 'a') {
          var href = node.hasAttribute('href') ? safeUrl(node.getAttribute('href'), LINK_PROTOCOLS) : null;
          if (href) {
            el.setAttribute('href', href);
            el.setAttribute('rel', 'noopener noreferrer');
            if (String(node.getAttribute('target') || '').toLowerCase() === '_blank') el.setAttribute('target', '_blank');
          }
        }
        if (tag === 'img') {
          var src = node.hasAttribute('src') ? safeUrl(node.getAttribute('src'), IMG_PROTOCOLS) : null;
          if (!src) return;
          el.setAttribute('src', src);
          if (node.hasAttribute('alt')) el.setAttribute('alt', node.getAttribute('alt'));
          to.appendChild(el);
          return;
        }
        copy(node, el);
        to.appendChild(el);
      });
    })(source.body, out);
    return out.innerHTML;
  }

  // ------------------------------------------------------------- keys / paths
  function isValidKey(key) { return typeof key === 'string' && /^[a-z0-9_-]{1,80}$/i.test(key); }
  function isValidPagePath(p) { return typeof p === 'string' && p.length <= 200 && /^[A-Za-z0-9_./-]+$/.test(p); }
  function isFounderRole(role) { return FOUNDER_ROLES.indexOf(String(role || '').trim().toLowerCase()) !== -1; }

  function keyFor(el) {
    var id = el.getAttribute && el.getAttribute('data-cms-id');
    if (id && isValidKey(id)) return id;
    if (el.id && isValidKey(el.id)) return el.id;
    return null;
  }

  function findTargets(key, scope) {
    scope = scope || root.document;
    var out = [];
    var byAttr = scope.querySelectorAll('[data-cms-id="' + key + '"]');
    byAttr.forEach(function (el) { out.push(el); });
    var byId = scope.getElementById ? scope.getElementById(key) : scope.querySelector('#' + key);
    if (byId && out.indexOf(byId) === -1) out.push(byId);
    return out;
  }

  // ------------------------------------------------------------------- data
  function resolveVerifiedUser(client) {
    if (!client || !client.auth || typeof client.auth.getSession !== 'function') return Promise.resolve(null);
    return client.auth.getSession().then(function (res) {
      var user = res && res.data && res.data.session && res.data.session.user;
      if (!user) return null;
      return client.from('profiles').select('role').eq('id', user.id).maybeSingle().then(function (p) {
        if (!p || p.error || !p.data) return null;
        return { id: user.id, role: String(p.data.role || '').trim().toLowerCase() };
      });
    }).catch(function () { return null; });
  }

  function applyOverrides(content, scope) {
    var applied = [];
    if (!content || typeof content !== 'object') return applied;
    Object.keys(content).forEach(function (key) {
      if (!isValidKey(key) || typeof content[key] !== 'string') return;
      var clean = sanitizeHTML(content[key]);
      findTargets(key, scope).forEach(function (el) { el.innerHTML = clean; });
      applied.push(key);
    });
    return applied;
  }

  function loadOverrides(client, pagePath) {
    return client.from(TABLE).select('content').eq('page_path', pagePath).maybeSingle().then(function (res) {
      return (res && res.data && res.data.content) || {};
    });
  }

  // Edits are merged into the stored map, so keys not editable on this visit are never dropped.
  function saveOverrides(client, pagePath, edits, userId) {
    if (!isValidPagePath(pagePath)) return Promise.reject(new Error('Page path not allowed: ' + pagePath));
    var clean = {};
    Object.keys(edits || {}).forEach(function (k) {
      if (isValidKey(k) && typeof edits[k] === 'string') clean[k] = sanitizeHTML(edits[k]);
    });
    return loadOverrides(client, pagePath).then(function (existing) {
      var merged = {};
      Object.keys(existing).forEach(function (k) { if (isValidKey(k) && typeof existing[k] === 'string') merged[k] = existing[k]; });
      Object.keys(clean).forEach(function (k) { merged[k] = clean[k]; });
      if (JSON.stringify(merged).length > MAX_CONTENT_CHARS) throw new Error('Content too large for this page');
      var row = { page_path: pagePath, content: merged, updated_at: new Date().toISOString() };
      if (userId) row.updated_by = userId;
      return client.from(TABLE).upsert(row).then(function (res) {
        if (res && res.error) throw new Error(res.error.message || 'Save failed');
        return merged;
      });
    });
  }

  // --------------------------------------------------------------------- UI
  var SELECTOR = '[data-cms-id], [id]';
  function editableElements(scope) {
    scope = scope || root.document;
    return Array.from(scope.querySelectorAll(SELECTOR)).filter(function (el) {
      if (!keyFor(el)) return false;
      if (el.closest('#cosy-founder-cms-toolbar') || el.closest('[data-cms-ignore="true"]')) return false;
      var t = el.tagName;
      if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'BUTTON', 'BODY', 'HTML', 'MAIN', 'NAV', 'FORM'].indexOf(t) !== -1) return false;
      return el.hasAttribute('data-cms-id') || el.getAttribute('data-cms-editable') === 'true';
    });
  }

  function collectEdits(scope) {
    var edits = {};
    editableElements(scope).forEach(function (el) { edits[keyFor(el)] = el.innerHTML; });
    return edits;
  }

  function injectStyles() {
    var d = root.document;
    if (d.getElementById('cosy-cms-editor-styles')) return;
    var s = d.createElement('style');
    s.id = 'cosy-cms-editor-styles';
    s.textContent =
      '#cosy-founder-cms-toolbar{position:fixed;bottom:20px;right:20px;z-index:999999;display:flex;align-items:center;gap:10px;background:#1b3120;color:#fff;padding:10px 16px;border-radius:30px;box-shadow:0 4px 20px rgba(0,0,0,.35);border:1.5px solid #416b49;font:0.88rem system-ui,-apple-system,sans-serif}' +
      '.cosy-cms-title{font-weight:700;color:#f59e0b}.cosy-cms-btn{background:#416b49;color:#fff;border:0;padding:6px 14px;border-radius:20px;font-weight:600;cursor:pointer}' +
      '.cosy-cms-btn.primary{background:#f59e0b;color:#000;font-weight:700}.cosy-cms-btn:disabled{opacity:.4;cursor:not-allowed}' +
      '.cosy-cms-status{font-size:.82rem;color:#a7f3d0;font-weight:600}' +
      '[contenteditable="true"].cosy-cms-editing{outline:2px dashed #f59e0b!important;outline-offset:3px;border-radius:4px;cursor:text}';
    d.head.appendChild(s);
  }

  function renderToolbar(client, user, pagePath) {
    var d = root.document;
    if (d.getElementById('cosy-founder-cms-toolbar')) return d.getElementById('cosy-founder-cms-toolbar');
    injectStyles();
    var bar = d.createElement('div');
    bar.id = 'cosy-founder-cms-toolbar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Founder CMS');
    bar.innerHTML = '<span class="cosy-cms-title">Founder CMS</span>' +
      '<button type="button" id="cms-edit-btn" class="cosy-cms-btn">Edit page content</button>' +
      '<button type="button" id="cms-save-btn" class="cosy-cms-btn primary" disabled>Save &amp; publish</button>' +
      '<span id="cms-status-msg" class="cosy-cms-status" role="status" aria-live="polite"></span>';
    d.body.appendChild(bar);
    var edit = bar.querySelector('#cms-edit-btn'), save = bar.querySelector('#cms-save-btn'), msg = bar.querySelector('#cms-status-msg');
    var editing = false;
    function say(t, err) { msg.textContent = t; msg.style.color = err ? '#f87171' : '#a7f3d0'; }
    function setEditing(on) {
      editing = on;
      editableElements().forEach(function (el) {
        if (on) { el.setAttribute('contenteditable', 'true'); el.classList.add('cosy-cms-editing'); }
        else { el.removeAttribute('contenteditable'); el.classList.remove('cosy-cms-editing'); }
      });
      edit.textContent = on ? 'Editing (active)' : 'Edit page content';
      save.disabled = !on;
    }
    edit.addEventListener('click', function () {
      setEditing(!editing);
      if (editing && !editableElements().length) say('Nothing editable on this page.', true);
    });
    save.addEventListener('click', function () {
      say('Saving…');
      saveOverrides(client, pagePath, collectEdits(), user.id).then(function () {
        say('Saved and published.'); setEditing(false);
      }).catch(function (e) { say('Error: ' + e.message, true); });
    });
    return bar;
  }

  function resolveClient(opts) {
    if (opts && typeof opts.getClient === 'function') return opts.getClient();
    if (root.supabaseClient && root.supabaseClient.auth) return root.supabaseClient;
    if (root.COSY_SSO && typeof root.COSY_SSO.getSupabaseClient === 'function') return root.COSY_SSO.getSupabaseClient();
    return null;
  }

  function init(opts) {
    opts = opts || {};
    return Promise.resolve(resolveClient(opts)).then(function (client) {
      if (!client) return { applied: [], toolbar: false };
      var pagePath = opts.pagePath || root.location.pathname;
      return loadOverrides(client, pagePath).catch(function () { return {}; }).then(function (content) {
        var applied = applyOverrides(content);
        return resolveVerifiedUser(client).then(function (user) {
          var show = !!(user && isFounderRole(user.role));
          if (show) renderToolbar(client, user, pagePath);
          return { applied: applied, toolbar: show };
        });
      });
    });
  }

  return {
    init: init, sanitizeHTML: sanitizeHTML, isValidKey: isValidKey, isValidPagePath: isValidPagePath,
    isFounderRole: isFounderRole, resolveVerifiedUser: resolveVerifiedUser, applyOverrides: applyOverrides,
    loadOverrides: loadOverrides, saveOverrides: saveOverrides, collectEdits: collectEdits,
    editableElements: editableElements, renderToolbar: renderToolbar
  };
});
