const assert = require('assert');

console.log('=== RUNNING SSO AND FOUNDER CMS EDITOR UNIT TESTS ===\n');

function createMockElement(tagName) {
  const attrs = {};
  const listeners = {};
  const children = [];
  let _innerHTML = '';

  const element = {
    tagName: (tagName || 'DIV').toUpperCase(),
    nodeName: (tagName || 'DIV').toUpperCase(),
    nodeType: 1,
    children: children,
    childNodes: children,
    attributes: attrs,
    className: '',
    id: '',
    textContent: '',
    style: {},
    disabled: false,
    parentNode: null,
    nextSibling: null,
    previousElementSibling: null,
    getAttribute: function (k) { return attrs[k] !== undefined ? attrs[k] : null; },
    setAttribute: function (k, v) {
      attrs[k] = String(v);
      if (k === 'id') this.id = String(v);
      if (k === 'class') this.className = String(v);
    },
    removeAttribute: function (k) {
      delete attrs[k];
      if (k === 'id') this.id = '';
      if (k === 'class') this.className = '';
    },
    hasAttribute: function (k) { return attrs[k] !== undefined; },
    appendChild: function (child) {
      if (typeof child === 'string' || typeof child === 'number') {
        child = { nodeType: 3, nodeValue: String(child), textContent: String(child) };
      }
      child.parentNode = element;
      children.push(child);
      return child;
    },
    insertBefore: function (newChild, refChild) {
      const idx = children.indexOf(refChild);
      if (idx !== -1) {
        children.splice(idx, 0, newChild);
      } else {
        children.push(newChild);
      }
      newChild.parentNode = element;
      return newChild;
    },
    addEventListener: function (evt, fn) {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(fn);
    },
    removeEventListener: function (evt, fn) {
      if (!listeners[evt]) return;
      listeners[evt] = listeners[evt].filter(f => f !== fn);
    },
    dispatchEvent: function (evt) {
      const fnList = listeners[evt.type] || [];
      fnList.forEach(fn => fn(evt));
    },
    get innerHTML() {
      return _innerHTML;
    },
    set innerHTML(val) {
      _innerHTML = String(val);
      if (_innerHTML.includes('id="cms-edit-btn"') && !this.querySelector('#cms-edit-btn')) {
        const btn = createMockElement('button');
        btn.id = 'cms-edit-btn';
        btn.setAttribute('id', 'cms-edit-btn');
        btn.textContent = '✏️ Edit Page Content';
        this.appendChild(btn);
      }
      if (_innerHTML.includes('id="cms-save-btn"') && !this.querySelector('#cms-save-btn')) {
        const btn = createMockElement('button');
        btn.id = 'cms-save-btn';
        btn.setAttribute('id', 'cms-save-btn');
        btn.textContent = '💾 Save & Publish Live';
        this.appendChild(btn);
      }
      if (_innerHTML.includes('id="cms-status-msg"') && !this.querySelector('#cms-status-msg')) {
        const span = createMockElement('span');
        span.id = 'cms-status-msg';
        span.setAttribute('id', 'cms-status-msg');
        this.appendChild(span);
      }
    },
    querySelector: function (sel) {
      const results = this.querySelectorAll(sel);
      return results.length > 0 ? results[0] : null;
    },
    querySelectorAll: function (sel) {
      const matches = [];
      const search = (node) => {
        if (!node || !node.tagName) return;
        let isMatch = false;

        if (sel === '#cosy-founder-cms-toolbar' && (node.id === 'cosy-founder-cms-toolbar' || node.getAttribute('id') === 'cosy-founder-cms-toolbar')) isMatch = true;
        if (sel === '#cms-edit-btn' && (node.id === 'cms-edit-btn' || node.getAttribute('id') === 'cms-edit-btn')) isMatch = true;
        if (sel === '#cms-save-btn' && (node.id === 'cms-save-btn' || node.getAttribute('id') === 'cms-save-btn')) isMatch = true;
        if (sel === '#cms-status-msg' && (node.id === 'cms-status-msg' || node.getAttribute('id') === 'cms-status-msg')) isMatch = true;
        if (sel.startsWith('.') && node.className && node.className.split(/\s+/).includes(sel.substring(1))) isMatch = true;
        if (sel.startsWith('#') && (node.id === sel.substring(1) || node.getAttribute('id') === sel.substring(1))) isMatch = true;
        if (sel === 'a[href*="COSY"]' && node.tagName === 'A' && node.getAttribute('href') && node.getAttribute('href').includes('COSY')) isMatch = true;
        if (sel.includes('h1') && node.tagName === 'H1') isMatch = true;
        if (sel.includes('p') && node.tagName === 'P') isMatch = true;

        if (isMatch && !matches.includes(node)) matches.push(node);

        (node.children || []).forEach(child => search(child));
      };
      search(this);
      return matches;
    },
    closest: function (sel) {
      let current = this;
      while (current) {
        if (sel === 'a[href*="COSY"]' && current.tagName === 'A' && current.getAttribute('href') && current.getAttribute('href').includes('COSY')) {
          return current;
        }
        if (sel === '#cosy-founder-cms-toolbar' && (current.id === 'cosy-founder-cms-toolbar' || current.getAttribute('id') === 'cosy-founder-cms-toolbar')) {
          return current;
        }
        current = current.parentNode;
      }
      return null;
    }
  };
  return element;
}

