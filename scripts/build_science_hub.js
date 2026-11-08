const fs = require('fs');

const mapping = {
  // HEALTH -> Health & Medicine
  'childhood-obesity-theory-elementary.html': { area: 'Health', sub_topic: 'Health & Medicine', topic_detail: 'Childhood Obesity Theory' },
  'childhood-obesity-theory-intermediate.html': { area: 'Health', sub_topic: 'Health & Medicine', topic_detail: 'Childhood Obesity Theory' },
  'childhood-obesity-theory-upper-intermediate.html': { area: 'Health', sub_topic: 'Health & Medicine', topic_detail: 'Childhood Obesity Theory' },
  'ozempic-obesity-revolution-intermediate.html': { area: 'Health', sub_topic: 'Health & Medicine', topic_detail: 'Ozempic & Metabolic Health' },
  'ozempic-obesity-revolution-upper-intermediate.html': { area: 'Health', sub_topic: 'Health & Medicine', topic_detail: 'Ozempic & Metabolic Health' },
  'hidden-regenerative-powers-intermediate.html': { area: 'Health', sub_topic: 'Health & Medicine', topic_detail: 'Regenerative Medicine' },
  'hidden-regenerative-powers-upper-intermediate.html': { area: 'Health', sub_topic: 'Health & Medicine', topic_detail: 'Regenerative Medicine' },
  'sensory-system-pain-disease-intermediate.html': { area: 'Health', sub_topic: 'Health & Medicine', topic_detail: 'Sensory Pain Systems' },
  'sensory-system-pain-disease-upper-intermediate.html': { area: 'Health', sub_topic: 'Health & Medicine', topic_detail: 'Sensory Pain Systems' },

  // HEALTH -> Mind & Brain
  'ai-and-the-brain-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Synaptic vs AI Learning' },
  'ai-and-the-brain-upper-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Synaptic vs AI Learning' },
  'brain-cells-motivation-advanced.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Motivation Neurons' },
  'brain-cells-motivation-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Motivation Neurons' },
  'brain-improving-in-90s-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Neuroplasticity in 90s' },
  'brain-improving-in-90s-upper-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Neuroplasticity in 90s' },
  'gut-brain-memory-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Gut-Brain Memory Axis' },
  'multilingual-younger-brains-elementary.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Bilingual Cognitive Reserve' },
  'multilingual-younger-brains-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Bilingual Cognitive Reserve' },
  'right-handedness.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Evolutionary Brain Asymmetry' },
  'social-decisions-brain.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Social Decision Circuits' },
  'tv-midlife-shrink-brain-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'TV & Brain Volume' },
  'where-you-live-shapes-dementia-risk-elementary.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Dementia Risk Factors' },
  'where-you-live-shapes-dementia-risk-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Dementia Risk Factors' },
  'where-you-live-shapes-dementia-risk-upper-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Dementia Risk Factors' },
  'your-fingers-hold-secret-brain-evolution-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Motor Cortex & Finger Evolution' },
  'your-fingers-hold-secret-brain-evolution-upper-intermediate.html': { area: 'Health', sub_topic: 'Mind & Brain', topic_detail: 'Motor Cortex & Finger Evolution' },

  // HEALTH -> Living Well
  'coffee-fat-muscle-hormones-advanced.html': { area: 'Health', sub_topic: 'Living Well', topic_detail: 'Coffee, Fat & Muscle Hormones' },
  'grandparents-mental-health.html': { area: 'Health', sub_topic: 'Living Well', topic_detail: 'Grandparents & Mental Health' },
  'museums-movies-theater-stay-younger-elementary.html': { area: 'Health', sub_topic: 'Living Well', topic_detail: 'Culture & Physical Longevity' },
  'museums-movies-theater-stay-younger-intermediate.html': { area: 'Health', sub_topic: 'Living Well', topic_detail: 'Culture & Physical Longevity' },
  'museums-movies-theater-stay-younger-upper-intermediate.html': { area: 'Health', sub_topic: 'Living Well', topic_detail: 'Culture & Physical Longevity' },
  'screen-time-kids-8-years-intermediate.html': { area: 'Health', sub_topic: 'Living Well', topic_detail: 'Child Screen Time & Development' },
  'sitting-up-straight-elementary.html': { area: 'Health', sub_topic: 'Living Well', topic_detail: 'Posture & Mood Improvement' },
  'sitting-up-straight-intermediate.html': { area: 'Health', sub_topic: 'Living Well', topic_detail: 'Posture & Mood Improvement' },

  // TECH
  'fusion-energy.html': { area: 'Tech', sub_topic: 'Clean Tech & Energy', topic_detail: 'Nuclear Fusion Energy' },
  'impersonation-accounts.html': { area: 'Tech', sub_topic: 'Cybersecurity', topic_detail: 'Digital Impersonation' },
  'ordinary-wifi-identification-elementary.html': { area: 'Tech', sub_topic: 'Sensory & Wireless Tech', topic_detail: 'WiFi Person Identification' },
  'ordinary-wifi-identification-intermediate.html': { area: 'Tech', sub_topic: 'Sensory & Wireless Tech', topic_detail: 'WiFi Person Identification' },

  // ENVIRO
  'climate-scientist-warming-report-intermediate.html': { area: 'Enviro', sub_topic: 'Climate Science', topic_detail: 'Climate Warming Controversy' },
  'climate-scientist-warming-report-upper-intermediate.html': { area: 'Enviro', sub_topic: 'Climate Science', topic_detail: 'Climate Warming Controversy' },
  'recycling-distraction-test-intermediate.html': { area: 'Enviro', sub_topic: 'Sustainability & Policy', topic_detail: 'Recycling Policy Efficacy' },

  // SOCIETY
  'animal-cooperation-language-intermediate.html': { area: 'Society', sub_topic: 'Communication & Linguistics', topic_detail: 'Animal Cooperation Language' },
  'animal-cooperation-language-upper-intermediate.html': { area: 'Society', sub_topic: 'Communication & Linguistics', topic_detail: 'Animal Cooperation Language' },
  'ape-laughter-speech-origin-elementary.html': { area: 'Society', sub_topic: 'Origins of Language', topic_detail: 'Ape Laughter & Speech Origins' },
  'ape-laughter-speech-origin-intermediate.html': { area: 'Society', sub_topic: 'Origins of Language', topic_detail: 'Ape Laughter & Speech Origins' },
  'football-beats-shamrock-intermediate.html': { area: 'Society', sub_topic: 'Cognitive Linguistics', topic_detail: 'Psycholinguistics & Word Recall' },
  'football-beats-shamrock-upper-intermediate.html': { area: 'Society', sub_topic: 'Cognitive Linguistics', topic_detail: 'Psycholinguistics & Word Recall' },
  'grandmother-evolutionary-mystery.html': { area: 'Society', sub_topic: 'Evolution & Family', topic_detail: 'Evolutionary Grandmother Mystery' },
  'human-family-tree-rewrite-advanced.html': { area: 'Society', sub_topic: 'Human Origins', topic_detail: 'Rewriting Human Family Tree' },
  'living-most-creative-time.html': { area: 'Society', sub_topic: 'Creative Economy', topic_detail: 'Creative Economy & Media' },
  'losing-spoken-words.html': { area: 'Society', sub_topic: 'Digital Communication', topic_detail: 'Losing 338 Words a Day' },

  // QUIRKY
  'ai-reality-delusion.html': { area: 'Quirky', sub_topic: 'Curious Phenomena', topic_detail: 'AI Chatbot Delusions' },
  'inside-the-backrooms-elementary.html': { area: 'Quirky', sub_topic: 'Internet Lore & Oddities', topic_detail: 'The Backrooms Liminal Space' },
  'inside-the-backrooms-intermediate.html': { area: 'Quirky', sub_topic: 'Internet Lore & Oddities', topic_detail: 'The Backrooms Liminal Space' },
  'mendelian-laws-broken.html': { area: 'Quirky', sub_topic: 'Curious Phenomena', topic_detail: 'Broken Laws of Genetics' },
  'spider-creatures-origins-of-fatherhood-intermediate.html': { area: 'Quirky', sub_topic: 'Bizarre Animal Behaviors', topic_detail: 'Spider Creatures & Fatherhood' },
  'spider-creatures-origins-of-fatherhood-upper-intermediate.html': { area: 'Quirky', sub_topic: 'Bizarre Animal Behaviors', topic_detail: 'Spider Creatures & Fatherhood' }
};

