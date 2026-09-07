// App bootstrap: initialises global state, visitor mode, and app startup sequence.
/**
 * js/core/engine.js
 * App bootstrap, global state management, and user role detection (Free visitor).
 */
/**
 * cosy-mode.js — THE ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 * COSYlanguages shared mode system.
 * Visitor mode only.
 * ───────────────────────────────────────────────────────────────────────────── */
;(function () { 'use strict'

/* ═══════════════════════════════════════════════════════════════
   LOCAL FAMILY PROFILES SYSTEM & LOCALSTORAGE INTERCEPTOR
   ═══════════════════════════════════════════════════════════════ */
window.COSY_PROFILES = {
    getActiveProfile() {
        return localStorage.getItem('cosy_active_profile') || 'Guest';
    },
    getProfileList() {
        try {
            const list = localStorage.getItem('cosy_profile_list');
            return list ? JSON.parse(list) : ['Guest'];
        } catch (e) {
            return ['Guest'];
        }
    },
    setActiveProfile(name) {
        if (!name) return;
        localStorage.setItem('cosy_active_profile', name);
        window.location.reload();
    },
    createProfile(name) {
        name = name.trim();
        if (!name) return false;
        const list = this.getProfileList();
        if (list.includes(name)) return false;
        list.push(name);
        localStorage.setItem('cosy_profile_list', JSON.stringify(list));
        return true;
    },
    deleteProfile(name) {
        if (name === 'Guest') return;
        let list = this.getProfileList();
        list = list.filter(p => p !== name);
        localStorage.setItem('cosy_profile_list', JSON.stringify(list));
        if (this.getActiveProfile() === name) {
            localStorage.setItem('cosy_active_profile', 'Guest');
        }
        window.location.reload();
    },
    getPrefixedKey(key) {
        const active = this.getActiveProfile();
        if (active === 'Guest') return key;
        return `profile_${active}_${key}`;
    }
};

function getPrefixedKey(key) {
    if (window.COSY_PROFILES && typeof window.COSY_PROFILES.getPrefixedKey === 'function') {
        return window.COSY_PROFILES.getPrefixedKey(key);
    }
    return key;
}

(function() {
    const originalGetItem = localStorage.getItem;
    const originalSetItem = localStorage.setItem;
    const EXCLUDED_GLOBAL_KEYS = ['cosy_theme', 'cosy_active_profile', 'cosy_profile_list'];

    localStorage.getItem = function(key) {
        if (typeof key === 'string' && !EXCLUDED_GLOBAL_KEYS.includes(key) && (
            key.startsWith('cosy_') ||
            key === 'practice_streak' ||
            key === 'cosy_practice' ||
            key === 'cosy_notebook'
        )) {
            const prefixedKey = getPrefixedKey(key);
            return originalGetItem.call(localStorage, prefixedKey);
        }
        return originalGetItem.call(localStorage, key);
    };

    localStorage.setItem = function(key, value) {
        if (typeof key === 'string' && !EXCLUDED_GLOBAL_KEYS.includes(key) && (
            key.startsWith('cosy_') ||
            key === 'practice_streak' ||
            key === 'cosy_practice' ||
            key === 'cosy_notebook'
        )) {
            const prefixedKey = getPrefixedKey(key);
            return originalSetItem.call(localStorage, prefixedKey, value);
        }
        return originalSetItem.call(localStorage, key, value);
    };
})();

/* ═══════════════════════════════════════════════════════════════
   1. CONSTANTS & KEYS
   ═══════════════════════════════════════════════════════════════ */

const NAV_CONFIG = {
    free: [
        { key: 'home',     href: 'index.html',           icon: ''   },
        { key: 'about',    href: 'about/index.html',     icon: '🏡' },
        { key: 'practice', href: 'practice/index.html',  icon: '💡' },
        { key: 'atlas',    href: 'comparative/index.html', icon: '🌐' },
        { key: 'notebook', href: 'notebook/index.html',  icon: '📓' },
        { key: 'games',    href: 'games/index.html',     icon: '🎮' },
        { key: 'events',   href: 'events/index.html',    icon: '🎉' },
        { key: 'hybrid',   href: 'hybrid/index.html',    icon: '🌿' }
    ]
};

const BASE_URL = (window.location.pathname.startsWith('/COSYlanguages/') || window.location.pathname === '/COSYlanguages')
    ? '/COSYlanguages/'
    : '/';

const KEY_PRACTICE = 'cosy_practice'
const KEY_NOTEBOOK = 'cosy_notebook' // { [lessonId]: { notes: '', mistakes: [] } }

let vocabManifest = null;
const FALLBACK_VOCAB_FILES = [
    'vocabulary.js','verbs.js','adjectives.js','grammar_elements.js',
    'grammar.js','dishes.js','speaking.js','debates.js','opinions.js',
    'quotes.js','fluency.js','locations.js','people.js','nationalities.js'
];

/* ═══════════════════════════════════════════════════════════════
   2. STATE MANAGEMENT
   ═══════════════════════════════════════════════════════════════ */
function readState () {
    const mode = 'free'

    // Consolidate practice state from multiple keys
    const practice = tryParse(localStorage.getItem(KEY_PRACTICE)) || { totalPts: 0, streak: 0, mistakes: [] }
    practice.totalPts = parseInt(localStorage.getItem('cosy_total_points') || practice.totalPts || '0')
    practice.streak = parseInt(localStorage.getItem('practice_streak') || practice.streak || '0')

    const notebook = tryParse(localStorage.getItem(KEY_NOTEBOOK)) || {}
    return { mode, practice, notebook }
}

function tryParse (str) { try { return str ? JSON.parse(str) : null } catch { return null } }

function getPrefix() {
    return BASE_URL;
}

/* ═══════════════════════════════════════════════════════════════
   3. AUTH & LIVE SYNC (DEPRECATED)
   ═══════════════════════════════════════════════════════════════ */
// Authenticated features moved to ProgressMe.

/* ═══════════════════════════════════════════════════════════════
   4. NAV TEMPLATES
   ═══════════════════════════════════════════════════════════════ */
function isActive (href) {
    const cleanHref = href.split('?')[0].split('#')[0];
    const path = window.location.pathname;

    // Home page special case (root or index.html not in a subfolder)
    if (cleanHref === 'index.html' || cleanHref === './index.html') {
        const isSubfolder = /\/(practice|games)\//.test(path);
        if (!isSubfolder && (path.endsWith('/') || path.endsWith('index.html'))) return 'class="active"';
    }

    // Sub-app matching (e.g. "practice/index.html" matches any path containing "/practice/")
    const parts = cleanHref.split('/');
    const folder = parts.find(p => p && p !== '..' && p !== '.');
    if (folder && folder !== 'index.html') {
        if (path.includes('/' + folder + '/')) return 'class="active"';
    }

    // Direct filename match
    const filename = parts[parts.length - 1];
    if (path.endsWith(filename) && path.includes(folder || '')) return 'class="active"';

    return '';
}

function updateNavActiveState() {
    const navLinks = document.querySelectorAll('nav a, #cosy-nav a, #main-nav a, .mobile-nav a');
    const currentUrl = new URL(window.location.href);
    const pathParts = currentUrl.pathname.split('/').filter(p => p);
    const currentFilename = pathParts[pathParts.length - 1] || 'index.html';
    const currentHash = currentUrl.hash;

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;

        link.classList.remove('active');

        // Resolve relative href to absolute path for comparison
        try {
            const linkUrl = new URL(href, window.location.origin + window.location.pathname);
            const linkPathParts = linkUrl.pathname.split('/').filter(p => p);
            const linkFilename = linkPathParts[linkPathParts.length - 1] || 'index.html';
            const linkHash = linkUrl.hash;

            // Simple match: filename + hash
            if (linkFilename === currentFilename) {
                if (linkHash) {
                    if (linkHash === currentHash) link.classList.add('active');
                } else if (!currentHash) {
                    link.classList.add('active');
                }
            }

            // Subfolder match for core sections
            const coreFolders = ['practice', 'games', 'events'];
            coreFolders.forEach(folder => {
                if (pathParts.includes(folder) && linkPathParts.includes(folder)) {
                    link.classList.add('active');
                }
            });

        } catch (e) {}
    });
}

