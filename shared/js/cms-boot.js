/**
 * COSYevents glue for the shared founder editor (shared/js/cms-editor.js, from COSYstudio).
 * Everything site-specific lives here: Supabase config, SDK loading, the client. The editor itself is
 * identical on every COSY site.
 */
(function () {
  'use strict';
  if (window.__cosyCmsBoot) return;
  window.__cosyCmsBoot = true;

  var SUPABASE_SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1';

  function root() {
    var cs = document.currentScript && document.currentScript.getAttribute('src');
    if (!cs) {
      var all = document.scripts;
      for (var i = all.length - 1; i >= 0; i--) {
        var s = all[i].getAttribute('src') || '';
        if (s.indexOf('cms-boot.js') !== -1) { cs = s; break; }
      }
    }
    return cs ? cs.replace(/shared\/js\/cms-boot\.js.*$/, '') : '';
  }
  var ROOT = root();

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { cb(true); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }

  function loadConfig(cb) {
    if (window.COSY_EVENTS_CONFIG && window.COSY_EVENTS_CONFIG.SUPABASE_URL) {
      cb({ enabled: true, url: window.COSY_EVENTS_CONFIG.SUPABASE_URL, anonKey: window.COSY_EVENTS_CONFIG.SUPABASE_ANON_KEY, storageKey: 'cosy-auth' });
      return;
    }
    fetch(ROOT + 'shared/config/supabase.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (c) { cb(c || { enabled: false }); })
      .catch(function () { cb({ enabled: false }); });
  }

  function loadSdk(cb) {
    if (window.supabase && window.supabase.createClient) return cb(window.supabase);
    var existing = document.querySelector('script[src*="supabase-js"]');
    if (existing) { existing.addEventListener('load', function () { cb(window.supabase); }); return; }
    loadScript(SUPABASE_SDK_URL, function (ok) { cb(ok ? window.supabase : null); });
  }

  loadConfig(function (cfg) {
    if (!cfg || !cfg.enabled) return;
    window.COSY_CMS_NO_AUTOINIT = true; // we start it ourselves, with this site's client
    loadScript(ROOT + 'shared/js/cms-editor.js', function (ok) {
      if (!ok || !window.CosyCms) return;
      loadSdk(function (lib) {
        if (!lib) return;
        var client = lib.createClient(cfg.url, cfg.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce', storageKey: cfg.storageKey || 'cosy-auth' }
        });
        var Cms = window.CosyCms;
        Cms.init({ getClient: function () { return client; } });
        // Show the toolbar after a login on this page, without re-applying overrides over any edits.
        window.addEventListener('cosy:auth', function () {
          if (document.getElementById('cosy-founder-cms-toolbar')) return;
          Cms.resolveVerifiedUser(client).then(function (u) {
            if (u && Cms.isFounderRole(u.role)) Cms.renderToolbar(client, u, window.location.pathname);
          });
        });
      });
    });
  });
})();
