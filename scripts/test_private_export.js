const assert = require('node:assert/strict');
const { extractSession } = require('./export_private_sessions');
const catalog = require('../data/sessions.json');

const byHref = new Map(catalog.map(entry => [entry.href, entry]));
const sampleHrefs = {
  cinema: 'sessions/cinema-club/101-and-102-dalmatians.html',
  speaking: 'sessions/debatable-relatable/ai-and-art.html',
  longRead: 'sessions/long-reads/changing-our-brains.html',
  karaoke: 'sessions/karaoke-club/challenges/abba-challenge/index.html',
  emptyLegacy: 'sessions/lets-celebrate/italian-gastronomy.html'
};

function getPayload(href) {
  const entry = byHref.get(href);
  assert.ok(entry, `Missing catalog entry: ${href}`);
  return extractSession(entry);
}

assert.equal(catalog.length, 645);
const sessionIds = new Set();
let sourceCount = 0;
let unknownLevelCount = 0;
let emptyDiscussionCount = 0;

for (const entry of catalog) {
  const payload = extractSession(entry);
  assert.ok(!sessionIds.has(payload.session_id), `Duplicate session ID: ${payload.session_id}`);
  sessionIds.add(payload.session_id);
  assert.equal(payload.review_status, 'needs_review');
  assert.equal(payload.public.is_published, false);
  assert.ok(Array.isArray(payload.public.source_bibliography));
  assert.ok(Array.isArray(payload.content.vocabulary));
  assert.ok(Array.isArray(payload.content.rounds));
  assert.ok(Array.isArray(payload.content.discussion));
  assert.ok(Array.isArray(payload.content.sources));
  assert.ok(!payload.public.source_bibliography.some(source => /https?:\/\//i.test(source.citation)));
  assert.ok(payload.content.sources.every(source => /^https:\/\//i.test(source.source_url)));
  assert.ok(payload.content.discussion.every(prompt => prompt.prompt.trim().length > 0));
  sourceCount += payload.content.sources.length;
  if (!payload.public.level) unknownLevelCount++;
  if (payload.content.discussion.length === 0) emptyDiscussionCount++;
}

for (const href of Object.values(sampleHrefs).slice(0, 4)) {
  const payload = getPayload(href);
  assert.ok(payload.content.vocabulary.length > 0, `Expected vocabulary in ${href}`);
  assert.ok(payload.content.discussion.length > 0, `Expected discussion prompts in ${href}`);
}

const karaoke = getPayload(sampleHrefs.karaoke);
assert.ok(karaoke.content.vocabulary.some(item => item.opposite), 'Karaoke opposites were not extracted.');
assert.ok(karaoke.content.discussion.some(item => item.prompt.includes('Before Listening')));
assert.ok(karaoke.content.discussion.some(item => item.prompt.includes('Internal Conversation')));

const emptyLegacy = getPayload(sampleHrefs.emptyLegacy);
assert.equal(emptyLegacy.content.vocabulary.length, 0);
assert.equal(emptyLegacy.content.discussion.length, 0);
assert.ok(emptyLegacy.review_notes.some(note => note.includes('No vocabulary')));
assert.ok(emptyLegacy.review_notes.some(note => note.includes('No discussion rounds')));

console.log(JSON.stringify({
  sessions: catalog.length,
  uniqueSessionIds: sessionIds.size,
  privateSourceLinks: sourceCount,
  unknownLevels: unknownLevelCount,
  emptyDiscussions: emptyDiscussionCount,
  karaokeAntonyms: karaoke.content.vocabulary.filter(item => item.opposite).length,
  karaokeDiscussionPrompts: karaoke.content.discussion.length,
  publicBibliographyHasNoUrls: true,
  allSessionsRequireReview: true
}, null, 2));