const NAV_FALLBACKS = {
    ba: { home: 'Баш бит', about: 'О нас', practice: 'Практика', hybrid: 'Гибрид', games: 'Уйындар', events: 'Чаралар', contact: 'Бәйләнеш' },
    tt: { home: 'Төп бит', about: 'О нас', practice: 'Практика', hybrid: 'Гибрид', games: 'Уеннар', events: 'Чаралар', contact: 'Бәйләнеш' },
    ru: { home: 'Главная', about: 'О нас', practice: 'Практика', hybrid: 'Гибрид', games: 'Игры', events: 'Мероприятия', contact: 'Связь' }
};

function getNavLabel(key, fallback) {
    const cleanKey = key.replace(/^nav\./, '');
    if (window.t) {
        const val = window.t('nav.' + cleanKey) || window.t('nav_' + cleanKey) || window.t(cleanKey);
        if (val) return val;
    }
    const lang = (document.documentElement.lang || 'en').toLowerCase();
    if (NAV_FALLBACKS[lang] && NAV_FALLBACKS[lang][cleanKey]) return NAV_FALLBACKS[lang][cleanKey];
    return fallback;
}

function renderNavLinks(mode) {
    const p = getPrefix();
    const config = NAV_CONFIG[mode] || [];
    return config.map(item => {
        const label = getNavLabel(item.key, item.key[0].toUpperCase() + item.key.slice(1));
        const key = `nav_${item.key}`;
        return `<li role="none"><a href="${p}${item.href}" ${isActive(item.href)} data-translate-key="${key}" data-i18n="nav.${item.key}" role="menuitem">${item.icon ? item.icon + ' ' : ''}${label}</a></li>`;
    }).join('');
}

