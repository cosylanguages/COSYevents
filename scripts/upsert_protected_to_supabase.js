const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const ROOT = path.join(__dirname, '..');
const PROTECTED_DIR = path.join(ROOT, 'protected-export');

function checkGitTracked(filePath) {
  try {
    const rel = path.relative(ROOT, filePath);
    const tracked = execSync(`git ls-files "${rel}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    if (tracked) {
      throw new Error(`REFUSING EXECUTION: File '${rel}' is tracked by git. Protected records MUST NOT be committed to git.`);
    }
  } catch (e) {
    if (e.message.includes('REFUSING EXECUTION')) throw e;
  }
}

async function upsertProtectedRecords(options = { validateOnly: false, filterSession: null }) {
  if (!fs.existsSync(PROTECTED_DIR)) {
    console.log(`Protected directory '${PROTECTED_DIR}' does not exist yet. Run scripts/split_sessions.js --write first.`);
    return;
  }

  const files = fs.readdirSync(PROTECTED_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} protected record files in ${PROTECTED_DIR}`);

  let processedCount = 0;
  let errorCount = 0;

  const records = [];

  for (const file of files) {
    const filePath = path.join(PROTECTED_DIR, file);
    checkGitTracked(filePath);

    try {
      const record = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (options.filterSession && record.id !== options.filterSession && record.slug !== options.filterSession) {
        continue;
      }

      if (!record.id || !record.kind || record.kind !== 'session-body') {
        throw new Error(`Invalid record in ${file}: missing id or kind !== 'session-body'`);
      }

      records.push(record);
      processedCount++;
    } catch (err) {
      errorCount++;
      console.error(`[ERROR] Failed to validate ${file}: ${err.message}`);
    }
  }

  console.log(`Validated ${processedCount} protected records (${errorCount} errors).`);

  if (options.validateOnly) {
    console.log('[VALIDATE ONLY] No database upsert performed.');
    return { processedCount, errorCount };
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[WARN] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env. Skipping database write.');
    return { processedCount, errorCount, dbUpserted: 0 };
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let upsertedCount = 0;
  for (const record of records) {
    const payload = {
      id: record.id,
      language: record.language || 'en',
      cefr: record.cefr || 'b1',
      kind: 'session-body',
      slug: record.slug || record.id,
      title: record.title || '',
      summary: record.summary || null,
      body: typeof record.body === 'string' ? record.body : JSON.stringify(record.body),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('lessons')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error(`[SUPABASE ERROR] Failed to upsert ${record.id}: ${error.message}`);
      errorCount++;
    } else {
      upsertedCount++;
    }
  }

  console.log(`[SUPABASE UPSERT] Successfully upserted ${upsertedCount} protected records to Supabase 'lessons' table.`);
  return { processedCount, errorCount, dbUpserted: upsertedCount };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const validateOnly = args.includes('--validate-only');
  let filterSession = null;
  const sessionIdx = args.indexOf('--session');
  if (sessionIdx !== -1 && args[sessionIdx + 1]) {
    filterSession = args[sessionIdx + 1];
  }

  upsertProtectedRecords({ validateOnly, filterSession }).catch(err => {
    console.error(err.message);
    process.exitCode = 1;
  });
}

module.exports = { upsertProtectedRecords };
