/**
 * Local-only script to publish full session notes and recordings to Supabase.
 * Uses service-role key from local environment variables (.env).
 * NEVER commit full notes or recording links to the public git repository.
 *
 * Usage:
 *   node scripts/publish_to_supabase.js <path-to-private-session.json>
 *
 * Example private session JSON format:
 * {
 *   "session_id": "evt-2026-mind-matters-sample",
 *   "full_notes": "Detailed host notes, slide transcripts, and breakdown...",
 *   "recording_url": "https://private-storage.cosylanguages.com/recordings/evt-2026-mind-matters.mp4"
 * }
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  console.error('Ensure they are configured in your local .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function publishSession(filePath) {
  if (!filePath) {
    console.error('Usage: node scripts/publish_to_supabase.js <path-to-private-session.json>');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found at ${absolutePath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(absolutePath, 'utf8');
  let sessionData;
  try {
    sessionData = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing JSON:', err.message);
    process.exit(1);
  }

  const { session_id, full_notes, recording_url } = sessionData;

  if (!session_id) {
    console.error('Error: "session_id" is required in session payload.');
    process.exit(1);
  }

  console.log(`Publishing full session content for session_id: ${session_id}...`);

  const { data, error } = await supabase
    .from('session_content')
    .upsert({
      session_id,
      full_notes: full_notes || null,
      recording_url: recording_url || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'session_id' });

  if (error) {
    console.error('Supabase Upsert Error:', error.message);
    process.exit(1);
  }

  console.log(`Successfully published/updated session_content for ${session_id}!`);
}

const targetFile = process.argv[2];
publishSession(targetFile);
