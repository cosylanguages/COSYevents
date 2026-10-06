/**
 * Local-only script to publish public metadata and private session content to Supabase.
 * Uses service-role key from local environment variables (.env).
 * NEVER run on tracked files or commit private payloads or source URLs to public git.
 *
 * Usage:
 *   node scripts/publish_to_supabase.js <path-to-private-session.json>
 *   node scripts/publish_to_supabase.js --validate-only <path-to-private-session.json>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ROOT = path.join(__dirname, '..');

let supabase;

function getSupabaseClient() {
  if (supabase) return supabase;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for publishing.');
  }
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  return supabase;
}

function checkGitTracked(absolutePath) {
  try {
    const relPath = path.relative(ROOT, absolutePath);
    const gitTracked = execSync(`git ls-files "${relPath}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    if (gitTracked) {
      throw new Error(`REFUSING EXECUTION: File "${relPath}" is tracked by git! Private session payloads must reside in a gitignored directory (e.g. private/).`);
    }
  } catch (err) {
    if (err.message.includes('REFUSING EXECUTION')) throw err;
  }
}

function readSessionPayload(filePath) {
  if (!filePath) {
    throw new Error('Usage: node scripts/publish_to_supabase.js <path-to-private-session.json>');
  }

  const absolutePath = path.resolve(filePath);
  checkGitTracked(absolutePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found at ${absolutePath}`);
  }

  const rawData = fs.readFileSync(absolutePath, 'utf8');
  let sessionData;
  try {
    sessionData = JSON.parse(rawData);
  } catch (err) {
    throw new Error(`Error parsing JSON: ${err.message}`);
  }

  if (!sessionData.session_id) throw new Error('"session_id" is required in session payload.');
  return { absolutePath, sessionData };
}

function validatePayload(sessionData) {
  const { session_id, public: publicData, content } = sessionData;
  if (!session_id || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(session_id)) {
    throw new Error('session_id is required and must contain only letters, numbers, underscores, and hyphens.');
  }
  if (!publicData || !content) {
    throw new Error('Payloads require both "public" and "content" objects.');
  }
  for (const field of ['title', 'format', 'language']) {
    if (typeof publicData[field] !== 'string' || !publicData[field].trim()) {
      throw new Error(`public.${field} is required.`);
    }
  }
  for (const field of ['vocabulary', 'rounds', 'discussion']) {
    if (!Array.isArray(content[field])) throw new Error(`content.${field} must be an array.`);
  }
}

async function validateSessionFile(filePath) {
  const { sessionData } = readSessionPayload(filePath);
  validatePayload(sessionData);
  console.log(`[VALIDATION PASSED] Payload valid for session_id: ${sessionData.session_id}`);
}

async function publishSession(filePath) {
  const { sessionData } = readSessionPayload(filePath);
  validatePayload(sessionData);

  getSupabaseClient();
  const { session_id, public: publicData, content, teacher_notes } = sessionData;

  console.log(`Publishing session_id: ${session_id} to Supabase...`);

  // 1. session_catalog
  const catalogRow = {
    session_id,
    title: publicData.title,
    format: publicData.format,
    language: publicData.language,
    level_min: publicData.level_min || 3,
    level_max: publicData.level_max || 4,
    summary: publicData.summary || null,
    is_published: publicData.is_published ?? true,
    updated_at: new Date().toISOString()
  };
  await upsert('session_catalog', catalogRow, 'session_id');

  // 2. session_content
  const contentRow = {
    session_id,
    vocabulary: content.vocabulary,
    rounds: content.rounds,
    grammar: content.grammar || null,
    discussion: content.discussion,
    full_notes: content.full_notes || null,
    recording_url: sessionData.recording_url || null,
    updated_at: new Date().toISOString()
  };
  await upsert('session_content', contentRow, 'session_id');

  // 3. session_sources
  const sources = content.sources || sessionData.sources || [];
  if (Array.isArray(sources) && sources.length > 0) {
    const sourceRows = sources.map((s, index) => ({
      session_id,
      source_id: s.source_id || `src-${index + 1}`,
      source_title: s.source_title || s.title || 'Source',
      source_url: s.source_url || s.url,
      position: index,
      updated_at: new Date().toISOString()
    }));
    await upsert('session_sources', sourceRows, 'session_id,source_id');
  }

  // 4. session_teacher_notes
  if (teacher_notes) {
    const teacherNoteRow = {
      session_id,
      notes: teacher_notes,
      updated_at: new Date().toISOString()
    };
    await upsert('session_teacher_notes', teacherNoteRow, 'session_id');
  }

  console.log(`[SUCCESS] Successfully published session ${session_id} to Supabase tables.`);
}

async function upsert(table, rows, onConflict) {
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict });

  if (error) throw new Error(`Supabase ${table} upsert failed: ${error.message}`);
}

if (require.main === module) {
  const isValidateOnly = process.argv.includes('--validate-only');
  const targetFile = process.argv.find(arg => arg !== '--validate-only' && arg !== process.argv[0] && arg !== process.argv[1]);

  const task = isValidateOnly ? validateSessionFile(targetFile) : publishSession(targetFile);
  task.catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { publishSession, validateSessionFile };
