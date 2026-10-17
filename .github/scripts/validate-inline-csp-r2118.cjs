'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const source = fs.readFileSync('docs/scifi-ui/index.html', 'utf8');
const tag = source.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i);
assert.ok(tag, 'Missing strict meta Content Security Policy on the real website');

const directives = Object.fromEntries(tag[1].split(';').map(part => {
  const [name, ...values] = part.trim().split(/\s+/);
  return [name, values];
}).filter(([name]) => name));

const scripts = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(match => match[2].trim().length > 0 && !/\bsrc\s*=/.test(match[1]));

assert.ok(scripts.length >= 2, 'Expected original inline language and intro bootstrap');
assert.ok((directives['script-src'] || []).includes("'self'"),
  'Local external scripts must remain first-party');
assert.ok(!(directives['script-src'] || []).includes("'unsafe-inline'"),
  'Never bypass the strict source policy to work around a hash mismatch');

for (const script of scripts) {
  const digest = crypto.createHash('sha256').update(script[2], 'utf8')
    .digest('base64');
  const hash = "'sha256-" + digest + "'";
  assert.ok((directives['script-src'] || []).includes(hash),
    'Inline script blocked by current CSP: ' + hash +
    ' (' + script[1].trim() + ')');
  console.log('PASS STRICT_R2118_INLINE_SCRIPT', hash, script[1].trim());
}

console.log('PASS R2118: all ' + scripts.length +
  ' exact first-party inline scripts are authorized; unsafe-inline remains forbidden.');
