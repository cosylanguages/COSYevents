/**
 * COSYevents Client-Side Calendar Module
 * Handles event loading, monthly calendar grid rendering, filtering,
 * timezone conversion, upcoming events list, and modal details.
 */

/*
 * Per-event i18n override shape:
 * {
 *   "title": "English Title",
 *   "description": "English Description",
 *   "i18n": {
 *     "fr": { "title": "Titre en français", "description": "Description en français", "host_bio": "Bio en français" },
 *     "ru": { "title": "Название на русском", "description": "Описание на русском", "host_bio": "Био на русском" }
 *   }
 * }
 */

(function () {
  'use strict';

  const currentScriptUrl = (document.currentScript && document.currentScript.src)
    ? document.currentScript.src
    : window.location.href;

  let allEvents = [];
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedType = 'all';
  let selectedLanguage = 'all';
  let userTimezone = 'UTC';
  try {
    userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    userTimezone = 'UTC';
  }

  let lastActiveElement = null;

  const LANG_NAME_TO_CODE = {
    'English': 'en',
    'French': 'fr',
    'Italian': 'it',
    'Russian': 'ru',
    'Greek': 'el',
    'Spanish': 'es',
    'German': 'de',
    'Portuguese': 'pt',
    'Japanese': 'ja',
    'Chinese': 'zh',
    'Korean': 'ko',
    'Arabic': 'ar',
    'Dutch': 'nl',
    'Polish': 'pl',
    'Turkish': 'tr'
  };

  function getPageLang() {
    const htmlLang = document.documentElement.lang || 'en';
    const clean = htmlLang.trim().toLowerCase().substring(0, 2);
    return clean || 'en';
  }

  function t(key, vars) {
    const lang = getPageLang();
    let str = null;
    if (window.COSY_CAL_I18N) {
      if (window.COSY_CAL_I18N[lang] && window.COSY_CAL_I18N[lang][key]) {
        str = window.COSY_CAL_I18N[lang][key];
      } else if (window.COSY_CAL_I18N.en && window.COSY_CAL_I18N.en[key]) {
        str = window.COSY_CAL_I18N.en[key];
      }
    }
    if (!str) str = key;
    if (vars && typeof vars === 'object') {
      for (const v in vars) {
        if (vars.hasOwnProperty(v)) {
          str = str.replace(new RegExp('\\{' + v + '\\}', 'g'), vars[v]);
        }
      }
    }
    return str;
  }

  function getEventField(evt, fieldName) {
    const pageLang = getPageLang();
    if (evt && evt.i18n && evt.i18n[pageLang] && evt.i18n[pageLang][fieldName]) {
      return evt.i18n[pageLang][fieldName];
    }
    return evt ? evt[fieldName] : '';
  }

  function formatEventLanguage(langStr) {
    if (!langStr) return '';
    const pageLang = getPageLang();
    const code = LANG_NAME_TO_CODE[langStr];
    if (!code) return langStr;
    try {
      if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
        const dn = new Intl.DisplayNames([pageLang], { type: 'language' });
        const name = dn.of(code);
        if (name) {
          return name.charAt(0).toUpperCase() + name.slice(1);
        }
      }
    } catch (e) {}
    return langStr;
  }

  document.addEventListener('DOMContentLoaded', initCalendar);

  function initCalendar() {
    setupFilterListeners();
    setupNavListeners();
    setupModalListeners();
    fetchEvents();
  }

  function fetchEvents() {
    let jsonUrl;
    try {
      jsonUrl = new URL('../calendar-data/events.json', currentScriptUrl).href;
    } catch (e) {
      jsonUrl = 'shared/calendar-data/events.json';
    }

    fetch(jsonUrl)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load events data');
        return response.json();
      })
      .then(data => {
        allEvents = data || [];
        const now = new Date();
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();
        render();
      })
      .catch(err => {
        console.error('Error fetching calendar events:', err);
      });
  }

  function render() {
    const filtered = filterEventsList(allEvents);
    renderMonthTitle();
    renderWeekdayHeader();
    renderGrid(filtered);
    renderUpcomingList(filtered);
  }

  function filterEventsList(events) {
    return events.filter(evt => {
      const matchType = (selectedType === 'all') || (evt.type === selectedType);
      const matchLang = (selectedLanguage === 'all') || (evt.language === selectedLanguage);
      return matchType && matchLang;
    });
  }

  function setupFilterListeners() {
    const typeButtons = document.querySelectorAll('.type-filters .filter-btn');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        typeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedType = this.getAttribute('data-type') || 'all';
        render();
      });
    });

    const langSelect = document.getElementById('language-filter');
    if (langSelect) {
      langSelect.addEventListener('change', function () {
        selectedLanguage = this.value;
        render();
      });
    }
  }

  function setupNavListeners() {
    const prevBtn = document.getElementById('prev-month-btn');
    const nextBtn = document.getElementById('next-month-btn');
    const todayBtn = document.getElementById('today-month-btn');

    if (prevBtn) {
      prevBtn.setAttribute('aria-label', t('prev_month_aria'));
      prevBtn.addEventListener('click', function () {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        render();
      });
    }

    if (nextBtn) {
      nextBtn.setAttribute('aria-label', t('next_month_aria'));
      nextBtn.addEventListener('click', function () {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        render();
      });
    }

    if (todayBtn) {
      todayBtn.setAttribute('aria-label', t('today'));
      todayBtn.textContent = t('today');
      todayBtn.addEventListener('click', function () {
        const now = new Date();
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();
        render();
      });
    }
  }

  function renderMonthTitle() {
    const titleElem = document.getElementById('calendar-month-title');
    if (!titleElem) return;

    const pageLang = getPageLang();
    try {
      const dtf = new Intl.DateTimeFormat(pageLang, { month: 'long', year: 'numeric' });
      const parts = dtf.formatToParts(new Date(currentYear, currentMonth, 1));
      let monthStr = '';
      let yearStr = '';
      for (const p of parts) {
        if (p.type === 'month') monthStr = p.value;
        if (p.type === 'year') yearStr = p.value;
      }
      if (monthStr) {
        monthStr = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
        titleElem.textContent = `${monthStr} ${yearStr}`;
        return;
      }
    } catch (e) {}

    titleElem.textContent = `${currentMonth + 1}/${currentYear}`;
  }

  function renderWeekdayHeader() {
    const weekdaysContainer = document.querySelector('.calendar-weekdays');
    if (!weekdaysContainer) return;

    const pageLang = getPageLang();
    // 2026-06-01 is a Monday
    const mondayBase = new Date(2026, 5, 1);
    const weekdayElems = weekdaysContainer.querySelectorAll('.weekday');

    try {
      const dtf = new Intl.DateTimeFormat(pageLang, { weekday: 'short' });
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const d = new Date(mondayBase.getTime() + dayIdx * 86400000);
        let dayName = dtf.format(d);
        dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('.', '');
        if (weekdayElems[dayIdx]) {
          weekdayElems[dayIdx].textContent = dayName;
        }
      }
    } catch (e) {}
  }

  function renderGrid(events) {
    const gridElem = document.getElementById('calendar-days-grid');
    if (!gridElem) return;

    gridElem.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1);
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
    const today = new Date();

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'day-cell';

      let cellDateObj;
      let cellDayNum;

      if (i < startDayOfWeek) {
        cellDayNum = prevMonthDays - startDayOfWeek + i + 1;
        cell.classList.add('other-month');
        cellDateObj = new Date(currentYear, currentMonth - 1, cellDayNum);
      } else if (i >= startDayOfWeek + daysInMonth) {
        cellDayNum = i - (startDayOfWeek + daysInMonth) + 1;
        cell.classList.add('other-month');
        cellDateObj = new Date(currentYear, currentMonth + 1, cellDayNum);
      } else {
        cellDayNum = i - startDayOfWeek + 1;
        cellDateObj = new Date(currentYear, currentMonth, cellDayNum);

        if (
          cellDateObj.getDate() === today.getDate() &&
          cellDateObj.getMonth() === today.getMonth() &&
          cellDateObj.getFullYear() === today.getFullYear()
        ) {
          cell.classList.add('today');
        }
      }

      const dateStr = formatDateISO(cellDateObj);

      const header = document.createElement('div');
      header.className = 'day-header';
      header.innerHTML = `<span class="day-number">${cellDayNum}</span>`;
      cell.appendChild(header);

      const markersList = document.createElement('div');
      markersList.className = 'event-markers-list';

      const dayEvents = events.filter(evt => evt.date === dateStr);
      dayEvents.forEach(evt => {
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = `event-marker badge-${evt.type}`;

        const titleText = getEventField(evt, 'title');
        const textContent = `${evt.time} ${titleText}`;
        marker.textContent = textContent;

        const langText = formatEventLanguage(evt.language || '');
        const ariaLabelText = `${evt.time} ${evt.host || ''} - ${titleText}, ${langText} ${evt.level || ''}`.trim();
        marker.setAttribute('aria-label', ariaLabelText);
        marker.setAttribute('title', textContent);

        marker.addEventListener('click', function (e) {
          e.preventDefault();
          lastActiveElement = marker;
          openEventModal(evt.id);
        });
        markersList.appendChild(marker);
      });

      cell.appendChild(markersList);
      gridElem.appendChild(cell);
    }
  }

  function renderUpcomingList(events) {
    const listElem = document.getElementById('upcoming-events-list');
    if (!listElem) return;

    listElem.innerHTML = '';

    const now = new Date();
    const todayISO = formatDateISO(now);
    const nowTimeISO = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const upcoming = events
      .filter(evt => {
        const evtDateUtc = parseParisDateTime(evt.date, evt.time);
        if (evtDateUtc) {
          return evtDateUtc >= now;
        }
        if (evt.date > todayISO) return true;
        if (evt.date === todayISO) return evt.time >= nowTimeISO;
        return false;
      })
      .sort((a, b) => {
        const dtA = parseParisDateTime(a.date, a.time);
        const dtB = parseParisDateTime(b.date, b.time);
        if (dtA && dtB) return dtA - dtB;
        return (a.date + a.time).localeCompare(b.date + b.time);
      })
      .slice(0, 9);

    if (upcoming.length === 0) {
      let pastEventsUrl;
      try {
        pastEventsUrl = new URL('../../past-events/index.html', currentScriptUrl).href;
      } catch (e) {
        pastEventsUrl = 'past-events/index.html';
      }

      listElem.innerHTML = `
        <div class="no-events-container" style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; background: var(--cosy-surface, #ffffff); border-radius: var(--cosy-radius, 16px); border: 1px solid var(--cosy-border, rgba(74, 107, 80, 0.12));">
          <p class="no-events-msg" style="font-size: 1.05rem; color: var(--cosy-text-soft, #4a4a4a); margin-bottom: 1rem;">
            ${escapeHtml(t('no_events_msg'))}
          </p>
          <a href="${escapeAttribute(pastEventsUrl)}" class="btn-outline">
            ${escapeHtml(t('view_past_events'))}
          </a>
        </div>
      `;
      return;
    }

    upcoming.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'event-card-item';

      const typeLabel = formatTypeLabel(evt.type);
      const titleText = getEventField(evt, 'title');
      const descText = getEventField(evt, 'description');

      const utcDate = parseParisDateTime(evt.date, evt.time);
      const parisLabel = getParisZoneLabel(utcDate);
      const convertedTime = formatInTimezone(utcDate, userTimezone);

      let conversionBannerHtml = '';
      if (evt.conversionStatus === 'converted') {
        const linkUrl = sanitizeUrl(evt.convertedLessonUrl);
        if (linkUrl !== '#') {
          const linkHtml = `<a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener">${escapeHtml(t('view_the_lesson'))}</a>`;
          conversionBannerHtml = `
            <div class="conversion-banner converted">
              ${t('conversion_converted_link', { link: linkHtml })}
            </div>
          `;
        } else {
          conversionBannerHtml = `
            <div class="conversion-banner converted">
              ${escapeHtml(t('conversion_converted'))}
            </div>
          `;
        }
      } else if (evt.conversionStatus === 'planned') {
        conversionBannerHtml = `
          <div class="conversion-banner planned">
            ${escapeHtml(t('conversion_planned'))}
          </div>
        `;
      }

      const capacity = evt.max_capacity || 10;
      const seats = evt.available_seats !== undefined ? evt.available_seats : 6;
      let capacityDot = '🟢';
      let seatClass = 'seat-pill-ok';
      if (seats <= 2) {
        capacityDot = '🔥';
        seatClass = 'seat-pill-low';
      } else if (seats <= 4) {
        capacityDot = '🟡';
        seatClass = 'seat-pill-medium';
      }
      const seatsText = t('seats_left', { n: seats, total: capacity });
      const capacityPill = `<span class="seat-pill ${seatClass}">${capacityDot} ${escapeHtml(seatsText)}</span>`;

      const regUrl = sanitizeUrl(evt.registration_link);
      const regButtonHtml = regUrl !== '#' ? `
        <a href="${escapeAttribute(regUrl)}" target="_blank" rel="noopener" class="btn-primary">
          ${escapeHtml(t('join_via_hub'))}
        </a>
      ` : '';

      const localizedLangName = formatEventLanguage(evt.language || '');

      card.innerHTML = `
        <div class="event-meta-header">
          <span class="type-pill badge-${escapeAttribute(evt.type)}">${escapeHtml(typeLabel)}</span>
          <div class="lang-level-pills" style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
            <span class="pill-sm">${escapeHtml(localizedLangName)}</span>
            ${evt.level ? `<span class="pill-sm">${escapeHtml(evt.level)}</span>` : ''}
            ${capacityPill}
          </div>
        </div>
        <h3 class="event-card-title">${escapeHtml(titleText)}</h3>
        ${conversionBannerHtml}
        <div class="event-datetime-info">
          <span>📅 ${escapeHtml(evt.date || '')}</span>
          <span>⏰ ${escapeHtml(evt.time || '')} ${escapeHtml(parisLabel)} (${escapeHtml(convertedTime)} ${escapeHtml(userTimezone)})</span>
        </div>
        <div class="event-host-info">🎙️ ${escapeHtml(t('host_label'))} <strong>${escapeHtml(evt.host || '')}</strong></div>
        <p class="event-card-desc">${escapeHtml(descText)}</p>
        <div class="event-card-actions">
          ${regButtonHtml}
          <button type="button" class="btn-outline view-details-btn" data-id="${escapeAttribute(evt.id)}">
            ${escapeHtml(t('details'))}
          </button>
        </div>
      `;

      const detailsBtn = card.querySelector('.view-details-btn');
      detailsBtn.addEventListener('click', function () {
        lastActiveElement = detailsBtn;
        openEventModal(evt.id);
      });

      listElem.appendChild(card);
    });
  }

  function openEventModal(eventId) {
    const evt = allEvents.find(e => e.id === eventId);
    if (!evt) return;

    const overlay = document.getElementById('event-modal-overlay');
    const title = document.getElementById('modal-event-title');
    const meta = document.getElementById('modal-event-meta');
    const desc = document.getElementById('modal-event-desc');
    const host = document.getElementById('modal-event-host');
    const timeBox = document.getElementById('modal-timezone-box');
    const regBtn = document.getElementById('modal-reg-btn');
    const gcalBtn = document.getElementById('modal-gcal-btn');
    const closeBtn = document.getElementById('modal-close-btn');

    if (!overlay) return;

    if (closeBtn) closeBtn.setAttribute('aria-label', t('close_aria'));

    const titleText = getEventField(evt, 'title');
    const descText = getEventField(evt, 'description');
    const hostBioText = getEventField(evt, 'host_bio') || 'COSYlanguages Facilitator';

    if (title) title.textContent = titleText;
    if (meta) {
      meta.innerHTML = `
        <span class="type-pill badge-${escapeAttribute(evt.type)}">${escapeHtml(formatTypeLabel(evt.type))}</span>
        <span class="pill-sm">${escapeHtml(formatEventLanguage(evt.language || ''))}</span>
        ${evt.level ? `<span class="pill-sm">${escapeHtml(evt.level)}</span>` : ''}
      `;
    }

    if (desc) desc.textContent = descText;

    let bannerElem = overlay.querySelector('.ce-modal-conversion-banner');
    if (!bannerElem && desc && desc.parentNode) {
      bannerElem = document.createElement('div');
      bannerElem.className = 'ce-modal-conversion-banner conversion-banner';
      desc.parentNode.insertBefore(bannerElem, desc.nextSibling);
    }

    if (bannerElem) {
      if (evt.conversionStatus === 'converted') {
        const linkUrl = sanitizeUrl(evt.convertedLessonUrl);
        if (linkUrl !== '#') {
          const linkHtml = `<a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener">${escapeHtml(t('view_the_lesson'))}</a>`;
          bannerElem.innerHTML = t('conversion_converted_link', { link: linkHtml });
        } else {
          bannerElem.textContent = t('conversion_converted');
        }
        bannerElem.style.display = 'block';
      } else if (evt.conversionStatus === 'planned') {
        bannerElem.textContent = t('conversion_planned');
        bannerElem.style.display = 'block';
      } else {
        bannerElem.style.display = 'none';
      }
    }

    if (host) {
      host.innerHTML = `<strong>${escapeHtml(evt.host || '')}</strong> — ${escapeHtml(hostBioText)}`;
    }

    const utcDate = parseParisDateTime(evt.date, evt.time);
    const parisLabel = getParisZoneLabel(utcDate);
    const convertedTime = formatInTimezone(utcDate, userTimezone);

    if (timeBox) {
      timeBox.innerHTML = `
        <div>
          <strong>${escapeHtml(t('paris_time'))}:</strong> ${escapeHtml(evt.date || '')} @ ${escapeHtml(evt.time || '')} ${escapeHtml(parisLabel)}
        </div>
        <div>
          <strong>${escapeHtml(t('your_local_time'))}:</strong> ${escapeHtml(convertedTime)} (${escapeHtml(userTimezone)})
        </div>
      `;
    }

    const regUrl = sanitizeUrl(evt.registration_link);
    if (regBtn) {
      regBtn.textContent = t('modal_register');
      if (regUrl !== '#') {
        regBtn.href = regUrl;
        regBtn.style.display = 'inline-flex';
      } else {
        regBtn.style.display = 'none';
      }
    }

    const gCalUrl = generateGoogleCalendarUrl(evt);
    if (gcalBtn) {
      gcalBtn.textContent = `📅 ${t('modal_gcal')}`;
      gcalBtn.href = gCalUrl;
    }

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeEventModal() {
    const overlay = document.getElementById('event-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
      lastActiveElement = null;
    }
  }

  function setupModalListeners() {
    const overlay = document.getElementById('event-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', closeEventModal);
    }

    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          closeEventModal();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!overlay || !overlay.classList.contains('active')) return;

      if (e.key === 'Escape') {
        closeEventModal();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  function parseParisDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    const targetUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);

    let dtf;
    try {
      dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
      });
    } catch (e) {
      return new Date(Date.UTC(year, month - 1, day, hour - 1, minute, 0));
    }

    function getParts(d) {
      const parts = dtf.formatToParts(d);
      const m = {};
      for (const p of parts) {
        if (p.type !== 'literal') m[p.type] = parseInt(p.value, 10);
      }
      if (m.hour === 24) m.hour = 0;
      return m;
    }

    const p1 = getParts(new Date(targetUtcMs));
    const parisMs1 = Date.UTC(p1.year, p1.month - 1, p1.day, p1.hour, p1.minute, p1.second || 0);
    const offsetMs = parisMs1 - targetUtcMs;

    let utcMs = targetUtcMs - offsetMs;
    let res = new Date(utcMs);

    const p2 = getParts(res);
    const parisMs2 = Date.UTC(p2.year, p2.month - 1, p2.day, p2.hour, p2.minute, p2.second || 0);
    if (parisMs2 !== targetUtcMs) {
      utcMs -= (parisMs2 - targetUtcMs);
      res = new Date(utcMs);
    }

    return res;
  }

  function getParisZoneLabel(utcDate) {
    const pageLang = getPageLang();
    const fallbackLabel = t('paris_time');
    if (!utcDate) return fallbackLabel;
    try {
      const dtf = new Intl.DateTimeFormat(pageLang, {
        timeZone: 'Europe/Paris',
        timeZoneName: 'short'
      });
      const parts = dtf.formatToParts(utcDate);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : fallbackLabel;
    } catch (e) {
      return fallbackLabel;
    }
  }

  function formatInTimezone(utcDate, targetTz) {
    if (!utcDate) return '';
    const pageLang = getPageLang();
    try {
      return utcDate.toLocaleTimeString([pageLang], { hour: '2-digit', minute: '2-digit', timeZone: targetTz });
    } catch (e) {
      return utcDate.toUTCString();
    }
  }

  function generateGoogleCalendarUrl(evt) {
    const startUtc = parseParisDateTime(evt.date, evt.time);
    if (!startUtc) return '#';

    const durationMin = evt.duration_minutes ? parseInt(evt.duration_minutes, 10) : 60;
    const endUtc = new Date(startUtc.getTime() + durationMin * 60 * 1000);

    function formatUtcISO(d) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const h = String(d.getUTCHours()).padStart(2, '0');
      const min = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      return `${y}${m}${day}T${h}${min}${s}Z`;
    }

    const startIso = formatUtcISO(startUtc);
    const endIso = formatUtcISO(endUtc);

    const titleText = getEventField(evt, 'title') || 'COSYevents Session';
    const title = encodeURIComponent(titleText);
    const regUrl = sanitizeUrl(evt.registration_link);
    const regNote = regUrl !== '#' ? `\n\nJoin via: ${regUrl}` : '';
    const descText = getEventField(evt, 'description') || '';
    const details = encodeURIComponent(descText + regNote);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}`;
  }

  function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return '#';
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(str) {
    return escapeHtml(str);
  }

  function formatTypeLabel(type) {
    switch (type) {
      case 'speaking-club': return t('type_speaking_club');
      case 'cinema-night': return t('type_cinema_night');
      case 'teacher-session': return t('type_teacher_session');
      case 'special-event': return t('type_special_event');
      case 'karaoke': return t('type_karaoke');
      case 'game-evening': return t('type_game_evening');
      case 'long-read': return t('type_long_read');
      default: return t('type_event');
    }
  }

  function formatDateISO(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

})();
