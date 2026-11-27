/**
 * COSYlanguages Daily Directory Component
 * File: js/daily-directory.js
 *
 * One shared directory of every daily surface in the COSYlanguages ecosystem. Each repository keeps its
 * daily content where it belongs; this component only links out to the page that owns it, so no
 * repository copies another's content.
 *
 * Hosts mount it with:
 *   <link rel="stylesheet" href="https://cosylanguages.github.io/COSYlanguages/css/daily-directory.css">
 *   <div data-daily-directory data-self="COSYdata"></div>
 *   <script src="https://cosylanguages.github.io/COSYlanguages/js/daily-directory.js" defer></script>
 *
 * `data-self` (data|practice|languages|events|tools) marks the host's own card as "You are here";
 * `data-lang` (en|fr|it|ru|el) localises the heading and the badge.
 */

(function () {
    'use strict';

    var BASE = 'https://cosylanguages.github.io/';

    // The registry that lists every daily element, its owner and its data source. The built-in
    // DESTINATIONS below stay as the offline fallback; when the registry loads it replaces them.
    var MANIFEST_URL = BASE + 'COSYtools/shared/js/daily-manifest.json';

    // Canonical homes of the ecosystem daily surfaces, grouped by the repository that owns each one.
    // This list also carries the COSYtools drills; COSYtools' own daily page lists only its four sibling
    // owners (COSYtools/shared/js/daily-feed.js DAILY_DESTINATIONS), since there it is the host itself.
    var DESTINATIONS = [
        {
            key: 'data', repo: 'COSYdata', icon: '📖',
            title: 'Vocabulary of the Day',
            url: BASE + 'COSYdata/',
            description: 'Word, verb, verb + preposition, phrasal verb and idiom of the day, generated from the dictionary.',
            slots: [
                { label: 'Word of the Day', icon: '📖' },
                { label: 'Verb of the Day', icon: '🔤' },
                { label: 'Verb + Preposition', icon: '🧩' },
                { label: 'Phrasal Verb of the Day', icon: '🔗' },
                { label: 'Idiom of the Day', icon: '💬' }
            ]
        },
        {
            key: 'practice', repo: 'COSYpractice', icon: '🗣️',
            title: 'Speaking & Writing',
            url: BASE + 'COSYpractice/#daily-challenge',
            description: 'Daily speaking and writing prompts plus the rotating Daily Challenge with streaks.',
            slots: [
                { label: 'Speaking Prompt', icon: '🗣️' },
                { label: 'Writing Prompt', icon: '✍️' },
                { label: 'Daily Challenge', icon: '🏆' }
            ]
        },
        {
            key: 'languages', repo: 'COSYlanguages', icon: '🌍',
            title: 'Daily Strip',
            url: BASE + 'COSYlanguages/',
            description: 'The hub daily strip: word, verb, speaking and writing prompts, and a fun fact, with level filtering.',
            slots: [
                { label: 'Word & Verb', icon: '📖' },
                { label: 'Speaking & Writing', icon: '✍️' },
                { label: 'Fun Fact', icon: '💡' }
            ]
        },
        {
            key: 'events', repo: 'COSYevents', icon: '🎉',
            title: 'Culture & Events',
            url: BASE + 'COSYevents/',
            description: 'Daily spotlights: holiday of the day, today in science, music, and film & TV.',
            slots: [
                { label: 'Holiday of the Day', icon: '🎊' },
                { label: 'Today in Science', icon: '🔬' },
                { label: 'Today in Music', icon: '🎵' },
                { label: 'Today in Film & TV', icon: '🎬' }
            ]
        },
        {
            key: 'tools', repo: 'COSYtools', icon: '🛠️',
            title: 'Daily Drills',
            url: BASE + 'COSYtools/practice/daily/',
            description: 'Drill today\'s verb conjugation and guess the preposition, tuned to the vocabulary of the day.',
            slots: [
                { label: 'Conjugation Drill', icon: '🔤' },
                { label: 'Preposition Drill', icon: '🎯' }
            ]
        }
    ];

    var I18N = {
        en: { more: 'More dailies across COSYlanguages', heading: 'Daily across the COSYlanguages ecosystem', sub: 'Every daily element stays in the repository that owns it — follow a card to read it there.', self: 'You are here', open: 'Open' },
        fr: { more: 'Plus de quotidiens dans COSYlanguages', heading: 'Le quotidien dans l\'écosystème COSYlanguages', sub: 'Chaque élément quotidien reste dans le dépôt qui le possède — suivez une carte pour le lire là-bas.', self: 'Vous êtes ici', open: 'Ouvrir' },
        it: { more: 'Altri quotidiani in COSYlanguages', heading: 'Il quotidiano nell\'ecosistema COSYlanguages', sub: 'Ogni elemento quotidiano resta nel repository che lo possiede — segui una scheda per leggerlo lì.', self: 'Sei qui', open: 'Apri' },
        ru: { more: 'Ещё ежедневное в COSYlanguages', heading: 'Ежедневное в экосистеме COSYlanguages', sub: 'Каждый ежедневный элемент остаётся в своём репозитории — откройте карточку, чтобы прочитать его там.', self: 'Вы здесь', open: 'Открыть' },
        el: { more: 'Περισσότερα καθημερινά στο COSYlanguages', heading: 'Καθημερινά στο οικοσύστημα COSYlanguages', sub: 'Κάθε καθημερινό στοιχείο μένει στο αποθετήριο που το κατέχει — ακολουθήστε μια κάρτα για να το διαβάσετε εκεί.', self: 'Είστε εδώ', open: 'Άνοιγμα' }
    };

    // Card copy per owner. The registry (COSYtools daily-manifest.json) declares
    // English titles, so a translation here wins over whatever it sends.
    var CARD_I18N = {
        en: {},
        fr: {
            data: { title: 'Vocabulaire du jour', description: 'Mot, verbe, verbe + préposition, verbe à particule et expression du jour, générés à partir du dictionnaire.' },
            practice: { title: 'Expression orale et écrite', description: "Invites quotidiennes d'expression orale et écrite, plus le Défi du jour avec séries." },
            languages: { title: 'Bandeau quotidien', description: "Le bandeau quotidien du hub : mot, verbe, invites d'oral et d'écrit, et une anecdote, avec filtre par niveau." },
            events: { title: 'Culture et événements', description: 'Projecteurs du jour : fête du jour, science, musique, cinéma et télévision.' },
            tools: { title: 'Exercices quotidiens', description: "Entraînez la conjugaison du verbe du jour et devinez la préposition, en lien avec le vocabulaire du jour." }
        },
        it: {
            data: { title: 'Vocabolario del giorno', description: 'Parola, verbo, verbo + preposizione, phrasal verb e modo di dire del giorno, generati dal dizionario.' },
            practice: { title: 'Parlato e scritto', description: 'Spunti quotidiani di speaking e writing più la Sfida del giorno con le serie.' },
            languages: { title: 'Striscia quotidiana', description: "La striscia quotidiana dell'hub: parola, verbo, spunti di speaking e writing e una curiosità, con filtro per livello." },
            events: { title: 'Cultura ed eventi', description: 'Riflettori del giorno: festa del giorno, scienza, musica, cinema e TV.' },
            tools: { title: 'Esercizi quotidiani', description: 'Esercita la coniugazione del verbo del giorno e indovina la preposizione, in linea con il vocabolario del giorno.' }
        },
        ru: {
            data: { title: 'Слово дня', description: 'Слово, глагол, глагол + предлог, фразовый глагол и идиома дня — генерируются из словаря.' },
            practice: { title: 'Говорение и письмо', description: 'Ежедневные задания на говорение и письмо плюс «Вызов дня» с сериями.' },
            languages: { title: 'Дневная лента', description: 'Дневная лента хаба: слово, глагол, задания на говорение и письмо и интересный факт, с фильтром по уровню.' },
            events: { title: 'Культура и события', description: 'Ежедневные подборки: праздник дня, наука, музыка, кино и ТВ.' },
            tools: { title: 'Ежедневные упражнения', description: 'Тренируйте спряжение глагола дня и угадывайте предлог — в связке со словарём дня.' }
        },
        el: {
            data: { title: 'Λέξη της ημέρας', description: 'Λέξη, ρήμα, ρήμα + πρόθεση, phrasal verb και ιδιωτισμός της ημέρας, από το λεξικό.' },
            practice: { title: 'Ομιλία και γραφή', description: 'Καθημερινά θέματα ομιλίας και γραφής και η Πρόκληση της ημέρας με σερί.' },
            languages: { title: 'Καθημερινή λωρίδα', description: 'Η καθημερινή λωρίδα του κόμβου: λέξη, ρήμα, θέματα ομιλίας και γραφής και μια διασκεδαστική πληροφορία, με φίλτρο επιπέδου.' },
            events: { title: 'Πολιτισμός και εκδηλώσεις', description: 'Καθημερινά στιγμιότυπα: γιορτή της ημέρας, επιστήμη, μουσική, κινηματογράφος και τηλεόραση.' },
            tools: { title: 'Καθημερινές ασκήσεις', description: 'Εξασκηθείτε στην κλίση του ρήματος της ημέρας και μαντέψτε την πρόθεση, με βάση το λεξικό της ημέρας.' }
        }
    };

    function cardCopy(lang, dest) {
        var table = CARD_I18N[lang] || {};
        return table[dest.key] || {};
    }

    var instanceSeq = 0;

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function stringsFor(lang) {
        return I18N[lang] || I18N.en;
    }

    function cardHTML(dest, selfKey, t, lang) {
        var isSelf = dest.key === selfKey;
        var copy = cardCopy(lang, dest);
        var slotsHTML = dest.slots.map(function (s) {
            return '<li class="daily-directory-slot">' +
                (s.icon ? '<span class="daily-directory-slot-icon" aria-hidden="true">' + escapeHTML(s.icon) + '</span> ' : '') +
                escapeHTML(s.label) + '</li>';
        }).join('');

        var actionHTML = isSelf
            ? '<span class="daily-directory-badge" aria-current="true">✓ ' + escapeHTML(t.self) + '</span>'
            : '<a class="daily-directory-link" href="' + escapeHTML(dest.url) + '" target="_blank" rel="noopener">' +
                escapeHTML(t.open) + ' ' + escapeHTML(dest.repo) + ' <span class="daily-directory-ext" aria-hidden="true">↗</span></a>';

        return '<article class="daily-directory-card' + (isSelf ? ' is-self' : '') + '">' +
            '<h3 class="daily-directory-card-title">' +
                '<span class="daily-directory-icon" aria-hidden="true">' + escapeHTML(dest.icon) + '</span> ' +
                escapeHTML(copy.title || dest.title) +
            '</h3>' +
            '<p class="daily-directory-repo">' + escapeHTML(dest.repo) + '</p>' +
            '<p class="daily-directory-desc">' + escapeHTML(copy.description || dest.description) + '</p>' +
            '<ul class="daily-directory-slots">' + slotsHTML + '</ul>' +
            actionHTML +
        '</article>';
    }

    // Compact form for embedding under another daily surface (the hub strip): one line of chips
    // linking to the other owners. Hover or focus a chip to see what that owner publishes each day.
    function compactHTML(selfKey, t, lang) {
        var chips = DESTINATIONS.filter(function (d) { return d.key !== selfKey; }).map(function (d) {
            var tip = d.slots.map(function (s) { return s.label; }).join(' · ');
            var copy = cardCopy(lang, d);
            return '<a class="daily-directory-chip" href="' + escapeHTML(d.url) + '" target="_blank" rel="noopener" title="' + escapeHTML(tip) + '">' +
                '<span aria-hidden="true">' + escapeHTML(d.icon) + '</span> ' + escapeHTML(copy.title || d.title) +
                ' <span class="daily-directory-ext" aria-hidden="true">↗</span></a>';
        }).join('');
        return '<nav class="daily-directory daily-directory--compact" aria-label="' + escapeHTML(t.more) + '">' +
            '<span class="daily-directory-more">🌐 ' + escapeHTML(t.more) + '</span>' + chips + '</nav>';
    }

    var rendered = [];

    function render(host) {
        if (rendered.indexOf(host) === -1) rendered.push(host);
        var selfKey = (host.getAttribute('data-self') || '').trim();
        var lang = (host.getAttribute('data-lang') || document.documentElement.lang || 'en').slice(0, 2);
        var t = stringsFor(lang);
        if (host.getAttribute('data-compact') === 'true') {
            host.innerHTML = compactHTML(selfKey, t, lang);
            return;
        }
        var titleId = 'daily-directory-title-' + (++instanceSeq);

        host.innerHTML =
            '<section class="daily-directory" aria-labelledby="' + titleId + '">' +
                '<header class="daily-directory-header">' +
                    '<h2 class="daily-directory-title" id="' + titleId + '">🌐 ' + escapeHTML(t.heading) + '</h2>' +
                    '<p class="daily-directory-sub">' + escapeHTML(t.sub) + '</p>' +
                '</header>' +
                '<div class="daily-directory-grid">' +
                    DESTINATIONS.map(function (d) { return cardHTML(d, selfKey, t, lang); }).join('') +
                '</div>' +
            '</section>';
    }

    // Host cards from the registry, with each slot resolved to the element it names.
    function hostsFromManifest(manifest) {
        if (!manifest || !Array.isArray(manifest.directory) || !manifest.directory.length) return null;
        var byId = {};
        (manifest.elements || []).forEach(function (el) { byId[el.id] = el; });
        return manifest.directory.map(function (host) {
            return {
                key: host.key,
                repo: host.repo,
                icon: host.icon,
                title: host.title,
                url: host.url,
                description: host.description,
                slots: (host.slots || []).map(function (id) {
                    var el = byId[id];
                    return { label: el ? el.title : id, icon: el ? el.icon : '' };
                })
            };
        });
    }

    function adoptManifest() {
        if (typeof fetch !== 'function') return;
        fetch(MANIFEST_URL)
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (manifest) {
                var hosts = hostsFromManifest(manifest);
                if (!hosts) return;
                DESTINATIONS = hosts;
                Array.prototype.forEach.call(document.querySelectorAll('[data-daily-directory]'), function (el) {
                    el.__dailyDirectoryRendered = false;
                });
                initAll();
            })
            .catch(function () { /* keep the built-in list */ });
    }

    // The heading and the cards follow the interface language, which the engine
    // resolves asynchronously: without this the first paint keeps the English
    // labels it read before the dictionary arrived.
    function relabel() {
        rendered.forEach(function (host) {
            if (!host || host.isConnected === false) return;
            if (host.getAttribute('data-lang')) return;
            render(host);
        });
    }

    // cosyI18nReady fires after the first dictionary load, cosyLanguageChanged on
    // every later switch; the directory is painted at DOMContentLoaded, before either.
    document.addEventListener('cosyI18nReady', relabel);
    document.addEventListener('cosyLanguageChanged', relabel);

    function initAll() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-daily-directory]'), function (el) {
            if (!el.__dailyDirectoryRendered) {
                render(el);
                el.__dailyDirectoryRendered = true;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initAll();
            adoptManifest();
        });
    } else {
        initAll();
        adoptManifest();
    }

    window.COSY_DailyDirectory = {
        DESTINATIONS: DESTINATIONS,
        hostsFromManifest: hostsFromManifest,
        render: render,
        renderCompact: function (host) { host.setAttribute('data-compact', 'true'); render(host); host.__dailyDirectoryRendered = true; },
        destinations: function () {
            return DESTINATIONS.map(function (d) {
                return {
                    key: d.key, repo: d.repo, title: d.title, icon: d.icon, url: d.url,
                    description: d.description,
                    slots: d.slots.map(function (s) { return { label: s.label, icon: s.icon }; })
                };
            });
        }
    };
})();