const dir = 'sessions/keeping-up-with-science';
const articleUrls = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const content = fs.readFileSync(dir + '/' + f, 'utf8');
  const linkRegex = /<a\s+[^>]*href=\"([^\"]+)\"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = linkRegex.exec(content)) !== null) {
    if (m[1].includes('sciencedaily.com') || m[1].includes('nature.com') || m[1].includes('sciencefocus.com') || m[1].includes('youtu')) {
      articleUrls[f] = m[1];
      break;
    }
  }
}

let html = fs.readFileSync('keeping-up-with-science.html', 'utf8');

// 1. Parse all 57 distinct cards from the existing HTML
const cardRegex = /<div class=\"science-card history-session\"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
const rawCards = html.split('<div class=\"science-card history-session\"');

const distinctCards = [];
const seenFiles = new Set();

for (let i = 1; i < rawCards.length; i++) {
  const c = rawCards[i];
  const hrefMatch = c.match(/href=\"sessions\/keeping-up-with-science\/([^\"]+)\"/);
  if (!hrefMatch) continue;
  const filename = hrefMatch[1];
  if (seenFiles.has(filename)) continue;
  seenFiles.add(filename);

  const levelMatch = c.match(/^[^>]*data-level=\"([^\"]*)\"/);
  const level = levelMatch ? levelMatch[1] : '';

  const headerMatch = c.match(/<div class=\"science-card-header\">([\s\S]*?)<\/div>/);
  const headerHtml = headerMatch ? headerMatch[1].trim() : '';

  const titleMatch = c.match(/<h4 class=\"science-card-title\">([\s\S]*?)<\/h4>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = c.match(/<p class=\"science-card-desc\">([\s\S]*?)<\/p>/);
  const desc = descMatch ? descMatch[1].trim() : '';

  const dateMatch = c.match(/<span class=\"science-card-date\">([\s\S]*?)<\/span>/);
  const date = dateMatch ? dateMatch[1].trim() : '26 August 2026';

  distinctCards.push({
    filename,
    level,
    headerHtml,
    title,
    desc,
    date
  });
}

console.log('Parsed unique cards:', distinctCards.length);

const generatedCards = distinctCards.map(c => {
  const meta = mapping[c.filename] || { area: 'Health', sub_topic: 'Health & Medicine' };
  const articleUrl = articleUrls[c.filename] || '#';
  const subtopicSlug = meta.sub_topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return `<div class="science-card history-session" data-lang="en" data-level="${c.level}" data-area="${meta.area.toLowerCase()}" data-subtopic="${subtopicSlug}">
<div class="science-ruler"></div>
<div class="science-card-header">
${c.headerHtml}
</div>
<div class="science-card-body">
<div class="science-card-badges" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
  <span class="sc-area-badge" style="display:inline-block; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; padding:2px 8px; border-radius:12px; background:rgba(15,110,86,0.12); color:#0F6E56;">${meta.area}</span>
  <span class="sc-subtopic-badge" style="display:inline-block; font-size:0.7rem; font-weight:600; padding:2px 8px; border-radius:12px; background:rgba(0,0,0,0.06); color:var(--ink);">${meta.sub_topic}</span>
</div>
<h4 class="science-card-title">${c.title}</h4>
<p class="science-card-desc">${c.desc}</p>
</div>
<div class="science-card-footer" style="display:flex; flex-direction:column; gap:8px; align-items:stretch;">
<div style="display:flex; justify-content:space-between; align-items:center;">
  <span class="science-card-date">${c.date}</span>
  <a class="science-card-article-link" href="${articleUrl}" target="_blank" rel="noopener" style="font-size:0.8rem; font-weight:600; color:#0F6E56; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">Original Article 📖</a>
</div>
<a class="science-card-view" href="sessions/keeping-up-with-science/${c.filename}" style="text-align:center;">Explore Session ➔</a>
</div>
</div>`;
}).join('\n');

// Find the entire section starting from Past Sessions header to </div>\n<!-- /logged-in content -->
const pastHeader = '<h2 style="font-size: 1.5rem;">🕒 Past Sessions</h2>';
const headerIndex = html.indexOf(pastHeader);

const pastSectionEnd = '<!-- /logged-in content -->';
const pastSectionEndIndex = html.indexOf(pastSectionEnd);

const beforePast = html.substring(0, headerIndex + pastHeader.length);
const afterPast = html.substring(pastSectionEndIndex);

const newPastSection = `
</div>
<div class="club-filters-wrapper" style="margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1rem;">
  <!-- THEMATIC AREAS FILTER -->
  <div>
    <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 0.5rem;">🔬 Science Thematic Areas</div>
    <div class="club-filters-area" id="science-area-filters" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <button class="filter-btn active" data-area="all">All Areas (57)</button>
      <button class="filter-btn" data-area="health">🩺 Health (34)</button>
      <button class="filter-btn" data-area="tech">💻 Tech (4)</button>
      <button class="filter-btn" data-area="enviro">🌱 Enviro (3)</button>
      <button class="filter-btn" data-area="society">🏛️ Society (10)</button>
      <button class="filter-btn" data-area="quirky">✨ Quirky (6)</button>
    </div>
  </div>

  <!-- HEALTH UNFOLDING SUB-TOPICS -->
  <div id="science-health-subtopics-wrapper" style="background: rgba(15, 110, 86, 0.05); border: 1px solid rgba(15, 110, 86, 0.2); border-radius: 12px; padding: 0.85rem 1rem;">
    <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0F6E56; margin-bottom: 0.4rem;">🩺 Health Branches</div>
    <div class="club-filters-subtopic" id="science-subtopic-filters" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <button class="filter-btn active" data-subtopic="all" style="font-size: 0.8rem; padding: 0.35rem 0.8rem;">All Health Topics</button>
      <button class="filter-btn" data-subtopic="health-medicine" style="font-size: 0.8rem; padding: 0.35rem 0.8rem;">Health &amp; Medicine (9)</button>
      <button class="filter-btn" data-subtopic="mind-brain" style="font-size: 0.8rem; padding: 0.35rem 0.8rem;">Mind &amp; Brain (17)</button>
      <button class="filter-btn" data-subtopic="living-well" style="font-size: 0.8rem; padding: 0.35rem 0.8rem;">Living Well (8)</button>
    </div>
  </div>

  <!-- LEVEL & LANGUAGE FILTERS -->
  <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center;">
    <div>
      <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 0.5rem;">🎯 CEFR Level</div>
      <div class="club-filters-level" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="filter-btn active" data-level="all">All Levels</button>
        <button class="filter-btn" data-level="a2">A2 Elementary</button>
        <button class="filter-btn" data-level="b1 b2">B1-B2 Intermediate</button>
        <button class="filter-btn" data-level="c1">C1 Advanced</button>
      </div>
    </div>
    <div>
      <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 0.5rem;">🌐 Language</div>
      <div class="club-filters-lang" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="filter-btn active" data-lang="all">All Languages</button>
        <button class="filter-btn" data-lang="en">🇬🇧 English</button>
      </div>
    </div>
  </div>

  <!-- ACTIVE FILTER SUMMARY -->
  <div id="sc-active-counter" style="font-size: 0.88rem; font-weight: 600; color: #0F6E56;">Showing 57 sessions</div>
</div>

<div class="history-body" style="display: block; padding: 0; border: none;">
  <div class="science-history-grid" id="science-history-grid">
${generatedCards}
  </div>
</div>
</div>
</div>
`;

html = beforePast + newPastSection + afterPast;

// Now update JavaScript
const scriptStart = html.indexOf("<script>\ndocument.addEventListener('DOMContentLoaded'");
const scriptEnd = html.indexOf('</script><script src="shared/js/cosyevents-session.js">');

const newScript = `<script>
document.addEventListener('DOMContentLoaded', () => {
  let selectedArea = 'all';
  let selectedSubtopic = 'all';
  let selectedLevel = 'all';
  let selectedLang = 'all';

  const areaBtns = document.querySelectorAll('#science-area-filters .filter-btn');
  const subtopicBtns = document.querySelectorAll('#science-subtopic-filters .filter-btn');
  const levelBtns = document.querySelectorAll('.club-filters-level .filter-btn');
  const langBtns = document.querySelectorAll('.club-filters-lang .filter-btn');
  const healthSubtopicsWrapper = document.getElementById('science-health-subtopics-wrapper');
  const counterEl = document.getElementById('sc-active-counter');
  const sessions = document.querySelectorAll('.history-session');

  function updateFilterDisplay() {
    let visibleCount = 0;
    const targetLevels = selectedLevel === 'all' ? [] : selectedLevel.split(' ');

    sessions.forEach(sess => {
      const sessArea = (sess.getAttribute('data-area') || '').toLowerCase();
      const sessSubtopic = (sess.getAttribute('data-subtopic') || '').toLowerCase();
      const sessLevel = (sess.getAttribute('data-level') || '').toLowerCase();
      const sessLang = (sess.getAttribute('data-lang') || '').toLowerCase();

      // Area match
      const areaMatch = (selectedArea === 'all') || (sessArea === selectedArea);

      // Subtopic match: only enforced if Health is selected or if specific subtopic is not 'all'
      let subtopicMatch = true;
      if (selectedArea === 'health' && selectedSubtopic !== 'all') {
        subtopicMatch = (sessSubtopic === selectedSubtopic);
      } else if (selectedArea !== 'health' && selectedArea !== 'all') {
        subtopicMatch = true;
      } else if (selectedSubtopic !== 'all') {
        subtopicMatch = (sessSubtopic === selectedSubtopic);
      }

      // Level match
      const levelMatch = (selectedLevel === 'all') || targetLevels.some(l => sessLevel.includes(l));

      // Lang match
      const langMatch = (selectedLang === 'all') || (sessLang === selectedLang);

      if (areaMatch && subtopicMatch && levelMatch && langMatch) {
        sess.style.display = 'flex';
        visibleCount++;
      } else {
        sess.style.display = 'none';
      }
    });

    if (counterEl) {
      counterEl.textContent = 'Showing ' + visibleCount + ' session' + (visibleCount === 1 ? '' : 's');
    }
  }

  // Area button handler
  areaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      areaBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedArea = btn.getAttribute('data-area') || 'all';

      // Unfold health subtopics when Health is selected (or hide when other non-health areas selected)
      if (selectedArea === 'health' || selectedArea === 'all') {
        healthSubtopicsWrapper.style.display = 'block';
      } else {
        healthSubtopicsWrapper.style.display = 'none';
        selectedSubtopic = 'all';
        subtopicBtns.forEach(b => b.classList.remove('active'));
        if (subtopicBtns[0]) subtopicBtns[0].classList.add('active');
      }

      updateFilterDisplay();
    });
  });

  // Subtopic button handler
  subtopicBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subtopicBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSubtopic = btn.getAttribute('data-subtopic') || 'all';

      // If a health subtopic is clicked while another area was active, switch to health
      if (selectedSubtopic !== 'all' && selectedArea !== 'health') {
        selectedArea = 'health';
        areaBtns.forEach(b => b.classList.remove('active'));
        const healthBtn = document.querySelector('#science-area-filters .filter-btn[data-area="health"]');
        if (healthBtn) healthBtn.classList.add('active');
      }

      updateFilterDisplay();
    });
  });

  // Level button handler
  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLevel = btn.getAttribute('data-level') || 'all';
      updateFilterDisplay();
    });
  });

  // Lang button handler
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLang = btn.getAttribute('data-lang') || 'all';
      updateFilterDisplay();
    });
  });

  updateFilterDisplay();
});
</script>`;

html = html.substring(0, scriptStart) + newScript + html.substring(scriptEnd);
fs.writeFileSync('keeping-up-with-science.html', html, 'utf8');
console.log('keeping-up-with-science.html rebuilt cleanly!');
