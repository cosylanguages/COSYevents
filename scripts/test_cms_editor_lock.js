'use strict';
/* shared/js/cms-editor.js is vendored from COSYstudio. Fail if it was edited here. */
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'shared', 'js');
const lock = JSON.parse(fs.readFileSync(path.join(dir, 'cms-editor.lock.json'), 'utf8'));
const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, 'cms-editor.js'))).digest('hex');
assert.strictEqual(actual, lock.sha256,
  'cms-editor.js differs from the COSYstudio copy pinned in cms-editor.lock.json. Change it in COSYstudio ' +
  '(packages/cms-editor), then re-copy it here and update the lock.');
assert.match(lock.commit, /^[0-9a-f]{40}$/);
console.log('cms-editor.js matches COSYstudio@' + lock.commit.slice(0, 7));
