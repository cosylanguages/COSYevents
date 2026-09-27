const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function escapeAttrSingleQuotes(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function parseMarkdownFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Invalid YAML frontmatter in file: ${filepath}`);
  }
  const frontmatter = yaml.load(match[1]);
  const markdownBody = match[2].trim();
  return { ...frontmatter, markdownBody };
}

function renderLetsSpeakTogether(lst) {
  if (!lst) return '';
  if (lst.task_title || lst.task_description) {
    let grammarHtml = '';
    if (lst.grammar_requirements) {
      const items = Array.isArray(lst.grammar_requirements)
        ? lst.grammar_requirements
        : [lst.grammar_requirements];
      grammarHtml = `
<strong style="display:block; margin-bottom:0.5rem; color:#3b368c;">Your Synthesizing Task:</strong>
<ul style="margin:0; padding-left:1.5rem; font-size:0.92rem; color:var(--ink); line-height:1.8;">
${items.map(req => `<li>${req}</li>`).join('\n')}
</ul>`;
    }

    return `
<div style="background:#fff; border:1px solid #534AB7; border-radius:12px; padding:1.25rem; box-shadow: var(--shadow-sm);">
<h4 style="margin:0 0 0.75rem 0; color:#534AB7;">🗣️ ${lst.task_title || "The Integration Challenge"}:</h4>
<p style="margin:0 0 1rem 0; font-size:0.95rem; line-height:1.6; color:var(--ink);">${lst.task_description || ''}</p>
${grammarHtml}
</div>`;
  }
  return lst.note || '';
}

function renderFormatProfile(data) {
  if (data.mind_profile) {
    return `
<div class="mind-profile-box">
<h3>🧠 Subconscious Mind Profile</h3>
<div class="mind-profile-grid">
<div class="mind-profile-item">
<strong>Core Human Tendency</strong>
<span>${data.mind_profile.core_tendency || ''}</span>
</div>
<div class="mind-profile-item">
<strong>Subconscious Trigger</strong>
<span>${data.mind_profile.trigger || ''}</span>
</div>
<div class="mind-profile-item">
<strong>Psychological Phenomenon</strong>
<span>${data.mind_profile.phenomenon || ''}</span>
</div>
<div class="mind-profile-item">
<strong>Self-Reflection Anchor</strong>
<span>${data.mind_profile.anchor || ''}</span>
</div>
</div>
</div>`;
  }

  if (data.film_metadata) {
    const f = data.film_metadata;
    return `
<div class="mind-profile-box">
<h3>🎬 Film Profile</h3>
<div class="mind-profile-grid">
<div class="mind-profile-item"><strong>Movie Title</strong><span>${f.movie_title || ''}</span></div>
<div class="mind-profile-item"><strong>Director</strong><span>${f.director || ''}</span></div>
<div class="mind-profile-item"><strong>Release Year / Genre</strong><span>${f.release_year || ''} (${f.suggested_genre || ''})</span></div>
<div class="mind-profile-item"><strong>Age Rating</strong><span>${f.age_rating || 'PG-13'}</span></div>
</div>
</div>`;
  }

  if (data.song_metadata) {
    const s = data.song_metadata;
    let gapFillLines = (s.lyrics_gap_fill_lines || []);
    if (gapFillLines.length > 8) {
      console.warn(`[Copyright Constraint Warning] lyrics_gap_fill_lines capped at 8 lines (found ${gapFillLines.length}).`);
      gapFillLines = gapFillLines.slice(0, 8);
    }
    const gapFillHtml = gapFillLines.length > 0 ? `
<div style="margin-top:1rem; padding:0.75rem; background:#FAF7F2; border-radius:8px;">
<strong>🎵 Key Song Lines / Gap-Fill (Max 8 lines allowed):</strong>
<ol style="margin:0.5rem 0 0 1.25rem; font-size:0.9rem;">
${gapFillLines.map(l => `<li>${l}</li>`).join('\n')}
</ol>
</div>` : '';

    return `
<div class="mind-profile-box">
<h3>🎤 Song & Lyric Profile</h3>
<div class="mind-profile-grid">
<div class="mind-profile-item"><strong>Track Title</strong><span>${s.song_title || ''}</span></div>
<div class="mind-profile-item"><strong>Artist</strong><span>${s.artist || ''}</span></div>
<div class="mind-profile-item"><strong>Release Year</strong><span>${s.release_year || ''}</span></div>
<div class="mind-profile-item"><strong>Genre</strong><span>${s.genre || ''}</span></div>
</div>
${gapFillHtml}
</div>`;
  }

  if (data.science_takeaway) {
    const st = data.science_takeaway;
    return `
<div class="mind-profile-box">
<h3>🔬 Scientific Profile & Takeaway</h3>
<div class="mind-profile-grid">
<div class="mind-profile-item"><strong>Core Finding</strong><span>${st.core_finding || ''}</span></div>
<div class="mind-profile-item"><strong>Field of Study</strong><span>${st.scientific_field || ''}</span></div>
<div class="mind-profile-item"><strong>Real World Application</strong><span>${st.real_world_application || ''}</span></div>
</div>
</div>`;
  }

  return '';
}

function renderMistakeItem(m) {
  const wrongText = m.wrong || m.wrong_part || '';
  const rightText = m.right || m.right_part || '';
  const noteText = m.note || '';

  return `
<div class="mistake-item">
<span class="mistake-wrong">${wrongText}</span>
<span class="mistake-arrow">→</span>
<span class="mistake-right">${rightText}</span>
${noteText ? `<span class="mistake-note-text">${noteText}</span>` : ''}
</div>`;
}

function generateSessionHtml(data) {
  const pageTitle = data.page_title || `${data.title} : COSYlanguages`;
  const themeClass = data.theme_class || 'theme-mind';
  const heroStyle = data.hero_background ? ` style="background: ${data.hero_background};"` : ' style="background: linear-gradient(135deg, #993556, #4d1a2b);"';
  const clubTag = data.club_tag || 'Mind Matters';
  const decoratorIcon = data.decorator_icon || '🎙️';
  const breadcrumbCurrent = data.breadcrumbs_current || data.title;
  const duration = data.duration || '60 minutes';
  const languages = data.languages || '🇬🇧 English';
  const targetGrammar = data.target_grammar ? `<div class="meta-item"><h4>Grammar Focus</h4><p>${data.target_grammar}</p></div>` : '';

  let descriptionHtml = '';
  if (data.description) {
    if (data.description.trim().startsWith('<p>')) {
      descriptionHtml = data.description.trim();
    } else {
      descriptionHtml = `<p>${data.description.trim()}</p>`;
    }
  }

  const profileHtml = renderFormatProfile(data);

  let sensitiveTopicHtml = '';
  const warningNote = data.sensitive_topic_warning || data.sensitive_topic_note;
  if (warningNote) {
    sensitiveTopicHtml = `
<div class="sensitive-topic-warning">
<span class="warning-icon">🔞</span>
<div>
<strong>Sensitive Topic Note:</strong> ${warningNote}
</div>
</div>`;
  }

  const vocabCardsHtml = (data.vocabulary || []).map(v => `
<div class="vocab-card">
<div class="vocab-word">${v.word}</div>
<div class="vocab-def">${v.definition}</div>
<div class="vocab-example">${v.example}</div>
<button class="btn-add-dict" onclick="COSY.addToDict({word:'${escapeAttrSingleQuotes(v.word)}', definition:'${escapeAttrSingleQuotes(v.definition)}', example:'${escapeAttrSingleQuotes(v.example)}'}, this)">Add to Dictionary</button>
</div>`).join('');

  const warmUpQuestionsHtml = (data.warm_up?.questions || []).map(q => `<li>${q}</li>`).join('\n');
  const warmUpInstruction = data.warm_up?.instruction ? `<div class="vim-instruction">${data.warm_up.instruction}</div>\n` : '';

  const round1Title = data.round_1?.title || 'Round 1 : Psychological Analysis';
  const round1Badge = data.round_1?.badge || data.target_grammar || 'Questions';
  const round1Instruction = data.round_1?.instruction ? `<div class="vim-instruction">${data.round_1.instruction}</div>\n` : '';
  const round1ItemsHtml = (data.round_1?.items || []).map(item => `
<div class="round-item">
<div class="round-item-main">${item.main}</div>
${item.personal ? `<div class="round-item-personal">${item.personal}</div>` : ''}
</div>`).join('');

  const lstTitle = data.lets_speak_together?.title || "Let's Speak Together";
  const lstContentHtml = renderLetsSpeakTogether(data.lets_speak_together);

  const round2Title = data.round_2?.title || 'Round 2 : Conditional Practices';
  const round2Badge = data.round_2?.badge || data.target_grammar || 'Conditionals';
  const round2Instruction = data.round_2?.instruction ? `<div class="vim-instruction">${data.round_2.instruction}</div>\n` : '';
  const round2ItemsHtml = (data.round_2?.items || []).map(item => `
<div class="round-item">
<div class="round-item-main">${item.main}</div>
${item.personal ? `<div class="round-item-personal">${item.personal}</div>` : ''}
</div>`).join('');

  const mistakesHtml = (data.mistakes || []).map(renderMistakeItem).join('');

  return `<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${pageTitle}</title>
<link href="../../shared/images/logo.png" rel="icon"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&amp;family=DM+Sans:wght@300;400;500&amp;family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&amp;display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="../../shared/css/sessions.css">
<link rel="stylesheet" href="../../shared/css/clubs/mind-matters.css">
</head>
<body class="${themeClass}">
<nav id="cosy-nav"></nav>
<header class="session-hero"${heroStyle}>
<div class="club-tag">${clubTag}</div>
<div class="session-decorator-icon">${decoratorIcon}</div>
<h1>${data.title}</h1>
<p class="session-date">${data.date}</p>
</header>
<main class="content-container">
<nav class="cosy-breadcrumbs">
<a href="../../index.html">Home</a> <span class="sep">/</span>
<a href="../../">Events</a> <span class="sep">/</span>
<a href="../../mind-matters.html">Mind Matters</a> <span class="sep">/</span>
<span class="current">${breadcrumbCurrent}</span>
</nav>
<a class="back-link" href="../../mind-matters.html">← Back to Club</a>
<div class="session-meta-grid">
<div class="meta-item"><h4>Duration</h4><p>${duration}</p></div>
<div class="meta-item"><h4>Languages</h4><p>${languages}</p></div>
<div class="meta-item"><h4>Level</h4><p>${data.level}</p></div>
${data.topic ? `<div class="meta-item"><h4>Topic</h4><p>${data.topic}</p></div>` : ''}
${targetGrammar}
</div>
<div style="margin-bottom: 2rem; line-height: 1.6; color: var(--ink-soft); font-size: 0.95rem;">
${descriptionHtml}
</div>${profileHtml}${sensitiveTopicHtml}
<section id="vocabulary">
<h2 class="section-title">📖 Session Vocabulary</h2>
<div class="vocab-grid-10">${vocabCardsHtml}
</div>
</section>
<section id="structure">
<h2 class="section-title">🎙️ Discussion Structure</h2>
<div class="rounds-container">
<div class="round-block warm-up open" id="s-warm">
<div class="round-header" onclick="COSY.toggleRound('s-warm')" style="background:#FAEEE8;">
<span>🟠 Warm-up</span><span class="round-toggle">▲</span>
</div>
<div class="round-body" style="display:block;">
${warmUpInstruction}<ul class="round-questions">
${warmUpQuestionsHtml}
</ul>
</div>
</div>
<div class="round-block round-1 open" id="s-r1">
<div class="round-header" onclick="COSY.toggleRound('s-r1')" style="background:#E1F5EE;">
<span>🔵 ${round1Title}</span><span class="round-toggle">▲</span>
</div>
<div class="round-body" style="display:block;">
<div class="round-type-badge">${round1Badge}</div>
${round1Instruction}${round1ItemsHtml}
</div>
</div>
<div class="round-block lst open" id="s-lst">
<div class="round-header" onclick="COSY.toggleRound('s-lst')" style="background:#EEEDFE;">
<span>🟣 ${lstTitle}</span><span class="round-toggle">▲</span>
</div>
<div class="round-body" style="display:block; padding: 1.5rem 1.25rem;">
${lstContentHtml}
</div>
</div>
<div class="round-block round-2 open" id="s-r2">
<div class="round-header" onclick="COSY.toggleRound('s-r2')" style="background:#EAF3DE;">
<span>🟢 ${round2Title}</span><span class="round-toggle">▲</span>
</div>
<div class="round-body" style="display:block;">
<div class="round-type-badge">${round2Badge}</div>
${round2Instruction}${round2ItemsHtml}
</div>
</div>
<div class="mistake-block open" id="s-mistakes">
<div class="mistake-header" onclick="COSY.toggleBlock('s-mistakes')">
<span>✏️ Teacher's Note (Linguistic Corrections)</span><span class="round-toggle">▲</span>
</div>
<div class="mistake-body" style="display:block;">${mistakesHtml}
</div>
</div>
</div>
</section>
</main>
<footer>
<div class="footer-inner">
<div class="footer-brand">
<div class="fb-logo">
<img alt="COSYlanguages logo" src="../../shared/images/logo.png"/>
<span class="fb-name">COSYlanguages</span>
</div>
<p data-translate-key="footer_fb_p">Your friendly corner to master new languages and connect with the world. 🌍</p>
</div>
<div class="footer-links-col">
<h5 data-translate-key="footer_h5_courses">Courses</h5>
<a data-translate-key="course_general" href="https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/general/">General Course 📖</a>
<a data-translate-key="course_spoken" href="https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/spoken/">Spoken Course 🗣️</a>
<a data-translate-key="course_exam" href="https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/exam/">Exam Preparation 📝</a>
<a data-translate-key="course_travelling" href="https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/travelling/">Travelling Course ✈️</a>
<a data-translate-key="course_professional" href="https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/professional/">Professional Course 💼</a>
<a data-translate-key="course_relocation" href="https://cosylanguages.github.io/COSYlanguages/apps/premium-courses/relocation/">Relocation Course 🏡</a>
</div>
<div class="footer-links-col">
<h5 data-translate-key="footer_h5_explore">Explore</h5>
<a data-translate-key="nav_languages" href="../../../#languages">Languages 🌍</a>
<a data-translate-key="nav_practice" href="../../practice/index.html">Free Practice 💡</a>
<a data-translate-key="nav_events" href="../../index.html">Events 🎉</a>
<a data-translate-key="nav_games" href="../../games/index.html">Games 🎮</a>
</div>
<div class="footer-links-col">
<h5>Project</h5>
<a href="../../privacy.html">Privacy &amp; Safety 🛡️</a>
</div>
<div class="footer-links-col">
<h5 data-translate-key="footer_h5_contact">Contact</h5>
<a href="https://wa.me/330766784195">WhatsApp 📱</a>
<a href="https://t.me/cosylanguagesproject">Telegram ✈️</a>
<a href="mailto:cosylanguages@gmail.com">cosylanguages@gmail.com ✉️</a>
</div>
</div>
<div class="footer-bottom" data-translate-key="footer_copy">© 2026 COSYlanguages : All rights reserved</div>
</footer>
<script src="../../shared/js/cosyevents-session.js"></script>
</body>
</html>
`;
}

function updateCatalog(slug, sessionData) {
  const relHtmlPath = `sessions/mind-matters/${slug}.html`;

  // 1. Update data/sessions.json
  const sessionsJsonPath = path.join(__dirname, '../data/sessions.json');
  if (fs.existsSync(sessionsJsonPath)) {
    let sessions = JSON.parse(fs.readFileSync(sessionsJsonPath, 'utf8'));
    let levelCode = 'B1';
    if (sessionData.level) {
      const match = sessionData.level.match(/\b(A[0-2]|B[1-2]|C[1-2])\b/i);
      if (match) levelCode = match[1].toUpperCase();
    }

    const existingIndex = sessions.findIndex(item => item.href === relHtmlPath);
    const catalogItem = {
      title: `${sessionData.title} : COSYlanguages`,
      href: relHtmlPath,
      level: levelCode,
      lang: 'English',
      club: 'Mind Matters',
      format: 'Speaking Club'
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...sessions[existingIndex], ...catalogItem };
    } else {
      sessions.push(catalogItem);
    }
    fs.writeFileSync(sessionsJsonPath, JSON.stringify(sessions, null, 2) + '\n', 'utf8');
  }

  // 2. Update data/events/speaking-clubs.json
  const speakingClubsPath = path.join(__dirname, '../data/events/speaking-clubs.json');
  if (fs.existsSync(speakingClubsPath)) {
    let clubsData = JSON.parse(fs.readFileSync(speakingClubsPath, 'utf8'));
    const mindMattersClub = clubsData.clubs.find(c => c.id === 'mind-matters');
    if (mindMattersClub) {
      if (!mindMattersClub.sessions) mindMattersClub.sessions = [];
      const sessionHref = `../sessions/mind-matters/${slug}.html`;
      const sIndex = mindMattersClub.sessions.findIndex(s => s.href === sessionHref);
      const sessionItem = {
        title: sessionData.title,
        href: sessionHref
      };
      if (sIndex >= 0) {
        mindMattersClub.sessions[sIndex] = { ...mindMattersClub.sessions[sIndex], ...sessionItem };
      } else {
        mindMattersClub.sessions.push(sessionItem);
      }
      fs.writeFileSync(speakingClubsPath, JSON.stringify(clubsData, null, 2) + '\n', 'utf8');
    }
  }
}

function buildMindMattersSessions() {
  const targetDir = path.join(__dirname, '../sessions/mind-matters');
  if (!fs.existsSync(targetDir)) return;

  const files = fs.readdirSync(targetDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  console.log(`Found ${mdFiles.length} Markdown session files in sessions/mind-matters/`);

  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, '');
    const mdPath = path.join(targetDir, file);
    const htmlPath = path.join(targetDir, `${slug}.html`);

    try {
      const data = parseMarkdownFile(mdPath);
      const htmlContent = generateSessionHtml(data);
      fs.writeFileSync(htmlPath, htmlContent, 'utf8');
      console.log(`[Generated] ${htmlPath}`);

      updateCatalog(slug, data);
      console.log(`[Catalog Updated] ${slug}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

if (require.main === module) {
  buildMindMattersSessions();
}

module.exports = { buildMindMattersSessions, generateSessionHtml, parseMarkdownFile };
