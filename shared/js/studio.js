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

  // Preset: Keeping Up with Science (Cosyscience)
  function createScienceClubSession() {
    var today = new Date().toISOString().split('T')[0];
    return {
      slug: 'science-neuroplasticity-and-learning',
      event: 'english-b2-science',
      title: 'Keeping Up with Science: Neuroplasticity & Habit Rewiring',
      theme: 'Mind & Brain',
      language: 'English',
      level: 'B2',
      date: today,
      host: 'COSY Facilitator',
      summary: 'Explore cutting-edge neuroscience on how adult brains rewire neural pathways through deliberate practice and focused attention.',
      activities: [
        {
          type: 'icebreaker',
          title: 'Page 1: Pre-Session Science Warm-up',
          instructions: 'Review the research hypothesis with your partner and test your intuition.',
          content: '<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-a">👤 Speaker A</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">How quickly do you think the adult brain forms a new physical synaptic connection?</div>\n  <span class="studio-starter-chip">My initial hypothesis is...</span>\n  <span class="studio-starter-chip">Based on experience...</span>\n</div>\n\n<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-b">👥 Speaker B</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">Have you ever successfully unlearned an ingrained automatic habit?</div>\n  <span class="studio-starter-chip">It took conscious effort to...</span>\n  <span class="studio-starter-chip">The main trigger was...</span>\n</div>'
        },
        {
          type: 'round_1',
          title: 'Page 2: Research Study Analysis',
          instructions: 'Debate the research findings and discuss whether deliberate struggle accelerates retention.',
          content: '<div class="card-links-box">\n  <a class="card-link-item" href="https://www.nature.com/articles/neuroscience-example" target="_blank" rel="noopener noreferrer">\n    <div class="card-link-meta">\n      <span class="card-link-title">📄 Nature Neuroscience Publication</span>\n      <span class="card-link-desc">Primary Study: Synaptic remodeling during language acquisition</span>\n    </div>\n    <span style="font-size: 0.8rem; color: var(--st-accent);">↗</span>\n  </a>\n</div>\n\n<ol>\n  <li>What was the key independent variable in the neuroimaging study?</li>\n  <li>Why does frustration during learning signal neurochemical priming rather than failure?</li>\n</ol>'
        },
        {
          type: 'round_2',
          title: 'Page 3: Practical Laboratory Takeaway',
          instructions: 'Apply the research to your personal language routine. Formulate a 21-day experiment.',
          content: '<ol>\n  <li>Design an optimal 20-minute daily micro-routine that leverages active recall.</li>\n  <li>How can you embrace error-correction without emotional friction?</li>\n</ol>\n\n<div class="card-callout-box">\n  <div class="card-callout-title">🔬 Science Takeaway Principle</div>\n  <p style="margin: 0; line-height: 1.5;">\n    Neuroplasticity in adults requires high alertness followed by deep rest (sleep or NSDR) where synaptic consolidation actually occurs.\n  </p>\n</div>'
        }
      ],
      vocabulary: [
        {
          id: 'en:neuroplasticity:noun',
          word: 'neuroplasticity',
          pos: 'noun',
          definition: 'the ability of the brain to form and reorganize synaptic connections, especially in response to learning or experience',
          example: 'Neuroplasticity proves that adult brains remain adaptable throughout life.',
          primary_theme: 'science',
          sub_theme: 'neuroscience',
          level: 'B2'
        },
        {
          id: 'en:synaptic:adjective',
          word: 'synaptic',
          pos: 'adjective',
          definition: 'relating to a synapse or synapses between nerve cells',
          example: 'Deep sleep enhances synaptic consolidation after intense study.',
          primary_theme: 'science',
          sub_theme: 'biology',
          level: 'B2'
        }
      ],
      sources: [
        { source_title: 'Nature Neuroscience 2024', source_url: 'https://nature.com/example' }
      ]
    };
  }

  // Preset: I Couldn't Help But Wonder
  function createWonderClubSession() {
    var today = new Date().toISOString().split('T')[0];
    return {
      slug: 'wonder-authenticity-and-social-masks',
      event: 'english-c1-wonder',
      title: "I Couldn't Help But Wonder: Authenticity & Social Masks",
      theme: 'Philosophy and Modern Living',
      language: 'English',
      level: 'C1',
      date: today,
      host: 'COSY Facilitator',
      summary: 'A philosophical reflection session on Carl Jung\'s persona, social expectations, and staying authentic in an era of personal branding. Golden rule: No translations, try to explain!',
      activities: [
        {
          type: 'icebreaker',
          title: "Page 1: The Wonder Column Hook",
          instructions: 'Golden Rule: No translations, try to explain! Read the central dilemma and reflect in pairs.',
          content: '<div class="card-callout-box">\n  <div class="card-callout-title">💭 The Carrie Bradshaw Hook</div>\n  <p style="margin: 0; font-style: italic; line-height: 1.5;">\n    "As I watched everyone curate their perfectly effortless lives, I couldn\'t help but wonder: Are our social masks protecting who we really are, or slowly replacing us?"\n  </p>\n</div>\n\n<ol>\n  <li>When did you last realize you were wearing a "persona" rather than speaking entirely candidly?</li>\n  <li>Is total radical honesty ever truly desirable in civilized society?</li>\n</ol>'
        },
        {
          type: 'round_1',
          title: 'Page 2: Dialectical Inquiry',
          instructions: 'Explore the tension between belonging and genuine self-expression.',
          content: '<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-a">👤 Speaker A</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">Can a person have a stable core identity if their behavior shifts across contexts?</div>\n  <span class="studio-starter-chip">I would argue that...</span>\n  <span class="studio-starter-chip">Far from being hypocritical...</span>\n</div>\n\n<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-b">👥 Speaker B</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">Does digital curation make authenticity an impossible paradox?</div>\n  <span class="studio-starter-chip">It strikes me as...</span>\n  <span class="studio-starter-chip">The moment it becomes performative...</span>\n</div>'
        },
        {
          type: 'outro',
          title: "Page 3: Philosopher's Ledger & Personal Reflection",
          instructions: 'Synthesize your insight and record your parting thought.',
          content: '<ol>\n  <li>What is one uncomfortable truth you encountered during today\'s exploration?</li>\n  <li>One nuance or refined expression you adopted:</li>\n</ol>\n\n<div class="card-callout-box">\n  <div class="card-callout-title">🪞 Perspective Mirror</div>\n  <p style="margin: 0; line-height: 1.5;">\n    Remember our ecosystem essay on "Stop Translating": when you lack a direct word, circumlocution is your greatest intellectual asset!\n  </p>\n</div>'
        }
      ],
      vocabulary: [
        {
          id: 'en:persona:noun',
          word: 'persona',
          pos: 'noun',
          definition: 'the aspect of someone\'s character that is presented to or perceived by others',
          example: 'His public persona differed greatly from his private introspective nature.',
          primary_theme: 'philosophy',
          sub_theme: 'identity',
          level: 'C1'
        },
        {
          id: 'en:performative:adjective',
          word: 'performative',
          pos: 'adjective',
          definition: 'done for show, effect, or social approval rather than genuine conviction',
          example: 'Online outrage often borders on being purely performative.',
          primary_theme: 'society',
          sub_theme: 'culture',
          level: 'C1'
        }
      ],
      sources: [
        { source_title: 'Jungian Psychology: Archetypes and the Persona', source_url: 'https://example.com/jung-persona' }
      ]
    };
  }

  // Preset: Cinema Club
  function createCinemaClubSession() {
    var today = new Date().toISOString().split('T')[0];
    return {
      slug: 'cinema-unreliable-narrator',
      event: 'english-b2-cinema',
      title: 'Cinema Club: The Art of the Unreliable Narrator',
      theme: 'Cinema and Storytelling',
      language: 'English',
      level: 'B2',
      date: today,
      host: 'COSY Facilitator',
      summary: 'Analyze cinematic techniques of subjective storytelling, plot twists, and character psychology in psychological thrillers.',
      activities: [
        {
          type: 'icebreaker',
          title: 'Page 1: Scene Hook & Visual Atmosphere',
          instructions: 'Watch the selected opening sequence and discuss the cinematography.',
          content: '<div class="card-video-box">\n  <div class="card-video-responsive">\n    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Film Clip" allowfullscreen></iframe>\n  </div>\n  <div class="card-video-disclaimer">🎬 Film Sequence: Notice camera angle, lighting, and ambient sound cues.</div>\n</div>\n\n<ol>\n  <li>What emotions does the opening lighting palette evoke?</li>\n  <li>Do you trust the protagonist from the very first frame? Why or why not?</li>\n</ol>'
        },
        {
          type: 'roleplay',
          title: 'Page 2: Scene Re-enactment & Subtext Analysis',
          instructions: 'Partner up: perform the dialogue below, then analyze the unspoken emotional subtext.',
          content: '<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-a">🎭 Character A (Detective)</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">"You remember the exact time, don\'t you? Or is your memory just playing tricks on you?"</div>\n  <span class="studio-starter-chip">I have to press you on this because...</span>\n</div>\n\n<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-b">🎭 Character B (Witness)</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">"Memory isn\'t a tape recorder. Sometimes what we feel is truer than what happened."</div>\n  <span class="studio-starter-chip">Look at the bigger picture...</span>\n</div>'
        },
        {
          type: 'outro',
          title: 'Page 3: Director\'s Cut Takeaway',
          instructions: 'Debrief the narrative devices and cinema vocabulary used in today\'s critique.',
          content: '<ol>\n  <li>Favorite film with an unreliable narrator:</li>\n  <li>How does sound design alter audience perception?</li>\n</ol>'
        }
      ],
      vocabulary: [
        {
          id: 'en:cinematography:noun',
          word: 'cinematography',
          pos: 'noun',
          definition: 'the art or technique of movie photography, including camera angles and lighting',
          example: 'The film earned acclaim for its moody, chiaroscuro cinematography.',
          primary_theme: 'arts',
          sub_theme: 'cinema',
          level: 'B2'
        },
        {
          id: 'en:subtext:noun',
          word: 'subtext',
          pos: 'noun',
          definition: 'an underlying and often distinct theme or meaning in a conversation or piece of writing',
          example: 'The dialogue was polite, but the dramatic subtext was intense.',
          primary_theme: 'arts',
          sub_theme: 'literature',
          level: 'B2'
        }
      ],
      sources: []
    };
  }

  // Preset: Debate Duel
  function createDebateClubSession() {
    var today = new Date().toISOString().split('T')[0];
    return {
      slug: 'debate-four-day-workweek',
      event: 'english-b2-debate',
      title: 'Debate Duel: The 32-Hour Four-Day Workweek',
      theme: 'Society & Economics',
      language: 'English',
      level: 'B2',
      date: today,
      host: 'COSY Facilitator',
      summary: 'A fast-paced structured parliamentary debate duel on adopting a mandatory 4-day workweek without pay reductions.',
      activities: [
        {
          type: 'icebreaker',
          title: 'Page 1: The Motion & Stance Assignment',
          instructions: 'House Motion: "This House Would Legislate a 4-Day Workweek with 100% Salary Protection."',
          content: '<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-a">🏛 Affirmative (Proposition)</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">Argue why productivity gains and mental wellbeing justify fewer hours.</div>\n  <span class="studio-starter-chip">We maintain that...</span>\n  <span class="studio-starter-chip">The empirical trials indicate...</span>\n</div>\n\n<div class="studio-prompt-card">\n  <span class="studio-speaker-badge speaker-b">⚖️ Opposition</span>\n  <div style="font-weight:600; margin-bottom: 0.35rem;">Argue why small businesses and customer service sectors would struggle.</div>\n  <span class="studio-starter-chip">While well-intentioned, this overlooks...</span>\n  <span class="studio-starter-chip">The economic friction would...</span>\n</div>'
        },
        {
          type: 'round_1',
          title: 'Page 2: Cross-Examination & Rebuttal',
          instructions: '2-minute timed rounds. Point of Information (POI) allowed after the first 30 seconds.',
          content: '<ol>\n  <li>Speaker 1: Constructive arguments (2 mins).</li>\n  <li>Speaker 2: Rebuttal & Point of Information response (2 mins).</li>\n</ol>\n\n<div class="card-callout-box">\n  <div class="card-callout-title">⚔️ Debate Etiquette & Formulations</div>\n  <p style="margin: 0; line-height: 1.5;">\n    • "With all due respect to the proposition, that premise collapses when..."<br>\n    • "Our opponents fail to account for the disproportionate burden on..."\n  </p>\n</div>'
        },
        {
          type: 'interlude',
          title: 'Page 3: Floor Division & Live Vote',
          instructions: 'Facilitator calls for the vote. Count Ayes vs Noes.',
          content: '<ol>\n  <li>Ayes: Support the motion.</li>\n  <li>Noes: Oppose the motion.</li>\n</ol>'
        }
      ],
      vocabulary: [
        {
          id: 'en:motion:noun',
          word: 'motion',
          pos: 'noun',
          definition: 'a formal proposal put to a legislature or debating assembly for decision',
          example: 'The house passed the motion by a slim majority.',
          primary_theme: 'society',
          sub_theme: 'politics',
          level: 'B2'
        },
        {
          id: 'en:rebuttal:noun',
          word: 'rebuttal',
          pos: 'noun',
          definition: 'a refutation or contradiction of an argument or accusation',
          example: 'Her rebuttal effectively dismantled the opposing argument.',
          primary_theme: 'debate',
          sub_theme: 'rhetoric',
          level: 'B2'
        }
      ],
      sources: []
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
    authEmail: '',
    historyStack: [],
    futureStack: []
  };

  function pushHistory() {
    try {
      var snapshot = JSON.stringify(state.session);
      if (state.historyStack.length > 0 && state.historyStack[state.historyStack.length - 1] === snapshot) {
        return;
      }
      state.historyStack.push(snapshot);
      if (state.historyStack.length > 30) state.historyStack.shift();
      state.futureStack = [];
      saveDraftToStorage();
    } catch (e) {}
  }

  function undo() {
    if (state.historyStack.length <= 1) return;
    var current = state.historyStack.pop();
    state.futureStack.push(current);
    var prev = state.historyStack[state.historyStack.length - 1];
    if (prev) {
      state.session = JSON.parse(prev);
      syncFormFromState();
    }
  }

  function redo() {
    if (state.futureStack.length === 0) return;
    var next = state.futureStack.pop();
    state.historyStack.push(next);
    state.session = JSON.parse(next);
    syncFormFromState();
  }

  function saveDraftToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      var payload = {
        timestamp: Date.now(),
        session: state.session
      };
      window.localStorage.setItem('ce_studio_draft', JSON.stringify(payload));
    } catch (e) {}
  }

  function loadDraftFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    try {
      var raw = window.localStorage.getItem('ce_studio_draft');
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.session && parsed.session.title) {
        state.session = parsed.session;
        return true;
      }
    } catch (e) {}
    return false;
  }

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

  function generateTimerBlock(minutes) {
    var mins = minutes || 5;
    var mm = mins < 10 ? '0' + mins : '' + mins;
    return (
      '<div class="edv-timer-widget" data-duration="' + (mins * 60) + '">\n' +
      '  <div class="edv-timer-display">\n' +
      '    <span class="edv-timer-icon">⏱</span>\n' +
      '    <span class="edv-timer-digits">' + mm + ':00</span>\n' +
      '  </div>\n' +
      '  <div class="edv-timer-controls">\n' +
      '    <button type="button" class="edv-timer-btn edv-timer-start">Start</button>\n' +
      '    <button type="button" class="edv-timer-btn edv-timer-reset">Reset</button>\n' +
      '  </div>\n' +
      '</div>'
    );
  }

  function generateSpeakersBlock() {
    return (
      '<div class="studio-prompt-card">\n' +
      '  <span class="edv-speaker-chip speaker-a">👤 Speaker A</span>\n' +
      '  <div style="font-weight:600; margin-bottom: 0.35rem;">What is one belief you held five years ago that you have now completely abandoned?</div>\n' +
      '  <span class="edv-starter-chip" data-copy="I used to believe that...">I used to believe that...</span>\n' +
      '  <span class="edv-starter-chip" data-copy="What shifted my thinking was...">What shifted my thinking was...</span>\n' +
      '</div>\n\n' +
      '<div class="studio-prompt-card">\n' +
      '  <span class="edv-speaker-chip speaker-b">👥 Speaker B</span>\n' +
      '  <div style="font-weight:600; margin-bottom: 0.35rem;">How easy is it for you to admit when you were mistaken in a debate?</div>\n' +
      '  <span class="edv-starter-chip" data-copy="To be quite honest with you...">To be quite honest with you...</span>\n' +
      '  <span class="edv-starter-chip" data-copy="It depends primarily on...">It depends primarily on...</span>\n' +
      '</div>'
    );
  }

  function generateStartersBlock() {
    return (
      '<div style="margin: 0.8rem 0;">\n' +
      '  <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--st-ink-muted); margin-bottom:4px; font-weight:700;">Click to copy sentence starter:</div>\n' +
      '  <div style="display:flex; flex-wrap:wrap; gap:6px;">\n' +
      '    <span class="edv-starter-chip" data-copy="In all honesty,...">In all honesty,...</span>\n' +
      '    <span class="edv-starter-chip" data-copy="If you look at the evidence,...">If you look at the evidence,...</span>\n' +
      '    <span class="edv-starter-chip" data-copy="I would nuance that by adding...">I would nuance that by adding...</span>\n' +
      '    <span class="edv-starter-chip" data-copy="That raises an interesting question...">That raises an interesting question...</span>\n' +
      '  </div>\n' +
      '</div>'
    );
  }

  function generatePollBlock(question, optA, optB) {
    var q = question || 'Which learning format produces faster fluency?';
    var a = optA || 'Daily 15-minute micro-sessions';
    var b = optB || 'Weekly 2-hour immersive deep-dives';
    return (
      '<div class="edv-poll-card" data-poll-id="poll-' + Date.now() + '">\n' +
      '  <div class="edv-poll-header">\n' +
      '    <span class="edv-poll-badge">📊 Flash Poll</span>\n' +
      '    <span class="edv-poll-title">' + escapeHtml(q) + '</span>\n' +
      '  </div>\n' +
      '  <div class="edv-poll-options">\n' +
      '    <button type="button" class="edv-poll-btn" data-choice="a">\n' +
      '      <span class="edv-poll-btn-label">A: ' + escapeHtml(a) + '</span>\n' +
      '      <span class="edv-poll-bar" style="width: 50%;"></span>\n' +
      '    </button>\n' +
      '    <button type="button" class="edv-poll-btn" data-choice="b">\n' +
      '      <span class="edv-poll-btn-label">B: ' + escapeHtml(b) + '</span>\n' +
      '      <span class="edv-poll-bar" style="width: 50%;"></span>\n' +
      '    </button>\n' +
      '  </div>\n' +
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
        '<div style="display: flex; align-items: center; gap: 6px;">' +
        '  <button type="button" class="btn-vocab-tts btn-listen-vocab" data-word="' + escapeHtml(v.word) + '" title="Listen to pronunciation">🔊 Listen</button>' +
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

    var ttsButtons = container.querySelectorAll('.btn-listen-vocab');
    ttsButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var term = btn.getAttribute('data-word');
        var lang = state.session.language || 'English';
        speakVocabWord(term, lang);
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
  var presenterTimerInterval = null;
  var presenterSecondsRemaining = 300; // 5 mins
  var isPresenterTimerRunning = false;

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
    if (presenterTimerInterval) {
      clearInterval(presenterTimerInterval);
      presenterTimerInterval = null;
      isPresenterTimerRunning = false;
    }
  }

  function togglePresenterTimer() {
    var digits = $('presenter-timer-digits');
    var toggleBtn = $('btn-presenter-timer-toggle');
    if (isPresenterTimerRunning) {
      clearInterval(presenterTimerInterval);
      presenterTimerInterval = null;
      isPresenterTimerRunning = false;
      if (toggleBtn) toggleBtn.textContent = '▶';
    } else {
      isPresenterTimerRunning = true;
      if (toggleBtn) toggleBtn.textContent = '⏸';
      presenterTimerInterval = setInterval(function () {
        if (presenterSecondsRemaining > 0) {
          presenterSecondsRemaining--;
          var m = Math.floor(presenterSecondsRemaining / 60);
          var s = presenterSecondsRemaining % 60;
          if (digits) {
            digits.textContent = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
          }
        } else {
          clearInterval(presenterTimerInterval);
          presenterTimerInterval = null;
          isPresenterTimerRunning = false;
          if (toggleBtn) toggleBtn.textContent = '▶';
        }
      }, 1000);
    }
  }

  function togglePresenterFullscreen() {
    var modal = $('presenter-modal');
    if (!modal) return;
    if (!document.fullscreenElement) {
      if (modal.requestFullscreen) {
        modal.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
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

  // Detect and synchronize user role from the verified CosyAuth session
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

    // No browser-stored role: localStorage can be written by anyone, so only the
    // verified CosyAuth session may grant founder access.

    // Fallback to guest
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

    if ($('btn-insert-timer')) {
      $('btn-insert-timer').addEventListener('click', function () {
        var mins = prompt('Enter timer duration in minutes (e.g. 3, 5, 10):', '5');
        var parsed = parseInt(mins, 10) || 5;
        appendBlockToActiveCard(generateTimerBlock(parsed));
      });
    }

    if ($('btn-insert-speakers')) {
      $('btn-insert-speakers').addEventListener('click', function () {
        appendBlockToActiveCard(generateSpeakersBlock());
      });
    }

    if ($('btn-insert-starters')) {
      $('btn-insert-starters').addEventListener('click', function () {
        appendBlockToActiveCard(generateStartersBlock());
      });
    }

    if ($('btn-insert-poll')) {
      $('btn-insert-poll').addEventListener('click', function () {
        var q = prompt('Enter flash poll question:', 'Which learning format produces faster fluency?');
        if (!q) return;
        var a = prompt('Option A:', 'Daily 15-minute micro-sessions') || 'Option A';
        var b = prompt('Option B:', 'Weekly 2-hour immersive deep-dives') || 'Option B';
        appendBlockToActiveCard(generatePollBlock(q, a, b));
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

    // Presets Dropdown Menu handling
    var presetsBtn = $('btn-presets-menu');
    var presetsPanel = $('presets-menu-panel');
    if (presetsBtn && presetsPanel) {
      presetsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isHidden = presetsPanel.hasAttribute('hidden');
        if (isHidden) {
          presetsPanel.removeAttribute('hidden');
          presetsBtn.setAttribute('aria-expanded', 'true');
        } else {
          presetsPanel.setAttribute('hidden', '');
          presetsBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('click', function (e) {
        if (!presetsBtn.contains(e.target) && !presetsPanel.contains(e.target)) {
          presetsPanel.setAttribute('hidden', '');
          presetsBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    function applyPreset(presetFn, name) {
      if (!state.isFounder) { alertFounderRequired(); return; }
      if (confirm('Load ' + name + ' preset? Any unsaved edits will be replaced.')) {
        state.session = presetFn();
        state.activeCardIndex = 0;
        state.filterPage = 'all';
        syncFormFromState();
        if (presetsPanel) presetsPanel.setAttribute('hidden', '');
      }
    }

    if ($('btn-preset-standard-5')) {
      $('btn-preset-standard-5').addEventListener('click', function () {
        applyPreset(createStandardFiveStageSession, '5-Stage Speaking Club');
      });
    }

    if ($('btn-preset-science')) {
      $('btn-preset-science').addEventListener('click', function () {
        applyPreset(createScienceClubSession, 'Keeping Up with Science');
      });
    }

    if ($('btn-preset-wonder')) {
      $('btn-preset-wonder').addEventListener('click', function () {
        applyPreset(createWonderClubSession, "I Couldn't Help But Wonder");
      });
    }

    if ($('btn-preset-cinema')) {
      $('btn-preset-cinema').addEventListener('click', function () {
        applyPreset(createCinemaClubSession, 'Cinema Club');
      });
    }

    if ($('btn-preset-debate')) {
      $('btn-preset-debate').addEventListener('click', function () {
        applyPreset(createDebateClubSession, 'Debate Duel');
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
    if ($('btn-presenter-timer-toggle')) {
      $('btn-presenter-timer-toggle').addEventListener('click', togglePresenterTimer);
    }
    if ($('btn-presenter-fullscreen')) {
      $('btn-presenter-fullscreen').addEventListener('click', togglePresenterFullscreen);
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
      // Escape closes presenter modal, shortcuts modal, catalog modal or auth modal
      if (e.key === 'Escape') {
        closePresenterDeck();
        var authModal = $('auth-modal');
        if (authModal) authModal.setAttribute('hidden', '');
        var shortcutsModal = $('studio-shortcuts-modal');
        if (shortcutsModal) shortcutsModal.setAttribute('hidden', '');
        var catalogModal = $('studio-catalog-modal');
        if (catalogModal) catalogModal.setAttribute('hidden', '');
        return;
      }

      // '?' key or 'Cmd+/' to toggle shortcuts modal
      if ((e.key === '?' || ((e.ctrlKey || e.metaKey) && e.key === '/')) &&
          document.activeElement &&
          ['input', 'textarea', 'select'].indexOf(document.activeElement.tagName.toLowerCase()) === -1) {
        e.preventDefault();
        var sModal = $('studio-shortcuts-modal');
        if (sModal) {
          if (sModal.hasAttribute('hidden')) sModal.removeAttribute('hidden');
          else sModal.setAttribute('hidden', '');
        }
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
        } else if (e.key.toLowerCase() === 'f') {
          e.preventDefault();
          togglePresenterFullscreen();
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          togglePresenterTimer();
        }
        return;
      }

      // Cmd+Z for Undo, Cmd+Shift+Z / Cmd+Y for Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
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

    // Shortcuts Helper Modal Handlers
    var shortcutsModal = $('studio-shortcuts-modal');
    var btnShortcutsHelper = $('btn-shortcuts-helper');
    var btnCloseShortcuts = $('btn-close-shortcuts-modal');

    if (btnShortcutsHelper && shortcutsModal) {
      btnShortcutsHelper.addEventListener('click', function () {
        if (shortcutsModal.hasAttribute('hidden')) shortcutsModal.removeAttribute('hidden');
        else shortcutsModal.setAttribute('hidden', '');
      });
    }
    if (btnCloseShortcuts && shortcutsModal) {
      btnCloseShortcuts.addEventListener('click', function () {
        shortcutsModal.setAttribute('hidden', '');
      });
    }

    // Catalog Browser Modal Handlers
    var catalogModal = $('studio-catalog-modal');
    var catalogList = $('catalog-results-list');
    var catalogSearch = $('catalog-search-input');
    var catalogClubFilter = $('catalog-club-filter');
    var catalogLevelFilter = $('catalog-level-filter');
    var catalogSessions = [];

    function openCatalogModal() {
      if (!catalogModal) return;
      catalogModal.removeAttribute('hidden');
      if (catalogSessions.length === 0) {
        fetch('data/sessions.json')
          .then(function (r) { return r.json(); })
          .then(function (data) {
            catalogSessions = Array.isArray(data) ? data : (data.sessions || []);
            renderCatalogSessions();
          })
          .catch(function () {
            // Fallback to KNOWN_SESSIONS if running in offline test environment
            catalogSessions = KNOWN_SESSIONS.map(function (s) {
              return {
                title: s.title,
                slug: s.slug,
                level: s.level,
                theme_area: s.theme,
                sub_topic: 'Speaking Club',
                club_id: 'speaking-club',
                short_summary: s.summary
              };
            });
            renderCatalogSessions();
          });
      } else {
        renderCatalogSessions();
      }
    }

    function closeCatalogModal() {
      if (catalogModal) catalogModal.setAttribute('hidden', '');
    }

    function renderCatalogSessions() {
      if (!catalogList) return;
      var q = catalogSearch ? catalogSearch.value.trim().toLowerCase() : '';
      var club = catalogClubFilter ? catalogClubFilter.value : 'all';
      var level = catalogLevelFilter ? catalogLevelFilter.value : 'all';

      var filtered = catalogSessions.filter(function (item) {
        if (level !== 'all' && (item.level || '').toUpperCase() !== level.toUpperCase()) return false;
        if (club !== 'all' && item.club_id !== club && !(item.slug || '').includes(club)) return false;
        if (q) {
          var haystack = ((item.title || '') + ' ' + (item.theme_area || '') + ' ' + (item.sub_topic || '') + ' ' + (item.short_summary || '')).toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        catalogList.innerHTML = '<p style="color:var(--st-ink-muted); font-size:0.88rem; padding: 12px;">No sessions found matching filters.</p>';
        return;
      }

      catalogList.innerHTML = '';
      filtered.slice(0, 30).forEach(function (sess) {
        var card = document.createElement('div');
        card.className = 'catalog-card-item';

        var top = document.createElement('div');
        var meta = document.createElement('div');
        meta.className = 'catalog-item-meta';
        meta.innerHTML = '<span class="status-badge" style="background:var(--st-sunken);">' + escapeHtml(sess.level || 'B1') + '</span> ' +
                         '<span style="color:var(--st-ink-muted);">' + escapeHtml(sess.theme_area || sess.sub_topic || 'Club') + '</span>';

        var title = document.createElement('div');
        title.className = 'catalog-item-title';
        title.textContent = sess.title || sess.slug;

        var desc = document.createElement('div');
        desc.className = 'catalog-item-desc';
        desc.textContent = sess.short_summary || sess.topic_detail || 'Speaking club session topic.';

        top.appendChild(meta);
        top.appendChild(title);
        top.appendChild(desc);

        var loadBtn = document.createElement('button');
        loadBtn.type = 'button';
        loadBtn.className = 'btn btn-sm btn-primary';
        loadBtn.textContent = 'Load into Studio';
        loadBtn.addEventListener('click', function () {
          if (!state.isFounder) {
            alertFounderRequired();
            return;
          }
          // Populate session template
          state.session = {
            slug: sess.slug || 'session-' + Date.now(),
            event: (sess.club_id || 'english') + '-' + (sess.level ? sess.level.toLowerCase() : 'b1'),
            title: sess.title || 'Loaded Session',
            theme: sess.theme_area || 'General',
            language: sess.language || 'English',
            level: sess.level || 'B1',
            date: new Date().toISOString().split('T')[0],
            host: 'COSY Facilitator',
            summary: sess.short_summary || 'Speaking session.',
            activities: [
              {
                type: 'icebreaker',
                title: 'Warm-up: ' + (sess.title || 'Discussion'),
                instructions: 'Greet your breakout partner and answer the opening question.',
                content: '<ol>\n  <li>What is your initial thought on ' + escapeHtml(sess.title || 'this topic') + '?</li>\n</ol>'
              },
              {
                type: 'round_1',
                title: 'Round 1: Deep Dive',
                instructions: 'In small groups, debate and analyze key perspectives.',
                content: '<ol>\n  <li>How does this relate to your daily experience?</li>\n</ol>'
              }
            ],
            vocabulary: [],
            sources: []
          };
          state.activeCardIndex = 0;
          syncFormFromState();
          closeCatalogModal();
        });

        card.appendChild(top);
        card.appendChild(loadBtn);
        catalogList.appendChild(card);
      });
    }

    if ($('btn-open-catalog')) {
      $('btn-open-catalog').addEventListener('click', openCatalogModal);
    }
    if ($('btn-close-catalog-modal')) {
      $('btn-close-catalog-modal').addEventListener('click', closeCatalogModal);
    }
    if (catalogSearch) catalogSearch.addEventListener('input', renderCatalogSessions);
    if (catalogClubFilter) catalogClubFilter.addEventListener('change', renderCatalogSessions);
    if (catalogLevelFilter) catalogLevelFilter.addEventListener('change', renderCatalogSessions);

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

  // SpeechSynthesis TTS Pronunciation helper
  function speakVocabWord(term, langName) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('SpeechSynthesis TTS is not supported in this browser environment.');
      return;
    }
    if (!term) return;
    try {
      window.speechSynthesis.cancel();
      var utterance = new SpeechSynthesisUtterance(term);
      var langCodeMap = {
        'English': 'en-US',
        'Français': 'fr-FR',
        'Italiano': 'it-IT',
        'Русский': 'ru-RU',
        'Ελληνικά': 'el-GR',
        'Español': 'es-ES',
        'Deutsch': 'de-DE'
      };
      utterance.lang = langCodeMap[langName] || 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  // Generate Markdown with YAML frontmatter from session object
  function exportToMarkdown(session) {
    var sess = session || state.session;
    var lines = [];
    lines.push('---');
    lines.push('title: "' + (sess.title || '').replace(/"/g, '\\"') + '"');
    lines.push('slug: "' + (sess.slug || '') + '"');
    lines.push('event: "' + (sess.event || '') + '"');
    lines.push('language: "' + (sess.language || 'English') + '"');
    lines.push('level: "' + (sess.level || 'A2') + '"');
    lines.push('theme: "' + (sess.theme || '') + '"');
    lines.push('date: "' + (sess.date || new Date().toISOString().split('T')[0]) + '"');
    if (sess.host) lines.push('host: "' + sess.host.replace(/"/g, '\\"') + '"');
    if (sess.recording_url) lines.push('recording_url: "' + sess.recording_url + '"');
    lines.push('---');
    lines.push('');
    lines.push('# ' + (sess.title || 'Session'));
    lines.push('');
    if (sess.summary) {
      lines.push('## Summary');
      lines.push(sess.summary);
      lines.push('');
    }

    if (sess.vocabulary && sess.vocabulary.length > 0) {
      lines.push('## Useful Vocabulary');
      sess.vocabulary.forEach(function (v) {
        lines.push('- **' + v.word + '** (' + (v.pos || '') + ', ' + (v.level || '') + '): ' + (v.definition || '') + ' _(e.g. ' + (v.example || '') + ')_');
      });
      lines.push('');
    }

    if (sess.activities && sess.activities.length > 0) {
      lines.push('## Activities & Rounds');
      sess.activities.forEach(function (act, idx) {
        lines.push('### ' + (idx + 1) + '. ' + act.title + ' [' + (act.type || 'activity').toUpperCase() + ']');
        if (act.instructions) {
          lines.push('> ' + act.instructions);
          lines.push('');
        }
        if (act.content) {
          lines.push(act.content);
          lines.push('');
        }
      });
    }
    return lines.join('\n');
  }

  // Generate printable Student Worksheet HTML
  function exportToWorksheetHtml(session) {
    var sess = session || state.session;
    var html = [];
    html.push('<!DOCTYPE html>');
    html.push('<html lang="en">');
    html.push('<head>');
    html.push('<meta charset="UTF-8">');
    html.push('<title>' + escapeHtml(sess.title || 'Session Worksheet') + ' - COSYevents Worksheet</title>');
    html.push('<style>');
    html.push('body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #1c261e; max-width: 800px; margin: 40px auto; padding: 0 20px; }');
    html.push('.header { border-bottom: 2px solid #233e28; padding-bottom: 12px; margin-bottom: 24px; }');
    html.push('.brand { font-size: 0.85rem; font-weight: 700; color: #416b49; text-transform: uppercase; letter-spacing: 0.05em; }');
    html.push('h1 { margin: 8px 0; font-size: 1.8rem; color: #233e28; }');
    html.push('.meta { font-size: 0.9rem; color: #526055; display: flex; gap: 16px; margin-top: 6px; }');
    html.push('.summary { background: #f3f5f3; border-left: 4px solid #416b49; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-style: italic; }');
    html.push('.section-title { font-size: 1.25rem; color: #233e28; border-bottom: 1px solid #d4ddd5; padding-bottom: 6px; margin: 28px 0 14px; }');
    html.push('.vocab-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }');
    html.push('.vocab-table th, .vocab-table td { border: 1px solid #d4ddd5; padding: 8px 12px; text-align: left; font-size: 0.9rem; }');
    html.push('.vocab-table th { background: #f3f5f3; }');
    html.push('.card-box { border: 1px solid #d4ddd5; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; page-break-inside: avoid; }');
    html.push('.card-type { font-size: 0.75rem; font-weight: 700; color: #416b49; text-transform: uppercase; }');
    html.push('.card-inst { font-size: 0.88rem; color: #526055; margin: 6px 0 12px; }');
    html.push('@media print { body { margin: 0; padding: 0; } .card-box { border: 1px solid #bbb; } }');
    html.push('</style>');
    html.push('</head>');
    html.push('<body>');
    html.push('<div class="header">');
    html.push('  <div class="brand">🎭 COSYevents Speaking Club Worksheet</div>');
    html.push('  <h1>' + escapeHtml(sess.title || 'Untitled Session') + '</h1>');
    html.push('  <div class="meta">');
    html.push('    <span><strong>Language:</strong> ' + escapeHtml(sess.language || 'English') + '</span>');
    html.push('    <span><strong>Level:</strong> ' + escapeHtml(sess.level || 'A2') + '</span>');
    html.push('    <span><strong>Theme:</strong> ' + escapeHtml(sess.theme || '') + '</span>');
    if (sess.date) html.push('    <span><strong>Date:</strong> ' + escapeHtml(sess.date) + '</span>');
    html.push('  </div>');
    html.push('</div>');

    if (sess.summary) {
      html.push('<div class="summary">' + escapeHtml(sess.summary) + '</div>');
    }

    if (sess.vocabulary && sess.vocabulary.length > 0) {
      html.push('<h2 class="section-title">Useful Vocabulary</h2>');
      html.push('<table class="vocab-table">');
      html.push('  <thead><tr><th>Term</th><th>Level</th><th>Definition</th><th>Example Context</th></tr></thead>');
      html.push('  <tbody>');
      sess.vocabulary.forEach(function (v) {
        html.push('    <tr>');
        html.push('      <td><strong>' + escapeHtml(v.word) + '</strong> (' + escapeHtml(v.pos || '') + ')</td>');
        html.push('      <td>' + escapeHtml(v.level || '') + '</td>');
        html.push('      <td>' + escapeHtml(v.definition || '') + '</td>');
        html.push('      <td><em>' + escapeHtml(v.example || '') + '</em></td>');
        html.push('    </tr>');
      });
      html.push('  </tbody>');
      html.push('</table>');
    }

    if (sess.activities && sess.activities.length > 0) {
      html.push('<h2 class="section-title">Activities &amp; Breakout Prompts</h2>');
      sess.activities.forEach(function (act, idx) {
        html.push('<div class="card-box">');
        html.push('  <span class="card-type">Part ' + (idx + 1) + ': ' + escapeHtml(act.type || 'Activity') + '</span>');
        html.push('  <h3 style="margin: 4px 0 8px;">' + escapeHtml(act.title) + '</h3>');
        if (act.instructions) {
          html.push('  <div class="card-inst">' + escapeHtml(act.instructions) + '</div>');
        }
        if (act.content) {
          html.push('  <div class="card-body">' + act.content + '</div>');
        }
        html.push('</div>');
      });
    }

    html.push('</body>');
    html.push('</html>');
    return html.join('\n');
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

    // Export: Markdown (.md)
    if ($('btn-export-markdown')) {
      $('btn-export-markdown').addEventListener('click', function () {
        var mdStr = exportToMarkdown(state.session);
        var blob = new Blob([mdStr], { type: 'text/markdown;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (state.session.slug || 'session') + '.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (exportPanel) exportPanel.setAttribute('hidden', '');
      });
    }

    // Export: Printable Student Worksheet HTML
    if ($('btn-export-worksheet')) {
      $('btn-export-worksheet').addEventListener('click', function () {
        var sheetHtml = exportToWorksheetHtml(state.session);
        var blob = new Blob([sheetHtml], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (state.session.slug || 'session') + '-worksheet.html';
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
        openPublishDialog();
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
            }).catch(function () {
              statusMsg.textContent = 'Could not send the login code. Check the address and try again.';
              statusMsg.style.color = 'var(--st-err-ink, #b42318)';
            });
          } else {
            statusMsg.textContent = 'Sign-in is unavailable right now. Reload the page and try again.';
            statusMsg.style.color = 'var(--st-err-ink, #b42318)';
          }
        } else {
          // Verify code
          var codeInput = $('input-auth-code');
          var code = codeInput ? codeInput.value.trim() : '';
          var codeStatus = $('auth-status-msg');
          if (window.CosyAuth && typeof window.CosyAuth.verifyCode === 'function') {
            window.CosyAuth.verifyCode(state.authEmail, code).then(function () {
              // The role is whatever the server says it is, never assumed here.
              // The account role loads just after the code is accepted; the
              // CosyAuth.onChange listener (see init) unlocks the studio, or
              // reports a non-founder account, once it arrives.
              if (codeStatus) {
                codeStatus.textContent = 'Code accepted. Checking your account…';
                codeStatus.style.color = 'var(--st-accent)';
              }
              checkAuthRole();
            }).catch(function () {
              if (codeStatus) {
                codeStatus.textContent = 'That code did not work. Check it and try again.';
                codeStatus.style.color = 'var(--st-err-ink, #b42318)';
              }
            });
          } else if (codeStatus) {
            codeStatus.textContent = 'Sign-in is unavailable right now. Reload the page and try again.';
            codeStatus.style.color = 'var(--st-err-ink, #b42318)';
          }
        }
      });
    }
  }

  // Initialize studio
  function onAuthChanged() {
    var wasFounder = state.isFounder;
    checkAuthRole();
    var modal = $('auth-modal');
    var msg = $('auth-status-msg');
    if (state.isFounder) {
      if (modal) modal.setAttribute('hidden', '');
    } else if (modal && !modal.hasAttribute('hidden') && state.authStep === 'code' &&
               window.CosyAuth && typeof window.CosyAuth.role === 'function' && window.CosyAuth.role() && msg) {
      msg.textContent = 'You are signed in, but this account is not a founder account.';
      msg.style.color = 'var(--st-err-ink, #b42318)';
    }
    return wasFounder;
  }

  function init() {
    bindEvents();
    bindPublishDialog();
    checkAuthRole();
    if (typeof window !== 'undefined' && window.CosyAuth && typeof window.CosyAuth.onChange === 'function') {
      window.CosyAuth.onChange(onAuthChanged);
    }
    loadDraftFromStorage();
    pushHistory();
    syncFormFromState();

    if (typeof window !== 'undefined') {
      window.addEventListener('cosy:auth', function () {
        checkAuthRole();
      });
    }
  }


  // ---- Repository publishing -------------------------------------------
  // The public session renderer shows text only (textContent), and every
  // committed file is public. So publishing converts the studio's rich HTML to
  // plain lines, keeps only schema fields, and reports anything that blocks it.

  var CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  var SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  var VOCAB_ID_RE = /^[a-z]{2}:[a-z0-9-]+:[a-z0-9-]+$/;

  function decodeEntities(text) {
    return String(text)
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, '&');
  }

  function httpsUrlsIn(html) {
    var urls = [];
    var re = /\b(?:href|src)\s*=\s*"(https:\/\/[^"\s]+)"/gi;
    var m;
    while ((m = re.exec(html)) !== null) {
      var u = decodeEntities(m[1]);
      if (urls.indexOf(u) === -1) urls.push(u);
    }
    return urls;
  }

  /**
   * Studio HTML -> plain text lines. Block elements and list items become
   * lines, every other tag is dropped, and https media/link URLs are kept as
   * "Link: <url>" lines because the public page cannot embed them.
   */
  function htmlToPlainText(html) {
    if (typeof html !== 'string' || !html.trim()) return '';
    var urls = httpsUrlsIn(html);
    var text = html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|ol|ul|h[1-6]|tr|section|article|blockquote)>/gi, '\n')
      .replace(/<(li|p|div|h[1-6]|tr|section|article|blockquote)(\s[^>]*)?>/gi, '\n')
      .replace(/<[^>]*>/g, '');
    var lines = decodeEntities(text)
      .split('\n')
      .map(function (l) { return l.replace(/\s+/g, ' ').trim(); })
      .filter(Boolean);
    urls.forEach(function (u) { lines.push('Link: ' + u); });
    return lines.join('\n');
  }

  function cleanHttpsUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      var u = new URL(value.trim());
      return u.protocol === 'https:' ? u.href : null;
    } catch (e) { return null; }
  }

  /**
   * Problems that block publishing. Returns [{ level: 'error'|'warn', field, message }].
   * Errors must be fixed; warnings are shown but do not block.
   */
  function validateForPublish(session) {
    var out = [];
    var err = function (field, message) { out.push({ level: 'error', field: field, message: message }); };
    var warn = function (field, message) { out.push({ level: 'warn', field: field, message: message }); };
    if (!session || typeof session !== 'object') { err('session', 'There is no session to publish.'); return out; }

    if (!SLUG_RE.test(String(session.slug || ''))) err('slug', 'Slug must be lowercase letters, numbers and single hyphens.');
    if (!SLUG_RE.test(String(session.event || ''))) err('event', 'Choose the event this session belongs to.');
    if (!String(session.title || '').trim()) err('title', 'Add a title.');
    if (!String(session.summary || '').trim()) err('summary', 'Add a short summary.');
    if (!String(session.host || '').trim()) err('host', 'Add a host.');
    if (!String(session.theme || '').trim()) err('theme', 'Add a theme.');
    if (!String(session.language || '').trim()) err('language', 'Add a language.');
    if (CEFR_LEVELS.indexOf(String(session.level || '').toUpperCase()) === -1) err('level', 'Level must be one of A1, A2, B1, B2, C1, C2.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(session.date || '')) || isNaN(Date.parse(session.date))) err('date', 'Pick a valid date.');

    var acts = Array.isArray(session.activities) ? session.activities : [];
    if (!acts.length) err('activities', 'Add at least one activity.');
    acts.forEach(function (a, i) {
      var n = i + 1;
      if (!a || !String(a.title || '').trim()) err('activities', 'Activity ' + n + ' needs a title.');
      if (a && !htmlToPlainText(a.content || '') && !String(a.instructions || '').trim()) {
        err('activities', 'Activity ' + n + ' has no content.');
      }
      if (a && /<(iframe|audio|video)\b/i.test(a.content || '')) {
        warn('activities', 'Activity ' + n + ' has embedded media. The public page shows it as a link, not a player.');
      }
    });

    var vocab = Array.isArray(session.vocabulary) ? session.vocabulary : [];
    vocab.forEach(function (v, i) {
      if (!v || !String(v.word || '').trim()) err('vocabulary', 'Vocabulary item ' + (i + 1) + ' needs a word.');
      else if (!String(v.example || '').trim()) err('vocabulary', 'Vocabulary item "' + v.word + '" needs an example sentence.');
    });
    if (!vocab.length) warn('vocabulary', 'No vocabulary yet.');

    if (/soundhelix\.com|dQw4w9WgXcQ/i.test(JSON.stringify(session))) {
      warn('content', 'Contains demo media from a template (SoundHelix audio or the placeholder video). Replace it before publishing.');
    }
    var tagged = JSON.stringify(session).match(/(secret|gated|facilitator[- ]only|do not publish)/i);
    if (tagged) warn('content', 'The text mentions "' + tagged[0] + '". Everything published is public. Check nothing private is included.');
    return out;
  }

  /**
   * The repository form of a studio session: exactly the schema's fields,
   * plain-text activity content, valid vocabulary ids, https-only URLs.
   * Call validateForPublish first; this assumes the session passes.
   */
  function toRepositorySession(session) {
    var s = session || {};
    var level = String(s.level || '').toUpperCase();
    var lang = String(s.language || 'English');
    var out = {
      slug: String(s.slug || ''),
      event: String(s.event || ''),
      title: String(s.title || '').trim(),
      theme: String(s.theme || '').trim(),
      language: lang,
      level: level,
      date: String(s.date || ''),
      host: String(s.host || '').trim(),
      summary: String(s.summary || '').trim(),
      activities: (s.activities || []).map(function (a, i) {
        return {
          type: String(a.type || 'activity'),
          title: String(a.title || 'Activity ' + (i + 1)).trim(),
          instructions: String(a.instructions || '').trim(),
          content: htmlToPlainText(a.content || '')
        };
      }),
      vocabulary: (s.vocabulary || []).map(function (v) {
        var vl = String(v.level || level).toUpperCase();
        var item = {
          word: String(v.word || '').trim(),
          example: String(v.example || '').trim(),
          level: CEFR_LEVELS.indexOf(vl) === -1 ? level : vl
        };
        if (typeof v.id === 'string' && VOCAB_ID_RE.test(v.id)) item.id = v.id;
        ['pos', 'definition', 'translation', 'primary_theme', 'sub_theme'].forEach(function (k) {
          if (typeof v[k] === 'string' && v[k].trim()) item[k] = v[k].trim();
        });
        return item;
      })
    };
    if (typeof s.full_notes === 'string' && s.full_notes.trim()) out.full_notes = s.full_notes;
    var rec = cleanHttpsUrl(s.recording_url);
    if (rec) out.recording_url = rec;
    var sources = (Array.isArray(s.sources) ? s.sources : []).map(function (src) {
      var url = cleanHttpsUrl(src && (src.source_url || src.url));
      return url ? { source_title: String((src.source_title || src.title || url)), source_url: url } : null;
    }).filter(Boolean);
    if (sources.length) out.sources = sources;
    return out;
  }


  // ---- Publish dialog ----------------------------------------------------

  var WORKFLOW_INPUT_LIMIT = 60000; // GitHub caps a workflow input at about 65,000 characters

  function currentSessionJson() {
    return JSON.stringify(state.session, null, 2);
  }

  function setPublishStatus(text, isError) {
    var el = $('publish-status');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = isError ? 'var(--st-err-ink, #b42318)' : 'var(--st-ok-ink)';
  }

  function copyText(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function downloadSessionJson() {
    var blob = new Blob([currentSessionJson()], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (state.session.slug || 'session') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function renderPublishChecks(problems) {
    var list = $('publish-checks');
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    if (!problems.length) {
      var ok = document.createElement('li');
      ok.textContent = '✓ Ready to publish. No problems found.';
      ok.style.color = 'var(--st-ok-ink)';
      list.appendChild(ok);
      return;
    }
    problems.forEach(function (p) {
      var li = document.createElement('li');
      li.textContent = (p.level === 'error' ? '✕ ' : '! ') + p.message;
      li.style.color = p.level === 'error' ? 'var(--st-err-ink, #b42318)' : 'var(--st-warn-ink)';
      li.style.marginBottom = '4px';
      list.appendChild(li);
    });
  }

  function updatePublishCli() {
    var club = ($('input-publish-club') && $('input-publish-club').value.trim()) || '<club>';
    var cli = $('publish-cli');
    if (cli) cli.textContent = 'npm run session:publish -- ' + (state.session.slug || 'session') + '.json --club ' + club;
  }

  function openPublishDialog() {
    var modal = $('publish-modal');
    if (!modal) return;
    var problems = validateForPublish(state.session);
    var blocked = problems.some(function (p) { return p.level === 'error'; });
    renderPublishChecks(problems);
    setPublishStatus('');

    var steps = $('publish-steps');
    if (steps) { if (blocked) steps.setAttribute('hidden', ''); else steps.removeAttribute('hidden'); }
    var copyBtn = $('btn-publish-copy');
    var dlBtn = $('btn-publish-download');
    if (copyBtn) copyBtn.disabled = blocked;
    if (dlBtn) dlBtn.disabled = blocked;

    var note = $('publish-size-note');
    if (note) {
      var tooBig = !blocked && currentSessionJson().length > WORKFLOW_INPUT_LIMIT;
      note.textContent = tooBig
        ? 'This session is too large to paste into GitHub. Download the JSON and use the terminal command instead.'
        : '';
      if (tooBig) note.removeAttribute('hidden'); else note.setAttribute('hidden', '');
      if (copyBtn && tooBig) copyBtn.disabled = true;
    }
    updatePublishCli();
    modal.removeAttribute('hidden');
  }

  function closePublishDialog() {
    var modal = $('publish-modal');
    if (modal) modal.setAttribute('hidden', '');
  }

  function bindPublishDialog() {
    if ($('btn-close-publish-modal')) $('btn-close-publish-modal').addEventListener('click', closePublishDialog);
    if ($('publish-modal')) {
      $('publish-modal').addEventListener('click', function (e) { if (e.target === $('publish-modal')) closePublishDialog(); });
    }
    if ($('input-publish-club')) $('input-publish-club').addEventListener('input', updatePublishCli);
    if ($('btn-publish-download')) $('btn-publish-download').addEventListener('click', function () {
      if (!state.isFounder) { alertFounderRequired(); return; }
      downloadSessionJson();
      setPublishStatus('Downloaded ' + (state.session.slug || 'session') + '.json');
    });
    if ($('btn-publish-copy')) $('btn-publish-copy').addEventListener('click', function () {
      if (!state.isFounder) { alertFounderRequired(); return; }
      copyText(currentSessionJson()).then(function () {
        setPublishStatus('Copied. Paste it into the GitHub workflow.');
      }).catch(function () {
        setPublishStatus('Could not copy. Use Download JSON instead.', true);
      });
    });
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
    htmlToPlainText: htmlToPlainText,
    validateForPublish: validateForPublish,
    toRepositorySession: toRepositorySession,
    createDefaultSession: createDefaultSession,
    createStandardFiveStageSession: createStandardFiveStageSession,
    createScienceClubSession: createScienceClubSession,
    createWonderClubSession: createWonderClubSession,
    createCinemaClubSession: createCinemaClubSession,
    createDebateClubSession: createDebateClubSession,
    generateVideoBlock: generateVideoBlock,
    generateAudioBlock: generateAudioBlock,
    generateTimerBlock: generateTimerBlock,
    generateSpeakersBlock: generateSpeakersBlock,
    generateStartersBlock: generateStartersBlock,
    generatePollBlock: generatePollBlock,
    generateLinkBlock: generateLinkBlock,
    generateQuestionsBlock: generateQuestionsBlock,
    generateCalloutBlock: generateCalloutBlock,
    exportToMarkdown: function (sess) {
      var s = sess || state.session;
      var lines = [];
      lines.push('---');
      lines.push('title: "' + (s.title || '').replace(/"/g, '\\"') + '"');
      lines.push('slug: "' + (s.slug || '') + '"');
      lines.push('event: "' + (s.event || '') + '"');
      lines.push('language: "' + (s.language || 'English') + '"');
      lines.push('level: "' + (s.level || 'A2') + '"');
      lines.push('theme: "' + (s.theme || '') + '"');
      lines.push('date: "' + (s.date || new Date().toISOString().split('T')[0]) + '"');
      if (s.host) lines.push('host: "' + s.host.replace(/"/g, '\\"') + '"');
      if (s.recording_url) lines.push('recording_url: "' + s.recording_url + '"');
      lines.push('---');
      lines.push('');
      lines.push('# ' + (s.title || 'Session'));
      lines.push('');
      if (s.summary) {
        lines.push('## Summary');
        lines.push(s.summary);
        lines.push('');
      }
      if (s.vocabulary && s.vocabulary.length > 0) {
        lines.push('## Useful Vocabulary');
        s.vocabulary.forEach(function (v) {
          lines.push('- **' + v.word + '** (' + (v.pos || '') + ', ' + (v.level || '') + '): ' + (v.definition || '') + ' _(e.g. ' + (v.example || '') + ')_');
        });
        lines.push('');
      }
      if (s.activities && s.activities.length > 0) {
        lines.push('## Activities & Rounds');
        s.activities.forEach(function (act, idx) {
          lines.push('### ' + (idx + 1) + '. ' + act.title + ' [' + (act.type || 'activity').toUpperCase() + ']');
          if (act.instructions) {
            lines.push('> ' + act.instructions);
            lines.push('');
          }
          if (act.content) {
            lines.push(act.content);
            lines.push('');
          }
        });
      }
      return lines.join('\n');
    },
    exportToWorksheetHtml: function (sess) {
      var s = sess || state.session;
      var html = [];
      html.push('<!DOCTYPE html>');
      html.push('<html lang="en">');
      html.push('<head>');
      html.push('<meta charset="UTF-8">');
      html.push('<title>' + escapeHtml(s.title || 'Session Worksheet') + ' - COSYevents Worksheet</title>');
      html.push('<style>');
      html.push('body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #1c261e; max-width: 800px; margin: 40px auto; padding: 0 20px; }');
      html.push('.header { border-bottom: 2px solid #233e28; padding-bottom: 12px; margin-bottom: 24px; }');
      html.push('.brand { font-size: 0.85rem; font-weight: 700; color: #416b49; text-transform: uppercase; letter-spacing: 0.05em; }');
      html.push('h1 { margin: 8px 0; font-size: 1.8rem; color: #233e28; }');
      html.push('.meta { font-size: 0.9rem; color: #526055; display: flex; gap: 16px; margin-top: 6px; }');
      html.push('.summary { background: #f3f5f3; border-left: 4px solid #416b49; padding: 12px 16px; border-radius: 4px; margin: 20px 0; font-style: italic; }');
      html.push('.section-title { font-size: 1.25rem; color: #233e28; border-bottom: 1px solid #d4ddd5; padding-bottom: 6px; margin: 28px 0 14px; }');
      html.push('.vocab-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }');
      html.push('.vocab-table th, .vocab-table td { border: 1px solid #d4ddd5; padding: 8px 12px; text-align: left; font-size: 0.9rem; }');
      html.push('.vocab-table th { background: #f3f5f3; }');
      html.push('.card-box { border: 1px solid #d4ddd5; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; page-break-inside: avoid; }');
      html.push('.card-type { font-size: 0.75rem; font-weight: 700; color: #416b49; text-transform: uppercase; }');
      html.push('.card-inst { font-size: 0.88rem; color: #526055; margin: 6px 0 12px; }');
      html.push('@media print { body { margin: 0; padding: 0; } .card-box { border: 1px solid #bbb; } }');
      html.push('</style>');
      html.push('</head>');
      html.push('<body>');
      html.push('<div class="header">');
      html.push('  <div class="brand">🎭 COSYevents Speaking Club Worksheet</div>');
      html.push('  <h1>' + escapeHtml(s.title || 'Untitled Session') + '</h1>');
      html.push('  <div class="meta">');
      html.push('    <span><strong>Language:</strong> ' + escapeHtml(s.language || 'English') + '</span>');
      html.push('    <span><strong>Level:</strong> ' + escapeHtml(s.level || 'A2') + '</span>');
      html.push('    <span><strong>Theme:</strong> ' + escapeHtml(s.theme || '') + '</span>');
      if (s.date) html.push('    <span><strong>Date:</strong> ' + escapeHtml(s.date) + '</span>');
      html.push('  </div>');
      html.push('</div>');
      if (s.summary) {
        html.push('<div class="summary">' + escapeHtml(s.summary) + '</div>');
      }
      if (s.vocabulary && s.vocabulary.length > 0) {
        html.push('<h2 class="section-title">Useful Vocabulary</h2>');
        html.push('<table class="vocab-table">');
        html.push('  <thead><tr><th>Term</th><th>Level</th><th>Definition</th><th>Example Context</th></tr></thead>');
        html.push('  <tbody>');
        s.vocabulary.forEach(function (v) {
          html.push('    <tr>');
          html.push('      <td><strong>' + escapeHtml(v.word) + '</strong> (' + escapeHtml(v.pos || '') + ')</td>');
          html.push('      <td>' + escapeHtml(v.level || '') + '</td>');
          html.push('      <td>' + escapeHtml(v.definition || '') + '</td>');
          html.push('      <td><em>' + escapeHtml(v.example || '') + '</em></td>');
          html.push('    </tr>');
        });
        html.push('  </tbody>');
        html.push('</table>');
      }
      if (s.activities && s.activities.length > 0) {
        html.push('<h2 class="section-title">Activities &amp; Breakout Prompts</h2>');
        s.activities.forEach(function (act, idx) {
          html.push('<div class="card-box">');
          html.push('  <span class="card-type">Part ' + (idx + 1) + ': ' + escapeHtml(act.type || 'Activity') + '</span>');
          html.push('  <h3 style="margin: 4px 0 8px;">' + escapeHtml(act.title) + '</h3>');
          if (act.instructions) {
            html.push('  <div class="card-inst">' + escapeHtml(act.instructions) + '</div>');
          }
          if (act.content) {
            html.push('  <div class="card-body">' + act.content + '</div>');
          }
          html.push('</div>');
        });
      }
      html.push('</body>');
      html.push('</html>');
      return html.join('\n');
    },
    speakVocabWord: function (term, langName) {
      if (typeof window === 'undefined' || !window.speechSynthesis) return null;
      if (!term) return null;
      try {
        window.speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(term);
        var langCodeMap = {
          'English': 'en-US',
          'Français': 'fr-FR',
          'Italiano': 'it-IT',
          'Русский': 'ru-RU',
          'Ελληνικά': 'el-GR',
          'Español': 'es-ES',
          'Deutsch': 'de-DE'
        };
        utterance.lang = langCodeMap[langName] || 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return utterance;
      } catch (e) {
        return null;
      }
    },
    KNOWN_SESSIONS: KNOWN_SESSIONS,
    getState: function () { return state; },
    init: init,
    syncFormFromState: syncFormFromState,
    applyRolePermissions: applyRolePermissions,
    openPresenterDeck: openPresenterDeck,
    closePresenterDeck: closePresenterDeck
  };
});
