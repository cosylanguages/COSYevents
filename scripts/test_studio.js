/**
 * scripts/test_studio.js
 * Automated unit and schema validation tests for COSYevents Studio.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const Studio = require('../shared/js/studio.js');

console.log('Testing COSYevents Studio logic and access control...\n');

// 1. Role Authorization Check: Only founder, admin, owner allowed
console.log('Test 1: Role Authorization Check (Strict Founder Role)');
assert.strictEqual(Studio.isFounderRole('founder'), true, 'founder should be authorized');
assert.strictEqual(Studio.isFounderRole('admin'), true, 'admin should be authorized');
assert.strictEqual(Studio.isFounderRole('owner'), true, 'owner should be authorized');
assert.strictEqual(Studio.isFounderRole('FOUNDER'), true, 'role check should be case-insensitive');
assert.strictEqual(Studio.isFounderRole(' Admin '), true, 'role check should trim whitespace');

assert.strictEqual(Studio.isFounderRole('student'), false, 'student must NOT be authorized');
assert.strictEqual(Studio.isFounderRole('teacher'), false, 'teacher must NOT be authorized');
assert.strictEqual(Studio.isFounderRole('guest'), false, 'guest must NOT be authorized');
assert.strictEqual(Studio.isFounderRole(null), false, 'null must NOT be authorized');
assert.strictEqual(Studio.isFounderRole(undefined), false, 'undefined must NOT be authorized');
assert.strictEqual(Studio.isFounderRole(''), false, 'empty string must NOT be authorized');
console.log('PASS: Founder role gating correctly restricts access.\n');

// 2. Default Session and Known Sessions Validation against schemas/session.schema.json
console.log('Test 2: Schema Validation of Studio Session Output');
const schemaContent = JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/session.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schemaContent);

const defaultSession = Studio.createDefaultSession();
const isValidDefault = validate(defaultSession);
if (!isValidDefault) {
  console.error('Schema validation errors for default session:', validate.errors);
}
assert.strictEqual(isValidDefault, true, 'Default studio session template must conform to session.schema.json');

for (const sample of Studio.KNOWN_SESSIONS) {
  const isValidSample = validate(sample);
  if (!isValidSample) {
    console.error(`Schema validation errors for sample ${sample.slug}:`, validate.errors);
  }
  assert.strictEqual(isValidSample, true, `Sample session ${sample.slug} must conform to session.schema.json`);
}

// Validate 5-Stage multi-page preset session
const fiveStageSession = Studio.createStandardFiveStageSession();
const isValidFiveStage = validate(fiveStageSession);
if (!isValidFiveStage) {
  console.error('Schema validation errors for 5-stage multi-page session:', validate.errors);
}
assert.strictEqual(isValidFiveStage, true, '5-Stage multi-page preset session conforms to session.schema.json');
assert.strictEqual(fiveStageSession.activities.length, 5, '5-stage preset has exactly 5 pages');

// Validate Multi-Club Presets: Science, Wonder, Cinema, Debate
const scienceSession = Studio.createScienceClubSession();
assert.strictEqual(validate(scienceSession), true, 'Science club preset conforms to session.schema.json: ' + JSON.stringify(validate.errors));

const wonderSession = Studio.createWonderClubSession();
assert.strictEqual(validate(wonderSession), true, 'Wonder club preset conforms to session.schema.json: ' + JSON.stringify(validate.errors));

const cinemaSession = Studio.createCinemaClubSession();
assert.strictEqual(validate(cinemaSession), true, 'Cinema club preset conforms to session.schema.json: ' + JSON.stringify(validate.errors));

const debateSession = Studio.createDebateClubSession();
assert.strictEqual(validate(debateSession), true, 'Debate duel preset conforms to session.schema.json: ' + JSON.stringify(validate.errors));
console.log('PASS: All multi-club presets strictly conform to session.schema.json.\n');

// 3. Media & Interactive Block Generators Validation
console.log('Test 3: Media and Block Generators Validation');
const videoBlock = Studio.generateVideoBlock('https://www.youtube.com/watch?v=example');
assert.ok(videoBlock.includes('card-video-box'), 'video block contains card-video-box');
assert.ok(videoBlock.includes('iframe'), 'video block contains responsive iframe');

const audioBlock = Studio.generateAudioBlock('https://example.com/audio.mp3', 'Listening Quiz');
assert.ok(audioBlock.includes('card-audio-box'), 'audio block contains card-audio-box');
assert.ok(audioBlock.includes('<audio class="card-audio-player"'), 'audio block contains audio element');

const linkBlock = Studio.generateLinkBlock();
assert.ok(linkBlock.includes('card-links-box'), 'link block contains card-links-box');
assert.ok(linkBlock.includes('card-link-item'), 'link block contains clickable links');

const questionsBlock = Studio.generateQuestionsBlock();
assert.ok(questionsBlock.includes('<ol>'), 'questions block contains numbered list');

const calloutBlock = Studio.generateCalloutBlock();
assert.ok(calloutBlock.includes('card-callout-box'), 'callout block contains callout box');

const timerBlock = Studio.generateTimerBlock(5);
assert.ok(timerBlock.includes('edv-timer-widget'), 'timer block contains edv-timer-widget');

const speakersBlock = Studio.generateSpeakersBlock();
assert.ok(speakersBlock.includes('edv-speaker-chip speaker-a'), 'speakers block contains speaker-a chip');

const startersBlock = Studio.generateStartersBlock();
assert.ok(startersBlock.includes('edv-starter-chip'), 'starters block contains starter chip');

const pollBlock = Studio.generatePollBlock('Speed vs Depth', 'Speed', 'Depth');
assert.ok(pollBlock.includes('edv-poll-card'), 'poll block contains edv-poll-card');

// Test that session with all media blocks inserted still passes schema validation
const richSession = Studio.createDefaultSession();
richSession.activities[0].content = `${richSession.activities[0].content}\n\n${videoBlock}\n\n${audioBlock}\n\n${linkBlock}\n\n${calloutBlock}\n\n${timerBlock}\n\n${speakersBlock}\n\n${startersBlock}\n\n${pollBlock}`;
const isRichValid = validate(richSession);
if (!isRichValid) {
  console.error('Schema validation error for rich media session:', validate.errors);
}
assert.strictEqual(isRichValid, true, 'Session with rich media blocks conforms to session.schema.json');
console.log('PASS: Media blocks generated properly and schema valid.\n');

// 4. Verify HTML & CSS files exist and contain required markers
console.log('Test 3: Studio HTML & CSS Asset Integrity');
const htmlContent = fs.readFileSync(path.join(__dirname, '../studio.html'), 'utf8');
assert.ok(htmlContent.includes('styles/studio.css'), 'studio.html links to styles/studio.css');
assert.ok(htmlContent.includes('shared/js/studio.js'), 'studio.html loads shared/js/studio.js');
assert.ok(htmlContent.includes('id="btn-save-session"'), 'studio.html contains save session button');
assert.ok(htmlContent.includes('id="btn-insert-video"'), 'studio.html contains insert video button');
assert.ok(htmlContent.includes('id="btn-insert-audio"'), 'studio.html contains insert audio button');
assert.ok(htmlContent.includes('id="btn-insert-links"'), 'studio.html contains insert links button');
assert.ok(htmlContent.includes('id="btn-insert-timer"'), 'studio.html contains insert timer button');
assert.ok(htmlContent.includes('id="btn-insert-speakers"'), 'studio.html contains insert speakers button');
assert.ok(htmlContent.includes('id="btn-insert-poll"'), 'studio.html contains insert poll button');
assert.ok(htmlContent.includes('id="btn-presets-menu"'), 'studio.html contains presets menu button');
assert.ok(htmlContent.includes('id="btn-open-catalog"'), 'studio.html contains open catalog button');
assert.ok(htmlContent.includes('id="studio-catalog-modal"'), 'studio.html contains catalog modal');
assert.ok(htmlContent.includes('id="btn-present-mode"'), 'studio.html contains present deck button');
assert.ok(htmlContent.includes('id="presenter-modal"'), 'studio.html contains presenter modal');
assert.ok(htmlContent.includes('id="sidebar-page-pills"'), 'studio.html contains page pills switcher');
assert.ok(htmlContent.includes('id="btn-duplicate-card"'), 'studio.html contains duplicate page button');
assert.ok(htmlContent.includes('id="cards-nav-list"'), 'studio.html contains cards outline list');
assert.ok(htmlContent.includes('id="preview-slide-canvas"'), 'studio.html contains live preview canvas');
assert.ok(htmlContent.includes('id="lock-banner"'), 'studio.html contains lock notice banner');

const cssContent = fs.readFileSync(path.join(__dirname, '../styles/studio.css'), 'utf8');
assert.ok(cssContent.includes('.studio-workspace'), 'styles/studio.css styles workspace 3-pane layout');
assert.ok(cssContent.includes('.card-video-box'), 'styles/studio.css styles card-video-box');
assert.ok(cssContent.includes('.card-audio-box'), 'styles/studio.css styles card-audio-box');
assert.ok(cssContent.includes('.card-links-box'), 'styles/studio.css styles card-links-box');
assert.ok(cssContent.includes('.block-toolbar-box'), 'styles/studio.css styles block-toolbar-box');
assert.ok(cssContent.includes('.card-thumb-item'), 'styles/studio.css styles card thumbnails');
assert.ok(cssContent.includes('.slide-canvas'), 'styles/studio.css styles preview slide canvas');
assert.ok(cssContent.includes('.lock-banner'), 'styles/studio.css styles lock banner');
console.log('PASS: Studio HTML & CSS files are complete and properly configured.\n');

console.log('All COSYevents Studio tests passed successfully! ✅');
