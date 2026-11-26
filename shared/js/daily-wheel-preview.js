/**
 * Lightweight daily-wheel hooks for hub pages: today's club banner and one-line
 * prompt previews inside club cards. The full wheel lives in daily-wheel.js.
 */
(function () {
    'use strict';

    var BAND = 'b1-b2';

    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function api() {
        return typeof window !== 'undefined' ? window.CosyDailyWheel : null;
    }

    function todayKey() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function fillBanners() {
        var wheelApi = api();
        if (!wheelApi) return;
        var today = wheelApi.wheelForDate(new Date());
        Array.prototype.forEach.call(document.querySelectorAll('[data-daily-wheel-banner]'), function (el) {
            var title = el.querySelector('[data-wheel-title]');
            var link = el.querySelector('a');
            if (title) title.textContent = today.title;
            if (link) link.setAttribute('href', 'today.html');
            el.hidden = false;
        });
    }

    function fillPreviews() {
        var slots = document.querySelectorAll('[data-wheel-preview]');
        if (!slots.length) return;
        var wheelApi = api();
        Array.prototype.forEach.call(slots, function (slot) {
            var id = slot.getAttribute('data-wheel-preview');
            fetch('data/wheels/' + id + '.json')
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (data) {
                    if (!data || !wheelApi) return;
                    var prompts = wheelApi.pickWheelPrompts(data.prompts, BAND, todayKey(), 8);
                    var pick = prompts[0];
                    if (!pick || !pick.prompt) return;
                    var text = pick.prompt.length > 120 ? pick.prompt.slice(0, 117).trim() + '…' : pick.prompt;
                    slot.innerHTML = 'Today: <em>' + esc(text) + '</em>';
                    slot.hidden = false;
                })
                .catch(function () { /* the card simply stays as it was */ });
        });
    }

    function start() {
        fillBanners();
        fillPreviews();
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}());
