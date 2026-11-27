/**
 * COSY Ecosystem Cross-Domain Single Sign-On (SSO) Handler (auth-sso.js)
 * - Ensures Supabase JS SDK (https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1) is loaded.
 * - Strips any tokens in location.hash from address bar without restoring sessions via URL parameters.
 * - Sessions are shared via common localStorage storageKey 'cosy-auth'.
 */
(function () {
  'use strict';

  var SUPABASE_SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1';

  function loadSupabaseSdk(callback) {
    if (window.supabase && window.supabase.createClient) {
      if (callback) callback(window.supabase);
      return;
    }
    var existing = document.querySelector('script[src*="supabase-js"]');
    if (existing) {
      existing.addEventListener('load', function () {
        if (callback) callback(window.supabase);
      });
      return;
    }
    var script = document.createElement('script');
    script.src = SUPABASE_SDK_URL;
    script.onload = function () {
      if (callback) callback(window.supabase);
    };
    script.onerror = function () {
      console.warn('AuthSSO: Failed to load Supabase JS SDK from CDN');
    };
    document.head.appendChild(script);
  }

  function getScriptBaseUrl() {
    if (typeof document === 'undefined') return './';
    var src = null;
    if (document.currentScript) {
      src = document.currentScript.getAttribute('src');
    }
    if (!src && document.scripts) {
      for (var i = document.scripts.length - 1; i >= 0; i--) {
        var s = document.scripts[i].getAttribute('src') || '';
        if (s.indexOf('auth-sso.js') !== -1) {
          src = s;
          break;
        }
      }
    }
    if (!src) return './';
    var idx = src.indexOf('shared/js/auth-sso.js');
    if (idx !== -1) {
      return src.substring(0, idx);
    }
    return './';
  }

  function loadConfig(callback) {
    if (window.COSY_EVENTS_CONFIG && window.COSY_EVENTS_CONFIG.SUPABASE_URL) {
      callback({
        enabled: true,
        url: window.COSY_EVENTS_CONFIG.SUPABASE_URL,
        anonKey: window.COSY_EVENTS_CONFIG.SUPABASE_ANON_KEY,
        storageKey: 'cosy-auth'
      });
      return;
    }
    var configUrl = getScriptBaseUrl() + 'shared/config/supabase.json';
    fetch(configUrl)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (cfg) { callback(cfg || { enabled: false }); })
      .catch(function () { callback({ enabled: false }); });
  }

  var ssoState = {
    client: null,
    session: null,
    initialized: false
  };

  function getSupabaseClient(config, supabaseLib) {
    if (ssoState.client) return ssoState.client;
    if (!config || !config.url || !config.anonKey) return null;
    ssoState.client = supabaseLib.createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: config.storageKey || 'cosy-auth'
      }
    });
    return ssoState.client;
  }

  function parseHashParams(hash) {
    if (!hash || hash.charAt(0) !== '#') return {};
    var query = hash.substring(1);
    var result = {};
    var pairs = query.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      if (pair.length === 2) {
        result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
    return result;
  }

  function cleanUrlHash() {
    if (typeof window === 'undefined') return;
    if (window.history && window.history.replaceState) {
      var cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, document.title, cleanUrl);
    } else {
      window.location.hash = '';
    }
  }

  function handleIncomingSSO() {
    if (typeof window === 'undefined' || !window.location || !window.location.hash) {
      return;
    }

    var params = parseHashParams(window.location.hash);
    if (params.access_token || params.refresh_token) {
      cleanUrlHash();
    }
  }

  function initSSO() {
    handleIncomingSSO();

    loadConfig(function (config) {
      if (!config || !config.enabled) return;

      loadSupabaseSdk(function (supabaseLib) {
        if (!supabaseLib) return;
        var client = getSupabaseClient(config, supabaseLib);
        if (!client) return;

        // Listen to auth state changes to update local ssoState.session
        if (client.auth && client.auth.onAuthStateChange) {
          client.auth.onAuthStateChange(function (event, session) {
            ssoState.session = session;
          });
        }

        if (!ssoState.session && client.auth && client.auth.getSession) {
          client.auth.getSession().then(function (res) {
            if (res && res.data && res.data.session) {
              ssoState.session = res.data.session;
            }
          });
        }

        ssoState.initialized = true;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSSO);
  } else {
    initSSO();
  }

  window.AuthSSO = {
    init: initSSO,
    parseHashParams: parseHashParams,
    cleanUrlHash: cleanUrlHash,
    getState: function () { return ssoState; }
  };
})();
