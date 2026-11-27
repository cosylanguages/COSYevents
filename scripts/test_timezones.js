const fs = require('fs');
const assert = require('assert');

function parseParisDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const targetUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

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

// Check 1: 2026-09-05 18:00 CEST -> 16:00Z
const d1 = parseParisDateTime('2026-09-05', '18:00');
assert.strictEqual(d1.toISOString(), '2026-09-05T16:00:00.000Z', 'Summer CEST test failed');

// Check 2: 2027-01-15 18:00 CET -> 17:00Z
const d2 = parseParisDateTime('2027-01-15', '18:00');
assert.strictEqual(d2.toISOString(), '2027-01-15T17:00:00.000Z', 'Winter CET test failed');

console.log('All timezone tests passed successfully!');
