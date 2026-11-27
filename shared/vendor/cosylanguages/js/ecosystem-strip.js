/**
 * COSYlanguages Ecosystem Strip (shared)
 * File: js/ecosystem-strip.js
 *
 * One shared "🌐 COSYlanguages Ecosystem" bar for every COSYlanguages site except the COSYlanguages hub itself.
 * It links to the sibling repositories; it never copies their content.
 *
 * Hosts mount it with:
 *   <link rel="stylesheet" href="https://cosylanguages.github.io/COSYlanguages/css/ecosystem-strip.css">
 *   <div data-ecosystem-strip data-self="events"></div>
 *   <script src="https://cosylanguages.github.io/COSYlanguages/js/ecosystem-strip.js" defer></script>
 *
 * `data-self` (languages|events|data|tools|practice|games|platform|manuals|studio) removes the host's
 * own link. COSYplatform and COSYmanuals are shown only to signed-in visitors; the session is read
 * from the shared Supabase storage key "cosy-auth" (same key every COSYlanguages site writes), and the bar
 * updates live when the visitor signs in or out in another tab.
 *
 * Add `data-theme-toggle` to the mount to opt into the shared theme engine (dark mode): the saved or
 * system theme is applied on load and, when the page has no theme control of its own, a toggle is
 * added to the bar's trailing slot. Pages without the attribute are not touched in any way, and a
 * page that already ships its own control is left alone so no second toggle is ever added.
 */