function navFree () {
    const p = getPrefix();
    const t = getNavLabel;
    const isDark = (localStorage.getItem('cosy_theme') || 'light') === 'dark';
    const activeProfile = window.COSY_PROFILES ? window.COSY_PROFILES.getActiveProfile() : 'Guest';
    const profiles = window.COSY_PROFILES ? window.COSY_PROFILES.getProfileList() : ['Guest'];
    const profileOptions = profiles.map(prof => `<option value="${prof}" ${prof === activeProfile ? 'selected' : ''}>👤 ${prof}</option>`).join('');

    // Global language switcher (flag picker) state and options
    const currentLang = localStorage.getItem('cosy_ui_lang') || localStorage.getItem('cosy_last_language') || 'en';
    const langOptions = [
        { code: 'en', flag: '🇬🇧', label: 'EN' },
        { code: 'fr', flag: '🇫🇷', label: 'FR' },
        { code: 'it', flag: '🇮🇹', label: 'IT' },
        { code: 'ru', flag: '🇷🇺', label: 'RU' },
        { code: 'el', flag: '🇬🇷', label: 'EL' },
        { code: 'es', flag: '🇪🇸', label: 'ES' }
    ].map(l => `<option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.flag} ${l.label}</option>`).join('');

    return `
      <a class="nav-logo" href="${p}index.html" aria-label="${t('home_aria', 'COSYlanguages Home')}">
        <img src="${p}images/logos/cosylanguages.png" alt="COSYlanguages logo" onerror="this.style.display='none'">
        <span>COSYlanguages</span>
      </a>
      <ul class="nav-links" role="menubar">
        ${renderNavLinks('free')}
      </ul>
      <div id="cosy-nav-context" class="nav-context"></div>
      <div class="nav-right" style="display:flex; align-items:center; gap:8px;">
        <select id="cosy-language-switcher" onchange="setLanguage(this.value)" class="styled-sel" style="width: auto; padding: 4px 8px; font-size: 0.8rem; border-radius: var(--r-sm); height: 32px; background: var(--warm-white); border: 1px solid var(--border); color: var(--ink); cursor: pointer;" aria-label="Select Language">
          ${langOptions}
        </select>
        <select id="profile-switcher" onchange="COSY.switchProfile(this.value)" class="styled-sel" style="width: auto; padding: 4px 8px; font-size: 0.8rem; border-radius: var(--r-sm); height: 32px; background: var(--warm-white); border: 1px solid var(--border); color: var(--ink); cursor: pointer;">
          ${profileOptions}
          <option value="__create__">+ New...</option>
        </select>
        <button class="theme-toggle-btn" onclick="COSY.toggleTheme()" aria-label="Toggle Theme" style="background:none; border:none; font-size:1.2rem; cursor:pointer; padding:6px; display:inline-flex; align-items:center; margin-right: 4px;">
            ${isDark ? '☀️' : '🌙'}
        </button>
        <a class="nav-cta" href="https://wa.me/330766784195?text=Hi!" target="_blank" data-translate-key="nav_contact" data-i18n="nav.contact">${t('contact', '💬 Contact us')}</a>
        <button class="nav-menu-btn" onclick="COSY.toggleMobileMenu()" aria-label="Toggle Menu" aria-expanded="false">☰</button>
      </div>`
}

/* ═══════════════════════════════════════════════════════════════
   5. UI CORE (Templates)
   ═══════════════════════════════════════════════════════════════ */

