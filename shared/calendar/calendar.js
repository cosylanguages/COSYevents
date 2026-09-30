/**
 * COSYevents Client-Side Calendar Module
 * Handles event loading, monthly calendar grid rendering, filtering,
 * timezone conversion, upcoming events list, and modal details.
 */

(function () {
  'use strict';

  // Capture script URL at execution time to resolve relative resources robustly
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  document.addEventListener('DOMContentLoaded', initCalendar);

  function initCalendar() {
    setupFilterListeners();
    setupNavListeners();
    setupModalListeners();
    fetchEvents();
  }

  function fetchEvents() {
    // Derive events.json location relative to currentScriptUrl
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
    if (titleElem) {
      titleElem.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
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

        const textContent = `${evt.time} ${evt.title}`;
        marker.textContent = textContent;

        const ariaLabelText = `${evt.time} ${evt.host || ''} - ${evt.title}, ${evt.language || ''} ${evt.level || ''}`.trim();
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
            No upcoming events match your filters. Check the Past Events archive.
          </p>
          <a href="${escapeAttribute(pastEventsUrl)}" class="btn-outline">
            View Past Events Archive →
          </a>
        </div>
      `;
      return;
    }

    upcoming.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'event-card-item';

      const typeLabel = formatTypeLabel(evt.type);

      const utcDate = parseParisDateTime(evt.date, evt.time);
      const parisLabel = getParisZoneLabel(utcDate);
      const convertedTime = formatInTimezone(utcDate, userTimezone);

      let conversionBannerHtml = '';
      if (evt.conversionStatus === 'converted') {
        const linkUrl = sanitizeUrl(evt.convertedLessonUrl);
        if (linkUrl !== '#') {
          conversionBannerHtml = `
            <div class="conversion-banner converted">
              This session became a full lesson on COSYplatform <a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener">View the lesson -&gt;</a>
            </div>
          `;
        } else {
          conversionBannerHtml = `
            <div class="conversion-banner converted">
              This session became a full lesson on COSYplatform.
            </div>
          `;
        }
      } else if (evt.conversionStatus === 'planned') {
        conversionBannerHtml = `
          <div class="conversion-banner planned">
            This topic is scheduled to become a lesson soon.
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
      const capacityPill = `<span class="seat-pill ${seatClass}">${capacityDot} ${seats}/${capacity} seats left</span>`;

      const regUrl = sanitizeUrl(evt.registration_link);
      const regButtonHtml = regUrl !== '#' ? `
        <a href="${escapeAttribute(regUrl)}" target="_blank" rel="noopener" class="btn-primary">
          Join via Hub
        </a>
      ` : '';

      card.innerHTML = `
        <div class="event-meta-header">
          <span class="type-pill badge-${escapeAttribute(evt.type)}">${escapeHtml(typeLabel)}</span>
          <div class="lang-level-pills" style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
            <span class="pill-sm">${escapeHtml(evt.language || '')}</span>
            ${evt.level ? `<span class="pill-sm">${escapeHtml(evt.level)}</span>` : ''}
            ${capacityPill}
          </div>
        </div>
        <h3 class="event-card-title">${escapeHtml(evt.title || '')}</h3>
        ${conversionBannerHtml}
        <div class="event-datetime-info">
          <span>📅 ${escapeHtml(evt.date || '')}</span>
          <span>⏰ ${escapeHtml(evt.time || '')} ${escapeHtml(parisLabel)} (${escapeHtml(convertedTime)} ${escapeHtml(userTimezone)})</span>
        </div>
        <div class="event-host-info">🎙️ Host: <strong>${escapeHtml(evt.host || '')}</strong></div>
        <p class="event-card-desc">${escapeHtml(evt.description || '')}</p>
        <div class="event-card-actions">
          ${regButtonHtml}
          <button type="button" class="btn-outline view-details-btn" data-id="${escapeAttribute(evt.id)}">
            Details
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

    if (!overlay) return;

    if (title) title.textContent = evt.title || '';
    if (meta) {
      meta.innerHTML = `
        <span class="type-pill badge-${escapeAttribute(evt.type)}">${escapeHtml(formatTypeLabel(evt.type))}</span>
        <span class="pill-sm">${escapeHtml(evt.language || '')}</span>
        ${evt.level ? `<span class="pill-sm">${escapeHtml(evt.level)}</span>` : ''}
      `;
    }

    if (desc) desc.textContent = evt.description || '';

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
          bannerElem.innerHTML = `This session became a full lesson on COSYplatform <a href="${escapeAttribute(linkUrl)}" target="_blank" rel="noopener">View the lesson -&gt;</a>`;
        } else {
          bannerElem.textContent = 'This session became a full lesson on COSYplatform.';
        }
        bannerElem.style.display = 'block';
      } else if (evt.conversionStatus === 'planned') {
        bannerElem.textContent = 'This topic is scheduled to become a lesson soon.';
        bannerElem.style.display = 'block';
      } else {
        bannerElem.style.display = 'none';
      }
    }

    if (host) {
      host.innerHTML = `<strong>${escapeHtml(evt.host || '')}</strong> — ${escapeHtml(evt.host_bio || 'COSYlanguages Facilitator')}`;
    }

    const utcDate = parseParisDateTime(evt.date, evt.time);
    const parisLabel = getParisZoneLabel(utcDate);
    const convertedTime = formatInTimezone(utcDate, userTimezone);

    if (timeBox) {
      timeBox.innerHTML = `
        <div>
          <strong>Paris time:</strong> ${escapeHtml(evt.date || '')} @ ${escapeHtml(evt.time || '')} ${escapeHtml(parisLabel)}
        </div>
        <div>
          <strong>Your Local Time:</strong> ${escapeHtml(convertedTime)} (${escapeHtml(userTimezone)})
        </div>
      `;
    }

    const regUrl = sanitizeUrl(evt.registration_link);
    if (regBtn) {
      if (regUrl !== '#') {
        regBtn.href = regUrl;
        regBtn.style.display = 'inline-flex';
      } else {
        regBtn.style.display = 'none';
      }
    }

    const gCalUrl = generateGoogleCalendarUrl(evt);
    if (gcalBtn) {
      gcalBtn.href = gCalUrl;
    }

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    // Move focus into the modal for accessibility
    const closeBtn = document.getElementById('modal-close-btn');
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

    // Keyboard navigation (Escape & Focus trapping)
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

  /**
   * Converts dateStr ("YYYY-MM-DD") and timeStr ("HH:MM") in Europe/Paris wall-clock time
   * to a real UTC Date object, handling CET/CEST daylight saving transitions accurately.
   */
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
      // Fallback if Europe/Paris timezone is unsupported
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
    if (!utcDate) return 'Paris time';
    try {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Paris',
        timeZoneName: 'short'
      });
      const parts = dtf.formatToParts(utcDate);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : 'Paris time';
    } catch (e) {
      return 'Paris time';
    }
  }

  function formatInTimezone(utcDate, targetTz) {
    if (!utcDate) return '';
    try {
      return utcDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: targetTz });
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

    const title = encodeURIComponent(evt.title || 'COSYevents Session');
    const regUrl = sanitizeUrl(evt.registration_link);
    const regNote = regUrl !== '#' ? `\n\nJoin via: ${regUrl}` : '';
    const details = encodeURIComponent((evt.description || '') + regNote);

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
      case 'speaking-club': return 'Speaking Club';
      case 'cinema-night': return 'Cinema Night';
      case 'teacher-session': return 'Teacher Session';
      case 'special-event': return 'Special Event';
      default: return 'Event';
    }
  }

  function formatDateISO(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

})();
