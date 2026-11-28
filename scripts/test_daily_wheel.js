#!/usr/bin/env node
/**
 * scripts/test_daily_wheel.js
 * Data and component tests for the seven daily speaking wheels.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const wheel = require('../shared/js/daily-wheel.js');

const BANDS = ['a0-a1', 'a2', 'b1-b2', 'c1-c2'];
const WHEELS = [
    { id: 'mind-matters', page: 'mind-matters.html' },
    { id: 'debates', page: 'debatable-relatable.html', needsSides: true },
    { id: 'science', page: 'keeping-up-with-science.html' },
    { id: 'quotes', page: 'the-greatest-quotes.html', needsAttribution: true },
    { id: 'karaoke', page: 'karaoke-club.html', needsSing: true },
    { id: 'films', page: 'cinema-club.html' },
    { id: 'life', page: 'my-life-with-without.html', needsSides: true }
];

for (const w of WHEELS) {
    const file = path.join(__dirname, '..', 'data', 'wheels', `${w.id}.json`);
    assert(fs.existsSync(file), `${w.id}: data file must exist`);
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

    assert.strictEqual(data.id, w.id, `${w.id}: id must match the file name`);
    assert(data.title && data.subtitle, `${w.id}: title and subtitle required`);
    assert.deepStrictEqual(data.bands, BANDS, `${w.id}: must declare the four bands`);
    assert(data.task.prep_seconds > 0, `${w.id}: preparation time required`);
    assert(data.task.speak_seconds > 0, `${w.id}: speaking time required`);
    assert.strictEqual(data.rules.research_allowed, true, `${w.id}: research is allowed`);
    assert.strictEqual(data.rules.ai_allowed, false, `${w.id}: AI is not allowed`);

    assert.strictEqual(data.prompts.length, 40, `${w.id}: 40 prompts`);
    const ids = data.prompts.map((p) => p.id);
    assert.strictEqual(new Set(ids).size, ids.length, `${w.id}: prompt ids must be unique`);

    for (const band of BANDS) {
        const pool = data.prompts.filter((p) => p.band === band);
        assert.strictEqual(pool.length, 10, `${w.id}/${band}: ten prompts`);
        const seen = new Set();
        for (const p of pool) {
            assert(p.id.startsWith(`en:wheel-${w.id}:${band}:`), `${p.id}: id must name wheel and band`);
            assert(typeof p.prompt === 'string' && p.prompt.trim().length > 10, `${p.id}: prompt required`);
            assert(!seen.has(p.prompt), `${p.id}: duplicate prompt in band`);
            seen.add(p.prompt);
            assert(Array.isArray(p.follow_ups) && p.follow_ups.length >= 1, `${p.id}: follow-up required`);
            assert(Array.isArray(p.structures) && p.structures.length >= 1, `${p.id}: structures required`);
            assert(Array.isArray(p.vocabulary) && p.vocabulary.length >= 3, `${p.id}: vocabulary required`);
            if (w.needsSides) {
                assert(p.side_a && p.side_b, `${p.id}: two sides required`);
                assert.notStrictEqual(p.side_a, p.side_b, `${p.id}: sides must differ`);
            }
            if (w.needsAttribution) assert(p.attribution, `${p.id}: attribution required`);
            if (w.needsSing) assert(p.sing, `${p.id}: sing instruction required`);
        }
    }
    console.log(`  PASS: ${w.id} — 40 prompts, 10 per band, all fields present`);
}

// Deterministic daily set, for every wheel and every band
for (const w of WHEELS) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'wheels', `${w.id}.json`), 'utf-8'));
    for (const band of BANDS) {
        const a = wheel.pickWheelPrompts(data.prompts, band, '2026-11-26', 8);
        const b = wheel.pickWheelPrompts(data.prompts, band, '2026-11-26', 8);
        assert.strictEqual(a.length, 8, `${w.id}/${band}: eight segments`);
        assert(a.every((p) => p.band === band), `${w.id}/${band}: band filtered`);
        assert.strictEqual(new Set(a.map((p) => p.id)).size, 8, `${w.id}/${band}: no repeats`);
        assert.deepStrictEqual(a.map((p) => p.id), b.map((p) => p.id), `${w.id}/${band}: same day, same set`);
        const next = wheel.pickWheelPrompts(data.prompts, band, '2026-11-27', 8);
        assert.notStrictEqual(a[0].id, next[0].id, `${w.id}/${band}: shifts the next day`);
    }
}
assert.deepStrictEqual(wheel.pickWheelPrompts(WHEELS.length ? [{ band: 'a2', id: 'x' }] : [], 'zz', '2026-11-26', 8), [], 'unknown band is empty');
console.log('  PASS: every wheel and band gives eight deterministic prompts a day');

// Dispenser deck: a full shuffle, and never the same prompt twice in a row across refills
function seeded(seed) {
    return function () {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
}
for (let run = 0; run < 25; run += 1) {
    const order = wheel.shuffledIndices(8, seeded(run + 1));
    assert.deepStrictEqual(order.slice().sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7], 'shuffle keeps every slot once');
}
const guarded = wheel.refillDeck(8, 0, () => 0);
assert.notStrictEqual(guarded[guarded.length - 1], 0, 'refill must not serve the prompt just shown');
assert.deepStrictEqual(guarded.slice().sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7], 'guard keeps a full deck');
assert.deepStrictEqual(wheel.refillDeck(0, 0), [], 'zero-size deck stays empty');
assert.deepStrictEqual(wheel.refillDeck(1, 0), [0], 'single-slot deck keeps its one prompt');
let deck = [];
let lastDraw = -1;
const rand = seeded(7);
for (let i = 0; i < 40; i += 1) {
    if (!deck.length) deck = wheel.refillDeck(8, lastDraw, rand);
    const next = deck.pop();
    if (i > 0) assert.notStrictEqual(next, lastDraw, 'no back-to-back repeat across refills');
    lastDraw = next;
}
console.log('  PASS: dispenser deck shuffles fully and never repeats back-to-back');

// Page integration
for (const w of WHEELS) {
    const html = fs.readFileSync(path.join(__dirname, '..', w.page), 'utf-8');
    assert(html.includes(`data-daily-wheel="${w.id}"`), `${w.page}: must mount the ${w.id} wheel`);
    assert(html.includes('data-src="data/wheels/'), `${w.page}: must point at its data file`);
    assert(html.includes('shared/js/daily-wheel.js'), `${w.page}: must load the wheel component`);
    assert(new RegExp(`<header class="club-hero">[\\s\\S]*?data-daily-wheel="${w.id}"[\\s\\S]*?</header>`).test(html),
        `${w.page}: the wheel must sit inside the club hero`);
    assert(html.includes('data-chrome="compact"'), `${w.page}: hero wheel uses the compact card`);
}
console.log(`  PASS: ${WHEELS.length} club pages mount their wheel inside the hero`);

// Deep links: band, date and prompt in the query string
assert.deepStrictEqual(wheel.parseQuery('?band=B2&date=2026-11-26&prompt=3'),
    { band: 'b1-b2', dateKey: '2026-11-26', prompt: 3 }, 'valid query parses');
assert.deepStrictEqual(wheel.parseQuery('?band=a1'), { band: 'a0-a1' }, 'a1 maps to a0-a1');
assert.deepStrictEqual(wheel.parseQuery('?band=c2'), { band: 'c1-c2' }, 'c2 maps to c1-c2');
assert.deepStrictEqual(wheel.parseQuery('?band=nonsense&date=yesterday&prompt=99'), {}, 'junk is dropped');
assert.deepStrictEqual(wheel.parseQuery(''), {}, 'empty query is empty');
assert.deepStrictEqual(wheel.parseQuery('?prompt=7'), { prompt: 7 }, 'last segment is addressable');
console.log('  PASS: deep links — band, date and prompt parse, junk is ignored');

// Weekly rotation: one wheel a day, no gaps, no repeats
const days = wheel.WEEKLY_ROTATION.map((w) => w.weekday).sort();
assert.deepStrictEqual(days, [0, 1, 2, 3, 4, 5, 6], 'all seven weekdays are covered');
const ids = new Set(wheel.WEEKLY_ROTATION.map((w) => w.id));
assert.strictEqual(ids.size, 7, 'seven distinct wheels');
for (const w of wheel.WEEKLY_ROTATION) {
    assert(fs.existsSync(path.join(__dirname, '..', 'data', 'wheels', w.id + '.json')), `${w.id}.json exists`);
    assert(fs.existsSync(path.join(__dirname, '..', w.page)), `${w.page} exists`);
}
assert.strictEqual(wheel.wheelForDate(new Date(2026, 10, 23)).id, 'mind-matters', 'Monday is mind matters');
assert.strictEqual(wheel.wheelForDate(new Date(2026, 10, 25)).id, 'science', 'Wednesday is science');
assert.strictEqual(wheel.wheelForDate(new Date(2026, 10, 29)).id, 'life', 'Sunday is life with and without');
console.log('  PASS: rotation — seven days, seven wheels, files present');

// Discovery: one page, one banner, one nav entry, one bookmark
const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const todayPage = read('today.html');
assert(todayPage.includes('shared/js/daily-wheel.js'), 'today.html loads the wheel');
assert(todayPage.includes('wheelForDate'), 'today.html picks the day\'s wheel');
assert(todayPage.includes('WEEKLY_ROTATION'), 'today.html lists the week');
const todayHero = todayPage.slice(todayPage.indexOf('<header class="today-hero">'), todayPage.indexOf('</header>'));
assert(todayHero.includes('id="today-wheel"'), 'today.html puts the wheel inside the hero');
assert(todayPage.includes("setAttribute('data-chrome', 'bare')"), 'today.html uses bare chrome inside its hero');

const wheelSource = read('shared/js/daily-wheel.js');
assert(wheelSource.includes('@keyframes dw-lever-pull'), 'lever pull animation is defined');
assert(wheelSource.includes("machine.classList.add('is-pulling')"), 'the machine jolts when the lever is pulled');
assert(wheelSource.includes("windowEl.classList.add('is-rolling')"), 'the window reel runs while the lever is down');
assert(wheelSource.includes('@keyframes dw-lock'), 'the prompt locks in after the reel');
assert(wheelSource.includes('html[data-theme="dark"] .dw'), 'dark theme dispenser palette is defined');
assert(wheelSource.includes("'.dw-card{background:var(--dw-card)"), 'result card follows the theme palette');
assert(todayPage.includes('html[data-theme="dark"] .week-list a'), 'today list adapts to dark mode');
console.log('  PASS: lever pull animation and dark theme hooks are wired');

const hub = read('speaking-clubs.html');
assert(hub.includes('data-daily-wheel-banner'), 'hub shows today\'s banner');
assert.strictEqual((hub.match(/data-wheel-preview=/g) || []).length, 5, 'five hub cards carry a preview');

assert(read('index.html').includes('data-daily-wheel-banner'), 'homepage shows today\'s banner');
assert(read('shared/js/cosyevents-session.js').includes('today.html'), 'clubs menu links to today');

const manifest = JSON.parse(read('manifest.json'));
assert(manifest.shortcuts && manifest.shortcuts[0].url === './today.html', 'app shortcut opens today');
console.log('  PASS: discovery — today page, hub banner, homepage banner, nav entry, app shortcut');

console.log('\n🎉 Daily wheel tests passed');