function applyMode () {
    const { mode } = STATE;
    document.body.className = document.body.className.replace(/mode-\w+/g, '').trim();
    document.body.classList.add('mode-free');

    const nav = document.getElementById('cosy-nav');
    if (nav) {
        nav.className = 'nav-container';
        const t = getNavLabel;
        nav.setAttribute('aria-label', t('main_aria', 'Main Navigation'));
        nav.innerHTML = navFree();

        // Restore context if any
        if (COSY._navContext) {
            const ctx = document.getElementById('cosy-nav-context');
            if (ctx) ctx.innerHTML = COSY._navContext;
        }
    }

    const mm = document.getElementById('cosy-mobile-menu');
    if (mm) mm.innerHTML = mobileMenuHTML(mode);

    if (window.COSY_UI && typeof window.COSY_UI.updateMobileNav === 'function') {
        window.COSY_UI.updateMobileNav(mode);
    }

    document.dispatchEvent(new CustomEvent('cosyModeChanged', { detail: STATE }));

    // Re-apply translations if i18n is available
    if (window.COSY_I18N && typeof window.COSY_I18N.refresh === 'function') {
        window.COSY_I18N.refresh();
    }
}

function mobileMenuHTML (mode) {
    const p = getPrefix();
    const activeProfile = window.COSY_PROFILES ? window.COSY_PROFILES.getActiveProfile() : 'Guest';
    const profiles = window.COSY_PROFILES ? window.COSY_PROFILES.getProfileList() : ['Guest'];
    const profileOptions = profiles.map(prof => `<option value="${prof}" ${prof === activeProfile ? 'selected' : ''}>👤 ${prof}</option>`).join('');

    // Global language switcher (flag picker) state and options for mobile menu
    const currentLang = localStorage.getItem('cosy_ui_lang') || localStorage.getItem('cosy_last_language') || 'en';
    const langOptions = [
        { code: 'en', flag: '🇬🇧', label: 'EN' },
        { code: 'fr', flag: '🇫🇷', label: 'FR' },
        { code: 'it', flag: '🇮🇹', label: 'IT' },
        { code: 'ru', flag: '🇷🇺', label: 'RU' },
        { code: 'el', flag: '🇬🇷', label: 'EL' },
        { code: 'es', flag: '🇪🇸', label: 'ES' }
    ].map(l => `<option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.flag} ${l.label}</option>`).join('');

    return `
      <a href="${p}index.html" data-translate-key="nav_home" data-i18n="nav.home">Home</a>
      <a href="${p}practice/index.html" data-translate-key="nav_practice" data-i18n="nav.practice">💡 Practice</a>
      <a href="${p}notebook/index.html" data-translate-key="nav_notebook" data-i18n="nav.notebook">📓 Notebook</a>
      <a href="${p}games/index.html" data-translate-key="nav_games" data-i18n="nav.games">🎮 Games</a>
      <a href="${p}events/index.html" data-translate-key="nav_events" data-i18n="nav.events">🎉 Events</a>
      <a href="${p}hybrid/index.html" data-translate-key="nav_hybrid" data-i18n="nav.hybrid">🌿 Hybrid</a>
      <a href="#" onclick="event.preventDefault(); COSY.toggleTheme();" class="mobile-theme-toggle-a" style="display: flex; align-items: center; gap: 8px;">🌓 Toggle Dark Mode</a>
      <div style="padding: 12px 16px; display: flex; align-items: center; gap: 8px;">
         <span style="font-size: 0.9rem; color: var(--ink-soft);" data-i18n="label.language">Language 🌍</span>
         <select id="cosy-language-switcher-mobile" onchange="setLanguage(this.value)" class="styled-sel" style="width: auto; padding: 4px 8px; font-size: 0.8rem; border-radius: var(--r-sm); height: 32px; background: var(--warm-white); border: 1px solid var(--border); color: var(--ink); cursor: pointer;">
            ${langOptions}
         </select>
      </div>
      <div style="padding: 12px 16px; display: flex; align-items: center; gap: 8px;">
         <span style="font-size: 0.9rem; color: var(--ink-soft);">Profile:</span>
         <select id="profile-switcher-mobile" onchange="COSY.switchProfile(this.value)" class="styled-sel" style="width: auto; padding: 4px 8px; font-size: 0.8rem; border-radius: var(--r-sm); height: 32px; background: var(--warm-white); border: 1px solid var(--border); color: var(--ink); cursor: pointer;">
            ${profileOptions}
            <option value="__create__">+ New...</option>
         </select>
      </div>
      <div class="mm-divider"></div>
      <a href="https://wa.me/330766784195" target="_blank" class="mm-cta" data-translate-key="nav_contact">💬 Contact us on WhatsApp</a>`
}

