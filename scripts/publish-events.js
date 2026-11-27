#!/usr/bin/env node
/**
 * Prepare the repository-backed event catalog for the static site.
 *
 * Session content is intentionally never uploaded to a database. Publishing
 * this repository is handled by the GitHub Pages deployment workflow.
 */
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const rootDir = path.join(__dirname, '..');

console.log('Validating repository event and session files...');
execFileSync(process.execPath, [path.join(__dirname, 'validate-events.js')], {
  cwd: rootDir,
  stdio: 'inherit'
});

console.log('Building the static event discovery index...');
execFileSync(process.execPath, [path.join(__dirname, 'build-public.js')], {
  cwd: rootDir,
  stdio: 'inherit'
});

console.log('Static event catalog is ready. No session content was uploaded.');
