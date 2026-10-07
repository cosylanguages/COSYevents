/**
 * COSY Founder Visual On-Page CMS Editor (cms-editor.js)
 * - Ensures Supabase JS SDK and local DOMPurify (shared/vendor/purify.min.js) are loaded.
 * - Detects if COSY_USER role is admin, founder, or owner.
 * - Renders a floating Founder CMS toolbar with '✏️ Edit Page Content' and '💾 Save & Publish Live'.
 * - Fetches live page content overrides from Supabase cms_page_overrides table and applies sanitized overrides on render.
 * - Enables inline visual editing (contenteditable="true") and upserts sanitized edits to Supabase cms_page_overrides.
 * - Enforces key rejection for keys not matching ^[a-z0-9_-]+$ and DOMPurify HTML sanitization.
 */
(function () {
  'use strict';

  var SUPABASE_SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1';

  var DOMPURIFY_CONFIG = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4'],
    ALLOWED_ATTR: ['href', 'rel', 'target', 'class', 'lang'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z0-9+.-]+(?:[^a-z0-9+.-:]|$))/i
  };

  function getScriptBaseUrl() {
    if (typeof document === 'undefined') return './';
    var src = null;
    if (document.currentScript) {
      src = document.currentScript.getAttribute('src');
    }
    if (!src && document.scripts) {
      for (var i = document.scripts.length - 1; i >= 0; i--) {
        var s = document.scripts[i].getAttribute('src') || '';
        if (s.indexOf('cms-editor.js') !== -1) {
          src = s;
          break;
        }
      }
    }
    if (!src) return './';
    var idx = src.indexOf('shared/js/cms-editor.js');
    if (idx !== -1) {
      return src.substring(0, idx);
    }
    return './';
  }

  function loadDomPurify(callback) {
    if (window.DOMPurify) {
      if (callback) callback(window.DOMPurify);
      return;
    }
    var script = document.createElement('script');
    script.src = getScriptBaseUrl() + 'shared/vendor/purify.min.js';
    script.onload = function () {
      if (callback) callback(window.DOMPurify);
    };
    script.onerror = function () {
      console.warn('CMSEditor: Failed to load local DOMPurify script');
      if (callback) callback(null);
    };
    document.head.appendChild(script);
  }

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
      console.warn('CMSEditor: Failed to load Supabase JS SDK from CDN');
    };
    document.head.appendChild(script);
  }

  function isValidOverrideKey(key) {
    if (typeof key !== 'string') return false;
    return /^[a-z0-9_-]+$/i.test(key);
  }

  function sanitizeOverrideHtml(dirty) {
    if (typeof dirty !== 'string') return '';
    if (typeof window !== 'undefined' && window.DOMPurify) {
      if (!window.DOMPurify._cosyHookAdded) {
        if (typeof window.DOMPurify.addHook === 'function') {
          window.DOMPurify.addHook('afterSanitizeElements', function (node) {
            if (node.nodeType === 1 && node.tagName && node.tagName.toUpperCase() === 'A') {
              if (node.getAttribute('target') === '_blank') {
                node.setAttribute('rel', 'noopener noreferrer');
              }
            }
          });
        }
        window.DOMPurify._cosyHookAdded = true;
      }
      var clean = window.DOMPurify.sanitize(dirty, DOMPURIFY_CONFIG);
      if (typeof clean === 'string' && clean.indexOf('target="_blank"') !== -1 && clean.indexOf('rel="noopener noreferrer"') === -1) {
        clean = clean.replace(/<a\b([^>]*)\btarget="_blank"([^>]*)>/gi, function (match, p1, p2) {
          if (/rel=/i.test(match)) {
            return match.replace(/rel="[^"]*"/i, 'rel="noopener noreferrer"').replace(/rel='[^']*'/i, 'rel="noopener noreferrer"');
          }
          return '<a' + p1 + 'target="_blank" rel="noopener noreferrer"' + p2 + '>';
        });
      }
      return clean;
    }
    return dirty;
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

  var cmsState = {
    client: null,
    isEditing: false,
    userRole: null,
    overrides: {}
  };

  function isAuthorizedRole(role) {
    if (!role || typeof role !== 'string') return false;
    var normalized = role.toLowerCase().trim();
    return normalized === 'admin' || normalized === 'founder' || normalized === 'owner';
  }

  function detectUserRole(client) {
    if (window.COSY_USER && window.COSY_USER.role) {
      if (isAuthorizedRole(window.COSY_USER.role)) return window.COSY_USER.role;
    }
    if (window.CosyAuth) {
      var r = typeof window.CosyAuth.role === 'function' ? window.CosyAuth.role() : null;
      if (isAuthorizedRole(r)) return r;
      var acc = typeof window.CosyAuth.getAccess === 'function' ? window.CosyAuth.getAccess() : null;
      if (acc && isAuthorizedRole(acc.role)) return acc.role;
    }
    if (client && client.auth) {
      var session = client.auth.session ? client.auth.session() : null;
      if (session && session.user) {
        var user = session.user;
        var appRole = user.app_metadata ? user.app_metadata.role : null;
        var metaRole = user.user_metadata ? user.user_metadata.role : null;
        if (isAuthorizedRole(appRole)) return appRole;
        if (isAuthorizedRole(metaRole)) return metaRole;
      }
    }
    return null;
  }

  function getOverrideKey(el) {
    if (!el || el.nodeType !== 1) return null;
    var cmsId = el.getAttribute('data-cms-id');
    if (cmsId && isValidOverrideKey(cmsId)) return cmsId;
    if (el.id && isValidOverrideKey(el.id)) return el.id;
    if (el.className && typeof el.className === 'string') {
      var classes = el.className.trim().split(/\s+/).filter(function (c) {
        return c && !c.startsWith('cosy-cms-') && isValidOverrideKey(c);
      });
      if (classes.length > 0) return classes[0];
    }
    return null;
  }

  function applyOverrides(content) {
    if (!content || typeof content !== 'object') return;
    cmsState.overrides = content;
    Object.keys(content).forEach(function (key) {
      if (!isValidOverrideKey(key)) {
        console.warn('CMSEditor: Rejecting override key not matching ^[a-z0-9_-]+$:', key);
        return;
      }
      var dirtyHtml = content[key];
      if (typeof dirtyHtml !== 'string') return;
      var cleanHtml = sanitizeOverrideHtml(dirtyHtml);
      try {
        var selector = '[data-cms-id="' + key + '"], #' + key + ', .' + key;
        var elems = document.querySelectorAll(selector);
        elems.forEach(function (el) {
          el.innerHTML = cleanHtml;
        });
      } catch (e) {
        console.warn('CMSEditor: Invalid selector override for key:', key);
      }
    });
  }

  function fetchAndApplyOverrides(client) {
    var pagePath = window.location.pathname;
    return client
      .from('cms_page_overrides')
      .select('content')
      .eq('page_path', pagePath)
      .maybeSingle()
      .then(function (res) {
        if (res && res.data && res.data.content) {
          applyOverrides(res.data.content);
        }
      })
      .catch(function (err) {
        console.warn('CMSEditor: Error fetching page overrides:', err);
      });
  }

  function getEditableElements() {
    var selector = 'h1, h2, h3, h4, h5, h6, p, .hub-title, .hub-subtitle, .section-title, [data-cms-id], .hero-btn, .explore-card-title, .explore-card-desc, .calc-title, .calc-subtitle';
    var elems = Array.from(document.querySelectorAll(selector));
    return elems.filter(function (el) {
      return !el.closest('#cosy-founder-cms-toolbar') && !el.closest('.ce-session-nav');
    });
  }

  function injectCmsStyles() {
    if (document.getElementById('cosy-cms-editor-styles')) return;
    var style = document.createElement('style');
    style.id = 'cosy-cms-editor-styles';
    style.textContent =
      '#cosy-founder-cms-toolbar {' +
      '  position: fixed; bottom: 20px; right: 20px; z-index: 999999;' +
      '  display: flex; align-items: center; gap: 10px;' +
      '  background: #1b3120; color: #ffffff; padding: 10px 16px;' +
      '  border-radius: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.35);' +
      '  border: 1.5px solid #416b49; font-family: system-ui, -apple-system, sans-serif;' +
      '  font-size: 0.88rem;' +
      '}' +
      '.cosy-cms-title { font-weight: 700; color: #f59e0b; font-size: 0.92rem; }' +
      '.cosy-cms-btn {' +
      '  background: #416b49; color: #ffffff; border: none; padding: 6px 14px;' +
      '  border-radius: 20px; font-weight: 600; font-size: 0.85rem; cursor: pointer;' +
      '  transition: all 0.2s ease;' +
      '}' +
      '.cosy-cms-btn:hover { background: #52855c; transform: translateY(-1px); }' +
      '.cosy-cms-btn.primary {' +
      '  background: #f59e0b; color: #000000; font-weight: 700;' +
      '}' +
      '.cosy-cms-btn.primary:hover { background: #fbbf24; }' +
      '.cosy-cms-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }' +
      '.cosy-cms-status { font-size: 0.82rem; color: #a7f3d0; font-weight: 600; margin-left: 4px; }' +
      '[contenteditable="true"].cosy-cms-editing {' +
      '  outline: 2px dashed #f59e0b !important;' +
      '  outline-offset: 3px;' +
      '  border-radius: 4px;' +
      '  cursor: text;' +
      '}';
    document.head.appendChild(style);
  }

  function renderFounderToolbar(client) {
    if (document.getElementById('cosy-founder-cms-toolbar')) return;

    injectCmsStyles();

    var toolbar = document.createElement('div');
    toolbar.id = 'cosy-founder-cms-toolbar';
    toolbar.innerHTML =
      '<span class="cosy-cms-title">👑 Founder CMS</span>' +
      '<button type="button" id="cms-edit-btn" class="cosy-cms-btn">✏️ Edit Page Content</button>' +
      '<button type="button" id="cms-save-btn" class="cosy-cms-btn primary" disabled>💾 Save &amp; Publish Live</button>' +
      '<span id="cms-status-msg" class="cosy-cms-status"></span>';

    document.body.appendChild(toolbar);

    var editBtn = toolbar.querySelector('#cms-edit-btn');
    var saveBtn = toolbar.querySelector('#cms-save-btn');
    var statusMsg = toolbar.querySelector('#cms-status-msg');

    function showStatus(text, isError) {
      statusMsg.textContent = text;
      statusMsg.style.color = isError ? '#f87171' : '#a7f3d0';
      setTimeout(function () {
        if (statusMsg.textContent === text) statusMsg.textContent = '';
      }, 4000);
    }

    function toggleEditMode(enable) {
      cmsState.isEditing = typeof enable === 'boolean' ? enable : !cmsState.isEditing;
      var editables = getEditableElements();

      editables.forEach(function (el) {
        if (cmsState.isEditing) {
          el.setAttribute('contenteditable', 'true');
          el.classList.add('cosy-cms-editing');
          if (!getOverrideKey(el)) {
            var fallbackKey = 'cms-el-' + Math.random().toString(36).substring(2, 8);
            el.setAttribute('data-cms-id', fallbackKey);
          }
        } else {
          el.removeAttribute('contenteditable');
          el.classList.remove('cosy-cms-editing');
        }
      });

      if (cmsState.isEditing) {
        editBtn.textContent = '✏️ Editing Mode (Active)';
        saveBtn.disabled = false;
        showStatus('Visual editing enabled! Click elements to edit.', false);
      } else {
        editBtn.textContent = '✏️ Edit Page Content';
        saveBtn.disabled = true;
      }
    }

    editBtn.addEventListener('click', function () {
      toggleEditMode();
    });

    saveBtn.addEventListener('click', function () {
      var editables = getEditableElements();
      var overridesMap = {};

      editables.forEach(function (el) {
        var key = getOverrideKey(el);
        if (!key || !isValidOverrideKey(key)) return;
        var cleanHtml = sanitizeOverrideHtml(el.innerHTML);
        overridesMap[key] = cleanHtml;
      });

      var pagePath = window.location.pathname;
      statusMsg.textContent = 'Saving...';

      client
        .from('cms_page_overrides')
        .upsert({
          page_path: pagePath,
          content: overridesMap,
          updated_at: new Date().toISOString()
        })
        .then(function (res) {
          if (res.error) {
            showStatus('Error: ' + res.error.message, true);
          } else {
            showStatus('Saved & Published Live! ✅', false);
            toggleEditMode(false);
          }
        })
        .catch(function (err) {
          showStatus('Error saving content', true);
        });
    });
  }

  function checkAndInit() {
    loadConfig(function (config) {
      if (!config || !config.enabled) return;

      loadDomPurify(function () {
        loadSupabaseSdk(function (supabaseLib) {
          if (!supabaseLib) return;
          var client = supabaseLib.createClient(config.url, config.anonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              flowType: 'pkce',
              storageKey: config.storageKey || 'cosy-auth'
            }
          });

          cmsState.client = client;

          // Apply live page overrides for all visitors
          fetchAndApplyOverrides(client);

          // Check user role for rendering Founder CMS toolbar
          var evaluateRole = function () {
            var role = detectUserRole(client);
            if (!role && client.auth && client.auth.getSession) {
              client.auth.getSession().then(function (res) {
                if (res && res.data && res.data.session && res.data.session.user) {
                  var user = res.data.session.user;
                  var appRole = user.app_metadata ? user.app_metadata.role : null;
                  var metaRole = user.user_metadata ? user.user_metadata.role : null;
                  var resolved = isAuthorizedRole(appRole) ? appRole : (isAuthorizedRole(metaRole) ? metaRole : null);
                  if (resolved) {
                    cmsState.userRole = resolved;
                    renderFounderToolbar(client);
                    return;
                  }
                }
                // Try my_access RPC call
                client.rpc('my_access').then(function (accRes) {
                  if (accRes && accRes.data && isAuthorizedRole(accRes.data.role)) {
                    cmsState.userRole = accRes.data.role;
                    renderFounderToolbar(client);
                  }
                }).catch(function () {});
              });
            } else if (role) {
              cmsState.userRole = role;
              renderFounderToolbar(client);
            }
          };

          evaluateRole();

          if (window.CosyAuth && typeof window.CosyAuth.onChange === 'function') {
            window.CosyAuth.onChange(function () {
              evaluateRole();
            });
          }
          if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
            window.addEventListener('cosy:auth', evaluateRole);
          }
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
  } else {
    checkAndInit();
  }

  window.CMSEditor = {
    init: checkAndInit,
    isAuthorizedRole: isAuthorizedRole,
    detectUserRole: detectUserRole,
    isValidOverrideKey: isValidOverrideKey,
    sanitizeOverrideHtml: sanitizeOverrideHtml,
    applyOverrides: applyOverrides,
    getState: function () { return cmsState; }
  };
})();
