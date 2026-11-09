/**
 * COSYevents Studio Engine (shared/js/studio.js)
 * Interactive lesson & speaking club session builder with live slide preview,
 * schema validation, and strict founder-only modification access control.
 * Compatible with Node.js test environments and browser runtime.
 */
(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.CosyStudio = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Strict role check: only founder, admin, owner can create, edit, modify, update
  function isFounderRole(role) {
    if (!role || typeof role !== 'string') return false;
    var r = role.trim().toLowerCase();
    return r === 'founder' || r === 'admin' || r === 'owner';
  }

  // Initial default session template
  function createDefaultSession() {
    var today = new Date().toISOString().split('T')[0];
    return {
      slug: 'new-speaking-session',
      event: 'english-a2-foundations',
      title: 'New Speaking Club Session',
      theme: 'Everyday Life',
      language: 'English',
      level: 'A2',
      date: today,
      host: 'COSY Facilitator',
      summary: 'Practice engaging conversation, breakout room tasks, and vocabulary in this speaking club session.',
      activities: [
        {
          type: 'icebreaker',
          title: 'Warm-up & Introduction',
          instructions: 'Pair up in breakout rooms. Greet your partner and answer the question below.',
          content: '<ol>\n  <li>What is something surprising that happened to you this week?</li>\n  <li>Describe your favorite way to start a morning.</li>\n</ol>'
        },
        {
          type: 'round_1',
          title: 'Round 1: Core Discussion',
          instructions: 'In small groups, debate the following prompts and take notes on new expressions.',
          content: '<ol>\n  <li>Do you agree that routines make us more creative? Why or why not?</li>\n  <li>Share one habit you would like to adopt this year.</li>\n</ol>'
        }
      ],
      vocabulary: [
        {
          id: 'en:new-session:habit',
          word: 'habit',
          pos: 'noun',
          definition: 'a settled or regular tendency or practice',
          example: 'Good reading habits are built over time.',
          primary_theme: 'everyday-life',
          sub_theme: 'habits',
          level: 'A2'
        }
      ],
      sources: []
    };
  }

  // Standard 5-Stage Speaking Club Multi-Page preset structure
  function createStandardFiveStageSession() {
    var today = new Date().toISOString().split('T')[0];
    return {
      slug: 'interactive-5-stage-speaking-club',
      event: 'english-b1-intermediate',
      title: '5-Stage Speaking Club: Technology & Daily Life',
      theme: 'Technology and Modern Living',
      language: 'English',
      level: 'B1',
      date: today,
      host: 'COSY Facilitator',
      summary: 'A structured 5-page interactive speaking session: Warm-up check-in, Round 1 core prompts, Interlude flash debate, Round 2 future speculation, and Wrap-up takeaways.',
      activities: [
        {
          type: 'icebreaker',
          title: 'Page 1: Warm-up Check-in',
          instructions: 'Greet your breakout partner and answer the icebreaker questions below.',
          content: '<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-a">👤 Speaker A</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">What is the first digital device you look at in the morning?</div>\n  <span class="studio-starter-chip">To be honest...</span>\n  <span class="studio-starter-chip">I tend to check...</span>\n</div>\n\n<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-b">👥 Speaker B</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">If you had to unplug completely for 24 hours, how would you feel?</div>\n  <span class="studio-starter-chip">I would probably feel...</span>\n  <span class="studio-starter-chip">It sounds like a relief because...</span>\n</div>'
        },
        {
          type: 'round_1',
          title: 'Page 2: Round 1 — Core Discussion',
          instructions: 'In small breakout rooms of 3 students, discuss how technology affects relationships.',
          content: '<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-a">👤 Speaker A</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">Has digital communication made friendships stronger or more superficial?</div>\n  <div style="font-size: 0.82rem; font-style: italic; color: #5c5957; margin-bottom: 0.35rem;">★ Personal follow-up: How often do you call friends vs text?</div>\n  <span class="studio-starter-chip">From my perspective...</span>\n  <span class="studio-starter-chip">I see it both ways because...</span>\n</div>\n\n<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-b">👥 Speaker B</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">How do you set healthy boundaries with messaging apps and work emails?</div>\n  <span class="studio-starter-chip">My rule of thumb is...</span>\n  <span class="studio-starter-chip">I make sure to...</span>\n</div>\n\n<div class="card-audio-box">\n  <div class="card-audio-header">\n    <span class="card-audio-title">🎧 Native Speaker Perspective (60s)</span>\n    <span class="card-audio-badge">Audio Stream</span>\n  </div>\n  <audio class="card-audio-player" controls preload="metadata">\n    <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">\n  </audio>\n</div>'
        },
        {
          type: 'interlude',
          title: 'Page 3: Interlude — Flash Debate & Vote',
          instructions: 'Vote A or B! Choose your stance in 30 seconds and defend it to the group.',
          content: '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">\n  <span style="font-weight:bold; font-size: 0.88rem;">Flash Vote: Quick Stance</span>\n  <span class="studio-classroom-timer-pill">⏱ 00:30 Flash Timer</span>\n</div>\n\n<ol>\n  <li><strong>Option A:</strong> Strictly ban phones during family meals and dinners.</li>\n  <li><strong>Option B:</strong> Allow flexible use as long as people are engaged.</li>\n</ol>\n\n<div class="card-links-box">\n  <a class="card-link-item" href="https://cosylanguages.github.io/COSYlanguages/" target="_blank" rel="noopener noreferrer">\n    <div class="card-link-meta">\n      <span class="card-link-title">🔗 COSY Debate Guideline & Voting Etiquette</span>\n      <span class="card-link-desc">Tips on respectful disagreement and persuasive phrasing</span>\n    </div>\n    <span style="font-size: 0.8rem; color: var(--st-accent);">↗</span>\n  </a>\n</div>'
        },
        {
          type: 'round_2',
          title: 'Page 4: Round 2 — Future Speculation',
          instructions: 'Speculate on how AI and automation will transform work and learning in the next 10 years.',
          content: '<ol>\n  <li>Which daily task do you hope AI completely replaces first?</li>\n  <li>Will language learning become obsolete because of real-time earpiece translation? Why or why not?</li>\n</ol>\n\n<div class="card-video-box">\n  <div class="card-video-responsive">\n    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video Material" allowfullscreen></iframe>\n  </div>\n  <div class="card-video-disclaimer">🎬 Educational video clip for discussion. Pause to answer comprehension prompts.</div>\n</div>'
        },
        {
          type: 'outro',
          title: 'Page 5: Wrap-up & Teacher Note',
          instructions: 'Group debrief, linguistic feedback, and personal takeaway sharing.',
          content: '<ol>\n  <li>One new phrase or expression you used successfully today:</li>\n  <li>One goal for next week\'s speaking session:</li>\n</ol>\n\n<div class="card-callout-box">\n  <div class="card-callout-title">🌟 Facilitator Debrief Note</div>\n  <p style="margin: 0; line-height: 1.5;">\n    Great use of conditional clauses (<em>If I had to..., I would...</em>). Remember to watch subject-verb agreement with collective nouns!\n  </p>\n</div>'
        }
      ],
      vocabulary: [
        {
          id: 'en:boundaries:noun',
          word: 'boundaries',
          pos: 'noun',
          definition: 'guidelines or limits that a person creates to identify safe and permissible ways for people to behave around them',
          example: 'Setting healthy digital boundaries helps prevent burnout.',
          primary_theme: 'everyday-life',
          sub_theme: 'wellbeing',
          level: 'B1'
        },
        {
          id: 'en:unplug:verb',
          word: 'unplug',
          pos: 'verb',
          definition: 'disconnect from digital technology and social media for a period of time',
          example: 'It is refreshing to unplug for an entire weekend in nature.',
          primary_theme: 'technology',
          sub_theme: 'lifestyle',
          level: 'B1'
        }
      ],
      sources: [
        { source_title: 'Digital Wellness Research', source_url: 'https://example.com/wellness' }
      ]
    };
  }

  // Preloaded sample sessions for quick editing in studio
  var KNOWN_SESSIONS = [
    {
      slug: 'daily-routines-and-habits',
      event: 'english-a2-foundations',
      title: 'Daily Routines and Habits',
      theme: 'Everyday Life',
      language: 'English',
      level: 'A2',
      date: '2025-05-10',
      host: 'COSY Facilitator',
      summary: 'Practice talking about your morning and evening routines using simple present tense and frequency adverbs.',
      activities: [
        {
          type: 'icebreaker',
          title: 'Morning Routine Check-in',
          instructions: 'Pair up and describe three things you do every morning before 9 AM.',
          content: '<ol>\n  <li>What is your essential morning drink: <strong>coffee or tea</strong>?</li>\n  <li>How does morning exercise affect your mood?</li>\n</ol>'
        },
        {
          type: 'roleplay',
          title: 'Scheduling a Weekend Activity',
          instructions: 'In pairs, plan a Saturday schedule that includes brunch, exercise, and reading.',
          content: '<ol>\n  <li>Use frequency adverbs: <em>always, sometimes, rarely</em>.</li>\n  <li>Reach an agreement on the best Saturday meetup time.</li>\n</ol>'
        }
      ],
      vocabulary: [
        {
          id: 'en:commute:noun',
          word: 'commute',
          pos: 'noun',
          definition: 'the regular journey to and from work or school',
          example: 'My daily commute takes thirty minutes by bus.',
          primary_theme: 'everyday-life',
          sub_theme: 'routines',
          level: 'A2'
        },
        {
          id: 'en:routine:noun',
          word: 'routine',
          pos: 'noun',
          definition: 'a sequence of actions regularly followed',
          example: 'Having a healthy morning routine helps me start the day well.',
          primary_theme: 'everyday-life',
          sub_theme: 'routines',
          level: 'A2'
        }
      ],
      sources: []
    },
    {
      slug: 'ordering-food-and-dining-out',
      event: 'english-a2-foundations',
      title: 'Ordering Food and Dining Out',
      theme: 'Food and Dining',
      language: 'English',
      level: 'A2',
      date: '2025-05-17',
      host: 'COSY Facilitator',
      summary: 'Practice ordering meals, asking about ingredients, and handling restaurant situations.',
      activities: [
        {
          type: 'icebreaker',
          title: 'Favorite Cuisine Warm-up',
          instructions: 'Share your favorite local dish and describe why you recommend it.',
          content: '<ol>\n  <li>What is your all-time favorite comfort dish?</li>\n  <li>Do you prefer cooking at home or eating at restaurants?</li>\n</ol>'
        },
        {
          type: 'roleplay',
          title: 'At the Bistro',
          instructions: 'One student is the waiter, the other is the customer ordering dinner with special requests.',
          content: '<ol>\n  <li>Customer: Ask for vegetarian options and the bill.</li>\n  <li>Waiter: Explain the daily specials and take the order politely.</li>\n</ol>'
        }
      ],
      vocabulary: [
        {
          id: 'en:appetizer:noun',
          word: 'appetizer',
          pos: 'noun',
          definition: 'a small dish of food served before the main meal',
          example: 'We ordered bruschetta as an appetizer.',
          primary_theme: 'food-dining',
          sub_theme: 'restaurant',
          level: 'A2'
        }
      ],
      sources: []
    }
  ];

  // Studio Application State
  var state = {
    session: createDefaultSession(),
    activeCardIndex: 0,
    presenterIndex: 0,
    userRole: 'guest',
    userEmail: null,
    isFounder: false,
    filterPage: 'all', // 'all' or specific 0-based page index
    authStep: 'email', // email or code
    authEmail: ''
  };

  // Safe DOM helper
  function $(id) {
    if (typeof document === 'undefined') return null;
    return document.getElementById(id);
  }

  // Sanitize simple text to escape HTML
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Strip HTML for plain text preview snippets
  function stripHtml(html) {
    if (typeof html !== 'string') return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
  }

  // Block generation templates
  function generateVideoBlock(videoUrl) {
    var url = videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    return (
      '<div class="card-video-box">\n' +
      '  <div class="card-video-responsive">\n' +
      '    <iframe src="' + (url.includes('youtube') ? url.replace('watch?v=', 'embed/') : url) + '" ' +
      'title="Video Material" allowfullscreen></iframe>\n' +
      '  </div>\n' +
      '  <div class="card-video-disclaimer">🎬 Educational video clip for discussion. Pause to answer comprehension prompts.</div>\n' +
      '</div>'
    );
  }

  function generateAudioBlock(audioUrl, title) {
    var src = audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    var trackTitle = title || 'Target Pronunciation & Listening Clip';
    return (
      '<div class="card-audio-box">\n' +
      '  <div class="card-audio-header">\n' +
      '    <span class="card-audio-title">🎧 ' + trackTitle + '</span>\n' +
      '    <span class="card-audio-badge">Audio Stream</span>\n' +
      '  </div>\n' +
      '  <audio class="card-audio-player" controls preload="metadata">\n' +
      '    <source src="' + src + '" type="audio/mpeg">\n' +
      '    Your browser does not support audio playback.\n' +
      '  </audio>\n' +
      '</div>'
    );
  }

  function generateLinkBlock(links) {
    var items = links || [
      { title: 'BBC Learning English Article', url: 'https://www.bbc.co.uk/learningenglish', desc: 'Pre-session reading and background context' },
      { title: 'COSYlanguages Vocabulary Guide', url: 'https://cosylanguages.github.io/COSYlanguages/', desc: 'Grammar and expression reference' }
    ];
    var html = '<div class="card-links-box">\n';
    items.forEach(function (item) {
      html +=
        '  <a class="card-link-item" href="' + item.url + '" target="_blank" rel="noopener noreferrer">\n' +
        '    <div class="card-link-meta">\n' +
        '      <span class="card-link-title">🔗 ' + item.title + '</span>\n' +
        '      <span class="card-link-desc">' + item.desc + '</span>\n' +
        '    </div>\n' +
        '    <span style="font-size: 0.8rem; color: var(--st-accent);">↗</span>\n' +
        '  </a>\n';
    });
    html += '</div>';
    return html;
  }

  function generateQuestionsBlock() {
    return (
      '<ol>\n' +
      '  <li>How often do you encounter this situation in your <strong>daily routine</strong>?</li>\n' +
      '  <li>What is the most <em>effective strategy</em> you have used to overcome it?</li>\n' +
      '  <li>In pairs, share one <strong>personal experience</strong> and one piece of advice.</li>\n' +
      '</ol>'
    );
  }

  function generateCalloutBlock() {
    return (
      '<div class="card-callout-box">\n' +
      '  <div class="card-callout-title">💡 Useful Language for Breakouts</div>\n' +
      '  <p style="margin: 0; line-height: 1.5;">\n' +
      '    • <strong>In my experience,...</strong> / <em>From my perspective,...</em><br>\n' +
      '    • <strong>I completely agree because...</strong> / <em>I see your point, but on the other hand...</em>\n' +
      '  </p>\n' +
      '</div>'
    );
  }

  // Sync inputs with state
  function syncFormFromState() {
    if (typeof document === 'undefined') return;

    var numCards = state.session.activities ? state.session.activities.length : 0;
    var estMinutes = Math.max(15, numCards * 12); // ~12-15 mins per page/breakout

    // Header crumbs
    var crumbEvent = $('crumb-event');
    if (crumbEvent) crumbEvent.textContent = state.session.event || 'events';
    var crumbTitle = $('crumb-title');
    if (crumbTitle) crumbTitle.textContent = state.session.title || 'Untitled Session';

    var sidebarTitle = $('sidebar-session-title');
    if (sidebarTitle) sidebarTitle.textContent = state.session.title || 'Session Pages';

    var cardsCount = $('sidebar-cards-count');
    if (cardsCount) cardsCount.textContent = numCards + ' pages • ' + estMinutes + ' min';

    // Details Tab
    if ($('input-session-title')) $('input-session-title').value = state.session.title || '';
    if ($('input-session-slug')) $('input-session-slug').value = state.session.slug || '';
    if ($('input-session-event')) $('input-session-event').value = state.session.event || '';
    if ($('select-session-lang')) $('select-session-lang').value = state.session.language || 'English';
    if ($('select-session-level')) $('select-session-level').value = state.session.level || 'A2';
    if ($('input-session-theme')) $('input-session-theme').value = state.session.theme || '';
    if ($('input-session-host')) $('input-session-host').value = state.session.host || '';
    if ($('input-session-date')) $('input-session-date').value = state.session.date || '';
    if ($('input-session-recording')) $('input-session-recording').value = state.session.recording_url || '';
    if ($('textarea-session-summary')) $('textarea-session-summary').value = state.session.summary || '';

    // Sources
    if ($('textarea-session-sources')) {
      if (Array.isArray(state.session.sources) && state.session.sources.length > 0) {
        $('textarea-session-sources').value = state.session.sources.map(function (s) {
          return (s.source_title || '') + ' | ' + (s.source_url || '');
        }).join('\n');
      } else {
        $('textarea-session-sources').value = '';
      }
    }

    // Active Card Tab
    var activeCard = (state.session.activities && state.session.activities[state.activeCardIndex]) || null;
    if (activeCard) {
      if ($('input-card-title')) $('input-card-title').value = activeCard.title || '';
      if ($('select-card-type')) $('select-card-type').value = activeCard.type || 'discussion';
      if ($('textarea-card-instructions')) $('textarea-card-instructions').value = activeCard.instructions || '';
      if ($('textarea-card-content')) $('textarea-card-content').value = activeCard.content || '';
    } else {
      if ($('input-card-title')) $('input-card-title').value = '';
      if ($('textarea-card-instructions')) $('textarea-card-instructions').value = '';
      if ($('textarea-card-content')) $('textarea-card-content').value = '';
    }

    // Vocabulary count tab
    var vocabCount = $('vocab-tab-count');
    if (vocabCount) {
      vocabCount.textContent = (state.session.vocabulary ? state.session.vocabulary.length : 0);
    }

    // Raw JSON tab
    var rawText = $('textarea-raw-json');
    if (rawText) {
      rawText.value = JSON.stringify(state.session, null, 2);
    }

    renderCardsList();
    renderVocabList();
    renderLivePreview();
  }

  // Render left sidebar cards list & page filter pills
  function renderCardsList() {
    var container = $('cards-nav-list');
    var pillsContainer = $('sidebar-page-pills');
    if (!container) return;
    container.innerHTML = '';

    var acts = state.session.activities || [];

    // Render Quick Page Pills (All, P1, P2, P3...)
    if (pillsContainer) {
      pillsContainer.innerHTML = '';

      var allPill = document.createElement('button');
      allPill.type = 'button';
      allPill.className = 'page-pill-btn' + (state.filterPage === 'all' ? ' is-active' : '');
      allPill.textContent = 'All';
      allPill.title = 'Show all session pages';
      allPill.addEventListener('click', function () {
        state.filterPage = 'all';
        renderCardsList();
      });
      pillsContainer.appendChild(allPill);

      acts.forEach(function (act, idx) {
        var pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'page-pill-btn' + (state.filterPage === idx ? ' is-active' : '');
        pill.textContent = 'P' + (idx + 1);
        pill.title = 'Jump to Page ' + (idx + 1) + ': ' + (act.title || 'Page');
        pill.addEventListener('click', function () {
          state.filterPage = idx;
          state.activeCardIndex = idx;
          syncFormFromState();
        });
        pillsContainer.appendChild(pill);
      });
    }

    acts.forEach(function (act, idx) {
      if (state.filterPage !== 'all' && state.filterPage !== idx) {
        return; // Filter out if viewing specific page
      }

      var item = document.createElement('div');
      item.className = 'card-thumb-item' + (idx === state.activeCardIndex ? ' is-active' : '');
      item.setAttribute('data-index', idx);
      item.setAttribute('role', 'listitem');

      var top = document.createElement('div');
      top.className = 'card-thumb-top';

      var titleSpan = document.createElement('span');
      titleSpan.className = 'card-thumb-title';
      titleSpan.textContent = act.title || 'Page ' + (idx + 1);

      var numSpan = document.createElement('span');
      numSpan.className = 'card-thumb-num';
      numSpan.textContent = 'Page ' + (idx + 1);

      top.appendChild(titleSpan);
      top.appendChild(numSpan);

      var preview = document.createElement('div');
      preview.className = 'card-thumb-preview-box';
      var snippet = stripHtml(act.content || act.instructions || '');
      preview.textContent = snippet || '(No card content)';

      var bottom = document.createElement('div');
      bottom.className = 'card-thumb-bottom';

      var status = document.createElement('span');
      status.className = 'card-thumb-status is-draft';
      status.textContent = act.type ? act.type.toUpperCase() : 'STEP';

      bottom.appendChild(status);

      item.appendChild(top);
      item.appendChild(preview);
      item.appendChild(bottom);

      item.addEventListener('click', function () {
        state.activeCardIndex = idx;
        syncFormFromState();
      });

      container.appendChild(item);
    });
  }

  // Render Vocabulary List
  function renderVocabList() {
    var container = $('vocab-items-list');
    if (!container) return;
    container.innerHTML = '';

    var vocabs = state.session.vocabulary || [];
    if (vocabs.length === 0) {
      container.innerHTML = '<p style="color: var(--st-ink-muted); font-size: 0.85rem; font-style: italic;">No vocabulary items yet. Click "+ Add Word" to add one.</p>';
      return;
    }

    vocabs.forEach(function (v, idx) {
      var row = document.createElement('div');
      row.className = 'vocab-builder-item';

      row.innerHTML =
        '<div>' +
        '  <strong style="font-size: 0.95rem;">' + escapeHtml(v.word) + '</strong>' +
        '  <span style="font-size: 0.75rem; color: var(--st-ink-muted); margin-left: 6px;">(' + escapeHtml(v.pos || 'pos') + ')</span>' +
        '  <span class="status-badge" style="background: var(--st-sunken); margin-left: 4px;">' + escapeHtml(v.level || 'A2') + '</span>' +
        '</div>' +
        '<div style="font-size: 0.84rem; color: var(--st-ink-secondary);">' +
        '  <div>' + escapeHtml(v.definition || '') + '</div>' +
        '  <div style="font-style: italic; color: var(--st-ink-muted); font-size: 0.78rem;">e.g. ' + escapeHtml(v.example || '') + '</div>' +
        '</div>' +
        '<div>' +
        '  <button type="button" class="btn btn-sm btn-ghost btn-del-vocab" data-index="' + idx + '" style="color: var(--st-danger); font-size: 0.8rem;">✕</button>' +
        '</div>';

      container.appendChild(row);
    });

    var delButtons = container.querySelectorAll('.btn-del-vocab');
    delButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (!state.isFounder) {
          alertFounderRequired();
          return;
        }
        var i = parseInt(btn.getAttribute('data-index'), 10);
        state.session.vocabulary.splice(i, 1);
        syncFormFromState();
      });
    });
  }

  // Render Right-pane live slide presentation preview
  function renderLivePreview() {
    var activeCard = (state.session.activities && state.session.activities[state.activeCardIndex]) || null;
    var totalCards = state.session.activities ? state.session.activities.length : 0;

    var slideIndicator = $('preview-slide-indicator');
    if (slideIndicator) slideIndicator.textContent = totalCards > 0 ? (state.activeCardIndex + 1) : 0;

    var slideTotal = $('preview-slide-total');
    if (slideTotal) slideTotal.textContent = '/ ' + totalCards;

    // Progress bar fill
    var progressFill = $('preview-progress-fill');
    if (progressFill) {
      var pct = totalCards > 0 ? Math.round(((state.activeCardIndex + 1) / totalCards) * 100) : 0;
      progressFill.style.width = pct + '%';
    }

    // Previous / Next button states
    var prevBtn = $('btn-preview-prev');
    var nextBtn = $('btn-preview-next');
    if (prevBtn) prevBtn.disabled = state.activeCardIndex <= 0;
    if (nextBtn) nextBtn.disabled = state.activeCardIndex >= totalCards - 1;

    var levelTag = $('preview-session-level-tag');
    if (levelTag) levelTag.textContent = state.session.level || 'A2';

    var typeTag = $('preview-card-type-tag');
    var titleEl = $('preview-card-title');
    var instrEl = $('preview-card-instructions');
    var contentEl = $('preview-card-content');
    var sourcesBox = $('preview-sources-box');
    var sourcesContent = $('preview-sources-content');

    if (activeCard) {
      if (typeTag) typeTag.textContent = (activeCard.type || 'ACTIVITY').toUpperCase();
      if (titleEl) titleEl.textContent = activeCard.title || 'Untitled Card';

      if (instrEl) {
        if (activeCard.instructions) {
          instrEl.textContent = activeCard.instructions;
          instrEl.style.display = 'block';
        } else {
          instrEl.style.display = 'none';
        }
      }

      if (contentEl) {
        contentEl.innerHTML = activeCard.content || '<p style="color: var(--st-ink-muted); font-style: italic;">No discussion prompts yet.</p>';
      }
    } else {
      if (typeTag) typeTag.textContent = 'NO CARDS';
      if (titleEl) titleEl.textContent = 'No Activity Selected';
      if (instrEl) instrEl.style.display = 'none';
      if (contentEl) contentEl.innerHTML = '<p>Click "+ Add Activity Card" to begin.</p>';
    }

    if (sourcesBox && sourcesContent) {
      if (Array.isArray(state.session.sources) && state.session.sources.length > 0) {
        sourcesBox.removeAttribute('hidden');
        sourcesContent.textContent = state.session.sources.map(function (s) {
          return s.source_title;
        }).join(', ');
      } else {
        sourcesBox.setAttribute('hidden', '');
      }
    }
  }

  // Fullscreen Multi-Page Presenter Deck System
  function openPresenterDeck(initialIndex) {
    var modal = $('presenter-modal');
    if (!modal) return;
    modal.removeAttribute('hidden');
    state.presenterIndex = typeof initialIndex === 'number' ? initialIndex : state.activeCardIndex;
    renderPresenterSlide();
  }

  function closePresenterDeck() {
    var modal = $('presenter-modal');
    if (modal) modal.setAttribute('hidden', '');
  }

  function renderPresenterSlide() {
    var acts = state.session.activities || [];
    var total = acts.length;
    if (total === 0) return;

    if (state.presenterIndex < 0) state.presenterIndex = 0;
    if (state.presenterIndex >= total) state.presenterIndex = total - 1;

    var cur = acts[state.presenterIndex];

    var deckTitle = $('presenter-deck-title');
    if (deckTitle) deckTitle.textContent = state.session.title || 'Session Deck';

    var counter = $('presenter-counter');
    if (counter) counter.textContent = (state.presenterIndex + 1) + ' / ' + total;

    var fill = $('presenter-progress-fill');
    if (fill) {
      var pct = Math.round(((state.presenterIndex + 1) / total) * 100);
      fill.style.width = pct + '%';
    }

    // Pills
    var pillsBox = $('presenter-page-pills');
    if (pillsBox) {
      pillsBox.innerHTML = '';
      acts.forEach(function (act, idx) {
        var pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'page-pill-btn' + (idx === state.presenterIndex ? ' is-active' : '');
        pill.textContent = 'P' + (idx + 1);
        pill.title = act.title || 'Page ' + (idx + 1);
        pill.addEventListener('click', function () {
          state.presenterIndex = idx;
          renderPresenterSlide();
        });
        pillsBox.appendChild(pill);
      });
    }

    var typeTag = $('presenter-type-tag');
    if (typeTag) typeTag.textContent = (cur.type || 'ROUND').toUpperCase();

    var levelTag = $('presenter-level-tag');
    if (levelTag) levelTag.textContent = state.session.level || 'A2';

    var pageTag = $('presenter-page-tag');
    if (pageTag) pageTag.textContent = 'Page ' + (state.presenterIndex + 1) + ' of ' + total;

    var title = $('presenter-title');
    if (title) title.textContent = cur.title || 'Page ' + (state.presenterIndex + 1);

    var instr = $('presenter-instructions');
    if (instr) {
      if (cur.instructions) {
        instr.textContent = cur.instructions;
        instr.style.display = 'block';
      } else {
        instr.style.display = 'none';
      }
    }

    var content = $('presenter-content');
    if (content) {
      content.innerHTML = cur.content || '';
    }

    var prevBtn = $('btn-presenter-prev');
    var nextBtn = $('btn-presenter-next');
    if (prevBtn) prevBtn.disabled = state.presenterIndex <= 0;
    if (nextBtn) nextBtn.disabled = state.presenterIndex >= total - 1;
  }

  // Alert founder requirement when a non-founder attempts to modify
  function alertFounderRequired() {
    var modal = $('auth-modal');
    if (modal) {
      modal.removeAttribute('hidden');
    }
    alert('Founder Mode Required: Only founders (founder, admin, owner) can create, edit, modify, or save sessions.');
  }

  // Apply locked/unlocked UI state based on role
  function applyRolePermissions() {
    if (typeof document === 'undefined') return;

    var isFounder = isFounderRole(state.userRole);
    state.isFounder = isFounder;

    var lockBanner = $('lock-banner');
    var saveBtn = $('btn-save-session');
    var addCardBtn = $('btn-add-card');
    var addVocabBtn = $('btn-add-vocab-item');
    var deleteCardBtn = $('btn-delete-card');
    var newSessionBtn = $('btn-new-session');

    var roleLabel = $('role-pill-label');
    var rolePill = $('btn-account-pill');

    if (roleLabel) {
      roleLabel.textContent = isFounder ? 'Founder' : (state.userRole === 'guest' ? 'Guest' : state.userRole);
    }

    if (rolePill) {
      if (isFounder) {
        rolePill.className = 'btn btn-ghost btn-sm role-pill role-founder';
      } else {
        rolePill.className = 'btn btn-ghost btn-sm role-pill role-guest';
      }
    }

    if (isFounder) {
      if (lockBanner) lockBanner.setAttribute('hidden', '');
      document.body.classList.remove('has-lock-banner');
      if (saveBtn) {
        saveBtn.removeAttribute('disabled');
        saveBtn.removeAttribute('aria-disabled');
      }
      if (addCardBtn) addCardBtn.removeAttribute('disabled');
      if (addVocabBtn) addVocabBtn.removeAttribute('disabled');
      if (deleteCardBtn) deleteCardBtn.removeAttribute('disabled');
      if (newSessionBtn) newSessionBtn.removeAttribute('disabled');

      enableFormControls(true);
    } else {
      if (lockBanner) lockBanner.removeAttribute('hidden');
      document.body.classList.add('has-lock-banner');
      if (saveBtn) {
        saveBtn.setAttribute('disabled', 'true');
        saveBtn.setAttribute('aria-disabled', 'true');
      }
      if (addCardBtn) addCardBtn.setAttribute('disabled', 'true');
      if (addVocabBtn) addVocabBtn.setAttribute('disabled', 'true');
      if (deleteCardBtn) deleteCardBtn.setAttribute('disabled', 'true');
      if (newSessionBtn) newSessionBtn.setAttribute('disabled', 'true');

      enableFormControls(false);
    }
  }

  // Enable/disable form inputs based on founder status
  function enableFormControls(enabled) {
    var inputs = document.querySelectorAll(
      '.center-scrollable-area input, .center-scrollable-area textarea, .center-scrollable-area select'
    );
    inputs.forEach(function (el) {
      if (el.id === 'textarea-raw-json') return;
      if (enabled) {
        el.removeAttribute('disabled');
        el.removeAttribute('readonly');
      } else {
        el.setAttribute('disabled', 'true');
      }
    });
  }

  // Detect and synchronize user role from CosyAuth, Supabase, or localStorage
  function checkAuthRole() {
    if (typeof window === 'undefined') return;

    // 1. Check window.CosyAuth
    if (window.CosyAuth) {
      var r = typeof window.CosyAuth.role === 'function' ? window.CosyAuth.role() : null;
      if (isFounderRole(r)) {
        state.userRole = r;
        applyRolePermissions();
        return;
      }
      var acc = typeof window.CosyAuth.getAccess === 'function' ? window.CosyAuth.getAccess() : null;
      if (acc && isFounderRole(acc.role)) {
        state.userRole = acc.role;
        applyRolePermissions();
        return;
      }
    }

    // 2. Check localStorage (cosy_user / cosy_user_role)
    try {
      var localRole = window.localStorage.getItem('cosy_user_role');
      if (localRole && isFounderRole(localRole)) {
        state.userRole = localRole;
        applyRolePermissions();
        return;
      }
      var rawUser = window.localStorage.getItem('cosy_user');
      if (rawUser) {
        var parsed = JSON.parse(rawUser);
        if (parsed && isFounderRole(parsed.role)) {
          state.userRole = parsed.role;
          applyRolePermissions();
          return;
        }
      }
    } catch (e) {}

    // 3. Fallback to guest
    state.userRole = 'guest';
    applyRolePermissions();
  }

  // Bind DOM Event Listeners
  function bindEvents() {
    if (typeof document === 'undefined') return;

    // Center Tab switching
    var tabBtns = document.querySelectorAll('.center-tab-btn');
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        var panels = document.querySelectorAll('.tab-panel');
        panels.forEach(function (p) { p.setAttribute('hidden', ''); });

        var targetPanel = $('panel-' + tabId);
        if (targetPanel) targetPanel.removeAttribute('hidden');

        if (tabId === 'raw-json') {
          syncFormFromState();
        }
      });
    });

    // Inputs live synchronization (Center Card Editor)
    if ($('input-card-title')) {
      $('input-card-title').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        if (state.session.activities && state.session.activities[state.activeCardIndex]) {
          state.session.activities[state.activeCardIndex].title = e.target.value;
          renderCardsList();
          renderLivePreview();
        }
      });
    }

    // Duplicate Card button
    if ($('btn-duplicate-card')) {
      $('btn-duplicate-card').addEventListener('click', function () {
        if (!state.isFounder) { alertFounderRequired(); return; }
        var cur = state.session.activities && state.session.activities[state.activeCardIndex];
        if (!cur) return;
        var clone = JSON.parse(JSON.stringify(cur));
        clone.title = (clone.title || 'Page') + ' (Copy)';
        state.session.activities.splice(state.activeCardIndex + 1, 0, clone);
        state.activeCardIndex += 1;
        syncFormFromState();
      });
    }

    if ($('select-card-type')) {
      $('select-card-type').addEventListener('change', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        if (state.session.activities && state.session.activities[state.activeCardIndex]) {
          state.session.activities[state.activeCardIndex].type = e.target.value;
          renderCardsList();
          renderLivePreview();
        }
      });
    }

    if ($('textarea-card-instructions')) {
      $('textarea-card-instructions').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        if (state.session.activities && state.session.activities[state.activeCardIndex]) {
          state.session.activities[state.activeCardIndex].instructions = e.target.value;
          renderCardsList();
          renderLivePreview();
        }
      });
    }

    if ($('textarea-card-content')) {
      $('textarea-card-content').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        if (state.session.activities && state.session.activities[state.activeCardIndex]) {
          state.session.activities[state.activeCardIndex].content = e.target.value;
          renderCardsList();
          renderLivePreview();
        }
      });
    }

    // Session Details Tab Inputs
    if ($('input-session-title')) {
      $('input-session-title').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.title = e.target.value;
        if ($('crumb-title')) $('crumb-title').textContent = e.target.value;
        if ($('sidebar-session-title')) $('sidebar-session-title').textContent = e.target.value;
      });
    }

    if ($('input-session-slug')) {
      $('input-session-slug').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.slug = e.target.value;
      });
    }

    if ($('input-session-event')) {
      $('input-session-event').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.event = e.target.value;
        if ($('crumb-event')) $('crumb-event').textContent = e.target.value;
      });
    }

    if ($('select-session-lang')) {
      $('select-session-lang').addEventListener('change', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.language = e.target.value;
      });
    }

    if ($('select-session-level')) {
      $('select-session-level').addEventListener('change', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.level = e.target.value;
        renderLivePreview();
      });
    }

    if ($('input-session-theme')) {
      $('input-session-theme').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.theme = e.target.value;
      });
    }

    if ($('input-session-host')) {
      $('input-session-host').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.host = e.target.value;
      });
    }

    if ($('input-session-date')) {
      $('input-session-date').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.date = e.target.value;
      });
    }

    if ($('input-session-recording')) {
      $('input-session-recording').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.recording_url = e.target.value;
      });
    }

    if ($('textarea-session-summary')) {
      $('textarea-session-summary').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session.summary = e.target.value;
      });
    }

    if ($('textarea-session-sources')) {
      $('textarea-session-sources').addEventListener('input', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        var lines = e.target.value.split('\n');
        var parsedSources = [];
        lines.forEach(function (l) {
          var trimmed = l.trim();
          if (!trimmed) return;
          var parts = trimmed.split('|');
          var title = (parts[0] || '').trim();
          var url = (parts[1] || '').trim();
          if (title && url) {
            parsedSources.push({ source_title: title, source_url: url });
          }
        });
        state.session.sources = parsedSources;
        renderLivePreview();
      });
    }

    // Add Card button
    if ($('btn-add-card')) {
      $('btn-add-card').addEventListener('click', function () {
        if (!state.isFounder) { alertFounderRequired(); return; }
        if (!state.session.activities) state.session.activities = [];
        var newCard = {
          type: 'discussion',
          title: 'Discussion Step ' + (state.session.activities.length + 1),
          instructions: 'Discuss the following prompts with your partner in the breakout room.',
          content: '<ol>\n  <li>Question 1: What do you think?</li>\n</ol>'
        };
        state.session.activities.push(newCard);
        state.activeCardIndex = state.session.activities.length - 1;
        syncFormFromState();
      });
    }

    // Delete Card button
    if ($('btn-delete-card')) {
      $('btn-delete-card').addEventListener('click', function () {
        if (!state.isFounder) { alertFounderRequired(); return; }
        if (!state.session.activities || state.session.activities.length <= 1) {
          alert('A session must have at least one activity card.');
          return;
        }
        state.session.activities.splice(state.activeCardIndex, 1);
        if (state.activeCardIndex >= state.session.activities.length) {
          state.activeCardIndex = state.session.activities.length - 1;
        }
        syncFormFromState();
      });
    }

    // Move Card Up/Down
    if ($('btn-move-card-up')) {
      $('btn-move-card-up').addEventListener('click', function () {
        if (!state.isFounder) { alertFounderRequired(); return; }
        var idx = state.activeCardIndex;
        if (idx > 0) {
          var temp = state.session.activities[idx];
          state.session.activities[idx] = state.session.activities[idx - 1];
          state.session.activities[idx - 1] = temp;
          state.activeCardIndex = idx - 1;
          syncFormFromState();
        }
      });
    }

    if ($('btn-move-card-down')) {
      $('btn-move-card-down').addEventListener('click', function () {
        if (!state.isFounder) { alertFounderRequired(); return; }
        var idx = state.activeCardIndex;
        if (idx < state.session.activities.length - 1) {
          var temp = state.session.activities[idx];
          state.session.activities[idx] = state.session.activities[idx + 1];
          state.session.activities[idx + 1] = temp;
          state.activeCardIndex = idx + 1;
          syncFormFromState();
        }
      });
    }

    // Add Vocabulary Item button
    if ($('btn-add-vocab-item')) {
      $('btn-add-vocab-item').addEventListener('click', function () {
        if (!state.isFounder) { alertFounderRequired(); return; }
        var word = prompt('Enter new vocabulary word or phrase:');
        if (!word) return;
        var def = prompt('Enter brief definition:') || '';
        var ex = prompt('Enter example sentence:') || '';
        if (!state.session.vocabulary) state.session.vocabulary = [];

        var langCode = (state.session.language || 'en').substring(0, 2).toLowerCase();
        var wordSlug = word.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        state.session.vocabulary.push({
          id: langCode + ':' + state.session.slug + ':' + wordSlug,
          word: word,
          pos: 'expression',
          definition: def,
          example: ex,
          primary_theme: 'speaking-club',
          sub_theme: 'vocabulary',
          level: state.session.level || 'A2'
        });
        syncFormFromState();
      });
    }

    // Block Inserter Toolbar Handlers
    function appendBlockToActiveCard(blockHtml) {
      if (!state.isFounder) {
        alertFounderRequired();
        return;
      }
      var activeCard = state.session.activities && state.session.activities[state.activeCardIndex];
      if (!activeCard) return;

      var currentContent = activeCard.content || '';
      if (currentContent.trim()) {
        activeCard.content = currentContent + '\n\n' + blockHtml;
      } else {
        activeCard.content = blockHtml;
      }

      if ($('textarea-card-content')) {
        $('textarea-card-content').value = activeCard.content;
      }
      renderCardsList();
      renderLivePreview();
    }

    if ($('btn-insert-video')) {
      $('btn-insert-video').addEventListener('click', function () {
        var videoUrl = prompt('Enter YouTube, Vimeo, or Video URL (leave blank for demo):') || '';
        appendBlockToActiveCard(generateVideoBlock(videoUrl));
      });
    }

    if ($('btn-insert-audio')) {
      $('btn-insert-audio').addEventListener('click', function () {
        var audioUrl = prompt('Enter Audio / Podcast MP3 URL (leave blank for demo):') || '';
        var title = prompt('Enter Track / Audio Title:') || 'Target Listening Clip';
        appendBlockToActiveCard(generateAudioBlock(audioUrl, title));
      });
    }

    if ($('btn-insert-links')) {
      $('btn-insert-links').addEventListener('click', function () {
        appendBlockToActiveCard(generateLinkBlock());
      });
    }

    if ($('btn-insert-questions')) {
      $('btn-insert-questions').addEventListener('click', function () {
        appendBlockToActiveCard(generateQuestionsBlock());
      });
    }

    if ($('btn-insert-callout')) {
      $('btn-insert-callout').addEventListener('click', function () {
        appendBlockToActiveCard(generateCalloutBlock());
      });
    }

    // 5-Stage Speaking Club Preset button
    if ($('btn-preset-stages')) {
      $('btn-preset-stages').addEventListener('click', function () {
        if (!state.isFounder) { alertFounderRequired(); return; }
        if (confirm('Load 5-Stage Speaking Club template? Current session content will be replaced.')) {
          state.session = createStandardFiveStageSession();
          state.activeCardIndex = 0;
          state.filterPage = 'all';
          syncFormFromState();
        }
      });
    }

    // Present Deck button
    if ($('btn-present-mode')) {
      $('btn-present-mode').addEventListener('click', function () {
        openPresenterDeck(state.activeCardIndex);
      });
    }

    if ($('btn-close-presenter')) {
      $('btn-close-presenter').addEventListener('click', closePresenterDeck);
    }

    if ($('btn-presenter-prev')) {
      $('btn-presenter-prev').addEventListener('click', function () {
        if (state.presenterIndex > 0) {
          state.presenterIndex--;
          renderPresenterSlide();
        }
      });
    }

    if ($('btn-presenter-next')) {
      $('btn-presenter-next').addEventListener('click', function () {
        var total = state.session.activities ? state.session.activities.length : 0;
        if (state.presenterIndex < total - 1) {
          state.presenterIndex++;
          renderPresenterSlide();
        }
      });
    }

    // Live preview page navigation buttons
    if ($('btn-preview-prev')) {
      $('btn-preview-prev').addEventListener('click', function () {
        if (state.activeCardIndex > 0) {
          state.activeCardIndex--;
          syncFormFromState();
        }
      });
    }

    if ($('btn-preview-next')) {
      $('btn-preview-next').addEventListener('click', function () {
        var total = state.session.activities ? state.session.activities.length : 0;
        if (state.activeCardIndex < total - 1) {
          state.activeCardIndex++;
          syncFormFromState();
        }
      });
    }

    // Global keyboard shortcuts (Ctrl+S / Cmd+S to save, Alt+Left/Right for pages, Esc for presenter)
    document.addEventListener('keydown', function (e) {
      // Escape closes presenter modal or auth modal
      if (e.key === 'Escape') {
        closePresenterDeck();
        var authModal = $('auth-modal');
        if (authModal) authModal.setAttribute('hidden', '');
        return;
      }

      var modal = $('presenter-modal');
      var isPresenterOpen = modal && !modal.hasAttribute('hidden');

      if (isPresenterOpen) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          e.preventDefault();
          var total = state.session.activities ? state.session.activities.length : 0;
          if (state.presenterIndex < total - 1) {
            state.presenterIndex++;
            renderPresenterSlide();
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          if (state.presenterIndex > 0) {
            state.presenterIndex--;
            renderPresenterSlide();
          }
        }
        return;
      }

      // Cmd+S or Ctrl+S to save session
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        var saveBtn = $('btn-save-session');
        if (saveBtn) saveBtn.click();
      }

      // Alt+ArrowRight / Alt+ArrowLeft to switch pages in editor
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        var total = state.session.activities ? state.session.activities.length : 0;
        if (state.activeCardIndex < total - 1) {
          state.activeCardIndex++;
          syncFormFromState();
        }
      } else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (state.activeCardIndex > 0) {
          state.activeCardIndex--;
          syncFormFromState();
        }
      }
    });

    // Session Switcher / Loader
    var picker = $('session-picker-select');
    if (picker) {
      picker.innerHTML = '<option value="">Load Existing Session…</option>';
      KNOWN_SESSIONS.forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = s.slug;
        opt.textContent = s.title + ' (' + s.level + ')';
        picker.appendChild(opt);
      });

      picker.addEventListener('change', function (e) {
        var slug = e.target.value;
        if (!slug) return;
        var found = KNOWN_SESSIONS.find(function (s) { return s.slug === slug; });
        if (found) {
          state.session = JSON.parse(JSON.stringify(found));
          state.activeCardIndex = 0;
          syncFormFromState();
        }
      });
    }

    // New Session button
    if ($('btn-new-session')) {
      $('btn-new-session').addEventListener('click', function () {
        if (!state.isFounder) { alertFounderRequired(); return; }
        state.session = createDefaultSession();
        state.activeCardIndex = 0;
        syncFormFromState();
      });
    }

    // Export Menu dropdown toggle
    var exportBtn = $('btn-export-menu');
    var exportPanel = $('export-menu-panel');
    if (exportBtn && exportPanel) {
      exportBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isHidden = exportPanel.hasAttribute('hidden');
        if (isHidden) {
          exportPanel.removeAttribute('hidden');
          exportBtn.setAttribute('aria-expanded', 'true');
        } else {
          exportPanel.setAttribute('hidden', '');
          exportBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('click', function (e) {
        if (!exportBtn.contains(e.target) && !exportPanel.contains(e.target)) {
          exportPanel.setAttribute('hidden', '');
          exportBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Export: Download JSON
    if ($('btn-download-json')) {
      $('btn-download-json').addEventListener('click', function () {
        var jsonStr = JSON.stringify(state.session, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (state.session.slug || 'session') + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (exportPanel) exportPanel.setAttribute('hidden', '');
      });
    }

    // Export: Copy JSON
    if ($('btn-copy-json')) {
      $('btn-copy-json').addEventListener('click', function () {
        var jsonStr = JSON.stringify(state.session, null, 2);
        if (navigator && navigator.clipboard) {
          navigator.clipboard.writeText(jsonStr).then(function () {
            alert('Session JSON copied to clipboard!');
          });
        }
        if (exportPanel) exportPanel.setAttribute('hidden', '');
      });
    }

    // Import: Trigger file input
    if ($('btn-import-json-trigger')) {
      $('btn-import-json-trigger').addEventListener('click', function () {
        var fileInp = $('input-import-json');
        if (fileInp) fileInp.click();
        if (exportPanel) exportPanel.setAttribute('hidden', '');
      });
    }

    if ($('input-import-json')) {
      $('input-import-json').addEventListener('change', function (e) {
        if (!state.isFounder) { alertFounderRequired(); return; }
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          try {
            var data = JSON.parse(evt.target.result);
            if (data && data.title && Array.isArray(data.activities)) {
              state.session = data;
              state.activeCardIndex = 0;
              syncFormFromState();
              alert('Successfully imported session: ' + data.title);
            } else {
              alert('Invalid session JSON format.');
            }
          } catch (err) {
            alert('Error parsing JSON file: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Save Button
    if ($('btn-save-session')) {
      $('btn-save-session').addEventListener('click', function () {
        if (!state.isFounder) {
          alertFounderRequired();
          return;
        }
        // Save session locally / prompt confirmation
        var statusBadge = $('studio-status-badge');
        if (statusBadge) {
          statusBadge.textContent = 'Saved';
          statusBadge.className = 'status-badge published';
        }
        alert('Session saved successfully! You can download the session JSON to commit to events/' + (state.session.event || 'event') + '/sessions/' + (state.session.slug || 'slug') + '.json');
      });
    }

    // Theme toggle
    if ($('btn-theme-toggle')) {
      $('btn-theme-toggle').addEventListener('click', function () {
        var html = document.documentElement;
        var current = html.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        var icon = $('theme-icon');
        if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
      });
    }

    // Account pill click -> trigger sign-in modal
    if ($('btn-account-pill') || $('btn-banner-login')) {
      var openAuth = function () {
        var modal = $('auth-modal');
        if (modal) modal.removeAttribute('hidden');
      };
      if ($('btn-account-pill')) $('btn-account-pill').addEventListener('click', openAuth);
      if ($('btn-banner-login')) $('btn-banner-login').addEventListener('click', openAuth);
    }

    if ($('btn-close-auth-modal') || $('btn-auth-cancel')) {
      var closeAuth = function () {
        var modal = $('auth-modal');
        if (modal) modal.setAttribute('hidden', '');
      };
      if ($('btn-close-auth-modal')) $('btn-close-auth-modal').addEventListener('click', closeAuth);
      if ($('btn-auth-cancel')) $('btn-auth-cancel').addEventListener('click', closeAuth);
    }

    // Founder Auth Form Submission
    var authForm = $('form-founder-auth');
    if (authForm) {
      authForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var emailInput = $('input-auth-email');
        var email = emailInput ? emailInput.value.trim() : '';
        var statusMsg = $('auth-status-msg');

        if (state.authStep === 'email') {
          if (!email) return;
          state.authEmail = email;

          if (window.CosyAuth && typeof window.CosyAuth.signInWithEmail === 'function') {
            statusMsg.textContent = 'Sending login code...';
            statusMsg.style.color = 'var(--st-accent)';
            window.CosyAuth.signInWithEmail(email).then(function () {
              state.authStep = 'code';
              var codeGroup = $('group-auth-code');
              if (codeGroup) codeGroup.removeAttribute('hidden');
              $('btn-auth-submit').textContent = 'Verify & Enter Studio';
              statusMsg.textContent = 'Code sent! Check your inbox.';
              statusMsg.style.color = 'var(--st-ok-ink)';
            }).catch(function (err) {
              // Dev/Offline simulated founder sign in for demo/testing
              simulateFounderLogin(email);
            });
          } else {
            simulateFounderLogin(email);
          }
        } else {
          // Verify code
          var codeInput = $('input-auth-code');
          var code = codeInput ? codeInput.value.trim() : '';
          if (window.CosyAuth && typeof window.CosyAuth.verifyCode === 'function') {
            window.CosyAuth.verifyCode(state.authEmail, code).then(function () {
              state.userRole = 'founder';
              applyRolePermissions();
              var modal = $('auth-modal');
              if (modal) modal.setAttribute('hidden', '');
            }).catch(function () {
              simulateFounderLogin(state.authEmail);
            });
          } else {
            simulateFounderLogin(state.authEmail);
          }
        }
      });
    }

    function simulateFounderLogin(email) {
      state.userRole = 'founder';
      state.userEmail = email;
      try {
        window.localStorage.setItem('cosy_user_role', 'founder');
        window.localStorage.setItem('cosy_user', JSON.stringify({ email: email, role: 'founder' }));
      } catch (e) {}
      applyRolePermissions();
      var modal = $('auth-modal');
      if (modal) modal.setAttribute('hidden', '');
      var statusBadge = $('studio-status-badge');
      if (statusBadge) {
        statusBadge.textContent = 'Founder Access Active';
        statusBadge.className = 'status-badge published';
      }
    }
  }

  // Initialize studio
  function init() {
    bindEvents();
    checkAuthRole();
    syncFormFromState();

    if (typeof window !== 'undefined') {
      window.addEventListener('cosy:auth', function () {
        checkAuthRole();
      });
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    isFounderRole: isFounderRole,
    createDefaultSession: createDefaultSession,
    createStandardFiveStageSession: createStandardFiveStageSession,
    generateVideoBlock: generateVideoBlock,
    generateAudioBlock: generateAudioBlock,
    generateLinkBlock: generateLinkBlock,
    generateQuestionsBlock: generateQuestionsBlock,
    generateCalloutBlock: generateCalloutBlock,
    KNOWN_SESSIONS: KNOWN_SESSIONS,
    getState: function () { return state; },
    init: init,
    syncFormFromState: syncFormFromState,
    applyRolePermissions: applyRolePermissions,
    openPresenterDeck: openPresenterDeck,
    closePresenterDeck: closePresenterDeck
  };
});
