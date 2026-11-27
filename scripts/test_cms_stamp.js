'use strict';
const assert = require('assert');
const { stampHtml } = require('./lib/cms_stamp');

function ids(html) { return [...html.matchAll(/data-cms-id="([^"]+)"/g)].map(m => m[1]); }
const page = `<!doctype html><html><head><title>t</title></head><body>
<nav class="ce-session-nav"><p>nav text</p></nav>
<h1 class="x">Title</h1>
<p>Plain <b>bold</b> and <a href="https://ok.example" target="_blank" rel="noopener">link</a>.</p>
<p>Has <span style="color:red">style</span> inside</p>
<p>Has <img src="a.png"> image</p>
<p data-i18n="k">managed by i18n</p>
<p id="named">has id</p>
<p>   </p>
<ul><li>One</li><li>Two <button>x</button></li></ul>
<table><tr><td>cell</td></tr></table>
<script>var a = "<p>in script</p>";</script>
<div data-cms-ignore="true"><p>ignored</p></div>
<p>Same</p><p>Same</p>
</body></html>`;

const r = stampHtml(page);
const got = ids(r.html);
const tagOf = id => id.split('-')[0];

// stamped: h1, plain p, the two "Same" p, li One, td. Not stamped: nav, style span, img, i18n, id, empty, li with button, script, ignored
assert.deepStrictEqual(got.map(tagOf).sort(), ['h1', 'li', 'p', 'p', 'p', 'td'].sort());
assert.ok(/<h1 data-cms-id="h1-1-[0-9a-f]{6}" class="x">/.test(r.html), 'attribute inserted right after the tag name');
assert.ok(!/<nav[^>]*data-cms-id/.test(r.html) && !/nav text/.test(r.html.replace(/<nav[\s\S]*?<\/nav>/, '')));
assert.strictEqual(new Set(got).size, got.length, 'keys are unique even for identical text');
assert.ok(got.some(i => i.startsWith('p-2-')) && got.some(i => i.startsWith('p-3-')), 'ordinal distinguishes identical paragraphs');

// only bytes are inserted: removing the attributes gives back the original file exactly
assert.strictEqual(r.html.replace(/ data-cms-id="[^"]+"/g, ''), page);

// idempotent, and existing keys are never rewritten
const again = stampHtml(r.html);
assert.strictEqual(again.html, r.html);
assert.strictEqual(again.added, 0);
const manual = stampHtml('<p data-cms-id="keep-me">a</p><p>b</p>');
assert.ok(manual.html.includes('data-cms-id="keep-me"') && ids(manual.html).length === 2);

// editing text changes the key (an old saved edit can never attach to different text)
assert.notStrictEqual(ids(stampHtml('<p>one</p>').html)[0], ids(stampHtml('<p>two</p>').html)[0]);
console.log('cms stamp tests passed');