/* ─── DICTIONARY ────────────────────────────────────────────────
   Persistence: uses localStorage['cosy_dict_free_guest']
─────────────────────────────────────────────────────────────────  */
let dictionary = {}; // { word: { definition, example, synonyms, antonyms, addedAt } }

function getDictKey() {
  return `cosy_dict_free_guest`;
}

function saveWordLocally(word, data) {
  if (data && !data.addedAt) data.addedAt = Date.now();
  dictionary[word] = data;
  saveDict();
}

function loadVocabLocally() {
  return Object.values(dictionary);
}

function loadDict() {
  const key = getDictKey();
  const saved = localStorage.getItem(key);
  dictionary = saved ? JSON.parse(saved) : {};

  // Data Migration
  let migrated = false;

  // 1. Migrate legacy string-based dictionary entries
  Object.entries(dictionary).forEach(([word, data]) => {
    if (typeof data === 'string') {
      dictionary[word] = {
        word: word,
        definition: data,
        addedAt: Date.now()
      };
      migrated = true;
    }
  });

  if (migrated) saveDict();

  refreshDictUI();
  refreshVocabButtons();
}

function saveDict() {
  const key = getDictKey();
  localStorage.setItem(key, JSON.stringify(dictionary));
}

function refreshDictUI() {
  const count = Object.keys(dictionary).length;
  const countEl = document.getElementById('dict-count');
  if (countEl) countEl.textContent = count;

  const body = document.getElementById('dict-body');
  const empty = document.getElementById('dict-empty-msg');
  if (!body) return;

  body.querySelectorAll('.dict-entry').forEach(e => e.remove());
  if (count === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  Object.entries(dictionary).forEach(([word, data]) => {
    const el = document.createElement('div');
    el.className = 'dict-entry';
    const def = typeof data === 'string' ? data : (data.definition || '');
    el.innerHTML = `<div><div class="dict-entry-word">${word}</div><div class="dict-entry-def">${def}</div></div><button class="dict-remove" onclick="COSY.removeFromDict('${word.replace(/'/g,"\\'")}')">✕</button>`;
    body.appendChild(el);
  });
}

function renderDictUI() {
    const t = getNavLabel;
    return `
      <button id="dict-fab" onclick="COSY.toggleDict()">📖 ${t('dictionary', 'My Dictionary')} (<span id="dict-count">0</span>)</button>
      <div id="dict-panel">
        <div class="dict-panel-header">
          <span class="dict-panel-title">📖 ${t('dictionary', 'My Dictionary')}</span>
          <button class="dict-panel-toggle" onclick="COSY.toggleDict()">✕ ${t('close', 'Close')}</button>
        </div>
        <div class="dict-panel-body" id="dict-body">
          <p class="dict-empty" id="dict-empty-msg" style="font-size:.8rem;color:var(--muted);font-style:italic;text-align:center;padding:1rem 0;">${t('dict_empty', 'No words saved yet.')}</p>
        </div>
        <div class="dict-panel-footer" style="padding:.6rem 1rem;border-top:1px solid var(--border);background:var(--cream);">
          <button class="dict-export-btn" onclick="COSY.exportDict()">⬇️ ${t('dict_export', 'Export as text file')}</button>
        </div>
      </div>`;
}

function refreshVocabButtons() {
  document.querySelectorAll('.vocab-add-btn, .btn-add-dict').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    const wordMatch = oc.match(/addToDict\(['"]([^'"]+)['"]/);
    const word = wordMatch ? wordMatch[1] : null;

    if (word && dictionary[word]) {
      btn.textContent = '✓ Saved';
      btn.classList.add('saved');
    } else {
      btn.classList.remove('saved');
      if (word && !dictionary[word]) btn.textContent = '+ Dictionary';
    }
  });
}

