/**
 * scripts/test_club_music.js
 * Tests shared/js/club-music.js (speaking-club background music) in a vm sandbox with a fake Audio/DOM.
 * Also checks that the tracks exist and the loading hooks are in place.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'shared/js/club-music.js'), 'utf8');
let passed = 0;
async function t(name, fn) { await fn(); passed++; console.log('ok - ' + name); }

function boot({ pathname = '/COSYevents/i-couldnt-help-but-wonder.html', session = {}, autoplayBlocked = false, hero = true, readyState = 'complete', scriptSrc = 'shared/js/club-music.js' } = {}) {
  const store = new Map(Object.entries(session));
  const sessionStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const audios = [];
  class FakeAudio {
    constructor(src) { this.src = src; this.paused = true; this.volume = 1; this.currentTime = 0; this.loop = true; this.l = {}; this.plays = 0; audios.push(this); }
    addEventListener(e, f) { (this.l[e] = this.l[e] || []).push(f); }
    emit(e) { (this.l[e] || []).forEach((f) => f()); }
    play() { this.plays++; if (autoplayBlocked && !this.userGesture) return Promise.reject(new Error('NotAllowedError')); this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  const docListeners = {};
  const made = [];
  const mkEl = (tag) => {
    const el = { tag, children: [], attrs: {}, listeners: {}, style: {}, textContent: '', className: '', id: '',
      setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
      addEventListener(e, f) { this.listeners[e] = f; }, appendChild(c) { this.children.push(c); c.parent = this; return c; }, click() { this.listeners.click && this.listeners.click(); } };
    made.push(el); return el;
  };
  const heroEl = mkEl('div');
  const body = mkEl('body'); const head = mkEl('head');
  const document = {
    readyState, currentScript: { getAttribute: () => scriptSrc }, scripts: [],
    createElement: mkEl,
    getElementById: (id) => made.find((e) => e.id === id) || null,
    querySelector: (sel) => (hero && sel === '.club-hero' ? heroEl : null),
    addEventListener: (e, f) => { (docListeners[e] = docListeners[e] || []).push(f); },
    removeEventListener: (e, f) => { docListeners[e] = (docListeners[e] || []).filter((x) => x !== f); },
    body, head
  };
  const winListeners = {};
  const window = { location: { pathname }, sessionStorage, Audio: FakeAudio, addEventListener: (e, f) => { winListeners[e] = f; } };
  window.window = window; window.document = document;
  const ctx = vm.createContext({ window, document, Audio: FakeAudio, console, Math, JSON, parseInt, parseFloat, isNaN, Promise });
  vm.runInContext(SRC, ctx);
  return { window, audios, store, heroEl, body, docListeners, winListeners, made, music: window.COSYClubMusic };
}
const flush = () => new Promise((r) => setImmediate(r));

(async () => {
  await t('does nothing outside speaking-club paths', () => {
    const e = boot({ pathname: '/COSYevents/karaoke-club.html' });
    assert.equal(e.music, undefined); assert.equal(e.audios.length, 0);
  });

  await t('matches every legacy club path', () => {
    for (const p of ['/x/events/speaking-clubs/a.html', '/x/i-couldnt-help-but-wonder.html', '/x/keeping-up-with-science.html', '/x/lets-celebrate.html', '/x/the-greatest-quotes.html', '/x/mind-matters.html', '/x/my-life-with-without.html', '/x/debatable-relatable.html', '/x/if-you-were.html', '/x/long-reads.html', '/x/premium-events/clubs/a.html']) {
      assert.ok(boot({ pathname: p }).music, p);
    }
  });

  await flush();
  const e1 = boot();
  await flush();
  await t('autoplays a track at low volume and remembers it is playing', () => {
    assert.equal(e1.audios.length, 1);
    assert.equal(e1.audios[0].paused, false);
    assert.equal(e1.audios[0].volume, 0.15);
    assert.equal(e1.audios[0].loop, false, 'must not loop a single track, or the playlist never advances');
    assert.equal(e1.store.get('cosy_wonder_music_playing'), 'true');
  });

  await t('builds the track URL from the script location', () => {
    assert.match(e1.audios[0].src, /^shared\/audio\/music\/background[1-9]\.mp3$/);
    const nested = boot({ scriptSrc: '../../shared/js/club-music.js' });
    assert.match(nested.audios[0].src, /^\.\.\/\.\.\/shared\/audio\/music\/background[1-9]\.mp3$/);
  });

  await t('keeps a shuffled queue of all 9 tracks without repeats', () => {
    const q = JSON.parse(e1.store.get('cosy_bg_music_queue'));
    assert.deepEqual([...q].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  await flush();
  await t('moves to the next track in the queue when one ends', () => {
    const q = JSON.parse(e1.store.get('cosy_bg_music_queue'));
    e1.audios[0].emit('ended');
    assert.equal(e1.store.get('cosy_bg_music_index'), '1');
    assert.ok(e1.audios[0].src.endsWith('background' + q[1] + '.mp3'));
  });

  await t('reshuffles after the last track', () => {
    const e = boot({ session: { cosy_bg_music_queue: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9]), cosy_bg_music_index: '8' } });
    e.audios[0].emit('ended');
    assert.equal(e.store.get('cosy_bg_music_index'), '0');
    assert.equal(JSON.parse(e.store.get('cosy_bg_music_queue')).length, 9);
  });

  await t('resumes from the saved position and the saved queue position', () => {
    const e = boot({ session: { cosy_bg_music_queue: JSON.stringify([5, 3, 1, 2, 4, 6, 7, 8, 9]), cosy_bg_music_index: '1', cosy_wonder_music_time: '42.5' } });
    assert.ok(e.audios[0].src.endsWith('background3.mp3'));
    assert.equal(e.audios[0].currentTime, 42.5);
  });

  await t('survives corrupt session state', () => {
    const e = boot({ session: { cosy_bg_music_queue: '{bad', cosy_bg_music_index: 'x', cosy_wonder_music_time: 'nan' } });
    assert.equal(e.audios.length, 1);
    assert.equal(JSON.parse(e.store.get('cosy_bg_music_queue')).length, 9);
  });

  const m = boot({ session: { cosy_wonder_music_playing: 'false' } });
  await flush();
  await t('stays silent when the visitor turned it off', () => {
    assert.equal(m.audios[0].paused, true);
    assert.equal(m.audios[0].plays, 0);
  });

  await t('toggle button resumes and pauses, and remembers the choice', async () => {
    const btn = m.made.find((x) => x.className.includes('cosy-club-music-btn'));
    assert.ok(btn); assert.equal(btn.getAttribute('aria-pressed'), 'false');
    btn.click(); await flush();
    assert.equal(m.audios[0].paused, false); assert.equal(m.store.get('cosy_wonder_music_playing'), 'true');
    assert.equal(btn.getAttribute('aria-pressed'), 'true');
    btn.click();
    assert.equal(m.audios[0].paused, true); assert.equal(m.store.get('cosy_wonder_music_playing'), 'false');
  });

  await t('hub pages put the toggle in the hero; other pages get a floating toggle', () => {
    const hub = boot();
    assert.equal(hub.heroEl.children.length, 1);
    const sess = boot({ pathname: '/COSYevents/sessions/the-greatest-quotes/a.html' });
    const wrap = sess.made.find((x) => x.id === 'cosy-club-music-toggle');
    assert.ok(wrap && wrap.parent === sess.body);
    assert.ok(wrap.children[0].className.includes('cosy-club-music-float'));
    const nohero = boot({ hero: false });
    assert.ok(nohero.made.find((x) => x.id === 'cosy-club-music-toggle').parent === nohero.body);
  });

  await t('uses French and Russian labels', () => {
    const fr = boot({ pathname: '/COSYevents/fr/mind-matters.html' });
    assert.match(fr.made.find((x) => x.className.includes('cosy-club-music-btn')).textContent, /musique d/);
    const ru = boot({ pathname: '/COSYevents/ru/mind-matters.html' });
    assert.match(ru.made.find((x) => x.className.includes('cosy-club-music-btn')).textContent, /[\u0400-\u04FF]/);
  });

  await t('when autoplay is blocked it starts on the first user interaction', async () => {
    const b = boot({ autoplayBlocked: true });
    await flush();
    assert.equal(b.audios[0].paused, true);
    assert.ok(b.docListeners.click && b.docListeners.click.length === 1);
    b.audios[0].userGesture = true;
    b.docListeners.click[0](); await flush();
    assert.equal(b.audios[0].paused, false);
    assert.equal(b.docListeners.click.length, 0, 'listeners removed after start');
  });

  await t('duck lowers the music for voiceovers and unduck restores it', async () => {
    const d = boot(); await flush();
    d.music.duck(); assert.equal(d.audios[0].volume, 0.03); assert.equal(d.music.isDucked(), true);
    d.music.unduck(); assert.equal(d.audios[0].volume, 0.15); assert.equal(d.music.isDucked(), false);
  });

  await t('duck does not restart music the visitor muted', async () => {
    const d = boot({ session: { cosy_wonder_music_playing: 'false' } }); await flush();
    d.music.duck(); assert.equal(d.audios[0].paused, true);
  });

  await t('a missing track skips to the next one and gives up after a full lap', () => {
    const d = boot();
    for (let i = 0; i < 20; i++) d.audios[0].emit('error');
    assert.ok(Number(d.store.get('cosy_bg_music_index')) < 9);
    assert.ok(d.audios.length === 1);
  });

  await t('a muted visitor stays silent when a track ends', async () => {
    const d = boot({ session: { cosy_wonder_music_playing: 'false' } }); await flush();
    const before = d.audios[0].plays;
    d.audios[0].emit('ended');
    assert.equal(d.audios[0].paused, true); assert.equal(d.audios[0].plays, before);
  });

  await t('stops retrying after one full lap of broken tracks', () => {
    const d = boot();
    for (let i = 0; i < 9; i++) d.audios[0].emit('error');
    const src = d.audios[0].src, idx = d.store.get('cosy_bg_music_index');
    for (let i = 0; i < 5; i++) d.audios[0].emit('error');
    assert.equal(d.audios[0].src, src); assert.equal(d.store.get('cosy_bg_music_index'), idx);
  });

  await t('works when sessionStorage is blocked', () => {
    const e = boot();
    const blocked = vm.createContext({ window: { location: { pathname: '/a/speaking-clubs/x.html' }, sessionStorage: { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } }, Audio: e.audios[0].constructor, addEventListener() {} }, document: { readyState: 'complete', currentScript: { getAttribute: () => 'shared/js/club-music.js' }, createElement: () => ({ style: {}, attrs: {}, setAttribute() {}, addEventListener() {}, appendChild() {} }), getElementById: () => null, querySelector: () => null, addEventListener() {}, body: { appendChild() {} }, head: { appendChild() {} } }, console, Math, JSON, parseInt, parseFloat, isNaN, Promise });
    blocked.window.window = blocked.window; blocked.window.document = blocked.document; blocked.Audio = blocked.window.Audio;
    assert.doesNotThrow(() => vm.runInContext(SRC, blocked));
  });

  await t('all 9 music tracks are present and non-trivial', () => {
    for (let i = 1; i <= 9; i++) {
      const f = path.join(ROOT, 'shared/audio/music/background' + i + '.mp3');
      assert.ok(fs.existsSync(f), f); assert.ok(fs.statSync(f).size > 1_000_000, f + ' is too small');
    }
  });

  await t('loading hooks are in place (session script loader, hub tag, voiceover ducking)', () => {
    const session = fs.readFileSync(path.join(ROOT, 'shared/js/cosyevents-session.js'), 'utf8');
    assert.match(session, /club-music\.js/);
    assert.match(fs.readFileSync(path.join(ROOT, 'speaking-clubs/index.html'), 'utf8'), /shared\/js\/club-music\.js/);
    const vo = fs.readFileSync(path.join(ROOT, 'shared/js/wonder-voiceover.js'), 'utf8');
    assert.ok((vo.match(/duckMusic\(\)/g) || []).length >= 2 && (vo.match(/restoreMusic\(\)/g) || []).length >= 4);
  });

  console.log(`\n${passed} tests passed`);
})().catch((err) => { console.error(err); process.exit(1); });
