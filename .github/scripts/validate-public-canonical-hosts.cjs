'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_ROOT = path.join(ROOT, 'docs', 'scifi-ui');
const CANONICAL_HOST = 'formatxsuite.com';
const LEGACY_HOST = 'www.formatxsuite.com';

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

function captureAttributeTags(html, selectorName, selectorValue, valueAttribute) {
  const selector = selectorValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tagPattern = new RegExp(`<(?:link|meta)\\b(?=[^>]*\\b${selectorName}=["']${selector}["'])[^>]*>`, 'gi');
  const valuePattern = new RegExp(`\\b${valueAttribute}=["']([^"']+)["']`, 'i');
  return Array.from(html.matchAll(tagPattern), match => match[0])
    .map(tag => tag.match(valuePattern)?.[1] || '')
    .filter(Boolean);
}

function assertCanonicalAbsoluteUrl(file, kind, rawUrl) {
  if (!/^https:\/\//i.test(rawUrl)) return;
  let url;
  try {
    url = new URL(rawUrl);
  } catch (error) {
    throw new Error(`${file}: invalid ${kind} URL ${rawUrl}: ${error.message}`);
  }
  assert.equal(
    url.hostname,
    CANONICAL_HOST,
    `${file}: ${kind} must use ${CANONICAL_HOST}, got ${rawUrl}`,
  );
}

const files = walk(PUBLIC_ROOT);
let checkedCanonical = 0;
let checkedAlternates = 0;
let checkedOgUrls = 0;

for (const absolute of files) {
  const relative = path.relative(ROOT, absolute).replaceAll(path.sep, '/');
  const html = fs.readFileSync(absolute, 'utf8');

  assert.ok(
    !html.includes(`https://${LEGACY_HOST}`),
    `${relative}: stale legacy public host ${LEGACY_HOST} remains in HTML source`,
  );

  for (const href of captureAttributeTags(html, 'rel', 'canonical', 'href')) {
    checkedCanonical += 1;
    assertCanonicalAbsoluteUrl(relative, 'canonical', href);
  }

  for (const href of captureAttributeTags(html, 'rel', 'alternate', 'href')) {
    checkedAlternates += 1;
    assertCanonicalAbsoluteUrl(relative, 'hreflang alternate', href);
  }

  for (const content of captureAttributeTags(html, 'property', 'og:url', 'content')) {
    checkedOgUrls += 1;
    assertCanonicalAbsoluteUrl(relative, 'og:url', content);
  }
}

assert.ok(files.length >= 20, `expected public HTML surface, found only ${files.length} files`);
assert.ok(checkedCanonical >= 10, `canonical coverage unexpectedly low: ${checkedCanonical}`);

console.log(
  `FormatX public canonical host source guard passed: ${files.length} HTML files, `
  + `${checkedCanonical} canonical, ${checkedAlternates} alternate and ${checkedOgUrls} og:url values checked.`,
);
