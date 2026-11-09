/**
 * Automated test suite for SessionDirectory filtering logic:
 * - Level filtering (A0-A1, A2, B1, B2, C1-C2, Unspecified)
 * - Event type menu filtering: Speaking Clubs, Cinema, Karaoke, Long Reads, Games
 * - Speaking club sub-selector filtering
 * - Combined filters
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const sessions = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sessions.json'), 'utf8'));

console.log('Testing session directory filter logic...');
console.log('Total catalog entries:', sessions.length);

function filterSessions(data, { searchQuery = '', selectedLang = 'ALL', selectedType = 'ALL', selectedSpeakingClub = 'ALL', selectedLevel = null, wishlistOnly = false, savedHrefs = new Set() } = {}) {
  return data.filter(session => {
    if (wishlistOnly && !savedHrefs.has(session.href)) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = session.title && session.title.toLowerCase().includes(q);
      const matchClub = session.club && session.club.toLowerCase().includes(q);
      if (!matchTitle && !matchClub) return false;
    }

    if (selectedType !== 'ALL') {
      if (session.format !== selectedType) return false;

      if (selectedType === 'Speaking Club' && selectedSpeakingClub !== 'ALL') {
        if (session.club !== selectedSpeakingClub) return false;
      }
    }

    if (selectedLang !== 'ALL') {
      if (session.lang !== selectedLang) return false;
    }

    if (selectedLevel !== null) {
      const sessionLevels = session.level
        ? String(session.level).match(/\b(A0|A1|A2|B1|B2|C1|C2)\b/g) || []
        : [];
      if (selectedLevel === 'UNSPECIFIED') {
        if (sessionLevels.length > 0) return false;
      } else if (selectedLevel === 'A0-A1') {
        if (!sessionLevels.some(l => l === 'A0' || l === 'A1')) return false;
      } else if (selectedLevel === 'C1-C2') {
        if (!sessionLevels.some(l => l === 'C1' || l === 'C2')) return false;
      } else if (Array.isArray(selectedLevel)) {
        if (!sessionLevels.some(level => selectedLevel.includes(level))) return false;
      } else {
        if (!sessionLevels.includes(selectedLevel)) return false;
      }
    }

    return true;
  });
}

// 1. Test Event Types
const allTypes = filterSessions(sessions, { selectedType: 'ALL' });
assert.strictEqual(allTypes.length, 651, 'All types should return all sessions');

const speakingClubs = filterSessions(sessions, { selectedType: 'Speaking Club' });
assert.strictEqual(speakingClubs.length, 386, 'Speaking Club count mismatch');
assert.ok(speakingClubs.every(s => s.format === 'Speaking Club'), 'Every item must be Speaking Club');

const cinema = filterSessions(sessions, { selectedType: 'Cinema Club' });
assert.strictEqual(cinema.length, 113, 'Cinema Club count mismatch');
assert.ok(cinema.every(s => s.format === 'Cinema Club'), 'Every item must be Cinema Club');

const karaoke = filterSessions(sessions, { selectedType: 'Karaoke Club' });
assert.strictEqual(karaoke.length, 142, 'Karaoke Club count mismatch');
assert.ok(karaoke.every(s => s.format === 'Karaoke Club'), 'Every item must be Karaoke Club');

const longReads = filterSessions(sessions, { selectedType: 'Long Read' });
assert.strictEqual(longReads.length, 4, 'Long Read count mismatch');
assert.ok(longReads.every(s => s.format === 'Long Read'), 'Every item must be Long Read');

const games = filterSessions(sessions, { selectedType: 'Games' });
assert.strictEqual(games.length, 6, 'Games count mismatch');
assert.ok(games.every(s => s.format === 'Games'), 'Every item must be Games');

// 2. Test Speaking Club Sub-selection
const scienceClub = filterSessions(sessions, { selectedType: 'Speaking Club', selectedSpeakingClub: 'Keeping Up with Science' });
assert.strictEqual(scienceClub.length, 59, 'Keeping Up with Science count mismatch');
assert.ok(scienceClub.every(s => s.club === 'Keeping Up with Science'), 'Every item must be Keeping Up with Science');

const wonderClub = filterSessions(sessions, { selectedType: 'Speaking Club', selectedSpeakingClub: "I Couldn't Help But Wonder" });
assert.strictEqual(wonderClub.length, 60, "I Couldn't Help But Wonder count mismatch");

// 3. Test Level Filtering
const a0a1 = filterSessions(sessions, { selectedLevel: 'A0-A1' });
assert.ok(a0a1.length > 0, 'A0-A1 should have sessions');
assert.ok(a0a1.every(s => /\b(A0|A1)\b/.test(s.level)), 'A0-A1 level regex check');

const a2 = filterSessions(sessions, { selectedLevel: 'A2' });
assert.ok(a2.length > 0, 'A2 should have sessions');
assert.ok(a2.every(s => /\bA2\b/.test(s.level)), 'A2 level regex check');

const b1 = filterSessions(sessions, { selectedLevel: 'B1' });
assert.ok(b1.length > 0, 'B1 should have sessions');
assert.ok(b1.every(s => /\bB1\b/.test(s.level)), 'B1 level regex check');

const b2 = filterSessions(sessions, { selectedLevel: 'B2' });
assert.ok(b2.length > 0, 'B2 should have sessions');
assert.ok(b2.every(s => /\bB2\b/.test(s.level)), 'B2 level regex check');

const c1c2 = filterSessions(sessions, { selectedLevel: 'C1-C2' });
assert.ok(c1c2.length > 0, 'C1-C2 should have sessions');
assert.ok(c1c2.every(s => /\b(C1|C2)\b/.test(s.level)), 'C1-C2 level regex check');

// 4. Test Combinations: Games + Level
const gamesA2 = filterSessions(sessions, { selectedType: 'Games', selectedLevel: 'A2' });
assert.strictEqual(gamesA2.length, 3, 'Games with A2 level mismatch');

// Speaking Club + Wonder + B1
const wonderB1 = filterSessions(sessions, { selectedType: 'Speaking Club', selectedSpeakingClub: "I Couldn't Help But Wonder", selectedLevel: 'B1' });
assert.ok(wonderB1.length > 0, 'Wonder club with B1 level mismatch');
assert.ok(wonderB1.every(s => s.club === "I Couldn't Help But Wonder" && /\bB1\b/.test(s.level)));

// 5. Test URL param parsing and serialization simulation
function parseUrlParams(queryString) {
  const params = new URLSearchParams(queryString);
  const state = {
    searchQuery: params.get('q') ? params.get('q').trim().toLowerCase() : '',
    selectedType: params.get('format') || 'ALL',
    selectedSpeakingClub: params.get('club') || 'ALL',
    selectedLang: params.get('lang') || 'ALL',
    selectedLevel: params.has('level') && params.get('level') !== 'ALL' ? params.get('level') : null,
    wishlistOnly: params.get('saved') === 'true'
  };
  return state;
}

const parsedState = parseUrlParams('?format=Speaking+Club&club=Keeping+Up+with+Science&level=B2');
assert.strictEqual(parsedState.selectedType, 'Speaking Club');
assert.strictEqual(parsedState.selectedSpeakingClub, 'Keeping Up with Science');
assert.strictEqual(parsedState.selectedLevel, 'B2');

const scienceB2 = filterSessions(sessions, parsedState);
assert.ok(scienceB2.length > 0);
assert.ok(scienceB2.every(s => s.club === 'Keeping Up with Science' && /\bB2\b/.test(s.level)));

console.log('✅ All session directory filter tests passed successfully!');
