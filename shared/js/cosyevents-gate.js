/**
 * COSYevents Gate Manager (window.CosyEventsGate)
 * Handles token extraction/storage, Supabase RPC redemption/staff check,
 * localized state UI rendering using DOM APIs, and dynamic session deck rendering.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.CosyEventsGate = factory();
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          root.CosyEventsGate.init();
        });
      } else {
        root.CosyEventsGate.init();
      }
    }
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MESSAGES = {
    en: {
      loading: "Loading session content...",
      no_link: "Open the link your host sent you.",
      invalid: "Invalid access link.",
      expired: "This access link has expired.",
      revoked: "This access link has been revoked.",
      unavailable: "Access verification service is currently unavailable.",
      whatsapp_btn: "Message us on WhatsApp 📱"
    },
    fr: {
      loading: "Chargement du contenu de la session...",
      no_link: "Ouvrez le lien envoyé par votre hôte.",
      invalid: "Lien d'accès invalide.",
      expired: "Ce lien d'accès a expiré.",
      revoked: "Ce lien d'accès a été révoqué.",
      unavailable: "Le service de vérification d'accès est actuellement indisponible.",
      whatsapp_btn: "Écrivez-nous sur WhatsApp 📱"
    },
    it: {
      loading: "Caricamento del contenuto della sessione...",
      no_link: "Apri il link inviato dal tuo host.",
      invalid: "Link di accesso non valido.",
      expired: "Questo link di accesso è scaduto.",
      revoked: "Questo link di accesso è stato revocato.",
      unavailable: "Il servizio di verifica degli accessi non è al momento disponibile.",
      whatsapp_btn: "Contattaci su WhatsApp 📱"
    },
    ru: {
      loading: "Загрузка материалов сессии...",
      no_link: "Откройте ссылку, полученную от организатора.",
      invalid: "Недействительная ссылка доступа.",
      expired: "Срок действия ссылки доступа истек.",
      revoked: "Ссылка доступа была отозвана.",
      unavailable: "Сервис проверки доступа временно недоступен.",
      whatsapp_btn: "Написать нам в WhatsApp 📱"
    },
    el: {
      loading: "Φόρτωση περιεχομένου συνεδρίας...",
      no_link: "Ανοίξτε το σύνδεσμο που σας έστειλε ο οικοδεσπότης σας.",
      invalid: "Μη έγκυρος σύνδεσμος πρόσβασης.",
      expired: "Αυτός ο σύνδεσμος πρόσβασης έχει λήξει.",
      revoked: "Αυτός ο σύνδεσμος πρόσβασης έχει ανακληθεί.",
      unavailable: "Η υπηρεσία επαλήθευσης πρόσβασης δεν είναι διαθέσιμη προς το παρόν.",
      whatsapp_btn: "Στείλτε μας μήνυμα στο WhatsApp 📱"
    }
  };

  function getPageLang() {
    var langAttr = (document.documentElement && document.documentElement.lang) ? document.documentElement.lang.toLowerCase() : 'en';
    var shortLang = langAttr.split('-')[0];
    return MESSAGES[shortLang] ? shortLang : 'en';
  }

  function getString(key, lang) {
    var l = lang || getPageLang();
    var dict = MESSAGES[l] || MESSAGES.en;
    return dict[key] || MESSAGES.en[key] || key;
  }

  function extractAndStoreToken(sessionId) {
    if (typeof window === 'undefined') return null;

    var hash = window.location.hash || '';
    var match = hash.match(/#k=([^&]+)/);
    var token = null;

    if (match && match[1]) {
      token = decodeURIComponent(match[1]);
      try {
        sessionStorage.setItem('cosy_gate:' + sessionId, token);
      } catch (e) {}

      // Remove hash with history.replaceState
      if (window.history && window.history.replaceState) {
        var cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
      }
    } else {
      try {
        token = sessionStorage.getItem('cosy_gate:' + sessionId);
      } catch (e) {}
    }

    return token;
  }

  function renderStateUI(targetContainer, stateKey, lang) {
    if (!targetContainer) return;
    targetContainer.textContent = ''; // clear

    var l = lang || getPageLang();
    var msgText = getString(stateKey, l);

    var card = document.createElement('div');
    card.className = 'ce-gate-card';
    card.style.cssText = 'max-width: 500px; margin: 3rem auto; padding: 2rem; background: var(--bg-card, #ffffff); border: 1.5px solid var(--border-color, #e0e0e0); border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); font-family: var(--font-sans, sans-serif);';

    var msgP = document.createElement('p');
    msgP.className = 'ce-gate-msg';
    msgP.style.cssText = 'font-size: 1.05rem; font-weight: 600; color: var(--ink, #222); margin-bottom: 1.5rem; line-height: 1.5;';
    msgP.textContent = msgText;
    card.appendChild(msgP);

    if (stateKey !== 'loading') {
      var waBtn = document.createElement('a');
      waBtn.className = 'ce-gate-wa-btn';
      waBtn.href = 'https://wa.me/330766784195';
      waBtn.target = '_blank';
      waBtn.rel = 'noopener';
      waBtn.style.cssText = 'display: inline-block; padding: 0.75rem 1.25rem; background: #25D366; color: #ffffff; font-weight: 700; border-radius: 8px; text-decoration: none; font-size: 0.95rem; transition: background 0.2s;';
      waBtn.textContent = getString('whatsapp_btn', l);
      card.appendChild(waBtn);
    }

    targetContainer.appendChild(card);
  }

  function getScriptBaseUrl() {
    var src = null;
    if (document.currentScript) {
      src = document.currentScript.getAttribute('src');
    }
    if (!src && document.scripts) {
      for (var i = document.scripts.length - 1; i >= 0; i--) {
        var s = document.scripts[i].getAttribute('src') || '';
        if (s.indexOf('cosyevents-gate.js') !== -1) {
          src = s;
          break;
        }
      }
    }
    if (!src) return '../../';
    var idx = src.indexOf('shared/js/cosyevents-gate.js');
    if (idx !== -1) return src.substring(0, idx);
    return '../../';
  }

  function fetchSupabaseConfig(callback) {
    var baseUrl = getScriptBaseUrl();
    var configUrl = baseUrl + 'shared/config/supabase.json';
    fetch(configUrl)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (config) {
        callback(config);
      })
      .catch(function () {
        callback(null);
      });
  }

  function initSupabaseClient(config, callback) {
    if (!config || !config.enabled || !config.url || !config.anonKey) {
      callback(null);
      return;
    }

    if (window.supabase && window.supabase.createClient) {
      var client = window.supabase.createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: config.storageKey || 'cosy-auth'
        }
      });
      callback(client);
    } else {
      var baseUrl = getScriptBaseUrl();
      var vendorJsUrl = baseUrl + 'shared/vendor/supabase.js';
      var script = document.createElement('script');
      script.src = vendorJsUrl;
      script.onload = function () {
        if (window.supabase && window.supabase.createClient) {
          var client = window.supabase.createClient(config.url, config.anonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              storageKey: config.storageKey || 'cosy-auth'
            }
          });
          callback(client);
        } else {
          callback(null);
        }
      };
      script.onerror = function () { callback(null); };
      document.head.appendChild(script);
    }
  }

  function triggerSessionDeckInit() {
    if (typeof window.initSlideDeck === 'function') {
      window.initSlideDeck();
    } else if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('cosy:session-rendered'));
    }
  }

  function init() {
    var isGated = document.querySelector('meta[name="cosy-gated"][content="true"]');
    var metaSession = document.querySelector('meta[name="session-id"]');
    var targetMain = document.getElementById('session-private');

    if (!isGated || !metaSession || !targetMain) return;

    var sessionId = metaSession.getAttribute('content');
    if (!sessionId) return;

    var lang = getPageLang();
    var token = extractAndStoreToken(sessionId);

    renderStateUI(targetMain, 'loading', lang);

    fetchSupabaseConfig(function (config) {
      if (!config || !config.enabled) {
        renderStateUI(targetMain, 'unavailable', lang);
        return;
      }

      initSupabaseClient(config, function (client) {
        if (!client) {
          renderStateUI(targetMain, 'unavailable', lang);
          return;
        }

        // Check COSYauth session / user role first
        client.auth.getSession().then(function (sessionRes) {
          var session = sessionRes && sessionRes.data ? sessionRes.data.session : null;

          var proceedWithRedemption = function () {
            if (!token) {
              renderStateUI(targetMain, 'no_link', lang);
              return;
            }

            client.rpc('redeem_session_access_link', {
              p_session_id: sessionId,
              p_token: token
            }).then(function (res) {
              var data = res ? res.data : null;
              if (!data || data.status !== 'ok') {
                var st = (data && data.status) ? data.status : 'invalid';
                if (st !== 'expired' && st !== 'revoked' && st !== 'invalid') st = 'invalid';
                renderStateUI(targetMain, st, lang);
                return;
              }

              if (window.CosySessionRenderer) {
                window.CosySessionRenderer.render(data, targetMain);
                triggerSessionDeckInit();
              }
            }).catch(function () {
              renderStateUI(targetMain, 'unavailable', lang);
            });
          };

          if (session && session.user) {
            // Check staff role via my_access
            client.rpc('my_access').then(function (accRes) {
              var access = accRes ? accRes.data : null;
              var role = access ? access.role : null;
              if (role === 'founder' || role === 'teacher') {
                // Call staff_get_session
                client.rpc('staff_get_session', { p_session_id: sessionId }).then(function (staffRes) {
                  var data = staffRes ? staffRes.data : null;
                  if (data && data.status === 'ok') {
                    if (window.CosySessionRenderer) {
                      window.CosySessionRenderer.render(data, targetMain);
                      triggerSessionDeckInit();
                    }
                  } else {
                    proceedWithRedemption();
                  }
                }).catch(function () {
                  proceedWithRedemption();
                });
              } else {
                proceedWithRedemption();
              }
            }).catch(function () {
              proceedWithRedemption();
            });
          } else {
            proceedWithRedemption();
          }
        }).catch(function () {
          renderStateUI(targetMain, 'unavailable', lang);
        });
      });
    });
  }

  return {
    MESSAGES: MESSAGES,
    init: init,
    extractAndStoreToken: extractAndStoreToken,
    renderStateUI: renderStateUI
  };
}));
