/**
 * Local-only script to publish public metadata and paid session content to Supabase.
 * Uses service-role key from local environment variables (.env).
 * NEVER commit private payloads, source URLs, or audio files to the public git repository.
 *
 * Usage:
 *   node scripts/publish_to_supabase.js <path-to-private-session.json>
 *   node scripts/publish_to_supabase.js --validate-only <path-to-private-session.json>
 *
 * Structured payload format:
 * {
 *   "session_id": "mind-matters-example",
 *   "review_status": "needs_review",
 *   "public": {
 *     "title": "Bounded Rationality",
 *     "source_bibliography": [{ "source_id": "article-1", "citation": "Author, Article Title, Publisher, 2026." }],
 *     "format": "Speaking Club",
 *     "language": "English",
 *     "level": "B2",
 *     "summary": "A short public description.",
 *     "is_published": false
 *   },
 *   "content": {
 *     "vocabulary": [],
 *     "rounds": [],
 *     "grammar": null,
 *     "discussion": [],
 *     "sources": [{
 *       "source_id": "article-1",
 *       "source_title": "Article Title",
 *       "source_url": "https://example.org/article",
 *       "audio_file": "audio/article-presentation.mp3",
 *       "audio_content_type": "audio/mpeg"
 *     }]
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUDIO_BUCKET = 'session-source-audio';

let supabase;

function getSupabaseClient() {
  if (supabase) return supabase;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for publishing.');
  }
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  return supabase;
}

function readSessionPayload(filePath) {
  if (!filePath) {
    throw new Error('Usage: node scripts/publish_to_supabase.js <path-to-private-session.json>');
  }

  const absolutePath = path.resolve(filePath);
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

async function validateSessionFile(filePath) {
  const { absolutePath, sessionData } = readSessionPayload(filePath);
  const { session_id, public: publicData, content } = sessionData;

  if (sessionData.public || sessionData.content) {
    validateStructuredPayload(session_id, publicData, content);
    const preparedSources = prepareAudioAssets(absolutePath, session_id, content.sources);
    const audioCount = preparedSources.filter(source => source.audioPath).length;
    console.log(`Payload valid for ${session_id}: ${content.sources.length} source(s), ${audioCount} local audio file(s).`);
    return;
  }

  console.log(`Legacy payload valid for ${session_id}; it has no public catalog or source/audio metadata.`);
}

async function publishSession(filePath) {
  const { absolutePath, sessionData } = readSessionPayload(filePath);
  const { session_id } = sessionData;
  if (sessionData.public || sessionData.content) return publishStructuredSession(absolutePath, sessionData);
  return publishLegacySession(sessionData);
}

async function publishLegacySession(sessionData) {
  getSupabaseClient();
  const { session_id, full_notes, recording_url } = sessionData;
  const { error } = await supabase
    .from('session_content')
    .upsert({
      session_id,
      full_notes: full_notes || null,
      recording_url: recording_url || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'session_id' });

  if (error) throw new Error(`Supabase Upsert Error: ${error.message}`);
  console.log(`Successfully published legacy session_content for ${session_id}.`);
}

async function publishStructuredSession(payloadPath, sessionData) {
  const { session_id, public: publicData, content } = sessionData;
  validateStructuredPayload(session_id, publicData, content);
  if (sessionData.review_status !== 'approved') {
    throw new Error('Structured session payload must be manually reviewed and marked "approved" before publishing.');
  }
  const preparedSources = prepareAudioAssets(payloadPath, session_id, content.sources);
  getSupabaseClient();

  console.log(`Publishing structured session content for session_id: ${session_id}...`);

  const catalogRow = {
    session_id,
    title: publicData.title,
    source_bibliography: publicData.source_bibliography || [],
    format: publicData.format,
    language: publicData.language,
    level: publicData.level || null,
    summary: publicData.summary || null,
    is_published: false,
    updated_at: new Date().toISOString()
  };

  await upsert('session_catalog', catalogRow, 'session_id');

  const contentRow = {
    session_id,
    vocabulary: content.vocabulary,
    rounds: content.rounds,
    grammar: content.grammar ?? null,
    discussion: content.discussion,
    full_notes: content.full_notes || null,
    recording_url: content.recording_url || null,
    updated_at: new Date().toISOString()
  };
  await upsert('session_content', contentRow, 'session_id');

  const sourceRows = [];
  for (const { source, audioPath, audioStoragePath, index } of preparedSources) {
    if (audioPath) {
      const { error } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(audioStoragePath, fs.readFileSync(audioPath), { contentType: source.audio_content_type, upsert: true });
      if (error) throw new Error(`Audio upload failed for ${source.source_id}: ${error.message}`);
    }

    sourceRows.push({
      session_id,
      source_id: source.source_id,
      source_title: source.source_title,
      source_url: source.source_url,
      audio_storage_path: audioStoragePath,
      audio_content_type: source.audio_content_type || null,
      position: Number.isInteger(source.position) ? source.position : index,
      updated_at: new Date().toISOString()
    });
  }

  if (sourceRows.length > 0) {
    await upsert('session_sources', sourceRows, 'session_id,source_id');
  }

  if (publicData.is_published === true) {
    const { error } = await supabase
      .from('session_catalog')
      .update({ is_published: true, updated_at: new Date().toISOString() })
      .eq('session_id', session_id);
    if (error) throw new Error(`Could not publish session catalog entry: ${error.message}`);
  }

  console.log(`Successfully published structured content and sources for ${session_id}.`);
}

function validateStructuredPayload(sessionId, publicData, content) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(sessionId)) {
    throw new Error('Structured session_id must contain only letters, numbers, underscores, and hyphens.');
  }
  if (!publicData || !content) {
    throw new Error('Structured payloads require both "public" and "content" objects.');
  }
  for (const field of ['title', 'format', 'language']) {
    if (typeof publicData[field] !== 'string' || !publicData[field].trim()) {
      throw new Error(`public.${field} is required.`);
    }
  }

  const bibliography = publicData.source_bibliography || [];
  if (!Array.isArray(bibliography)) throw new Error('public.source_bibliography must be an array.');
  bibliography.forEach((entry, index) => {
    if (!entry || typeof entry.citation !== 'string' || !entry.citation.trim()) {
      throw new Error(`public.source_bibliography[${index}].citation is required.`);
    }
    if ('url' in entry || 'href' in entry || 'link' in entry) {
      throw new Error('Direct source links belong in private content.sources, not the public bibliography.');
    }
    if (/https?:\/\//i.test(entry.citation)) {
      throw new Error('Public bibliography citations must not contain direct URLs; store them in private content.sources.');
    }
  });

  for (const field of ['vocabulary', 'rounds', 'discussion', 'sources']) {
    if (!Array.isArray(content[field])) throw new Error(`content.${field} must be an array.`);
  }

  const sourceIds = new Set();
  content.sources.forEach((source, index) => {
    if (!source || typeof source.source_id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(source.source_id)) {
      throw new Error(`content.sources[${index}].source_id must be a stable slug.`);
    }
    if (sourceIds.has(source.source_id)) throw new Error(`Duplicate source_id: ${source.source_id}`);
    sourceIds.add(source.source_id);
    if (typeof source.source_title !== 'string' || !source.source_title.trim()) {
      throw new Error(`content.sources[${index}].source_title is required.`);
    }
    try {
      if (new URL(source.source_url).protocol !== 'https:') throw new Error();
    } catch {
      throw new Error(`content.sources[${index}].source_url must be an HTTPS URL.`);
    }
  });
}

function prepareAudioAssets(payloadPath, sessionId, sources) {
  return sources.map((source, index) => {
    let audioPath = null;
    let audioStoragePath = source.audio_storage_path || null;
    if (source.audio_file) {
      audioPath = resolvePrivateAudioPath(payloadPath, source.audio_file);
      if (!source.audio_content_type || !source.audio_content_type.startsWith('audio/')) {
        throw new Error(`An audio_content_type is required for ${source.source_id}.`);
      }
      audioStoragePath = audioStoragePath || `${sessionId}/${source.source_id}/${path.basename(audioPath)}`;
    }
    if (audioStoragePath) validateStoragePath(audioStoragePath, sessionId);
    return { source, audioPath, audioStoragePath, index };
  });
}

function resolvePrivateAudioPath(payloadPath, audioFile) {
  if (path.isAbsolute(audioFile)) throw new Error('audio_file must be relative to the private payload file.');
  const payloadDirectory = path.dirname(payloadPath);
  const audioPath = path.resolve(payloadDirectory, audioFile);
  const relativePath = path.relative(payloadDirectory, audioPath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || !fs.existsSync(audioPath)) {
    throw new Error(`Audio file must exist inside the payload directory: ${audioFile}`);
  }
  return audioPath;
}

function validateStoragePath(storagePath, sessionId) {
  const segments = storagePath.split('/');
  if (!storagePath.startsWith(`${sessionId}/`) || segments.some(segment => !segment || segment === '.' || segment === '..')) {
    throw new Error('audio_storage_path must be a safe path inside its session folder.');
  }
}

async function upsert(table, rows, onConflict) {
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict });

  if (error) throw new Error(`Supabase ${table} upsert failed: ${error.message}`);
}

const targetFile = process.argv[2];
const task = targetFile === '--validate-only'
  ? validateSessionFile(process.argv[3])
  : publishSession(targetFile);
task.catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