// Global DOM environment simulation
global.window = {
  addEventListener: function () {},
  removeEventListener: function () {},
  location: {
    pathname: '/index.html',
    search: '',
    hash: '#access_token=token123&refresh_token=ref456',
    href: 'https://cosylanguages.github.io/COSYevents/index.html#access_token=token123&refresh_token=ref456'
  },
  history: {
    replaceState: function (state, title, url) {
      global.window.location.hash = '';
      const split = url.split('#');
      global.window.location.pathname = split[0];
    }
  },
  COSY_EVENTS_CONFIG: {
    SUPABASE_URL: 'https://fake.supabase.co',
    SUPABASE_ANON_KEY: 'fake-key'
  },
  supabase: {
    createClient: function () {
      return {
        auth: {
          setSession: function (data) {
            return Promise.resolve({ data: { session: { user: { email: 'admin@cosy.com' }, access_token: data.access_token, refresh_token: data.refresh_token } }, error: null });
          },
          getSession: function () {
            return Promise.resolve({ data: { session: { user: { email: 'admin@cosy.com' }, access_token: 'token123', refresh_token: 'ref456' } } });
          },
          onAuthStateChange: function (cb) {
            cb('SIGNED_IN', { user: { email: 'admin@cosy.com' }, access_token: 'token123', refresh_token: 'ref456' });
          }
        },
        from: function (table) {
          return {
            select: function () {
              return {
                eq: function () {
                  return {
                    maybeSingle: function () {
                      return Promise.resolve({ data: { content: { 'h1.hub-title': 'Overridden Title' } }, error: null });
                    }
                  };
                }
              };
            },
            upsert: function (payload) {
              return Promise.resolve({ data: payload, error: null });
            }
          };
        },
        rpc: function () {
          return Promise.resolve({ data: { role: 'founder' }, error: null });
        }
      };
    }
  }
};

global.document = createMockElement('document');
global.document.head = createMockElement('head');
global.document.body = createMockElement('body');
global.document.head.parentNode = global.document;
global.document.body.parentNode = global.document;
global.document.children = [global.document.head, global.document.body];
global.document.readyState = 'complete';
global.document.currentScript = null;
global.document.scripts = [];
global.document.listeners = {};
const origAddEventListener = global.document.addEventListener;
global.document.addEventListener = function (evt, fn, useCapture) {
  if (!global.document.listeners[evt]) global.document.listeners[evt] = [];
  global.document.listeners[evt].push(fn);
  origAddEventListener.call(global.document, evt, fn, useCapture);
};
global.document.getElementById = function (id) {
  return global.document.querySelector('#' + id);
};
global.document.createElement = function (tag) { return createMockElement(tag); };
global.document.head.appendChild = function (child) {
  global.document.head.children.push(child);
  if (child.onload) setTimeout(child.onload, 10);
  return child;
};
global.document.body.appendChild = function (child) {
  child.parentNode = global.document.body;
  global.document.body.children.push(child);
  return child;
};

