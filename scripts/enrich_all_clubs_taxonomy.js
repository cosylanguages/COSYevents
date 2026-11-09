const fs = require('fs');

const sessions = JSON.parse(fs.readFileSync('data/sessions.json', 'utf8'));

// Helper to deduce theme for each club
function deduceTaxonomy(s) {
  // If already assigned (e.g. Science sessions), preserve it
  if (s.theme_area && s.sub_topic) {
    return { area: s.theme_area, sub_topic: s.sub_topic, topic_detail: s.topic_detail || '' };
  }

  const titleLower = (s.title || '').toLowerCase();
  const club = s.club || '';

  // 1. Cinema Club
  if (club === 'Cinema Club') {
    if (titleLower.includes('sci-fi') || titleLower.includes('space') || titleLower.includes('matrix') || titleLower.includes('interstellar') || titleLower.includes('alien')) {
      return { area: 'Cinema & Film', sub_topic: 'Sci-Fi & Future Visions', topic_detail: 'Speculative Cinema' };
    }
    if (titleLower.includes('documentary') || titleLower.includes('history') || titleLower.includes('biopic')) {
      return { area: 'Cinema & Film', sub_topic: 'Documentary & Real Life', topic_detail: 'Historical & Non-fiction' };
    }
    if (titleLower.includes('comedy') || titleLower.includes('animation') || titleLower.includes('disney') || titleLower.includes('pixar')) {
      return { area: 'Cinema & Film', sub_topic: 'Animation & Comedy', topic_detail: 'Heartwarming & Lighthearted' };
    }
    if (titleLower.includes('thriller') || titleLower.includes('crime') || titleLower.includes('noir') || titleLower.includes('mystery')) {
      return { area: 'Cinema & Film', sub_topic: 'Thriller & Mystery', topic_detail: 'Suspense & Psychological Noir' };
    }
    return { area: 'Cinema & Film', sub_topic: 'Drama & Human Stories', topic_detail: 'Character Studies & Narrative' };
  }

  // 2. Karaoke Club
  if (club === 'Karaoke Club') {
    if (titleLower.includes('rock') || titleLower.includes('queen') || titleLower.includes('metal')) {
      return { area: 'Music & Lyrics', sub_topic: 'Rock & Anthems', topic_detail: 'Iconic Anthems' };
    }
    if (titleLower.includes('pop') || titleLower.includes('dance') || titleLower.includes('80s') || titleLower.includes('90s')) {
      return { area: 'Music & Lyrics', sub_topic: 'Pop Classics & Nostalgia', topic_detail: 'Global Pop Hits' };
    }
    if (titleLower.includes('ballad') || titleLower.includes('love') || titleLower.includes('soul') || titleLower.includes('acoustic')) {
      return { area: 'Music & Lyrics', sub_topic: 'Soul & Love Ballads', topic_detail: 'Emotional Lyrics' };
    }
    if (titleLower.includes('soundtrack') || titleLower.includes('disney') || titleLower.includes('musical')) {
      return { area: 'Music & Lyrics', sub_topic: 'Soundtracks & Musicals', topic_detail: 'Broadway & Cinematic Tracks' };
    }
    return { area: 'Music & Lyrics', sub_topic: 'Global Melodies', topic_detail: 'Vocal Exploration' };
  }

  // 3. I Couldn't Help But Wonder
  if (club === "I Couldn't Help But Wonder") {
    if (titleLower.includes('love') || titleLower.includes('monogamy') || titleLower.includes('dating') || titleLower.includes('relationship') || titleLower.includes('bisexual') || titleLower.includes('marriage') || titleLower.includes('friendship') || titleLower.includes('ex')) {
      return { area: 'Relationships & Love', sub_topic: 'Intimacy & Modern Dating', topic_detail: 'Human Bonds' };
    }
    if (titleLower.includes('tradition') || titleLower.includes('society') || titleLower.includes('etiquette') || titleLower.includes('taboo') || titleLower.includes('polite') || titleLower.includes('money') || titleLower.includes('career')) {
      return { area: 'Society & Culture', sub_topic: 'Social Norms & Taboos', topic_detail: 'Cultural Expectations' };
    }
    if (titleLower.includes('rain') || titleLower.includes('insect') || titleLower.includes('cat') || titleLower.includes('dog') || titleLower.includes('animal') || titleLower.includes('weather') || titleLower.includes('cloud')) {
      return { area: 'Nature & Curiosities', sub_topic: 'Everyday Wonders', topic_detail: 'Philosophical Curiosities' };
    }
    return { area: 'Identity & Self', sub_topic: 'Self-Reflection & Soul', topic_detail: 'Existential Inquiries' };
  }

  // 4. Mind Matters
  if (club === 'Mind Matters') {
    if (titleLower.includes('grief') || titleLower.includes('anxiety') || titleLower.includes('stress') || titleLower.includes('burnout') || titleLower.includes('trauma') || titleLower.includes('depression') || titleLower.includes('sleep') || titleLower.includes('healing')) {
      return { area: 'Mental Health & Well-being', sub_topic: 'Healing & Emotional Resilience', topic_detail: 'Emotional Wellness' };
    }
    if (titleLower.includes('experiment') || titleLower.includes('blue eyes') || titleLower.includes('bluewashing') || titleLower.includes('corporate') || titleLower.includes('conformity') || titleLower.includes('society') || titleLower.includes('crowd')) {
      return { area: 'Social Psychology', sub_topic: 'Group Dynamics & Social Norms', topic_detail: 'Behavioral Experiments' };
    }
    return { area: 'Cognition & Behavior', sub_topic: 'Habits & Cognitive Biases', topic_detail: 'Mind Machinery' };
  }

  // 5. The Greatest Quotes
  if (club === 'The Greatest Quotes') {
    if (titleLower.includes('art') || titleLower.includes('creation') || titleLower.includes('creative') || titleLower.includes('beauty') || titleLower.includes('music') || titleLower.includes('writing') || titleLower.includes('poet')) {
      return { area: 'Art & Creativity', sub_topic: 'Aesthetics & Artistic Voice', topic_detail: 'Artistic Inspiration' };
    }
    if (titleLower.includes('child') || titleLower.includes('love') || titleLower.includes('family') || titleLower.includes('friend') || titleLower.includes('mother') || titleLower.includes('father') || titleLower.includes('tradition')) {
      return { area: 'Human Connection', sub_topic: 'Family, Empathy & Kinship', topic_detail: 'Interpersonal Bonds' };
    }
    return { area: 'Philosophy & Wisdom', sub_topic: 'Life Lessons & Timeless Insights', topic_detail: 'Classic Reflections' };
  }

  // 6. Debatable & Relatable
  if (club === 'Debatable & Relatable') {
    if (titleLower.includes('ai') || titleLower.includes('robot') || titleLower.includes('technology') || titleLower.includes('digital') || titleLower.includes('machine') || titleLower.includes('internet')) {
      return { area: 'Ethics & Future', sub_topic: 'Technology & Human Limits', topic_detail: 'Tech Dilemmas' };
    }
    if (titleLower.includes('homework') || titleLower.includes('school') || titleLower.includes('education') || titleLower.includes('children') || titleLower.includes('ban')) {
      return { area: 'Education & Policy', sub_topic: 'Youth & Academic Standards', topic_detail: 'Educational Reform' };
    }
    return { area: 'Ethics & Future', sub_topic: 'Social Contradictions', topic_detail: 'Moral Dilemmas' };
  }

  // 7. Let's Celebrate
  if (club === "Let's Celebrate") {
    if (titleLower.includes('diwali') || titleLower.includes('christmas') || titleLower.includes('easter') || titleLower.includes('new year') || titleLower.includes('carnival') || titleLower.includes('festival') || titleLower.includes('halloween')) {
      return { area: 'Culture & Heritage', sub_topic: 'World Festivals & Rituals', topic_detail: 'Festivals of Light & Joy' };
    }
    return { area: 'Culture & Heritage', sub_topic: 'International Observances & Days', topic_detail: 'Global Commemorations' };
  }

  // 8. Basic Speaking Club
  if (club === 'Basic Speaking Club') {
    if (titleLower.includes('work') || titleLower.includes('career') || titleLower.includes('job') || titleLower.includes('office') || titleLower.includes('business')) {
      return { area: 'Everyday Life', sub_topic: 'Workplace & Professional Basics', topic_detail: 'Career Dialogues' };
    }
    if (titleLower.includes('family') || titleLower.includes('friend') || titleLower.includes('people') || titleLower.includes('relationship')) {
      return { area: 'Everyday Life', sub_topic: 'Family & Social Roles', topic_detail: 'Everyday Connections' };
    }
    if (titleLower.includes('food') || titleLower.includes('cooking') || titleLower.includes('restaurant') || titleLower.includes('dining')) {
      return { area: 'Everyday Life', sub_topic: 'Food & Dining Out', topic_detail: 'Culinary Basics' };
    }
    return { area: 'Everyday Life', sub_topic: 'Daily Routines & First Steps', topic_detail: 'Essential Conversations' };
  }

  // 9. My Life With & Without
  if (club === 'My Life With & Without') {
    return { area: 'Lifestyle & Perspectives', sub_topic: 'Modern Dependencies & Choices', topic_detail: 'Contrasting Realities' };
  }

  // 10. If You Were
  if (club === 'If You Were') {
    return { area: 'Empathy & Hypotheticals', sub_topic: 'Walking in Another’s Shoes', topic_detail: 'Imaginative Roleplays' };
  }

  // 11. Long Reads
  if (club === 'Long Reads') {
    return { area: 'Literature & In-Depth', sub_topic: 'Classic & Modern Prose', topic_detail: 'Close Reading' };
  }

  // 12. Game Evenings
  if (club === 'Game Evenings' || (s.format && s.format.includes('Game'))) {
    return { area: 'Games & Play', sub_topic: 'Interactive Social Gaming', topic_detail: 'Language Games' };
  }

  return { area: 'Culture & Conversation', sub_topic: 'Open Discussion', topic_detail: 'General Session' };
}

let enrichedCount = 0;
for (const s of sessions) {
  const tax = deduceTaxonomy(s);
  s.theme_area = tax.area;
  s.sub_topic = tax.sub_topic;
  if (!s.topic_detail) s.topic_detail = tax.topic_detail;
  enrichedCount++;
}

fs.writeFileSync('data/sessions.json', JSON.stringify(sessions, null, 2) + '\n', 'utf8');
console.log('Successfully enriched all', enrichedCount, 'sessions in data/sessions.json!');
