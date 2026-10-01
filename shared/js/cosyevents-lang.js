/**
 * COSYevents Shared Language Module (window.CosyLang)
 * Handles "Practise in" language switcher, My Languages storage,
 * cross-language page mapping, "Also available in" banners,
 * and "Not available in <Lang>" notices.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { module.exports.init(); });
      } else {
        module.exports.init();
      }
    }
  } else {
    root.CosyLang = factory();
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { root.CosyLang.init(); });
      } else {
        root.CosyLang.init();
      }
    }
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LANG_CONFIG = {
    en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    el: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' }
  };

  var LANG_ORDER = ['en', 'fr', 'it', 'ru', 'el'];

  function getScriptRoot() {
    if (typeof document === 'undefined') return './';
    var src = null;
    if (document.currentScript) {
      src = document.currentScript.getAttribute('src');
    }
    if (!src) {
      var scripts = document.scripts;
      for (var i = scripts.length - 1; i >= 0; i--) {
        var s = scripts[i].getAttribute('src') || '';
        if (s.indexOf('cosyevents-lang.js') !== -1) {
          src = s;
          break;
        }
      }
    }
    if (!src) return './';
    var idx = src.indexOf('shared/js/cosyevents-lang.js');
    if (idx !== -1) {
      return src.substring(0, idx);
    }
    return './';
  }

  var scriptRoot = getScriptRoot();

  // Storage Helpers
  function safeGetStorage(key, isSession) {
    try {
      var storage = isSession ? sessionStorage : localStorage;
      return storage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSetStorage(key, val, isSession) {
    try {
      var storage = isSession ? sessionStorage : localStorage;
      storage.setItem(key, val);
    } catch (e) {}
  }

  function getMyLangs(defaultLang) {
    defaultLang = defaultLang || 'en';
    var raw = safeGetStorage('ce-langs', false);
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          var valid = [];
          for (var i = 0; i < parsed.length; i++) {
            if (LANG_CONFIG[parsed[i]] && valid.indexOf(parsed[i]) === -1) {
              valid.push(parsed[i]);
            }
          }
          if (valid.length > 0) return valid;
        }
      } catch (e) {}
    }
    return [defaultLang];
  }

  function setMyLangs(langs) {
    safeSetStorage('ce-langs', JSON.stringify(langs), false);
  }

  function addMyLang(langKey) {
    if (!LANG_CONFIG[langKey]) return;
    var current = getMyLangs('en');
    if (current.indexOf(langKey) === -1) {
      current.push(langKey);
      setMyLangs(current);
    }
    safeSetStorage('ce-lang', langKey, false);
  }

  function removeMyLang(langKey) {
    var current = getMyLangs('en');
    if (current.length <= 1) return current;
    var idx = current.indexOf(langKey);
    if (idx !== -1) {
      current.splice(idx, 1);
      setMyLangs(current);
    }
    var lastUsed = safeGetStorage('ce-lang', false);
    if (lastUsed === langKey) {
      safeSetStorage('ce-lang', current[0], false);
    }
    return current;
  }

  // Pure Helper Functions
  function detectPageLang(pathname) {
    if (!pathname) return 'en';
    var clean = decodeURIComponent(pathname.split('?')[0].split('#')[0]);

    if (clean.charAt(0) === '/') clean = clean.substring(1);

    if (clean.indexOf('COSYevents/') === 0) {
      clean = clean.substring('COSYevents/'.length);
    }

    var segments = clean.split('/');

    if (clean.indexOf('sessions/karaoke-club/') !== -1) {
      var kIdx = clean.indexOf('sessions/karaoke-club/');
      var kSub = clean.substring(kIdx + 'sessions/karaoke-club/'.length);
      if (kSub.indexOf('challenges/') === 0) {
        kSub = kSub.substring('challenges/'.length);
      }
      var kLang = kSub.split('/')[0];
      if (['fr', 'it', 'ru', 'el'].indexOf(kLang) !== -1) {
        return kLang;
      }
    }

    var first = segments[0];
    if (['fr', 'it', 'ru', 'el'].indexOf(first) !== -1) {
      return first;
    }

    return 'en';
  }

  function stripLangFolder(pathStr) {
    if (!pathStr) return '';
    var clean = pathStr.replace(/\\/g, '/');
    if (clean.charAt(0) === '/') clean = clean.substring(1);

    var langPrefixes = ['fr/', 'it/', 'ru/', 'el/'];
    for (var i = 0; i < langPrefixes.length; i++) {
      if (clean.indexOf(langPrefixes[i]) === 0) {
        return clean.substring(langPrefixes[i].length);
      }
    }
    return clean;
  }

  function hubFor(langKey) {
    if (langKey === 'en') return 'index.html';
    if (LANG_CONFIG[langKey]) return langKey + '/index.html';
    return 'index.html';
  }

  function normalizeRelPath(p) {
    if (!p) return '';
    var clean = p.replace(/\\/g, '/');
    if (clean.charAt(0) === '/') clean = clean.substring(1);
    return clean;
  }

  function equivalentPath(targetLang, currentPath, manifest, aliases) {
    var normCurrent = normalizeRelPath(currentPath);

    if (normCurrent.indexOf('sessions/karaoke-club/') !== -1 || normCurrent.indexOf('karaoke-club/challenges/') !== -1) {
      var strippedK = stripLangFolder(normCurrent);
      if (strippedK !== 'karaoke-club.html') {
        return hubFor(targetLang);
      }
    }

    // Step (a): Symmetric explicit mapping in aliases.json
    if (aliases && Array.isArray(aliases.groups)) {
      for (var i = 0; i < aliases.groups.length; i++) {
        var group = aliases.groups[i];
        var matchesGroup = false;
        for (var k in group) {
          if (group.hasOwnProperty(k) && normalizeRelPath(group[k]) === normCurrent) {
            matchesGroup = true;
            break;
          }
        }
        if (matchesGroup) {
          if (group[targetLang]) {
            return normalizeRelPath(group[targetLang]);
          }
        }
      }
    }

    // Step (b): Same relative path under targetLang's folder
    var enRel = stripLangFolder(normCurrent);
    if (!enRel) enRel = 'index.html';

    var candidate = (targetLang === 'en') ? enRel : (targetLang + '/' + enRel);

    if (candidate === 'index.html' || candidate === targetLang + '/index.html') {
      return hubFor(targetLang);
    }

    if (manifest && Array.isArray(manifest.pages)) {
      if (targetLang === 'en') {
        if (manifest.pages.indexOf(candidate) !== -1 || normCurrent === candidate || manifest.pages.indexOf('fr/' + candidate) !== -1) {
          return candidate;
        }
      } else {
        if (manifest.pages.indexOf(candidate) !== -1) {
          return candidate;
        }
      }
    } else {
      return candidate;
    }

    // Step (c): Fallback to targetLang's hub
    return hubFor(targetLang);
  }

  function relativeUrl(fromPath, toPath) {
    if (!fromPath || !toPath) return toPath || '';
    if (toPath.indexOf('http://') === 0 || toPath.indexOf('https://') === 0 || toPath.indexOf('//') === 0 || toPath.indexOf('mailto:') === 0 || toPath.indexOf('tel:') === 0) {
      return toPath;
    }

    var fromClean = normalizeRelPath(fromPath);
    var toClean = normalizeRelPath(toPath);

    var fromParts = fromClean.split('/');
    fromParts.pop();

    var toParts = toClean.split('/');

    var i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
      i++;
    }

    var upCount = fromParts.length - i;
    var relParts = [];
    for (var u = 0; u < upCount; u++) {
      relParts.push('..');
    }
    for (var d = i; d < toParts.length; d++) {
      relParts.push(toParts[d]);
    }

    var result = relParts.join('/');
    return result || './';
  }

  function localizeTarget(targetLang, linkHref, currentPath, manifest, aliases) {
    if (!linkHref) return linkHref;
    var trimmed = linkHref.trim();

    if (trimmed.charAt(0) === '#' ||
        trimmed.indexOf('http://') === 0 ||
        trimmed.indexOf('https://') === 0 ||
        trimmed.indexOf('//') === 0 ||
        trimmed.indexOf('mailto:') === 0 ||
        trimmed.indexOf('tel:') === 0 ||
        trimmed.indexOf('data:') === 0 ||
        trimmed.indexOf('javascript:') === 0) {
      return linkHref;
    }

    var parts = trimmed.split('#');
    var hash = parts.length > 1 ? '#' + parts[1] : '';
    var pathAndQuery = parts[0].split('?');
    var cleanPath = pathAndQuery[0];
    var query = pathAndQuery.length > 1 ? pathAndQuery[1] : '';

    if (!cleanPath && hash) return linkHref;

    var fromDir = normalizeRelPath(currentPath).split('/');
    fromDir.pop();

    var targetParts = cleanPath.split('/');
    var resolvedStack = [].concat(fromDir);

    for (var t = 0; t < targetParts.length; t++) {
      var part = targetParts[t];
      if (part === '' || part === '.') continue;
      if (part === '..') {
        if (resolvedStack.length > 0) resolvedStack.pop();
      } else {
        resolvedStack.push(part);
      }
    }

    var absTargetPath = resolvedStack.join('/');
    var targetPageLang = detectPageLang(absTargetPath);

    if (targetPageLang === 'en') {
      var eq = equivalentPath(targetLang, absTargetPath, manifest, aliases);
      var hub = hubFor(targetLang);

      if (eq && eq !== hub) {
        var relEq = relativeUrl(currentPath, eq);
        return relEq + (query ? '?' + query : '') + hash;
      } else {
        var qParams = query ? query.split('&') : [];
        var hasUi = false;
        for (var q = 0; q < qParams.length; q++) {
          if (qParams[q].indexOf('ui=') === 0) {
            qParams[q] = 'ui=' + targetLang;
            hasUi = true;
            break;
          }
        }
        if (!hasUi) {
          qParams.push('ui=' + targetLang);
        }
        var newQuery = qParams.join('&');
        return cleanPath + (newQuery ? '?' + newQuery : '') + hash;
      }
    }

    return linkHref;
  }

  // UI State & Runtime Context
  var state = {
    rootUrl: scriptRoot,
    manifest: null,
    aliases: null,
    currentRelPath: '',
    pageLang: 'en'
  };

  function getRelPathFromLoc() {
    if (typeof window === 'undefined') return '';
    var path = decodeURIComponent(window.location.pathname);
    var idx = path.indexOf('/COSYevents/');
    if (idx !== -1) {
      path = path.substring(idx + '/COSYevents/'.length);
    } else {
      if (path.charAt(0) === '/') path = path.substring(1);
    }
    if (!path || path.charAt(path.length - 1) === '/') {
      path += 'index.html';
    }
    return path;
  }

  function injectStylesheet() {
    if (typeof document === 'undefined') return;
    if (document.querySelector('link[href*="shared/css/lang.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = state.rootUrl + 'shared/css/lang.css';
    document.head.appendChild(link);
  }

  function loadData(callback) {
    var manifestUrl = state.rootUrl + 'shared/i18n/localized-pages.json';
    var aliasesUrl = state.rootUrl + 'shared/i18n/aliases.json';

    var cachedM = safeGetStorage('ce-i18n-manifest', true);
    var cachedA = safeGetStorage('ce-i18n-aliases', true);

    if (cachedM && cachedA) {
      try {
        state.manifest = JSON.parse(cachedM);
        state.aliases = JSON.parse(cachedA);
        callback();
        return;
      } catch (e) {}
    }

    Promise.all([
      fetch(manifestUrl).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch(aliasesUrl).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ]).then(function (res) {
      state.manifest = res[0];
      state.aliases = res[1];
      if (res[0]) safeSetStorage('ce-i18n-manifest', JSON.stringify(res[0]), true);
      if (res[1]) safeSetStorage('ce-i18n-aliases', JSON.stringify(res[1]), true);
      callback();
    }).catch(function () {
      callback();
    });
  }

  // UI Component Renderers
  function renderSwitcherInto(container) {
    if (!container) return;

    var currentLang = state.pageLang;
    var myLangs = getMyLangs(currentLang);

    var displayChips = [].concat(myLangs);

    var html = '<div class="ce-lang-switcher" aria-label="Language">';
    html += '<span class="ce-lang-label">Practise in</span>';

    // Quick-switch Chips
    html += '<div class="ce-lang-chips">';
    for (var i = 0; i < displayChips.length; i++) {
      var lCode = displayChips[i];
      var cfg = LANG_CONFIG[lCode];
      if (!cfg) continue;

      var targetRelPath = equivalentPath(lCode, state.currentRelPath, state.manifest, state.aliases);
      var targetHref = relativeUrl(state.currentRelPath, targetRelPath);
      var isCurrent = (lCode === currentLang);

      html += '<a href="' + targetHref + '" class="ce-lang-chip' + (isCurrent ? ' active' : '') + '"' +
              (isCurrent ? ' aria-current="page"' : '') +
              ' data-lang="' + lCode + '">' +
              '<span class="ce-chip-flag">' + cfg.flag + '</span>' +
              '<span class="ce-chip-code">' + lCode.toUpperCase() + '</span>' +
              '</a>';
    }
    html += '</div>';

    // Dropdown Menu Trigger
    html += '<div class="ce-lang-menu-wrapper">';
    html += '<button type="button" class="ce-lang-trigger" aria-expanded="false" aria-haspopup="true" aria-label="All languages menu">🌐</button>';

    // Dropdown Menu Content
    html += '<div class="ce-lang-menu" role="menu" hidden>';
    html += '<div class="ce-menu-header">Practise Languages</div>';

    for (var j = 0; j < LANG_ORDER.length; j++) {
      var code = LANG_ORDER[j];
      var lCfg = LANG_CONFIG[code];
      var tRelPath = equivalentPath(code, state.currentRelPath, state.manifest, state.aliases);
      var tHref = relativeUrl(state.currentRelPath, tRelPath);
      var inMyLangs = (myLangs.indexOf(code) !== -1);
      var isCur = (code === currentLang);
      var showCheckBadge = (inMyLangs && myLangs.length >= 2);

      html += '<div class="ce-menu-item' + (isCur ? ' is-current' : '') + '">';
      html += '<a href="' + tHref + '" class="ce-menu-link" role="menuitem" data-lang="' + code + '">' +
              '<span class="ce-menu-flag">' + lCfg.flag + '</span> ' +
              '<span class="ce-menu-name">' + lCfg.nativeName + '</span>' +
              (showCheckBadge ? ' <span class="ce-menu-badge" aria-label="In your languages">✓</span>' : '') +
              '</a>';

      if (inMyLangs && myLangs.length > 1) {
        html += '<button type="button" class="ce-lang-remove-btn" data-remove-lang="' + code + '" aria-label="Remove ' + lCfg.name + ' from My Languages">Remove</button>';
      }
      html += '</div>';
    }

    html += '</div>';
    html += '</div>';
    html += '</div>';

    container.innerHTML = html;

    var trigger = container.querySelector('.ce-lang-trigger');
    var menu = container.querySelector('.ce-lang-menu');

    if (trigger && menu) {
      function toggleMenu(show) {
        var open = (typeof show === 'boolean') ? show : menu.hasAttribute('hidden');
        if (open) {
          menu.removeAttribute('hidden');
          trigger.setAttribute('aria-expanded', 'true');
        } else {
          menu.setAttribute('hidden', '');
          trigger.setAttribute('aria-expanded', 'false');
        }
      }

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
      });

      document.addEventListener('click', function (e) {
        if (!container.contains(e.target)) {
          toggleMenu(false);
        }
      });

      container.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          toggleMenu(false);
          trigger.focus();
        }
      });
    }

    var langLinks = container.querySelectorAll('a[data-lang]');
    langLinks.forEach(function (a) {
      a.addEventListener('click', function () {
        var code = a.getAttribute('data-lang');
        if (code) addMyLang(code);
      });
    });

    var removeBtns = container.querySelectorAll('button[data-remove-lang]');
    removeBtns.forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var code = b.getAttribute('data-remove-lang');
        if (code) {
          removeMyLang(code);
          renderAllSwitchers();
        }
      });
    });
  }

  function renderAllSwitchers() {
    var targets = document.querySelectorAll('[data-ce-lang-switcher], .ce-nav-right-switcher');
    targets.forEach(function (elem) {
      renderSwitcherInto(elem);
    });
  }

  function renderAlsoAvailableLine() {
    var breadcrumbs = document.querySelector('.cosy-breadcrumbs, .sd-breadcrumbs');
    var main = document.querySelector('main, .page, .container');

    var existing = document.querySelector('.ce-also-available');
    if (existing) existing.remove();

    var currentPath = state.currentRelPath;
    var currentLang = state.pageLang;
    var myLangs = getMyLangs(currentLang);

    var available = [];

    var orderedLangs = [].concat(myLangs);
    for (var i = 0; i < LANG_ORDER.length; i++) {
      if (orderedLangs.indexOf(LANG_ORDER[i]) === -1) {
        orderedLangs.push(LANG_ORDER[i]);
      }
    }

    for (var j = 0; j < orderedLangs.length; j++) {
      var lCode = orderedLangs[j];
      if (lCode === currentLang) continue;

      var eq = equivalentPath(lCode, currentPath, state.manifest, state.aliases);
      var hub = hubFor(lCode);

      if (eq && eq !== hub) {
        available.push({
          code: lCode,
          config: LANG_CONFIG[lCode],
          href: relativeUrl(currentPath, eq)
        });
      }
    }

    if (available.length === 0) return;

    var line = document.createElement('div');
    line.className = 'ce-also-available';
    var innerHtml = '<span class="ce-aa-label">Also available in:</span> ';
    innerHtml += available.map(function (item) {
      return '<a href="' + item.href + '" class="ce-aa-link" data-lang="' + item.code + '">' +
               item.config.flag + ' ' + item.config.nativeName +
             '</a>';
    }).join(' <span class="ce-aa-sep">·</span> ');

    line.innerHTML = innerHtml;

    line.querySelectorAll('a[data-lang]').forEach(function (a) {
      a.addEventListener('click', function () {
        var code = a.getAttribute('data-lang');
        if (code) addMyLang(code);
      });
    });

    if (breadcrumbs && breadcrumbs.parentNode) {
      breadcrumbs.parentNode.insertBefore(line, breadcrumbs.nextSibling);
    } else if (main && main.firstChild) {
      main.insertBefore(line, main.firstChild);
    }
  }

  function renderNotAvailableNotice() {
    if (typeof window === 'undefined') return;
    var params = new URLSearchParams(window.location.search);
    var requestedUi = params.get('ui');

    if (!requestedUi || !LANG_CONFIG[requestedUi] || state.pageLang !== 'en') return;

    if (safeGetStorage('ce-notice-dismissed-' + requestedUi, true)) return;

    var reqCfg = LANG_CONFIG[requestedUi];
    var hubRel = hubFor(requestedUi);
    var hubHref = relativeUrl(state.currentRelPath, hubRel);

    var notice = document.createElement('div');
    notice.className = 'ce-not-available-notice';
    notice.setAttribute('role', 'status');
    notice.innerHTML =
      '<div class="ce-notice-content">' +
        '<span>This page isn\'t available in ' + reqCfg.name + ' yet.</span> ' +
        '<a href="' + hubHref + '" class="ce-notice-hub-link">Go to the ' + reqCfg.nativeName + ' hub →</a>' +
      '</div>' +
      '<button type="button" class="ce-notice-dismiss-btn">Stay in English</button>';

    var dismissBtn = notice.querySelector('.ce-notice-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        safeSetStorage('ce-notice-dismissed-' + requestedUi, 'true', true);
        notice.remove();
      });
    }

    document.body.insertBefore(notice, document.body.firstChild);
  }

  function renderResumeLine() {
    var resumeElem = document.querySelector('[data-ce-lang-resume]');
    if (!resumeElem || state.pageLang !== 'en') return;

    var lastLang = safeGetStorage('ce-lang', false);
    if (!lastLang || lastLang === 'en' || !LANG_CONFIG[lastLang]) {
      resumeElem.innerHTML = '';
      return;
    }

    if (safeGetStorage('ce-resume-dismissed', true)) {
      resumeElem.innerHTML = '';
      return;
    }

    var cfg = LANG_CONFIG[lastLang];
    var hubHref = relativeUrl(state.currentRelPath, hubFor(lastLang));

    resumeElem.innerHTML =
      '<div class="ce-resume-line">' +
        '<a href="' + hubHref + '" class="ce-resume-link">Continue in ' + cfg.nativeName + ' ' + cfg.flag + ' →</a>' +
        '<button type="button" class="ce-resume-dismiss-btn" aria-label="Dismiss">×</button>' +
      '</div>';

    var dismissBtn = resumeElem.querySelector('.ce-resume-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        safeSetStorage('ce-resume-dismissed', 'true', true);
        resumeElem.innerHTML = '';
      });
    }
  }

  function rewriteSameSiteLinks() {
    if (state.pageLang === 'en') return;

    var links = document.querySelectorAll('a[href]');
    links.forEach(function (a) {
      if (a.hasAttribute('data-no-localize') || a.closest('[data-ce-lang-switcher]')) return;
      var rawHref = a.getAttribute('href');
      var newHref = localizeTarget(state.pageLang, rawHref, state.currentRelPath, state.manifest, state.aliases);
      if (newHref && newHref !== rawHref) {
        a.setAttribute('href', newHref);
      }
    });
  }

  function init(options) {
    if (options && options.rootUrl) {
      state.rootUrl = options.rootUrl;
    }

    state.currentRelPath = getRelPathFromLoc();
    state.pageLang = detectPageLang(state.currentRelPath);

    injectStylesheet();

    loadData(function () {
      renderAllSwitchers();
      renderAlsoAvailableLine();
      renderNotAvailableNotice();
      renderResumeLine();
      rewriteSameSiteLinks();
    });
  }

  return {
    init: init,
    LANG_CONFIG: LANG_CONFIG,
    LANG_ORDER: LANG_ORDER,
    getMyLangs: getMyLangs,
    setMyLangs: setMyLangs,
    addMyLang: addMyLang,
    removeMyLang: removeMyLang,
    detectPageLang: detectPageLang,
    stripLangFolder: stripLangFolder,
    hubFor: hubFor,
    equivalentPath: equivalentPath,
    relativeUrl: relativeUrl,
    localizeTarget: localizeTarget,
    state: state
  };
}));
