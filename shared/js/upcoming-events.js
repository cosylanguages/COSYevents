(function () {
  'use strict';

  const containers = document.querySelectorAll('[data-upcoming-events]');
  if (containers.length === 0) return;

  const scriptUrl = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : window.location.href;
  const eventsUrl = new URL('../calendar-data/events.json', scriptUrl);

  containers.forEach(container => {
    container.replaceChildren();
    container.hidden = true;
  });

  fetch(eventsUrl)
    .then(response => {
      if (!response.ok) throw new Error('Unable to load event schedule');
      return response.json();
    })
    .then(events => containers.forEach(container => renderEvents(container, events)))
    .catch(() => containers.forEach(container => {
      renderMessage(container, 'The schedule is unavailable right now.');
    }));

  function renderEvents(container, events) {
    const now = new Date();
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    const upcoming = events
      .filter(event => event.type === container.dataset.eventType && event.date >= today)
      .sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`))
      .slice(0, 6);

    if (upcoming.length === 0) {
      renderMessage(container, 'No upcoming sessions are scheduled in this category.');
      return;
    }

    upcoming.forEach(event => container.append(createEventCard(event)));
    container.hidden = false;
  }

  function createEventCard(event) {
    const card = document.createElement('article');
    card.className = 'event-card-item';

    const meta = document.createElement('div');
    meta.className = 'event-meta-header';
    const type = document.createElement('span');
    type.className = `type-pill badge-${event.type}`;
    type.textContent = event.type.replace(/-/g, ' ');
    meta.append(type);

    const badges = document.createElement('div');
    badges.className = 'lang-level-pills';
    [event.language, event.level].filter(Boolean).forEach(value => {
      const badge = document.createElement('span');
      badge.className = 'pill-sm';
      badge.textContent = value;
      badges.append(badge);
    });
    meta.append(badges);
    card.append(meta);

    const title = document.createElement('h3');
    title.className = 'event-card-title';
    title.textContent = event.title;
    card.append(title);

    const date = document.createElement('div');
    date.className = 'event-datetime-info';
    const eventDate = new Date(`${event.date}T12:00:00`);
    const dateLabel = new Intl.DateTimeFormat(document.documentElement.lang || 'en', {
      year: 'numeric', month: 'short', day: 'numeric'
    }).format(eventDate);
    date.textContent = `📅 ${dateLabel}${event.time ? ` · ${event.time} ${event.timezone || ''}` : ''}`;
    card.append(date);

    if (event.host) {
      const host = document.createElement('div');
      host.className = 'event-host-info';
      host.textContent = `Host: ${event.host}`;
      card.append(host);
    }

    if (event.description) {
      const description = document.createElement('p');
      description.className = 'event-card-desc';
      description.textContent = event.description;
      card.append(description);
    }

    const actions = document.createElement('div');
    actions.className = 'event-card-actions';
    appendLink(actions, event.registration_link, 'Register', 'btn-primary');
    appendLink(actions, event.materials, 'Session materials', 'btn-outline');
    if (actions.childElementCount > 0) card.append(actions);
    return card;
  }

  function appendLink(container, value, label, className) {
    if (!value) return;
    let url;
    try {
      url = new URL(value, window.location.href);
    } catch {
      return;
    }
    if (url.protocol !== 'https:' && url.origin !== window.location.origin) return;

    const link = document.createElement('a');
    link.href = url.href;
    link.className = className;
    link.textContent = label;
    if (url.origin !== window.location.origin) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
    container.append(link);
  }

  function renderMessage(container, message) {
    const card = document.createElement('div');
    card.className = 'event-card-item';
    const text = document.createElement('p');
    text.className = 'event-card-desc';
    text.textContent = message;
    card.append(text);

    const link = document.createElement('a');
    link.href = '../index.html#calendar-controls';
    link.className = 'btn-outline';
    link.textContent = 'View the full calendar';
    card.append(link);

    container.replaceChildren(card);
    container.hidden = false;
  }
})();