// Load SSO and CMS editor modules
require('../shared/js/auth-sso.js');
require('../shared/js/cms-editor.js');

const AuthSSO = global.window.AuthSSO;
const CMSEditor = global.window.CMSEditor;

assert.ok(AuthSSO, 'AuthSSO global should be defined');
assert.ok(CMSEditor, 'CMSEditor global should be defined');

// Test 1: Hash Parsing
console.log('Test 1: AuthSSO Hash Parameters Parsing');
const parsed = AuthSSO.parseHashParams('#access_token=a123&refresh_token=r456');
assert.strictEqual(parsed.access_token, 'a123');
assert.strictEqual(parsed.refresh_token, 'r456');
console.log('✔ AuthSSO Hash Parsing Passed.\n');

// Test 2: Role Detection in CMSEditor
console.log('Test 2: CMSEditor Role Detection');
assert.strictEqual(CMSEditor.isAuthorizedRole('founder'), true);
assert.strictEqual(CMSEditor.isAuthorizedRole('admin'), true);
assert.strictEqual(CMSEditor.isAuthorizedRole('owner'), true);
assert.strictEqual(CMSEditor.isAuthorizedRole('student'), false);
assert.strictEqual(CMSEditor.isAuthorizedRole('teacher'), false);
assert.strictEqual(CMSEditor.isAuthorizedRole(null), false);
console.log('✔ CMSEditor Role Detection Passed.\n');

// Test 3: Floating Founder CMS Toolbar Rendering
console.log('Test 3: Floating Founder CMS Toolbar Rendering');
global.window.COSY_USER = { role: 'founder' };
CMSEditor.init();

setTimeout(() => {
  const toolbar = global.document.body.querySelector('#cosy-founder-cms-toolbar');
  assert.ok(toolbar, 'Founder CMS toolbar should be rendered in body');

  const editBtn = toolbar.querySelector('#cms-edit-btn');
  const saveBtn = toolbar.querySelector('#cms-save-btn');

  assert.ok(editBtn, 'Edit button should exist');
  assert.ok(saveBtn, 'Save button should exist');
  assert.strictEqual(editBtn.textContent.includes('Edit Page Content'), true);
  assert.strictEqual(saveBtn.textContent.includes('Save & Publish Live'), true);
  console.log('✔ Floating Founder CMS Toolbar Rendering Passed.\n');

  // Test 4: Ecosystem Link Interception
  console.log('Test 4: Intercept Clicks on Ecosystem Links');
  const link = createMockElement('a');
  link.setAttribute('href', 'https://cosylanguages.github.io/COSYlanguages/');
  global.document.body.appendChild(link);

  AuthSSO.getState().session = { access_token: 'token123', refresh_token: 'ref456' };

  const clickEvent = {
    type: 'click',
    target: link
  };

  // Dispatch click listener attached to document
  const clickListeners = global.document.listeners ? global.document.listeners['click'] : [];
  clickListeners.forEach(fn => fn(clickEvent));

  const updatedHref = link.getAttribute('href');
  console.log('Updated href:', updatedHref);
  assert.ok(updatedHref.includes('access_token=token123'), 'Link href should contain access_token');
  assert.ok(updatedHref.includes('refresh_token=ref456'), 'Link href should contain refresh_token');
  console.log('✔ Ecosystem Link Interception Passed.\n');

  console.log('=== ALL SSO AND CMSEDITOR UNIT TESTS PASSED SUCCESSFULLY! ===');
}, 50);
