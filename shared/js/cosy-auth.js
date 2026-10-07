/**
 * COSY Ecosystem Auth Module (window.CosyAuth)
 * Shared authentication library for COSYlanguages, COSYevents, COSYplatform, etc.
 * Uses Supabase Auth & RLS without storing roles/authority in localStorage.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.CosyAuth = factory();
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          root.CosyAuth.autoInit();
        });
      } else {
        root.CosyAuth.autoInit();
      }
    }
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DICTIONARY = {
    en: {
      login: "Log in",
      logout: "Log out",
      my_account: "My Account",
      my_access: "My Access",
      role_student: "Student",
      role_teacher: "Teacher",
      role_founder: "Founder",
      email_label: "Email address",
      send_code: "Send login code",
      enter_code: "Enter 6-digit code",
      verify_code: "Verify & Log in",
      resend_code: "Resend code",
      code_sent: "Code sent to your email!",
      error_invalid_email: "Please enter a valid email address.",
      error_expired_code: "Invalid or expired code. Please try again.",
      error_rate_limit: "Too many requests. Please wait a moment.",
      error_offline: "You are offline. Please check your internet connection.",
      error_generic: "An error occurred. Please try again.",
      back_to_home: "Back to home",
      no_grants: "No active passes or access grants found.",
      valid_until: "Valid until",
      includes_lower: "Includes lower levels",
      course: "Course",
      language: "Language",
      level: "Level",
      sign_out_all: "Sign out on all devices"
    },
    fr: {
      login: "Se connecter",
      logout: "Se déconnecter",
      my_account: "Mon compte",
      my_access: "Mon accès",
      role_student: "Élève",
      role_teacher: "Enseignant",
      role_founder: "Fondateur",
      email_label: "Adresse e-mail",
      send_code: "Envoyer le code",
      enter_code: "Entrez le code à 6 chiffres",
      verify_code: "Vérifier et se connecter",
      resend_code: "Renvoyer le code",
      code_sent: "Code envoyé à votre e-mail !",
      error_invalid_email: "Veuillez entrer une adresse e-mail valide.",
      error_expired_code: "Code invalide ou expiré. Veuillez réessayer.",
      error_rate_limit: "Trop de requêtes. Veuillez patienter un instant.",
      error_offline: "Vous êtes hors ligne. Vérifiez votre connexion internet.",
      error_generic: "Une erreur est survenue. Veuillez réessayer.",
      back_to_home: "Retour à l'accueil",
      no_grants: "Aucun pass ou accès actif trouvé.",
      valid_until: "Valable jusqu'au",
      includes_lower: "Inclut les niveaux inférieurs",
      course: "Cours",
      language: "Langue",
      level: "Niveau",
      sign_out_all: "Se déconnecter de tous les appareils"
    },
    it: {
      login: "Accedi",
      logout: "Esci",
      my_account: "Il mio account",
      my_access: "Il mio accesso",
      role_student: "Studente",
      role_teacher: "Insegnante",
      role_founder: "Fondatore",
      email_label: "Indirizzo email",
      send_code: "Invia codice",
      enter_code: "Inserisci il codice a 6 cifre",
      verify_code: "Verifica e accedi",
      resend_code: "Reinvia codice",
      code_sent: "Codice inviato alla tua email!",
      error_invalid_email: "Inserisci un indirizzo email valido.",
      error_expired_code: "Codice non valido o scaduto. Riprova.",
      error_rate_limit: "Troppe richieste. Attendi un momento.",
      error_offline: "Sei offline. Controlla la tua connessione internet.",
      error_generic: "Si è verificato un errore. Riprova.",
      back_to_home: "Torna alla home",
      no_grants: "Nessun pass o accesso attivo trovato.",
      valid_until: "Valido fino al",
      includes_lower: "Include livelli inferiori",
      course: "Corso",
      language: "Lingua",
      level: "Livello",
      sign_out_all: "Esci da tutti i dispositivi"
    },
    ru: {
      login: "Войти",
      logout: "Выйти",
      my_account: "Мой аккаунт",
      my_access: "Мой доступ",
      role_student: "Студент",
      role_teacher: "Преподаватель",
      role_founder: "Основатель",
      email_label: "Адрес эл. почты",
      send_code: "Отправить код",
      enter_code: "Введите 6-значный код",
      verify_code: "Подтвердить и войти",
      resend_code: "Отправить код повторно",
      code_sent: "Код отправлен на вашу почту!",
      error_invalid_email: "Пожалуйста, введите корректный адрес эл. почты.",
      error_expired_code: "Неверный или просроченный код. Попробуйте снова.",
      error_rate_limit: "Слишком много запросов. Пожалуйста, подождите.",
      error_offline: "Вы оффлайн. Проверьте подключение к интернету.",
      error_generic: "Произошла ошибка. Попробуйте снова.",
      back_to_home: "На главную",
      no_grants: "Нет активных пассов или доступов.",
      valid_until: "Действителен до",
      includes_lower: "Включает нижние уровни",
      course: "Курс",
      language: "Язык",
      level: "Уровень",
      sign_out_all: "Выйти со всех устройств"
    },
    el: {
      login: "Σύνδεση",
      logout: "Αποσύνδεση",
      my_account: "Ο λογαριασμός μου",
      my_access: "Η πρόσβασή μου",
      role_student: "Μαθητής",
      role_teacher: "Καθηγητής",
      role_founder: "Ιδρυτής",
      email_label: "Διεύθυνση email",
      send_code: "Αποστολή κωδικού",
      enter_code: "Εισαγάγετε τον 6ψήφιο κωδικό",
      verify_code: "Επαλήθευση & Σύνδεση",
      resend_code: "Επαναποστολή κωδικού",
      code_sent: "O κωδικός στάλθηκε στο email σας!",
      error_invalid_email: "Παρακαλώ εισαγάγετε μια έγκυρη διεύθυνση email.",
      error_expired_code: "Μη έγκυρος ή ληγμένος κωδικός. Δοκιμάστε ξανά.",
      error_rate_limit: "Πολλές αιτήσεις. Παρακαλώ περιμένετε λίγο.",
      error_offline: "Είστε εκτός σύνδεσης. Ελέγξτε τη σύνδεσή σας.",
      error_generic: "Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.",
      back_to_home: "Επιστροφή στην αρχική",
      no_grants: "Δεν βρέθηκαν ενεργές πρόσβασεις.",
      valid_until: "Ισχύει έως",
      includes_lower: "Περιλαμβάνει χαμηλότερα επίπεδα",
      course: "Μάθημα",
      language: "Γλώσσα",
      level: "Επίπεδο",
      sign_out_all: "Αποσύνδεση από όλες τις συσκευές"
    }
  };

  function escapeHtml(val) {
    if (val === null || val === undefined) return '';
    if (typeof val !== 'string') val = String(val);
    return val
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getTranslation(key, lang) {
    var dict = DICTIONARY[lang] || DICTIONARY.en;
    return dict[key] || DICTIONARY.en[key] || key;
  }

  function getScriptBaseUrl() {
    if (typeof document === 'undefined') return './';
    var src = null;
    if (document.currentScript) {
      src = document.currentScript.getAttribute('src');
    }
    if (!src && document.scripts) {
      var scripts = document.scripts;
      for (var i = scripts.length - 1; i >= 0; i--) {
        var s = scripts[i].getAttribute('src') || '';
        if (s.indexOf('cosy-auth.js') !== -1) {
          src = s;
          break;
        }
      }
    }
    if (!src) return './';
    var idx = src.indexOf('shared/js/cosy-auth.js');
    if (idx !== -1) {
      return src.substring(0, idx);
    }
    return './';
  }

  function injectAuthCss() {
    if (typeof document === 'undefined') return;
    var existing = document.querySelector('link[href*="shared/css/auth.css"]');
    if (!existing && document.head) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = getScriptBaseUrl() + 'shared/css/auth.css';
      document.head.appendChild(link);
    }
  }

  function safeStorageGet(key, isSession) {
    try {
      var storage = isSession ? sessionStorage : localStorage;
      return storage ? storage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function safeStorageSet(key, val, isSession) {
    try {
      var storage = isSession ? sessionStorage : localStorage;
      if (storage) storage.setItem(key, val);
    } catch (e) {}
  }

  function validateNextParam(next, fallback) {
    if (!fallback) fallback = 'index.html';
    if (!next || typeof next !== 'string') return fallback;
    var trimmed = next.trim();
    if (!trimmed) return fallback;

    var decoded = trimmed;
    try {
      decoded = decodeURIComponent(trimmed);
    } catch (e) {
      return fallback;
    }

    // Must not contain protocol, domain, backslashes, double slashes, or dangerous schemes
    var schemeRegex = /^(?:[a-z0-9+-.]+ :|\/\/|\\\\)/i;
    if (schemeRegex.test(trimmed) || schemeRegex.test(decoded)) return fallback;
    if (trimmed.indexOf('\\') !== -1 || decoded.indexOf('\\') !== -1) return fallback;
    if (trimmed.indexOf('//') !== -1 || decoded.indexOf('//') !== -1) return fallback;
    if (/^[a-z0-9+-.]+:/i.test(trimmed) || /^[a-z0-9+-.]+:/i.test(decoded)) return fallback;

    return trimmed;
  }

  // State
  var state = {
    initialized: false,
    enabled: false,
    config: null,
    client: null,
    session: null,
    access: null,
    listeners: [],
    baseUrl: getScriptBaseUrl()
  };

  function loadScript(url, callback) {
    if (typeof document === 'undefined') {
      if (callback) callback();
      return;
    }
    var script = document.createElement('script');
    script.src = url;
    script.onload = function () {
      if (callback) callback();
    };
    script.onerror = function () {
      console.warn('CosyAuth: Failed to load script:', url);
      if (callback) callback();
    };
    document.head.appendChild(script);
  }

  function notifyChange() {
    var data = { session: state.session, access: state.access };
    for (var i = 0; i < state.listeners.length; i++) {
      try {
        state.listeners[i](data);
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('cosy:auth', { detail: data }));
      } catch (e) {}
    }
  }

  function syncLanguagesWithAccess() {
    if (!state.session || !state.access || typeof window === 'undefined' || !window.CosyLang) return;
    var accessLangs = languages();
    if (!accessLangs || accessLangs.length === 0) return;

    var currentMyLangs = window.CosyLang.getMyLangs ? window.CosyLang.getMyLangs() : ['en'];
    var updated = [].concat(currentMyLangs);
    var changed = false;

    for (var i = 0; i < accessLangs.length; i++) {
      var l = accessLangs[i];
      if (window.CosyLang.LANG_CONFIG && window.CosyLang.LANG_CONFIG[l]) {
        if (updated.indexOf(l) === -1) {
          updated.push(l);
          changed = true;
        }
      }
    }

    if (changed && window.CosyLang.setMyLangs) {
      window.CosyLang.setMyLangs(updated);
    }
  }

  function fetchAccess(callback) {
    if (!state.client || !state.session) {
      state.access = null;
      if (callback) callback(null);
      return;
    }

    state.client.rpc('my_access')
      .then(function (res) {
        if (res && res.data && !res.error) {
          state.access = res.data;
          syncLanguagesWithAccess();
        } else {
          state.access = null;
        }
        if (callback) callback(state.access);
      })
      .catch(function () {
        state.access = null;
        if (callback) callback(null);
      });
  }

  function init(options) {
    options = options || {};
    if (state.initialized && !options.force) {
      return Promise.resolve(api);
    }

    var configPromise;
    if (options.config) {
      configPromise = Promise.resolve(options.config);
    } else {
      var configUrl = state.baseUrl + 'shared/config/supabase.json';
      configPromise = fetch(configUrl)
        .then(function (res) { return res.ok ? res.json() : null; })
        .catch(function () { return null; });
    }

    return configPromise.then(function (config) {
      state.config = config || { enabled: false };

      if (!state.config || !state.config.enabled) {
        state.enabled = false;
        state.initialized = true;
        return api;
      }

      if (!state.config.url || !state.config.anonKey) {
        console.warn('COSYauth: enabled is true in supabase.json, but url or anonKey is empty. Auth is disabled.');
        state.enabled = false;
        state.initialized = true;
        return api;
      }

      state.enabled = true;

      var setupClient = function () {
        if (options.client) {
          state.client = options.client;
        } else if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
          state.client = window.supabase.createClient(state.config.url, state.config.anonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              flowType: 'pkce',
              storageKey: state.config.storageKey || 'cosy-auth'
            }
          });
        }

        if (!state.client) {
          state.initialized = true;
          return api;
        }

        // Set up auth listener
        if (state.client.auth && state.client.auth.onAuthStateChange) {
          state.client.auth.onAuthStateChange(function (event, session) {
            state.session = session;
            if (session) {
              fetchAccess(function () {
                notifyChange();
                renderAccountChips();
              });
            } else {
              state.access = null;
              notifyChange();
              renderAccountChips();
            }
          });
        }

        // Get initial session
        var sessionPromise;
        if (state.client.auth && state.client.auth.getSession) {
          sessionPromise = state.client.auth.getSession();
        } else {
          sessionPromise = Promise.resolve({ data: { session: null } });
        }

        return sessionPromise.then(function (res) {
          state.session = (res && res.data && res.data.session) ? res.data.session : null;
          state.initialized = true;

          if (state.session) {
            return new Promise(function (resolve) {
              fetchAccess(function () {
                notifyChange();
                renderAccountChips();
                resolve(api);
              });
            });
          } else {
            notifyChange();
            renderAccountChips();
            return api;
          }
        });
      };

      if (options.client || (typeof window !== 'undefined' && window.supabase)) {
        return setupClient();
      } else {
        return new Promise(function (resolve) {
          var vendorJsUrl = state.baseUrl + 'shared/vendor/supabase.js';
          loadScript(vendorJsUrl, function () {
            setupClient().then(resolve);
          });
        });
      }
    });
  }

  function ensureEcosystemScriptsLoaded() {
    if (typeof document === 'undefined') return;
    var baseUrl = getScriptBaseUrl();
    if (!window.AuthSSO && !document.querySelector('script[src*="auth-sso.js"]')) {
      var sso = document.createElement('script');
      sso.src = baseUrl + 'shared/js/auth-sso.js';
      sso.defer = true;
      document.head.appendChild(sso);
    }
    if (!window.CMSEditor && !document.querySelector('script[src*="cms-editor.js"]')) {
      var cms = document.createElement('script');
      cms.src = baseUrl + 'shared/js/cms-editor.js';
      cms.defer = true;
      document.head.appendChild(cms);
    }
  }

  function autoInit() {
    ensureEcosystemScriptsLoaded();
    init().catch(function () {});
  }

  function getSession() {
    return state.session;
  }

  function signInWithEmail(email) {
    if (!state.enabled || !state.client) {
      return Promise.reject(new Error('Auth is disabled'));
    }
    var currentOrigin = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
    var currentPath = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
    var dir = currentPath.replace(/[^/]*$/, '');
    var redirectUrl = currentOrigin + dir + 'login.html';

    if (typeof window !== 'undefined' && window.location && window.location.search) {
      var params = new URLSearchParams(window.location.search);
      var next = params.get('next');
      if (next) {
        redirectUrl += '?next=' + encodeURIComponent(next);
      }
    }

    return state.client.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
  }

  function verifyCode(email, code) {
    if (!state.enabled || !state.client) {
      return Promise.reject(new Error('Auth is disabled'));
    }
    return state.client.auth.verifyOtp({
      email: email,
      token: code,
      type: 'email'
    }).then(function (res) {
      if (res.error && res.error.message && res.error.message.indexOf('Token') !== -1) {
        // Try magiclink type as fallback if email type is rejected by server
        return state.client.auth.verifyOtp({
          email: email,
          token: code,
          type: 'magiclink'
        });
      }
      return res;
    });
  }

  function signOut(options) {
    if (!state.enabled || !state.client) {
      return Promise.resolve();
    }
    return state.client.auth.signOut(options).then(function () {
      state.session = null;
      state.access = null;
      notifyChange();
      renderAccountChips();
    });
  }

  function signOutGlobal() {
    return signOut({ scope: 'global' });
  }

  function getAccess() {
    return state.access;
  }

  function role() {
    if (!state.session) return null;
    if (state.access && state.access.role) {
      return state.access.role;
    }
    return 'student';
  }

  function languages() {
    if (!state.access) return [];
    var langs = [];

    if (Array.isArray(state.access.teaches)) {
      for (var i = 0; i < state.access.teaches.length; i++) {
        var tLang = state.access.teaches[i];
        if (langs.indexOf(tLang) === -1) langs.push(tLang);
      }
    }

    if (Array.isArray(state.access.grants)) {
      for (var j = 0; j < state.access.grants.length; j++) {
        var g = state.access.grants[j];
        if (g && g.language && langs.indexOf(g.language) === -1) {
          langs.push(g.language);
        }
      }
    }

    return langs;
  }

  function levelsFor(language) {
    if (!state.access || !Array.isArray(state.access.grants)) return [];
    var levels = [];
    for (var i = 0; i < state.access.grants.length; i++) {
      var g = state.access.grants[i];
      if (g && g.language === language && g.level) {
        if (levels.indexOf(g.level) === -1) {
          levels.push(g.level);
        }
      }
    }
    return levels;
  }

  function onChange(cb) {
    if (typeof cb === 'function') {
      state.listeners.push(cb);
    }
  }

  function getPageLang() {
    if (typeof window !== 'undefined' && window.CosyLang && window.CosyLang.detectPageLang) {
      return window.CosyLang.detectPageLang(window.location.pathname);
    }
    return 'en';
  }

  function renderAccountChips() {
    if (!state.enabled || typeof document === 'undefined') return;

    injectAuthCss();

    var targets = document.querySelectorAll('[data-cosy-account]');
    if (targets.length === 0) return;

    var pageLang = getPageLang();
    var signedIn = !!state.session;
    var userEmail = state.session && state.session.user ? state.session.user.email : '';
    var userDisplayName = (state.access && state.access.display_name) || userEmail;

    var userRole = role();
    var roleLabel = getTranslation('role_student', pageLang);
    if (userRole === 'teacher') roleLabel = getTranslation('role_teacher', pageLang);
    if (userRole === 'founder') roleLabel = getTranslation('role_founder', pageLang);

    targets.forEach(function (container) {
      container.textContent = ''; // clear

      if (!signedIn) {
        var loginUrl = state.baseUrl + 'login.html';
        if (typeof window !== 'undefined' && window.location) {
          var relPath = window.location.pathname;
          var idx = relPath.indexOf('/COSYevents/');
          if (idx !== -1) relPath = relPath.substring(idx + '/COSYevents/'.length);
          if (relPath.charAt(0) === '/') relPath = relPath.substring(1);
          if (relPath && relPath !== 'login.html') {
            loginUrl += '?next=' + encodeURIComponent(relPath);
          }
        }

        var loginBtn = document.createElement('a');
        loginBtn.className = 'cosy-account-login-btn';
        loginBtn.href = loginUrl;
        loginBtn.textContent = '👤 ' + getTranslation('login', pageLang);
        container.appendChild(loginBtn);
      } else {
        var accountUrl = state.baseUrl + 'account.html';

        var wrapper = document.createElement('div');
        wrapper.className = 'cosy-account-chip-wrapper';

        var chipBtn = document.createElement('button');
        chipBtn.type = 'button';
        chipBtn.className = 'cosy-account-chip-btn';
        chipBtn.setAttribute('aria-expanded', 'false');
        chipBtn.setAttribute('aria-haspopup', 'true');

        chipBtn.appendChild(document.createTextNode('👤 '));
        var nameSpan = document.createElement('span');
        nameSpan.className = 'cosy-chip-name';
        nameSpan.textContent = userDisplayName;
        chipBtn.appendChild(nameSpan);
        chipBtn.appendChild(document.createTextNode(' ▾'));

        var menu = document.createElement('div');
        menu.className = 'cosy-account-menu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('hidden', '');

        var menuHeader = document.createElement('div');
        menuHeader.className = 'cosy-account-menu-header';
        menuHeader.textContent = roleLabel;

        var accessLink = document.createElement('a');
        accessLink.href = accountUrl;
        accessLink.className = 'cosy-account-menu-item';
        accessLink.setAttribute('role', 'menuitem');
        accessLink.textContent = '📜 ' + getTranslation('my_access', pageLang);

        var logoutBtn = document.createElement('button');
        logoutBtn.type = 'button';
        logoutBtn.className = 'cosy-account-logout-btn';
        logoutBtn.setAttribute('role', 'menuitem');
        logoutBtn.textContent = '🚪 ' + getTranslation('logout', pageLang);

        menu.appendChild(menuHeader);
        menu.appendChild(accessLink);
        menu.appendChild(logoutBtn);

        wrapper.appendChild(chipBtn);
        wrapper.appendChild(menu);

        container.appendChild(wrapper);

        var toggleMenu = function (show) {
          var open = (typeof show === 'boolean') ? show : menu.hasAttribute('hidden');
          if (open) {
            menu.removeAttribute('hidden');
            chipBtn.setAttribute('aria-expanded', 'true');
          } else {
            menu.setAttribute('hidden', '');
            chipBtn.setAttribute('aria-expanded', 'false');
          }
        };

        chipBtn.addEventListener('click', function (e) {
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
            chipBtn.focus();
          }
        });

        logoutBtn.addEventListener('click', function () {
          signOut();
        });
      }
    });
  }

  var api = {
    DICTIONARY: DICTIONARY,
    escapeHtml: escapeHtml,
    init: init,
    autoInit: autoInit,
    getSession: getSession,
    signInWithEmail: signInWithEmail,
    verifyCode: verifyCode,
    signOut: signOut,
    signOutGlobal: signOutGlobal,
    getAccess: getAccess,
    role: role,
    languages: languages,
    levelsFor: levelsFor,
    onChange: onChange,
    validateNextParam: validateNextParam,
    getTranslation: getTranslation,
    renderAccountChips: renderAccountChips,
    _state: state
  };

  return api;
}));