function injectStyles() {
    const p = getPrefix();
    if (!document.querySelector(`link[href*="css/components.css"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = p + 'css/components.css';
        document.head.appendChild(link);
    }

    // Modular dynamic CSS loading
    if (document.body && document.body.className && document.body.className.includes('theme-mind')) {
        if (!document.querySelector(`link[href*="apps/premium-events/clubs/mind/style.css"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = p + 'apps/premium-events/clubs/mind/style.css';
            document.head.appendChild(link);
        }
    }
    if (document.body && document.body.className && document.body.className.includes('theme-quotes')) {
        if (!document.querySelector(`link[href*="apps/premium-events/clubs/quotes/style.css"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = p + 'apps/premium-events/clubs/quotes/style.css';
            document.head.appendChild(link);
        }
    }
    if (document.body && document.body.className && document.body.className.includes('theme-celebrate')) {
        if (!document.querySelector(`link[href*="apps/premium-events/clubs/celebrate/style.css"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = p + 'apps/premium-events/clubs/celebrate/style.css';
            document.head.appendChild(link);
        }
    }
}

function ensureI18nLoaded() {
    if (window.COSY_I18N || window.setLanguage) return;

    // Check if script is already present in DOM
    const existing = document.querySelector('script[src*="js/core/i18n.js"]');
    if (existing) return;

    const p = getPrefix();
    const s = document.createElement('script');
    s.src = p + 'js/core/i18n.js';
    document.head.appendChild(s);
}

function inject () {
    injectStyles();
    ensureI18nLoaded();
    if (!document.getElementById('cosy-mobile-menu')) {
        const m = document.createElement('div'); m.id = 'cosy-mobile-menu'; document.body.appendChild(m);
    }
    if (!document.getElementById('dict-panel') && !document.getElementById('dict-fab')) {
        const d = document.createElement('div');
        d.innerHTML = renderDictUI();
        while (d.firstChild) {
            document.body.appendChild(d.firstChild);
        }
    }
    applyMode();
    loadDict();
    loadDict();
}

/* ═══════════════════════════════════════════════════════════════
   6. PUBLIC API
   ═══════════════════════════════════════════════════════════════ */

async function getVocabFileList(lang, folderCode) {
    const prefix = getPrefix();
    if (!vocabManifest) {
        try {
            const res = await fetch(prefix + 'vocabulary/manifest.json');
            if (res.ok) {
                vocabManifest = await res.json();
            } else {
                console.warn('[COSY] vocabulary/manifest.json missing, using fallback list');
            }
        } catch (e) {
            console.warn('[COSY] Failed to fetch manifest, using fallback list', e);
        }
    }

    if (vocabManifest && vocabManifest[lang] && vocabManifest[lang][folderCode]) {
        return vocabManifest[lang][folderCode];
    }
    return FALLBACK_VOCAB_FILES;
}

async function loadVocabFile(path) {
    const prefix = getPrefix();
    const fullPath = prefix + path;

    return new Promise((resolve) => {
        const s = document.createElement('script');
        // Removed cache-buster to allow browser/SW caching
        s.src = fullPath;
        s.onload = () => { s.remove(); resolve(); };
        s.onerror = () => {
            console.warn('[COSY] vocab file not found:', fullPath);
            s.remove();
            resolve();
        };
        document.head.appendChild(s);
    });
}

let STATE = readState();

window.COSY = {
    get mode() { return STATE.mode },
    get practice() { return STATE.practice },
    get notebook() { return STATE.notebook },
    get dictionary() { return dictionary },
    getPrefix,

    initTheme() {
        const theme = localStorage.getItem('cosy_theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
        }
    },

    toggleTheme() {
        const currentTheme = localStorage.getItem('cosy_theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('cosy_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        if (newTheme === 'dark') {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
        }
        const toggles = document.querySelectorAll('.theme-toggle-btn');
        toggles.forEach(btn => {
            btn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        });
        if (window.COSY && typeof window.COSY.showToast === 'function') {
            window.COSY.showToast(`Theme switched to ${newTheme}!`);
        }
    },

    switchProfile(name) {
        if (name === '__create__') {
            const newName = prompt('Enter name for the new profile:');
            if (newName && newName.trim()) {
                const created = window.COSY_PROFILES.createProfile(newName);
                if (created) {
                    window.COSY_PROFILES.setActiveProfile(newName.trim());
                } else {
                    alert('Profile name already exists or is invalid!');
                    const switcher = document.getElementById('profile-switcher') || document.getElementById('profile-switcher-mobile');
                    if (switcher) switcher.value = window.COSY_PROFILES.getActiveProfile();
                }
            } else {
                const switcher = document.getElementById('profile-switcher') || document.getElementById('profile-switcher-mobile');
                if (switcher) switcher.value = window.COSY_PROFILES.getActiveProfile();
            }
        } else {
            window.COSY_PROFILES.setActiveProfile(name);
        }
    },

    toggleMobileMenu () {
      const mm = document.getElementById('cosy-mobile-menu')
      if (mm) mm.classList.toggle('open')
    },
    // Dictionary
    async addToDict(wordData, maybeDef, btnEl) {
        let word, data;
        let btn = btnEl;

        if (typeof wordData === 'string') {
            word = wordData;
            // Handle legacy signature: addToDict(word, def, btn)
            data = {
                word: word,
                definition: typeof maybeDef === 'string' ? maybeDef : '',
                addedAt: Date.now()
            };
            if (maybeDef instanceof HTMLElement) btn = maybeDef;
        } else if (wordData && typeof wordData === 'object') {
            // Handle object signature: addToDict(wordObj, btn)
            word = wordData.word || wordData.text;
            data = {
                word: word,
                definition: wordData.definition || wordData.definitions?.[0]?.text || '',
                example: wordData.example || wordData.definitions?.[0]?.examples?.[0] || '',
                synonyms: wordData.synonyms || [],
                antonyms: wordData.antonyms || [],
                lang: wordData.lang || localStorage.getItem('cosy_user_lang') || 'en',
                level: wordData.level,
                addedAt: Date.now()
            };
            if (maybeDef instanceof HTMLElement) btn = maybeDef;
        }

        if (!word) return;

        if (dictionary[word]) {
            if (btn && btn instanceof HTMLElement) {
                btn.textContent = '✓ Saved';
                btn.classList.add('saved');
            }
            return;
        }

        saveWordLocally(word, data);

        if (btn && btn instanceof HTMLElement) {
            btn.textContent = '✓ Saved';
            btn.classList.add('saved');
        }
        refreshDictUI();
    },
    async removeFromDict(word) {
        delete dictionary[word];
        saveDict();
        refreshDictUI();
        refreshVocabButtons();
    },
    exportDict() {
        const lines = Object.entries(dictionary).map(([w,d]) => {
            const def = typeof d === 'string' ? d : (d.definition || '');
            return `${w} — ${def}`;
        }).join('\n');
        const blob = new Blob(['MY COSY DICTIONARY\n\n' + lines], {type:'text/plain'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'cosy-dictionary.txt';
        a.click();
    },

    refresh: () => { STATE = readState(); applyMode(); },

    showToast(msg, isError = false) {
        const t = document.getElementById('toast');
        if (!t) {
            const toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); padding:12px 24px; border-radius:30px; color:#fff; font-weight:800; font-size:0.85rem; z-index:10000; opacity:0; pointer-events:none; transition:opacity 0.3s;';
            document.body.appendChild(toast);
        }
        const toastEl = document.getElementById('toast');
        toastEl.textContent = msg;
        toastEl.style.background = isError ? '#c0392b' : '#333';
        toastEl.style.opacity = '1';
        toastEl.style.pointerEvents = 'auto';
        setTimeout(() => {
            toastEl.style.opacity = '0';
            toastEl.style.pointerEvents = 'none';
        }, 3000);
    },

    toggleDict() {
      const panel = document.getElementById('dict-panel');
      if (panel) panel.classList.toggle('open');
    },

    async loadLanguageData(lang, levelId) {
        const levelsToLoad = (levelId === 'all')
            ? window.COSY_LEVELS.map(l => l.id)
            : [levelId];

        const allEntries = [];
        const keys = ['vocabularyData', 'verbsData', 'adjectivesData', 'locationsData', 'peopleData', 'nationalitiesData', 'grammarData', 'grammarElements'];
        const beforeCounts = {};

        // Track state before parallel loading
        keys.forEach(key => {
            window[key] = window[key] || {};
            window[key][lang] = window[key][lang] || [];
            beforeCounts[key] = window[key][lang].length;
        });

        const loadPromises = [];

        for (const lid of levelsToLoad) {
            // 1. Convert level ID to folder short code
            const folderCode = window.getLevelDir(lid);

            // 2. Build the path to the level folder
            const basePath = lid === 'all' ? `vocabulary/${lang}/` : `vocabulary/${lang}/${folderCode}/`;

            // 3. Get the list of .js files in that folder
            const files = await getVocabFileList(lang, folderCode);

            // 4. Queue each file for parallel loading
            for (const file of files) {
                loadPromises.push(loadVocabFile(basePath + file));
            }
        }

        // Wait for all queued files to load in parallel
        await Promise.all(loadPromises);

        // Collect all newly loaded entries
        keys.forEach(key => {
            const after = window[key][lang];
            allEntries.push(...after.slice(beforeCounts[key]));
        });

        // 5. Validate: warn about entries with missing required fields
        allEntries.forEach(entry => {
            if (entry && Object.keys(entry).length > 0) {
                const hasId = !!entry.id;
                const hasWord = !!entry.word;
                const hasMeaning = !!(entry.translation || entry.definition || (entry.definitions && entry.definitions.length > 0));
                const hasLevel = !!entry.level;
                const hasTheme = !!entry.theme;
                const hasLang = !!(entry.language || entry.lang);

                if (!hasId || !hasWord || !hasMeaning || !hasLevel || !hasTheme || !hasLang) {
                    // Suppress for items that have at least some descriptive data
                    if (!hasWord && !hasMeaning) {
                        console.warn('[COSY] Entry missing critical fields:', entry);
                    }
                }
            }
        });

        return allEntries;
    },

    async loadCurriculum(lang, level) {
        if (!lang || !level) return [];

        const prefix = getPrefix();
        const levelUp = level.toUpperCase();
        const levelLow = level.toLowerCase();
        const langLow = lang.toLowerCase();

        const standardPath = `${prefix}curriculum/${lang}/general/${levelUp}.json`;
        const v2Path = `${prefix}curriculum/${lang}/general/${levelUp}_v2.json`;

        try {
            const res = await fetch(standardPath);
            const data = res.ok ? await res.json() : await fetch(v2Path).then(r => r.ok ? r.json() : null);
            if (data && data.units) {
                const units = data.units;
                window.curriculumData = window.curriculumData || {};
                const key = `${langLow}_${levelLow}`;
                window.curriculumData[key] = units;
                if (window.cosyDays) window.cosyDays.state.curriculum = units;
                return units;
            }
        } catch (e) {
            console.warn(`Failed to load curriculum for ${lang} ${level}:`, e);
        }

        const key = `${langLow}_${levelLow}`;
        return (window.curriculumData && window.curriculumData[key]) || [];
    },

    async loadMorphologyData(lang) {
        if (!lang) return [];

        const langLow = lang.toLowerCase();
        window.morphologyData = window.morphologyData || {};
        window.morphologyData[langLow] = window.morphologyData[langLow] || [];

        const prefix = getPrefix();
        const files = ['verbs.json', 'nouns.json', 'pronouns.json', 'determiners.json', 'adjectives.json', 'numerals.json'];

        const loadPromises = files.map(file => {
            const path = `${prefix}grammar/${langLow}/morphology/${file}`;
            return fetch(path)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.groups) {
                        data.groups.forEach(group => {
                            const items = group.items || [group];
                            items.forEach(item => {
                                if (!item.id) return;
                                const entry = {
                                    ...item,
                                    group: group.id,
                                    group_label: group.label || group.id,
                                    category: data.category || 'morphology',
                                    language: langLow
                                };
                                window.morphologyData[langLow].push(entry);
                            });
                        });
                    }
                })
                .catch(err => console.warn(`[COSY Morphology Loader] Failed to load ${path}:`, err));
        });

        await Promise.all(loadPromises);
        return window.morphologyData[langLow];
    },

    setNavContext(html) {
        const ctx = document.getElementById('cosy-nav-context');
        if (ctx) ctx.innerHTML = html;
        this._navContext = html; // Persist across refreshes in current session
    },
    updateNavActiveState,

    registerSW() {
        if ('serviceWorker' in navigator) {
            const path = window.location.pathname;
            const p = getPrefix();
            if (path.includes('/apps/premium-courses/')) {
                // Register scoped service worker for Courses
                navigator.serviceWorker.register(p + 'apps/premium-courses/sw.js', { scope: p + 'apps/premium-courses/' })
                    .catch(e => console.log('SW (Courses):', e));
            } else if (path.includes('/events/') || path.includes('/apps/premium-events/')) {
                // Register scoped service worker for Events
                navigator.serviceWorker.register(p + 'apps/premium-events/sw.js', { scope: p + 'apps/premium-events/' })
                    .catch(e => console.log('SW (Events):', e));
            } else {
                // Register root service worker for Free Portal
                navigator.serviceWorker.register(p + 'sw.js').catch(e => console.log('SW (Root):', e));
            }
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        COSY.initTheme();
        inject();
        COSY.registerSW();
        updateNavActiveState();
    });
} else {
    COSY.initTheme();
    inject();
    COSY.registerSW();
    updateNavActiveState();
}
window.addEventListener('hashchange', updateNavActiveState);
window.addEventListener('popstate', updateNavActiveState);

})();
