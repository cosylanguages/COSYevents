/**
 * COSYevents Client-Side Calendar Module
 * Handles event loading, monthly calendar grid rendering, filtering,
 * timezone conversion, upcoming events list, and modal details.
 */

(function () {
  'use strict';

  let allEvents = [];
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedType = 'all';
  let selectedLanguage = 'all';
  let userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

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
    // Relative path for root and nested pages fallback
    const jsonPath = window.location.pathname.includes('/speaking-clubs/') ||
                     window.location.pathname.includes('/cinema-nights/') ||
                     window.location.pathname.includes('/teacher-led-sessions/') ||
                     window.location.pathname.includes('/special-events/') ||
                     window.location.pathname.includes('/past-events/')
                     ? '../shared/calendar-data/events.json'
                     : 'shared/calendar-data/events.json';

    fetch(jsonPath)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load events data');
        return response.json();
      })
      .then(data => {
        allEvents = data;
        // Default view to May 2025 for demonstration if events exist
        if (allEvents.length > 0) {
          const sampleDate = new Date(allEvents[0].date);
          currentMonth = sampleDate.getMonth();
          currentYear = sampleDate.getFullYear();
        }
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
        const marker = document.createElement('a');
        marker.className = `event-marker badge-${evt.type}`;
        marker.textContent = `${evt.time} ${evt.title}`;
        marker.href = '#';
        marker.addEventListener('click', function (e) {
          e.preventDefault();
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

    const upcoming = events
      .filter(evt => evt.date >= '2025-01-01')
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 10);

    if (upcoming.length === 0) {
      listElem.innerHTML = '<p class="no-events-msg">No upcoming events match your filter criteria.</p>';
      return;
    }

    upcoming.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'event-card-item';

      const typeLabel = formatTypeLabel(evt.type);
      const convertedTime = convertTime(evt.date, evt.time, evt.timezone, userTimezone);

      let conversionBannerHtml = '';
      if (evt.conversionStatus === 'converted') {
        const linkUrl = evt.convertedLessonUrl || '#';
        conversionBannerHtml = `<div class="conversion-banner converted" style="background:#fff8e7; border:1px solid #945e05; border-radius:8px; padding:0.5rem 0.75rem; margin:0.5rem 0; font-size:0.85rem; color:#7d4d03; font-weight:600;">This session became a full COSYplatform lesson &rarr; <a href="${linkUrl}" target="_blank" rel="noopener" style="color:#7d4d03; text-decoration:underline; font-weight:700;">${linkUrl}</a></div>`;
      } else if (evt.conversionStatus === 'planned') {
        conversionBannerHtml = `<div class="conversion-banner planned" style="background:#fff8e7; border:1px solid #945e05; border-radius:8px; padding:0.5rem 0.75rem; margin:0.5rem 0; font-size:0.85rem; color:#7d4d03; font-weight:600;">This topic is scheduled to become a lesson soon.</div>`;
      }

      card.innerHTML = `
        <div class="event-meta-header">
          <span class="type-pill badge-${evt.type}">${typeLabel}</span>
          <div class="lang-level-pills">
            <span class="pill-sm">${evt.language}</span>
            ${evt.level ? `<span class="pill-sm">${evt.level}</span>` : ''}
          </div>
        </div>
        <h3 class="event-card-title">${evt.title}</h3>
        ${conversionBannerHtml}
        <div class="event-datetime-info">
          <span>📅 ${evt.date}</span>
          <span>⏰ ${evt.time} ${evt.timezone} (${convertedTime} ${userTimezone})</span>
        </div>
        <div class="event-host-info">🎙️ Host: <strong>${evt.host}</strong></div>
        <p class="event-card-desc">${evt.description}</p>
        <div class="event-card-actions">
          <a href="${evt.registration_link}" target="_blank" rel="noopener" class="btn-primary">
            Join via Hub
          </a>
          <button class="btn-outline view-details-btn" data-id="${evt.id}">
            Details
          </button>
        </div>
      `;

      const detailsBtn = card.querySelector('.view-details-btn');
      detailsBtn.addEventListener('click', function () {
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

    title.textContent = evt.title;
    meta.innerHTML = `
      <span class="type-pill badge-${evt.type}">${formatTypeLabel(evt.type)}</span>
      <span class="pill-sm">${evt.language}</span>
      ${evt.level ? `<span class="pill-sm">${evt.level}</span>` : ''}
    `;

    desc.textContent = evt.description;

    let bannerElem = overlay.querySelector('.ce-modal-conversion-banner');
    if (!bannerElem) {
      bannerElem = document.createElement('div');
      bannerElem.className = 'ce-modal-conversion-banner';
      bannerElem.style.cssText = 'background:#fff8e7; border:1px solid #945e05; border-radius:8px; padding:0.6rem 0.8rem; margin:0.75rem 0; font-size:0.88rem; color:#7d4d03; font-weight:600;';
      desc.parentNode.insertBefore(bannerElem, desc.nextSibling);
    }

    if (evt.conversionStatus === 'converted') {
      const linkUrl = evt.convertedLessonUrl || '#';
      bannerElem.innerHTML = `This session became a full COSYplatform lesson &rarr; <a href="${linkUrl}" target="_blank" rel="noopener" style="color:#7d4d03; text-decoration:underline; font-weight:700;">${linkUrl}</a>`;
      bannerElem.style.display = 'block';
    } else if (evt.conversionStatus === 'planned') {
      bannerElem.textContent = 'This topic is scheduled to become a lesson soon.';
      bannerElem.style.display = 'block';
    } else {
      bannerElem.style.display = 'none';
    }

    host.innerHTML = `<strong>${evt.host}</strong> — ${evt.host_bio || 'COSYlanguages Facilitator'}`;

    const convertedTime = convertTime(evt.date, evt.time, evt.timezone, userTimezone);
    timeBox.innerHTML = `
      <div>
        <strong>Original Time:</strong> ${evt.date} @ ${evt.time} ${evt.timezone}
      </div>
      <div>
        <strong>Your Local Time:</strong> ${convertedTime} (${userTimezone})
      </div>
    `;

    regBtn.href = evt.registration_link;

    const gCalUrl = generateGoogleCalendarUrl(evt);
    gcalBtn.href = gCalUrl;

    overlay.classList.add('active');
  }

  function setupModalListeners() {
    const overlay = document.getElementById('event-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');

    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', function () {
        overlay.classList.remove('active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    }
  }

  function convertTime(dateStr, timeStr, fromTz, toTz) {
    if (!dateStr || !timeStr) return '';
    try {
      // Parse ISO date and time in CET (UTC+1 offset)
      const isoString = `${dateStr}T${timeStr}:00+01:00`;
      const dateObj = new Date(isoString);
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: toTz });
    } catch (e) {
      return timeStr;
    }
  }

  function generateGoogleCalendarUrl(evt) {
    const startIso = evt.date.replace(/-/g, '') + 'T' + evt.time.replace(':', '') + '00Z';
    const endIso = evt.date.replace(/-/g, '') + 'T' + (parseInt(evt.time.split(':')[0]) + 1) + evt.time.split(':')[1] + '00Z';
    const title = encodeURIComponent(evt.title);
    const details = encodeURIComponent(evt.description + '\n\nJoin via: ' + evt.registration_link);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}`;
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
