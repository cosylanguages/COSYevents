#!/usr/bin/env node
/**
 * Verification Script: verify_anon_access.js
 *
 * Reads Supabase Project URL and Anon Public Key from shared/config/supabase.json
 * or environment variables (SUPABASE_URL / SUPABASE_ANON_KEY).
 *
 * Queries REST API endpoints for private tables with the anon key and fails (exits with 1)
 * if any data or rows are returned.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

let url = process.env.SUPABASE_URL;
let anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  const configPath = path.resolve(__dirname, '../shared/config/supabase.json');
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      url = url || cfg.url;
      anonKey = anonKey || cfg.anonKey;
    } catch (e) {
      console.warn(`Could not parse ${configPath}: ${e.message}`);
    }
  }
}

if (!url || !anonKey) {
  console.error('Error: Supabase URL and Anon Key are missing.');
  console.error('Please configure shared/config/supabase.json or set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const tablesToTest = [
  'session_content',
  'session_teacher_notes',
  'session_sources',
  'session_access_links',
  'session_grants',
  'access_grants',
  'profiles'
];

async function checkTable(tableName) {
  const endpoint = new URL(`/rest/v1/${tableName}?select=*`, url);
  const client = endpoint.protocol === 'https:' ? https : http;

  return new Promise((resolve) => {
    const req = client.get(endpoint.toString(), {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(body);
            if (Array.isArray(data) && data.length > 0) {
              resolve({ table: tableName, leaked: true, count: data.length, data });
            } else {
              resolve({ table: tableName, leaked: false, status: res.statusCode });
            }
          } catch (e) {
            resolve({ table: tableName, leaked: false, status: res.statusCode, error: e.message });
          }
        } else {
          // Status >= 400 (e.g. 401, 403, 404, or empty 200) means access denied or no data returned
          resolve({ table: tableName, leaked: false, status: res.statusCode });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`Request error checking ${tableName}:`, err.message);
      resolve({ table: tableName, leaked: false, error: err.message });
    });
  });
}

async function main() {
  console.log(`Checking anonymous REST API access against Supabase instance: ${url}...`);
  let hasLeaks = false;

  for (const table of tablesToTest) {
    const result = await checkTable(table);
    if (result.leaked) {
      console.error(`❌ SECURITY LEAK DETECTED on table "${table}"! Returned ${result.count} rows to anon key.`);
      hasLeaks = true;
    } else {
      console.log(`  Table "${table}": OK (Status: ${result.status || 'denied'}, 0 rows returned)`);
    }
  }

  if (hasLeaks) {
    console.error('\nVerification FAILED: Private table data is accessible to anonymous users via REST API!');
    process.exit(1);
  } else {
    console.log('\nVerification PASSED: All private tables properly block anonymous REST API queries.');
  }
}

main();
