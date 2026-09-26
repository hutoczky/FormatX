'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const repo = path.resolve(__dirname, '../..');
  const source = await fs.readFile(path.join(repo, 'docs/scifi-ui/index.html'), 'utf8');
  const introRevision = source.match(/formatx-event-horizon\.js\?v=[^"']+/)[0];
  const env = { ASSETS: { fetch: async () => new Response(source, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  }) } };
  // Exercise the complete delivery chains with the actual homepage. A source-only
  // href assertion misses a later Worker turning critical CSS into deferred data.
  for (const name of ['production-content-entry.js', 'production-content-entry-r529.js', 'production-content-entry-r637.js']) {
    const { default: entry } = await import(pathToFileURL(path.join(repo, 'billing-worker/src', name)));
    const response = await entry.fetch(new Request('https://formatxsuite.com/'), env, {});
    assert.equal(response.status, 200, name);
    const html = await response.text();
    if (name === 'production-content-entry.js') {
      // Exercise the real homepage rather than the gateway's minimal fixture:
      // a preload with an obsolete query string creates a second fetch.
      const link = response.headers.get('Link') || '';
      for (const file of ['formatx-critical-shell-v56.css', 'formatx-quality-r461.css', 'formatx-first-paint-r206.css', 'formatx-intro-p0-r575.css']) {
        const path = `/scifi-ui/styles/${file}`;
        const preloads = link.split(/,\s*(?=<)/).filter(value => value.includes(path));
        assert.equal(preloads.length, 1, `${name}: one shared first-paint preload for ${file}`);
        const url = preloads[0].match(/^<([^>]+)>/)[1];
        assert.ok(html.includes(`href="${url}"`), `${name}: ${file} preload must match its live stylesheet URL`);
      }
      for (const file of ['formatx-mobile-first-paint-r358.css', 'formatx-critical-core-r227.css', 'formatx-reference-production-r244.css', 'formatx-first-frame-stability-r283.css']) {
        const pathname = `/scifi-ui/styles/${file}`;
        const preloads = link.split(/,\s*(?=<)/).filter(value => value.includes(pathname));
        assert.equal(preloads.length, 1, `${name}: one responsive first-paint preload for ${file}`);
        const url = preloads[0].match(/^<([^>]+)>/)[1];
        const styles = (html.match(/<link\b[^>]*\brel="stylesheet"[^>]*>/gi) || [])
          .filter(tag => tag.includes(`href="${url}"`));
        assert.equal(styles.length, 1, `${name}: ${file} preload must match its live stylesheet URL`);
        const media = styles[0].match(/\smedia="([^"]+)"/);
        assert.ok(media, `${name}: ${file} must retain responsive stylesheet selection`);
        assert.ok(preloads[0].endsWith(`; media="${media[1]}"`), `${name}: ${file} preload must use the exact stylesheet media`);
      }
    }
    const introControllers = (html.match(/<script\b[^>]*>/gi) || [])
      .filter(tag => /\ssrc="[^\"]*\/formatx-event-horizon\.js\?/.test(tag));
    assert.equal(introControllers.length, 1, `${name}: one bounded intro controller`);
    assert.ok(introControllers[0].includes(introRevision), `${name}: preserve the current intro controller cache identity`);
    assert.match(introControllers[0], /\sdefer(?:\s|>)/, `${name}: intro remains nonblocking`);
    assert.match(introControllers[0], /\sfetchpriority="high"/, `${name}: intro discovery must not compete at optional-script priority`);
    const tags = html.match(/<link\b[^>]*data-fx-critical-core-r227[^>]*>/gi) || [];
    assert.equal(tags.length, 1, `${name}: one canonical core stylesheet`);
    assert.match(tags[0], /\shref="\/scifi-ui\/styles\/formatx-critical-core-r227\.css\?[^" ]+"/, `${name}: critical geometry must have a real href`);
    assert.match(tags[0], /\smedia="\(prefers-reduced-motion: no-preference\) and \(min-width: 901px\)"/, `${name}: retain desktop media`);
    assert.doesNotMatch(tags[0], /data-fx-r637-href|data-fx-r487-deferred-style|media="(?:not all|print)"/, `${name}: never postpone first-frame geometry`);
    assert.ok(html.indexOf(tags[0]) < html.indexOf('</head>'), `${name}: critical CSS belongs in the document head`);
    const stability = (html.match(/<link\b[^>]*data-fx-first-frame-stability-r500[^>]*>/gi) || []);
    assert.equal(stability.length, 1, `${name}: one desktop first-frame owner`);
    assert.match(stability[0], /\(pointer: fine\)/, `${name}: mouse desktop geometry`);
    assert.match(stability[0], /\(pointer: none\)/, `${name}: keyboard-only desktop geometry`);
    for (const file of ['formatx-reference-production-r244.css', 'formatx-intro-p0-r575.css']) {
      const geometry = (html.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || [])
        .filter(tag => tag.includes(file));
      assert.equal(geometry.length, 1, `${name}: one ${file} geometry owner`);
      assert.match(geometry[0], /\shref=["']\/scifi-ui\/styles\//, `${name}: ${file} must load before paint`);
      assert.doesNotMatch(geometry[0], /data-fx-r637-href|data-fx-r487-deferred-style|media="(?:not all|print)"/, `${name}: ${file} must apply before paint`);
    }
    console.log(`PASS R720 ${name}: canonical desktop geometry loads before first paint`);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
