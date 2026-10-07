const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Ensure validation runs first
const { execSync } = require('child_process');
console.log('Validating event files before publishing...');
execSync('node scripts/validate-events.js', { stdio: 'inherit' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set.');
  process.exit(1);
}

// Service role client bypassing RLS (server-side only)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const eventsDir = path.join(__dirname, '../events');

function findFiles(dir, fileNamePattern) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, fileNamePattern));
    } else if (fileNamePattern.test(file)) {
      results.push(filePath);
    }
  });
  return results;
}

async function publish() {
  const eventFiles = findFiles(eventsDir, /^event\.json$/);
  const sessionFiles = findFiles(eventsDir, /\.json$/).filter(
    filePath => !filePath.endsWith('event.json') && filePath.includes(path.join('sessions', ''))
  );

  console.log(`Publishing ${eventFiles.length} event(s) and ${sessionFiles.length} session(s) to Supabase...`);

  // 1. Upsert public events
  for (const filePath of eventFiles) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const { error } = await supabase.from('events_public').upsert({
      slug: data.slug,
      title: data.title,
      description: data.description,
      languages: data.languages,
      status: data.status
    }, { onConflict: 'slug' });

    if (error) {
      console.error(`Failed to upsert event ${data.slug}:`, error.message);
      process.exit(1);
    }
    console.log(`✓ Published event: ${data.slug}`);
  }

  // 2. Upsert public sessions & gated session_content
  for (const filePath of sessionFiles) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Upsert sessions_public
    const { error: sessionError } = await supabase.from('sessions_public').upsert({
      slug: data.slug,
      event_slug: data.event,
      title: data.title,
      theme: data.theme,
      language: data.language,
      level: data.level,
      date: data.date
    }, { onConflict: 'slug' });

    if (sessionError) {
      console.error(`Failed to upsert session_public ${data.slug}:`, sessionError.message);
      process.exit(1);
    }

    // Upsert gated session_content
    const gatedPayload = {
      activities: data.activities,
      vocabulary: data.vocabulary,
      summary: data.summary,
      host: data.host
    };

    const { error: contentError } = await supabase.from('session_content').upsert({
      session_slug: data.slug,
      event_slug: data.event,
      content: gatedPayload,
      updated_at: new Date().toISOString()
    }, { onConflict: 'session_slug' });

    if (contentError) {
      console.error(`Failed to upsert session_content ${data.slug}:`, contentError.message);
      process.exit(1);
    }
    console.log(`✓ Published session & gated content: ${data.slug}`);
  }

  console.log('\nAll events and sessions published to Supabase successfully!');
}

publish().catch(err => {
  console.error('Publish unexpected error:', err);
  process.exit(1);
});
