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
