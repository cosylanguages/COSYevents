/**
 * COSY shared theme switch. The same file lives in COSYlanguages, COSYevents, COSYdata and COSYtools.
 *
 * - Default follows the visitor's system setting (prefers-color-scheme).
 * - The choice is saved under "cosy.theme" ("light" | "dark"). Every COSY site is served from the
 *   cosylanguages.github.io origin, so they share localStorage and the choice follows the visitor.
 * - Older keys (cosy_theme, ce-theme) are read as a fallback and kept in step so pages that still use them agree.
 * - Sets <html data-theme="light|dark"> plus the legacy .theme-dark class, and keeps other tabs in sync.
 * - Any element with [data-cosy-theme-toggle] (or #cosy-theme-toggle) becomes the toggle.
 *
 * Load it in <head>, without defer, so the right theme is on the page before first paint.
 */
(function () {
  'use strict';
  var KEY = 'cosy.theme';
  var LEGACY = ['cosy_theme', 'ce-theme'];
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function read(key) {
    try { var v = localStorage.getItem(key); return v === 'dark' || v === 'light' ? v : null; } catch (e) { return null; }
  }
  function stored() {
    var v = read(KEY);
    for (var i = 0; !v && i < LEGACY.length; i++) v = read(LEGACY[i]);
    return v;
  }
  function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  function paintToggles(theme) {
    var dark = theme === 'dark';
    var nodes = document.querySelectorAll('[data-cosy-theme-toggle], #cosy-theme-toggle');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.setAttribute('aria-pressed', dark ? 'true' : 'false');
      n.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      n.setAttribute('title', dark ? 'Switch to light theme' : 'Switch to dark theme');
      if (!n.hasAttribute('data-keep-label')) n.textContent = dark ? '☀️' : '🌙';
    }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    root.classList.toggle('theme-dark', theme === 'dark');
    if (document.body) document.body.classList.toggle('theme-dark', theme === 'dark');
    paintToggles(theme);
  }

  function set(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    [KEY].concat(LEGACY).forEach(function (k) { try { localStorage.setItem(k, theme); } catch (e) {} });
    apply(theme);
  }

  apply(stored() || (mq && mq.matches ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', function () {
    apply(current());
  });
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-cosy-theme-toggle], #cosy-theme-toggle') : null;
    if (!t) return;
    e.preventDefault();
    set(current() === 'dark' ? 'light' : 'dark');
  });
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light')) apply(e.newValue);
  });
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light'); });
  }

  window.CosyTheme = { get: current, set: set, toggle: function () { set(current() === 'dark' ? 'light' : 'dark'); } };
})();
