/**
 * shared/js/daily-wheel.js
 *
 * A daily speaking wheel for the club pages. The set of prompts is deterministic for the
 * date, band and language; the spin is the learner's own. One file serves every wheel page:
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

    var BANDS = ['a0-a1', 'a2', 'b1-b2', 'c1-c2'];
    var SEGMENTS = 8;
    var PALETTE = ['#993556', '#2B6CB0', '#1A7A4A', '#B7791F', '#6B46C1', '#C05621', '#2C7A7B', '#B83280'];

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
        var n = Math.min(count || SEGMENTS, pool.length);
        var start = Math.abs(daysSinceEpoch(dateKey)) % pool.length;
        var out = [];
        for (var i = 0; i < n; i++) out.push(pool[(start + i) % pool.length]);
        return out;
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
            '.dw-head h2{margin:0 0 .35rem;font-family:"Playfair Display",serif;font-size:1.5rem;}',
            '.dw-head p{margin:0 0 1.25rem;color:var(--muted,#6b6560);font-size:.95rem;}',
            '.dw-bands{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem;}',
            '.dw-band{border:1px solid #d9d2c7;background:#fff;color:#4a443e;border-radius:999px;padding:.35rem .9rem;font:inherit;font-size:.85rem;cursor:pointer;}',
            '.dw-band[aria-pressed="true"]{background:#993556;border-color:#993556;color:#fff;font-weight:600;}',
            '.dw-stage{position:relative;width:100%;max-width:360px;margin:0 auto;}',
            '.dw-pointer{position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-size:1.5rem;color:#993556;z-index:2;}',
            '.dw-canvas{display:block;width:100%;height:auto;border-radius:50%;box-shadow:0 8px 24px rgba(0,0,0,.12);transition:transform 2.4s cubic-bezier(.17,.67,.2,1);}',
            '.dw-spin{display:block;margin:1.25rem auto 0;background:#993556;color:#fff;border:0;border-radius:999px;padding:.7rem 2rem;font:inherit;font-weight:700;cursor:pointer;}',
            '.dw-spin:disabled{opacity:.55;cursor:default;}',
            '.dw-result{margin-top:1.5rem;}',
            '.dw-result:empty{display:none;}',
            '.dw-card{background:#fff;border:1px solid #e5e0d8;border-radius:20px;padding:1.5rem;}',
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
            '.dw-timer{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;margin-bottom:.9rem;}',
            '.dw-timer button{background:#2B6CB0;color:#fff;border:0;border-radius:999px;padding:.45rem 1rem;font:inherit;font-size:.85rem;font-weight:600;cursor:pointer;}',
            '.dw-clock{font-variant-numeric:tabular-nums;font-weight:700;min-width:3.4rem;}',
            '.dw-rules{margin:0;font-size:.82rem;color:#6b6560;}',
            '@media (prefers-reduced-motion: reduce){.dw-canvas{transition:none;}}'
        ].join('');
        document.head.appendChild(style);
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function drawWheel(canvas, items) {
        var ctx = canvas.getContext('2d');
        var size = canvas.width, r = size / 2, seg = (Math.PI * 2) / items.length;
        ctx.clearRect(0, 0, size, size);
        items.forEach(function (item, i) {
            var start = -Math.PI / 2 + i * seg, end = start + seg;
            ctx.beginPath();
            ctx.moveTo(r, r);
            ctx.arc(r, r, r - 4, start, end);
            ctx.closePath();
            ctx.fillStyle = PALETTE[i % PALETTE.length];
            ctx.fill();
            ctx.strokeStyle = '#FAF7F2';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(r, r);
            ctx.rotate(start + seg / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#fff';
            ctx.font = '600 11px system-ui, sans-serif';
            ctx.fillText(truncate(item.prompt, 26), r - 16, 4);
            ctx.restore();
        });
        ctx.beginPath();
        ctx.arc(r, r, 26, 0, Math.PI * 2);
        ctx.fillStyle = '#FAF7F2';
        ctx.fill();
    }

    function formatClock(seconds) {
        var m = Math.floor(seconds / 60), s = seconds % 60;
        return m + ':' + String(s).padStart(2, '0');
    }

    function mount(host) {
        var id = host.getAttribute('data-daily-wheel');
        var src = host.getAttribute('data-src') || ('data/wheels/' + id + '.json');
        var lang = (host.getAttribute('data-lang') || 'en').slice(0, 2);
        var band = host.getAttribute('data-band') || 'b1-b2';
        var dateKey = host.getAttribute('data-date') || localDateKey();

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
                render(host, data, { band: band, dateKey: dateKey });
            })
            .catch(function (err) {
                host.innerHTML = '<p class="dw-loading">The wheel could not load (' + esc(err.message) + ').</p>';
            });
    }

    function render(host, data, state) {
        var timer = null;
        var task = data.task || {};
        var rules = data.rules || {};

        host.innerHTML =
            '<section class="dw">' +
                '<div class="dw-head">' +
                    '<h2>🎡 ' + esc(data.title) + ' — daily wheel</h2>' +
                    '<p>' + esc(data.subtitle || '') + '</p>' +
                '</div>' +
                '<div class="dw-bands" role="group" aria-label="CEFR band"></div>' +
                '<div class="dw-stage">' +
                    '<div class="dw-pointer" aria-hidden="true">▼</div>' +
                    '<canvas class="dw-canvas" width="360" height="360" role="img" aria-label="Prompt wheel"></canvas>' +
                '</div>' +
                '<button type="button" class="dw-spin">Spin 🎯</button>' +
                '<div class="dw-result" aria-live="polite"></div>' +
            '</section>';

        var canvas = host.querySelector('.dw-canvas');
        var spin = host.querySelector('.dw-spin');
        var result = host.querySelector('.dw-result');
        var bands = host.querySelector('.dw-bands');
        var rotation = 0;
        var items = [];

        function paint() {
            items = pickWheelPrompts(data.prompts, state.band, state.dateKey, SEGMENTS);
            canvas.style.transform = 'rotate(0deg)';
            rotation = 0;
            result.innerHTML = '';
            if (!items.length) {
                result.innerHTML = '<div class="dw-card">No prompts for this band yet.</div>';
                spin.disabled = true;
                return;
            }
            spin.disabled = false;
            drawWheel(canvas, items);
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
            var chips = (item.structures || []).concat(item.vocabulary || []).map(function (c) {
                return '<span class="dw-chip">' + esc(c) + '</span>';
            }).join('');
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

        spin.addEventListener('click', function () {
            if (!items.length) return;
            if (timer) { clearInterval(timer); timer = null; }
            var index = Math.floor(Math.random() * items.length);
            var seg = 360 / items.length;
            rotation += 360 * 5 + (360 - (index * seg + seg / 2)) - (rotation % 360);
            canvas.style.transform = 'rotate(' + rotation + 'deg)';
            spin.disabled = true;
            var reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
            setTimeout(function () {
                spin.disabled = false;
                showCard(items[index]);
            }, reduced ? 0 : 2450);
        });

        paint();
    }

    function initAll() {
        if (typeof document === 'undefined') return;
        Array.prototype.forEach.call(document.querySelectorAll('[data-daily-wheel]'), function (el) {
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
        SEGMENTS: SEGMENTS,
        localDateKey: localDateKey,
        daysSinceEpoch: daysSinceEpoch,
        pickWheelPrompts: pickWheelPrompts,
        truncate: truncate,
        initAll: initAll
    };
});
