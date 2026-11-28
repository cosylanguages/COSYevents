/**
 * shared/js/daily-wheel.js
 *
 * A daily speaking wheel for the club pages. The set of prompts is deterministic for the
 * date, band and language; the lever dispenses one of them at random, like a prompt
 * dispenser built for impromptu speaking practice. One file serves every wheel page:
 *
 *   <div data-daily-wheel="mind-matters" data-src="data/wheels/mind-matters.json"
 *        data-band="b1-b2" data-lang="en"></div>
 *   <script src="shared/js/daily-wheel.js" defer></script>
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CosyDailyWheel = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    var LEXICON_SCRIPT = 'https://cosylanguages.github.io/COSYtools/shared/js/vocabulary-relations.js';
    var BANDS = ['a0-a1', 'a2', 'b1-b2', 'c1-c2'];
    var DECK_SIZE = 8;

    // One wheel a day, so nobody has to choose. Monday first.
    var WEEKLY_ROTATION = [
        { weekday: 1, id: 'mind-matters', page: 'mind-matters.html', title: 'Mind Matters' },
        { weekday: 2, id: 'debates', page: 'debatable-relatable.html', title: 'Debatable & Relatable' },
        { weekday: 3, id: 'science', page: 'keeping-up-with-science.html', title: 'Keeping Up With Science' },
        { weekday: 4, id: 'quotes', page: 'the-greatest-quotes.html', title: 'The Greatest Quotes' },
        { weekday: 5, id: 'karaoke', page: 'karaoke-club.html', title: 'Karaoke Club' },
        { weekday: 6, id: 'films', page: 'cinema-club.html', title: 'Films & Series' },
        { weekday: 0, id: 'life', page: 'my-life-with-without.html', title: 'My Life With / Without' }
    ];

    function wheelForDate(d) {
        var weekday = (d || new Date()).getDay();
        for (var i = 0; i < WEEKLY_ROTATION.length; i += 1) {
            if (WEEKLY_ROTATION[i].weekday === weekday) return WEEKLY_ROTATION[i];
        }
        return WEEKLY_ROTATION[0];
    }

    function normaliseBand(value) {
        var raw = String(value || '').trim().toLowerCase();
        if (BANDS.indexOf(raw) !== -1) return raw;
        if (raw === 'a0' || raw === 'a1') return 'a0-a1';
        if (raw === 'b1' || raw === 'b2') return 'b1-b2';
        if (raw === 'c1' || raw === 'c2') return 'c1-c2';
        return '';
    }

    /** Reads band, date and prompt from a query string; anything invalid is dropped. */
    function parseQuery(search) {
        var out = {};
        var raw = String(search || '').replace(/^\?/, '');
        if (!raw) return out;
        raw.split('&').forEach(function (pair) {
            if (!pair) return;
            var at = pair.indexOf('=');
            var key = decodeURIComponent(at === -1 ? pair : pair.slice(0, at));
            var value = at === -1 ? '' : decodeURIComponent(pair.slice(at + 1));
            if (key === 'band') {
                var band = normaliseBand(value);
                if (band) out.band = band;
            } else if (key === 'date') {
                if (/^\d{4}-\d{2}-\d{2}$/.test(value)) out.dateKey = value;
            } else if (key === 'prompt') {
                var index = parseInt(value, 10);
                if (index >= 0 && index < DECK_SIZE) out.prompt = index;
            }
        });
        return out;
    }

    function localDateKey(d) {
        d = d || new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function daysSinceEpoch(dateKey) {
        var p = dateKey.split('-').map(Number);
        return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 86400000);
    }

    // Same date, band and pool always give the same set; the next day shifts by one.
    function pickWheelPrompts(prompts, band, dateKey, count) {
        var pool = (prompts || []).filter(function (p) { return p.band === band; });
        if (!pool.length) return [];
        var n = Math.min(count || DECK_SIZE, pool.length);
        var start = Math.abs(daysSinceEpoch(dateKey)) % pool.length;
        var out = [];
        for (var i = 0; i < n; i++) out.push(pool[(start + i) % pool.length]);
        return out;
    }

    /** Fisher-Yates shuffle of 0..count-1; the random source is injectable for tests. */
    function shuffledIndices(count, random) {
        var rand = typeof random === 'function' ? random : Math.random;
        var order = [];
        for (var i = 0; i < count; i += 1) order.push(i);
        for (var j = order.length - 1; j > 0; j -= 1) {
            var k = Math.floor(rand() * (j + 1));
            var tmp = order[j];
            order[j] = order[k];
            order[k] = tmp;
        }
        return order;
    }

    /**
     * A fresh dispenser deck. The next index to be drawn is the last one, so if it
     * matches the prompt just shown, swap it away so a pull never repeats itself.
     */
    function refillDeck(count, lastIndex, random) {
        var deck = shuffledIndices(count, random);
        if (deck.length > 1 && deck[deck.length - 1] === lastIndex) {
            var first = deck[0];
            deck[0] = deck[deck.length - 1];
            deck[deck.length - 1] = first;
        }
        return deck;
    }

    function truncate(text, max) {
        text = String(text || '');
        return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
    }

    function injectStyles() {
        if (typeof document === 'undefined' || document.getElementById('dw-styles')) return;
        var style = document.createElement('style');
        style.id = 'dw-styles';
        style.textContent = [
            '.dw{background:#FAF7F2;border:1px solid var(--border,#e5e0d8);border-radius:28px;padding:2rem;margin:0 0 2.5rem;}',
            '.dw--embed{padding:1.5rem;}',
            '.dw-head h2{margin:0 0 .35rem;font-family:"Playfair Display",serif;font-size:1.5rem;}',
            '.dw-head p{margin:0 0 1.25rem;color:var(--muted,#6b6560);font-size:.95rem;}',
            '.dw-head--compact{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin:0 0 1rem;padding-bottom:.75rem;border-bottom:1px dashed #e5e0d8;}',
            '.dw-eyebrow{display:inline-block;font:700 .72rem/1 "Commissioner",system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#993556;}',
            '.dw-bands{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem;}',
            '.dw-band{border:1px solid #d9d2c7;background:#fff;color:#4a443e;border-radius:999px;padding:.35rem .9rem;font:inherit;font-size:.85rem;cursor:pointer;}',
            '.dw-band[aria-pressed="true"]{background:#993556;border-color:#993556;color:#fff;font-weight:600;}',
            '.dw-machine{display:flex;align-items:center;gap:1rem;max-width:430px;margin:0 auto;padding:1rem;border:1px solid #e5e0d8;border-radius:22px;background:linear-gradient(180deg,#fff,#f4efe7);box-shadow:0 14px 30px rgba(0,0,0,.07),inset 0 1px 0 #fff;}',
            '.dw-window{position:relative;flex:1 1 auto;min-height:132px;display:flex;align-items:center;justify-content:center;padding:1rem;border-radius:14px;background:#26221f;box-shadow:inset 0 10px 24px rgba(0,0,0,.6);overflow:hidden;}',
            '.dw-window:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.09),transparent 45%);pointer-events:none;}',
            '.dw-window.is-rolling:after{animation:dw-scan .72s linear;}',
            '.dw-window.is-locked .dw-window-text{animation:dw-lock .3s ease-out;}',
            '.dw-window-text{position:relative;z-index:1;color:#f4efe7;font-family:"Playfair Display",serif;font-size:.98rem;line-height:1.4;text-align:center;transition:opacity .12s ease;}',
            '.dw-window-text.is-idle{font-family:"Commissioner",system-ui,sans-serif;font-size:2rem;font-weight:700;letter-spacing:.35em;text-indent:.35em;color:#9c9288;animation:dw-breathe 2.8s ease-in-out infinite;}',
            '.dw-lever{position:relative;flex:0 0 74px;width:74px;height:148px;border:0;background:transparent;padding:0;cursor:pointer;touch-action:manipulation;}',
            '.dw-lever-pivot{position:absolute;bottom:0;left:50%;width:60px;height:24px;margin-left:-30px;border-radius:12px;background:linear-gradient(180deg,#0abbb5,#087a80);box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 5px 10px rgba(0,0,0,.18);}',
            '.dw-lever-arm{position:absolute;bottom:14px;left:50%;width:12px;height:94px;margin-left:-6px;border-radius:6px;background:linear-gradient(90deg,#b9b1a6,#f2ece2 45%,#a89f93);transform-origin:50% 100%;transition:transform .18s cubic-bezier(.34,1.56,.64,1);}',
            '.dw-lever-knob{position:absolute;top:-18px;left:50%;width:46px;height:46px;margin-left:-23px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#d98ba2,#993556 62%,#671f36);color:#fff;font:700 .58rem/46px "Commissioner",system-ui,sans-serif;letter-spacing:.08em;text-align:center;box-shadow:inset 0 2px 3px rgba(255,255,255,.45),0 6px 12px rgba(0,0,0,.28);}',
            '.dw-lever:hover .dw-lever-knob{filter:brightness(1.07);}',
            '.dw-lever:focus-visible{outline:3px solid #0abbb5;outline-offset:4px;border-radius:16px;}',
            '.dw-lever.is-pulling .dw-lever-arm{animation:dw-lever-pull .72s cubic-bezier(.3,.7,.3,1);}',
            '.dw-lever.is-pulling .dw-lever-knob{animation:dw-knob-glow .72s ease-out;}',
            '.dw-machine.is-pulling{animation:dw-thunk .72s cubic-bezier(.3,.7,.3,1);}',
            '.dw-lever:disabled{cursor:default;}',
            '.dw-hint{margin:.9rem 0 0;text-align:center;font-size:.85rem;color:#6b6560;}',
            '.dw-result{margin-top:1.5rem;}',
            '.dw-result:empty{display:none;}',
            '.dw-card{background:#fff;border:1px solid #e5e0d8;border-radius:20px;padding:1.5rem;animation:dw-drop .38s cubic-bezier(.2,.8,.2,1);}',
            '@keyframes dw-breathe{0%,100%{opacity:.55;}50%{opacity:1;}}',
            '@keyframes dw-lever-pull{0%{transform:rotate(0deg);}22%{transform:rotate(44deg);}34%{transform:rotate(38deg);}58%{transform:rotate(-8deg);}74%{transform:rotate(4deg);}88%{transform:rotate(-1deg);}100%{transform:rotate(0deg);}}',
            '@keyframes dw-thunk{0%,100%{transform:none;}18%{transform:translateY(2px) rotate(-.3deg);}28%{transform:translate(-1px,0) rotate(.25deg);}38%{transform:translate(1px,0) rotate(-.2deg);}50%{transform:translateY(1px) rotate(.1deg);}}',
            '@keyframes dw-knob-glow{0%,100%{box-shadow:inset 0 2px 3px rgba(255,255,255,.45),0 6px 12px rgba(0,0,0,.28);}30%{box-shadow:inset 0 2px 3px rgba(255,255,255,.55),0 0 0 7px rgba(255,255,255,.16),0 6px 18px rgba(153,53,86,.5);}}',
            '@keyframes dw-scan{0%{transform:translateY(-115%);}100%{transform:translateY(115%);}}',
            '@keyframes dw-lock{0%{opacity:.3;transform:translateY(-6px) scale(1.03);filter:blur(1px);}55%{opacity:1;transform:translateY(1px) scale(.997);filter:none;}100%{opacity:1;transform:none;filter:none;}}',
            '@keyframes dw-drop{0%{opacity:0;transform:translateY(-16px) scale(.97);}60%{opacity:1;transform:translateY(3px) scale(1.004);}100%{opacity:1;transform:none;}}',
            '.dw-kicker{display:inline-block;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#993556;font-weight:700;margin-bottom:.5rem;}',
            '.dw-prompt{margin:0 0 .75rem;font-size:1.15rem;line-height:1.45;}',
            '.dw-quote{font-family:"Playfair Display",serif;font-size:1.3rem;line-height:1.5;}',
            '.dw-attribution{margin:-.35rem 0 .9rem;font-size:.85rem;color:#6b6560;font-style:italic;}',
            '.dw-sing{margin:0 0 .9rem;background:#F4EFE7;border-radius:12px;padding:.6rem .85rem;font-size:.92rem;}',
            '.dw-sides{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;margin:0 0 .9rem;font-weight:600;}',
            '.dw-side{background:#F4EFE7;border-radius:12px;padding:.4rem .8rem;}',
            '.dw-vs{color:#993556;font-weight:700;}',
            '.dw-follow{margin:.5rem 0 1rem;padding-left:1.1rem;color:#4a443e;font-size:.92rem;}',
            '.dw-chips{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem;}',
            '.dw-chip{background:#F4EFE7;border-radius:999px;padding:.2rem .65rem;font-size:.78rem;color:#4a443e;}',
            '.dw-chip.dw-chip-rel{display:inline-flex;flex-direction:column;align-items:flex-start;gap:.05rem;border-radius:14px;padding:.3rem .7rem;}',
            '.dw-rel{font-size:.7rem;color:#7a746e;line-height:1.3;}',
            '.dw-rel-ant{color:#087a80;}',
            '.dw-timer{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;margin-bottom:.9rem;}',
            '.dw-timer button{background:#2B6CB0;color:#fff;border:0;border-radius:999px;padding:.45rem 1rem;font:inherit;font-size:.85rem;font-weight:600;cursor:pointer;}',
            '.dw-clock{font-variant-numeric:tabular-nums;font-weight:700;min-width:3.4rem;}',
            '.dw-rules{margin:0;font-size:.82rem;color:#6b6560;}',
            '@media (prefers-reduced-motion: reduce){.dw-lever-arm{transition:none;}.dw-card,.dw-window-text.is-idle,.dw-window.is-rolling:after,.dw-window.is-locked .dw-window-text,.dw-machine.is-pulling,.dw-lever.is-pulling .dw-lever-arm,.dw-lever.is-pulling .dw-lever-knob{animation:none;}}'
        ].join('');
        document.head.appendChild(style);
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function formatClock(seconds) {
        var m = Math.floor(seconds / 60), s = seconds % 60;
        return m + ':' + String(s).padStart(2, '0');
    }

    var vocabPromise = null;
    function ensureVocab(url) {
        if (typeof window === 'undefined') return Promise.resolve(null);
        if (window.COSYVocab) {
            if (!vocabPromise) vocabPromise = window.COSYVocab.load();
            return vocabPromise;
        }
        if (vocabPromise) return vocabPromise;
        vocabPromise = new Promise(function (resolve) {
            var script = document.createElement('script');
            script.src = url || LEXICON_SCRIPT;
            script.onload = function () {
                if (!window.COSYVocab) return resolve(null);
                var jsonUrl = url ? url.replace(/\.js(\?.*)?$/, '.json') : undefined;
                resolve(window.COSYVocab.load(jsonUrl));
            };
            script.onerror = function () { resolve(null); };
            document.head.appendChild(script);
        });
        return vocabPromise;
    }

    function mount(host) {
        var id = host.getAttribute('data-daily-wheel');
        var src = host.getAttribute('data-src') || ('data/wheels/' + id + '.json');
        var lang = (host.getAttribute('data-lang') || 'en').slice(0, 2);
        var query = parseQuery(typeof location !== 'undefined' ? location.search : '');
        // The attributes are the page's defaults; a shared link may override them.
        var band = query.band || host.getAttribute('data-band') || 'b1-b2';
        var dateKey = query.dateKey || host.getAttribute('data-date') || localDateKey();
        var chrome = host.getAttribute('data-chrome') || 'full';

        injectStyles();
        host.innerHTML = '<p class="dw-loading">Loading the wheel…</p>';

        fetch(src)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) {
                if (data.lang && data.lang !== lang) {
                    host.innerHTML = '<p class="dw-loading">This wheel is published in ' + esc(data.lang.toUpperCase()) + ' only for now.</p>';
                    return;
                }
                render(host, data, { band: band, dateKey: dateKey, prompt: query.prompt, chrome: chrome });
            })
            .catch(function (err) {
                host.innerHTML = '<p class="dw-loading">The wheel could not load (' + esc(err.message) + ').</p>';
            });
    }

    /** Keeps band, date and the shown prompt in the address bar so the link can be shared. */
    function syncUrl(host, data, state, index) {
        if (typeof history === 'undefined' || !history.replaceState) return;
        var search = typeof location !== 'undefined' ? location.search : '';
        var params = new URLSearchParams(search);
        params.set('band', state.band);
        params.set('date', state.dateKey);
        if (typeof index === 'number') params.set('prompt', String(index));
        else params.delete('prompt');
        var url = (typeof location !== 'undefined' ? location.pathname : '') + '?' + params.toString();
        try {
            history.replaceState(null, '', url);
        } catch (e) {
            /* some hosts block history updates; the card still works */
        }
    }

    function render(host, data, state) {
        var timer = null;
        var task = data.task || {};
        var rules = data.rules || {};

        var chrome = state.chrome || 'full';
        var head = '';
        if (chrome === 'full') {
            head =
                '<div class="dw-head">' +
                    '<h2>🎡 ' + esc(data.title) + ' — daily wheel</h2>' +
                    '<p>' + esc(data.subtitle || '') + '</p>' +
                '</div>';
        } else if (chrome === 'compact') {
            head = '<div class="dw-head dw-head--compact"><span class="dw-eyebrow">🎡 Daily speaking wheel</span></div>';
        }

        host.innerHTML =
            '<section class="dw' + (chrome === 'full' ? '' : ' dw--embed') + '">' +
                head +
                '<div class="dw-bands" role="group" aria-label="CEFR band"></div>' +
                '<div class="dw-machine">' +
                    '<div class="dw-window" aria-hidden="true">' +
                        '<span class="dw-window-text is-idle">PULL</span>' +
                    '</div>' +
                    '<button type="button" class="dw-lever" aria-label="Pull the lever for a random prompt">' +
                        '<span class="dw-lever-pivot" aria-hidden="true">' +
                            '<span class="dw-lever-arm" aria-hidden="true">' +
                                '<span class="dw-lever-knob" aria-hidden="true">SPIN</span>' +
                            '</span>' +
                        '</span>' +
                    '</button>' +
                '</div>' +
                '<p class="dw-hint">Pull the lever for a random prompt. Prep, then speak.</p>' +
                '<div class="dw-result" aria-live="polite"></div>' +
            '</section>';

        var lever = host.querySelector('.dw-lever');
        var machine = host.querySelector('.dw-machine');
        var windowEl = host.querySelector('.dw-window');
        var windowText = host.querySelector('.dw-window-text');
        var result = host.querySelector('.dw-result');
        var bands = host.querySelector('.dw-bands');
        var items = [];
        var deck = [];
        var lastIndex = -1;
        var spinning = false;
        var flickerTimer = null;

        function setWindow(text, idle) {
            windowText.textContent = text;
            windowText.classList.toggle('is-idle', !!idle);
        }

        function drawIndex() {
            if (!deck.length) deck = refillDeck(items.length, lastIndex, Math.random);
            lastIndex = deck.pop();
            return lastIndex;
        }

        function paint() {
            items = pickWheelPrompts(data.prompts, state.band, state.dateKey, DECK_SIZE);
            if (flickerTimer) { clearTimeout(flickerTimer); flickerTimer = null; }
            deck = [];
            lastIndex = -1;
            spinning = false;
            result.innerHTML = '';
            lever.classList.remove('is-pulling');
            machine.classList.remove('is-pulling');
            windowEl.classList.remove('is-rolling', 'is-locked');
            setWindow('PULL', true);
            if (!items.length) {
                result.innerHTML = '<div class="dw-card">No prompts for this band yet.</div>';
                lever.disabled = true;
                return;
            }
            lever.disabled = false;
        }

        BANDS.forEach(function (b) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dw-band';
            btn.textContent = b.toUpperCase();
            btn.setAttribute('aria-pressed', String(b === state.band));
            btn.addEventListener('click', function () {
                state.band = b;
                Array.prototype.forEach.call(bands.children, function (c) {
                    c.setAttribute('aria-pressed', String(c === btn));
                });
                paint();
                syncUrl(host, data, state);
            });
            bands.appendChild(btn);
        });

        function showCard(item) {
            var sides = item.side_a
                ? '<div class="dw-sides"><span class="dw-side">' + esc(item.side_a) + '</span>' +
                  '<span class="dw-vs">vs</span><span class="dw-side">' + esc(item.side_b) + '</span></div>'
                : '';
            var follow = (item.follow_ups || []).length
                ? '<ul class="dw-follow">' + item.follow_ups.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>'
                : '';
            var vocab = (typeof window !== 'undefined' && window.COSYVocab) ? window.COSYVocab : null;
            var chips = (item.structures || []).map(function (c) {
                return '<span class="dw-chip">' + esc(c) + '</span>';
            }).concat((item.vocabulary || []).map(function (word) {
                if (!vocab) return '<span class="dw-chip">' + esc(word) + '</span>';
                var rel = vocab.forBand(word, state.band, state.lang);
                var rows = '';
                if (rel.antonyms.length) rows += '<span class="dw-rel dw-rel-ant">↔ ' + esc(rel.antonyms.join(', ')) + '</span>';
                if (rel.synonyms.length) rows += '<span class="dw-rel">≈ ' + esc(rel.synonyms.join(', ')) + '</span>';
                if (!rows) return '<span class="dw-chip">' + esc(word) + '</span>';
                return '<span class="dw-chip dw-chip-rel"><strong>' + esc(word) + '</strong>' + rows + '</span>';
            })).join('');
            var prep = task.prep_seconds || 300;
            var speak = task.speak_seconds || 300;

            var quote = item.attribution
                ? '<h3 class="dw-prompt dw-quote">“' + esc(item.prompt) + '”</h3>' +
                  '<p class="dw-attribution">— ' + esc(item.attribution) + '</p>'
                : '<h3 class="dw-prompt">' + esc(item.prompt) + '</h3>';
            var sing = item.sing
                ? '<p class="dw-sing"><strong>🎤 Sing:</strong> ' + esc(item.sing) + '</p>'
                : '';

            result.innerHTML =
                '<div class="dw-card">' +
                    '<span class="dw-kicker">' + esc(state.band.toUpperCase()) + ' · ' + esc(data.title) + '</span>' +
                    quote + sing +
                    sides + follow +
                    (chips ? '<div class="dw-chips">' + chips + '</div>' : '') +
                    '<div class="dw-timer">' +
                        '<button type="button" data-timer="prep">Prep ' + Math.round(prep / 60) + ' min</button>' +
                        '<span class="dw-clock" data-clock>—</span>' +
                        '<button type="button" data-timer="speak">Speak ' + Math.round(speak / 60) + ' min</button>' +
                    '</div>' +
                    '<p class="dw-rules">' + (rules.research_allowed ? 'You may look things up online.' : 'No research.') +
                        ' You may not use AI.</p>' +
                '</div>';

            var clock = result.querySelector('[data-clock]');
            function startTimer(seconds) {
                if (timer) clearInterval(timer);
                var left = seconds;
                clock.textContent = formatClock(left);
                timer = setInterval(function () {
                    left -= 1;
                    clock.textContent = formatClock(Math.max(left, 0));
                    if (left <= 0) {
                        clearInterval(timer);
                        timer = null;
                        clock.textContent = 'Time!';
                    }
                }, 1000);
            }
            Array.prototype.forEach.call(result.querySelectorAll('[data-timer]'), function (btn) {
                btn.addEventListener('click', function () {
                    startTimer(btn.getAttribute('data-timer') === 'prep' ? prep : speak);
                });
            });
        }

        lever.addEventListener('click', function () {
            if (!items.length || spinning) return;
            if (timer) { clearInterval(timer); timer = null; }
            spinning = true;
            lever.disabled = true;
            var index = drawIndex();
            var reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

            function finish(shown) {
                if (flickerTimer) { clearTimeout(flickerTimer); flickerTimer = null; }
                setWindow(truncate(items[shown].prompt, 90), false);
                showCard(items[shown]);
                syncUrl(host, data, state, shown);
                lever.classList.remove('is-pulling');
                machine.classList.remove('is-pulling');
                windowEl.classList.remove('is-rolling');
                windowEl.classList.add('is-locked');
                setTimeout(function () { windowEl.classList.remove('is-locked'); }, 300);
                lever.disabled = false;
                spinning = false;
            }

            lever.classList.add('is-pulling');
            machine.classList.add('is-pulling');
            windowEl.classList.add('is-rolling');
            windowEl.classList.remove('is-locked');
            if (reduced) {
                finish(index);
                return;
            }

            // The reel starts fast and slows down, then the prompt locks in.
            var frames = [40, 45, 50, 55, 60, 70, 85, 100, 120, 140];
            var start = Math.floor(Math.random() * items.length);
            var step = 0;
            function roll() {
                if (!spinning) return;
                setWindow(truncate(items[(start + step) % items.length].prompt, 60), false);
                step += 1;
                if (step >= frames.length) { finish(index); return; }
                flickerTimer = setTimeout(roll, frames[step]);
            }
            flickerTimer = setTimeout(roll, frames[0]);
        });

        paint();

        if (typeof state.prompt === 'number' && state.prompt >= 0 && state.prompt < items.length) {
            lastIndex = state.prompt;
            setWindow(truncate(items[state.prompt].prompt, 90), false);
            showCard(items[state.prompt]);
        }
    }

    function initAll() {
        if (typeof document === 'undefined') return;
        var mounts = document.querySelectorAll('[data-daily-wheel]');
        var lexicon = mounts.length && mounts[0].getAttribute('data-lexicon');
        ensureVocab(lexicon);
        Array.prototype.forEach.call(mounts, function (el) {
            if (!el.__dailyWheelMounted) {
                el.__dailyWheelMounted = true;
                mount(el);
            }
        });
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }
    }

    return {
        BANDS: BANDS,
        DECK_SIZE: DECK_SIZE,
        SEGMENTS: DECK_SIZE,
        localDateKey: localDateKey,
        daysSinceEpoch: daysSinceEpoch,
        pickWheelPrompts: pickWheelPrompts,
        shuffledIndices: shuffledIndices,
        refillDeck: refillDeck,
        parseQuery: parseQuery,
        wheelForDate: wheelForDate,
        WEEKLY_ROTATION: WEEKLY_ROTATION,
        truncate: truncate,
        initAll: initAll
    };
});
