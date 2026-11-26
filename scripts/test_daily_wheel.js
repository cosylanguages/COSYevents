#!/usr/bin/env node
/**
 * scripts/test_daily_wheel.js
 * Data and component tests for the daily speaking wheels (mind matters, debates).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const wheel = require('../shared/js/daily-wheel.js');

const BANDS = ['a0-a1', 'a2', 'b1-b2', 'c1-c2'];
const WHEELS = [
    { id: 'mind-matters', page: 'mind-matters.html', needsSides: false },
    { id: 'debates', page: 'debatable-relatable.html', needsSides: true }
];

for (const w of WHEELS) {
    const file = path.join(__dirname, '..', 'data', 'wheels', `${w.id}.json`);
    assert(fs.existsSync(file), `${w.id}: data file must exist`);
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

    assert.strictEqual(data.id, w.id, `${w.id}: id must match the file name`);
    assert(data.title && data.subtitle, `${w.id}: title and subtitle required`);
    assert.deepStrictEqual(data.bands, BANDS, `${w.id}: must declare the four bands`);
    assert.strictEqual(data.task.prep_seconds, 300, `${w.id}: five minutes of preparation`);
    assert.strictEqual(data.task.speak_seconds, 300, `${w.id}: five minutes of speaking`);
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
                assert(p.side_a && p.side_b, `${p.id}: debate prompts need two sides`);
                assert.notStrictEqual(p.side_a, p.side_b, `${p.id}: sides must differ`);
            }
        }
    }
    console.log(`  PASS: ${w.id} — 40 prompts, 10 per band, all fields present`);
}

// Deterministic daily set
const mind = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'wheels', 'mind-matters.json'), 'utf-8'));
const a = wheel.pickWheelPrompts(mind.prompts, 'b1-b2', '2026-11-26', 8);
const b = wheel.pickWheelPrompts(mind.prompts, 'b1-b2', '2026-11-26', 8);
assert.deepStrictEqual(a.map((p) => p.id), b.map((p) => p.id), 'same date must give the same set');
assert.strictEqual(a.length, 8, 'eight segments');
assert(a.every((p) => p.band === 'b1-b2'), 'all prompts come from the requested band');
const next = wheel.pickWheelPrompts(mind.prompts, 'b1-b2', '2026-11-27', 8);
assert.notStrictEqual(a[0].id, next[0].id, 'the set shifts the next day');
assert.deepStrictEqual(wheel.pickWheelPrompts(mind.prompts, 'zz', '2026-11-26', 8), [], 'unknown band is empty');
assert.strictEqual(new Set(a.map((p) => p.id)).size, 8, 'no repeats inside one day');
console.log('  PASS: daily set is deterministic, banded and shifts by one each day');

// Page integration
for (const w of WHEELS) {
    const html = fs.readFileSync(path.join(__dirname, '..', w.page), 'utf-8');
    assert(html.includes(`data-daily-wheel="${w.id}"`), `${w.page}: must mount the ${w.id} wheel`);
    assert(html.includes('data-src="data/wheels/'), `${w.page}: must point at its data file`);
    assert(html.includes('shared/js/daily-wheel.js'), `${w.page}: must load the wheel component`);
    console.log(`  PASS: ${w.page} mounts the ${w.id} wheel`);
}

console.log('\n🎉 Daily wheel tests passed');