(function () {
    'use strict';

    var BASE = 'https://cosylanguages.github.io/';

    // Public sites every visitor sees, in canonical order. The host's own entry is dropped via data-self.
    var PUBLIC_DESTINATIONS = [
        { key: 'languages', label: 'COSYlanguages', icon: '🏠', url: BASE + 'COSYlanguages/' },
        { key: 'events',    label: 'COSYevents',    icon: '🎉', url: BASE + 'COSYevents/' },
        { key: 'data',      label: 'COSYdata',      icon: '📊', url: BASE + 'COSYdata/' },
        { key: 'tools',     label: 'COSYtools',     icon: '🔎', url: BASE + 'COSYtools/' },
        { key: 'practice',  label: 'COSYpractice',  icon: '🗣️', url: BASE + 'COSYpractice/' },
        { key: 'games',     label: 'COSYgames',     icon: '🎮', url: BASE + 'COSYgames/' },
        { key: 'magazine',  label: 'COSYmagazine',  icon: '📰', url: BASE + 'COSYmagazine/' }
    ];

    // Gated / account areas, revealed only to signed-in visitors.
    var MEMBER_DESTINATIONS = [
        { key: 'platform', label: 'COSYplatform', icon: '🧑‍🏫', url: BASE + 'COSYplatform/' },
        { key: 'manuals',  label: 'COSYmanuals',  icon: '📖', url: BASE + 'COSYmanuals/' }
    ];

    var AUTH_STORAGE_KEY = 'cosy-auth';

    // The brand phrase and accessible name, translated for the languages the ecosystem ships.
    var STRINGS = {
        en: { brand: '🌐 COSYlanguages Ecosystem:', label: 'COSYlanguages Ecosystem products' },
        fr: { brand: '🌐 Écosystème COSYlanguages :', label: 'Produits de l\u2019écosystème COSYlanguages' },
        it: { brand: '🌐 Ecosistema COSYlanguages:', label: 'Prodotti dell\u2019ecosistema COSYlanguages' },
        ru: { brand: '🌐 Экосистема COSYlanguages:', label: 'Продукты экосистемы COSYlanguages' },
        el: { brand: '🌐 Οικοσύστημα COSYlanguages:', label: 'Προϊόντα οικοσυστήματος COSYlanguages' }
    };

    function stringsFor(lang) {
        var code = String(lang || 'en').slice(0, 2).toLowerCase();
        return STRINGS[code] || STRINGS.en;
    }

    function escapeHTML(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // A stored Supabase session is a JSON object with access_token and a future expiry. Anything
    // missing, malformed or expired counts as signed out.
    function sessionIsLive(raw) {
        if (!raw) return false;
        var session;
        try { session = JSON.parse(raw); } catch (e) { return false; }
        if (!session || typeof session !== 'object') return false;
        if (!session.access_token && !session.refresh_token) return false;
        if (typeof session.expires_at === 'number' && session.expires_at * 1000 < Date.now()) return false;
        return true;
    }

    function isSignedIn() {
        try {
            return sessionIsLive(window.localStorage.getItem(AUTH_STORAGE_KEY));
        } catch (e) {
            return false;
        }
    }

    function linkHTML(dest) {
        return '<a class="cosy-strip-link" href="' + escapeHTML(dest.url) + '">' +
            escapeHTML(dest.label) + ' ' + escapeHTML(dest.icon) + '</a>';
    }

    function linksHTML(selfKey) {
        var destinations = PUBLIC_DESTINATIONS.slice();
        if (isSignedIn()) destinations = destinations.concat(MEMBER_DESTINATIONS);

        // The host's own site is left out of the bar entirely.
        destinations = destinations.filter(function (dest) { return dest.key !== selfKey; });

        return destinations.map(function (dest) {
            return '<li>' + linkHTML(dest) + '</li>';
        }).join('');
    }

    // Hosts may keep their own trailing control (e.g. COSYtools' theme toggle) inside the bar:
    //   <div data-ecosystem-strip data-self="tools"><button id="cosy-theme-toggle">…</button></div>
    var EXTRA_SELECTOR = '[data-strip-extra], #cosy-theme-toggle';

    function render(host) {
        var selfKey = (host.getAttribute('data-self') || '').trim().toLowerCase();
        var lang = host.getAttribute('data-lang') ||
            (document.documentElement && document.documentElement.lang) || 'en';
        var t = stringsFor(lang);
        host.classList.add('cosy-ecosystem-strip');
        host.setAttribute('role', 'navigation');
        host.setAttribute('aria-label', t.label);

        // On a later refresh, update the brand and links in place so any host control we already
        // moved into the bar keeps its event listeners.
        var inner = host.querySelector('.cosy-strip-inner');
        if (inner) {
            var brandEl = inner.querySelector('.cosy-strip-brand');
            if (brandEl) brandEl.textContent = t.brand;
            var listEl = inner.querySelector('.cosy-strip-links');
            if (listEl) listEl.innerHTML = linksHTML(selfKey);
            return;
        }

        var extra = host.querySelector(EXTRA_SELECTOR);
        host.innerHTML = '<div class="cosy-strip-inner">' +
            '<span class="cosy-strip-brand">' + escapeHTML(t.brand) + '</span>' +
            '<ul class="cosy-strip-links">' + linksHTML(selfKey) + '</ul>' +
            '<span class="cosy-strip-extra"></span>' +
            '</div>';

        // Move the live node (not a copy) into the trailing slot so it keeps its listeners.
        if (extra) {
            var slot = host.querySelector('.cosy-strip-extra');
            if (slot && slot.appendChild) slot.appendChild(extra);
        }
    }

    // ── Shared theme engine (opt-in via data-theme-toggle on the mount) ──────────────
    // Same storage contract as the per-site cosy-theme.js: primary key "cosy.theme", with the
    // older "cosy_theme" / "ce-theme" keys read and written so every COSYlanguages page agrees.
    var THEME_KEY = 'cosy.theme';
    var THEME_LEGACY = ['cosy_theme', 'ce-theme'];

    // Any control a page already ships. If one is present the bar never adds a second toggle.
    var THEME_CONTROL_SELECTOR = '[data-cosy-theme-toggle], #cosy-theme-toggle, #bn-theme, ' +
        '.theme-toggle-btn, .cosy-theme-btn, .cosy-theme-toggle-btn, .cg-theme-btn, .ev-theme-btn, .dh-theme-btn';

    function readTheme(key) {
        try {
            var v = window.localStorage.getItem(key);
            return v === 'dark' || v === 'light' ? v : null;
        } catch (e) {
            return null;
        }
    }

    function storedTheme() {
        var v = readTheme(THEME_KEY);
        for (var i = 0; !v && i < THEME_LEGACY.length; i++) v = readTheme(THEME_LEGACY[i]);
        return v;
    }

    function systemTheme() {
        try {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } catch (e) {
            return 'light';
        }
    }

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    // Some hosts (and the unit-test fakes) expose getAttribute but not hasAttribute.
    function hasAttr(el, name) {
        if (!el) return false;
        if (typeof el.hasAttribute === 'function') return el.hasAttribute(name);
        return el.getAttribute(name) != null;
    }

    function applyTheme(theme) {
        var root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme;
        root.classList.toggle('theme-dark', theme === 'dark');
        if (document.body) document.body.classList.toggle('theme-dark', theme === 'dark');
        paintThemeToggles(theme);
    }

    function setTheme(theme) {
        if (theme !== 'dark' && theme !== 'light') return;
        [THEME_KEY].concat(THEME_LEGACY).forEach(function (k) {
            try { window.localStorage.setItem(k, theme); } catch (e) {}
        });
        applyTheme(theme);
    }

    function paintThemeToggles(theme) {
        var dark = theme === 'dark';
        var label = dark ? 'Switch to light theme' : 'Switch to dark theme';
        Array.prototype.forEach.call(document.querySelectorAll(THEME_CONTROL_SELECTOR), function (n) {
            n.setAttribute('aria-pressed', dark ? 'true' : 'false');
            n.setAttribute('aria-label', label);
            n.setAttribute('title', label);
            if (!n.hasAttribute('data-keep-label')) n.textContent = dark ? '☀️' : '🌙';
        });
    }

    // A page has "opted in" when any mounted strip carries data-theme-toggle.
    function themeOptedIn() {
        return !!document.querySelector('[data-ecosystem-strip][data-theme-toggle]');
    }

    function makeThemeToggle() {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'cosy-theme-toggle';
        btn.className = 'cosy-theme-toggle-btn';
        btn.setAttribute('data-cosy-theme-toggle', '');
        btn.textContent = currentTheme() === 'dark' ? '☀️' : '🌙';
        return btn;
    }

    function ensureThemeToggle(host) {
        if (!hasAttr(host, 'data-theme-toggle')) return;
        // A page that already ships its own control keeps it; we only drive it.
        var hasOwn = document.querySelector(THEME_CONTROL_SELECTOR);
        if (hasOwn) { paintThemeToggles(currentTheme()); return; }
        var slot = host.querySelector('.cosy-strip-extra');
        if (slot && slot.querySelector && !slot.querySelector('#cosy-theme-toggle')) slot.appendChild(makeThemeToggle());
    }

    function watchTheme() {
        document.addEventListener('click', function (e) {
            var t = e.target && e.target.closest ? e.target.closest('#cosy-theme-toggle') : null;
            if (!t) return;
            e.preventDefault();
            setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
        });
        window.addEventListener('storage', function (e) {
            if (e.key === THEME_KEY && (e.newValue === 'dark' || e.newValue === 'light')) applyTheme(e.newValue);
        });
        try {
            if (window.matchMedia) {
                var mq = window.matchMedia('(prefers-color-scheme: dark)');
                if (mq.addEventListener) mq.addEventListener('change', function (e) {
                    if (!storedTheme()) applyTheme(e.matches ? 'dark' : 'light');
                });
            }
        } catch (e) {}
    }

    function initTheme() {
        if (!themeOptedIn()) return;
        // Apply before first paint (deferred scripts run before the page is painted).
        applyTheme(storedTheme() || systemTheme());
        watchTheme();
    }

    function initAll() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-ecosystem-strip]'), function (el) {
            if (!el.__ecosystemStripRendered) {
                render(el);
                ensureThemeToggle(el);
                el.__ecosystemStripRendered = true;
            }
        });
    }

    // Re-render every mounted strip when the session changes in this tab or another one.
    function refreshAll() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-ecosystem-strip]'), function (el) {
            render(el);
            ensureThemeToggle(el);
        });
    }

    function watchAuth() {
        window.addEventListener('storage', function (event) {
            if (event.key === AUTH_STORAGE_KEY) refreshAll();
        });
        // Supabase fires this within the same tab after sign-in/sign-out.
        document.addEventListener('cosy:auth', refreshAll);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initTheme(); initAll(); watchAuth(); });
    } else {
        initTheme();
        initAll();
        watchAuth();
    }

    window.COSY_EcosystemStrip = {
        render: render,
        refresh: refreshAll,
        isSignedIn: isSignedIn,
        setTheme: setTheme,
        getTheme: currentTheme,
        toggleTheme: function () { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); },
        PUBLIC_DESTINATIONS: PUBLIC_DESTINATIONS,
        MEMBER_DESTINATIONS: MEMBER_DESTINATIONS
    };
})();
