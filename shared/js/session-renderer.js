/**
 * COSYevents Session Renderer (window.CosySessionRenderer)
 * Dynamically renders session JSON models into exact DOM structures
 * compatible with cosyevents-session.js using pure DOM APIs and textContent.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.CosySessionRenderer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function createElement(tag, className, textContent) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent !== undefined && textContent !== null) el.textContent = textContent;
    return el;
  }

  function render(model, targetContainer) {
    if (!targetContainer) return;
    targetContainer.textContent = ''; // Clear container

    var catalog = model.catalog || model.public || {};
    var content = model.content || {};
    var vocabulary = content.vocabulary || [];
    var rounds = content.rounds || [];
    var grammar = content.grammar;
    var discussion = content.discussion || [];
    var sources = model.sources || content.sources || [];
    var fullNotes = content.full_notes || model.full_notes || model.teacher_notes;
    var recordingUrl = model.recording_url;

    // Build Overview / Meta Grid
    var title = catalog.title || 'Session';
    var level = catalog.level || '';
    var duration = catalog.duration || '60 minutes';
    var language = catalog.language || 'English';
    var summary = catalog.summary || '';
    var format = catalog.format || 'Speaking Club';

    // Breadcrumbs
    var navBreadcrumbs = createElement('nav', 'cosy-breadcrumbs');
    var homeLink = createElement('a', null, 'Home');
    homeLink.href = '../../index.html';
    var sep1 = createElement('span', 'sep', '/');
    var eventsLink = createElement('a', null, 'Events');
    eventsLink.href = '../../';
    var sep2 = createElement('span', 'sep', '/');
    var clubLink = createElement('a', null, format);
    clubLink.href = '../../';
    var sep3 = createElement('span', 'sep', '/');
    var currentSpan = createElement('span', 'current', title);

    navBreadcrumbs.appendChild(homeLink);
    navBreadcrumbs.appendChild(sep1);
    navBreadcrumbs.appendChild(eventsLink);
    navBreadcrumbs.appendChild(sep2);
    navBreadcrumbs.appendChild(clubLink);
    navBreadcrumbs.appendChild(sep3);
    navBreadcrumbs.appendChild(currentSpan);
    targetContainer.appendChild(navBreadcrumbs);

    // Back Link
    var backLink = createElement('a', 'back-link', '← Back to Club');
    backLink.href = '../../';
    targetContainer.appendChild(backLink);

    // Session Meta Grid
    var metaGrid = createElement('div', 'session-meta-grid');

    var durItem = createElement('div', 'meta-item');
    durItem.appendChild(createElement('h4', null, 'Duration'));
    durItem.appendChild(createElement('p', null, duration));
    metaGrid.appendChild(durItem);

    var langItem = createElement('div', 'meta-item');
    langItem.appendChild(createElement('h4', null, 'Languages'));
    langItem.appendChild(createElement('p', null, language));
    metaGrid.appendChild(langItem);

    if (level) {
      var levelItem = createElement('div', 'meta-item');
      levelItem.appendChild(createElement('h4', null, 'Level'));
      levelItem.appendChild(createElement('p', null, level));
      metaGrid.appendChild(levelItem);
    }

    if (summary) {
      var summaryItem = createElement('div', 'meta-item');
      summaryItem.appendChild(createElement('h4', null, 'Topic'));
      summaryItem.appendChild(createElement('p', null, summary));
      metaGrid.appendChild(summaryItem);
    }

    targetContainer.appendChild(metaGrid);

    // Summary description box if available
    if (summary) {
      var summaryBox = createElement('div');
      summaryBox.style.cssText = 'margin-bottom: 2rem; line-height: 1.6; color: var(--ink-soft); font-size: 0.95rem;';
      var p = createElement('p', null, summary);
      summaryBox.appendChild(p);
      targetContainer.appendChild(summaryBox);
    }

    // Vocabulary Section
    if (vocabulary && vocabulary.length > 0) {
      var vocabSection = createElement('section');
      vocabSection.id = 'vocabulary';

      var vocabTitle = createElement('h2', 'section-title', '📖 Session Vocabulary');
      vocabSection.appendChild(vocabTitle);

      var vocabGrid = createElement('div', 'vocab-grid-10');

      vocabulary.forEach(function (v) {
        var card = createElement('div', 'vocab-card');

        var wordDiv = createElement('div', 'vocab-word', v.word || '');
        var defDiv = createElement('div', 'vocab-def', v.definition || '');
        var exDiv = createElement('div', 'vocab-example', v.example || '');

        card.appendChild(wordDiv);
        card.appendChild(defDiv);
        card.appendChild(exDiv);

        if (v.opposite) {
          var oppDiv = createElement('div', 'vocab-opp-word', v.opposite);
          card.appendChild(oppDiv);
        }

        // Add to Dictionary button using DOM API event listener (safe, no inline HTML strings)
        var btn = createElement('button', 'btn-add-dict', 'Add to Dictionary');
        btn.addEventListener('click', function () {
          if (window.COSY && window.COSY.addToDict) {
            window.COSY.addToDict({
              word: v.word || '',
              definition: v.definition || '',
              example: v.example || ''
            }, btn);
          }
        });
        card.appendChild(btn);

        vocabGrid.appendChild(card);
      });

      vocabSection.appendChild(vocabGrid);
      targetContainer.appendChild(vocabSection);
    }

    // Structure Section (Rounds / Discussion / Grammar)
    var hasRounds = rounds && rounds.length > 0;
    var hasDisc = discussion && discussion.length > 0;
    var hasGrammar = Array.isArray(grammar) ? grammar.length > 0 : !!grammar;

    if (hasRounds || hasDisc || hasGrammar) {
      var structSection = createElement('section');
      structSection.id = 'structure';

      var structTitle = createElement('h2', 'section-title', '🎙️ Discussion Structure');
      structSection.appendChild(structTitle);

      var roundsContainer = createElement('div', 'rounds-container');

      // Grammar block if present
      if (hasGrammar) {
        var grammarItems = Array.isArray(grammar) ? grammar : [grammar];
        grammarItems.forEach(function (gItem) {
          var gBlock = createElement('div', 'round-block open');
          var gHeader = createElement('div', 'round-header');
          gHeader.style.background = '#EEEDFE';
          gHeader.appendChild(createElement('span', null, '📚 ' + (gItem.title || 'Grammar Focus')));
          gHeader.appendChild(createElement('span', 'round-toggle', '▲'));

          var gBody = createElement('div', 'round-body');
          gBody.style.display = 'block';
          gBody.appendChild(createElement('p', null, typeof gItem === 'string' ? gItem : (gItem.content || '')));

          gBlock.appendChild(gHeader);
          gBlock.appendChild(gBody);
          roundsContainer.appendChild(gBlock);
        });
      }

      // Render rounds
      if (hasRounds) {
        rounds.forEach(function (r, rIdx) {
          var rBlock = createElement('div', 'round-block open');
          rBlock.id = 's-r' + (rIdx + 1);

          var rHeader = createElement('div', 'round-header');
          rHeader.style.background = rIdx % 2 === 0 ? '#E1F5EE' : '#EAF3DE';
          rHeader.appendChild(createElement('span', null, '🎙️ ' + (r.title || ('Round ' + (rIdx + 1)))));
          rHeader.appendChild(createElement('span', 'round-toggle', '▲'));

          var rBody = createElement('div', 'round-body');
          rBody.style.display = 'block';

          if (r.instruction) {
            rBody.appendChild(createElement('div', 'vim-instruction', r.instruction));
          }

          var prompts = r.prompts || r.items || [];
          prompts.forEach(function (item) {
            var itemDiv = createElement('div', 'round-item');
            var mainText = typeof item === 'string' ? item : (item.prompt || item.main || '');
            var followText = typeof item === 'object' ? (item.follow_up || item.personal || '') : '';

            var mainDiv = createElement('div', 'round-item-main', mainText);
            itemDiv.appendChild(mainDiv);

            if (followText) {
              var personalDiv = createElement('div', 'round-item-personal', followText);
              itemDiv.appendChild(personalDiv);
            }

            rBody.appendChild(itemDiv);
          });

          rBlock.appendChild(rHeader);
          rBlock.appendChild(rBody);
          roundsContainer.appendChild(rBlock);
        });
      } else if (hasDisc) {
        // Group flat discussion array by round name
        var roundGroups = {};
        discussion.forEach(function (dItem) {
          var rName = dItem.round || 'Discussion Questions';
          if (!roundGroups[rName]) roundGroups[rName] = [];
          roundGroups[rName].push(dItem);
        });

        Object.keys(roundGroups).forEach(function (rName, rIdx) {
          var rBlock = createElement('div', 'round-block open');
          rBlock.id = 's-r' + (rIdx + 1);

          var rHeader = createElement('div', 'round-header');
          rHeader.style.background = rIdx % 2 === 0 ? '#E1F5EE' : '#EAF3DE';
          rHeader.appendChild(createElement('span', null, '🎙️ ' + rName));
          rHeader.appendChild(createElement('span', 'round-toggle', '▲'));

          var rBody = createElement('div', 'round-body');
          rBody.style.display = 'block';

          roundGroups[rName].forEach(function (dItem) {
            var itemDiv = createElement('div', 'round-item');
            var mainDiv = createElement('div', 'round-item-main', dItem.prompt || '');
            itemDiv.appendChild(mainDiv);

            if (dItem.follow_up) {
              var personalDiv = createElement('div', 'round-item-personal', dItem.follow_up);
              itemDiv.appendChild(personalDiv);
            }

            rBody.appendChild(itemDiv);
          });

          rBlock.appendChild(rHeader);
          rBlock.appendChild(rBody);
          roundsContainer.appendChild(rBlock);
        });
      }

      structSection.appendChild(roundsContainer);
      targetContainer.appendChild(structSection);
    }

    // Facilitator / Full Notes Section
    if (fullNotes) {
      var notesSection = createElement('section');
      notesSection.id = 'facilitator-notes';
      notesSection.className = 'ce-gated-visible';

      var notesHeader = createElement('h3', 'section-title', '📝 Facilitator Notes');
      var notesBody = createElement('div', 'ce-notes-body', fullNotes);

      notesSection.appendChild(notesHeader);
      notesSection.appendChild(notesBody);
      targetContainer.appendChild(notesSection);
    }

    // Recording URL Section
    if (recordingUrl) {
      var recSection = createElement('section');
      recSection.id = 'recording-url';
      recSection.className = 'ce-gated-visible';

      var recHeader = createElement('h3', 'section-title', '📹 Session Recording');
      var videoWrapper = createElement('div', 'cosy-video-wrapper');
      var videoContainer = createElement('div', 'cosy-video-container');

      var iframe = createElement('iframe');
      iframe.src = recordingUrl;
      iframe.title = 'Session Recording';
      iframe.setAttribute('allowfullscreen', 'true');

      videoContainer.appendChild(iframe);
      videoWrapper.appendChild(videoContainer);
      recSection.appendChild(recHeader);
      recSection.appendChild(videoWrapper);

      targetContainer.appendChild(recSection);
    }

    // Sources Section
    if (sources && sources.length > 0) {
      var sourcesSection = createElement('section');
      sourcesSection.id = 'sources';

      var sourcesHeader = createElement('h3', 'section-title', '🔗 Sources & References');
      var sourcesList = createElement('ul');
      sourcesList.style.cssText = 'padding-left: 1.25rem; line-height: 1.8;';

      sources.forEach(function (s) {
        var li = createElement('li');
        var a = createElement('a');
        a.href = s.source_url || s.url || '#';
        a.textContent = s.source_title || s.title || s.source_url || 'Source Link';
        a.target = '_blank';
        a.rel = 'noopener';
        li.appendChild(a);
        sourcesList.appendChild(li);
      });

      sourcesSection.appendChild(sourcesHeader);
      sourcesSection.appendChild(sourcesList);
      targetContainer.appendChild(sourcesSection);
    }
  }

  return {
    render: render
  };
}));
