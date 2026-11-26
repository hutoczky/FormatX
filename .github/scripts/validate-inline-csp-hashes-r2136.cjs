'use strict';
// Fail release validation if an inline bootstrap changes without a matching
// exact SHA-256 in BOTH the static HTML CSP and Cloudflare Worker's header CSP.
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const html = fs.readFileSync('docs/scifi-ui/index.html', 'utf8');
const worker = fs.readFileSync('billing-worker/src/production-content-entry.js', 'utf8');
const meta = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
assert(meta, 'The HTML Content-Security-Policy meta element is missing');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(match => match[2].trim() && !/\bsrc\s*=/.test(match[1]));
assert(scripts.length > 0, 'No inline bootstraps found: audit a deliberate migration');
const allowedWorkerHashes = [...worker.matchAll(/const\s+(INLINE_[A-Z0-9_]+_HASH)\s*=\s*["']('sha256-[^"']+')["'];/g)];
assert(allowedWorkerHashes.length, 'Worker inline hash declarations not found');
const workerMeta = worker.match(/const META_CSP = \`([\s\S]*?)\`;/);
const workerHeader = worker.match(/const HEADER_CSP = \[([\s\S]*?)\]\.join/);
assert(workerMeta && workerHeader, 'Worker CSP templates have changed; inspect the production policy');
const declared = new Map(allowedWorkerHashes.map(match => [match[2], match[1]]));
for (const [index, match] of scripts.entries()) {
  const hash = "'sha256-" + crypto.createHash('sha256').update(match[2], 'utf8').digest('base64') + "'";
  assert(meta[1].includes(hash), `HTML inline script #${index + 1} has changed: add exact CSP hash ${hash}`);
  const variable = declared.get(hash);
  assert(variable, `Worker CSP is missing inline script #${index + 1}: ${hash}`);
  const interpolation = '${' + variable + '}';
  assert(workerMeta[1].includes(interpolation), `Worker META_CSP missing ${variable}`);
  assert(workerHeader[1].includes(interpolation), `Worker HEADER_CSP missing ${variable}`);
  console.log(`Inline bootstrap #${index + 1} allowed by HTML + Worker CSP: ${hash}`);
}
console.log(`Validated ${scripts.length} exact inline bootstrap hashes in all production CSP policies.`);

 // R2250: apply the exact CSP contract to all inline styles, not just scripts.
const styles=[...html.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi)];
assert(styles.length>0,'Missing inline critical styles');
for(const [index,match] of styles.entries()){
  const hash="'sha256-"+crypto.createHash('sha256').update(match[2],'utf8').digest('base64')+"'";
  const stylePolicy=policy=>policy.match(/style-src\s+[^;"]+/)?.[0]||'';
  assert(stylePolicy(meta[1]).includes(hash),'HTML style hash mismatch #'+(index+1));
  assert(stylePolicy(workerMeta[1]).includes(hash),'Worker META style hash mismatch #'+(index+1));
  assert(stylePolicy(workerHeader[1]).includes(hash),'Worker HEADER style hash mismatch #'+(index+1));
}
const menu=styles.filter(m=>m[1].includes('data-fx-menu-owner-r1956="true"'));
assert.equal(menu.length,1,'Expected one inline critical menu style');
assert.equal(menu[0][2],fs.readFileSync('docs/scifi-ui/styles/formatx-menu-owner-r1956.css','utf8'),'Inline menu must match canonical CSS byte-for-byte');
assert(!/<link\b[^>]*href="[^"]*formatx-menu-owner-r1956\.css/.test(html),'Redundant menu stylesheet request');
console.log('R2250_INLINE_MENU_AND_STYLE_CSP_PASS');

// R2285: exact desktop-only first-paint CSS at its original cascade slot.
const desktop=styles.filter(m=>m[1].includes('data-fx-desktop-first-paint-r1600="true"'));
assert.equal(desktop.length,1);
assert(desktop[0][1].includes('media="(min-width: 901px)"'));
assert.equal(desktop[0][2],fs.readFileSync('docs/scifi-ui/styles/formatx-desktop-first-paint-r328.css','utf8'));
assert(!/<link\b[^>]*href="[^"]*formatx-desktop-first-paint-r328\.css/.test(html),'Redundant desktop first paint stylesheet');
console.log('R2285_INLINE_DESKTOP_CSS_PASS');
