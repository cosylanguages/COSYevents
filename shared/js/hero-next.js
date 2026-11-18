/* COSYevents home: fills the "Next up" card from the same schedule the calendar uses. */
(function () {
  'use strict';
  var list = document.querySelector('[data-next-events]');
  if (!list) return;

  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var STR = {
    en: { none: 'No session is scheduled right now.', ask: 'Ask on WhatsApp', join: 'Join', down: 'The schedule is unavailable right now.', wa: 'Hi! When is the next COSYevents session?' },
    fr: { none: 'Aucune session n’est programmée pour le moment.', ask: 'Demander sur WhatsApp', join: 'Rejoindre', down: 'Le programme est indisponible pour le moment.', wa: 'Bonjour ! Quand est la prochaine session COSYevents ?' },
    it: { none: 'Nessuna sessione in programma al momento.', ask: 'Chiedi su WhatsApp', join: 'Partecipa', down: 'Il programma non è disponibile al momento.', wa: 'Ciao! Quando è la prossima sessione COSYevents?' },
    ru: { none: 'Сейчас нет запланированных сессий.', ask: 'Спросить в WhatsApp', join: 'Записаться', down: 'Расписание сейчас недоступно.', wa: 'Здравствуйте! Когда следующая сессия COSYevents?' },
    el: { none: 'Δεν υπάρχει προγραμματισμένη συνεδρία αυτή τη στιγμή.', ask: 'Ρωτήστε στο WhatsApp', join: 'Συμμετοχή', down: 'Το πρόγραμμα δεν είναι διαθέσιμο αυτή τη στιγμή.', wa: 'Γεια σας! Πότε είναι η επόμενη συνεδρία COSYevents;' }
  };
  var str = STR[lang] || STR.en;
  var scriptSrc = document.currentScript && document.currentScript.src ? document.currentScript.src : location.href;
  var dataUrl = new URL('../calendar-data/events.json', scriptSrc);

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function empty(msg) {
    list.replaceChildren();
    var li = el('li', 'ev-next-empty');
    li.append(msg + ' ');
    var a = el('a', '', str.ask);
    a.href = 'https://wa.me/330766784195?text=' + encodeURIComponent(str.wa);
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
    list.append(li);
  }
  function render(events) {
    var t = today();
    var next = events
      .filter(function (e) { return e && e.date >= t; })
      .sort(function (a, b) { return (a.date + ' ' + (a.time || '')).localeCompare(b.date + ' ' + (b.time || '')); })
      .slice(0, 3);
    if (!next.length) return empty(str.none);
    list.replaceChildren();
    next.forEach(function (e) {
      var d = new Date(e.date + 'T12:00:00');
      var li = el('li', 'ev-next-item');
      var date = el('div', 'ev-next-date');
      date.append(el('strong', '', String(d.getDate())), el('span', '', d.toLocaleDateString(lang, { month: 'short' })));
      var body = el('div', 'ev-next-body');
      body.append(el('p', 'ev-next-title', e.title));
      var meta = [e.time ? e.time + (e.timezone ? ' ' + e.timezone : '') : '', e.language, e.level].filter(Boolean).join(' · ');
      body.append(el('p', 'ev-next-meta', meta));
      li.append(date, body);
      if (e.registration_link && /^https:\/\//.test(e.registration_link)) {
        var join = el('a', 'ev-next-join', str.join);
        join.href = e.registration_link;
        join.target = '_blank';
        join.rel = 'noopener';
        li.append(join);
      }
      list.append(li);
    });
  }

  fetch(dataUrl)
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(render)
    .catch(function () { empty(str.down); });
})();
